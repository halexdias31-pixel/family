#!/usr/bin/env node
/* @family. — check/card-facts.js ONE STATIC CENTRED CARD (owner, 10 Nov): every kind, four viewers.
   Fails on a blank card, cut text, kind HTML, a stand-in picture, parts out of order or off-centre, a worded button. */
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

/* IN THE PAGE: a few cards of every kind Find holds, each drawn once and measured. */
function measure(per) {
  /* DRAWN WHERE IT CAN BE MEASURED: a hidden screen gives every box no size, so the geometry would pass unseen. */
  const host = document.body;
  const box = document.createElement('div');
  box.className = 'card-facts-check card-grid';
  host.prepend(box);
  /* QUESTIONS AND ANSWERS ARE THEIR SHEET (owner, 9 Nov): their open content is the question itself, so only pictures and blanks are asked of them. */
  const WHOLE = ['question', 'answer'];
  const PEOPLE = typeof KC_PERSON_KINDS !== 'undefined' ? KC_PERSON_KINDS : [];
  const items = inFinder_(FINDERS.stuff, () => stuffItems()).concat(typeof settingDoorItems_ === 'function' ? settingDoorItems_() : []);
  const by = {};
  items.forEach(x => { const k = (x && x.kind) || 'thing'; (by[k] = by[k] || []).length < per && by[k].push(x); });
  const out = { kinds: Object.keys(by).length, cards: 0, bad: [], pics: {} };
  const say = (x, m) => out.bad.push(`${x.kind} "${String(x.name || x.key || '').slice(0, 40)}": ${m}`);
  Object.keys(by).forEach(kind => by[kind].forEach(x => {
    let html = '';
    try { html = inFinder_(FINDERS.stuff, () => stuffCard(x)); } catch (e) { say(x, 'drawing threw ' + e.message); return; }
    box.innerHTML = html;
    box.querySelectorAll('.card.kc:not(.card.kc .card.kc)').forEach(card => {
      out.cards++;
      const state = 'drawn';
      if (card.classList.contains('is-open') || card.querySelector(':scope > [data-do="kc-open"]')) say(x, 'opens or closes: a card is static');
      /* ONE PICTURE SIZE, ONE CENTRE LINE (±2px) for picture, tags, lines and buttons. */
      const pic = card.querySelector(':scope > .kc-pic'), cr = card.getBoundingClientRect(), mid = cr.left + cr.width / 2;
      if (pic && PEOPLE.includes(kind) && pic.getClientRects().length) { const p = pic.getBoundingClientRect(); out.pics[Math.round(p.width) + 'x' + Math.round(p.height)] = kind; }
      /* IMAGE ON TOP ONLY WHEN REAL (owner, 10 Nov late): a thing's photo, figure or cover; never a kind's icon or pixel sign. */
      if (card.querySelector('.kc-icon, .kc-blank, .lib-pic')) say(x, 'a stand-in picture (kind icon or pixel sign)');
      if (pic && pic.innerHTML.trim() && !/<(img|video|picture)\b|mfrclip-/.test(pic.innerHTML)) say(x, 'a picture that is not a real image');
      if (pic && !pic.innerHTML.trim() && pic.getClientRects().length) say(x, 'an empty picture part still takes room');
      /* ONE ORDER, TOP TO BOTTOM: image, tags, content, buttons. */
      const tops = [pic, card.querySelector(':scope > .kc-tags'), card.querySelector(':scope > .kc-lines'), card.querySelector(':scope > .kc-form'), card.querySelector(':scope > .kc-act')]
        .filter(el => el && el.getClientRects().length && el.getBoundingClientRect().height > 0).map(el => [el.className, el.getBoundingClientRect().top]);
      for (let i = 1; i < tops.length; i++) if (tops[i][1] + 1 < tops[i - 1][1]) say(x, tops[i][0] + ' sits above ' + tops[i - 1][0]);
      const centre = el => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; };
      [pic, card.querySelector(':scope > .kc-tags'), card.querySelector(':scope > .kc-lines'), card.querySelector(':scope > .kc-act .kc-four') && card.querySelector(':scope > .kc-act > .tile-row')].forEach(el => {
        if (el && el.getClientRects().length && Math.abs(centre(el) - mid) > 2) say(x, state + ': .' + el.className.split(' ')[0] + ' is ' + Math.round(centre(el) - mid) + 'px off the centre line'); });
      const row = card.querySelector(':scope > .kc-act .kc-four');
      if (row) { const tiles = [...card.querySelectorAll(':scope > .kc-act .kc-four > .tile')].map(t => t.getBoundingClientRect()).filter(r => r.width);
        if (tiles.length) { const l = Math.min(...tiles.map(r => r.left)), rr = Math.max(...tiles.map(r => r.right)); if (Math.abs((l + rr) / 2 - mid) > 2) say(x, 'its four buttons are ' + Math.round((l + rr) / 2 - mid) + 'px off the centre line'); } }
      const more = card.querySelector(':scope > .kc-act [data-do="kc-more"]'), list = card.querySelector(':scope > .kc-act .kc-more');
      /* ROUND ICONS ONLY (owner, 10 Nov late): no word under or in any tile, ⋯'s too; a long press says it. */
      if (more && list) { list.hidden = false; [...card.querySelectorAll(':scope > .kc-act .tile')].forEach(t => { const w = getComputedStyle(t, '::after').content;
        if ((w && w !== 'none' && w !== 'normal' && w !== '""') || t.innerText.trim()) say(x, 'round button "' + (t.getAttribute('aria-label') || '') + '" shows a word'); }); list.hidden = true; }
      const text = [...card.querySelectorAll(':scope > .kc-tags, :scope > .kc-lines, :scope > .kc-form')].map(n => n.innerText.trim()).join('');
      if (!text && !card.querySelector(':scope > .kc-lines .loading, :scope > .kc-form :is(input, select, textarea)')) say(x, state + ': blank card');
      if (card.querySelector(':scope > .kc-pic .pfp-art')) say(x, 'a default profile picture: only an uploaded photo goes on top');
      if (WHOLE.includes(kind)) return;
      const lines = card.querySelector(':scope > .kc-lines');
      if (lines) {
        const kindHtml = [...lines.querySelectorAll(':scope :is(h1, h2, h3, h4, table, hr)')].find(n => !n.closest('[hidden]'));
        if (kindHtml) say(x, state + ': kind HTML <' + kindHtml.tagName.toLowerCase() + '> in its lines');
        [lines, ...lines.querySelectorAll('*')].forEach(el => {
          if (el.closest('[hidden]') || !el.getClientRects().length) return;
          const cs = getComputedStyle(el);
          if (/dashed/.test(cs.borderTopStyle + cs.borderBottomStyle)) say(x, state + ': a dashed rule in its lines');
          const cut = el.scrollHeight > el.clientHeight + 1 && /hidden|clip/.test(cs.overflowY) && el.clientHeight > 0;
          const ends = cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none');
          if (cut && !ends && el.innerText.trim()) say(x, state + ': text cut mid-line "' + el.innerText.trim().slice(0, 30) + '"');
        });
      }
    });
  }));
  box.remove();
  if (Object.keys(out.pics).length > 1) out.bad.push('pictures of ' + Object.keys(out.pics).length + ' sizes: ' + JSON.stringify(out.pics) + ' — one size on every person');
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
