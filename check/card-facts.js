#!/usr/bin/env node
/* @family. — check/card-facts.js A CARD NEVER DRAWS ITS OWN INSIDES (owner, 10 Nov): every kind in Find, four viewers, 390 and 820px, closed and open.
   Fails on cut text, a blank card, centred text, kind HTML in the lines, or a profile picture off a person. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const WHO = {
  admin: { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' },
  tutor: { name: 'Ada Tutor', personId: 'P002', person_id: 'P002', role: 'tutor', roles: ['tutor'], handle: 'ada' },
  parent: { name: 'Pat Parent', personId: 'P7', person_id: 'P7', role: 'client', roles: ['client'], handle: 'pat' },
  child: { name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'], handle: 'sam' },
};
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const PER_KIND = Number((process.argv.find(a => a.startsWith('--per=')) || '').slice(6)) || 4;

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
    s.listen(0, () => ok(s));
  });
}

/* IN THE PAGE: a few cards of every kind Find holds, drawn into Find's own screen, closed then open, each measured. */
function measure(per) {
  const host = document.getElementById('s-stuff') || document.body;
  const box = document.createElement('div');
  box.className = 'page on card-facts-check';
  host.appendChild(box);
  /* QUESTIONS AND ANSWERS ARE THEIR SHEET (owner, 9 Nov): their open content is the question itself, so only pictures and blanks are asked of them. */
  const WHOLE = ['question', 'answer'];
  const PEOPLE = typeof KC_PERSON_KINDS !== 'undefined' ? KC_PERSON_KINDS : [];
  const items = inFinder_(FINDERS.stuff, () => stuffItems()).concat(typeof settingDoorItems_ === 'function' ? settingDoorItems_() : []);
  const by = {};
  items.forEach(x => { const k = (x && x.kind) || 'thing'; (by[k] = by[k] || []).length < per && by[k].push(x); });
  const out = { kinds: Object.keys(by).length, cards: 0, bad: [] };
  const say = (x, m) => out.bad.push(`${x.kind} "${String(x.name || x.key || '').slice(0, 40)}": ${m}`);
  Object.keys(by).forEach(kind => by[kind].forEach(x => {
    let html = '';
    try { html = inFinder_(FINDERS.stuff, () => stuffCard(x)); } catch (e) { say(x, 'drawing threw ' + e.message); return; }
    box.innerHTML = html;
    box.querySelectorAll('.card.kc:not(.card.kc .card.kc)').forEach(card => [false, true].forEach(open => {
      if (open) card.classList.add('is-open');
      out.cards++;
      const state = open ? 'open' : 'closed';
      const text = [...card.querySelectorAll(':scope > .kc-tags, :scope > .kc-lines, :scope > .kc-form')].map(n => n.innerText.trim()).join('');
      if (!text && !card.querySelector(':scope > .kc-lines .loading, :scope > .kc-form :is(input, select, textarea)')) say(x, state + ': blank card');
      if (!PEOPLE.includes(kind) && card.querySelector(':scope > .kc-pic .pfp-art')) say(x, 'a profile picture on a card that is not a person');
      if (WHOLE.includes(kind)) return;
      const lines = card.querySelector(':scope > .kc-lines');
      if (lines) {
        const kindHtml = [...lines.querySelectorAll(':scope :is(h1, h2, h3, h4, table, hr)')].find(n => !n.closest('[hidden]'));
        if (kindHtml) say(x, state + ': kind HTML <' + kindHtml.tagName.toLowerCase() + '> in its lines');
        [lines, ...lines.querySelectorAll('*')].forEach(el => {
          if (el.closest('[hidden]') || !el.getClientRects().length) return;
          const cs = getComputedStyle(el);
          if (/dashed/.test(cs.borderTopStyle + cs.borderBottomStyle)) say(x, state + ': a dashed rule in its lines');
          const ownText = [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
          if (ownText && cs.textAlign === 'center' && !el.closest('.tile, button, .kc-pic')) say(x, state + ': centred text "' + el.textContent.trim().slice(0, 30) + '"');
          const cut = el.scrollHeight > el.clientHeight + 1 && /hidden|clip/.test(cs.overflowY) && el.clientHeight > 0;
          const ends = cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none');
          if (cut && !ends && el.innerText.trim()) say(x, state + ': text cut mid-line "' + el.innerText.trim().slice(0, 30) + '"');
        });
      }
    }));
  }));
  box.remove();
  return out;
}

(async () => {
  const server = await serve();
  const port = server.address().port;
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.error('card-facts: no browser — ' + e.message); process.exit(2); }
  const bad = [], said = [];
  try {
    for (const who of Object.keys(WHO)) {
      for (const width of [390, 820]) {
        const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1180 } });
        await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, WHO[who]);
        await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
        await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof finderSettled_ === 'function' && finderSettled_(), null, { timeout: 60000 }).catch(() => {});
        await page.waitForTimeout(800);
        const got = await page.evaluate(measure, PER_KIND).catch(e => ({ kinds: 0, cards: 0, bad: ['the page would not measure: ' + e.message] }));
        if (!got.cards) bad.push(`${who} at ${width}px: no card was drawn — the check cannot see its subject`);
        [...new Set(got.bad)].forEach(b => bad.push(`${who} at ${width}px: ${b}`));
        said.push(`${who}@${width} ${got.kinds}/${got.cards}`);
        await page.close();
      }
    }
  } finally { await browser.close(); server.close(); }
  if (bad.length) {
    console.error(`card-facts: ${bad.length} problem(s)`);
    bad.slice(0, process.argv.includes('--all') ? bad.length : 60).forEach(b => console.error('  ' + b));
    process.exit(1);
  }
  console.log('card-facts: every card is facts, laid out one way; kinds/cards ' + said.join(', '));
})();
