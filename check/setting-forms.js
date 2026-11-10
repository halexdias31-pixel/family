#!/usr/bin/env node
/* @family. — check/setting-forms.js NO BOX IS CUT (owner, 10 Nov): every Settings card in Find, signed out and signed in, at 390 and 820px;
   a box, menu, text area or tile inside a card that sits outside the card or has no height fails (the iPad sign-in, cut to two lines). */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').slice(8);

function serve() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      const lib = require('./lib-full.js').serve(p);
      if (lib !== null) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(lib); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(Number(process.env.SETFORMS_PORT || 0), () => ok(s));
  });
}

/* IN THE PAGE: every setting card Find holds, drawn as Find draws it into Find's own screen, and each control measured against its card. */
function measure() {
  const host = document.getElementById('s-stuff') || document.body;
  const box = document.createElement('div');
  box.className = 'page on set-forms-check';
  host.appendChild(box);
  const items = typeof settingDoorItems_ === 'function' ? settingDoorItems_() : [];
  const out = { cards: 0, controls: 0, bad: [] };
  items.forEach(x => {
    let html = '';
    try { html = inFinder_(FINDERS.stuff, () => stuffCard(x)); } catch (e) { out.bad.push((x.name || x.key) + ': drawing threw ' + e.message); return; }
    box.innerHTML = html;
    box.querySelectorAll(".card.kc:not(.card.kc .card.kc)").forEach(card => {
      out.cards++;
      const c = card.getBoundingClientRect();
      card.querySelectorAll('input:not([type="hidden"]):not([hidden]), select, textarea, .tile').forEach(el => {
        if (el.closest('[hidden]') || el.closest('.kc-more') || getComputedStyle(el).display === 'none' && el.type === 'checkbox') return;
        out.controls++;
        const r = el.getBoundingClientRect();
        const what = el.tagName.toLowerCase() + (el.getAttribute('data-do') ? '[' + el.getAttribute('data-do') + ']' : el.id ? '#' + el.id : '');
        if (getComputedStyle(el).visibility === 'hidden' || /checkbox|radio/.test(el.type || '')) return;
        if (r.height < 1) out.bad.push((x.name || x.key) + ': ' + what + ' has no height');
        else if (r.top < c.top - 1 || r.bottom > c.bottom + 1 || r.left < c.left - 1 || r.right > c.right + 1) out.bad.push((x.name || x.key) + ': ' + what + ' sits outside its card');
      });
    });
  });
  box.remove();
  return out;
}

(async () => {
  const server = await serve();
  const port = server.address().port;
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.error('setting-forms: no browser — ' + e.message); process.exit(2); }
  const bad = [], said = [];
  try {
    for (const who of ['signed out', 'signed in']) {
      for (const width of [390, 820]) {
        const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1180 } });
        if (who === 'signed in') await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
        await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
        await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof finderSettled_ === 'function' && finderSettled_(), null, { timeout: 60000 }).catch(() => {});
        await page.waitForTimeout(800);
        const got = await page.evaluate(measure).catch(e => ({ cards: 0, controls: 0, bad: ['the page would not measure: ' + e.message] }));
        if (!got.cards) bad.push(`${who} at ${width}px: no Settings card was drawn — the check cannot see its subject`);
        got.bad.forEach(b => bad.push(`${who} at ${width}px: ${b}`));
        said.push(got.cards + "/" + got.controls);
        if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `setting-forms-${who.replace(' ', '-')}-${width}.png`) });
        await page.close();
      }
    }
  } finally { await browser.close(); server.close(); }
  if (bad.length) {
    console.error(`setting-forms: ${bad.length} control(s) cut`);
    bad.slice(0, 40).forEach(b => console.error('  ' + b));
    process.exit(1);
  }
  console.log('setting-forms: nothing cut; cards/controls out 390, 820, in 390, 820: ' + said.join(' '));
})();
