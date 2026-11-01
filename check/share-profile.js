#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/share-profile.js: IS THE SHARED STAFF PROFILE THE CARD ON THE SITE? (547, 549)
   At 390px, in a real browser: the card `tutorPng_` photographs is laid out at the site card's width with
   every text in the same place and on the same number of lines, the rate on one line, nothing overlapping,
   and the map either drawn from loaded tiles or left out whole. --shots=DIR writes both pictures. */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const BASE = 'http://share-profile.check/';
const WIDTH = 390;
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').slice(8);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const TILE = fs.readFileSync(path.join(ROOT, 'data/diagrams', fs.readdirSync(path.join(ROOT, 'data/diagrams')).find(f => /\.png$/.test(f))));
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
                '.html': 'text/html', '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
                '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const ADMIN = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
const TEXTS = ['h3', '.prof-name', '.prof-handle', '.prof-rate', '.prof-say', '.prof-words', '.prof-cap'];

/* IN THE PAGE: each text's place in its card and how many lines it takes, plus any two that overlap. */
function measure(card, TEXTS) {
  const c = card.getBoundingClientRect(), out = { w: c.width, texts: {}, overlap: [] };
  const boxes = [];
  TEXTS.forEach(sel => [...card.querySelectorAll(sel)].forEach((el, i) => {
    if (!el.getClientRects().length) return;
    const r = document.createRange(); r.selectNodeContents(el);
    /* A NEW LINE STARTS BELOW THE LAST ONE'S FOOT — a smaller `/hour` on the same baseline is not a line. */
    const rs = [...r.getClientRects()].filter(q => q.width > 0.5).sort((a, b) => a.top - b.top);
    const tops = { size: 0 }; let foot = -1e9;
    rs.forEach(q => { if (q.top >= foot - 2) { tops.size++; foot = q.bottom; } else foot = Math.max(foot, q.bottom); });
    const b = el.getBoundingClientRect();
    const k = sel + '#' + i;
    out.texts[k] = { x: Math.round(b.left - c.left), y: Math.round(b.top - c.top), lines: tops.size, text: el.textContent.trim().slice(0, 40) };
    boxes.push([k, b]);
  }));
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const [ka, a] = boxes[i], [kb, b] = boxes[j];
    if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1
        && !boxes[i][1].height === 0) out.overlap.push(ka + ' / ' + kb);
    const ea = card.querySelectorAll(ka.split('#')[0])[+ka.split('#')[1]], eb = card.querySelectorAll(kb.split('#')[0])[+kb.split('#')[1]];
    if (ea.contains(eb) || eb.contains(ea)) continue;
    if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.overlap.push(ka + ' / ' + kb);
  }
  const heat = card.querySelector('.prof-heat'), tiles = heat && heat.querySelector('.heat-tiles');
  out.heat = heat ? (tiles && /url\("?data:/.test(getComputedStyle(tiles).backgroundImage) ? 'data' : 'remote') : 'none';
  out.caps = [...card.querySelectorAll('.prof-cap')].map(x => x.textContent.trim());
  out.seat = !!card.querySelector('.prof-seat');
  return out;
}

(async () => {
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const bad = [];
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 2400 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errs = [];
  let tilesUp = true;
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, ADMIN);
  await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
  /* THE MAP'S TILES, SERVED HERE — and then refused, to prove a map that cannot come is left out whole. */
  await page.route('**://tile.openstreetmap.org/**', r => (tilesUp
    ? r.fulfill({ status: 200, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: TILE })
    : r.fulfill({ status: 503, body: '' })));
  await page.route(BASE + '**', r => {
    const rel = decodeURI(new URL(r.request().url()).pathname).replace(/^\/+/, '') || 'index.html';
    const f = path.join(ROOT, rel);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: '' });
    r.fulfill({ status: 200, contentType: TYPES[path.extname(f)] || 'text/plain', body: fs.readFileSync(f) });
  });
  await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1800);
  await page.evaluate(() => { go('tutors', false, true); return document.fonts && document.fonts.ready; });
  await page.waitForTimeout(900);

  const shoot = () => page.evaluate(async ([TEXTS, measureSrc]) => {
    const measure = (0, eval)('(' + measureSrc + ')');
    const t = (DATA.tutors || [])[0];
    const site = [...document.querySelectorAll('.card.is-prof')].find(el => el.getBoundingClientRect().width > 0 && !el.closest('.tpng-host')
      && ((el.querySelector('.prof-handle') || {}).textContent || '') === '@' + t.handle);
    if (!site) return { err: 'no card for @' + t.handle + ' drawn on the Tutor profiles column' };
    site.scrollIntoView({ block: 'start' }); site.setAttribute('data-share-site', '');
    const real = window.rcPng_;
    let pic = null;
    window.rcPng_ = card => { pic = measure(card, TEXTS); return real(card); };
    let blob;
    try { blob = await tutorPng_(t); } catch (e) { return { err: 'tutorPng_ threw: ' + e.message }; }
    finally { window.rcPng_ = real; }
    const url = await new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(blob); });
    return { site: measure(site, TEXTS), pic, url, rate: rateRange_(t) };
  }, [TEXTS, String(measure)]);

  const got = await shoot();
  if (got.err) bad.push(got.err);
  else {
    const { site, pic } = got;
    if (!pic) bad.push('tutorPng_ never photographed a card');
    else {
      console.log(`  site card ${site.w.toFixed(1)}px, picture card ${pic.w.toFixed(1)}px; rate "${got.rate}"; map in picture: ${pic.heat}`);
      if (Math.abs(site.w - pic.w) > 0.5) bad.push(`the picture's card is ${pic.w.toFixed(1)}px wide and the site's ${site.w.toFixed(1)}px — it wraps differently`);
      const rate = Object.keys(site.texts).find(k => k.startsWith('.prof-rate'));
      if (!rate) bad.push('the site card shows no rate — nothing proved');
      [['site', site], ['picture', pic]].forEach(([n, m]) => {
        const r = Object.keys(m.texts).find(k => k.startsWith('.prof-rate'));
        if (r && m.texts[r].lines !== 1) bad.push(`${n}: the rate "${m.texts[r].text}" takes ${m.texts[r].lines} lines`);
        if (m.overlap.length) bad.push(`${n}: texts overlap — ${m.overlap.join(', ')}`);
        if (m.seat) bad.push(`${n}: the "+£x a seat" note is still beside the range`);
      });
      /* EVERY TEXT ABOVE THE MAP IN THE SAME PLACE AND ON AS MANY LINES (the map is the one thing that may be left out). */
      Object.keys(site.texts).forEach(k => {
        const a = site.texts[k], b = pic.texts[k];
        if (k.startsWith('.prof-cap') && /Tutors at/.test(a.text)) return;
        if (!b) { bad.push(`the picture has no ${k} ("${a.text}")`); return; }
        if (a.lines !== b.lines) bad.push(`${k} ("${a.text}"): ${a.lines} lines on the site, ${b.lines} in the picture`);
        if (Math.abs(a.x - b.x) > 1 || (pic.heat !== 'none' && Math.abs(a.y - b.y) > 1)) bad.push(`${k} ("${a.text}"): at ${a.x},${a.y} on the site and ${b.x},${b.y} in the picture`);
      });
      if (pic.heat !== 'data') bad.push(`with the tiles served, the picture's map is "${pic.heat}", not drawn from loaded tiles`);
    }
    if (SHOTS) {
      fs.writeFileSync(path.join(SHOTS, 'profile-390-shared.png'), Buffer.from(got.url.split(',')[1], 'base64'));
      await page.locator('[data-share-site]').first().screenshot({ path: path.join(SHOTS, 'profile-390-site.png'), animations: 'disabled' });
    }
  }

  tilesUp = false;
  const off = await shoot();
  if (off.err) bad.push('tiles refused: ' + off.err);
  else if (off.pic) {
    if (off.pic.heat !== 'none') bad.push(`with the tiles refused, the picture still holds a map ("${off.pic.heat}") — blurred blobs`);
    if (off.pic.caps.includes('Tutors at') && !off.pic.texts['.prof-cap#0']) bad.push('an orphan "Tutors at" caption');
    console.log(`  tiles refused: map ${off.pic.heat}, captions ${off.pic.caps.join(' | ')}`);
    if (SHOTS) fs.writeFileSync(path.join(SHOTS, 'profile-390-shared-nomap.png'), Buffer.from(off.url.split(',')[1], 'base64'));
  }
  if (errs.length) bad.push('the page threw — ' + errs[0]);
  await browser.close();
  if (bad.length) {
    bad.forEach(b => console.log('  FAIL  ' + b));
    console.log('\nFAILED — the shared profile is not the card on the site');
    process.exit(1);
  }
  console.log('OK — the shared profile is the site card at 390px: same width, same lines, rate on one line, map loaded or left out.');
})().catch(e => { console.log('check/share-profile.js could not run: ' + e.message); process.exit(1); });
