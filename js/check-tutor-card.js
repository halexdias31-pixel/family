#!/usr/bin/env node
/* @family. — js/check-tutor-card.js A TUTOR'S FIND CARD AT 390 AND 830: every pill's text inside its pill,
   the rate's "/h" said once, and "no usual hours" in the ink, as a state and not an error. */
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const glass = require(path.join(ROOT, 'check', 'glass.js'));
const SHOTS = process.env.TUTOR_CARD_SHOTS || '';

/* IN THE PAGE: one tutor with level-suffixed subjects and qualifications and no hours, drawn by `findCard` into the open Find page. */
function draw() {
  const P = (subject, level, grade, kind) => ({ subject, level, grade, board: '', received: '', kind: kind || 'subject' });
  const row = { personId: 'P-card', handle: 'card', title: 'Card Check', listed: true, rate: 14, maxStudents: 4, avail: '',
    teachesSpec: ['Maths (A-Level)', 'Maths (GCSE)', 'Physics (GCSE)'], teaches: ['English Language and Literature (A-Level)', 'Chemistry (GCSE)'],
    qualsParts: [P('Maths', 'A-Level', 'A*'), P('Maths', 'GCSE', '9'), P('English Language and Literature', "Master's degree", 'Distinction'), P('DBS', 'Enhanced', '', 'cert')] };
  const one = Object.assign({}, row, { personId: 'P-one', title: 'One Seat', rate: 20, maxStudents: 1 });
  /* IN THE FIND SCREEN, so its rules apply, but beside its pages so a late redraw does not wipe it. */
  const host = document.createElement('div');
  host.id = 'tc-check';
  host.className = 'page on';
  document.querySelector('#s-stuff').prepend(host);
  host.innerHTML = findCard({ kind: 'tutor', row }) + findCard({ kind: 'tutor', row: one });
  host.scrollIntoView();
}

function scan() {
  const fails = [], host = document.getElementById('tc-check');
  const tags = [...host.querySelectorAll('.prof-tag')];
  if (!tags.length) fails.push('no pill drawn');
  tags.forEach(c => {
    const b = c.getBoundingClientRect(), r = document.createRange();
    r.selectNodeContents(c);
    const out = [...r.getClientRects()].filter(x => x.width > 0).some(x => x.left < b.left - 0.5 || x.right > b.right + 0.5 || x.top < b.top - 0.5 || x.bottom > b.bottom + 0.5);
    if (out || c.scrollWidth > c.clientWidth + 1) fails.push('"' + c.textContent.trim() + '": text outside its pill');
  });
  /* A PILL THAT FITS THE CARD'S WIDTH ON ONE LINE IS DRAWN ON ONE (owner, 10 Nov: "Maths A-Level, GCSE" broke beside the face). */
  host.querySelectorAll('.card').forEach(card => {
    const cs = getComputedStyle(card), room = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    card.querySelectorAll('.prof-teach .prof-tag').forEach(c => {
      const lines = new Set([...(() => { const r = document.createRange(); r.selectNodeContents(c); return r.getClientRects(); })()].filter(x => x.width > 0).map(x => Math.round(x.top))).size;
      const was = c.style.whiteSpace; c.style.whiteSpace = 'nowrap'; const one = Math.max(c.getBoundingClientRect().width, c.scrollWidth); c.style.whiteSpace = was;
      if (lines > 1 && one <= room) fails.push('"' + c.textContent.trim() + '": broken over ' + lines + ' lines though one line (' + Math.round(one) + 'px) fits the card (' + Math.round(room) + 'px)');
    });
  });
  const rates = [...host.querySelectorAll('.prof-tag-rate')].map(p => p.textContent.replace(/\s+/g, ''));
  if (rates.length !== 2) fails.push('expected two rates, found ' + rates.length);
  rates.forEach(t => { if ((t.match(/\/h/g) || []).length !== 1 || /hour/.test(t)) fails.push('rate "' + t + '" does not say /h once'); });
  const none = host.querySelector('.prof-nohours');
  if (!none) fails.push('no "usual hours" line');
  else {
    const probe = document.createElement('span');
    probe.style.color = 'var(--bad)';
    none.appendChild(probe);
    const bad = getComputedStyle(probe).color, ink = getComputedStyle(document.body).color;
    probe.style.color = 'var(--ink)';
    const want = getComputedStyle(probe).color;
    probe.remove();
    const got = getComputedStyle(none).color;
    if (got === bad) fails.push('"no usual hours" is in the error colour');
    else if (got !== want && got !== ink) fails.push('"no usual hours" is ' + got + ', not the ink');
  }
  return fails;
}

(async () => {
  const server = await glass.serve('TUTOR_CARD_PORT');
  const port = server.address().port;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const fails = [];
  try {
    for (const width of [390, 830]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, hasTouch: width < 600, isMobile: width < 600, serviceWorkers: 'block' });
      const page = await ctx.newPage();
      await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json',
        body: r.request().method() === 'POST' ? '{"success":true}' : glass.FIXTURE_ANON }));
      await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof findCard === 'function', null, { timeout: 90000 });
      await page.evaluate(() => go('stuff'));
      await page.waitForTimeout(2500);
      await page.evaluate(draw);
      await page.waitForTimeout(300);
      (await page.evaluate(scan)).forEach(f => fails.push(width + 'px: ' + f));
      if (SHOTS) await page.locator('#tc-check').screenshot({ path: path.join(SHOTS, 'tutor-card-' + width + '.png') });
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  if (fails.length) {
    console.log('FAIL — check-tutor-card: ' + fails.length + ' problem(s) on a tutor card');
    fails.slice(0, 30).forEach(f => console.log('  ' + f));
    process.exit(1);
  }
  if (process.env.VERBOSE) console.log('check-tutor-card: pills, rate and hours line right at 390 and 830');
})().catch(e => { console.log('FAIL — check-tutor-card: ' + e.message); process.exit(1); });
