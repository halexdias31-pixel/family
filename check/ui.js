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
const PORT    = 8731;

const arg   = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=')[1];

/* ---------- THE FIXTURE, OR THE REAL PAYLOAD ------------------------------------------------------
   `--payload <file>` SWAPS THE HAND-WRITTEN FIXTURE FOR ONE `check/live.js` BUILT, which is the
   real `doGet` run over the real spreadsheets. The fixture stays the default and stays what CI
   would run: it is stable, and a check whose answer changes when somebody edits a cell is a check
   nobody can act on.

   THE REAL ONE IS FOR LOOKING. Three faults in one week were invisible to the fixture because the
   fixture was written from the same belief as the code — a `landmarks` tab with columns it has
   never had, a `link` that "no resource has", a paper drawn twice. None of those is a shape error,
   so none of them could be caught by a shape nobody questioned.

   NEVER COMMIT THE FILE IT READS. A real payload has PINs, e-mail addresses and dates of birth in
   it, and this repository is public. `check/live.js` refuses to write one into the working tree and
   `.gitignore` carries the path as well. */
/* ---------- `questions` AND `checklists` ARE NOT IN THE FIXTURE ANY MORE --------------------------
   THEY WOULD BE IGNORED IF THEY WERE. `js/library.js` builds both from `data/questions.json`, which
   this server serves out of the repository like any other file — so whatever a fixture said about
   them was overwritten a moment after the payload landed, and editing it would have changed
   nothing. A fixture key that silently does nothing is the fault this whole suite exists to catch.

   THE LIBRARY IS COMMITTED DATA NOW, so it is as fixed as the fixture ever was: the same rows every
   run, versioned, and diffable. There is nothing to stand in for. */
const PAYLOAD_AT = arg('payload');
const FIXTURE = PAYLOAD_AT
  ? fs.readFileSync(PAYLOAD_AT, 'utf8')
  : fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
if (PAYLOAD_AT) {
  console.log('payload: ' + PAYLOAD_AT + '  (the real one — findings here are about the DATA as');
  console.log('         much as the code, and the numbers move when a cell does)\n');
}
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

/* ---------- AND THE VISITOR, WHICH THIS FILE HAD NEVER THOUGHT ABOUT ------------------------------
   NINE SCREENS AT FOUR WIDTHS, AND EVERY ONE OF THEM SIGNED OUT. Nothing here ever set a user, so
   every run measured what a stranger sees — and this app shows a stranger very little. The booking
   screen is the plainest case: signed out it is one card reading "Sign in to book", four lines and
   a button, and that is what "booking: nothing to report" has meant all along. The form behind it
   is the most control-dense surface in the app.

   HOW MUCH IT MEANT is worth writing down rather than summarising. Measured the first time this
   list existed: 87 controls under 44px and a sideways scroll at 320, on the booking card alone,
   none of which any run of this file had ever seen.

   SIGNED IN THROUGH THE FRONT DOOR, NOT BY POKING `USER`. `data.js` reads `familyUser` out of
   localStorage at boot, so seeding that key before the page loads is exactly the state a returning
   visitor arrives in — and it goes through whatever `data.js` does with it rather than around.

   ADMIN, because it is the widest surface: an admin sees the family's screens plus the queue, the
   roster and the job controls, so one pass covers both. A parent-only pass would be a third of the
   run for a subset of what this already measures. If an admin-only control is ever wrongly shown to
   a parent that is `check-access.js`'s question, not this file's — this one asks whether what is
   drawn can be read and hit.

   THE ID MATCHES `check/fixture.json`'s first person. A visitor the payload does not know is a
   visitor half the app refuses to draw anything for, which would measure the sign-in screen twice. */
const VISITORS = [
  { as: 'out', user: null },
  { as: 'in',  user: { name: 'Test Admin', personId: 'P001', person_id: 'P001',
                       role: 'admin', roles: ['admin'], handle: 'testadmin' } },
];

/* 44 CSS PIXELS is Apple's published minimum for something a finger has to hit, and Google says 48.
   The smaller number is used so this reports what is indefensible rather than what is imperfect. */
const MIN_TAP = 44;

/* ---------- KNOWN, WITH A WRITTEN REASON EACH, AND STILL PRINTED ---------------------------------
   `check-payload.js` HAS THIS LIST AND THE ARGUMENT FOR IT IS THE SAME. A finding that is real,
   understood, and not repairable by changing a number does not stop being real — but left failing
   it turns the run red for ever, and a red that is always red is a red nobody reads. The next thing
   to break then arrives as one more line in a wall.

   SO: STILL MEASURED, STILL PRINTED, IN THEIR OWN SECTION, AND THEY DO NOT FAIL THE BUILD. What
   makes that honest rather than convenient is the rule that each entry carries ONE WRITTEN REASON
   saying what was tried and what it would take. An entry anybody can read and disagree with is an
   argument; an entry that just names a selector is a silencer.

   MATCHED ON CLASS, NOT ON TEXT. A rule written against "10" would accept any 22px control that
   happens to say 10; the class is what the stylesheet acts on. */
const ACCEPTED_TAP = [
  { cls: /^hr\b/, why:
    'THE HOUR GRID IS THE CONTROL, and it cannot be made of 44px parts. Eleven hours across a '
  + '242px row is 22px each; eleven 44px cells need 484px, which is wider than any phone made. '
  + 'Shrinking to fewer hours loses the mornings, and stacking them loses the week-at-a-glance '
  + 'reading that is the whole reason the grid beat a pair of time dropdowns. A finger picking a '
  + 'range on a grid is a drag, not a tap, and the drag is what `slot-row` handles.' },
  { cls: /^bk-(sel|in|v)\b/, why:
    'THE BOOKING ROW IS ONE LINE AND ITS UNDERLINE IS THE CELL\'S BOTTOM BORDER. Tried twice and '
  + 'photographed both times: `min-height: 44px` on the control grows the grid cell to 44px and '
  + 'leaves the dashed underline sitting 24px below the label it belongs to, with `align-items: '
  + 'center` no better than `baseline`. The card goes 754px to 1016px and reads as a list of '
  + 'detached rules. It is fixable — the underline has to move off the cell and onto the control — '
  + 'but that is a redesign of the row, not a number, and it is the app\'s main form.' },
];

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
     told that was allowed". No guessing about which parent an element was supposed to fit inside.

     ---------- AND `scrollWidth` DOES NOT KNOW ABOUT `transform` --------------------------------
     THIS IS THE ONE CASE WHERE THE BROWSER'S OWN ANSWER IS NOT THE ANSWER. `scrollWidth` is the
     layout width of the content; a `transform: scale()` on a child is painted afterwards and
     changes nothing about it. So an element holding a 794px sheet scaled to 0.353 reports 794
     against a 280px box — 514px of overflow that no viewer can ever see, because the thing is drawn
     at 280 and its right edge lands exactly on the box's.

     IT COST TWO WRONG FIXES BEFORE IT WAS MEASURED. `.mat-out` and `.fm-out` are the cheat sheet
     and the flyer, both A4 pages scaled to the phone by `matFit`/`flyFit`, both `overflow: hidden`
     and both correct. This check called them clipped; CLAUDE.md recorded the first as "a fixed
     paper width clipped with no way to reach the rest of the page you are about to print", and the
     second was changed on the strength of that entry. Nothing was ever clipped. Both are back to
     hidden, and the note that said otherwise is corrected.

     SO THE SECOND QUESTION IS ASKED IN PIXELS THE VIEWER CAN SEE. `getBoundingClientRect` DOES
     account for transforms, so the rendered right edge of the widest child is what settles it. If
     that edge is inside the box, the overflow is a number in a property and not a thing on a
     screen. Both methods are kept because each is right about something: the browser's own
     `scrollWidth` catches content that genuinely does not fit, and the rectangle catches the case
     where the page has already dealt with it. */
  const roots = [document.scrollingElement, live, ...inside];
  for (const el of roots) {
    if (!el) continue;
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowX)) continue;
    const over = el.scrollWidth - el.clientWidth;
    if (over > 1 && el.clientWidth > 0) {
      const box = el.getBoundingClientRect();
      /* THE FURTHEST ANY CHILD IS ACTUALLY PAINTED. Children only — the element's own rect is the
         box being overflowed, and asking whether it overflows itself always answers no.

         AN ELEMENT WITH NO ELEMENT CHILDREN IS NOT EXEMPT, and the first version of this made it
         so. A long unbreakable word in a plain `<div>` overflows with nothing to measure, so
         `paintedRight` stayed at the box's own left edge and every text overflow in the app would
         have been silently dropped — a check quietly answering "fine" to the commonest case there
         is. Text cannot be transformed away from its own box, so where there is nothing to measure
         the browser's `scrollWidth` is already the right answer and is taken as it stands. */
      let paintedRight = null;
      for (const kid of el.children) {
        const k = kid.getBoundingClientRect();
        if (k.width > 0 && (paintedRight === null || k.right > paintedRight)) paintedRight = k.right;
      }
      /* 2px of slack, which is the rounding a fractional scale leaves behind — `0.3533` on 794px
         does not land on a whole pixel and neither does the box. */
      if (paintedRight !== null && paintedRight - box.right <= 2) continue;
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
    /* ---------- A SQUARE ON A GAME BOARD IS NOT AN ISOLATED CONTROL --------------------------
       44px EXISTS SO SOMETHING CAN BE HIT WITHOUT LOOKING AT IT. A board cell is the opposite case:
       one of forty-two in a grid somebody is staring straight at, aimed at with the board in view.

       AND IT CANNOT BE MET HERE ANYWAY. Seven columns of 44px is 308px, plus gaps and padding is
       332px, on a phone that is 320px wide. Bleeding the board through the card's padding was tried
       and bought 4px and two sideways scrolls — the number is not reachable, so a check demanding it
       reports a fault nobody can fix, every run, for ever.

       WHAT MAKES A MIS-TAP SURVIVABLE, which is the part that actually matters: in Connect 4 the
       whole COLUMN is one target, so the real area is 25 x 150px — narrow, and tall enough to hit.
       In Othello only the legal moves are enabled, and there are rarely more than a handful, so the
       neighbours of any live square are almost always inert and a mis-tap does nothing at all.

       THE WEAK CASE, SAID OUT LOUD: two legal Othello moves can sit side by side, and there a
       mis-tap plays a move you did not choose. New game is the only way back. That is a real cost
       and it is the price of an 8x8 board on a 320px screen — every chess app on a phone pays it.

       NARROW ON PURPOSE. Only a cell whose own class says it is a board square. Anything else that
       is too small is still reported. */
    if (/\b(c4-cell|oth-cell)\b/.test(String(el.className || ''))) continue;

    if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) {
      const lab = el.closest('label');
      if (lab) {
        const lr = lab.getBoundingClientRect();
        if (lr.height >= MIN_TAP && lr.width >= MIN_TAP) continue;
      }
    }

    const r = el.getBoundingClientRect();
    if (r.height < MIN_TAP || r.width < MIN_TAP) {
      /* THE CLASS COMES BACK WITH IT, because a finding has to be identifiable to be accepted. A
         report keyed on the element's TEXT cannot tell a 22px hour button from a 22px anything
         else, so an ACCEPTED entry written against the text would silence whatever happens to say
         the same word next year. The class is what the stylesheet acts on and what a reason can be
         written about. */
      found.tinyTargets.push({ tag: tag.toLowerCase(),
        cls: String(el.className || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.'),
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
  for (const who of VISITORS) {
    const page = await browser.newPage({ viewport: { width, height: 844 },
                                         deviceScaleFactor: 1 });
    const jsErrors = [];
    page.on('pageerror', e => jsErrors.push(String(e.message).slice(0, 120)));

    /* WHO IS LOOKING, SET BEFORE THE PAGE EXISTS. `addInitScript` runs ahead of every script on the
       page, so `data.js` finds the key already there and signs the visitor in itself — the app's own
       door rather than a hand on `USER` after the fact. A `null` user writes nothing and leaves the
       run exactly as it was before this list existed. */
    if (who.user) await page.addInitScript(u => {
      try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {}
    }, who.user);

    /* THE BACKEND, STOOD IN FOR. Matched on the host so it catches the JSONP route too. */
    await page.route('**://script.google.com/**', r =>
      r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));

    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);                      // the boot fetch and first paint

    /* SIGNING IN MUST ACTUALLY HAVE HAPPENED. A seeded key the app ignores would leave this pass
       measuring the signed-out screens a second time and reporting it as coverage — "I did not
       check" printed as "I checked and it was fine", which is the failure this project keeps
       finding in its own checks. Louder than a skip, because a silent one looks like a pass. */
    if (who.user) {
      const signedIn = await page.evaluate(() => {
        try { return !!(typeof USER !== 'undefined' && USER); } catch (e) { return false; }
      });
      if (!signedIn) {
        console.warn(`  ! seeded a user and the app is still signed out at ${width}px — `
                    + `the signed-in half of the app was NOT measured.`);
        failures++;
      }
    }

    for (const id of screens) {
      /* DRIVEN THROUGH THE APP'S OWN FRONT DOOR. `go(id)` is what a tap calls, so anything it does
         on the way — remembering the page, painting neighbours — happens here too. A check that
         reaches past the app's navigation is checking a state the app cannot actually be in. */
      const went = await page.evaluate(sid => {
        try { if (typeof go === 'function') { go(sid, false, true); return true; } } catch (e) {}
        return false;
      }, id);
      if (!went) { rows.push({ width, id, as: who.as, skipped: 'no go()' }); continue; }
      await page.waitForTimeout(450);

      const { found, counted, guessed } = await page.evaluate(inspect,
        { MIN_TAP, MIN_CONTRAST, MIN_CONTRAST_BIG, screenId: id });
      if (guessed) console.warn(`  ! #s-${id} not found at ${width}px — fell back to guessing `
                              + `which pane is in front, so this row may be measuring the wrong thing.`);

      /* COUNTED IN THE REPORT, NOT HERE. Every finding used to be a failure the moment it was
         measured, which left no place to ask whether it is one of the known ones — the accepted
         list has to be consulted where the findings are grouped, because that is where a finding
         has a class attached to it. Rows carry what was found; the report decides what it means. */
      rows.push({ width, id, as: who.as, counted, guessed, ...found });

      if (SHOTS) await page.screenshot({
        path: path.join(__dirname, 'shots',
          `${id}-${width}${who.as === 'in' ? '-in' : ''}.png`) });
    }

    if (jsErrors.length) {
      failures += jsErrors.length;
      rows.push({ width, id: '—', as: who.as, jsErrors });
    }
    await page.close();
  }
  }

  await browser.close();
  server.close();

  /* ---------- THE REPORT -------------------------------------------------------------------------
     GROUPED BY FAULT, NOT BY SCREEN. The same 38px button on nine screens is one thing to fix, and
     printed per screen it reads as nine problems and buries the one that only happens at 320. */
  const bucket = {};
  const add = (kind, key, where, why) => {
    const k = kind + ' ' + key;
    (bucket[k] = bucket[k] || { kind, key, where: [], why }).where.push(where);
  };
  /* A KIND ENDING IN "(known)" IS IN ONE OF THE ACCEPTED LISTS: printed in full, with its reason,
     and not counted against the run. Everything else fails. */
  const isKnown = kind => / \(known\)$/.test(kind);

  for (const name of deadVars()) {
    failures++;
    add('DEAD CSS VAR', name + ' is used in a bare var() and nothing anywhere sets it', 'source');
  }

  /* WHERE A FAULT WAS SEEN NOW SAYS WHO WAS LOOKING. `booking@320` and `booking@320 signed in` are
     different screens with the same name, and a report that calls them both `booking@320` groups
     two findings into one line and hides the half that only a signed-in visitor can reach. */
  for (const r of rows) {
    if (r.skipped) continue;
    const at = `${r.id}@${r.width}${r.as === 'in' ? ' signed in' : ''}`;
    (r.jsErrors || []).forEach(e => add('JS ERROR', e,
      `${r.width}px${r.as === 'in' ? ' signed in' : ''}`));
    (r.overflow || []).forEach(o => add('SIDEWAYS SCROLL',
      `${o.tag}.${o.cls.split(/\s+/)[0] || ''} overflows by ${o.by}px`, at));
    (r.tinyTargets || []).forEach(t => {
      const ok = ACCEPTED_TAP.find(a => a.cls.test(t.cls || ''));
      add(ok ? 'TAP TARGET (known)' : 'TAP TARGET',
        `<${t.tag}>${t.cls ? '.' + t.cls : ''} ${JSON.stringify(t.text)} is ${t.w}x${t.h}`, at,
        ok && ok.why);
    });
    (r.lowContrast || []).forEach(c => add('CONTRAST',
      `${JSON.stringify(c.text)} ${c.ratio}:1 (needs ${c.need}) ${c.fg} on ${c.bg}`, at));
  }

  const checked = rows.filter(r => !r.skipped && r.id !== '—').length;
  console.log(`\nchecked ${checked} screen/width/visitor combinations `
            + `(${screens.length} screens x ${WIDTHS.length} widths x `
            + `${VISITORS.length} visitors: ${VISITORS.map(v => v.as === 'in' ? 'signed in'
                                                                : 'signed out').join(' and ')})\n`);

  /* EVERY FINDING THAT IS NOT KNOWN IS A FAILURE, counted once per distinct fault rather than once
     per place it was seen — the same 38px button on nine screens is one thing to fix, which is the
     grouping this whole report is built on. */
  failures += Object.values(bucket).filter(b => !isKnown(b.kind)).length;

  const kinds = [...new Set(Object.values(bucket).map(b => b.kind))].filter(k => !isKnown(k));
  const known = [...new Set(Object.values(bucket).map(b => b.kind))].filter(isKnown);

  const printKind = kind => {
    const items = Object.values(bucket).filter(b => b.kind === kind);
    console.log(`${kind}  (${items.length})`);
    for (const it of items.slice(0, 60)) {
      const w = it.where;
      const at = w.length > 4 ? `${w.slice(0, 3).join(', ')} +${w.length - 3} more` : w.join(', ');
      console.log(`   ${it.key}\n      at ${at}`);
    }
    if (items.length > 60) console.log(`   …and ${items.length - 60} more`);
    console.log('');
  };

  /* THE SUMMARY MUST NOT OVERSTATE ITSELF — the same rule `check-payload.js` learned when it printed
     "everything the site reads, the backend sends" three lines under five accepted dead keys. With
     known findings below, "nothing to report" is not what happened; "nothing NEW" is. */
  if (!kinds.length) {
    console.log(known.length
      ? '  nothing NEW to report. The known ones are below, each with its reason.\n'
      : '  nothing to report.\n');
  } else {
    for (const kind of kinds) printKind(kind);
  }

  /* THE KNOWN ONES, AFTER the ones that fail, so the list that needs doing is at the top — and in
     full rather than as a count, with the reason printed once under each group. A list nobody can
     read the argument for is a list that stops being reread. */
  for (const kind of known) {
    printKind(kind);
    const why = [...new Set(Object.values(bucket).filter(b => b.kind === kind)
                                                 .map(b => b.why).filter(Boolean))];
    why.forEach(w => console.log('   why: ' + w.replace(/(.{92}) /g, '$1\n        ') + '\n'));
  }

  const skipped = rows.filter(r => r.skipped);
  if (skipped.length) {
    console.log(`not reachable: ${[...new Set(skipped.map(s => s.id))].join(', ')}\n`);
  }

  process.exit(failures ? 1 : 0);
})().catch(err => { console.error('check/ui.js fell over:', err); process.exit(2); });
