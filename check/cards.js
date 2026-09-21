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
const PHONE_H = 568;
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
  /* ---------- EVERY PREAMBLE THIS PART SITS UNDER, OUTERMOST FIRST -------------------------------
     THIS LOOKED UP ONE SCOPE AND THE APP DRAWS THREE. `preamble_` in find.js walks paper → section
     → question, which is what makes an AQA English insert — a source shared by every question in
     Section A — the same object as a maths question's shared opening paragraph. This asked only
     for the question-scope one, so the longest preamble in the library was the one it could not
     see, and a check that lays out every card was laying out a card the app does not draw.

     Caught the day the first insert went in, which is the only reason it is not still true. */
  const at = (scope, key) => (stems[scope] || {})[key];
  const pre = [at('paper', r.paper_id),
               r.section ? at('section', r.paper_id + '|' + r.section) : null,
               (r.question !== undefined && r.question !== null && r.question !== '')
                 ? at('question', r.paper_id + '|' + r.question) : null].filter(Boolean);
  return `<div class="qcard" data-row="${r.row_id}">
    <div class="qcard-top"><b>Q${r.question || ''}${r.part || ''}</b>
      <span>${r.marks || 0} marks</span></div>
    <p class="qcard-sub">${r.name || ''}</p>
    <div class="qsheet">
      ${pre.map(p => `<div class="qsheet-stem${String(p.placeholder) === 'True' ? ' is-standin' : ''}"
        >${p.html || ''}${fig(p.diagram)}</div>`).join('')}
      ${r.lead ? `<div class="qsheet-lead">${r.lead}</div>` : ''}
      <div class="qsheet-part"><div class="qsheet-pb">${r.html || ''}${fig(r.diagram)}</div></div>
    </div>
  </div>`;
}

/* ---------- ONE SET OF RULES, ASKED OF TWO SETS OF CARDS ------------------------------------------
   LIFTED OUT OF THE LOOP WHEN THE PRACTICALS JOINED. Everything below was written for the question
   cards and every word of it is as true of a practical: a box that was told it could scroll is not
   a fault, nothing inside an `<svg>` can push the page sideways, and `className` on an SVG element
   is not a string. Two copies of that reasoning would be two copies to keep in step, which is the
   fault this repository records under `findCard`, `documents_()` and `factsNow_` — and the one
   `cardHtml` below already half-pays by rebuilding a question's markup rather than calling the
   app's own renderer.

   IT RUNS INSIDE THE PAGE, so it takes one plain argument and closes over nothing. */
function measure(arg) {
    const out = [];
    document.querySelectorAll(arg.sel).forEach(card => {
      /* THE CARD ITSELF, AND THEN WHAT IS INSIDE IT. A card that fits while a paragraph inside it
         does not is the commoner shape — an inner box with `overflow: hidden` would hide a real
         overflow from the card's own measurement. */
      const over = el => el.scrollWidth - el.clientWidth;
      /* ---------- A BOX THAT WAS TOLD IT COULD SCROLL IS NOT A FAULT ------------------------
         CLAUDE.md STATES THE QUESTION THIS CHECK IS ASKING: "does this box scroll sideways when
         it was NOT told it could". Every element was measured the same way until the first
         four-column table went into the library — AQA Physics 8463/1H Table 1, which cannot
         shrink to 320px and is the question's own data. The house rule is that a wide table gets
         `overflow-x: auto` on its own container, and with that rule applied the check went on
         reporting the table: the overflow had simply moved from the card to the box now holding
         it deliberately.

         SO AN `auto` OR `scroll` BOX IS SKIPPED AND ITS ANCESTORS ARE NOT. That is the half that
         keeps this honest — a scroller cannot hide a card that is genuinely too wide, because
         the card is measured on its own pass and a scroller does not push it. Proved by mutation:
         putting the table back to `overflow-x: visible` fires the check on `.qsheet` at the same
         26px, and the rule as written reports nothing. */
      const told = el => {
        const o = getComputedStyle(el).overflowX;
        return o === 'auto' || o === 'scroll';
      };
      /* ---------- NOTHING INSIDE A DRAWING CAN PUSH THE PAGE SIDEWAYS ----------------------
         THE OUTERMOST `<svg>` CLIPS TO ITS VIEWPORT — that is the UA default and it is not a
         rule this repository set, so a child whose box falls outside the viewBox is painted
         nowhere rather than past the column. The `<svg>` itself is an ordinary replaced element
         in the HTML flow and is still measured; only its descendants are skipped.

         IT REPORTED A REAL DRAWING AND THE DRAWING WAS FINE. A y-axis label is written once and
         rotated into place — `<text x="10" … transform="rotate(-90 10 82)">` — so its LAYOUT box
         runs from x = −51 while the glyphs it paints sit at x ≈ 10. That is CLAUDE.md's own
         entry under `.mat-out`: "a transform is invisible to `scrollWidth`", and it cost two
         wrong fixes the first time. Here it would have cost the axis labels.

         PROVED BY MUTATION IN BOTH DIRECTIONS: forcing `.qsheet figure svg { width: 400px }`
         still fires on the `<svg>` at +80px, and the rotated label alone reports nothing. */
      const inSvg = el => el.ownerSVGElement != null;
      let worst = { px: 0, sel: '' };
      [card, ...card.querySelectorAll('*')].forEach(el => {
        if (!el.clientWidth || told(el) || inSvg(el)) return;
        const px = over(el);
        /* `className` ON AN SVG ELEMENT IS AN `SVGAnimatedString`, NOT A STRING, so every
           finding inside a drawing printed as `[object Object]` — one grouping key for every
           cause, which is the one thing this report's grouping exists to avoid. Caught the day
           the first generated graph went into the library. */
        const sel = (typeof el.className === 'string' && el.className)
                  || el.getAttribute('class') || el.tagName.toLowerCase();
        if (px > worst.px) worst = { px, sel };
      });
      if (worst.px > arg.slack) out.push({ row: card.dataset.row, px: worst.px, sel: worst.sel });
    });
    return out;
}

/* ---------- A LABEL PAINTED OUTSIDE ITS OWN DRAWING --------------------------------------------
   `measure` ABOVE SKIPS EVERYTHING INSIDE AN `<svg>` and is right to: the outermost one clips to
   its viewport, so nothing in there can push the page sideways. This asks the other question about
   the same element -- is any of this text painted somewhere the reader will never see it.

   RECTANGLES, NOT COORDINATES, because a y-axis label is written once and rotated into place and
   its LAYOUT box is nowhere near its glyphs. That is CLAUDE.md's `.mat-out` entry, which cost two
   wrong fixes the first time it was ignored.

   FOUR EDGES. The first version asked about left and right only, because both faults it was
   written for ran off the side -- and six library diagrams were quietly painting an axis caption
   above or below their box, including the scatter graph on the paper somebody was about to teach
   from. It runs inside the page, so it takes plain arguments and closes over nothing. */
function outside(svg, row) {
  const box = svg.getBoundingClientRect();
  const out = [];
  svg.querySelectorAll('text').forEach(t => {
    const r = t.getBoundingClientRect();
    if (!r.width && !r.height) return;
    const px = Math.round(Math.max(box.left - r.left, r.right - box.right,
                                   box.top - r.top, r.bottom - box.bottom));
    if (px > 1) out.push({ row: row, px: px, sel: (t.textContent || '').trim().slice(0, 34) });
  });
  return out;
}

(async () => {
  const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));
  const parts = rows.filter(r => r && r.kind === 'question');
  /* THE SAME INDEX `stemIndex_` BUILDS, by the same rule: a stem naming a question belongs to that
     question, one naming only a section to the section, one naming neither to the paper. */
  const stems = { paper: {}, section: {}, question: {} };
  rows.forEach(r => {
    if (!r || r.kind !== 'preamble' || !r.paper_id) return;
    if (r.question !== undefined && r.question !== null && r.question !== '') {
      stems.question[r.paper_id + '|' + r.question] = r;
    } else if (r.section) {
      stems.section[r.paper_id + '|' + r.section] = r;
    } else {
      stems.paper[r.paper_id] = r;
    }
  });

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
  const outOfBox = [];
  let withDiag = 0;
  for (let i = 0; i < parts.length; i += BATCH) {
    const chunk = parts.slice(i, i + BATCH);
    await page.setContent(
      `<!doctype html><meta charset="utf-8">
       <link rel="stylesheet" href="http://localhost:${PORT}/style.css">
       <body style="margin:0;background:#0b0b0b">
         <div id="col" style="width:${WIDTH}px">${chunk.map(r => cardHtml(r, stems)).join('')}</div>
       </body>`, { waitUntil: 'load' });
    await page.waitForTimeout(120);
    const found = await page.evaluate(measure, { slack: SLACK, sel: '.qcard' });
    bad.push(...found);
    /* ---------- AND THE 68 DRAWINGS IN THE LIBRARY, WHICH NOTHING HAD EVER MEASURED ------------
       THE GUIDE PASS BELOW ASKED THIS OF THE PRACTICALS' SEVENTEEN and this pass did not ask it at
       all, so the library's own figures -- the ones a student is looking at while they answer --
       were the half nobody checked. Six of them were clipping a caption. */
    const drawn = await page.evaluate(arg => {
      /* HANDED IN AS SOURCE rather than injected at navigation, because `setContent` replaces the
         document under this page on every batch and an init script's timing against that is one
         more thing to be wrong about. The prac pass below injects once because it navigates once. */
      const outside = new Function('return ' + arg.src)();
      const out = []; let n = 0;
      document.querySelectorAll(arg.sel).forEach(card => {
        let any = false;
        card.querySelectorAll('svg').forEach(svg => {
          if (svg.ownerSVGElement) return;          /* the outermost one is the one that clips */
          any = true;
          out.push(...outside(svg, card.dataset.row || '?'));
        });
        if (any) n++;
      });
      return { out: out, n: n };
    }, { sel: '.qcard', src: outside.toString() });
    outOfBox.push(...drawn.out);
    withDiag += drawn.n;
  }

  /* ---------- AND EVERY PRACTICAL CARD, WHICH NOTHING HAD EVER LAID OUT -------------------------
     THE SAME ARGUMENT AS THE QUESTIONS, ONE DATA FILE ALONG. `data/practicals.json` is 56 rows
     drawn by `practicalCard_`, and until this ran nothing had ever put more than a handful of them
     on a screen at once: the funnel fills five pages either side of where you are, so `check/ui.js`
     sees whichever ones it happens to stop on, and this file read the other data file.

     IT COST FOUR CARDS, FOUND ON THE RUN THAT ADDED TEN MORE. `.prac-head` is a flex row and a flex
     item's minimum is its MIN-CONTENT -- the widest unbreakable word -- so `Photosynthesis`, `Field
     investigations`, `Chromatography` and `I-V characteristics` beside a `flex: 0 0 auto` flag
     could not shrink, and each took the card up to 19px past a 320px column. Four rows of
     forty-one, on every commit, for as long as that card has existed.

     THROUGH THE APP'S OWN `practicalCard_`, NOT A COPY OF IT. `cardHtml` above rebuilds a
     question's markup here, which is a compromise that costs a second thing to keep in step;
     paying it twice would be worse. Booting the real app costs one page load and removes the
     question -- and `stuffItems()` is the app's own list, so a practical this check measures is one
     the funnel would actually draw. */
  /* ---------- A REAL PHONE'S HEIGHT, BECAUSE THE PANE'S CAP IS MEASURED IN `dvh` ----------------
     `.pane` is `max-height: calc(100dvh - var(--bar) - var(--safe-bottom) - 2.5rem)`, so a harness
     window 900px tall reports a cap no phone has. 320 x 568 is one device rather than two halves of
     two — the narrowest phone still in use, which is the width this whole file is built on. */
  const pracPage = await browser.newPage({ viewport: { width: WIDTH, height: PHONE_H } });
  const fixture = fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8');
  await pracPage.route('**://script.google.com/**', rq =>
    rq.fulfill({ status: 200, contentType: 'application/json', body: fixture }));
  await pracPage.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'domcontentloaded' });
  await pracPage.waitForTimeout(2600);
  const practicals = await pracPage.evaluate(width => {
    if (typeof stuffItems !== 'function' || typeof practicalCard_ !== 'function') return -1;
    const items = stuffItems().filter(x => x.kind === 'practical');
    /* IN A `.pane` INSIDE A `.page`, because that is what the card sits in when the app draws it
       and half its width comes from those two. A card measured in a bare div is a card measured in
       a column it is never in. */
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:0;top:0;width:' + width + 'px';
    host.innerHTML = '<section class="page"><div class="pane"></div></section>';
    document.body.appendChild(host);
    host.querySelector('.pane').innerHTML = items.map(x =>
      practicalCard_(x).replace('<div class="card prac',
        '<div data-row="' + x.key + '" class="card prac')).join('');
    window.__pracHost = host;
    /* ---------- AND WHETHER THE CARD FITS THE PANE, WHICH IS THE OTHER AXIS ----------------------
       THIS FILE ASKED ONE QUESTION UNTIL NOW and its own header says so: does this row's markup fit
       a 320px column. That is the axis nobody travels. The one they do is DOWN — `.pane` is
       `overflow: hidden` with a `dvh` cap, and each card is one page, so a card taller than the cap
       is simply cut off with no scroll and no page to turn to.

       MEASURED THE DAY THE GUIDE WAS BUILT: **51 of the 56 practical cards were past it**, median
       891px against a 534px cap at 320 x 568, the worst 1693px. More than half the set had its kit,
       its method, its safety line and its notes below the fold, on every commit, for as long as
       that card had existed. Nothing anywhere could see it — `check/ui.js` renders whichever five
       cards the funnel happens to stop on, and this file measured the other axis.

       IT IS A FAILURE RATHER THAN A COUNT, because after that card was split into a search result
       and a guide the number is ZERO — median 274px, worst 386. There is no backlog to swamp it,
       so the first card that goes back past the fold says so instead of joining a red nobody reads.

       ONLY THE PRACTICALS, AND THAT LINE IS PRINCIPLED RATHER THAN LAZY. This pass boots the real
       app and calls `practicalCard_`, so what it measures is the height the app actually draws. The
       question pass above rebuilds a question's markup with `cardHtml`, which has no tiles, no mark
       scheme and no answer box — a height measured off that is a height of a card nobody sees, and
       drawing a card the app does not draw is the fault this file was itself caught committing.
       Sampled through the app's own `questionCard_` instead: 4 of 600 are past the cap, median
       250px. Real, small, and not something this instrument can honestly claim to have swept. */
    const cap = parseFloat(getComputedStyle(host.querySelector('.pane')).maxHeight);
    const tall = [];
    host.querySelectorAll('.card.prac').forEach(el => {
      const h = el.getBoundingClientRect().height;
      if (h > cap) tall.push({ row: el.dataset.row, px: Math.round(h - cap) });
    });
    return { n: items.length, cap: Math.round(cap), tall };
  }, WIDTH);
  /* ---------- AND EVERY GUIDE, THROUGH THE SHEET THE APP OPENS IT IN ----------------------------
     THE CARD IS THE SEARCH RESULT AND THE GUIDE IS THE DOCUMENT, and the split above moved the kit,
     the method, the safety line and now seventeen apparatus drawings out of one and into the other.
     Nothing was measuring the half that moved: `check/ui.js` has ONE declared state that opens a
     guide, which is one practical of fifty-two, and this file was laying out the card.

     THROUGH `openSheet` RATHER THAN A DIV OF THE RIGHT WIDTH. `#sheet-body` has its own padding and
     its own cap, so a guide measured in a bare 320px column is measured in a column it is never in
     -- and guessing that padding here would be a second copy of a number the stylesheet already
     owns. The app's own door, one at a time, closed after each.

     A DRAWING GETS A SECOND QUESTION IN PIXELS A VIEWER CAN SEE. `measure` skips everything inside
     an `<svg>`, correctly: the outermost `<svg>` clips to its viewport, so nothing in there can push
     the page sideways. But a label painted outside that viewport is not harmless -- it is a word
     the reader simply does not get, and three of the seventeen shipped that way before a screenshot
     caught them ("bulb level with the side arm" arriving as "el with"). `getBoundingClientRect` is
     what answers it, because it accounts for the rotation a y-axis label is written with and
     `scrollWidth` does not -- the `.mat-out` lesson this file already records one rule up.

     ALL FOUR EDGES, AND IT ASKED ABOUT TWO. The first version compared `left` and `right` only,
     because both faults it was written for ran off the SIDE. A screenshot of May 2017 Higher Q1
     then showed a scatter graph captioned with the top two pixels of "hours of sunshine": the
     label sits at y = 180 in a box 176 tall, and the rule was looking the other way. Six rows in
     the library were painting a label above or below their own box, on four papers. Same fault,
     other axis -- which is why the rule is the four edges rather than the two that had bitten. */
  await pracPage.evaluate('window.__measure = ' + measure.toString());
  await pracPage.evaluate('window.__outside = ' + outside.toString());
  const guides = await pracPage.evaluate(arg => {
    if (typeof practicalGuide_ !== 'function' || typeof openSheet !== 'function') return -1;
    const items = stuffItems().filter(x => x.kind === 'practical');
    const wide = [], clipped = [];
    let drawings = 0;
    items.forEach(x => {
      openSheet(x.name, practicalGuide_(x), null, null);
      const gd = document.querySelector('#sheet-body .gd');
      if (!gd) return;
      gd.dataset.row = x.key;
      window.__measure({ slack: arg.slack, sel: '#sheet-body .gd' })
        .forEach(f => wide.push(f));
      gd.querySelectorAll('figure svg').forEach(svg => {
        drawings++;
        clipped.push(...window.__outside(svg, x.key));
      });
      if (typeof closeSheet === 'function') closeSheet();
    });
    return { n: items.length, drawings, wide, clipped };
  }, { slack: SLACK });

  /* A CHECK THAT CANNOT REACH ITS SUBJECT MUST SAY SO AND FAIL -- "I did not check" is not the same
     answer as "I checked and it was fine", which is the fault this repository has recorded five
     ways and the reason `check-booking.js` read as a pass for months. */
  if (guides === -1 || (guides !== -1 && !guides.n)) {
    console.error('\nthe app did not open one practical guide -- not a pass');
    process.exit(1);
  }
  if (practicals === -1) {
    console.error('\nthe app did not boot, so not one practical card was laid out -- not a pass');
    process.exit(1);
  }
  if (!practicals.n) {
    console.error('\nthe app has no practical items, so this check saw nothing -- not a pass');
    process.exit(1);
  }
  bad.push(...await pracPage.evaluate(measure, { slack: SLACK, sel: '.card.prac' }));

  /* ---------- AND EVERY PRINTED QUIZ, ON THE SHEET IT ACTUALLY PRINTS ON --------------------------
     A PRINTED QUIZ IS A DIFFERENT DOCUMENT FROM THE SCREEN ONE and nothing had ever laid one out.
     `check/ui.js` measures screens, this file measured cards and guides, and `quizPaper_` is drawn
     into `document.body` for the length of a print dialogue and taken away again -- so it is on no
     screen, in no sheet, and in no state any instrument here declares.

     TWO QUESTIONS, AND BOTH HAD ALREADY FAILED ONCE when this was written.

     DOES THE SHEET FIT ITS PAGE. At 18mm of padding the two longest quizzes came to 1145px against
     A4's 1123: the last question moved to a second sheet carrying one line, and `break-before: page`
     then put the answer key on page THREE. Five questions on three sheets of paper is not something
     a tutor prints twice, and nothing about the output is WRONG -- which is exactly why no other
     rule here could have caught it.

     AND IS THE ANSWER ANYWHERE ON PAGE ONE. The whole reason there are two sheets is that a tutor
     hands over the first and keeps the second, so a `why` printed on the quiz is the feature
     failing silently in the one direction that matters. Structurally it cannot happen today; the
     rule is here so that a future edit to `quizPaper_` cannot make it happen quietly.

     MEASURED UNDER PRINT MEDIA, because every rule that gives those sheets their size lives inside
     `@media print` -- on screen `.qz-paper` is `display: none` and every box is zero. It is the
     last thing this page does, so nothing measured above is measured in the wrong medium. */
  await pracPage.emulateMedia({ media: 'print' });
  const papers = await pracPage.evaluate(() => {
    if (typeof quizPaper_ !== 'function' || typeof stuffItems !== 'function') return -1;
    const A4 = 297 / 25.4 * 96;                       /* 1122.5px, which is what 297mm is at 96dpi */
    const items = stuffItems().filter(x => x.kind === 'quiz');
    const over = [], leak = [];
    document.body.classList.add('printing-quiz');
    items.forEach(x => {
      const d = document.createElement('div');
      d.innerHTML = quizPaper_(x);
      const paper = d.firstElementChild;
      document.body.appendChild(paper);
      const sheets = [].slice.call(paper.querySelectorAll('.qz-sheet'));
      sheets.forEach((el, i) => {
        const h = el.getBoundingClientRect().height;
        if (h > A4 + 1) over.push({ row: x.row.id + (i ? ' — the answers' : ''),
                                    px: Math.round(h - A4) });
      });
      const front = sheets.length ? sheets[0].textContent : '';
      x.row.qs.forEach(q => { if (q.why && front.indexOf(q.why) >= 0) leak.push(x.row.id + ' q' + q.n); });
      paper.remove();
    });
    document.body.classList.remove('printing-quiz');
    return { n: items.length, over, leak };
  });
  await pracPage.emulateMedia({ media: 'screen' });
  await pracPage.close();

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

  const withPre = parts.filter(r => {
    const at = (scope, key) => (stems[scope] || {})[key];
    return at('paper', r.paper_id)
        || (r.section && at('section', r.paper_id + '|' + r.section))
        || (r.question !== '' && at('question', r.paper_id + '|' + r.question));
  }).length;
  console.log(`\n${parts.length} question rows laid out at ${WIDTH}px `
            + `(${withPre} of them under a preamble), and ${practicals.n} practical cards`);
  console.log(`the pane caps at ${practicals.cap}px on a ${WIDTH}x${PHONE_H} phone; `
            + `${practicals.tall.length} practical card(s) are taller than that`);
  console.log(`${guides.n} practical guide(s) opened in the app's own sheet, `
            + `carrying ${guides.drawings} apparatus drawing(s)`);
  if (papers === -1 || !papers.n) {
    console.error('\nthe app laid out no printed quiz at all -- not a pass');
    process.exit(1);
  }
  console.log(`${papers.n} quiz/quizzes laid out as A4, ${papers.n * 2} sheet(s), `
            + `${papers.over.length} past the page and ${papers.leak.length} with an answer on the quiz`);

  const painted = outOfBox.concat(guides.clipped);
  console.log(`${withDiag} question card(s) carry a drawing, and every label in every drawing `
            + `was measured against its own box`);

  if (painted.length) {
    console.log('\nPAINTED OUTSIDE THE DRAWING  (' + painted.length + ')');
    painted.sort((x, y) => y.px - x.px).slice(0, 12).forEach(c =>
      console.log('  ' + c.row + ' — "' + c.sel + '" is ' + c.px + 'px past the svg\'s own box, '
        + 'so the reader never sees that part of it'));
  }

  if (papers.over.length) {
    console.log('\nPAST THE PAGE  (' + papers.over.length + ')');
    papers.over.sort((a, b) => b.px - a.px).slice(0, 10).forEach(o => console.log('  ' + o.row
      + ' — ' + o.px + 'px past A4, so it spills onto a sheet of its own and pushes the answer key '
      + 'onto a third'));
    if (papers.over.length > 10) console.log('  … and ' + (papers.over.length - 10) + ' more');
  }

  if (papers.leak.length) {
    console.log('\nAN ANSWER ON THE QUIZ ITSELF  (' + papers.leak.length + ')');
    papers.leak.slice(0, 10).forEach(l => console.log('  ' + l + ' — its explanation is printed on '
      + 'the sheet the student writes on, which is the whole reason there are two sheets'));
    if (papers.leak.length > 10) console.log('  … and ' + (papers.leak.length - 10) + ' more');
  }

  if (practicals.tall.length) {
    console.log('\nBELOW THE FOLD  (' + practicals.tall.length + ')');
    practicals.tall.sort((a, b) => b.px - a.px).slice(0, 10)
      .forEach(t => console.log('  ' + t.row + ' — ' + t.px + 'px past the pane, cut off with '
        + 'no scroll and no page to turn to'));
    if (practicals.tall.length > 10) {
      console.log('  … and ' + (practicals.tall.length - 10) + ' more');
    }
  }

  bad.push(...guides.wide);
  if (!bad.length && !practicals.tall.length && !painted.length
      && !papers.over.length && !papers.leak.length) {
    console.log('\nOK — every question, every practical and every guide fits the narrowest phone,\n'
              + '     every practical card fits the pane it is drawn in, every label in every\n'
              + '     drawing is inside the drawing, and every printed quiz fits one side of A4\n'
              + '     with its answers on the other sheet.');
    process.exit(0);
  }

  /* GROUPED BY WHAT IS OVERFLOWING, not by row, for the same reason `ui.js` groups by fault: fifty
     rows with one cause is one thing to fix and fifty lines is a wall nobody reads. */
  const by = {};
  bad.forEach(b => { (by[b.sel] = by[b.sel] || []).push(b); });
  if (bad.length) console.log('\nCARDS THAT DO NOT FIT:');
  Object.keys(by).sort((a, b) => by[b].length - by[a].length).forEach(sel => {
    const list = by[sel].sort((a, b) => b.px - a.px);
    console.log(`  ${sel} — ${list.length} row(s), up to ${list[0].px}px past the column`);
    list.slice(0, 4).forEach(b => console.log(`      ${b.row}  (+${b.px}px)`));
    if (list.length > 4) console.log(`      …and ${list.length - 4} more`);
  });
  console.log('');
  process.exit(1);
})();
