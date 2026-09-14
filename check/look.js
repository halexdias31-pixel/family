#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/look.js

   OPEN A SURFACE AND PHOTOGRAPH IT.

   WHY THIS EXISTS. `check/ui.js` visits the nine screens `screen()` registers and measures each one
   at four widths. That is every screen the app HAS — and it is not every surface the app DRAWS. The
   funnel is one screen, and what it shows depends entirely on what has been answered in it: at rest
   it is three words and a search box. A past paper, its questions, their mark schemes and the print
   row are all inside `stuff`, behind two or three answers, and `check/ui.js` has never once painted
   any of them.

   SO THE ONE SURFACE THIS APP IS FOR HAS NEVER BEEN LOOKED AT BY ANYTHING. Every finding about it
   this week came from reading the source and reasoning, which is how three of them were wrong on
   the first pass — and CLAUDE.md's own rule is that layout facts come from the browser.

   IT MEASURES NOTHING. `check/ui.js` is the instrument; this is the window. It drives the app to a
   state, writes a PNG and prints what it found there, and always exits 0 — it is for looking at,
   not for failing on.

     node check/look.js --payload /tmp/p.json --find "Paper 1"
     node check/look.js --payload /tmp/p.json --find "Paper 1" --width 390 --as admin

   `--find` is typed into the funnel's own search box, so this reaches a surface the way a person
   does rather than by calling a drawing function directly. A screenshot of a state nobody can get
   to is worth nothing.
================================================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8734;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
               '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf('--' + n); return i < 0 ? d : argv[i + 1]; };

const PAYLOAD_AT = arg('payload');
const FIND = arg('find', '');
const WIDTH = Number(arg('width', 390));
const SCREEN = arg('screen', 'stuff');
const AS = arg('as', 'admin');
const OUT = arg('out', path.join(__dirname, 'shots', 'look.png'));

const BODY = PAYLOAD_AT ? fs.readFileSync(PAYLOAD_AT, 'utf8')
                        : fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');

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

(async () => {
  const server = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 1400 },
                                       deviceScaleFactor: 1 });

  /* THE VIEWER, SET BEFORE THE PAGE EXISTS — see the note in check/ui.js. A stranger sees very
     little of this app, and a past paper is one of the things they do not see. */
  const payload = JSON.parse(BODY);
  const me = (payload.people || []).find(p => AS === 'admin'
    ? String(p.role || '').toLowerCase() === 'admin' : true) || (payload.people || [])[0];
  if (me) {
    await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); }
                                    catch (e) {} },
      { name: me.name || me.fullName, personId: me.id || me.personId,
        person_id: me.id || me.personId, role: me.role || 'admin',
        roles: [me.role || 'admin'], handle: me.handle || '' });
  }

  await page.route('**/exec*', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: BODY }));
  await page.route('**/macros/s/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: BODY }));

  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message)));

  await page.goto('http://127.0.0.1:' + PORT + '/', { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  await page.evaluate(id => { try { go(id); } catch (e) {} }, SCREEN);
  await page.waitForTimeout(400);

  /* TYPED IN, NOT SET. `STUFF.q` is what the search box writes to, and painting after setting it
     directly is the same state — but going through the box is the only version that proves the box
     still reaches it. */
  if (FIND) {
    await page.evaluate(q => {
      /* THROUGH THE BOX ITSELF where there is one — `on('input')` on `#stuff-q` sets `STUFF.q` and
         repaints, so this is the same path a person's typing takes. `paintStuff` is the fallback
         and the reason the box is preferred: calling it directly proves the drawing works and
         proves nothing about whether the control still reaches it. */
      const box = document.getElementById('stuff-q');
      if (box) {
        box.value = q;
        box.dispatchEvent(new Event('input', { bubbles: true }));
        return 'typed';
      }
      try { STUFF.q = q; paintStuff(); return 'painted'; } catch (e) { return 'failed: ' + e.message; }
    }, FIND);
    await page.waitForTimeout(600);
  }

  const DUMP = arg('dump');
  if (DUMP) await page.evaluate(d => document.body.setAttribute('data-look-dump', d), DUMP);

  const seen = await page.evaluate(() => {
    const pane = document.getElementById('s-stuff') || document.body;
    const count = s => pane.querySelectorAll(s).length;
    const txt = s => Array.from(pane.querySelectorAll(s)).slice(0, 6)
      .map(e => (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60));
    return {
      cards: count('.card, .paper, .qpaper'),
      papers: count('.paper'),
      qpapers: count('.qpaper'),
      questionParts: count('.qp-part'),
      answers: count('.qans'),
      answerBodies: count('.qans-body'),
      details: count('details'),
      tables: count('.qpaper table'),
      figures: count('.qpaper figure'),
      romans: count('.qpaper ol.roman'),
      names: txt('.paper-name, .card h3, .card b'),
      /* `--dump <selector>` PRINTS THE MARKUP. A screenshot says something is wrong; this says
         which element it is. The two together are the whole reason this file exists. */
      dump: (() => {
        const sel = document.body.getAttribute('data-look-dump');
        if (!sel) return null;
        return Array.from(pane.querySelectorAll(sel)).slice(0, 3)
          .map(e => (e.outerHTML || '').replace(/\s+/g, ' ').slice(0, 400));
      })(),
      height: document.documentElement.scrollHeight,
    };
  });

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await page.screenshot({ path: OUT, fullPage: true });

  console.log('');
  console.log('LOOKED AT  %s  @%dpx  as %s%s', SCREEN, WIDTH, AS, FIND ? '  searching "' + FIND + '"' : '');
  console.log('  payload        : ' + (PAYLOAD_AT || 'check/fixture.json'));
  console.log('  cards drawn    : ' + seen.cards + '   paper covers: ' + seen.papers);
  console.log('  paper bodies   : ' + seen.qpapers + '   question parts: ' + seen.questionParts);
  console.log('  answers shown  : ' + seen.answerBodies + '   still behind <details>: ' + seen.details);
  console.log('  typeset inside : ' + seen.tables + ' tables, ' + seen.figures + ' figures, '
              + seen.romans + ' roman lists');
  if (seen.names.length) console.log('  on screen      : ' + seen.names.join(' | '));
  if (errors.length) console.log('  JS ERRORS      : ' + errors.slice(0, 3).join(' / '));
  console.log('  page height    : ' + seen.height + 'px');
  if (seen.dump) { console.log(''); seen.dump.forEach(d => console.log('  ' + d)); console.log(''); }
  console.log('  written        : ' + OUT);

  await browser.close();
  server.close();
})();
