#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/press.js

   PRESS IT. DID ANYTHING HAPPEN?

   THIS IS THE QUESTION NOTHING HERE ASKED, and the entry at the foot of CLAUDE.md says so in the
   owner's own words. The hour grid did nothing when it was pressed for as long as the booking form
   has lived on two screens: `paintBook_` repainted `s-stuff`, which on the Booking column is not
   merely the wrong element but a DEAD one, so the state changed correctly and the screen was never
   rebuilt. Twenty-odd `<select>`s on the same card looked fine throughout, because a dropdown shows
   its own new value natively with no help from anybody — so the half of the form that needed no
   repaint is the half that appeared to work.

   NEITHER INSTRUMENT COULD SEE IT, and both were right about what they ask:

     `check/ui.js`      measures whether a control can be READ and HIT. A dead control measures
                        perfectly — the cells are the size they are whether or not pressing one does
                        anything.
     `check-doors.js`   asks whether every `data-do` in the markup has a handler and every handler
                        has a door. Both halves of that were true here. The wiring was perfect and
                        the wire went nowhere.
     `check-flow.js`    drives bookings through `BOOKING` and the send paths rather than through the
                        markup, so it proves the state machine and never presses a cell.

   AND THE DISPATCHER IS WHY A THROWN HANDLER IS INVISIBLE. `shell.js` wraps every action in a
   try/catch on purpose — an error escaping it reaches the window, and a browser serving from
   `file://` reports that as "Script error." with no message, no file and no line. Caught, it keeps
   its message. The cost is that `pageerror` never fires, so a handler that throws on every press
   looks from outside exactly like one that works: the app stays up, nothing is logged where a
   harness is looking, and the only evidence is a toast nobody screenshotted.

   SO THIS LISTENS WHERE THE APP ACTUALLY SPEAKS: `console.error('[' + action + ']', err)`, which is
   the line in that catch, plus `pageerror` for anything outside it.

   ------------------------------------------------------------------------------------------------
   WHAT IT PRESSES, AND WHY IT IS BY ACTION RATHER THAN BY ELEMENT.

   Pressing every ELEMENT would press `qp-ans` four thousand times and `fav` once per card. What is
   worth asking once is each distinct ACTION — `book-slot`, `fav`, `msg-send` — because the handler
   is the thing that can be broken. So: every distinct `data-do` reachable on a screen, pressed once,
   on a freshly-found element each time, because the press before it may have rebuilt the markup.

   A SHEET IS A SCREEN'S OTHER HALF. `#sheet` is a sibling of the screens, so everything this app
   opens in one — the details form, the pay sheet, the composer, a tutor's profile, the practical
   guide — carries actions that are on no screen. Whenever a press opens a sheet, the sheet's own
   actions join the queue for that screen, which is how `msg-send` and `me-save` get pressed at all.

   A SELECT AND A CHECKBOX SPEAK THROUGH `change`. The dispatcher refuses them on `click` outright
   and says why — a click on a select is the dropdown OPENING, with the old value still in it. So
   those are pressed the way a person presses them: the value is moved on by one and `change` is
   dispatched.

   ------------------------------------------------------------------------------------------------
   WHAT FAILS AND WHAT IS ONLY PRINTED, which is the line this repository keeps.

   FAILS   a press that throws — in the handler's catch or out at the window. That is certainly
           wrong, whatever the action is.
   FAILS   a press that leaves the app unusable: `go` gone, the nine screens not all present, or
           the screen it was on no longer drawable.
   PRINTS  a press after which NOTHING measurably changed. That is the grid's signature and it is
           not by itself a fault: `reel-sound` on a clip with no audio, an action whose whole job is
           to post and toast, a toggle pressed into the state it was already in. A rule that failed
           on it would be red on the first honest one and red forever after — the argument this
           repository makes for `ACCEPTED_TAP` and `ACCEPTED`. A NUMBER somebody reads is the point;
           see `ACCEPTED_QUIET` below for the ones that are known.

   WHAT COUNTS AS SOMETHING HAPPENING is deliberately wide, because the alternative is a check that
   cries wolf: the screen's markup, the sheet, which screen you are on, which page of it, a toast, a
   request leaving the phone, or anything written to `localStorage`. One of those moving is enough.

     node check/press.js               every screen
     node check/press.js --screen=dm   one
================================================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const { statesOf } = require('./states.js');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PRESS_PORT || 8123);   /* overridable: parallel runs in worktrees share one machine */
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const ONLY = (process.argv.find(a => a.startsWith('--screen=')) || '').split('=')[1] || '';
const VERBOSE = process.argv.includes('--verbose');

/* ---------- BOTH VISITORS, AND THE SECOND ONE IS THE FRONT DOOR ----------------------------------
   THE ADMIN SEES NEARLY EVERY CONTROL, which is why the sweep is worth running as one. What that
   pass cannot reach is the two controls that matter most to somebody who has never been here:
   `do-signin` and `register`. The admin pass named both and could not press either — they are on the
   screen only while nobody is signed in, and this harness seeds a user before the page exists.

   That is the fault this repository keeps finding in its own checks, exactly as `check/ui.js`
   records it: "It reported nothing because it had never signed in." The answer there was two
   visitors and it is the answer here. The signed-out pass is short — this app shows a stranger very
   little — so it costs a few seconds and closes the one hole the long pass has. */
const VISITORS = [
  { as: 'signed in', user: { name: 'Test Admin', personId: 'P001', person_id: 'P001',
                             role: 'admin', roles: ['admin'], handle: 'testadmin' } },
  { as: 'signed out', user: null },
];

/* ---------- KNOWN QUIET, WITH A WRITTEN REASON EACH, AND STILL PRINTED ----------------------------
   `ACCEPTED` in check-payload.js and `ACCEPTED_TAP` in check/ui.js carry the same argument: a
   finding that is real, understood and correct does not stop being real, and left in the count it
   turns the run into a wall nobody reads. Each entry is one action and one sentence saying why
   pressing it changes nothing THAT THIS CAN SEE — which is a different claim from "it does
   nothing". */
const ACCEPTED_QUIET = {
  /* ---------- A FILE PICKER --------------------------------------------------------------------
     Both press a hidden `<input type="file">`, which opens the device's own chooser — a window this
     harness cannot see and nothing on the page changes until a file is chosen. */
  'msg-attach': { why: 'opens the device file chooser; nothing on the page changes until a file is picked.' },
  'pfp-pick':   { why: 'the profile picture\'s Choose photo: opens the device file chooser, and nothing on the '
                     + 'page changes until a picture is picked — check-flow drives that half with a file.' },
  'cam-more':   { why: 'keeps the current shot and starts the camera again; with no shot and no camera '
                     + 'in this container there is nothing to keep and nothing to restart.' },
  /* ---------- A BOX WITH NOTHING IN IT ------------------------------------------------------------
     All four refuse in the same way and it is the right refusal: the box is focused and the handler
     returns. Sending an empty message is not an action, and a toast saying so would be the app
     telling somebody what they can already see. */
  'cmt-add':  { why: 'the comment box is empty, so the handler focuses it and returns — which is the '
                   + 'right answer to "post nothing".' },
  'msg-send': { why: 'the message box is empty. Same refusal as `cmt-add`, and the same right one.' },
  'dock-add': { why: 'the to-do box is empty; the handler focuses it and adds no line.' },
  /* ---------- A QUESTION ABOUT A PAPER NOBODY HAS CHOSEN -------------------------------------------
     The practice paper's selects (writing size, line spacing, square size) live in `#mat-blank`,
     which is hidden while the cheat sheet is the kind chosen — and the cheat sheet is what the tool
     opens on. Pressed hidden, the setting is taken and kept for when the paper is chosen, and the
     screen rightly does not change. check-flow's practice-paper journey presses each of them with
     the paper showing and reads the ruling they draw. */
  'mat-blank': { why: 'a practice-paper setting, hidden while the cheat sheet is chosen; it is kept for '
                    + 'the paper and the screen rightly stays as it was — check-flow presses it with the paper showing.' },
  /* IT CAME OFF THIS LIST ONCE, WITH THE STATE THAT REACHED IT. The "carry on" block was deleted
     and nothing pressed `pad-clear` again, so the entry would have been a written reason with
     nothing behind it. `stuff · a diagram you can draw on` reaches it again. */
  'pad-clear': { why: 'nothing has been drawn on the pad, so this writes an empty list over an '
                    + 'empty list — the same refusal as an empty box, and the same right one.' },

  /* ---------- A CARET IS NOT A PRESS --------------------------------------------------------------
     These are `<input>`s and a `<textarea>`. They answer what is TYPED — `input` and `change` — and
     clicking one puts a caret in it, which is meant to change nothing at all. */
  'book-emails': { why: 'a text field. It answers `change` on what is typed; a click is a caret.' },
  'book-note':   { why: 'the same field one row down, and the note over its listener says outright '
                      + 'that it does NOT redraw — repainting would take the cursor out of the box '
                      + 'the moment somebody clicked away mid-sentence.' },
  'qp-ans':      { why: 'the answer box writes to localStorage on `input`, not on a press; a click '
                      + 'on a textarea is a caret being placed.' },
  /* THE TYPING LINE IS A CARET TOO, with a button round it. Its whole effect is the focus moving to
     the hidden box, and the rung above it — pressed first, because it is first on the card — hands
     the focus there as well, so by the time the line is pressed the card is already listening. On
     its own, on a card that is not, it does change the markup (`.kt-box.typing`); measured. */
  'kt-focus':    { why: 'puts the focus in the hidden typing box, which the rung pressed before it '
                      + 'already did — a caret placed twice.' },

  /* ---------- NO CAMERA IN A CONTAINER ------------------------------------------------------------
     `cam-shoot` and `cam-video` are reported as DISABLED rather than quiet, which is the shutters
     doing exactly what `camLive_` was written to do. These two are enabled and correctly do nothing
     without a stream. */
  'cam-pick': { why: 'a file input. The click opens the operating system\'s own picker, which is '
                   + 'outside the page — nothing in the page changes either way.' },
  'cam-flip': { why: 'switches between two cameras. `camWays_` asks the browser for its video inputs '
                   + 'and this container has none, so there is nothing to switch to. The control is '
                   + 'drawn only where there are two, which is why this is quiet rather than absent.' },

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
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404); return res.end('not here');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(PORT, () => ok(s));
  });
}

/* ---------- THE THINGS A PRESS MUST NOT BE ALLOWED TO DO TO THE HARNESS ---------------------------
   None of these is a fault in the app and every one would end the run: a reload throws away the
   sweep, a new window is a second page nothing is watching, a `confirm` that nobody answers blocks
   the thread for ever. `confirm` answers YES rather than no, deliberately — answering no would walk
   the path where nothing happens and report it as a press that did nothing, which is the exact
   finding this file exists to make honest. */
const GUARDS = () => {
  window.__press = { fetches: 0, prints: 0, errs: [] };
  const f = window.fetch;
  window.fetch = function () { window.__press.fetches++; return f.apply(this, arguments); };
  window.confirm = () => true;
  window.alert = () => {};
  window.prompt = () => '';
  /* AND IT ANSWERS LIKE A REAL BROWSER RATHER THAN DOING NOTHING. Headless has no dialogue, so a
     bare stub never fires `afterprint` — and all three of this app's print paths take their paper
     away in that listener, with a four-second backstop behind it. Left to the backstop, an A4 sheet
     sits at the foot of `body` across the next several presses and the class stays on. Dispatching
     the event is the dialogue being opened and dismissed, which is what a press is. */
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

/* ---------- WHAT THE PAGE IS, IN ONE STRING ------------------------------------------------------
   Read before and after every press. Wide on purpose — see the header. The markup is LENGTH rather
   than content because a repaint that rebuilds identical markup is not a change anybody can see,
   and hashing four thousand result cards per press would cost more than the press. */
function stateOf(id) {
  const scr = document.getElementById('s-' + id);
  const sheet = document.getElementById('sheet');
  let store = 0;
  try { for (let i = 0; i < localStorage.length; i++) store += (localStorage.getItem(localStorage.key(i)) || '').length; } catch (e) {}
  const toast = document.getElementById('toast');
  /* HASHED, NOT MEASURED. The first version compared `innerHTML.length`, and a repaint that swaps
     one class for another of the same length reads as nothing having happened — which is precisely
     the fault this file is for, reported as a clean press. Caught on `book-edit`: 18,804 characters
     before and 18,804 after, with the grid's open state genuinely different underneath. A 32-bit
     rolling hash over the markup costs a millisecond and cannot be fooled that way. */
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  return [
    scr ? hash(scr.innerHTML) : -1,
    /* A TICK IS A PROPERTY, NOT MARKUP. `checked` moves without touching `innerHTML`, so a checkbox
       whose whole effect is the box it ticks — `qual-tick` unticking another level's Teach, say —
       read as a press that did nothing. Counted per screen; there are a few dozen. */
    scr ? [...scr.querySelectorAll('input[type=checkbox],input[type=radio]')].map(x => x.checked ? 1 : 0).join('') : '',
    sheet && !sheet.classList.contains('hidden') ? hash((document.getElementById('sheet-body') || {}).innerHTML || '1') : 0,
    /* AND THE DROP-DOWN, which is the booking form's list of answers and is a sibling of the screens
       for the reason `#sheet` is: `.pane` is `overflow: hidden` and would clip it. So opening it,
       ticking in it and closing it all happen outside `#s-booking` entirely, and a state read that
       stopped at the screen would call every one of them a press that did nothing. */
    (() => { const d = document.getElementById('drop');
      return d && !d.classList.contains('hidden') ? hash(d.innerHTML || '1') : 0; })(),
    typeof AT === 'undefined' ? '?' : AT,
    typeof PAGE === 'undefined' ? '?' : JSON.stringify(PAGE),
    toast ? (toast.textContent || '').trim() : '',
    store,
    window.__press.fetches,
    /* AND PRINTS, COUNTED THE WAY FETCHES ARE. A print is the one action whose whole effect is
       OUTSIDE the page: `mat-print` builds an A4 sheet, appends it to the end of `document.body`,
       calls `window.print()` and takes it away again — so a state read that stops at `#s-<id>` and
       the sheet sees it as a press that did nothing, and one that watched `body` instead would see
       only the few hundred milliseconds the paper is there. What actually happened is that the
       browser was asked to print, so that is what is measured. */
    window.__press.prints,
  ].join('|');
}

/* ---------- IS THE APP STILL THERE ---------------------------------------------------------------
   Three facts, each of which has been false in this repository's history: `go` gone is the boot
   failure the splash used to cause by wiping the body; a missing section is the tab-with-no-screen
   fault `check-doors.js` rule 1 exists for; and "this screen did not draw" is `paint`'s own catch,
   which `check/ui.js` learned to look for after 88 combinations reported nothing while a person's
   profile was an error card. */
function aliveIn(id) {
  const scr = document.getElementById('s-' + id);
  return {
    go: typeof go === 'function',
    screens: document.querySelectorAll('.screen').length,
    broke: !!(scr && /did not draw/i.test(scr.textContent || '')),
  };
}

/* BOTH OF THOSE RUN IN THE PAGE, NOT HERE. They are written as ordinary functions so they can carry
   their reasons, and injected by their own source — which is the only way `page.evaluate` can call
   them by name without every caller passing them across the boundary. */
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
    /* THE DISPATCHER'S OWN LINE. Anything else on the error channel is a 404 for a photograph or a
       codec the container does not have, and reporting those as broken handlers would be the
       95-findings-with-2-real-ones fault `check-rows.js` records. */
    if (/^\[[a-z0-9-]+\]/i.test(t)) raw.push('handler: ' + t.slice(0, 200));
  });


  await page.route('**://script.google.com/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));

  if (who.user) await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, who.user);
  await page.addInitScript(GUARDS);
  await page.addInitScript({ content: PAGE_HELPERS });
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);

  /* THE SEED MUST ACTUALLY HAVE WORKED, and so must its absence. A seeded key the app ignores
     would press the stranger's controls twice and report it as coverage — "I did not press it"
     printed as "I pressed it and it was fine", which is this project's recurring failure. */
  const signedIn = await page.evaluate(() => { try { return !!(typeof USER !== 'undefined' && USER); } catch (e) { return false; } });
  if (signedIn !== !!who.user) {
    console.error('! wanted the app ' + who.as + ' and it is not — that pass would have pressed the wrong visitor\'s controls.');
    await browser.close(); server.close(); process.exit(1);
  }

  const screens = ONLY ? [ONLY]
    : await page.evaluate(() => (typeof TABS !== 'undefined' ? TABS.map(t => t.id) : []));
  if (!screens.length) {
    console.error('! no screens to press — TABS came back empty, so this checked nothing.');
    await browser.close(); server.close(); process.exit(1);
  }



  /* ---------- ONE PRESS ---------------------------------------------------------------------------
     Pulled out of the loop because it is called twice: once where the action was last seen, and
     again after a reload when it was not there any more. */
  const pressOne = (sid, act) => page.evaluate(async ({ sid, act }) => {
    const scr = document.getElementById('s-' + sid);
    const sheet = document.getElementById('sheet');
    const open = sheet && !sheet.classList.contains('hidden');
    /* AND THE DROP-DOWN, for `#sheet`'s reason: the booking form's list of answers is outside the
       screens, so its options and its Done are on no screen and would be pressed by nothing. */
    const drop = document.getElementById('drop');
    const dropOpen = drop && !drop.classList.contains('hidden');
    /* THE ONE THAT IS NOT ALREADY CHOSEN, WHERE THERE IS A CHOICE. The first honest run reported
       `mat-level`, `mat-exam` and `timer-set` as presses that changed nothing, and all three were
       this harness pressing the option that was already selected — the answer a person gets for
       tapping the button that is already lit, which is correctly nothing. That is a fault in the
       instrument reported as a fault in the app, and it is the shape every entry in CLAUDE.md about
       a check warns of. */
    const chosen = e => e.classList.contains('on') || e.classList.contains('is-on')
      || e.classList.contains('sel') || e.getAttribute('aria-pressed') === 'true';
    const pick = root => {
      if (!root) return [];
      const all = [...root.querySelectorAll('[data-do="' + act + '"]')].filter(e => !e.disabled);
      /* THE UNCHOSEN ONES FIRST, then the rest — see `chosen` above. */
      return [...all.filter(e => !chosen(e)), ...all.filter(chosen)];
    };
    /* THE SHEET FIRST WHEN ONE IS OPEN, because it is in front and it is what a finger would reach. */
    const cands = (dropOpen ? pick(drop) : []).concat(open ? pick(sheet) : []).concat(pick(scr));
    /* PRESENT AND DISABLED IS NOT ABSENT, and it is not a fault either. `mat-print` is greyed until
       the sheet has something on it to print, and a disabled control doing nothing when it is
       pressed is the browser working correctly. Reported apart from "could not find it at all",
       because those two want opposite responses. */
    if (!cands.length) {
      const any = (dropOpen && drop ? [...drop.querySelectorAll('[data-do="' + act + '"]')] : [])
        .concat(open && sheet ? [...sheet.querySelectorAll('[data-do="' + act + '"]')] : [])
        .concat(scr ? [...scr.querySelectorAll('[data-do="' + act + '"]')] : []);
      return any.length ? { disabled: true } : { gone: true };
    }

    /* ---------- QUIET MEANS EVERY CONTROL THAT CARRIES IT IS QUIET ---------------------------------
       THE FIRST VERSION PRESSED ONE ELEMENT AND BELIEVED IT. `fm-preset` is three buttons — flyer,
       sticker, poster — and the flyer maker opens ON the flyer preset, so pressing the first of them
       asks it to become what it already is. Measured: that press changes nothing and pressing
       `sticker` changes the zoom, two checkboxes and 3,543 characters of drawing. A harness fault
       reported as an app fault, which is what every entry in CLAUDE.md about a check warns of.

       SO IT PRESSES THE NEXT ONE WHEN THE LAST CHANGED NOTHING, up to four, and the claim it ends up
       making is the honest one: no control carrying this action did anything. Four rather than all,
       because `fav` is on every card in the library and a control that is quiet on four separate
       cards is quiet. */
    let el = cands[0], where = '', changed = false;
    for (let i = 0; i < Math.min(cands.length, 4) && !changed; i++) {
      el = cands[i];
      where = el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '');
      const was = stateOf(sid);

      /* THE WAY THE APP ITSELF IS PRESSED. `dispatchEvent` rather than `.click()` because this is
         about the DISPATCH — whether the handler runs and what it does — and not about whether the
         box can be hit, which `check/ui.js` owns and measures properly.

         A SELECT AND A CHECKBOX SPEAK THROUGH `change` and the dispatcher refuses them on `click`
         outright. Moving the value on by one is what a person does; leaving it where it is and
         firing `change` would run the handler with the answer it already had and report a press
         that did nothing, which is the finding this file exists to make honest. */
      if (el.tagName === 'SELECT') {
        const opts = [...el.options].filter(o => !o.disabled);
        /* AN ANSWER, NOT THE BLANK. The booking form's selects open on an empty "Choose…" row, and
           moving the client from Test Admin to that row is choosing nobody — which the form rightly
           ignores. It passed until 5 October only because the repaint it caused left the page
           unplaced (no `on`, no styles) for longer than the 130ms below, and that difference in the
           markup was read as the press having done something; once `paint` re-placed what it drew,
           `book-set` read as quiet. The blank is pressed only when there is nothing else. */
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

    const sh = document.getElementById('sheet');
    const sheetOpen = !!(sh && !sh.classList.contains('hidden'));
    /* WHAT THE PRESS PUT IN FRONT OF SOMEBODY. A sheet's actions are on no screen at all — the
       details form, the composer, the pay sheet, the practical guide — so the only way any of them
       is ever pressed is by being collected here, while the sheet that holds them is still open. */
    const dp = document.getElementById('drop');
    const dropUp = !!(dp && !dp.classList.contains('hidden'));
    /* AND WHATEVER THE DROP-DOWN PUT THERE, for the same reason: the booking form's list of answers
       is outside the screens, so its options and its Done are collected here or nowhere. Joined to
       `inSheet` rather than given a field of its own — what the caller does with either is
       identical, and a second name would be a second list to keep in step. */
    const inSheet = (sheetOpen ? [...sh.querySelectorAll('[data-do]')].map(e => e.dataset.do) : [])
      .concat(dropUp ? [...dp.querySelectorAll('[data-do]')].map(e => e.dataset.do) : []);
    const s2 = document.getElementById('s-' + sid);
    const onScreen = s2 ? [...new Set([...s2.querySelectorAll('[data-do]')].map(e => e.dataset.do))] : [];
    return { where, changed, sheetOpen: sheetOpen || dropUp, inSheet: [...new Set(inSheet)], onScreen, alive: aliveIn(sid) };
  }, { sid, act });

  /* ---------- A CLEAN PAGE, WHICH IS THE ONLY HONEST WAY TO SAY "NOT THERE" ------------------------
     Ten actions went unpressed on the first honest run of this file and every one was the harness
     rather than the app: answering the funnel's first question takes every card off the Find screen,
     so `fav` and `spot` were gone by the time their turn came. An action missing after other presses
     is not an action that is missing. It gets a page nobody has touched, and only then is it
     reported. */
  const freshen = async (sid, state) => {
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1700);
    await page.evaluate(s => { try { go(s, false, true); } catch (e) {} }, sid);
    await page.waitForTimeout(400);
    /* BACK INTO THE STATE, not into the screen's front door. The Find screen opens on the funnel's
       question and holds ONE page — measured: four `facet-pick`s and a `facet-skip`, and nothing
       else. So a reload that stopped at `go('stuff')` put every card action out of reach exactly
       when it was being looked for. */
    if (state && state.enter) {
      await page.evaluate(src => { try { eval('(' + src + ')')(); } catch (e) {} }, String(state.enter));
      await page.waitForTimeout(400);
    }
  };

  for (const id of screens) {
  /* ---------- ONE PASS PER DECLARED STATE ----------------------------------------------------------
     `check/states.js` IS SHARED WITH `check/ui.js` and the note at its head says why it is one list.
     It earns its keep loudly here: pressing only the state a screen opens in left `fav`, `spot`,
     `qp-ans` and `filter-clear` unpressed, because answering the funnel's first question takes every
     card off the Find screen — and it left the practical guide, the films, the message thread, the
     session receipt and the basket unpressed entirely, since none of them is on a screen `go()`
     lands on. */
  const done = new Set();          /* per SCREEN, not per state: one press per action is the point */
  const missed = new Set();        /* named on this screen and not found — retried by every later state */
  for (const state of statesOf(id)) {
    const label = (state.name ? id + ' · ' + state.name : id) + (who.user ? '' : ', signed out');
    await page.evaluate(sid => { try { closeSheet(); } catch (e) {} go(sid, false, true); }, id);
    await page.waitForTimeout(300);

    /* WHOSE STATE IS THIS. `only` is the same flag `check/ui.js` reads — a widget an admin cannot
       see, a payload key a stranger has no rows for. Asking for a state this visitor cannot be in
       would report a fault about the check rather than about the app. */
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
    if (state.expect) {
      const got = await page.evaluate(src => { try { return !!eval('(' + src + ')')(); } catch (e) { return false; } }, String(state.expect));
      if (!got) { console.error('! ' + label + ' did not arrive — wanted ' + (state.wants || 'the state to be on screen')); notEntered++; continue; }
    }

    /* THE QUEUE, BY NAME rather than by element. Pressing every ELEMENT would press `qp-ans` four
       thousand times; what is worth asking once is each distinct ACTION, because the handler is the
       thing that can be broken. Re-found before every press, because the press before it may have
       rebuilt the screen. */
    /* ---------- AND FROM THE SHEET, IF THIS STATE OPENED ONE -----------------------------------
       A SHEET IS A SIBLING OF THE SCREENS, so `#s-<id>` cannot see inside one — and a state whose
       `enter` opens a sheet therefore queued NOTHING, because the only other route to a sheet's
       actions is `out.inSheet`, which is collected after a press.

       MEASURED: a sheet's three actions (a feature since deleted) were never pressed, and
       `check/press.js` reported a clean run over 93 actions with the three of them untouched.
       Proved by breaking one of them outright — the mutant survived, which is the definition of a
       check that cannot fail. The practical guide's state was in the same hole and got away with it
       only because the boxes it holds are `qp-ans`, which is pressed on a question card elsewhere.

       THE STATE IS THE THING THAT PUT IT THERE, so it is seeded here rather than reached by a
       press. That is the same argument `check/ui.js` makes for adding `#sheet` to its measured
       roots: the declared state IS the app's own door, and a sheet that a state opened is a surface
       somebody is on. */
    /* ---------- AND EVERY WIDGET ON IT STARTED BEFORE THE QUEUE IS READ ----------------------------
       ARRIVING AT A COLUMN STARTS ITS WIDGETS A FEW AT A TIME NOW (`widgetsLater_`, arcade.js), and a
       widget draws most of its controls in `start` — Connect 4's columns, Othello's squares, the
       round games' Start. Read 300ms after arriving, the queue held the column's `New game` buttons
       and not the boards they reset, so `c4-again` was pressed on a board nobody had played and read
       as doing nothing; the base commit started everything at once, the cells were found first in
       document order, a counter was dropped, and `New game` had something to undo. Measured on
       6 October: base green, branch 8 quiet (`c4-again`, `oth-again`, `rg-next`, `rg-again`, both
       visitors), the same screen in the same harness. So the queue waits for the widget queue and
       the after-slide jobs to run dry — the app's own idea of "arrived" — bounded at 6s. */
    await page.evaluate(async () => {
      const t0 = performance.now();
      const busy = () => (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length > 0)
        || (typeof AFTER_SLIDE_JOBS !== 'undefined' && AFTER_SLIDE_JOBS.size > 0)
        || (typeof AFTER_SLIDE !== 'undefined' && !!AFTER_SLIDE);
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
      /* A RELOAD ONLY FOR SOMETHING THIS STATE ACTUALLY HAD. An action that arrived in the queue
         because an earlier press put it on the screen belongs to a later state, and reloading for it
         here costs two and a half seconds to look in the one place it was never going to be. */
      if (out.gone && seeded.has(act)) { await freshen(id, state); out = await pressOne(id, act); }
      if (out.disabled) { results.push({ screen: label, action: act, disabled: true }); continue; }
      /* NOT MARKED DONE WHEN IT WAS NOT THERE. An action queued in one state because a press put it
         on the screen belongs to a LATER state — `fav` and `spot` are on result cards and the Find
         screen's question state holds no cards at all. Marking it done here is how four card
         actions went unpressed while the state that has them ran next. */
      if (out.gone) { missed.add(act); done.delete(act); continue; }
      missed.delete(act);

      pressed++;
      results.push({ screen: label, action: act, where: out.where, changed: out.changed,
                     errs: raw.slice(before), alive: out.alive });

      /* THE SHEET IS PRESSED NOW, WHILE IT IS OPEN. Queueing its actions to the end is what the
         first version did, and the loop closes the sheet after every press — so `post-save` and
         `post-delete` came up for their turn against a screen that had not held them for twenty
         presses. Depth one: a sheet opened from inside a sheet is a state this app does not have. */
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

      /* BACK TO THE SCREEN, because a press is allowed to navigate and the next one has to be asked
         of the screen it belongs to. The sheet is closed for the same reason — an open one would
         hide the screen's own actions behind whatever it holds. */
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

  /* ==================================================================================================
     AND THE OTHER THING A FINGER DOES.

     EVERY SCREEN IN THIS APP IS REACHED BY A SWIPE and nothing anywhere measured one. The tabs are a
     second way in, so a broken gesture would leave the app looking usable on a desktop and be the
     whole navigation gone on a phone — which is the shape `overworld.js` already records twice: the
     grid listened for `touchstart` alone and did nothing at all with a mouse, and a `setPointerCapture`
     on every press meant the release went to the root and no card, chip or tick ever answered.
     "Nothing threw. The app rendered perfectly and simply stopped answering."

     A REAL DRAG, NOT A CALL TO `go`. `page.mouse` produces the pointer events the window listens for,
     in the order and at the pace a hand makes them, so this exercises the thresholds, the axis lock
     and the velocity — none of which a direct call touches.

     BOTH DIRECTIONS AND BOTH AXES, and the ends are part of the test: a swipe left from the last
     column must stay on the last column rather than sliding into nothing. */
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

    const drag = async (x0, y0, dx, dy) => {
      await page.mouse.move(x0, y0);
      await page.mouse.down();
      for (let i = 1; i <= 10; i++) { await page.mouse.move(x0 + dx * i / 10, y0 + dy * i / 10); await page.waitForTimeout(9); }
      await page.mouse.up();
      await page.waitForTimeout(400);
    };

    const tabs = await page.evaluate(() => (typeof TABS !== 'undefined' ? TABS.map(t => t.id) : []));
    for (let i = 0; i < tabs.length; i++) {
      for (const [dir, x, dx, want] of [['left', 320, -230, tabs[Math.min(i + 1, tabs.length - 1)]],
                                        ['right', 70, 230, tabs[Math.max(i - 1, 0)]]]) {
        await page.evaluate(id => go(id, false, true), tabs[i]);
        await page.waitForTimeout(240);
        await drag(x, 420, dx, 0);
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
      await drag(195, 600, 0, -260);
      const up = await page.evaluate(x => PAGE[x], id);
      swipes.push({ from: id, dir: 'up', got: String(up), want: '1', ok: up === 1 });
      await drag(195, 300, 0, 260);
      const down = await page.evaluate(x => PAGE[x], id);
      swipes.push({ from: id, dir: 'down', got: String(down), want: '0', ok: down === 0 });
    }

    /* ==================================================================================================
       AND A SWIPE THAT STARTS ON A CONTROL MUST NOT PRESS IT.

       EVERY SWIPE ABOVE STARTS ON BARE CARD, which is why they were all green while the worst
       navigation fault this app has had was live. The browser fires a `click` after a drag, on the
       nearest common ancestor of where the finger went down and where it came up — so a downward
       swipe beginning on an answer row was delivered as a press of that row.

       WHAT IT LOOKED LIKE, reported: "if i scroll down far enough then scroll back up eventually the
       widgets above disappear". Measured on the Find screen: twenty-five drags, the page never
       moved once, and the funnel answered three more questions on its own — 5,333 results down to
       four and then to the first question with nothing behind it.

       SO THE TEST STARTS THE DRAG ON THE CONTROL, which is the only way to ask this question, and
       wants two things of it: the page turns, and nothing is answered. `PRESS_MOVED` in shell.js is
       what makes both true. Proved by mutation — take it out and the Find screen reports
       `turned 0 pages` with its chips changed underneath. */
    for (const id of tabs) {
      const n = await page.evaluate(x => { go(x, false, true); return typeof pageCount === 'function' ? pageCount(x) : 0; }, id);
      await page.waitForTimeout(280);
      if (n < 2) continue;
      await page.evaluate(x => goPage(x, 0, true), id);
      await page.waitForTimeout(260);
      /* THE NEAREST CONTROL TO THE MIDDLE OF THE SCREEN, because that is where a thumb lands. A
         column whose first page carries none is skipped rather than reported.

         ASKED AGAIN AFTER THE DRAG, which is why it is a function rather than a value. The drag
         below turns the page — that is the whole thing it asserts — so a coordinate taken before it
         names a control that has since slid off the screen. The press-mark rule was written against
         the stale one and reported five columns lit nothing; every one of them was the harness
         pressing empty card, which is the shape every entry under `check/load.js` already records
         about this kind of probe lying in whichever direction is easiest to believe. */
      const findSpot = () => page.evaluate(x => {
        const host = document.getElementById('s-' + x);
        if (!host) return null;
        let best = null;
        host.querySelectorAll('[data-do]').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width < 24 || r.height < 16 || r.top < 120 || r.bottom > 760) return;
          const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
          /* ---------- AND SOMETHING HAS TO BE THERE WHEN A REAL FINGER ARRIVES ------------------
             A RECT IS A LAYOUT POSITION AND A PANE CLIPS. The star tile at the foot of a widget
             card on Tools and on Games reports a box in the middle of the screen and
             `elementsFromPoint` at its own centre gives the bare `.screen` — it is below its pane's
             fold, so it is drawn nowhere and a mouse lands on nothing. Every press this file made
             before the press-mark rule went in was `dispatchEvent`, which needs no hit test and
             says so in the header; the moment one of them became a real pointer the finder had to
             answer the other question too.
             IT MAKES THE DRAG ABOVE HONEST AS WELL. A drag from a point where the control is not
             begins on bare card, which is the exact case that test exists to stop being the only
             one measured — and it would have gone on passing while proving nothing. */
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

      /* ==================================================================================================
         AND THE THING YOU PRESSED HAS TO LIGHT UP WHILE THE SCREEN IS THINKING.

         `:active` ENDS AT THE LIFT and the funnel's answer takes 130 ms to arrive at 8x CPU, so a
         tap was a flash, an eighth of a second of an unchanged screen, and then the answer —
         reported as *"make the button pressing feel more responsive on the finder"*. `pressMark_`
         in shell.js puts `.is-pressed` on at `pointerdown` and takes it off two frames after the
         handler ran.

         NOTHING ELSE HERE CAN SEE EITHER HALF OF THAT. The press pass reaches a control with
         `dispatchEvent`, which fires no `pointerdown` at all; `check/ui.js` measures whether a
         control can be read and hit, and a control with no press state measures perfectly.

         TWO QUESTIONS, BECAUSE THE TWO FAILURES ARE OPPOSITE. A mark that never goes ON is the app
         silently back to feeling dead; a mark that never comes OFF is a control that looks
         permanently pressed. And the drag above is the third: a swipe that began on this control
         must not leave it lit for the length of the gesture, which is why this runs AFTER it —
         anything still marked here is a mark the drag failed to clear.

         REAL POINTER EVENTS, for the reason the swipes are real: a class added on `pointerdown` is
         invisible to a dispatched click, which is exactly the hole this rule is closing. */
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

    /* ==================================================================================================
       AND A MOUSE IGNORES `touch-action`, WHICH IS WHY EVERY SWIPE ABOVE WAS GREEN OVER A REAL FAULT.

       `page.mouse` is the right instrument for the thresholds, the axis lock and the velocity — and
       it is blind to the one property that decides whether the app is handed the gesture at all.
       `touch-action` applies to touch and to nothing else, so a box that swallows every drag on a
       phone measures perfectly with a cursor. That is this project's own recurring shape one layer
       down: an instrument that cannot reach its subject reporting that the subject is fine.

       WHAT IT COST: a blanket `touch-action: pan-y` on every `textarea` in the app. Measured with
       real touch events, a `pan-y` DIV with nothing to scroll hands the gesture back (`#docket-body`
       at 28/28 turns the page) and a `pan-y` TEXTAREA never does — a drag inside a text control is a
       SELECTION, so the browser sends one `pointermove` and then `pointercancel`. You could land on
       the notepad, the comment box, the message composer or a question card's answer box and not be
       able to swipe off it in either direction.

       SO THE RULE IS THE NARROW ONE THE FAULT SHARES: a box with nothing to scroll must not keep the
       gesture. Asked of every surface in the app that carries its own touch behaviour, in the axis
       it cannot use — and a box that CAN scroll is not asked, because keeping the drag is then what
       somebody reached for, which is the argument the stylesheet makes beside those rules. */
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
    /* `.ws` AND `.ss-chips` ARE NOT KEEPERS — THEY ARE HERE TO PROVE THEY ARE NOT. The word search
       and the sentence scramble are grids of small buttons a finger lands on to swipe as often as to
       tap, and both chose taps over a drag precisely so that a swipe starting on them would still be
       the grid's (see `WS_THEMES` in games.js). A mouse cannot say whether that holds on a phone;
       real touch events can. */
    const KEEPERS = 'textarea, .msg-body, #docket-body, .feed-text, .widget-squeeze, .ws, .ss-chips';
    for (const id of tabs) {
      await page.evaluate(x => go(x, false, true), id);
      await page.waitForTimeout(420);
      const n = await page.evaluate(x => (typeof pageCount === 'function' ? pageCount(x) : 0), id);
      for (let i = 0; i < n; i++) {
        /* `go` AS WELL AS `goPage`, EVERY PAGE. The sideways swipe below leaves the app on the NEXT column,
           and `goPage` alone turned this column's page while it sat off-screen to the left — so after the
           first sideways swipe on a column every later page's spots were measured at x < 0, filtered out as
           off the screen, and never swiped from. Found because the sentence scramble's chips, eleven pages
           into Games, were never measured. */
        await page.evaluate(a => { go(a.id, false, true); goPage(a.id, a.i, true); }, { id, i });
        await page.waitForTimeout(460);
        const spots = await page.evaluate(a => {
          const pane = [...document.querySelectorAll('#s-' + a.id + ' .pane')][a.i];
          if (!pane) return [];
          return [...pane.querySelectorAll(a.sel)].map(el => {
            const r = el.getBoundingClientRect();
            if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) return null;
            if (r.width < 40 || r.height < 24) return null;
            /* NOT ON A DROPDOWN. A `<select>` (and anything marked `data-noswipe`) keeps the gesture
               on purpose — `axisFree` says so — so a swipe that happens to START on one measures that
               rule rather than this one. The flyer maker lost its preview and the middle of its box
               became a select; the spot is walked down the box to the first point that is not one. */
            let x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
            /* AND PREFERABLY ON THE BOX ITSELF rather than on a control inside it: a touch is SNAPPED
               to a nearby control by the browser's touch adjustment, so a point on a label an inch from
               a select still arrives as a press on the select. A gap in the box has nothing to snap to. */
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

    /* ==================================================================================================
       A SECOND FLICK WHILE THE FIRST IS STILL SETTLING GOES THE WAY THE FINGER WENT

       THE SETTLE LEAVES AT THE FINGER'S SPEED NOW (`settleCurve_` in shell.js), which makes it longer,
       and a card still moving can be caught by the next touch (`SWIPE.catch` in overworld.js). The
       first version of that catch put the card's leftover distance into the DECISION as well as the
       placement — so a second flick up 30ms after the first carried hundreds of pixels the other way
       and turned the page back: 1, 2, 1. Every rule above swipes from rest, so none could see it; the
       review told to refute the change found it with a probe, and this is that probe. Up then up must
       advance two pages, up then down must come back, at gaps inside the settle and one after it. */
    /* A REAL FLICK, sent the way a phone sends one: a move every 8ms of wall time, NOT awaited one by
       one. Awaiting each round trip spaced the moves 33ms apart, so eight of them took a quarter of a
       second and the "flick" was a slow drag at 0.2px/ms that no version of the code would ever turn a
       page on — measured, and it cost a wrong fix before it was understood. */
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
      /* A SHORT SECOND FLICK, because that is where the fault bites: the card's leftover distance
         has to outweigh the finger's travel for a decision that counts it to go the wrong way.
         Measured here, a flick 20-40ms after the first catches the card 30-50px short of its page, so
         a 40px flick — a flick by speed, and turned on its own — is the one a wrong rule turns back or
         drops. */
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

    /* ==================================================================================================
       A TALL QUESTION CARD IS READ BY SWIPING AND LEFT BY SWIPING, WHICH IS TWO CLAIMS

       431 OF 5,032 QUESTION CARDS ARE TALLER THAN THE PANE -- `check/cards.js` counts them -- and the
       answer is that such a pane gets `overflow-y: auto` from `paneReach_` while `scrollHost_` in
       overworld.js scrolls it from the app's own drag. Both halves matter and only one of them is
       obvious:

         THE FIRST ATTEMPT GAVE THE PANE `touch-action: pan-y`, which is what `padReach_` does for
         the notepad and is wrong here. `touch-action` is read once at the start of a gesture and
         cannot say "at the bottom, going up", so the browser kept every vertical gesture for ever:
         measured, the card scrolled to its end and then three more swipes left the page where it
         was. A question card you cannot leave is worse than one you cannot finish reading.

       SO THE CHECK IS THE CONTRACT RATHER THAN THE MECHANISM: a swipe up on a tall card scrolls it
       and does not turn the page; at the bottom the next swipe DOES turn the page. Neither half is
       visible to anything else here -- `check/cards.js` measures the height and `check/ui.js`
       measures the screen, and a card that scrolls perfectly and can never be left measures clean
       in both. */
    /* ON THE NARROW PHONE. With stems on their own pages and long parts cut, no question page is
       tall enough at 390 x 844 to need the scroll: `paneReach_` draws a card down to 70% before it
       scrolls, and the tallest left at 390 comes within a pixel of fitting. At 320 x 568 this one is
       still 679px past the pane, so the scroll is there to test. Put back straight after. */
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(400);
    const tall = await page.evaluate(async () => {
      if (typeof stuffItems !== 'function') return null;
      go('stuff', false, true);
      /* A CARD THAT IS STILL TALL. 8464/B/1H Q02.4 was the one, and it stopped being tall when its
         stem became a page of its own and a long part was cut between paragraphs (`partChunks_`).
         This worksheet question is one paragraph of 1,173 characters -- a transcription with no
         breaks in it, which the cut will not break inside -- so it is tall on every phone. */
      const want = stuffItemsAll_().find(x => x.row && x.row.row_id === 'Q-1CM-probability-tree-diagrams-12');
      const facet = FACETS.find(f => f.field === 'paperId');
      STUFF.q = ''; STUFF.filters = want && facet ? [{ field: 'paperId', value: facet.of(want) }] : [];
      paintStuff(true);
      await new Promise(r => setTimeout(r, 400));
      const items = stuffFiltered();
      const i = items.findIndex(x => x.row && x.row.row_id === 'Q-1CM-probability-tree-diagrams-12');
      if (i < 0) return null;
      /* BY PAGE, NOT BY RESULT — a practical is four pages, so a result's index is not its page
         once one sorts ahead of it. `stuffPageOf_` is the app's own mapping. */
      goPage('stuff', stuffPageOf_(items[i]) + stuffFirstResult_(), true);
      await new Promise(r => setTimeout(r, 600));
      const pane = [...document.querySelectorAll('#s-stuff > .page')][domIndex_('stuff', PAGE.stuff || 0)]
        .querySelector('.pane');
      return { page: PAGE.stuff, room: pane.scrollHeight - pane.clientHeight };
    });
    if (!tall || tall.room < 200) {
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
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);

    /* ==================================================================================================
       AND A LINE OF BEST FIT IS A SIDEWAYS DRAG ON A PAGE THAT SLIDES SIDEWAYS.

       REPORTED AS "when i try draw a line of best fit it slides the whole widget to the left and
       becomes hard to do". `.qpad.is-drawing .qpad-ink` has carried `touch-action: none` since the
       pen was written, and that stops the BROWSER: the grid's swipe is a `pointermove` listener on
       the window, which never asks the browser for anything, so no `touch-action` anywhere can
       refuse it. Two halves of one sentence and only one of them was ever said.

       THE SAME SHAPE AS THE BLANKET `pan-y` ON EVERY TEXTAREA, one rule along, and found the same
       way: `page.mouse` cannot see it either, because what the pen and the grid are arguing over is
       the gesture rather than the scroll. The pad names itself `[data-noswipe]` while the pen is on,
       which is the list `axisFree` already reads.

       BOTH STATES, BECAUSE ONLY ONE OF THEM IS THE FAULT. Pen on: the stroke is kept and the column
       does not move. Pen OFF: the picture is an ordinary picture and a swipe past it still changes
       column -- a diagram you cannot swipe past is a page with no way off, which is the argument
       written over `.qpad-ink` in the stylesheet and the reason the mark is not permanent.

       Proved by mutation: take the attribute off and the stroke above carries the column from
       `stuff` to `dm`, which is the screenshot the owner sent. */
    {
      const PEN_PAPER = 'RS1786302107764-481';         // May 2017 Foundation, Q6(i): annotate a scale
      const PEN_ROW = 'Q-1MA1-1706-1F-6i';
      const box = await page.evaluate(async a => {
        if (typeof stuffFiltered !== 'function') return null;
        go('stuff', false, true);
        STUFF.q = ''; STUFF.filters = [{ field: 'paperId', value: a.paper }];
        paintStuff(true);
        await new Promise(r => setTimeout(r, 500));
        const hit = stuffFiltered().find(x => x.row && x.row.row_id === a.row);
        if (!hit) return null;
        /* ITS FIGURE PAGE, the one after the question: the pen moved with the picture. */
        goPage('stuff', stuffPageOf_(hit, 'fig') + stuffFirstResult_(), true);
        window.__penSel = '#s-stuff .qfig .qpad[data-k="' + padKey_(hit) + '"]';
        await new Promise(r => setTimeout(r, 650));
        /* ---------- `.qpad-lock`, BECAUSE THE PICTURE CARRIES THE SAME ACTION NOW ------------
           THIS WAS `[data-do="pad-draw"]` AND IT STOPPED BEING UNAMBIGUOUS. `padWrap_` puts the
           action on `.qpad-art` while the pen is off — the second door, and the one a finger
           finds — and the art comes FIRST in the markup, so `querySelector` handed this the
           PICTURE. Steps 1 and 2 below still passed, because tapping the picture really does arm
           the pen; step 3, which taps the same point to turn it back OFF, landed on the ink
           instead and drew a dot. The pen stayed on, the swipe after it was correctly refused,
           and this reported the app broken. `padArm_` in find.js names the same class for the
           same reason. */
        const pad0 = document.querySelector(window.__penSel);
        const btn = pad0 && pad0.querySelector('.qpad-lock');
        const art = pad0 && pad0.querySelector('.qpad-art');
        const ink = pad0 && pad0.querySelector('.qpad-ink');
        if (!btn || !ink) return null;
        const r = ink.getBoundingClientRect(), b = btn.getBoundingClientRect();
        return { at: AT, page: PAGE.stuff, door: !!(art && art.getAttribute('data-do')),
                 ink: { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2),
                        w: Math.round(r.width), h: Math.round(r.height) },
                 btn: { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } };
      }, { paper: PEN_PAPER, row: PEN_ROW });
      if (!box || box.ink.w < 80) {
        swipes.push({ from: 'stuff · the pen on a diagram', dir: 'touch across', ok: false,
                      got: box ? 'the pad was ' + box.ink.w + 'px wide' : 'no pad on that card',
                      want: 'a question card carrying a pad' });
      } else {
        /* A TAP IS `touch(x, y, 0, 0)` AND NOT `el.click()`. The stroke below sets `PRESS_MOVED`,
           and a synthetic click cannot clear it because nothing sent a `pointerdown` first -- so
           the second press would be swallowed and the pen would read as stuck on. On a phone a tap
           always sends one. Measured: with `el.click()` this reported the pen still on. */
        /* ---------- A DRAG ON THE PICTURE IS A SWIPE, AND IT MUST NOT ARM THE PEN -------------
           THE PICTURE IS A DOOR NOW, so the one thing that could go wrong with it is that every
           swipe beginning on a diagram arms a pen nobody asked for — 26 rows in the library carry
           one, and on those cards the picture is the biggest thing to put a thumb on. What stops
           it is `PRESS_MOVED` in shell.js, which swallows the click a drag produces; this is the
           only instrument that can ask, because a mouse cannot produce the gesture and a
           dispatched click never travels. */
        const armedByDrag = await (async () => {
          if (!box.door) return 'the picture carries no action, so the only way to arm the pen is '
                              + 'a button under the card — which is what the report was about';
          const k0 = tabs.indexOf('stuff');
          await touch(box.ink.x + 60, box.ink.y, -140, 0);
          const r2 = await page.evaluate(() => ({ at: AT,
            on: !!document.querySelector(window.__penSel + '.is-drawing') }));
          if (r2.on) return 'a swipe beginning on the picture armed the pen';
          if (k0 + 1 < tabs.length && r2.at !== tabs[k0 + 1])
            return 'a swipe beginning on the picture did not change column — it landed on ' + r2.at;
          await page.evaluate(x => go(x, false, true), 'stuff');
          await page.waitForTimeout(420);
          return '';
        })();
        swipes.push({ from: 'stuff · a swipe beginning on the picture', dir: 'touch left',
                      ok: !armedByDrag,
                      got: armedByDrag || 'the column moved and the pen stayed off',
                      want: 'the column moves and nothing is armed' });

        /* THE PICTURE, NOT THE BUTTON, because the picture is the gesture people actually make and
           the button is already covered by the press pass above. */
        await touch(box.ink.x, box.ink.y, 0, 0);
        const on = await page.evaluate(() => {
          const pad = document.querySelector(window.__penSel);
          return pad && pad.classList.contains('is-drawing')
            && !!pad.querySelector('.qpad-ink[data-noswipe]')
            && !pad.querySelector('.qpad-art[data-do]');
        });
        swipes.push({ from: 'stuff · a tap on the picture', dir: 'tap', ok: on,
                      got: on ? 'the pen is on, the pad is named and the picture is no longer a door'
                              : 'the pen did not come on',
                      want: 'the pen on' });
        if (on) {
          /* SCALED TO THE PAD, NOT IN FIXED PIXELS. It was `y + 30` up by 50, written against a
             pad that held the spinner and the scale in one picture; a paper audit moved the spinner
             onto a shared preamble, this part's own pad became the 66-unit probability scale, and
             the stroke started below its bottom edge -- on the card, where a drag correctly turns
             the page. What is asked is a diagonal stroke that begins and ends on the ink. */
          await touch(box.ink.x - Math.round(box.ink.w * 0.35), box.ink.y + Math.round(box.ink.h * 0.3),
                      Math.round(box.ink.w * 0.7), -Math.round(box.ink.h * 0.6));
          const drew = await page.evaluate(() => {
            const pad = document.querySelector(window.__penSel);
            const k = pad && pad.getAttribute('data-k');
            let n = 0;
            try { n = (JSON.parse(localStorage.getItem(k) || '[]') || []).length; } catch (e) {}
            return { at: AT, page: PAGE.stuff, strokes: n };
          });
          swipes.push({ from: 'stuff · a line of best fit', dir: 'touch across',
                        ok: drew.at === box.at && drew.page === box.page && drew.strokes >= 1,
                        got: drew.at + ' page ' + drew.page + ', ' + drew.strokes + ' stroke(s) kept',
                        want: box.at + ' page ' + box.page + ', 1 stroke(s) kept' });
          await touch(box.btn.x, box.btn.y, 0, 0);
          const k = tabs.indexOf('stuff');
          if (k + 1 < tabs.length) {
            await touch(box.ink.x, box.ink.y, -170, 0);
            const off = await page.evaluate(() => AT);
            swipes.push({ from: 'stuff · the same picture, pen off', dir: 'touch left',
                          ok: off === tabs[k + 1], got: off, want: tabs[k + 1] });
          }
        }
      }
    }

    /* ==================================================================================================
       AND A TAP ON THE GAME FLAPS ON THE FINGER GOING DOWN, NOT ON IT COMING UP.

       REPORTED AS "when you tap theres like a slight delay" ON AN IPAD, and the delay was the
       binding: the flap hung off `click`, which fires on the RELEASE, so every flap this game has
       taken waited out the whole of a tap — the eighty to a hundred and fifty milliseconds between
       a finger landing and it lifting — before the bird moved.

       NOTHING ELSE IN THIS SUITE CAN SEE THAT, which is why the rule is here. `check/ui.js` asks
       whether a control can be read and hit, and a late control measures perfectly. The press pass
       above DISPATCHES at elements rather than touching them, so it never produces the gap. And the
       canvas carries no `data-do`, so it is not in that queue at all.

       THE QUESTION IS ASKED BETWEEN `touchStart` AND `touchEnd`, which is the one moment the two
       bindings differ — with `click` nothing has happened yet and with `pointerdown` the bird is
       already on its way up. Anything measured after the lift passes either way, which is exactly
       how a check that cannot fail gets written.

       AND THE LOOP IS STOPPED AFTERWARDS, by hand rather than by leaving the column: a
       `requestAnimationFrame` running behind the pages walked below would be sharing their frame
       budget, and that is what the widget's own `stop` exists for. */
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

    /* ==================================================================================================
       AND THAT PAGE n SHOWS QUESTION n, WHICH STOPPED BEING FREE.

       THE FIND SCREEN HOLDS FIFTEEN RESULT PAGES AND HAS THOUSANDS -- see `stuffWindow_` in find.js.
       So a page number and a DOM position are no longer the same number, and every reader of one
       goes through `domIndex_` / `logIndex_`. Nothing else in this suite can see that mapping: a
       card rendered in the wrong position measures perfectly, lays out perfectly, presses perfectly
       and is the wrong question.

       WALKED FORWARDS AND BACKWARDS, because the window slides both ways and recycles its elements
       by moving them from one end to the other -- an off-by-one in either direction shows up only
       when you arrive from the other side.

       ASSERTED ON THE ANSWER BOX'S KEY, `ans:...:q:<row_id>`, which is the one thing on a question
       card that names the row it was built from and cannot be confused with a heading: `Q6(i)` and
       `Q6(ii)` both start `Q6`. */
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
          /* ---------- A QUESTION WITH A PICTURE IS TWO PAGES NOW, its words and then its figure —
             "across the board of all resources the diagrams should be its own widgets". So the walk
             is over `stuffPages_`, the app's own list, and each page is asked the right question: a
             question page carries its own answer key; a figure page names its row in `data-of`,
             carries NO answer box (the box stays with the words), and comes straight after its
             question.
             AND ITS ANSWER IS A PAGE TOO, after the figure where there is one -- *"answers ... to be
             their own widget"*. An answer page names its row, carries no answer box, and follows its
             own question or that question's figure; a question page carries no answer page inside
             it. Asked FIRST of an answer page, because it carries the answer box's key in `data-k`
             and would otherwise pass as its question. */
          const look = i => {
            goPage('stuff', first + i, true);
            const el = document.querySelectorAll('#s-stuff > .page')[domIndex_('stuff', first + i)];
            const pg = pages[i], id = pg.x.row.row_id;
            const html = el ? el.innerHTML : '';
            /* ---------- AND A STEM AND ITS FIGURE IN FRONT OF THE PARTS, IN THE PAPER'S ORDER --------
               *"preserve order of question from exam"*: a shared stem is its own page (`stemN`) and its
               figure the page after it (`sfigN`), both naming the STEM's row in `data-of`, both
               standing in front of the part they belong to -- a stem's figure straight after its
               words where it has words. And *"diagram widgets shouldn't have a question number on
               them"*: every figure page's header is asked for `Q<digit>` and must not have one. */
            /* `stemN-J` is a long stem's later page, and `preJ` a long part's first pages -- see
               `stemChunks_` and `partChunks_`. A `pre` page names its own row and carries no box: the
               box is on the card, which the pre pages lead straight into. */
            const stem = /^(stem|sfig)(\d+)(?:-\d+)?$/.exec(pg.part || '');
            const pre = /^pre\d+$/.test(pg.part || '');
            const sid = stem ? (pg.x.stems[+stem[2]] || {}).id : '';
            const head = ((el && el.querySelector('.qcard-top b')) || {}).textContent || '';
            let ok;
            /* ---------- AND A FIGURE WHERE THE PAPER PRINTS IT -------------------------------------------
               *"text, then diagram, then text then diagram then text ... same order but diagram has its
               own widget"*: a part's figure (`fig`) can stand in front of its card, between its pre
               pages, or after the card (`partPlan_`), and a stem's (`sfigN`) between its words. So a
               pre page leads into its own next page -- another pre, the figure, or the card -- and a
               figure page belongs to the question on one side of it or the other, never to nobody. */
            if (pre) {
              const next = pages[i + 1];
              ok = /class="qcard qpre/.test(html) && html.indexOf('data-of="' + id + '"') !== -1
                && html.indexOf('qp-ans') === -1 && !!next && next.x === pg.x
                && (!next.part || /^pre\d+$/.test(next.part) || next.part === 'fig');
            } else if (stem) {
              const next = pages[i + 1];
              ok = !!sid && html.indexOf('data-of="' + sid + '"') !== -1 && html.indexOf('qp-ans') === -1
                && !!next && next.x === pg.x
                && (stem[1] === 'stem' ? /class="qcard qstem/.test(html) : !/\bQ\d/.test(head))
                && (stem[1] === 'stem' || i === 0 || pages[i - 1].x !== pg.x
                    || /^stem/.test(pages[i - 1].part || '') && pages[i - 1].part.split('-')[0] === 'stem' + stem[2]
                    || /^sfig/.test(pages[i - 1].part || ''));
            } else if (pg.part === 'ans') {
              ok = /class="qcard qans-card/.test(html) && html.indexOf('data-of="' + id + '"') !== -1
                && html.indexOf('qp-ans') === -1
                && i > 0 && pages[i - 1].x === pg.x && (!pages[i - 1].part || pages[i - 1].part === 'fig');
            } else if (pg.part === 'fig') {
              const next = pages[i + 1];
              ok = html.indexOf('data-of="' + id + '"') !== -1 && html.indexOf('qp-ans') === -1 && !/\bQ\d/.test(head)
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
          const items = pages, figs = pages.filter(pg => pg.part === 'fig' || /^sfig/.test(pg.part || '')).length;
          const stems = pages.filter(pg => /^stem/.test(pg.part || '')).length;
          const answers = pages.filter(pg => pg.part === 'ans').length;
          return { n: items.length, figs: figs, answers: answers, stems: stems, bad: out.slice(0, 4), count: out.length,
                   held: document.querySelectorAll('#s-stuff > .page').length };
        });
        walk.push({ from: 'stuff, ' + bad.n + ' pages (' + bad.figs + ' of them figures, ' + bad.stems
                          + ' stems, ' + bad.answers + ' answers) over ' + bad.held + ' elements',
                    dir: 'walk', ok: bad.count === 0 && bad.figs > 0 && bad.answers > 0 && bad.stems > 0,
                    got: bad.count ? bad.count + ' wrong, first ' + JSON.stringify(bad.bad[0])
                         : !bad.figs ? 'no figure page on a paper that has pictures'
                         : !bad.stems ? 'no stem page on a paper whose questions share stems'
                         : !bad.answers ? 'no answer page on a paper that has answers'
                         : 'every page its own question, figure or answer',
                    want: 'every page its own question, each figure beside its own words and each answer straight after its question' });
      }
    }
    swipes.push(...walk);
    await page.close();

    /* ==================================================================================================
       A DROPDOWN TAPPED WITH A FINGER OPENS THE APP'S OWN LIST, AND NOTHING ELSE

       EVERY ORDINARY `<select>` OPENS `#drop` NOW (`SEL_OK` in book.js), and the whole of that rests on
       one rule and one hit test: the select has `pointer-events: none` so no tap can target it, and
       `selAt_` works out which select a tap on the box behind it was for. NOTHING ELSE HERE CAN SEE
       EITHER HALF. `check-flow.js` runs in jsdom, which has no stylesheet and no layout, so its taps
       are aimed at the select itself and pass with the CSS rule deleted — measured. The states in
       `check/states.js` call `.click()` on the select, which opens the panel whatever the stylesheet
       says. So these are real touches, on a phone-shaped page, asking the questions a finger asks:

         · a tap on the box opens the list, never FOCUSES the select (a focused select is what an
           iPhone draws its own wheel for) and never lands ON it;
         · a tap a few pixels off still opens it — the select is 15px tall, and with nothing under
           the finger the browser's own touch adjustment has nothing to snap to;
         · a 12px drag that starts on a select's caption opens nothing and focuses nothing — the
           drag guard swallows that click without cancelling it, so a label's activation used to run;
         · with a sheet open over a select, one tap on the backdrop closes the sheet — a rectangle
           test that did not ask what was in front used to open the hidden list behind it instead;
         · and focus arriving by the keyboard's next arrow opens the list rather than the wheel. */
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
      const tp = await ctx.newPage();
      tp.on('pageerror', e => raw.push('window: ' + String(e.message).slice(0, 140)));
      await tp.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, VISITORS[0].user);
      await tp.addInitScript(GUARDS);
      /* EVERY CLICK'S TARGET, AND EVERY TIME A SELECT TAKES FOCUS — even for a moment. The app blurs a
         select that takes focus on a phone, so the END state cannot say whether it was focused on the
         way: a label activation that focuses it and a second click that shuts the list again read as
         nothing having happened, while an iPhone has already put its wheel up. */
      await tp.addInitScript(() => {
        window.__selHit = [];
        document.addEventListener('click', e => { window.__selHit.push(e.target && e.target.tagName); }, true);
        document.addEventListener('focusin', e => { if (e.target && e.target.tagName === 'SELECT') window.__selHit.push('FOCUS'); }, true);
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
      const drag = async (x, y, dx, dy) => {
        await tcdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let k = 1; k <= 4; k++) {
          await tcdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * k / 4, y: y + dy * k / 4 }] });
          await tp.waitForTimeout(16);
        }
        await tcdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await tp.waitForTimeout(420);
      };
      const now = () => tp.evaluate(() => {
        const d = document.getElementById('drop'), a = document.activeElement;
        return { open: !d.classList.contains('hidden') && d.dataset.owner === 'sel',
                 focused: !!a && a.tagName === 'SELECT',
                 sheet: !document.getElementById('sheet').classList.contains('hidden'),
                 hit: window.__selHit.slice() };
      });
      const reset = () => tp.evaluate(() => {
        if (typeof closeSheet === 'function') closeSheet();
        if (typeof selShut_ === 'function') selShut_();
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        window.__selHit.length = 0;
      });
      /* THE FIELD'S CENTRE, on the page in front, after the column has settled. */
      const field = async (col, sel) => {
        await tp.evaluate(a => {
          go(a.col, false, true);
          const pages = [...document.querySelectorAll('#s-' + a.col + ' > .page')];
          const i = pages.findIndex(p => p.querySelector(a.sel));
          if (i >= 0) goPage(a.col, typeof logIndex_ === 'function' ? logIndex_(a.col, i) : i, true);
        }, { col, sel });
        await tp.waitForTimeout(900);
        return tp.evaluate(a => {
          const s = [...document.querySelectorAll('#s-' + a.col + ' ' + a.sel)].find(x => selVisible_(x));
          if (!s) return null;
          const r = s.getBoundingClientRect();
          return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2),
                   bottom: r.bottom, under: (document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) || {}).tagName };
        }, { col, sel });
      };
      const want = (from, ok, got, wanted) => drops.push({ from, ok, got, want: wanted });
      const said = r => (r.open ? 'list open' : 'no list') + (r.focused ? ', select FOCUSED'
          : r.hit.indexOf('FOCUS') !== -1 ? ', the select took focus on the way' : '')
        + (r.hit.indexOf('SELECT') !== -1 ? ', a click landed ON the select' : '') + (r.sheet ? ', sheet still open' : '');

      const kind = await field('booking', 'select.bk-sel[data-step="how"]');
      if (!kind) want('booking · Kind', false, 'no Kind select on the booking column', 'a select to tap');
      else {
        await reset(); await tap(kind.x, kind.y);
        let r = await now();
        /* `under` IS THE RULE ITSELF: the element a finger at the select's centre lands on. With the
           `pointer-events` rule deleted it is the select, and a select under a finger is a picker. */
        want('booking · Kind, a tap on the box (under the finger: ' + kind.under + ')',
             kind.under !== 'SELECT' && r.open && r.hit.indexOf('FOCUS') === -1 && r.hit.indexOf('SELECT') === -1, said(r),
             'nothing but the row under the finger, the list open, the select never focused or clicked');
        await reset(); await tap(kind.x, Math.round(kind.bottom + 3));
        r = await now();
        want('booking · Kind, a tap 3px under the box', r.open && !r.focused, said(r), 'list open');
      }

      const cc = await field('settings', 'select[data-me="phone_cc"]');
      if (!cc) want('settings · country code', false, 'no country-code select', 'a select to drag from');
      else {
        for (const [dx, dy] of [[12, 0], [0, 12]]) {
          await reset(); await drag(cc.x, cc.y, dx, dy);
          const r = await now();
          want('settings · country code (under the finger: ' + cc.under + '), a ' + (dx || dy) + 'px drag ' + (dx ? 'sideways' : 'down'),
               !r.open && r.hit.indexOf('FOCUS') === -1, said(r), 'no list, and the select never focused — a drag is not a tap');
        }
        /* THE KEYBOARD'S NEXT ARROW: focus moving from the box before onto the select. */
        await reset();
        await tp.evaluate(() => {
          const s = [...document.querySelectorAll('#s-settings select[data-me="phone_cc"]')].find(x => selVisible_(x));
          const all = [...s.closest('.page').querySelectorAll('input, select, textarea')];
          const before = all[all.indexOf(s) - 1];
          if (before) before.focus();
        });
        await tp.keyboard.press('Tab'); await tp.waitForTimeout(350);
        const r = await now();
        want('settings · country code, focus arriving by the keyboard', r.open && !r.focused, said(r),
             'the list open and the select not focused — a focused select is the wheel');
      }

      const fav = await field('settings', 'select[data-me="favourite_colour"]');
      if (fav) {
        await reset();
        await tp.evaluate(() => openSheet('Test', '<p>A short sheet.</p>'));
        await tp.waitForTimeout(700);
        /* ---------- THE BACKDROP HAS TO BE WHAT IS OVER THE SELECT ---------------------------------
           THE CARD IN FRONT IS CENTRED NOW (`columnShift_` in shell.js), so the favourite colour sits
           in the middle of the screen — and the middle of the screen is under the sheet's BODY, not
           its backdrop. The tap landed on the sheet, which rightly stayed open, and this reported the
           app broken: the question was asked of the wrong surface. So the select is the favourite
           colour when the backdrop is over it, and otherwise the first select on the page in front
           that the backdrop does cover — and none at all is a failure to reach, not a pass. */
        const spot = await tp.evaluate(f => {
          const back = el => !!el && el.id === 'sheet-back';
          if (back(document.elementFromPoint(f.x, f.y))) return { x: f.x, y: f.y, name: 'favourite colour' };
          for (const s of document.querySelectorAll('#s-settings .page.on select')) {
            if (!selVisible_(s)) continue;
            const r = s.getBoundingClientRect();
            const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
            if (back(document.elementFromPoint(x, y))) return { x, y, name: s.getAttribute('data-me') || s.name || 'a select' };
          }
          return null;
        }, fav);
        if (!spot) {
          want('settings · a select under a sheet\'s backdrop', false, 'every select on the page in front is under the sheet itself',
               'one select the backdrop covers, to tap');
        } else {
          await tap(spot.x, spot.y);
          const r = await now();
          want('settings · ' + spot.name.replace(/_/g, ' ') + ', one tap on a sheet\'s backdrop over it', !r.open && !r.sheet, said(r),
               'the sheet closed and no list behind it');
        }
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
  /* PRESSED BY SOMEBODY IS PRESSED. `do-signin` and `register` are on no screen an admin can be on
     and were the whole reason for the second visitor — reporting them as unreachable because the
     first pass could not find them would be reporting the answer as the question. */
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
  if (drops.length && !dropBad.length) console.log('tapped dropdowns ' + drops.length + ' way(s): every one opened the app\'s own list and nothing else');
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
    console.log('\nnothing threw, nothing was silently inert, and the app survived every press.');

  /* A QUIET PRESS FAILS, and that is the whole point of the list above. `ACCEPTED_TAP` in
     check/ui.js prints and does not fail, because a 20px hour cell is a real finding that cannot be
     repaired by changing a number; a control that does nothing CAN be repaired, and one that
     silently stopped working is the fault this file was written for. So every quiet press either
     carries a written reason or turns the run red. Proved by mutation: putting the old `paintBook_`
     back — the one that repainted a screen the booking column is not on — names `book-slot` and
     `book-set` here and exits 1. */
  process.exit(threw.length || dead.length || quiet.length || notEntered || lost.length || dropBad.length ? 1 : 0);
})();
