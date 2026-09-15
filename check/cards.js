#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/cards.js

   EVERY QUESTION IN THE LIBRARY, LAID OUT AT PHONE WIDTH, MEASURED.

   WHY THIS EXISTS, AND IT IS THE SHARPEST VERSION OF A FAULT THIS REPOSITORY KEEPS FINDING.
   `check/ui.js` drives the real app through its own `go()` and measures what is on the screen. That
   is the right instrument for a SCREEN — but the Find screen's results are a strip of pages filled
   lazily, five either side of where you are, so one run renders about six cards out of four
   thousand. Measured: searching a common word gives 1,063 hits and puts SIX of them in the DOM, all
   from the same worksheet.

   SO THE APP CAN BE GREEN AND THE LIBRARY BROKEN. Fifty-one questions carry the printed paper's
   dotted answer line — the longest 128 characters with no space in it, which to a browser is one
   unbreakable word — and every one of them took the card, the pane and the page sideways. `ui.js`
   measures exactly that fault, has run on every commit for weeks, and never saw one, because the
   page it was on did not happen to hold one.

   A SAMPLE IS NOT A SWEEP. Widening the sample would have made the odds better and the claim no
   truer. What is actually needed is to measure the CONTENT rather than the screen: a question's
   markup either fits a 320px column or it does not, and that has nothing to do with which page of
   the funnel you are on. Four thousand of them go into one document in one page load.

   IT IS NOT A SECOND `ui.js` AND MUST NOT GROW INTO ONE. `ui.js` owns the app — navigation, tap
   targets, contrast, the parked screens, who is looking. This owns the LIBRARY, at one width, with
   one question: does this row's own markup fit. Two instruments, two subjects, and the line between
   them is whether the answer could change when somebody edits a cell.

   THE WIDTH IS 320 because that is the narrowest phone still in use and the one everything breaks
   on first — the same constant `ui.js` opens its list with, and for the same reason.

     node check/cards.js            every question row
     node check/cards.js --shots    also writes a PNG of the worst offenders
================================================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const WIDTH = 320;
const PORT = 8129;
const SHOTS = process.argv.includes('--shots');

/* ---------- WHAT COUNTS AS A FAILURE, AND IT IS DELIBERATELY ONE THING ----------------------------
   A ROW WIDER THAN THE COLUMN IT IS IN. Not "wider than the window" — see CLAUDE.md on why that
   question returns 156 false alarms in an app whose screens are parked off-canvas. The column here
   is a plain block with a known width, so `scrollWidth` against `clientWidth` is the browser's own
   answer and there is no transform anywhere in a question card to make it lie.

   ONE PIXEL OF SLACK, because a browser rounds sub-pixel widths and a card measuring 320.4 against
   320 is not a fault anybody can see. Two pixels is the smallest overflow worth a person's time. */
const SLACK = 1;

function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const f = path.join(ROOT, decodeURI(rq.url.split('?')[0]));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        rs.writeHead(404); return rs.end();
      }
      const type = { '.css': 'text/css', '.js': 'text/javascript',
                     '.json': 'application/json', '.html': 'text/html' }[path.extname(f)]
                 || 'text/plain';
      rs.writeHead(200, { 'content-type': type });
      rs.end(fs.readFileSync(f));
    });
    srv.listen(PORT, () => done(srv));
  });
}

/* THE CARD, BUILT THE WAY `questionCard_` BUILDS IT — the same classes in the same nesting, because
   the stylesheet is the thing under test and a different wrapper is a different measurement. It is
   copied rather than imported for one reason: importing it means standing the whole app up in a
   browser, which is `ui.js`'s job and would bring the lazy page fill back with it. The copy is
   eleven lines and `check.js` would name any class in it that the stylesheet does not have. */
function cardHtml(r, stems) {
  const fig = d => (d ? `<figure>${d}</figure>` : '');
  const pre = (stems[r.paper_id + '|' + r.question] ? [stems[r.paper_id + '|' + r.question]] : []);
  return `<div class="qcard" data-row="${r.row_id}">
    <div class="qcard-top"><b>Q${r.question || ''}${r.part || ''}</b>
      <span>${r.marks || 0} marks</span></div>
    <p class="qcard-sub">${r.name || ''}</p>
    <div class="qsheet">
      ${pre.map(p => `<div class="qsheet-stem">${p.html || ''}${fig(p.diagram)}</div>`).join('')}
      ${r.lead ? `<div class="qsheet-lead">${r.lead}</div>` : ''}
      <div class="qsheet-part"><div class="qsheet-pb">${r.html || ''}${fig(r.diagram)}</div></div>
    </div>
  </div>`;
}

(async () => {
  const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));
  const parts = rows.filter(r => r && r.kind === 'part');
  const stems = {};
  rows.forEach(r => { if (r && r.kind === 'stem') stems[r.paper_id + '|' + r.question] = r; });

  if (!parts.length) {
    console.error('no question rows found — this check cannot see its subject, which is not a pass');
    process.exit(1);
  }

  const server = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });

  /* ---------- IN BATCHES, BECAUSE ONE DOCUMENT OF FOUR THOUSAND CARDS IS A DIFFERENT TEST --------
     A page that long lays out slowly and, more importantly, stops being the thing it is standing in
     for: a card on a screen with a handful of siblings. Five hundred at a time is fast and is still
     an ordinary page. */
  const BATCH = 500;
  const bad = [];
  for (let i = 0; i < parts.length; i += BATCH) {
    const chunk = parts.slice(i, i + BATCH);
    await page.setContent(
      `<!doctype html><meta charset="utf-8">
       <link rel="stylesheet" href="http://localhost:${PORT}/style.css">
       <body style="margin:0;background:#0b0b0b">
         <div id="col" style="width:${WIDTH}px">${chunk.map(r => cardHtml(r, stems)).join('')}</div>
       </body>`, { waitUntil: 'load' });
    await page.waitForTimeout(120);
    const found = await page.evaluate(slack => {
      const out = [];
      document.querySelectorAll('.qcard').forEach(card => {
        /* THE CARD ITSELF, AND THEN WHAT IS INSIDE IT. A card that fits while a paragraph inside it
           does not is the commoner shape — an inner box with `overflow: hidden` would hide a real
           overflow from the card's own measurement. */
        const over = el => el.scrollWidth - el.clientWidth;
        let worst = { px: 0, sel: '' };
        [card, ...card.querySelectorAll('*')].forEach(el => {
          if (!el.clientWidth) return;
          const px = over(el);
          if (px > worst.px) worst = { px, sel: el.className || el.tagName.toLowerCase() };
        });
        if (worst.px > slack) out.push({ row: card.dataset.row, px: worst.px, sel: worst.sel });
      });
      return out;
    }, SLACK);
    bad.push(...found);
  }

  if (SHOTS && bad.length) {
    fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
    const worst = bad.slice().sort((a, b) => b.px - a.px).slice(0, 8).map(b => b.row);
    const pick = parts.filter(r => worst.includes(r.row_id));
    await page.setContent(
      `<!doctype html><meta charset="utf-8">
       <link rel="stylesheet" href="http://localhost:${PORT}/style.css">
       <body style="margin:0;background:#0b0b0b">
         <div style="width:${WIDTH}px">${pick.map(r => cardHtml(r, stems)).join('')}</div>
       </body>`, { waitUntil: 'load' });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(__dirname, 'shots', 'cards-overflow.png'),
                            fullPage: true });
  }

  await browser.close();
  server.close();

  console.log(`\n${parts.length} question rows laid out at ${WIDTH}px`);
  if (!bad.length) {
    console.log('\nOK — every question in the library fits the narrowest phone.');
    process.exit(0);
  }

  /* GROUPED BY WHAT IS OVERFLOWING, not by row, for the same reason `ui.js` groups by fault: fifty
     rows with one cause is one thing to fix and fifty lines is a wall nobody reads. */
  const by = {};
  bad.forEach(b => { (by[b.sel] = by[b.sel] || []).push(b); });
  console.log('\nQUESTIONS THAT DO NOT FIT:');
  Object.keys(by).sort((a, b) => by[b].length - by[a].length).forEach(sel => {
    const list = by[sel].sort((a, b) => b.px - a.px);
    console.log(`  ${sel} — ${list.length} row(s), up to ${list[0].px}px past the column`);
    list.slice(0, 4).forEach(b => console.log(`      ${b.row}  (+${b.px}px)`));
    if (list.length > 4) console.log(`      …and ${list.length - 4} more`);
  });
  console.log('');
  process.exit(1);
})();
