#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/ui.js

   WHAT A PAIR OF EYES WAS FOR, DONE AS MEASUREMENTS.

   Every visual fault on this site has been found the same way: somebody opened it on a phone,
   something looked wrong, and a screenshot came back. That works, and it only works for the screen
   somebody happened to open, at the width they happened to hold, on the day they happened to look.
   Nine screens times four widths is thirty-six looks, and nobody has ever done thirty-six looks.

   This does them in about twenty seconds, and it answers in numbers rather than in opinions.

     node check/ui.js              every screen, every width, report and exit 1 if anything failed
     node check/ui.js --screen=me  just one
     node check/ui.js --shots      also write PNGs to check/shots/ for a human to look at

   ------------------------------------------------------------------------------------------------
   IT READS THE RENDERED PAGE, NOT THE SOURCE. This matters more than it sounds.

   A scan of style.css said seven custom properties were used and never declared — `--fly-ink`,
   `--cols`, `--a` and four others — and every one of that list was wrong. They ARE set, from
   template strings in the JavaScript:

       style="--fly-ink:${esc(ink)}"        style="--cols:${days.length}"

   Reading the files could not see that and confidently reported a bug that did not exist.

   THEN THE OPPOSITE METHOD MADE THE IDENTICAL MISTAKE. Asking `getComputedStyle` instead produced
   the same seven names, because `--fly-ink` is only set on a flyer and a run that never opens one
   finds it resolved nowhere. Source-only and runtime-only were both wrong, in mirror image.

   So the rule throughout is: MEASURE THE RENDERED PAGE. Three of the four checks below do nothing
   else — overflow, tap size and contrast are all read off real boxes at real widths, because those
   are facts about a layout and a file cannot hold them.

   `deadVars` is the single exception, and it is the exception for a stated reason: whether ANY
   writer for a property exists is a fact about the SOURCE, and asking the page instead is what
   produced two of the three wrong answers above. It is not a measurement and does not pretend to be.

   ------------------------------------------------------------------------------------------------
   THE BACKEND IS NOT CALLED. `check/fixture.json` stands in for it — the same shape the real
   payload has, with two people, one session, one post. So this runs with no network, no Apps Script
   quota, and — the point — the SAME data every time. A check whose input changes is a check that
   fails on Tuesdays for reasons nobody can reproduce.

   ------------------------------------------------------------------------------------------------
   WHAT IT WILL NOT COMPLAIN ABOUT, and why each exclusion is here rather than being a smarter rule.

   THE PANES THAT SIT OFF-SCREEN ARE THE DESIGN. `placeCells` lays the screens out side by side and
   slides between them, so at any moment most of the app is parked to the left and right of the
   viewport. The first version of this check counted 156 elements "overflowing the viewport" and all
   but a handful of them were the next screen, waiting exactly where it was put. A check that cries
   wolf 156 times is a check that gets ignored on its first run and never run again.

   So: everything below is scoped to the ONE pane that is currently on screen, and overflow is asked
   as "does this box scroll sideways when it was not meant to" rather than "is this box past the
   right edge of the window". The second question has a different right answer for every element on
   this site. The first has the same right answer for all of them.
================================================================================================== */
'use strict';

const { chromium } = require('playwright');
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const PORT    = 8731;

const arg   = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=')[1];
const SHOTS = process.argv.includes('--shots');
const ONLY  = arg('screen');

/* THE NINE SCREENS, as registered by `screen(id, draw)` in the js/ files. If you add a screen, add
   it here — and if you forget, the check still passes, which is the one failure this file cannot
   catch by itself. `check/ui.js --list` prints what the app actually registered, so the two can be
   compared by eye once in a while. */
const SCREENS = ['stuff', 'account', 'feed', 'booking', 'tools', 'games', 'make', 'reel', 'dm'];

/* THE WIDTHS THAT EXIST. 320 is the smallest phone still in use and the one everything breaks on
   first; 390 is the modern iPhone; 768 is a tablet held upright; 1280 is a laptop. Four is enough —
   a layout that survives 320 and 1280 has survived everything between them, and every extra width
   is twenty more seconds on a check that has to be quick enough to run every time. */
const WIDTHS = [320, 390, 768, 1280];

/* 44 CSS PIXELS is Apple's published minimum for something a finger has to hit, and Google says 48.
   The smaller number is used so this reports what is indefensible rather than what is imperfect. */
const MIN_TAP = 44;

/* 4.5:1 is WCAG AA for body text. Large text is allowed 3:1, which is why size is checked too —
   holding 18pt-and-up to the body standard would report every heading on a dark site. */
const MIN_CONTRAST      = 4.5;
const MIN_CONTRAST_BIG  = 3.0;

/* ---------- A CUSTOM PROPERTY NOTHING ANYWHERE SETS ---------------------------------------------
   THE ONE CHECK HERE THAT IS NOT A MEASUREMENT, because it is the one question the running page
   cannot answer about itself. It took three wrong answers to work out why.

     · Reading style.css alone reported seven dead properties. All seven were wrong: `--fly-ink`
       and the rest are set from template strings — style="--fly-ink:${esc(ink)}" — which a scan of
       the stylesheet cannot see.

     · Asking the rendered page instead reported the SAME seven, for the mirror-image reason: a
       flyer only exists once you open one, so a run that never opens a flyer finds those names
       resolved nowhere and calls them dead.

     · Fixing that left `--tooth`, which is declared at style.css:1942 and was reported only because
       no element using it happened to be on screen. Wrong a third time.

   The lesson is that "is it resolved right now" is not the question. The question is whether ANY
   writer exists — a declaration in the CSS, a declaration in the HTML, or an assignment from the
   JavaScript — and that is decidable from the source alone, exactly and cheaply. A name used in a
   bare `var()` with no writer of any kind is a typo or a leftover, and nothing else.

   A `var(--x, fallback)` is never reported. The fallback is the writer. */
function deadVars() {
  const read = f => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
  const css  = read(path.join(ROOT, 'style.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  const html = read(path.join(ROOT, 'index.html'));
  const js   = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js'))
                 .map(f => read(path.join(ROOT, 'js', f))).join('\n');

  /* EVERY WRITER, of any kind. `--name:` covers a stylesheet rule, an inline style attribute, and
     a template string building one; setProperty covers the scripted form. */
  const writers = new Set();
  for (const src of [css, html, js]) {
    for (const m of src.matchAll(/(--[\w-]+)\s*:/g)) writers.add(m[1]);
    for (const m of src.matchAll(/setProperty\(\s*['"](--[\w-]+)/g)) writers.add(m[1]);
  }

  const dead = new Set();
  for (const src of [css, html]) {
    for (const m of src.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
      if (!writers.has(m[1])) dead.add(m[1]);
    }
  }
  return [...dead].sort();
}

/* ---------- SERVING THE REAL FILES ------------------------------------------------------------
   Not a copy, not a build — the files as they are on disk, so what is measured is what would ship.
   file:// would have done, except the app behaves differently there on purpose (see `jsonp` in
   data.js), and measuring the fallback path tells you nothing about the path everybody uses. */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
               '.ico': 'image/x-icon' };

function serve() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404); return res.end('not here');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(PORT, () => ok(s));
  });
}

/* ---------- THE MEASUREMENTS, RUN INSIDE THE PAGE -----------------------------------------------
   One function, passed whole to the browser, because crossing the boundary per element would turn
   two thousand elements into two thousand round trips. */
function inspect(opts) {
  const { MIN_TAP, MIN_CONTRAST, MIN_CONTRAST_BIG } = opts;
  const found = { overflow: [], tinyTargets: [], lowContrast: [] };

  /* ---------- THE SCREEN WE ASKED FOR, BY NAME ---------------------------------------------------
     `paint(id)` writes into `#s-<id>`, so that element IS the screen and there is nothing to work
     out. This asks for it directly.

     IT USED TO GUESS, and the guess was wrong in a way that took a while to see. The first version
     picked whichever pane had the largest area intersecting the viewport, on the reasoning that the
     one in front is the one you can see. That is true, and it is not stable: run `--screen=tools`
     on its own and it reported 25 sideways-scroll faults; run the same screen as part of all nine
     and it reported none. Same code, same screen, same width — a different answer depending on what
     had been visited first, because with nine screens drawn and placed, some other element won the
     area contest and the check quietly measured that instead.

     A CHECK THAT ANSWERS DIFFERENTLY ON THE SAME INPUT IS NOT A CHECK. It was about to be used to
     decide whether a change had broken the layout, and it would have blamed whichever change
     happened to be in the tree when the reading flipped.

     The fallback is still the old heuristic, for a screen whose element cannot be found at all —
     but it now says so, so a silent wrong answer becomes a visible unknown. */
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  let live = document.getElementById('s-' + opts.screenId);
  let guessed = false;

  if (!live) {
    guessed = true;
    const panes = [...document.querySelectorAll('section, .pane, .screen, .page')];
    live = document.body;
    let best = 0;
    for (const p of panes) {
      const r = p.getBoundingClientRect();
      const area = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0))
                 * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (area > best) { best = area; live = p; }
    }
  }

  const vis = el => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const inside = [...live.querySelectorAll('*')].filter(vis);

  /* ---------- 1. SIDEWAYS SCROLL THAT NOBODY ASKED FOR ------------------------------------------
     `scrollWidth > clientWidth` on a box whose overflow-x is not auto or scroll. This is the honest
     form of the question: the browser itself is saying "there is more here than fits, and I was not
     told that was allowed". No guessing about which parent an element was supposed to fit inside. */
  const roots = [document.scrollingElement, live, ...inside];
  for (const el of roots) {
    if (!el) continue;
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowX)) continue;
    const over = el.scrollWidth - el.clientWidth;
    if (over > 1 && el.clientWidth > 0) {
      found.overflow.push({ tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 40),
        by: over, width: el.clientWidth });
    }
  }

  /* ---------- 2. THINGS A FINGER CANNOT HIT ------------------------------------------------------ */
  for (const el of inside) {
    const tag = el.tagName;
    const role = el.getAttribute('role');
    /* SUMMARY IS A TAP TARGET AND WAS NOT ON THIS LIST. `<details>` arrived with the answer block on
       a question card (see `answerBlock_` in find.js) — the summary is the only way to open it, so a
       small one is exactly the fault this check exists to find, and it would have been invisible. */
    const tappable = /^(BUTTON|A|SELECT|INPUT|TEXTAREA|LABEL|SUMMARY)$/.test(tag)
      || role === 'button' || el.hasAttribute('onclick');
    if (!tappable) continue;
    if (el.closest('[hidden]')) continue;

    /* ---------- A CONTROL INSIDE A LABEL IS NOT THE TARGET; THE LABEL IS -------------------------
       A 14px CHECKBOX WAS REPORTED AND THE ROW AROUND IT IS 44px. `.mat-list label` wraps its
       checkbox and is `min-height: 44px`, and a click anywhere in a label toggles the control it
       contains — that is what a label IS, not a convention this app invented. So the finger has a
       44px row to hit and the check was measuring the glyph inside it.

       Three findings, at every width, for a control nobody has ever struggled to press. That is the
       same class of fault as the dead custom properties and the pane picked by area, both in
       CLAUDE.md: a check that measures the wrong thing and is believed. The fix for those two was
       to ask the right question, and this is the same fix.

       THE LABEL STILL HAS TO BE BIG ENOUGH. It is measured on its own pass — LABEL is in the
       tappable list above — so making a checkbox exempt does not make its row exempt. Shrink that
       row below 44px and this still reports it, as the label.

       ONLY WHEN THE LABEL ACTUALLY REACHES IT. `closest('label')` covers the wrapping form; a
       `for=` label sitting elsewhere in the DOM is deliberately NOT accepted, because proving it
       resolves to a big enough box is a different measurement and an unchecked assumption here
       would be exactly the kind of quiet pass this file exists to avoid. */
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) {
      const lab = el.closest('label');
      if (lab) {
        const lr = lab.getBoundingClientRect();
        if (lr.height >= MIN_TAP && lr.width >= MIN_TAP) continue;
      }
    }

    const r = el.getBoundingClientRect();
    if (r.height < MIN_TAP || r.width < MIN_TAP) {
      found.tinyTargets.push({ tag: tag.toLowerCase(),
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28),
        w: Math.round(r.width), h: Math.round(r.height) });
    }
  }

  /* ---------- 3. TEXT YOU CANNOT READ ------------------------------------------------------------
     WITH THE TRANSPARENCY COMPOSITED, which the first version of this did not do — it walked up to
     the first ancestor with any background at all and compared against that, so a panel at 2.4%
     white over black was read as nearly-white and every label on it was reported as unreadable.
     Seven false alarms out of seven. Blending down the whole ancestor chain is four more lines and
     it is the difference between a check somebody trusts and a check somebody mutes. */
  const parse = c => {
    const n = (c.match(/[\d.]+/g) || []).map(Number);
    return n.length ? { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 } : null;
  };
  const over = (fg, bg) => ({            // fg painted on top of bg
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const lum = c => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };

  const groundOf = el => {
    let acc = { r: 0, g: 0, b: 0, a: 1 };          // the page itself, assumed opaque
    const chain = [];
    for (let n = el; n; n = n.parentElement) chain.push(n);
    for (const n of chain.reverse()) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) acc = over(c, acc);
    }
    return acc;
  };

  for (const el of inside) {
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!own) continue;
    const s = getComputedStyle(el);
    const fg = parse(s.color);
    if (!fg) continue;
    const bg = groundOf(el);
    const solidFg = fg.a < 1 ? over(fg, bg) : fg;
    const a = lum(solidFg), b = lum(bg);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

    const px = parseFloat(s.fontSize) || 16;
    const bold = (parseInt(s.fontWeight, 10) || 400) >= 700;
    const big = px >= 24 || (bold && px >= 18.66);
    const need = big ? MIN_CONTRAST_BIG : MIN_CONTRAST;

    if (ratio < need) {
      found.lowContrast.push({ text: el.textContent.trim().slice(0, 30),
        ratio: +ratio.toFixed(2), need, px: Math.round(px),
        fg: s.color, bg: `rgb(${[bg.r, bg.g, bg.b].map(Math.round).join(' ')})` });
    }
  }

  return { found, guessed,
           pane: live === document.body ? 'body' : (live.id || live.className || live.tagName),
           counted: inside.length };
}

/* ---------- GO ---------------------------------------------------------------------------------- */
(async () => {
  const server = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome']
              .find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});

  const screens = ONLY ? [ONLY] : SCREENS;
  let failures = 0;
  const rows = [];

  if (SHOTS) fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });

  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 844 },
                                         deviceScaleFactor: 1 });
    const jsErrors = [];
    page.on('pageerror', e => jsErrors.push(String(e.message).slice(0, 120)));

    /* THE BACKEND, STOOD IN FOR. Matched on the host so it catches the JSONP route too. */
    await page.route('**://script.google.com/**', r =>
      r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));

    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);                      // the boot fetch and first paint

    for (const id of screens) {
      /* DRIVEN THROUGH THE APP'S OWN FRONT DOOR. `go(id)` is what a tap calls, so anything it does
         on the way — remembering the page, painting neighbours — happens here too. A check that
         reaches past the app's navigation is checking a state the app cannot actually be in. */
      const went = await page.evaluate(sid => {
        try { if (typeof go === 'function') { go(sid, false, true); return true; } } catch (e) {}
        return false;
      }, id);
      if (!went) { rows.push({ width, id, skipped: 'no go()' }); continue; }
      await page.waitForTimeout(450);

      const { found, counted, guessed } = await page.evaluate(inspect,
        { MIN_TAP, MIN_CONTRAST, MIN_CONTRAST_BIG, screenId: id });
      if (guessed) console.warn(`  ! #s-${id} not found at ${width}px — fell back to guessing `
                              + `which pane is in front, so this row may be measuring the wrong thing.`);

      const n = found.overflow.length + found.tinyTargets.length + found.lowContrast.length;
      if (n) failures += n;
      rows.push({ width, id, counted, guessed, ...found });

      if (SHOTS) await page.screenshot({
        path: path.join(__dirname, 'shots', `${id}-${width}.png`) });
    }

    if (jsErrors.length) { failures += jsErrors.length; rows.push({ width, id: '—', jsErrors }); }
    await page.close();
  }

  await browser.close();
  server.close();

  /* ---------- THE REPORT -------------------------------------------------------------------------
     GROUPED BY FAULT, NOT BY SCREEN. The same 38px button on nine screens is one thing to fix, and
     printed per screen it reads as nine problems and buries the one that only happens at 320. */
  const bucket = {};
  const add = (kind, key, where) => {
    const k = kind + ' ' + key;
    (bucket[k] = bucket[k] || { kind, key, where: [] }).where.push(where);
  };

  for (const name of deadVars()) {
    failures++;
    add('DEAD CSS VAR', name + ' is used in a bare var() and nothing anywhere sets it', 'source');
  }

  for (const r of rows) {
    if (r.skipped) continue;
    (r.jsErrors || []).forEach(e => add('JS ERROR', e, `${r.width}px`));
    (r.overflow || []).forEach(o => add('SIDEWAYS SCROLL',
      `${o.tag}.${o.cls.split(/\s+/)[0] || ''} overflows by ${o.by}px`, `${r.id}@${r.width}`));
    (r.tinyTargets || []).forEach(t => add('TAP TARGET',
      `<${t.tag}> ${JSON.stringify(t.text)} is ${t.w}x${t.h}`, `${r.id}@${r.width}`));
    (r.lowContrast || []).forEach(c => add('CONTRAST',
      `${JSON.stringify(c.text)} ${c.ratio}:1 (needs ${c.need}) ${c.fg} on ${c.bg}`,
      `${r.id}@${r.width}`));
  }

  const checked = rows.filter(r => !r.skipped && r.id !== '—').length;
  console.log(`\nchecked ${checked} screen/width combinations `
            + `(${screens.length} screens x ${WIDTHS.length} widths)\n`);

  const kinds = [...new Set(Object.values(bucket).map(b => b.kind))];
  if (!kinds.length) {
    console.log('  nothing to report.\n');
  } else {
    for (const kind of kinds) {
      const items = Object.values(bucket).filter(b => b.kind === kind);
      console.log(`${kind}  (${items.length})`);
      for (const it of items.slice(0, 60)) {
        const w = it.where;
        const at = w.length > 4 ? `${w.slice(0, 3).join(', ')} +${w.length - 3} more` : w.join(', ');
        console.log(`   ${it.key}\n      at ${at}`);
      }
      if (items.length > 60) console.log(`   …and ${items.length - 12} more`);
      console.log('');
    }
  }

  const skipped = rows.filter(r => r.skipped);
  if (skipped.length) {
    console.log(`not reachable: ${[...new Set(skipped.map(s => s.id))].join(', ')}\n`);
  }

  process.exit(failures ? 1 : 0);
})().catch(err => { console.error('check/ui.js fell over:', err); process.exit(2); });
