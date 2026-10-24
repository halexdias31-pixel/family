#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/press.js PRESS IT. § */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const { statesOf } = require('./states.js');
/* ---------- THE PAYLOAD AND THE LIBRARY IN, NOT A GUESS AT WHEN THEY WILL BE § */
const appIn_ = page => page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED
  && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 30000 }).catch(() => {});

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PRESS_PORT || 8123);   /* overridable: parallel runs in worktrees share one machine */
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
/* AND A STRANGER IS SENT WHAT `doGet` SENDS A STRANGER — `check/ui.js`'s rule, which this file did not have. § */
const FIXTURE_ANON = (() => {
  try { const o = JSON.parse(FIXTURE); o.films = []; delete o.filmsSync; return JSON.stringify(o); }
  catch (e) { return FIXTURE; }
})();
const ONLY = (process.argv.find(a => a.startsWith('--screen=')) || '').split('=')[1] || '';
const VERBOSE = process.argv.includes('--verbose') || process.env.VERBOSE === '1';

/* ---------- BOTH VISITORS, AND THE SECOND ONE IS THE FRONT DOOR § */
const VISITORS = [
  { as: 'signed in', user: { name: 'Test Admin', personId: 'P001', person_id: 'P001',
                             role: 'admin', roles: ['admin'], handle: 'testadmin' } },
  { as: 'signed out', user: null },
];

/* ---------- KNOWN QUIET, WITH A WRITTEN REASON EACH, AND STILL PRINTED § */
const ACCEPTED_QUIET = {
  /* ---------- A FILE PICKER § */
  'msg-attach': { why: 'opens the device file chooser; nothing on the page changes until a file is picked.' },
  'pfp-pick':   { why: 'the profile picture\'s Choose photo: opens the device file chooser, and nothing on the '
                     + 'page changes until a picture is picked — check-flow drives that half with a file.' },
  'cam-more':   { why: 'keeps the current shot and starts the camera again; with no shot and no camera '
                     + 'in this container there is nothing to keep and nothing to restart.' },
  /* ---------- A BOX WITH NOTHING IN IT § */
  /* `cmt-add` IS THE POST TILE NOW ("post should be a tile too") — same act, same refusal. */
  'cmt-add':  { why: 'the comment box is empty, so the Post tile\'s handler focuses it and returns — which is the '
                   + 'right answer to "post nothing".' },
  'msg-send': { why: 'the message box is empty. Same refusal as `cmt-add`, and the same right one.' },
  'dock-add': { why: 'the to-do box is empty; the handler focuses it and adds no line.' },
  /* ---------- A QUESTION ABOUT A PAPER NOBODY HAS CHOSEN § */
  'mat-blank': { why: 'a practice-paper setting, hidden while the cheat sheet is chosen; it is kept for '
                    + 'the paper and the screen rightly stays as it was — check-flow presses it with the paper showing.' },
  /* IT CAME OFF THIS LIST ONCE, WITH THE STATE THAT REACHED IT. § */
  'pad-clear': { why: 'nothing has been drawn on the pad, so this writes an empty list over an '
                    + 'empty list — the same refusal as an empty box, and the same right one.' },

  /* ---------- A CARET IS NOT A PRESS § */
  'book-emails': { why: 'a text field. It answers `change` on what is typed; a click is a caret.' },
  'book-note':   { why: 'the same field one row down, and the note over its listener says outright '
                      + 'that it does NOT redraw — repainting would take the cursor out of the box '
                      + 'the moment somebody clicked away mid-sentence.' },
  'qp-ans':      { why: 'the answer box writes to localStorage on `input`, not on a press; a click '
                      + 'on a textarea is a caret being placed.' },
  /* THE TYPING LINE IS A CARET TOO, with a button round it. § */
  'kt-focus':    { why: 'puts the focus in the hidden typing box, which the rung pressed before it '
                      + 'already did — a caret placed twice.' },

  /* ---------- NO CAMERA IN A CONTAINER § */
  'cam-pick': { why: 'a file input. The click opens the operating system\'s own picker, which is '
                   + 'outside the page — nothing in the page changes either way.' },
  'cam-flip': { why: 'switches between two cameras. `camWays_` asks the browser for its video inputs '
                   + 'and this container has none, so there is nothing to switch to. The control is '
                   + 'drawn only where there are two, which is why this is quiet rather than absent.' },

  /* ---------- A CONTROL WHOSE WHOLE JOB IS A SOUND § */
  'imp-listen': { why: 'speaks the card quietly through speechSynthesis and draws nothing, so nobody across '
                     + 'the table sees that anything happened; check-flow records the voice and proves it.' },
  /* A TEXTBOOK ANIMATION'S PLAY AGAIN PUTS THE SAME MARKUP BACK, which is how a CSS animation starts over: § */
  'tb-an-again': { why: 'restarts the animation by putting the same markup back: new elements, the same '
                     + 'drawing, so nothing measured differs; check-flow proves the elements are new.' },
  /* AND SHOW, PRESSED STRAIGHT AFTER DEAL, IS A DOUBLE TAP — which is what it is ignored as, on purpose. § */
  'imp-show': { only: 'imposter setup', why: 'pressed within 600ms of Deal on the same pixels: a double tap, '
                     + 'ignored by design (`impTooSoon_`); check-flow proves Show alone opens the card.' },
  /* AND SO ARE THE REVEAL'S DEAL AND PLAYERS, PRESSED STRAIGHT AFTER REVEAL, since the review of 11 October: § */
  'imp-again': { only: 'imposter play', why: 'pressed within 600ms of Reveal, which drew it: a double tap, '
                     + 'ignored by design (`impTooSoon_`); check-flow proves the reveal\'s Deal alone deals.' },
  'imp-players': { only: 'imposter play', why: 'pressed within 600ms of Reveal, which drew it: a double tap, '
                     + 'ignored by design (`impTooSoon_`); check-flow proves Players alone goes back to setup.' },

  /* ---------- AND ONE THAT IS THE FIXTURE RATHER THAN THE APP -------------------------------------- */
  'cmt-del': { only: 'signed out', why:
      'a stranger has no `USER`, so the handler returns. The button is only drawn where the SERVER '
      + 'said `canRemove` — and `check/fixture.json` is one payload served to both visitors, so it '
      + 'says yes to a stranger the real `doGet` would say no to. The handler checking again is '
      + 'deliberate and `js/posts.js` says why: a button is not a permission.' },
};

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
               '.ico': 'image/x-icon' };

function serve() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      /* THE LIBRARY WITH ITS WORDS (397): the repository's copy is card metadata, check/lib-full.js puts them back. */
      const libBody = require('./lib-full.js').serve(p);
      if (libBody !== null) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(libBody); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404); return res.end('not here');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(PORT, () => ok(s));
  });
}

/* ---------- THE THINGS A PRESS MUST NOT BE ALLOWED TO DO TO THE HARNESS § */
const GUARDS = () => {
  window.__press = { fetches: 0, prints: 0, errs: [] };
  const f = window.fetch;
  window.fetch = function () { window.__press.fetches++; return f.apply(this, arguments); };
  window.confirm = () => true;
  window.alert = () => {};
  window.prompt = () => '';
  /* AND IT ANSWERS LIKE A REAL BROWSER RATHER THAN DOING NOTHING. § */
  window.print = () => {
    window.__press.prints++;
    window.dispatchEvent(new Event('afterprint'));
  };
  window.open = () => null;
  try {
    const loc = window.location;
    Object.defineProperty(window, 'location', { configurable: true, get: () => ({
      ...loc, href: loc.href, search: loc.search, pathname: loc.pathname, hash: loc.hash,
      reload: () => {}, assign: () => {}, replace: () => {}, toString: () => loc.href,
    }) });
  } catch (e) { /* a browser that will not let it be replaced simply reloads, and the run says so */ }
};

/* ---------- WHAT THE PAGE IS, IN ONE STRING § */
function stateOf(id) {
  const scr = document.getElementById('s-' + id);
  const sheet = document.getElementById('sheet');
  let store = 0;
  try { for (let i = 0; i < localStorage.length; i++) store += (localStorage.getItem(localStorage.key(i)) || '').length; } catch (e) {}
  const toast = document.getElementById('toast');
  /* HASHED, NOT MEASURED. § */
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  return [
    scr ? hash(scr.innerHTML) : -1,
    /* A TICK IS A PROPERTY, NOT MARKUP. § */
    scr ? [...scr.querySelectorAll('input[type=checkbox],input[type=radio]')].map(x => x.checked ? 1 : 0).join('') : '',
    sheet && !sheet.classList.contains('hidden') ? hash((document.getElementById('sheet-body') || {}).innerHTML || '1') : 0,
    /* `#drop` WAS READ HERE, the booking form's list of answers while it was a panel outside the screens. § */
    typeof AT === 'undefined' ? '?' : AT,
    typeof PAGE === 'undefined' ? '?' : JSON.stringify(PAGE),
    toast ? (toast.textContent || '').trim() : '',
    store,
    window.__press.fetches,
    /* AND PRINTS, COUNTED THE WAY FETCHES ARE. § */
    window.__press.prints,
    /* AND FULL SCREEN, FOR PRINT'S REASON: § */
    (() => { const f = document.fullscreenElement;
      return f ? f.tagName + '.' + String(f.className || '') : ''; })(),
  ].join('|');
}

/* ---------- IS THE APP STILL THERE § */
function aliveIn(id) {
  const scr = document.getElementById('s-' + id);
  return {
    go: typeof go === 'function',
    screens: document.querySelectorAll('.screen').length,
    broke: !!(scr && /did not draw/i.test(scr.textContent || '')),
  };
}

/* BOTH OF THOSE RUN IN THE PAGE, NOT HERE. § */
const PAGE_HELPERS = 'window.stateOf = ' + stateOf + ';\nwindow.aliveIn = ' + aliveIn + ';';

(async () => {
  const server = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});

  const raw = [];
  const results = [];       /* { screen, action, err, changed, where } */
  let pressed = 0, notEntered = 0;

for (const who of VISITORS) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  raw.length = 0;
  page.on('pageerror', e => raw.push('window: ' + String(e.message).slice(0, 140)));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    /* THE DISPATCHER'S OWN LINE. § */
    if (/^\[[a-z0-9-]+\]/i.test(t)) raw.push('handler: ' + t.slice(0, 200));
  });


  await page.route('**://script.google.com/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: who.user ? FIXTURE : FIXTURE_ANON }));

  if (who.user) await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, who.user);
  await page.addInitScript(GUARDS);
  await page.addInitScript({ content: PAGE_HELPERS });
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  await appIn_(page);

  /* THE SEED MUST ACTUALLY HAVE WORKED, and so must its absence. § */
  const signedIn = await page.evaluate(() => { try { return !!(typeof USER !== 'undefined' && USER); } catch (e) { return false; } });
  if (signedIn !== !!who.user) {
    console.error('! wanted the app ' + who.as + ' and it is not — that pass would have pressed the wrong visitor\'s controls.');
    await browser.close(); server.close(); process.exit(1);
  }

  /* `--screen=stuff,res` PRESSES SEVERAL IN ONE PAGE, IN THAT ORDER — which is what a press that leaks from one column into the next needs to be seen: § */
  const screens = ONLY ? ONLY.split(',').filter(Boolean)
    : await page.evaluate(() => (typeof TABS !== 'undefined' ? TABS.map(t => t.id) : []));
  if (!screens.length) {
    console.error('! no screens to press — TABS came back empty, so this checked nothing.');
    await browser.close(); server.close(); process.exit(1);
  }



  /* ---------- ONE PRESS § */
  const pressOne = (sid, act) => page.evaluate(async ({ sid, act }) => {
    const scr = document.getElementById('s-' + sid);
    const sheet = document.getElementById('sheet');
    const open = sheet && !sheet.classList.contains('hidden');
    /* THE ONE THAT IS NOT ALREADY CHOSEN, WHERE THERE IS A CHOICE. § */
    const chosen = e => e.classList.contains('on') || e.classList.contains('is-on')
      || e.classList.contains('sel') || e.getAttribute('aria-pressed') === 'true';
    const pick = root => {
      if (!root) return [];
      const all = [...root.querySelectorAll('[data-do="' + act + '"]')].filter(e => !e.disabled);
      /* THE UNCHOSEN ONES FIRST, then the rest — see `chosen` above. */
      return [...all.filter(e => !chosen(e)), ...all.filter(chosen)];
    };
    /* THE SHEET FIRST WHEN ONE IS OPEN, because it is in front and it is what a finger would reach. */
    const cands = (open ? pick(sheet) : []).concat(pick(scr));
    /* PRESENT AND DISABLED IS NOT ABSENT, and it is not a fault either. § */
    if (!cands.length) {
      const any = (open && sheet ? [...sheet.querySelectorAll('[data-do="' + act + '"]')] : [])
        .concat(scr ? [...scr.querySelectorAll('[data-do="' + act + '"]')] : []);
      return any.length ? { disabled: true } : { gone: true };
    }

    /* ---------- QUIET MEANS EVERY CONTROL THAT CARRIES IT IS QUIET § */
    let el = cands[0], where = '', changed = false;
    for (let i = 0; i < Math.min(cands.length, 4) && !changed; i++) {
      el = cands[i];
      where = el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '');
      const was = stateOf(sid);

      /* THE WAY THE APP ITSELF IS PRESSED. § */
      if (el.tagName === 'SELECT') {
        const opts = [...el.options].filter(o => !o.disabled);
        /* AN ANSWER, NOT THE BLANK. § */
        const next = opts.find(o => o.value !== el.value && o.value !== '') || opts.find(o => o.value !== el.value);
        if (next) { el.value = next.value; el.dispatchEvent(new Event('change', { bubbles: true })); }
      } else if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = !el.checked;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
      await new Promise(r => setTimeout(r, 130));
      changed = was !== stateOf(sid);
      /* A PRESS IS ALLOWED TO REMOVE ITS OWN CONTROL, so the next candidate may be a stale handle.
         One that is no longer in the document is not a control anybody can press. */
      if (!changed && cands[i + 1] && !document.contains(cands[i + 1])) break;
    }
    /* OUT OF FULL SCREEN AGAIN, the way the print stub dismisses its dialogue: the next press is about
       the page, and a page with a player filling the glass is not the page anybody presses next. */
    if (document.fullscreenElement && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch (e) { /* measured as it stands */ }
    }

    const sh = document.getElementById('sheet');
    const sheetOpen = !!(sh && !sh.classList.contains('hidden'));
    /* WHAT THE PRESS PUT IN FRONT OF SOMEBODY. § */
    /* `#drop`'S ACTIONS WERE JOINED TO THESE while the booking form's list of answers was a panel
       outside the screens. It is checkboxes in the card now (note 315), so they are `onScreen`. */
    const inSheet = sheetOpen ? [...sh.querySelectorAll('[data-do]')].map(e => e.dataset.do) : [];
    const s2 = document.getElementById('s-' + sid);
    const onScreen = s2 ? [...new Set([...s2.querySelectorAll('[data-do]')].map(e => e.dataset.do))] : [];
    return { where, changed, sheetOpen, inSheet: [...new Set(inSheet)], onScreen, alive: aliveIn(sid) };
  }, { sid, act });

  /* ---------- A CLEAN PAGE, WHICH IS THE ONLY HONEST WAY TO SAY "NOT THERE" § */
  const freshen = async (sid, state) => {
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1700);
    await appIn_(page);
    await page.evaluate(s => { try { go(s, false, true); } catch (e) {} }, sid);
    await page.waitForTimeout(400);
    /* BACK INTO THE STATE, not into the screen's front door. § */
    if (state && state.enter) {
      await page.evaluate(src => { try { eval('(' + src + ')')(); } catch (e) {} }, String(state.enter));
      await page.waitForTimeout(400);
    }
  };

  for (const id of screens) {
  /* ---------- A COLUMN THIS VISITOR IS NOT GIVEN HAS NOTHING OF THEIRS TO PRESS § */
  const given = await page.evaluate(sid => { try { if (typeof columnsFor_ === 'function') columnsFor_(); return TABS.some(t => t.id === sid); } catch (e) { return true; } }, id);
  if (!given) { console.log('  ' + id + (who.user ? '' : ', signed out') + ': not a column this visitor is given — nothing pressed'); continue; }
  /* ---------- ONE PASS PER DECLARED STATE § */
  const done = new Set();          /* per SCREEN, not per state: one press per action is the point */
  const missed = new Set();        /* named on this screen and not found — retried by every later state */
  for (const state of statesOf(id)) {
    const label = (state.name ? id + ' · ' + state.name : id) + (who.user ? '' : ', signed out');
    await page.evaluate(sid => { try { closeSheet(); } catch (e) {} go(sid, false, true); }, id);
    await page.waitForTimeout(300);

    /* WHOSE STATE IS THIS. § */
    if (state.only) {
      const mine = await page.evaluate(src => { try { return !!eval('(' + src + ')')(); } catch (e) { return false; } }, String(state.only));
      if (!mine) continue;
    }
    if (state.enter) {
      const ok = await page.evaluate(src => { try { eval('(' + src + ')')(); return true; }
                                             catch (e) { return String(e && e.message || e); } }, String(state.enter));
      if (ok !== true) { console.error('! could not enter ' + label + ': ' + ok); notEntered++; continue; }
      await page.waitForTimeout(340);
    }
    /* AND A STATE THAT DID NOT ARRIVE FAILS LOUDLY, for the reason `check/ui.js` gives: a state
       silently not reached is "I did not press it" printed as "I pressed it and it was fine". */
    /* ASKED AGAIN FOR UP TO 2.5s, NOT ONCE. § */
    if (state.expect) {
      const got = await page.evaluate(async src => {
        const t0 = performance.now();
        for (;;) {
          let ok = false;
          try { ok = !!eval('(' + src + ')')(); } catch (e) {}
          if (ok || performance.now() - t0 > 2500) return ok;
          await new Promise(r => setTimeout(r, 100));
        }
      }, String(state.expect));
      if (!got) { console.error('! ' + label + ' did not arrive — wanted ' + (state.wants || 'the state to be on screen')); notEntered++; continue; }
    }

    /* THE QUEUE, BY NAME rather than by element. § */
    /* ---------- AND FROM THE SHEET, IF THIS STATE OPENED ONE § */
    /* ---------- AND EVERY WIDGET ON IT STARTED BEFORE THE QUEUE IS READ § */
    await page.evaluate(async () => {
      const t0 = performance.now();
      /* AND THE BUILDER (`aheadBusy_`, docs/history/341), which draws stale columns and widget slots in the
         quiet: a widget it is drawing is drawing that could still be going on under a press. */
      const busy = () => (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length > 0)
        || (typeof AFTER_SLIDE_JOBS !== 'undefined' && AFTER_SLIDE_JOBS.size > 0)
        || (typeof AFTER_SLIDE !== 'undefined' && !!AFTER_SLIDE)
        || (typeof aheadBusy_ === 'function' && aheadBusy_());
      while (busy() && performance.now() - t0 < 6000) await new Promise(r => setTimeout(r, 50));
    });
    const queue = await page.evaluate(sid => {
      const scr = document.getElementById('s-' + sid);
      const seen = new Set();
      if (scr) scr.querySelectorAll('[data-do]').forEach(e => seen.add(e.dataset.do));
      const sh = document.getElementById('sheet');
      if (sh && !sh.classList.contains('hidden')) {
        sh.querySelectorAll('[data-do]').forEach(e => seen.add(e.dataset.do));
      }
      return [...seen];
    }, id);
    const seeded = new Set(queue);

    while (queue.length) {
      const act = queue.shift();
      if (done.has(act)) continue;
      done.add(act);

      const before = raw.length;
      let out = await pressOne(id, act);
      /* A RELOAD ONLY FOR SOMETHING THIS STATE ACTUALLY HAD. § */
      if (out.gone && seeded.has(act)) { await freshen(id, state); out = await pressOne(id, act); }
      if (out.disabled) { results.push({ screen: label, action: act, disabled: true }); continue; }
      /* NOT MARKED DONE WHEN IT WAS NOT THERE. § */
      if (out.gone) { missed.add(act); done.delete(act); continue; }
      missed.delete(act);

      pressed++;
      results.push({ screen: label, action: act, where: out.where, changed: out.changed,
                     errs: raw.slice(before), alive: out.alive });

      /* THE SHEET IS PRESSED NOW, WHILE IT IS OPEN. § */
      if (out.sheetOpen) {
        for (const inner of out.inSheet) {
          if (done.has(inner)) continue;
          done.add(inner);
          const b2 = raw.length;
          const o2 = await pressOne(id, inner);
          if (o2.disabled) { results.push({ screen: label, action: inner, disabled: true }); continue; }
          if (o2.gone) { missed.add(inner); done.delete(inner); continue; }
          missed.delete(inner);
          pressed++;
          results.push({ screen: label, action: inner, where: o2.where + ' (in the sheet)',
                         changed: o2.changed, errs: raw.slice(b2), alive: o2.alive });
          const stillOpen = await page.evaluate(() => {
            const sh = document.getElementById('sheet');
            return !!(sh && !sh.classList.contains('hidden'));
          });
          if (!stillOpen) break;      /* the press closed it; the rest of its actions are gone */
        }
      }

      out.onScreen.forEach(a => { if (!done.has(a)) queue.push(a); });

      /* BACK TO THE SCREEN, because a press is allowed to navigate and the next one has to be asked of the screen it belongs to. § */
      await page.evaluate(sid => {
        try { if (typeof closeSheet === 'function') closeSheet(); } catch (e) {}
        try { if (typeof AT !== 'undefined' && AT !== sid) go(sid, false, true); } catch (e) {}
      }, id);
      await page.waitForTimeout(40);
    }

    /* WHATEVER THE STATE LEFT STANDING. States run in order down one page and `go()` does not close
       a sheet, so an open guide would otherwise be pressed again under Tools and Games. */
    if (state.leave) await page.evaluate(src => { try { eval('(' + src + ')')(); } catch (e) {} }, String(state.leave));
  }
  missed.forEach(a => results.push({ screen: id + (who.user ? '' : ', signed out'), action: a, unreachable: true }));
  }

  await page.close();
}

  /* AND THE OTHER THING A FINGER DOES. § */
  const swipes = [];
  const drops = [];
  if (!process.argv.includes('--no-swipe')) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on('pageerror', e => raw.push('window: ' + String(e.message).slice(0, 140)));
    await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, VISITORS[0].user);
    await page.addInitScript(GUARDS);
    await page.route('**://script.google.com/**', r =>
      r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2200);
    /* ---------- AND THE ROW IS READ ONCE THE PAYLOAD HAS LANDED, NOT AFTER A FIXED WAIT § */
    await page.waitForFunction(() => { try { return LOADED === true; } catch (e) { return false; } }, null, { timeout: 30000 });
    await page.waitForTimeout(300);

    const drag = async (x0, y0, dx, dy) => {
      await page.mouse.move(x0, y0);
      await page.mouse.down();
      for (let i = 1; i <= 10; i++) { await page.mouse.move(x0 + dx * i / 10, y0 + dy * i / 10); await page.waitForTimeout(9); }
      await page.mouse.up();
      await page.waitForTimeout(400);
    };

    /* ---------- BARE CARD MEANS NOT A SELECT § */
    const bare = (x, y) => page.evaluate(([x, y]) => {
      for (const dy of [0, 24, -24, 48, -48, 72, -72, 96, -96]) {
        const el = document.elementFromPoint(x, y + dy);
        if (!el || !el.closest('select')) return y + dy;
      }
      return y;
    }, [x, y]);
    const tabs = await page.evaluate(() => (typeof TABS !== 'undefined' ? TABS.map(t => t.id) : []));
    /* ---------- THE NEIGHBOURS ARE ASKED AT THE SWIPE, NOT AT THE START § */
    for (let i = 0; i < tabs.length; i++) {
      const live = await page.evaluate(() => (typeof TABS !== 'undefined' ? TABS.map(t => t.id) : []));
      const at = live.indexOf(tabs[i]);
      if (at < 0) continue;
      for (const [dir, x, dx, want] of [['left', 320, -230, live[Math.min(at + 1, live.length - 1)]],
                                        ['right', 70, 230, live[Math.max(at - 1, 0)]]]) {
        await page.evaluate(id => go(id, false, true), tabs[i]);
        await page.waitForTimeout(240);
        await drag(x, await bare(x, 420), dx, 0);
        const got = await page.evaluate(() => AT);
        swipes.push({ from: tabs[i], dir, got, want, ok: got === want });
      }
    }
    for (const id of tabs) {
      const n = await page.evaluate(x => { go(x, false, true); return typeof pageCount === 'function' ? pageCount(x) : 0; }, id);
      await page.waitForTimeout(280);
      /* A ONE-PAGE COLUMN HAS NO UP AND DOWN, and asking it for one would report the app for
         answering correctly. Which columns have more than one page depends on the fixture. */
      if (n < 2) continue;
      await page.evaluate(x => goPage(x, 0, true), id);
      await page.waitForTimeout(260);
      await drag(195, await bare(195, 600), 0, -260);
      const up = await page.evaluate(x => PAGE[x], id);
      swipes.push({ from: id, dir: 'up', got: String(up), want: '1', ok: up === 1 });
      await drag(195, await bare(195, 300), 0, 260);
      const down = await page.evaluate(x => PAGE[x], id);
      swipes.push({ from: id, dir: 'down', got: String(down), want: '0', ok: down === 0 });
    }

    /* AND A SWIPE THAT STARTS ON A CONTROL MUST NOT PRESS IT. § */
    for (const id of tabs) {
      const n = await page.evaluate(x => { go(x, false, true); return typeof pageCount === 'function' ? pageCount(x) : 0; }, id);
      await page.waitForTimeout(280);
      if (n < 2) continue;
      await page.evaluate(x => goPage(x, 0, true), id);
      await page.waitForTimeout(260);
      /* THE NEAREST CONTROL TO THE MIDDLE OF THE SCREEN, because that is where a thumb lands. § */
      const findSpot = () => page.evaluate(x => {
        const host = document.getElementById('s-' + x);
        if (!host) return null;
        let best = null;
        host.querySelectorAll('[data-do]').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width < 24 || r.height < 16 || r.top < 120 || r.bottom > 760) return;
          const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
          /* ---------- AND SOMETHING HAS TO BE THERE WHEN A REAL FINGER ARRIVES § */
          const hit = document.elementFromPoint(cx, cy);
          if (!hit || !el.contains(hit)) return;
          const d = Math.abs(cy - 440);
          if (!best || d < best.d) best = { d: d, x: cx, y: cy,
                                            act: el.getAttribute('data-do') };
        });
        return best;
      }, id);
      const spot = await findSpot();
      if (!spot) continue;
      const was = await page.evaluate(x => ({
        page: PAGE[x] || 0,
        chips: (typeof STUFF !== 'undefined' && STUFF && STUFF.filters)
          ? STUFF.filters.map(f => f.field + '=' + f.value).join(',') : '',
      }), id);
      await drag(spot.x, spot.y, 0, -300);
      const now = await page.evaluate(x => ({
        page: PAGE[x] || 0,
        chips: (typeof STUFF !== 'undefined' && STUFF && STUFF.filters)
          ? STUFF.filters.map(f => f.field + '=' + f.value).join(',') : '',
      }), id);
      const turned = now.page - was.page;
      swipes.push({ from: id + ' from [' + spot.act + ']', dir: 'up',
                    got: 'turned ' + turned + ' page(s)' + (now.chips === was.chips ? '' : ', and answered a question'),
                    want: 'turned 1 page(s)',
                    ok: turned === 1 && now.chips === was.chips });

      /* AND THE THING YOU PRESSED HAS TO LIGHT UP WHILE THE SCREEN IS THINKING. § */
      const stray = await page.evaluate(() => document.querySelectorAll('.is-pressed').length);
      swipes.push({ from: id + ' after a drag from [' + spot.act + ']', dir: 'press mark',
                    got: stray + ' left lit', want: '0 left lit', ok: stray === 0 });

      const now2 = await findSpot();
      if (now2) {
        await page.mouse.move(now2.x, now2.y);
        await page.mouse.down();
        await page.waitForTimeout(40);
        const lit = await page.evaluate(() => {
          const el = document.querySelector('.is-pressed');
          return el ? (el.getAttribute('data-do') || el.className) : '';
        });
        await page.mouse.up();
        await page.waitForTimeout(350);
        const after = await page.evaluate(() => document.querySelectorAll('.is-pressed').length);
        swipes.push({ from: id + ' pressing [' + now2.act + ']', dir: 'press mark',
                      got: (lit ? 'lit ' + lit : 'nothing lit') + ', ' + after + ' still lit after',
                      want: 'lit ' + now2.act + ', 0 still lit after',
                      ok: lit === now2.act && after === 0 });
        await page.waitForTimeout(120);
      }
    }

    /* AND A MOUSE IGNORES `touch-action`, WHICH IS WHY EVERY SWIPE ABOVE WAS GREEN OVER A REAL FAULT. § */
    const held = [];
    const cdp = await page.context().newCDPSession(page);
    const touch = async (x, y, dx, dy) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let i = 1; i <= 10; i++) {
        await cdp.send('Input.dispatchTouchEvent',
          { type: 'touchMove', touchPoints: [{ x: x + dx * i / 10, y: y + dy * i / 10 }] });
        await page.waitForTimeout(12);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(520);
    };
    /* `.ws` AND `.ss-chips` ARE NOT KEEPERS — THEY ARE HERE TO PROVE THEY ARE NOT. § */
    const KEEPERS = 'textarea, .msg-body, #docket-body, .feed-text, .widget-squeeze, .ws, .ss-chips';
    for (const id of tabs) {
      await page.evaluate(x => go(x, false, true), id);
      await page.waitForTimeout(420);
      const n = await page.evaluate(x => (typeof pageCount === 'function' ? pageCount(x) : 0), id);
      for (let i = 0; i < n; i++) {
        /* `go` AS WELL AS `goPage`, EVERY PAGE. § */
        await page.evaluate(a => { go(a.id, false, true); goPage(a.id, a.i, true); }, { id, i });
        await page.waitForTimeout(460);
        const spots = await page.evaluate(a => {
          const pane = [...document.querySelectorAll('#s-' + a.id + ' .pane')][a.i];
          if (!pane) return [];
          return [...pane.querySelectorAll(a.sel)].map(el => {
            const r = el.getBoundingClientRect();
            if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) return null;
            if (r.width < 40 || r.height < 24) return null;
            /* NOT ON A DROPDOWN. A `<select>` (and anything marked `data-noswipe`) keeps the gesture on purpose — `axisFree` says so — so a swipe that happens to START on § */
            let x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
            /* AND PREFERABLY ON THE BOX ITSELF rather than on a control inside it: § */
            let fallback = null;
            for (let f = 0.5, k = 0; k < 18; k++, f = 0.5 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.05) {
              const yy = Math.round(r.top + r.height * f);
              const hit = document.elementFromPoint(x, yy);
              if (!hit || hit.closest('select, [data-noswipe]')) continue;
              if (hit === el) { fallback = null; y = yy; break; }
              if (fallback === null) fallback = yy;
            }
            if (fallback !== null) y = fallback;
            return { x, y,
                     what: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '.' + String(el.className || '').split(' ')[0]),
                     scrollsY: el.scrollHeight > el.clientHeight + 6 };
          }).filter(Boolean);
        }, { id, i, sel: KEEPERS });
        for (const sp of spots) {
          const where = id + ' p' + i + ' ' + sp.what;
          /* THE VERTICAL, ONLY WHERE THERE IS NOTHING TO SCROLL. */
          if (!sp.scrollsY && i + 1 < n) {
            await page.evaluate(a => goPage(a.id, a.i, true), { id, i });
            await page.waitForTimeout(380);
            await touch(sp.x, sp.y, 0, -180);
            const got = await page.evaluate(x => PAGE[x], id);
            held.push({ where, dir: 'up', ok: got === i + 1, got: 'page ' + got, want: 'page ' + (i + 1) });
          }
          /* AND THE SIDEWAYS, ALWAYS: none of these scrolls sideways, so none may keep it. */
          const k = tabs.indexOf(id);
          if (k + 1 < tabs.length) {
            await page.evaluate(a => { go(a.id, false, true); goPage(a.id, a.i, true); }, { id, i });
            await page.waitForTimeout(460);
            await touch(sp.x, sp.y, -170, 0);
            const got = await page.evaluate(() => AT);
            held.push({ where, dir: 'left', ok: got === tabs[k + 1], got: got, want: tabs[k + 1] });
          }
        }
      }
    }
    swipes.push(...held.map(h => ({ from: h.where, dir: 'touch ' + h.dir, got: h.got, want: h.want, ok: h.ok })));

    /* A SECOND FLICK WHILE THE FIRST IS STILL SETTLING GOES THE WAY THE FINGER WENT § */
    /* A REAL FLICK, sent the way a phone sends one: § */
    const flick = async (x, y, dy) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      const t0 = Date.now(), dur = 80;
      for (;;) {
        const tn = Math.min(1, (Date.now() - t0) / dur);
        cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + dy * tn * tn }] }).catch(() => {});
        if (tn >= 1) break;
        await page.waitForTimeout(8);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    const chainCol = tabs.indexOf('games') !== -1 ? 'games' : null;
    if (chainCol) {
      /* A SHORT SECOND FLICK, because that is where the fault bites: § */
      for (const [gap, second] of [[20, -40], [40, -40], [40, 40], [400, -40]]) {
        await page.evaluate(c => { go(c, false, true); goPage(c, 1, true); }, chainCol);
        await page.waitForTimeout(700);
        const spot = await page.evaluate(() => {
          for (const fy of [0.65, 0.55, 0.75, 0.45]) for (const fx of [0.5, 0.3, 0.7]) {
            const x = Math.round(innerWidth * fx), y = Math.round(innerHeight * fy);
            const el = document.elementFromPoint(x, y);
            if (el && axisFree(el, 'y', -1) && axisFree(el, 'y', 1) && !el.closest('[data-do], select')) return [x, y];
          }
          return null;
        });
        const where = chainCol + ' p1 flick up, ' + gap + 'ms, ' + Math.abs(second) + 'px flick ' + (second < 0 ? 'up' : 'down');
        if (!spot) { swipes.push({ from: where, dir: 'chain', got: 'no spot the grid takes', want: 'a spot', ok: false }); continue; }
        await flick(spot[0], spot[1], -90);
        await page.waitForTimeout(gap);
        await flick(spot[0], spot[1], second);
        await page.waitForTimeout(900);
        const got = await page.evaluate(c => PAGE[c], chainCol);
        const want = second < 0 ? 3 : 1;
        swipes.push({ from: where, dir: 'chain', got: 'page ' + got, want: 'page ' + want, ok: got === want });
      }
    }

    /* A TALL QUESTION CARD IS READ BY SWIPING AND LEFT BY SWIPING, WHICH IS TWO CLAIMS § */
    /* ON THE NARROW PHONE. § */
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(400);
    const tall = await page.evaluate(async () => {
      if (typeof stuffItems !== 'function') return null;
      go('stuff', false, true);
      /* A CARD THAT IS STILL TALL, FOUND RATHER THAN NAMED. § */
      const facet = FACETS.find(f => f.field === 'paperId');
      if (!facet) return null;
      /* WHAT MAKES A PAGE TALL HERE IS OPTIONS, NOT WORDS. § */
      const plain = h => String(h || '').replace(/<[^>]*>/g, '').replace(/&[#a-z0-9]+;/gi, ' ').length;
      const opts = r => String(r.choices || '').split(' | ').filter(Boolean).length;
      const ranked = stuffItemsAll_().filter(x => x.row && x.row.html && x.row.kind !== 'preamble' && x.row.kind !== 'document')
        .sort((a, b) => (opts(b.row) - opts(a.row)) || (plain(b.row.html + b.row.choices) - plain(a.row.html + a.row.choices))).slice(0, 6);
      let best = null;
      for (const want of ranked) {
        STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: facet.of(want) }];
        paintStuff(true);
        await new Promise(r => setTimeout(r, 400));
        const items = stuffFiltered();
        const i = items.findIndex(x => x.row && x.row.row_id === want.row.row_id);
        if (i < 0) continue;
        const at = stuffPageOf_(items[i]) + stuffFirstResult_();
        best = null;
        for (let p = at; p < at + 4; p++) {
          goPage('stuff', p, true);
          await new Promise(r => setTimeout(r, 400));
          const pane = [...document.querySelectorAll('#s-stuff > .page')][domIndex_('stuff', PAGE.stuff || 0)]
            .querySelector('.pane');
          const room = pane ? pane.scrollHeight - pane.clientHeight : 0;
          if (!best || room > best.room) best = { page: PAGE.stuff, room, id: want.row.row_id };
        }
        if (best.room >= 120) break;
      }
      if (!best) return null;
      goPage('stuff', best.page, true);
      await new Promise(r => setTimeout(r, 600));
      return best;
    });
    if (!tall || tall.room < 60) {      // enough for one swipe to scroll it and stay on the page
      /* A CHECK THAT CANNOT REACH ITS SUBJECT MUST SAY SO. If that row ever stops being tall this
         has to read as "not measured" rather than as a pass. */
      swipes.push({ from: 'stuff · a tall question card', dir: 'touch up', ok: false,
                    got: tall ? tall.room + 'px of room' : 'the card was not found',
                    want: 'a card with something to scroll' });
    } else {
      await page.waitForTimeout(300);
      await touch(160, 420, 0, -220);
      const mid = await page.evaluate(() => {
        const pane = [...document.querySelectorAll('#s-stuff > .page')][domIndex_('stuff', PAGE.stuff || 0)]
          .querySelector('.pane');
        return { page: PAGE.stuff, top: Math.round(pane.scrollTop) };
      });
      swipes.push({ from: 'stuff · a tall question card', dir: 'touch up', ok: mid.page === tall.page && mid.top > 40,
                    got: 'page ' + mid.page + ', scrolled ' + mid.top + 'px',
                    want: 'page ' + tall.page + ', scrolled' });
      await page.evaluate(() => {
        const pane = [...document.querySelectorAll('#s-stuff > .page')][domIndex_('stuff', PAGE.stuff || 0)]
          .querySelector('.pane');
        pane.scrollTop = pane.scrollHeight;
      });
      await page.waitForTimeout(200);
      await touch(160, 420, 0, -220);
      const end = await page.evaluate(() => PAGE.stuff);
      swipes.push({ from: 'stuff · a tall question card, at its bottom', dir: 'touch up',
                    ok: end === tall.page + 1, got: 'page ' + end, want: 'page ' + (tall.page + 1) });
    }

    /* A GRID TAPPED AFTER SCROLLING IT OPENS THE NEXT QUESTION AT THE TOP, NOT WHERE THE FINGER WAS § */
    {
      /* ON THE RESOURCES COLUMN, where the Bible is (docs/history/329): its state set in that finder's
         binding (`inFinder_`), its question under the column's own ids. */
      const where = 'res · Psalms\'s chapter grid, 119 tapped after scrolling to it (320 x 568)';
      const grid = await page.evaluate(async () => {
        if (typeof bibleFor_ !== 'function' || !bibleFor_()) return { why: 'the visitor is not an admin' };
        for (let i = 0; i < 40 && !BIBLE.index; i++) await new Promise(r => setTimeout(r, 50));
        if (!BIBLE.index) return { why: 'the Bible\'s index never arrived' };
        go('res', false, true);
        inFinder_(finderOf_('res'), () => {
          STUFF.q = '';
          STUFF.filters = [{ field: 'shelf', value: 'Books' }, { field: 'bibleTranslation', value: 'KJV' },
                           { field: 'bibleTestament', value: 'Old Testament' }, { field: 'bibleGroup', value: 'Poetry & Wisdom' },
                           { field: 'bibleBook', value: 'Psalms' }];
          paintStuff();
          goPage('res', stuffQuestionPage_(), true);
        });
        /* `paneReach_` IS BOOKED AFTER THE PAINT, so the pane is measured, zoomed and given its scroll
           a moment later, as on a phone. */
        await new Promise(r => setTimeout(r, 700));
        const pane = $('res-controls').closest('.pane');
        const cell = document.querySelector('#res-groups .answers.is-grid [data-do="facet-pick"][data-field="bibleChapter"][data-value="119"]');
        if (!pane || !cell) return { why: 'no Psalms chapter grid with a 119 in it' };
        const pr = pane.getBoundingClientRect();
        pane.scrollTop += cell.getBoundingClientRect().top - pr.top - pr.height / 2;
        await new Promise(r => setTimeout(r, 120));
        const cr = cell.getBoundingClientRect();
        const x = Math.round(cr.left + cr.width / 2), y = Math.round(cr.top + cr.height / 2);
        const hit = document.elementFromPoint(x, y);
        const on = hit && hit.closest('[data-do="facet-pick"]');
        return { top: Math.round(pane.scrollTop), x, y, aimed: !!on && on.dataset.value === '119' };
      });
      if (!grid || grid.why || !grid.top || !grid.aimed) {
        swipes.push({ from: where, dir: 'tap', ok: false,
                      got: grid && grid.why ? grid.why : !grid ? 'nothing came back'
                         : !grid.top ? 'the grid fits its pane, so there was no scroll to test'
                         : 'the finger would not land on 119',
                      want: 'the grid scrolled to 119 and a finger on it' });
      } else {
        await touch(grid.x, grid.y, 0, 0);
        const after = await page.evaluate(() => {
          const pane = $('res-controls').closest('.pane');
          const st = finderOf_('res').st;
          const f = st.filters[st.filters.length - 1] || {};
          const pr = pane.getBoundingClientRect(), chips = $('res-chips').getBoundingClientRect();
          return { chose: f.field + ' ' + f.value, top: Math.round(pane.scrollTop),
                   chips: chips.bottom > pr.top && chips.bottom <= pr.bottom + 1,
                   /* `facet-pick`S, because "Doesn't matter" carries the field too (note 292). */
                   verses: document.querySelectorAll('#res-groups .answers.is-grid [data-do="facet-pick"][data-field="bibleVerse"]').length };
        });
        swipes.push({ from: where, dir: 'tap',
                      ok: after.chose === 'bibleChapter 119' && after.verses === 176 && after.top === 0 && after.chips,
                      got: after.chose + ', ' + after.verses + ' verse cells, the pane ' + after.top + 'px down'
                           + (after.chips ? '' : ', the chips out of sight'),
                      want: 'bibleChapter 119, 176 verse cells, the pane at its top with the chips in sight' });
      }
      await page.evaluate(() => inFinder_(finderOf_('res'), () => { STUFF.q = ''; STUFF.filters = []; paintStuff(); goPage('res', 0, true); }));
      await page.waitForTimeout(300);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);

    /* AND A LINE OF BEST FIT IS A SIDEWAYS DRAG ON A PAGE THAT SLIDES SIDEWAYS. § */
    {
      const PEN_PAPER = 'RS1786302107764-481';         // May 2017 Foundation, Q6(i): annotate a scale
      const PEN_ROW = 'Q-1MA1-1706-1F-6i';
      /* ---------- ITS CARD, AND THE SCALE THROUGH THE CARD'S OWN `Draw`, TOUCHED § */
      const draw = await page.evaluate(async a => {
        if (typeof stuffFiltered !== 'function') return null;
        go('stuff', false, true);
        STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: a.paper }];
        paintStuff(true);
        await new Promise(r => setTimeout(r, 500));
        const hit = stuffFiltered().find(x => x.row && x.row.row_id === a.row);
        if (!hit) return null;
        goPage('stuff', stuffPageOf_(hit) + stuffFirstResult_(), true);
        window.__penSel = '#s-stuff .qcard .qpad[data-k="' + padKey_(hit) + '"]';
        window.__penKey = hit.key;
        await new Promise(r => setTimeout(r, 650));
        return document.querySelector(window.__penSel) ? { on: true } : null;
      }, { paper: PEN_PAPER, row: PEN_ROW });
      /* THE PICTURE'S INK, AND A PLACE ON THE SAME CARD OFF IT (the small print under the bar), where a swipe starts. */
      const measure = () => page.evaluate(() => {
        const pad = document.querySelector(window.__penSel);
        const ink = pad && pad.querySelector('.qpad-ink'), note = pad && pad.querySelector('.qpad-note');
        if (!ink || !note) return null;
        const r = ink.getBoundingClientRect(), n = note.getBoundingClientRect();
        return { at: AT, page: PAGE.stuff, lock: !!pad.querySelector('.qpad-lock, [data-do="pad-draw"]'),
                 ink: { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) },
                 off: { x: Math.round(n.left + Math.min(n.width, 200) / 2), y: Math.round(n.top + n.height / 2) } };
      });
      const box = !draw ? null : await measure();
      if (!box || box.ink.w < 80) {
        swipes.push({ from: 'stuff · the pen on a diagram', dir: 'touch across', ok: false,
                      got: box ? 'the pad was ' + box.ink.w + 'px wide' : (draw ? 'no pen with its small print on that card' : 'no card'),
                      want: 'a question card with its figure under the pen' });
      } else {
        swipes.push({ from: 'stuff · the pen on a diagram', dir: 'look', ok: !box.lock,
                      got: box.lock ? 'a lock tile is still drawn' : 'no lock', want: 'no lock: the first touch draws (368)' });
        /* THE FIRST TOUCH DRAWS (368): a line of best fit dragged across the figure, nothing pressed first, inks and keeps the column. Scaled to the pad. */
        await touch(box.ink.x - Math.round(box.ink.w * 0.35), box.ink.y + Math.round(box.ink.h * 0.3),
                    Math.round(box.ink.w * 0.7), -Math.round(box.ink.h * 0.6));
        const drew = await page.evaluate(() => {
          const pad = document.querySelector(window.__penSel);
          const k = pad && pad.getAttribute('data-k');
          let n = 0;
          try { n = (JSON.parse(localStorage.getItem(k) || '[]') || []).length; } catch (e) {}
          return { at: AT, page: PAGE.stuff, strokes: n };
        });
        swipes.push({ from: 'stuff · a line of best fit, the first touch', dir: 'touch across',
                      ok: drew.at === box.at && drew.page === box.page && drew.strokes >= 1,
                      got: drew.at + ' page ' + drew.page + ', ' + drew.strokes + ' stroke(s) kept',
                      want: box.at + ' page ' + box.page + ', 1 stroke(s) kept' });
        /* AND A SWIPE THAT STARTS OFF THE FIGURE, on the same card, still moves the column. */
        const k = tabs.indexOf('stuff');
        if (k + 1 < tabs.length) {
          const b2 = (await measure()) || box;
          await touch(b2.off.x + 60, b2.off.y, -170, 0);
          const off = await page.evaluate(() => AT);
          swipes.push({ from: 'stuff · the same card, off the figure', dir: 'touch left',
                        ok: off === tabs[k + 1], got: off, want: tabs[k + 1] });
        }
      }
      /* THE CARD BACK ON ITS BOX FOR WHATEVER IS PRESSED NEXT, and nothing of this one left on the device. */
      await page.evaluate(() => { go('stuff', false, true); });
    }

    /* AND THE WHITEBOARD, A MATHS NOTEBOOK (377): a swipe on its page is the grid's, a drag on its pad is writing. */
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
      const tp = await ctx.newPage();
      tp.on('pageerror', e => raw.push('window: ' + String(e.message).slice(0, 140)));
      await tp.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, VISITORS[0].user);
      await tp.addInitScript(GUARDS);
      await tp.route('**://script.google.com/**', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
      await tp.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
      await tp.waitForTimeout(2200);
      const tc = await ctx.newCDPSession(tp);
      const tt = async (x, y, dx, dy) => {
        await tc.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let i = 1; i <= 10; i++) {
          await tc.send('Input.dispatchTouchEvent',
            { type: 'touchMove', touchPoints: [{ x: x + dx * i / 10, y: y + dy * i / 10 }] });
          await tp.waitForTimeout(12);
        }
        await tc.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await tp.waitForTimeout(520);
      };
      const tap = async (x, y) => {
        await tc.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await tc.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await tp.waitForTimeout(420);
      };
      /* EVERYTHING READ AT ONCE, from the app's own state: where the notebook's page and pad are, and what is stored (377). */
      const wbAt = turn => tp.evaluate(async go_ => {
        if (go_) {
          if (AT !== 'tools') go('tools', false, true);
          goPage('tools', widgetsOf_('tool').findIndex(w => String(w.id) === 'whiteboard'), true);
          for (let i = 0; i < 80; i++) {
            const busy = (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length)
              || (typeof AFTER_SLIDE !== 'undefined' && AFTER_SLIDE)
              || (typeof SETTLE_ON !== 'undefined' && SETTLE_ON && performance.now() < SETTLE_ON.until)
              || (typeof aheadBusy_ === 'function' && aheadBusy_());
            if (!busy && i >= 4) break;
            await new Promise(r => setTimeout(r, 100));
          }
        }
        const nb = document.querySelector('#s-tools #wgt-whiteboard .nb');
        if (!nb) return null;
        const k = nb.getAttribute('data-k');
        let n = 0;
        try { n = (JSON.parse(localStorage.getItem(k) || '[]') || []).length; } catch (e) {}
        const c = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) }; };
        return { at: AT, page: PAGE.tools, k, strokes: n, book: c(nb.querySelector('.nb-book')), pad: c(nb.querySelector('.nb-pad')),
                 next: TABS.map(t => t.id)[TABS.map(t => t.id).indexOf('tools') + 1] };
      }, !!turn);
      let b = await wbAt(true);
      const W_ = 'tools · the whiteboard';
      if (!b || b.pad.w < 120 || b.pad.h < 150 || b.book.h < 120) {
        swipes.push({ from: W_, dir: 'touch', ok: false, got: b ? 'a pad ' + b.pad.w + 'x' + b.pad.h + 'px under a page ' + b.book.w + 'x' + b.book.h + 'px' : 'no board on the Tools column',
                      want: 'a pad at least 120x150px to write in, under a page at least 120px tall' });
      } else {
        /* A BLANK BOARD, whatever an earlier press left on it. */
        await tp.evaluate(k => { try { ansStore_(k, null); } catch (e) {} NB_STATE.delete(k); initBoard_(); }, b.k);
        const fresh = () => wbAt(true);
        /* ON THE PAGE, SIDEWAYS: the column moves -- the page is read, and a swipe that starts on it is the grid's. */
        b = await fresh();
        await tt(b.book.x + Math.round(b.book.w * 0.35), b.book.y, -Math.round(b.book.w * 0.7), 0);
        let a = await tp.evaluate(() => AT);
        swipes.push({ from: W_ + ', its page', dir: 'touch left', ok: a === b.next, got: a, want: b.next });
        /* ON THE PAGE, DOWN: the page turns back one -- the board is the last page, so up has nowhere to go. */
        b = await fresh();
        await tt(b.book.x, b.book.y - Math.round(b.book.h * 0.3), 0, Math.round(b.book.h * 0.6));
        a = await wbAt(false);
        swipes.push({ from: W_ + ', its page', dir: 'touch down', ok: a.at === 'tools' && a.page === b.page - 1 && a.strokes === 0,
                      got: a.at + ' page ' + a.page + ', ' + a.strokes + ' stroke(s)', want: 'tools page ' + (b.page - 1) + ', 0 stroke(s)' });
        /* ON THE PAD, ACROSS AND DOWN: writing, and the column holds. */
        b = await fresh();
        await tt(b.pad.x - Math.round(b.pad.w * 0.35), b.pad.y, Math.round(b.pad.w * 0.7), 0);
        a = await wbAt(false);
        swipes.push({ from: W_ + ', its pad', dir: 'touch across', ok: a.at === 'tools' && a.page === b.page && a.strokes === 1,
                      got: a.at + ' page ' + a.page + ', ' + a.strokes + ' stroke(s) kept', want: 'tools page ' + b.page + ', 1 stroke(s) kept' });
        await tt(b.pad.x + Math.round(b.pad.w * 0.3), b.pad.y - Math.round(b.pad.h * 0.3), 0, Math.round(b.pad.h * 0.6));
        a = await wbAt(false);
        swipes.push({ from: W_ + ', its pad', dir: 'touch down', ok: a.at === 'tools' && a.page === b.page && a.strokes === 2,
                      got: a.at + ' page ' + a.page + ', ' + a.strokes + ' stroke(s) kept', want: 'tools page ' + b.page + ', 2 stroke(s) kept' });
        await tp.evaluate(k => { try { ansStore_(k, null); } catch (e) {} NB_STATE.delete(k); }, b.k);
      }
      await ctx.close();
    }

    /* ---------- AND ON ITS SIDE: the page over the pad, the tiles beside them ---------- */
    for (const [sw, sh] of [[568, 320], [844, 390]]) {
      const ctx = await browser.newContext({ viewport: { width: sw, height: sh }, hasTouch: true, isMobile: true });
      const tp = await ctx.newPage();
      tp.on('pageerror', e => raw.push('window: ' + String(e.message).slice(0, 140)));
      await tp.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, VISITORS[0].user);
      await tp.addInitScript(GUARDS);
      await tp.route('**://script.google.com/**', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
      await tp.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
      await tp.waitForTimeout(2200);
      const tc = await ctx.newCDPSession(tp);
      const W_ = 'tools · the whiteboard at ' + sw + 'x' + sh;
      const at = () => tp.evaluate(async () => {
        if (AT !== 'tools') go('tools', false, true);
        goPage('tools', widgetsOf_('tool').findIndex(w => String(w.id) === 'whiteboard'), true);
        for (let i = 0; i < 80; i++) {
          const busy = (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length)
            || (typeof AFTER_SLIDE !== 'undefined' && AFTER_SLIDE)
            || (typeof SETTLE_ON !== 'undefined' && SETTLE_ON && performance.now() < SETTLE_ON.until)
            || (typeof aheadBusy_ === 'function' && aheadBusy_());
          if (!busy && i >= 4 && document.querySelector('#s-tools #wgt-whiteboard .nb')) break;
          await new Promise(r => setTimeout(r, 100));
        }
        const nb = document.querySelector('#s-tools #wgt-whiteboard .nb');
        if (!nb) return null;
        const k = nb.getAttribute('data-k');
        let n = 0;
        try { n = (JSON.parse(localStorage.getItem(k) || '[]') || []).length; } catch (e) {}
        const box = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), h: Math.round(r.height), l: r.left, t: r.top, r: r.right, b: r.bottom }; };
        const pane = box(nb.closest('.pane'));
        const card = nb.closest('.card');
        const tiles = [...card.querySelectorAll('.tile')].map(box);
        const off = tiles.filter(b => b.w < 44 || b.h < 44 || b.b > pane.b + 0.5 || b.r > pane.r + 0.5 || b.l < pane.l - 0.5).length;
        const pb = box(nb.querySelector('.nb-pad')), bb = box(nb.querySelector('.nb-book'));
        const out = [pb, bb].filter(b => b.b > pane.b + 0.5 || b.r > pane.r + 0.5 || b.l < pane.l - 0.5).length;
        return { at: AT, page: PAGE.tools, k, strokes: n, pad: pb, book: bb, tiles: tiles.length, off, out };
      });
      let b = await at();
      if (!b) {
        swipes.push({ from: W_, dir: 'touch', ok: false, got: 'no board on the Tools column', want: 'a board' });
      } else {
        await tp.evaluate(k => { try { ansStore_(k, null); } catch (e) {} NB_STATE.delete(k); initBoard_(); }, b.k);
        b = await at();
        swipes.push({ from: W_, dir: 'its size', ok: b.pad.w >= 120 && b.pad.h >= 96 && b.book.h >= 96 && b.tiles >= 5 && !b.off && !b.out,
                      got: 'a ' + b.pad.w + 'x' + b.pad.h + 'px pad under a ' + b.book.w + 'x' + b.book.h + 'px page, ' + b.out + ' of them past the pane, '
                        + b.off + ' of ' + b.tiles + ' tiles under 44px or past the pane',
                      want: 'a pad and a page at least 96px tall inside the pane, every tile 44px and inside it' });
        const x0 = b.pad.x - Math.round(b.pad.w * 0.35), y0 = b.pad.y;
        await tc.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
        for (let i = 1; i <= 10; i++) {
          await tc.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + Math.round(b.pad.w * 0.7) * i / 10, y: y0 }] });
          await tp.waitForTimeout(12);
        }
        await tc.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await tp.waitForTimeout(520);
        const a = await tp.evaluate(k => ({ at: AT, page: PAGE.tools, strokes: (() => { try { return (JSON.parse(localStorage.getItem(k) || '[]') || []).length; } catch (e) { return -1; } })() }), b.k);
        swipes.push({ from: W_ + ', its pad', dir: 'touch across', ok: a.at === 'tools' && a.page === b.page && a.strokes === 1,
                      got: a.at + ' page ' + a.page + ', ' + a.strokes + ' stroke(s) kept', want: 'tools page ' + b.page + ', 1 stroke(s) kept' });
        await tp.evaluate(k => { try { ansStore_(k, null); } catch (e) {} NB_STATE.delete(k); }, b.k);
      }
      await ctx.close();
    }

    /* ---------- AND A FIGURE UNDER THE PEN ON A PHONE ON ITS SIDE, WHERE IT WAS A FEW PIXELS WIDE § */
    for (const [sw, sh] of [[568, 320], [844, 390]]) {
      const ctx = await browser.newContext({ viewport: { width: sw, height: sh }, hasTouch: true, isMobile: true });
      const tp = await ctx.newPage();
      tp.on('pageerror', e => raw.push('window: ' + String(e.message).slice(0, 140)));
      await tp.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, VISITORS[0].user);
      await tp.addInitScript(GUARDS);
      await tp.route('**://script.google.com/**', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
      await tp.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
      /* THE LIBRARY IN, not a guess at when: the three rows are in `data/questions.json`, which lands after the
         payload. */
      await tp.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof stuffItemsAll_ === 'function'
        && stuffItemsAll_().some(x => x.row && x.row.row_id === 'Q-1CM-transformations-of-graphs-8'), null, { timeout: 60000 }).catch(() => {});
      await tp.waitForTimeout(600);
      const tc = await ctx.newCDPSession(tp);
      const tap = async (x, y) => {
        await tc.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await tc.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await tp.waitForTimeout(520);
      };
      for (const id of ['Q-1CM-transformations-of-graphs-8', 'Q-1MA1-2406-1F-7', 'Q-1MA1-2406-1F-11c']) {
        const W_ = 'stuff · ' + id + ' on its card at ' + sw + 'x' + sh;
        /* ITS CARD, WITH THE PEN ON IT (356): no Draw to touch, the pad is the answer. */
        const m = await tp.evaluate(async id => {
          const it = stuffItemsAll_().find(x => x.row && x.row.row_id === id);
          if (!it || !padSource_(it)) return { err: 'not in the library, or no pen' };
          go('stuff', false, true);
          STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: FACETS.find(f => f.field === 'paperId').of(it) }];
          paintStuff(true);
          goPage('stuff', stuffFirstResult_() + stuffPageOf_(it), true);
          let pad = null;
          for (let i = 0; i < 60 && !pad; i++) {
            await new Promise(r => setTimeout(r, 100));
            pad = [...document.querySelectorAll('#s-stuff .page.on .qcard .qpad')].find(p => p.getAttribute('data-k') === padKey_(it)) || null;
          }
          if (!pad) return { err: 'no pen on its card' };
          await new Promise(r => setTimeout(r, 400));
          const pane = pad.closest('.pane');
          const art = pad.querySelector('.qpad-art > svg:first-child');
          const was = art.style.width; art.style.width = '';
          const nat = art.getBoundingClientRect().width; art.style.width = was;
          const side = e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); };
          const taps = [...pad.querySelectorAll('.qpad-bar [data-do]')];
          const pr = pane.getBoundingClientRect(), fr = art.getBoundingClientRect();
          const ir = pad.querySelector('.qpad-ink').getBoundingClientRect();
          return { w: Math.round(fr.width), nat: Math.round(nat), small: Math.round(Math.min(...taps.map(side)) * 10) / 10,
                   inkOff: Math.round(Math.max(Math.abs(ir.left - fr.left), Math.abs(ir.top - fr.top), Math.abs(ir.width - fr.width), Math.abs(ir.height - fr.height))),
                   whole: [...pane.children].some(k => !!k.style.zoom), top: Math.round(fr.top - pr.top),
                   topIn: fr.top >= pr.top - 0.5 && fr.top < pr.bottom,
                   over: pane.scrollHeight - pane.clientHeight, scrolls: getComputedStyle(pane).overflowY === 'auto' };
        }, id);
        if (m.err) { swipes.push({ from: W_, dir: 'open', ok: false, got: m.err, want: 'its card with the pen on it' }); continue; }
        const floor = Math.min(180, m.nat);
        swipes.push({ from: W_, dir: 'open', ok: m.w >= floor - 0.5 && m.inkOff <= 1 && m.small >= 43.5 && !m.whole && m.topIn && (m.over <= 2 || m.scrolls),
                      got: 'the picture ' + m.w + 'px wide (its own ' + m.nat + 'px)' + (m.inkOff > 1 ? ', the ink ' + m.inkOff + 'px off it' : ', the ink over it') + ', the smallest tile ' + m.small + 'px'
                           + (m.whole ? ', the card drawn smaller whole' : '') + ', its top ' + m.top + 'px into the pane'
                           + (m.over > 2 ? ', the card ' + m.over + 'px over and ' + (m.scrolls ? 'scrolling' : 'NOT scrolling') : ''),
                      want: 'the picture at least ' + floor + 'px wide with the ink over it, every tile 44px, nothing drawn smaller whole, its top in the pane, and the card scrolling if it does not fit' });
        await tp.evaluate(() => { STUFF.filters = []; paintStuff(true); });
      }
      await ctx.close();
    }

    /* AND A TAP ON THE GAME FLAPS ON THE FINGER GOING DOWN, NOT ON IT COMING UP. § */
    {
      const at = await page.evaluate(() => {
        go('games');
        const i = widgetsOf_('game').findIndex(w => w.id === 'flabby');
        if (i >= 0) goPage('games', i, true);
        return i;
      });
      await page.waitForTimeout(900);
      const box = await page.evaluate(() => {
        const c = document.querySelector('#s-games .flappy');
        if (!c || typeof flappyState === 'undefined' || !flappyState) return null;
        const r = c.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2),
                 w: Math.round(r.width) };
      });
      if (at < 0 || !box || box.w < 60) {
        swipes.push({ from: 'games · Flabby Pird', dir: 'touch down', ok: false,
                      got: box ? 'the canvas was ' + box.w + 'px wide' : 'no game on that column',
                      want: 'the game drawn and ready' });
      } else {
        await cdp.send('Input.dispatchTouchEvent',
          { type: 'touchStart', touchPoints: [{ x: box.x, y: box.y }] });
        const down = await page.evaluate(() => ({ running: flappyState.running,
                                                  vy: flappyState.bird.vy }));
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.evaluate(() => {
          if (typeof flappyState !== 'undefined' && flappyState) {
            if (flappyState.raf) cancelAnimationFrame(flappyState.raf);
            flappyState.raf = null; flappyState.running = false;
          }
        });
        swipes.push({ from: 'games · Flabby Pird', dir: 'touch down',
                      ok: !!down.running && down.vy < 0,
                      got: down.running ? 'flapped, vy ' + down.vy.toFixed(1)
                                        : 'nothing until the finger came up',
                      want: 'the bird already rising before the finger lifts' });
      }
    }

    /* AND THAT PAGE n SHOWS QUESTION n, WHICH STOPPED BEING FREE. § */
    const walk = [];
    {
      const paper = 'RS1786302107764-481';      // May 2017 Foundation Paper 1: 41 questions
      const ok = await page.evaluate(p => {
        if (typeof STUFF === 'undefined' || typeof paintStuff !== 'function') return null;
        go('stuff', false, true);
        STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: p }];
        paintStuff();
        return stuffFiltered().length;
      }, paper);
      if (!ok) {
        walk.push({ from: 'stuff', dir: 'walk', got: 'no such paper in the library',
                    want: paper, ok: false });
      } else {
        const bad = await page.evaluate(() => {
          const out = [];
          const pages = stuffPages_(), first = stuffFirstResult_();
          /* ---------- A QUESTION WITH A PICTURE IS TWO PAGES NOW, its words and then its figure — § */
          const look = i => {
            goPage('stuff', first + i, true);
            const el = document.querySelectorAll('#s-stuff > .page')[domIndex_('stuff', first + i)];
            const pg = pages[i], id = pg.x.row.row_id;
            const html = el ? el.innerHTML : '';
            /* ---------- AND A STEM AND ITS FIGURE IN FRONT OF THE PARTS, IN THE PAPER'S ORDER § */
            /* `stemN-J` is a long stem's later page, and `preJ` a long part's first pages -- see `stemChunks_` and `partChunks_`. § */
            const stem = /^(stem|sfig)(\d+)(?:-\d+)?$/.exec(pg.part || '');
            const pre = /^pre\d+$/.test(pg.part || '');
            const sid = stem ? (pg.x.stems[+stem[2]] || {}).id : '';
            /* WHICH QUESTION THE PAGE SAYS IT BELONGS TO: § */
            const qTag = ((el && el.querySelector('.qcard-tags .qtag[data-f="qNumber"]')) || {}).textContent || '';
            const own = qTag === 'Q' + pg.x.qNumber;
            let ok;
            /* ---------- AND A FIGURE WHERE THE PAPER PRINTS IT § */
            if (pre) {
              const next = pages[i + 1];
              ok = /class="qcard qpre/.test(html) && html.indexOf('data-of="' + id + '"') !== -1
                && html.indexOf('qp-ans') === -1 && !!next && next.x === pg.x
                && (!next.part || /^pre\d+$/.test(next.part) || next.part === 'fig');
            } else if (stem) {
              const next = pages[i + 1];
              ok = !!sid && html.indexOf('data-of="' + sid + '"') !== -1 && html.indexOf('qp-ans') === -1
                && !!next && next.x === pg.x
                && (stem[1] === 'stem' ? /class="qcard qstem/.test(html) : own)
                && (stem[1] === 'stem' || i === 0 || pages[i - 1].x !== pg.x
                    || /^stem/.test(pages[i - 1].part || '') && pages[i - 1].part.split('-')[0] === 'stem' + stem[2]
                    || /^sfig/.test(pages[i - 1].part || ''));
            } else if (pg.part === 'use') {
              /* AN EARLIER PART'S DRAWING IN FRONT OF A PART THAT USES IT (`usesOf_`): § */
              const next = pages[i + 1];
              ok = /class="qcard qfig qfig-uses/.test(html) && html.indexOf('data-of="' + id + '"') !== -1
                && html.indexOf('qp-ans') === -1 && own && !!next && next.x === pg.x;
            } else if (pg.part === 'ans') {
              ok = /class="qcard qans-card/.test(html) && html.indexOf('data-of="' + id + '"') !== -1
                && html.indexOf('qp-ans') === -1
                && i > 0 && pages[i - 1].x === pg.x && (!pages[i - 1].part || pages[i - 1].part === 'fig');
            } else if (pg.part === 'fig') {
              const next = pages[i + 1];
              ok = html.indexOf('data-of="' + id + '"') !== -1 && html.indexOf('qp-ans') === -1 && own
                && ((i > 0 && pages[i - 1].x === pg.x && pages[i - 1].part !== 'ans')
                    || (!!next && next.x === pg.x && (!next.part || /^pre\d+$/.test(next.part))));
            } else {
              ok = html.indexOf(':q:' + id) !== -1 && html.indexOf('class="qcard qfig') === -1
                && html.indexOf('qans-card') === -1;
            }
            if (!ok) out.push({ page: i, want: id + (pg.part ? '#' + pg.part : ''),
                                got: (html.match(/:q:([^"]+)/) || html.match(/data-of="([^"]+)"/) || [])[1]
                                     || 'nothing' });
          };
          for (let i = 0; i < pages.length; i++) look(i);
          for (let i = pages.length - 1; i >= 0; i--) look(i);
          /* NO FIGURE PAGE (356): a figure is in its question's card, so the count of them is 0. */
          const items = pages, figs = pages.filter(pg => /^(fig|sfig\d+|use|nofig)$/.test(pg.part || '')).length;
          const stems = pages.filter(pg => /^stem/.test(pg.part || '')).length;
          const answers = pages.filter(pg => pg.part === 'ans').length;
          return { n: items.length, figs: figs, answers: answers, stems: stems, bad: out.slice(0, 4), count: out.length,
                   held: document.querySelectorAll('#s-stuff > .page').length };
        });
        walk.push({ from: 'stuff, ' + bad.n + ' pages (' + bad.figs + ' of them figure pages, ' + bad.stems
                          + ' stems, ' + bad.answers + ' answers) over ' + bad.held + ' elements',
                    dir: 'walk', ok: bad.count === 0 && bad.figs === 0 && bad.answers > 0 && bad.stems > 0,
                    got: bad.count ? bad.count + ' wrong, first ' + JSON.stringify(bad.bad[0])
                         : bad.figs ? bad.figs + ' figure page(s) -- a figure is in its card'
                         : !bad.stems ? 'no stem page on a paper whose questions share stems'
                         : !bad.answers ? 'no answer page on a paper that has answers'
                         : 'every page its own question, stem or answer',
                    want: 'every page its own question, each figure beside its own words and each answer straight after its question' });
      }
    }
    swipes.push(...walk);
    await page.close();

    /* A DROPDOWN UNDER A FINGER IS THE PLATFORM'S OWN, AND A SWIPE THAT STARTS ON ONE MOVES THE COLUMN § */
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
      const tp = await ctx.newPage();
      tp.on('pageerror', e => raw.push('window: ' + String(e.message).slice(0, 140)));
      await tp.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, VISITORS[0].user);
      await tp.addInitScript(GUARDS);
      /* EVERY PRESS A SELECT RECEIVES, WHETHER IT WAS CANCELLED, AND EVERY TIME ONE TAKES FOCUS — even for a moment, because the end state cannot say whether a select § */
      await tp.addInitScript(() => {
        window.__selHit = [];
        const sel = t => t && t.closest && t.closest('select');
        ['mousedown', 'click'].forEach(type => window.addEventListener(type, e => {
          if (sel(e.target)) window.__selHit.push(type + (e.defaultPrevented ? ':cancelled' : ''));
        }));
        document.addEventListener('focusin', e => { if (e.target && e.target.tagName === 'SELECT') window.__selHit.push('FOCUS'); }, true);
        /* THE PLATFORM'S LIST ASKED FOR FROM SCRIPT, recorded and not drawn: a headless page cannot
           photograph it, and the question is whether it was asked. */
        if (window.HTMLSelectElement && HTMLSelectElement.prototype.showPicker) {
          HTMLSelectElement.prototype.showPicker = function () { window.__selHit.push('PICKER'); };
        }
        document.addEventListener('toggle', e => {
          if (e.target && e.target.matches && e.target.matches('details.many-d') && e.target.open) window.__selHit.push('OPENED');
        }, true);
      });
      await tp.route('**://script.google.com/**', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
      await tp.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
      await tp.waitForTimeout(2200);
      const tcdp = await ctx.newCDPSession(tp);
      const tap = async (x, y) => {
        await tcdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, radiusX: 11, radiusY: 11 }] });
        await tcdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await tp.waitForTimeout(350);
      };
      const drag = async (x, y, dx, dy, steps) => {
        steps = steps || 4;
        await tcdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let k = 1; k <= steps; k++) {
          await tcdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * k / steps, y: y + dy * k / steps }] });
          await tp.waitForTimeout(16);
        }
        await tcdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await tp.waitForTimeout(700);
      };
      const now = () => tp.evaluate(() => {
        const a = document.activeElement;
        return { own: !!(document.getElementById('drop') || document.getElementById('drop-back') || document.querySelector('[role="listbox"]')),
                 focused: !!a && a.tagName === 'SELECT',
                 sheet: !document.getElementById('sheet').classList.contains('hidden'),
                 at: typeof AT === 'undefined' ? '?' : AT,
                 hit: window.__selHit.slice() };
      });
      const reset = () => tp.evaluate(() => {
        if (typeof closeSheet === 'function') closeSheet();
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        window.__selHit.length = 0;
      });
      /* THE FIELD'S CENTRE, on the page in front, after the column has settled — and what is under the
         finger there, which is the whole rule: a select under a finger is a select a finger opens. */
      const field = async (col, sel) => {
        await tp.evaluate(a => {
          go(a.col, false, true);
          const pages = [...document.querySelectorAll('#s-' + a.col + ' > .page')];
          const i = pages.findIndex(p => p.querySelector(a.sel));
          if (i >= 0) goPage(a.col, typeof logIndex_ === 'function' ? logIndex_(a.col, i) : i, true);
        }, { col, sel });
        await tp.waitForTimeout(900);
        return tp.evaluate(a => {
          const s = [...document.querySelectorAll('#s-' + a.col + ' ' + a.sel)]
            .find(x => !x.disabled && (typeof dropOnFront_ === 'function' ? dropOnFront_(x) : !!x.offsetParent));
          if (!s) return null;
          const r = s.getBoundingClientRect();
          return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2),
                   under: (document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) || {}).tagName };
        }, { col, sel });
      };
      const want = (from, ok, got, wanted) => drops.push({ from, ok, got, want: wanted });
      const said = r => [r.own ? 'a list of the app\'s own in the document' : 'nothing of the app\'s own',
        r.focused ? 'the select focused' : r.hit.indexOf('FOCUS') !== -1 ? 'the select took focus on the way' : 'not focused',
        r.hit.filter(h => h !== 'FOCUS').join(' ') || 'no press on the select', r.sheet ? 'sheet still open' : '',
        'on ' + r.at].filter(Boolean).join(', ');
      const reached = r => r.hit.indexOf('mousedown') !== -1 || r.hit.indexOf('click') !== -1;
      const opened = r => reached(r) || r.hit.indexOf('FOCUS') !== -1;

      const kind = await field('booking', 'select.bk-sel[data-step="how"]');
      if (!kind) want('booking · Kind', false, 'no Kind select on the booking column', 'a select to tap');
      else {
        await reset(); await tap(kind.x, kind.y);
        let r = await now();
        want('booking · Kind, a tap on the box (under the finger: ' + kind.under + ')',
             kind.under === 'SELECT' && reached(r) && (r.focused || r.hit.indexOf('FOCUS') !== -1) && !r.own, said(r),
             'the select under the finger, its press let through and the focus on it — the platform\'s list — and nothing of the app\'s own');
        /* A SWIPE THAT STARTS ON THE SELECT MOVES THE COLUMN. Sideways, far enough to be a page turn
           and not a wobble, and from the select's own centre. */
        await reset();
        await tp.evaluate(() => { go('booking', false, true); });
        await tp.waitForTimeout(700);
        const before = (await now()).at;
        await drag(kind.x, kind.y, -150, 0, 8);
        r = await now();
        want('booking · a swipe left that starts on the Kind select', r.at !== before && !opened(r) && !r.own, said(r),
             'the column moved off ' + before + ', and the select neither focused nor pressed');
        await tp.evaluate(() => { go('booking', false, true); });
        await tp.waitForTimeout(700);
      }
      /* THE ROW'S WORD. A tap a little in from the label's left edge — where a thumb aims at a word —
         on three rows, and the select it names is what answers. */
      for (const step of ['client', 'how', 'tutor']) {
        const lab = await tp.evaluate(st => {
          const l = [...document.querySelectorAll('#s-booking label.bk-k[for="bk-ctl-' + st + '"]')]
            .find(x => typeof dropOnFront_ === 'function' ? dropOnFront_(x) : !!x.offsetParent);
          if (!l) return null;
          const r = l.getBoundingClientRect();
          return { x: Math.round(r.left + Math.min(10, r.width / 2)), y: Math.round(r.top + r.height / 2),
                   w: Math.round(r.width), h: Math.round(r.height) };
        }, step);
        if (!lab) { want('booking · the "' + step + '" row\'s word', false, 'no label for a select on that row', 'a `<label for>` the row\'s select'); continue; }
        await reset(); await tap(lab.x, lab.y);
        const r = await now();
        want('booking · a tap on the "' + step + '" row\'s word (' + lab.w + 'x' + lab.h + ')',
             (r.focused || r.hit.indexOf('FOCUS') !== -1) && r.hit.indexOf('PICKER') !== -1 && !r.own, said(r),
             'the row\'s select focused and the platform\'s list asked for — the word is part of the target');
      }

      /* THE SETTINGS COLUMN'S SEVERAL-OF-A-LIST FIELD: a drag from it is not a tap, a tap opens it. */
      const venues = await field('settings', '.field.many summary');
      if (!venues) want('settings · the venues field', false, 'no several-of-a-list field on Settings', 'a field to drag from');
      else {
        const shut = () => tp.evaluate(() => document.querySelectorAll('#s-settings details.many-d[open]').forEach(d => { d.open = false; }));
        for (const [dx, dy] of [[12, 0], [0, 12], [0, -14]]) {
          await shut(); await reset(); await drag(venues.x, venues.y, dx, dy);
          const r = await now();
          want('settings · the venues field, a ' + Math.abs(dx || dy) + 'px drag ' + (dx ? 'sideways' : dy > 0 ? 'down' : 'up'),
               r.hit.indexOf('OPENED') === -1, said(r) + (r.hit.indexOf('OPENED') !== -1 ? ', the list OPENED' : ''),
               'the list left shut — a thumb starting a scroll there is not a tap');
        }
        await shut(); await reset(); await tap(venues.x, venues.y);
        const r = await now();
        want('settings · a tap on the venues field', r.hit.indexOf('OPENED') !== -1, said(r) + (r.hit.indexOf('OPENED') !== -1 ? ', the list opened' : ', the list stayed shut'),
             'the list opened under it');
        await shut();
      }

      /* ---------- EVERY SELECT, ON EVERY PAGE THAT DRAWS ONE, IS WHAT A FINGER LANDS ON § */
      {
        const cols = await tp.evaluate(() => (typeof TABS !== 'undefined' ? TABS : []).map(t => (t && t.id) || t).filter(x => typeof x === 'string'));
        let measured = 0, skipped = 0;
        const walls = [];
        for (const col of cols) {
          /* EVERY PAGE, NOT ONLY THE ONES HOLDING A SELECT WHEN THE COLUMN IS DRAWN: § */
          const pages = await tp.evaluate(c => {
            go(c, false, true);
            return [...document.querySelectorAll('#s-' + c + ' > .page')]
              .map((p, i) => (typeof logIndex_ === 'function' ? logIndex_(c, i) : i));
          }, col);
          for (const pg of pages) {
            await tp.evaluate(a => { go(a.c, false, true); goPage(a.c, a.p, true); }, { c: col, p: pg });
            await tp.waitForTimeout(450);
            const got = await tp.evaluate(c => {
              const out = { ok: 0, off: 0, bad: [] };
              for (const s of document.querySelectorAll('#s-' + c + ' select:not(:disabled)')) {
                if (typeof dropOnFront_ === 'function' && !dropOnFront_(s)) continue;
                const r = s.getBoundingClientRect();
                if (!r.width || !r.height) continue;
                const x = r.left + r.width / 2, y = r.top + r.height / 2;
                /* WHAT IS ON THE GLASS: § */
                let L = 0, T = 0, R = innerWidth, B = innerHeight;
                for (let e = s.parentElement; e && !e.classList.contains('screen'); e = e.parentElement) {
                  const cs = getComputedStyle(e);
                  if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
                  const er = e.getBoundingClientRect();
                  L = Math.max(L, er.left); T = Math.max(T, er.top); R = Math.min(R, er.right); B = Math.min(B, er.bottom);
                }
                if (x < L || x > R || y < T || y > B) { out.off++; continue; }
                const pe = getComputedStyle(s).pointerEvents;
                const at = document.elementFromPoint(x, y);
                if (pe === 'none' || !(at === s || s.contains(at))) {
                  out.bad.push((s.id || s.dataset.me || s.dataset.step || s.dataset.do || s.className || 'select') + ': pointer-events ' + pe
                    + ', under the finger ' + (at ? at.tagName.toLowerCase() + (at.className ? '.' + String(at.className).split(' ')[0] : '') : 'nothing'));
                } else out.ok++;
              }
              return out;
            }, col);
            measured += got.ok; skipped += got.off;
            got.bad.forEach(b => walls.push(col + ' p' + pg + ' · ' + b));
          }
        }
        await tp.evaluate(() => go('booking', false, true));
        await tp.waitForTimeout(500);
        want('every select on the page in front, ' + measured + ' measured on ' + cols.length + ' columns (' + skipped + ' scrolled out of reach and not measured)',
             measured > 10 && !walls.length,
             walls.length ? walls.slice(0, 4).join('; ') + (walls.length > 4 ? ' … and ' + (walls.length - 4) + ' more' : '')
               : measured > 10 ? 'every one is what a finger at its centre lands on' : 'only ' + measured + ' selects were measured — the walk did NOT reach them',
             'pointer-events not none, and the select itself under a finger at its centre');
      }

      const cc = await field('settings', 'select[data-me="phone_cc"]');
      if (!cc) want('settings · country code', false, 'no country-code select', 'a select to drag from');
      else {
        for (const [dx, dy] of [[12, 0], [0, 12]]) {
          await reset(); await drag(cc.x, cc.y, dx, dy);
          const r = await now();
          want('settings · country code (under the finger: ' + cc.under + '), a ' + (dx || dy) + 'px drag ' + (dx ? 'sideways' : 'down'),
               !opened(r) && !r.own, said(r), 'no press let through to the select and no focus — a drag is not a tap');
        }
        /* THE KEYBOARD'S NEXT ARROW: focus moving from the box before onto the select, and staying. */
        await reset();
        await tp.evaluate(() => {
          const s = [...document.querySelectorAll('#s-settings select[data-me="phone_cc"]')].find(x => dropOnFront_(x));
          const all = [...s.closest('.page').querySelectorAll('input, select, textarea')];
          const before = all[all.indexOf(s) - 1];
          if (before) before.focus();
        });
        await tp.keyboard.press('Tab'); await tp.waitForTimeout(350);
        const r = await now();
        want('settings · country code, focus arriving by the keyboard', r.focused && !r.own, said(r),
             'the select focused and left focused — on a phone that is the platform\'s picker');
      }

      const fav = await field('settings', 'select[data-me="favourite_colour"]');
      if (fav) {
        await reset();
        await tp.evaluate(() => openSheet('Test', '<p>A short sheet.</p>'));
        await tp.waitForTimeout(400);
        /* ---------- THE SHEET IS A PAGE (420): with it open the select is not on the screen at all, so a tap where it stood reaches the sheet's page, not the select */
        const under = await tp.evaluate(f => { const el = document.elementFromPoint(f.x, f.y); return !!(el && (el.closest('#sheet') || el === document.body)); }, fav);
        await tap(fav.x, fav.y);
        const r = await now();
        want('settings · favourite colour, one tap where it stood while the sheet is the page', under && !opened(r) && !r.own, said(r),
             'the sheet\'s page under the finger, and nothing behind it pressed or focused');
      }
      await reset();
      await ctx.close();
    }
  }

  await browser.close();
  server.close();

  /* ---------- WHAT IT FOUND ------------------------------------------------------------------- */
  const threw = results.filter(r => r.errs && r.errs.length);
  const dead  = results.filter(r => r.alive && (!r.alive.go || r.alive.screens < 9 || r.alive.broke));
  /* AN ENTRY MAY BE SCOPED TO ONE VISITOR. `cmt-del` is a live control signed in and a refusal
     signed out, and an entry keyed on the action alone would accept the regression as well as the
     artifact. */
  const excused = r => {
    const e = ACCEPTED_QUIET[r.action];
    if (!e) return false;
    return !e.only || String(r.screen).indexOf(e.only) !== -1;
  };
  const quiet = results.filter(r => r.changed === false && !excused(r));
  const known = results.filter(r => r.changed === false && excused(r));
  /* PRESSED BY SOMEBODY IS PRESSED. § */
  const everPressed = new Set(results.filter(r => r.changed !== undefined).map(r => r.action));
  const gone  = results.filter(r => r.unreachable && !everPressed.has(r.action));
  const off   = results.filter(r => r.disabled);

  const say = (title, rows, line) => {
    if (!rows.length) return;
    console.log('\n' + title + '  (' + rows.length + ')');
    rows.slice(0, 40).forEach(r => console.log('   ' + line(r)));
    if (rows.length > 40) console.log('   …and ' + (rows.length - 40) + ' more');
  };

  console.log('pressed ' + pressed + ' action(s) across ' + VISITORS.length + ' visitor(s): '
            + VISITORS.map(v => v.as).join(' and '));
  if (notEntered) console.log('  ! ' + notEntered + ' state(s) could not be reached — named above');

  /* EVERY PRESS AND WHAT IT DID, for reading one screen at a time. Off by default: nine screens of
     it is a wall, and a wall is what this file exists to avoid producing. */
  if (VERBOSE) results.forEach(r => console.log('   ' + (r.unreachable ? '  ?  ' : r.disabled ? ' off ' : (r.errs || []).length ? ' ERR ' : r.changed ? '  .  ' : ' --  ')
    + r.screen + '/' + r.action + (r.where ? '  ' + r.where : '')));

  const lost = swipes.filter(s => !s.ok);
  if (swipes.length) console.log('swiped ' + swipes.length + ' time(s): '
    + (lost.length ? lost.length + ' went somewhere else' : 'every one landed where it should'));

  say('THREW', threw, r => `${r.action} on ${r.screen} (${r.where})\n      ` + r.errs.join('\n      '));
  say('A SWIPE WENT SOMEWHERE ELSE', lost,
      r => `${r.dir} from ${r.from} landed on ${r.got}, wanted ${r.want}`);
  const dropBad = drops.filter(d => !d.ok);
  if (drops.length && !dropBad.length) console.log('touched dropdowns ' + drops.length + ' way(s): every tap reached the platform\'s own select, every swipe and drag moved on without it');
  /* EACH ONE AND WHAT IT GOT, ON ASKING — the line above is a count, and a count cannot say which. */
  if (VERBOSE) drops.forEach(d => console.log('   ' + (d.ok ? 'ok   ' : 'WRONG') + ' ' + d.from + ' — ' + d.got));
  say('A DROPDOWN TAP WENT WRONG', dropBad, r => `${r.from}: ${r.got}, wanted ${r.want}`);
  say('TOOK THE APP DOWN', dead, r => `${r.action} on ${r.screen}: ` + JSON.stringify(r.alive));
  say('NOTHING MEASURABLE CHANGED, AND NOTHING SAYS WHY', quiet,
      r => `${r.action} on ${r.screen} (${r.where})`);

  if (known.length) {
    console.log('\nKNOWN QUIET, WITH A REASON  (' + known.length + ')');
    const said = new Set();
    known.forEach(r => {
      if (said.has(r.action)) { console.log('   ' + r.action + ' on ' + r.screen); return; }
      said.add(r.action);
      console.log('   ' + r.action + ' on ' + r.screen + '\n      ' + ACCEPTED_QUIET[r.action].why);
    });
  }
  if (off.length) console.log('\npresent and disabled, so nothing to press  (' + off.length + '): '
                             + off.map(r => r.screen + '/' + r.action).join(', '));
  if (gone.length) console.log('\nnamed on a screen and then not found to press  (' + gone.length + '): '
                             + gone.map(r => r.screen + '/' + r.action).join(', '));

  if (!threw.length && !dead.length && !quiet.length)
    console.log('\nOK — nothing threw, nothing was silently inert, and the app survived every press.');

  /* A QUIET PRESS FAILS, and that is the whole point of the list above. § */
  process.exit(threw.length || dead.length || quiet.length || notEntered || lost.length || dropBad.length ? 1 : 0);
})();
