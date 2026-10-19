#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/share.js IS THE SHARED PICTURE THE RECEIPT ON THE SCREEN? § */
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
const MAX_BLOTS = 30;   /* see `compare`: up to 20 on a true picture; 40 with a select's answer run past its column, 64+ with the wrong face */
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
                '.html': 'text/html', '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
                '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

/* THE SIGNED-IN ADMIN `ui.js` USES, trimmed to who they are: an admin is sent all three money rows,
   so the session's picture is the case where two of them must be left off. */
const ADMIN = { name: 'Test Admin', personId: 'P001', person_id: 'P001',
                role: 'admin', roles: ['admin'], handle: 'testadmin' };

/* ---------- IN THE PAGE: PRESS SHARE ON THIS RECEIPT AND HAND BACK THE FILE § */
/* ---------- WHICH SAVED RECEIPT EACH PICK IS, BY THE REFERENCE PRINTED ON IT § */
const REF = { session: 'J-UI', class: 'W-UI' };

async function shareOf(page, pick) {
  return page.evaluate(async ([pick, ref]) => {
    window.__shared = null;
    navigator.canShare = d => !!(d && d.files && d.files.length);
    navigator.share = d => { window.__shared = d; return Promise.resolve(); };
    const rc = /^(form|room)$/.test(pick)
      ? document.querySelector('#bookr .rc')
      : [...document.querySelectorAll('#s-booking .page .rc')]
          .find(r => new RegExp(ref).test((r.querySelector('.rc-ref') || {}).textContent || ''));
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
  }, [pick, REF[pick] || '']);
}

/* ---------- IN THE PAGE: TWO PNGs, PIXEL BY PIXEL, AT THE BEST REGISTRATION § */
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
    /* ---------- AND THEN A PIXEL'S WORTH OF SLACK, LOCALLY § */
    /* BOTH WAYS ROUND. A pixel of the picture with nothing like it near it on the screen, OR a pixel of the screen with nothing like it near it in the picture. § */
    /* AND "NEAR" MEANS INSIDE THE RANGE OF THE NEIGHBOURHOOD, NOT EQUAL TO ONE OF IT. § */
    const near1 = (p, q, PW, QW, QH, x, y, sx, sy) => {
      const i = (y * PW + x) * 4;
      let worst = 0;
      for (let c = 0; c < 3; c++) {
        let lo = 255, hi = 0;
        for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
          const xx = x + sx + ox, yy = y + sy + oy;
          if (xx < 0 || yy < 0 || xx >= QW || yy >= QH) continue;
          const v = q[(yy * QW + xx) * 4 + c];
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
        const v = p[i + c];
        const off = v < lo ? lo - v : v > hi ? v - hi : 0;
        if (off > worst) worst = off;
      }
      return worst;
    };
    const near = (x, y) => Math.max(
      near1(pa, pb, AW, BW, BH, x, y, best.dx, best.dy),
      near1(pb, pa, BW, AW, AH, x + best.dx, y + best.dy, -best.dx, -best.dy));
    /* ---------- AND WHERE THE WRONG PIXELS ARE, WHICH IS WHAT TELLS NOISE FROM A FAULT § */
    const W = x1 - x0, H = y1 - y0, T = 6;
    const tw = Math.ceil(W / T), cnt = new Uint16Array(tw * Math.ceil(H / T));
    const dc = document.createElement('canvas'); dc.width = W; dc.height = H;
    const dg = dc.getContext('2d'); const dd = dg.createImageData(W, H);
    let wrong = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (y * AW + x) * 4, k = ((y - y0) * W + (x - x0)) * 4;
      const bad = near(x, y) > LOUD;
      if (bad) { wrong++; cnt[(((y - y0) / T) | 0) * tw + (((x - x0) / T) | 0)]++; }
      /* THE DIFF A PERSON LOOKS AT: the picture dimmed to a quarter, and every pixel that is wrong
         even with the slack in solid red. */
      dd.data[k] = bad ? 255 : pa[i] >> 2; dd.data[k + 1] = bad ? 0 : pa[i + 1] >> 2;
      dd.data[k + 2] = bad ? 0 : pa[i + 2] >> 2; dd.data[k + 3] = 255;
    }
    dg.putImageData(dd, 0, 0);
    const n = W * H;
    return { aw: AW, ah: AH, bw: BW, bh: BH, dx: best.dx, dy: best.dy, wrong: wrong / n * 100,
             blots: cnt.filter(v => v >= 12).length,
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
  const classState = (STATES.booking || []).find(s => s.name === 'a class with seats, seen by a family not on it');
  if (!classState) { console.log('check/share.js: check/states.js has no "a class with seats, seen by a family not on it" state — renamed?'); process.exit(1); }
  /* ---------- AND THE FORM WITH A ROOM CHOSEN § */
  const roomState = (STATES.booking || []).find(s => s.name === 'a room chosen, named whole on its row');
  if (!roomState) { console.log('check/share.js: check/states.js has no "a room chosen, named whole on its row" state — renamed?'); process.exit(1); }
  const ENTER = { session: String(sessionState.enter), class: String(classState.enter), room: String(roomState.enter) };

  const open = async (width, height) => {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2,
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
    return { ctx, page, errs };
  };

  /* ---------- A REAL PHONE'S HEIGHT, WHERE THE SESSION CARD IS SHRUNK TO FIT § */
  {
    const { ctx, page, errs } = await open(320, 568);
    await page.evaluate(enter => { go('booking', false, true); (0, eval)('(' + enter + ')')(); }, String(sessionState.enter));
    await page.waitForTimeout(900);
    const got = await shareOf(page, 'session');
    const label = 'session at 320x568';
    n++;
    if (got.err) bad.push(label + ': ' + got.err);
    else {
      const full = await page.evaluate(() => {
        const rc = [...document.querySelectorAll('#s-booking .page .rc')]
          .find(r => /J-UI/.test((r.querySelector('.rc-ref') || {}).textContent || ''));
        rc.classList.add('rc-snap');
        const cs = getComputedStyle(rc), b = rc.getBoundingClientRect();
        const out = { w: parseFloat(cs.width), h: parseFloat(cs.height), z: b.width / parseFloat(cs.width) };
        rc.classList.remove('rc-snap');
        return out;
      });
      const dims = await page.evaluate(u => new Promise(ok => { const i = new Image();
        i.onload = () => ok([i.naturalWidth, i.naturalHeight]); i.src = u; }), got.url);
      const ew = Math.ceil(full.w * 2), eh = Math.ceil(full.h * 2);
      console.log(`  ${label}: ${dims[0]}x${dims[1]} PNG for a card drawn at ${(full.z * 100).toFixed(0)}% — `
        + `${full.w.toFixed(1)}x${full.h.toFixed(1)} at full size`);
      if (full.z > 0.99) bad.push(`${label}: the card was not shrunk to fit, so the zoom case was not exercised`);
      if (Math.abs(dims[0] - ew) > 1 || Math.abs(dims[1] - eh) > 1)
        bad.push(`${label}: the picture is ${dims[0]}x${dims[1]} and the full-size card at 2x is ${ew}x${eh} — cropped or shrunk`);
      if (SHOTS) fs.writeFileSync(path.join(SHOTS, 'session-320x568-shared.png'), Buffer.from(got.url.split(',')[1], 'base64'));
    }
    if (errs.length) bad.push(`${label}: the page threw — ${errs[0]}`);
    await ctx.close();
  }

  for (const width of WIDTHS) {
    /* TALL, so neither receipt is clipped by the pane it is in — a screenshot of a clipped element
       would be compared against a picture of the whole one and fail for the wrong reason. */
    const { ctx, page, errs } = await open(width, 2600);

    /* `class` LAST, because its state swaps the visitor for a family not on the class and nothing
       after it on this page needs the admin back. */
    for (const pick of ['form', 'room', 'session', 'class']) {
      await page.evaluate(([pick, enter]) => {
        go('booking', false, true);
        if (enter) (0, eval)('(' + enter + ')')();
        else if (typeof goPage === 'function') goPage('booking', 0, true);
      }, [pick, ENTER[pick] || '']);
      await page.waitForTimeout(700);
      /* ---------- A FORM WITH AN ANSWER ON IT § */
      let chose = '';
      if (pick === 'form') {
        chose = await page.evaluate(() => {
          const s = [...document.querySelectorAll('#bookr select.bk-sel:not(:disabled)')]
            .find(x => x.options.length > 2);
          if (!s) return '';
          s.value = s.options[s.options.length - 1].value;
          s.dispatchEvent(new Event('change', { bubbles: true }));
          return s.options[s.options.length - 1].text;
        });
        if (!chose) bad.push(`form at ${width}px: no select on the form with three options to answer`);
        await page.waitForTimeout(400);
      }
      /* THE ROOM AS THE SCREEN SHOWS IT: the Venue row's words, whether they are the chosen option's
         whole text, and whether any of them is cut off. */
      let room = null;
      if (pick === 'room') {
        await page.waitForTimeout(400);
        room = await page.evaluate(() => {
          const s = document.querySelector('#bookr select.bk-sel[data-step="loc"]');
          const w = s && s.closest('.bk-face') && s.closest('.bk-face').querySelector('.bk-said');
          const o = s && s.options[s.selectedIndex];
          return { value: s ? s.value : '', text: o ? o.text : '', said: w ? w.textContent : null,
                   cut: w ? w.scrollWidth > w.clientWidth + 1 : null };
        });
        if (!/ \u2014 /.test(room.value)) bad.push(`room at ${width}px: no room is chosen on the Venue row (${JSON.stringify(room.value)})`);
        else if (room.said !== room.text) bad.push(`room at ${width}px: the Venue row shows ${JSON.stringify(room.said)} for ${JSON.stringify(room.text)} — a select cannot wrap, and three rooms of one building read the same`);
        else if (room.cut) bad.push(`room at ${width}px: the Venue row's words for ${JSON.stringify(room.text)} are cut off`);
      }
      const got = await shareOf(page, pick);
      const label = `${pick} at ${width}px`;
      n++;
      if (got.err) { bad.push(label + ': ' + got.err); continue; }
      if (got.type !== 'image/png' || !/\.png$/.test(got.name)) bad.push(`${label}: shared ${got.type} "${got.name}", not a PNG`);

      /* ---------- WHAT IS IN THE PICTURE, READ RATHER THAN LOOKED AT § */
      const src = await page.evaluate(async ([pick, ref]) => {
        const rc = /^(form|room)$/.test(pick) ? document.querySelector('#bookr .rc')
          : [...document.querySelectorAll('#s-booking .page .rc')]
              .find(r => new RegExp(ref).test((r.querySelector('.rc-ref') || {}).textContent || ''));
        const faces = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch (e) { return []; } })
          .filter(r => /^@font-face/i.test(r.cssText)).map(r => r.style.getPropertyValue('font-family'));
        /* EVERY EMPTY BOX'S HINT AND THE INK THE SCREEN DRAWS IT IN — a faint hint and a typed answer are a few pixels apart in a narrow column, too few to count, and § */
        const hints = [...rc.querySelectorAll('input, textarea')]
          .filter(i => i.placeholder && !i.value && i.getClientRects().length)
          .map(i => ({ text: i.placeholder, ink: getComputedStyle(i, '::placeholder').color }));
        const p = await rcPng_(rc);
        return { svg: p.svg, faces, hints };
      }, [pick, REF[pick] || '']);
      const svg = src.svg;
      src.faces.forEach(f => {
        const at = svg.indexOf(f);
        if (at < 0 || !/@font-face[^}]*url\(\s*["']?data:/.test(svg))
          bad.push(`${label}: the picture does not carry the ${f} face inside it — it will draw in a fallback`);
      });
      if (!src.faces.length) bad.push(`${label}: the page declares no @font-face to carry — nothing proved`);
      const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (chose && svg.indexOf(esc(chose)) < 0) bad.push(`${label}: the answer picked, "${chose}", is not in the picture`);
      src.hints.forEach(h => {
        const re = new RegExp('-webkit-text-fill-color:\\s*' + h.ink.replace(/[()]/g, '\\$&') + ';[^"]*">'
          + esc(h.text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '<');
        if (!re.test(svg)) bad.push(`${label}: the empty box's hint "${h.text}" is not in its own faint ink in the picture`);
      });
      if (pick === 'form' && !src.hints.length) bad.push(`${label}: the form has no empty box with a hint — nothing proved`);
      if (pick === 'room' && room && room.said
          && !new RegExp('class="bk-said"[^>]*>' + esc(room.said).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '<').test(svg)) {
        bad.push(`${label}: the room chosen, "${room.said}", is not in the picture as the Venue row's words`);
      }
      if (/data-do="(book-share|book-send|job-delete|job-take-seat|job-join)"/.test(svg)) bad.push(`${label}: a tile is in the picture`);
      if (/Tutor earns|Admin earns/.test(svg)) bad.push(`${label}: an admin's money row is in the picture`);
      /* ---------- AND THE CLASS'S TWO LINES ARE IN IT, WHICH IS WHAT IT WAS SHARED FOR § */
      if (pick === 'class') {
        if (!/Can come/.test(svg) || (svg.match(/class="wc-row/g) || []).length !== 3) {
          bad.push(`${label}: the class's Can come tally is not in the picture with its three bars`);
        }
        if (!/2 seats free/.test(svg)) bad.push(`${label}: the class's Sharing line, "Open — 2 seats free", is not in the picture`);
      }

      /* THE SAME ELEMENT, AS THE SCREEN DRAWS IT, with the picture's two exclusions on — and its box
         measured in that state, which is the size the picture has to be. */
      const rcSel = /^(form|room)$/.test(pick) ? '#bookr .rc' : '#s-booking .rc.rc-cmp';
      const snap = await page.evaluate(([pick, ref]) => {
        const rc = /^(form|room)$/.test(pick) ? document.querySelector('#bookr .rc')
          : [...document.querySelectorAll('#s-booking .page .rc')]
              .find(r => new RegExp(ref).test((r.querySelector('.rc-ref') || {}).textContent || ''));
        rc.classList.add('rc-snap'); rc.classList.add('rc-cmp');
        const b = rc.getBoundingClientRect();
        /* WHAT MUST BE OFF THE PICTURE, AND WHETHER IT IS THERE TO BE LEFT OFF. A run where the card
           had no tiles and no admin rows would pass this vacuously, so the count is reported too. */
        const off = [...rc.querySelectorAll('.rc-tiles, .rc-more')];
        return { w: b.width, h: b.height, off: off.length,
                 shown: off.filter(x => x.getClientRects().length).length };
      }, [pick, REF[pick] || '']);
      if (!snap.off) bad.push(`${label}: the card has no tiles to leave off the picture — nothing proved`);
      if (snap.shown) bad.push(`${label}: ${snap.shown} of the tiles / admin money rows would be in the picture`);
      if (pick === 'session' && snap.off < 3) bad.push(`${label}: the session card has ${snap.off} of a tile row and two admin money rows`);
      const shot = await page.locator(rcSel).first().screenshot({ scale: 'device', animations: 'disabled' });
      await page.evaluate(sel => { const rc = document.querySelector(sel); rc.classList.remove('rc-snap', 'rc-cmp'); }, rcSel);
      const shotUrl = 'data:image/png;base64,' + shot.toString('base64');
      const cmp = await compare(page, got.url, shotUrl);

      /* THE PICTURE IS THE CARD'S OWN SIZE TIMES TWO, to the pixel the rounding allows. § */
      const ew = Math.ceil(snap.w * 2), eh = Math.ceil(snap.h * 2);
      const sizeOk = Math.abs(cmp.aw - ew) <= 1 && Math.abs(cmp.ah - eh) <= 1;
      console.log(`  ${label}: ${cmp.aw}x${cmp.ah} PNG for a ${snap.w.toFixed(1)}x${snap.h.toFixed(1)} card, `
        + `${(got.size / 1024).toFixed(0)} KB — ${cmp.wrong.toFixed(3)}% wrong, ${cmp.blots} blots `
        + `(${cmp.loud.toFixed(2)}% strictly at (${cmp.dx},${cmp.dy}), ${cmp.any.toFixed(1)}% off by any shade)`);
      if (!sizeOk) bad.push(`${label}: the picture is ${cmp.aw}x${cmp.ah} and the card at 2x is ${ew}x${eh}`);
      if (cmp.wrong > MAX_PCT) bad.push(`${label}: ${cmp.wrong.toFixed(2)}% of the picture differs from the screen (over ${MAX_PCT}%)`);
      if (cmp.blots > MAX_BLOTS) bad.push(`${label}: ${cmp.blots} blots — clumps of wrong pixels, where a true picture has up to 20 (over ${MAX_BLOTS})`);
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
