#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/boxes.js A QUESTION'S PAGES, LAID OUT (owner, 1 Nov): its answer boxes one a line and one width, and every page's foot -- Help, the star, Suggest a change, Back to top -- last, in that order, on a line of its own. */
/* Flags: --shots=DIR writes a PNG of each page looked at. Port: BOXES_PORT (22833). Needs playwright. */
require('./lib-full.js').needWords('a question\'s pages'); // LIB_PRIVATE=absent (CI, 840): every page it lays out is a question's words
const fs = require('fs');
const path = require('path');
const http = require('http');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.log('COULD NOT RUN — playwright is not installed'); process.exit(1); }

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.BOXES_PORT || 22833);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const SHOTS = ((process.argv.find(a => a.startsWith('--shots=')) || '').split('=')[1] || '');
const USER = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' };
const { MIME } = require('./mime.js');
/* THE OWNER'S PAGES: 5a's four Venn gaps, 5b's part and the answer page above it, 6b's long part (a page in front), a stem's page (9MA0 2024 Q6), a physics word bank. */
const ROWS = ['Q-1MA1-2306-1H-5a', 'Q-1MA1-2306-1H-5b', 'Q-1MA1-2306-1H-6b', 'Q-9MA0-2406-P1-6a', 'Q-STA-KS2-2024-P2-5', 'Q-W-AT-P-energy-2a'];
const FOOT = ['help-hand', 'fav', 'rep-box', 'find-top'];
const WIDTHS = (process.env.BOXES_WIDTHS || '390,320').split(',').map(Number);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fail = [];
let looked = 0, boxed = 0;

function serve() {
  return new Promise((ok, no) => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
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

/* WHAT ONE PAGE SHOWS: its foot's tiles by line, and its typed-in boxes. Measured in the page, so it is what a phone draws. */
const measure = (page, row, back) => page.evaluate(async ([r, back, FOOT]) => {
  go('stuff', false, true);
  const hit = stuffItemsAll_().find(x => x.row && x.row.row_id === r);
  if (!hit) return { err: r + ' is not in the library' };
  STUFF.filters = [{ field: 'paperId', value: hit.row.paper_id }];
  /* THE PAPER'S CHIP STILL ASKS (1100), so its cards are shown as the reveal tile shows them */
  findShow_();
  paintStuff(true);
  await new Promise(z => setTimeout(z, 500));
  const h2 = stuffFiltered().find(x => x.row && x.row.row_id === r) || hit;
  goPage('stuff', stuffPageOf_(h2) + stuffFirstResult_() - back, true);
  await new Promise(z => setTimeout(z, 900));
  const pg = document.querySelector('#s-stuff .page.on');
  const card = pg && pg.querySelector('.qcard');
  if (!card) return { err: 'no question page ' + back + ' before ' + r };
  const kind = card.classList.contains('qans-card') ? 'answer' : card.classList.contains('qstem') ? 'stem' : card.classList.contains('qpre') ? 'first' : 'part';
  const tiles = [...card.querySelectorAll('.tile')].filter(t => t.getBoundingClientRect().height > 0 && !t.closest('.qt-row, .qp-work-row, .qpad-bar'));
  const actOf = t => t.getAttribute('data-do');
  const lines = [];
  tiles.forEach(t => { const y = Math.round(t.getBoundingClientRect().top); let l = lines.find(L => Math.abs(L.y - y) < 6); if (!l) lines.push(l = { y, acts: [] }); l.acts.push(actOf(t)); });
  lines.sort((a, b) => a.y - b.y);
  const cr = card.getBoundingClientRect();
  const lastTile = tiles[tiles.length - 1];
  const below = lastTile ? [...card.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.height > 0 && b.top > lastTile.getBoundingClientRect().bottom + 2 && (e.textContent || '').trim(); }).length : 0;
  const gapBox = card.querySelector('.qp-cells-box');
  const cells = gapBox && !card.querySelector('table[data-cells]') ? { boxes: gapBox.querySelectorAll('.qp-ans-in').length, loose: card.querySelectorAll('.qp-cell').length,
    hint: !!gapBox.querySelector('.qp-cells-box > .q-hint'), wide: Math.round((gapBox.querySelector('.kp-field') || gapBox).getBoundingClientRect().width), inside: Math.round(gapBox.getBoundingClientRect().width) } : null;
  return { kind, lines: lines.map(l => l.acts), below, cells, inside: cr.width };
}, [row, back, FOOT]);

(async () => {
  const server = await serve();
  const browser = await chromium.launch();
  try {
    for (const W of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width: W, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
      await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
      await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
      await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS && typeof stuffItemsAll_ === 'function', null, { timeout: 90000 });
      await sleep(800);
      const kinds = new Set();
      for (const row of ROWS) {
        for (const back of [0, 1]) {
          const m = await measure(page, row, back);
          const at = `${W}px ${row}${back ? ' (the page before)' : ''}`;
          if (m.err) { fail.push(at + ': ' + m.err); continue; }
          looked++; kinds.add(m.kind);
          if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `${row}-${back}-${W}.png`) }); }
          /* THE FOOT: the last line, exactly Help, the star, Suggest a change, Back to top, and nothing of the page's own beside it. */
          const last = m.lines[m.lines.length - 1] || [];
          if (last.join(' ') !== FOOT.join(' ')) fail.push(`${at}, ${m.kind} page: its last line of tiles is [${last.join(', ')}], wanted [${FOOT.join(', ')}] on a line of its own`);
          if (m.lines.slice(0, -1).some(l => l.some(a => FOOT.indexOf(a) !== -1))) fail.push(`${at}, ${m.kind} page: a foot tile sits on a line above the foot: ${JSON.stringify(m.lines)}`);
          if (m.below) fail.push(`${at}, ${m.kind} page: ${m.below} thing(s) with words stand under the foot`);
          /* EVERY GAP IN ONE BOX (owner, 13 Nov): one box, the line saying to write them in order, no loose cells, the line's width. */
          if (m.cells) {
            boxed++;
            if (m.cells.boxes !== 1 || m.cells.loose) fail.push(`${at}: its gaps draw ${m.cells.boxes} box(es) and ${m.cells.loose} loose cell(s) — wanted one box`);
            if (!m.cells.hint) fail.push(`${at}: no line says to write the answers in order`);
            if (m.cells.wide < m.cells.inside * 0.6) fail.push(`${at}: the one box is ${m.cells.wide}px of ${m.cells.inside}px — not the line's width`);
          }
        }
      }
      ['answer', 'stem', 'first', 'part'].forEach(k => { if (!kinds.has(k)) fail.push(`${W}px: no ${k} page was looked at — that kind was NOT checked`); });
      if (errs.length) fail.push(`${W}px: page errors: ${errs.slice(0, 3).join(' / ')}`);
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  if (!boxed) fail.push('no page with boxes to type in was seen — the boxes were NOT checked');
  if (fail.length) { console.log('BOXES: ' + fail.length + ' fault(s)'); fail.forEach(f => console.log('  ' + f)); process.exit(1); }
  console.log(`boxes: ${looked} question pages at ${WIDTHS.join(' and ')}px — every foot last and alike, ${boxed} gap parts in one box with its line`);
})().catch(e => { console.log('COULD NOT RUN — ' + e.message); process.exit(1); });
