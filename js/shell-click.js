
/* Wrap a screen's cards into a vertical strip of pages. § */
/* A SCREEN'S PAGES, all of them, in one scroller. § */
/* THE CELL AND THE GLASS ARE TWO THINGS. § */
/* ---------- THE MARKS, ADOPTED FROM THE PAYLOAD JUST LANDED § */
function adoptMarks_() {
  try { adoptFavourites_(); } catch (e) { oops_(e, 'shell:adoptMarks_') }
  try { adoptSpotlight_(); } catch (e) { oops_(e, 'shell:adoptMarks_') }
  /* AND THE LATEST ANSWER SENT FOR EACH QUESTION, from the account — onto the cards and into the boxes — and whatever this device has waiting to send goes up. § */
  try { if (typeof subAdopt_ === 'function') subAdopt_(); } catch (e) { oops_(e, 'shell:adoptMarks_') }
  /* AND A MARK WITH AI TILE DRAWN WAITING FOR THIS PAYLOAD (`aiDecided_`, keypad.js) — let go where it stands,
     because the column holding it may be held back from the repaint that would draw it again. */
  try { if (typeof aiDecided_ === 'function') aiDecided_(); } catch (e) { oops_(e, 'shell:adoptMarks_') }
  /* AND WHAT THIS PERSON HAS WRITTEN ON THEIR OTHER DEVICES — once a visit, and whatever this device has
     waiting for the account goes up with it. See `answersPull_` in js/answers.js. */
  try { if (typeof answersPull_ === 'function') answersPull_(); } catch (e) { oops_(e, 'shell:adoptMarks_') }
}

/* ONE TILE ROW PER THING (489): rows that stood one under another are joined (`tileRowsJoin_`, tiles.js). */
const rowsOne_ = c => (typeof tileRowsJoin_ === 'function' ? tileRowsJoin_(c) : c);
const pages = (id, cards) =>
  cards.map(c => cardBlock_({ type: 'group', tag: 'section', look: 'page', blocks: [{ type: 'group', look: 'pane', inner: rowsOne_(c) }] })).join('');

/* ---------- AN EMPTY WIDGET IS ITS TITLE AND NOTHING ELSE (414) ---------- */
/* One empty state for every list with nothing in it — Spotlight, Saved, the shop, the reels: no sentence explaining the emptiness, the owner's ask. */
/* AND ITS ONE TILE, Suggest a change (486): the owner, of an empty Saved, "why is there no buttons on 'saved' widget" (1 Nov). */
const emptyCard_ = title => {
  const t = String(title || ''), s = typeof suggestOpts_ === 'function' ? suggestOpts_('widget', 'empty:' + t.toLowerCase().replace(/[^a-z0-9]+/g, '-'), t) : null;
  return renderCard({ kind: 'empty', look: 'is-empty', tags: [{ text: t, colour: 0 }], tiles: [].concat(s || []) });
};

/* ---------- ALL OF THEM ON ONE, WHICH IS WHAT A LIST IS § */
const stack = (id, cards) =>
  cardBlock_({ type: 'group', tag: 'section', look: 'page', blocks: [{ type: 'group', look: 'pane', inner: rowsOne_(cards.join('')) }] });

/** The glass inside a page — where content actually goes. */
/* THE PANE INSIDE A PAGE — AND ONE IS MADE IF THERE IS NOT ONE. § */
function paneOf_(el) {
  if (!el) return null;
  const found = el.querySelector(':scope > .pane');
  if (found) return found;
  const pane = document.createElement('div');
  pane.className = 'pane';
  el.appendChild(pane);
  return pane;
}

/* `watchPages` and its observer lived here — they reported which pane the scroller had centred.
   Gone with the scroller. Which page is in front is decided by this file again, which is the only
   way it can be decided once. */

/* `chunk` was here — splitting a list into pages. The Find screen pages by index rather than by
   slicing, and nothing else has ever paged a list. */

/* The dot's handler is registered further down, WITH the other actions. § */

/* ---------- THE SHEET OPENS IN PLACE (453) ---------- */
/* "do not use pop-up menus on my site": `#sheet` is moved INTO the card that was pressed, under its tile row,
   and Back puts it home again. Nothing floats, nothing covers the grid, and the grid never steps aside. */
let sheetOnClose = null;

/* ---------- WHAT THE SHEET IS ONE OF § */
let sheetStep = null;

/* THE LAST THING PRESSED, read by `openSheet` to find its card. Capture phase, so it is set before any handler. */
let PRESSED_ = null;
['pointerdown', 'click', 'keydown'].forEach(t => addEventListener(t, e => {
  const el = e.target;
  if (el && el.closest && !el.closest('#sheet') && el.closest('#screen')) PRESSED_ = el;
}, true));

/* A CALLER THAT KNOWS ITS CARD says so: `el` is inside it; `swap` makes the card BECOME the sheet (an editor). */
let SHEET_HERE_ = null;
function sheetHere_(el, swap) { SHEET_HERE_ = { el, swap: !!swap }; }

const SHEET_HOSTS_ = '.post, .rc, .widget-slot, .cpn, .card, .pane';
/* HELD BY REFERENCE: a card drawn again takes the sheet out with its old markup, and `sheetKeep_` puts it back. */
let SHEET_EL_ = null, SHEET_AT_ = null;
const sheetEl_ = () => SHEET_EL_ || (SHEET_EL_ = document.getElementById('sheet'));
const sheetFront_ = () => {
  const pg = document.querySelector('#s-' + AT + ' .page.on') || document.querySelector('#s-' + AT);
  return pg && (pg.querySelector(':scope > .pane') || pg);
};
/* WHERE THE SHEET WILL GO, worked out before anything moves, so `expand_` can read what is below that place first (537). */
function sheetWhere_() {
  const want = SHEET_HERE_; SHEET_HERE_ = null;
  let from = want ? want.el : PRESSED_;
  if (from && (!from.isConnected || !from.closest('#s-' + AT))) from = null;
  let host = from && from.closest(SHEET_HOSTS_);
  /* NOTHING PRESSED ON THIS SCREEN (a sign-in answered, a booking confirmed): the card in front. */
  if (!host) host = sheetFront_();
  const swap = !!(want && want.swap);
  const row = host && from && from.closest('.tile-row, .post-acts, .post-when');
  const after = !swap && row && host.contains(row) && row !== host ? row : null;
  return { host, after, swap };
}
function sheetPlace_(where) {
  const sh = sheetEl_();
  const w = where || sheetWhere_();
  document.querySelectorAll('.sheet-host').forEach(h => h.classList.remove('sheet-host', 'sheet-swap'));
  SHEET_AT_ = { post: w.host && w.host.dataset ? w.host.dataset.post || '' : '', swap: w.swap };
  /* NO SCREEN DRAWN YET (a link opened on arrival): it waits at home, and `sheetKeep_` moves it in once one is. */
  if (!w.host) return;
  if (w.after) w.after.after(sh); else w.host.appendChild(sh);
  w.host.classList.add('sheet-host');
  if (w.swap) w.host.classList.add('sheet-swap');
}

/* AN OPEN SHEET STAYS IN THE CARD: after any redraw, back into the same post, or the card in front. */
function sheetKeep_() {
  const sh = sheetEl_();
  if (!sh || sh.classList.contains('hidden')) return;
  if (sh.isConnected && sh.closest('#screen')) return;
  const at = SHEET_AT_ || {};
  const host = (at.post && document.querySelector('#s-' + AT + ' [data-post="' + CSS.escape(at.post) + '"]')) || sheetFront_();
  if (!host) { if (!sh.isConnected && $('sheet-home')) $('sheet-home').after(sh); return; }
  host.appendChild(sh);
  host.classList.add('sheet-host');
  if (at.swap) host.classList.add('sheet-swap');
}
try {
  new MutationObserver(sheetKeep_).observe(document.documentElement, { childList: true, subtree: true });
} catch (err) { /* no MutationObserver: an open sheet is not kept across a redraw */ }

function openSheet(title, html, onClose, step) {
  /* A SHEET OPENED OVER A SHEET. § */
  if (sheetOnClose) { const f = sheetOnClose; sheetOnClose = null; try { f(); } catch (err) { oops_(err, 'shell:openSheet') } }

  /* SET AFTER the old sheet's `onClose` above, which may itself open a sheet. */
  sheetStep = typeof step === 'function' ? step : null;

  const sh = sheetEl_();
  /* A SHEET STILL LEAVING stops leaving: this one takes its place. */
  sheetOutStop_(sh);
  const where = sheetWhere_();
  const fill = () => {
    sheetPlace_(where);
    sh.querySelector('#sheet-title').textContent = title;
    sh.querySelector('#sheet-body').innerHTML = html;
    sh.classList.remove('hidden');
  };
  /* OPENING (not a sheet changing what it says) opens downward and slides what is below out of its way (537, U6). */
  const at = where.host && (where.after || where.host);
  if (sh.classList.contains('hidden') && at && at.closest('#screen')) expand_([at], fill, { content: () => [sh] });
  else fill();
  sheetOnClose = onClose || null;
  try { sh.scrollIntoView({ block: 'nearest' }); } catch (err) { /* an element no longer on the page is not scrolled */ }
  try { placeCells(undefined, true); } catch (err) { oops_(err, 'shell:openSheet') }
}

/* ---------- CLOSING IT: THE CARD AS IT WAS ---------- */
/* A SHEET PLAYING ITS EXIT: shut in every sense that counts (its `onClose` has run, nothing can be pressed in it), still drawn until the fade ends. */
let SHEET_OUT_ = null;
function sheetOutStop_(sh) {
  if (!SHEET_OUT_) return;
  SHEET_OUT_.cancel(); SHEET_OUT_ = null;
  sh.classList.remove('is-leaving');
}
function closeSheet() {
  sheetStep = null;
  const sh = sheetEl_();
  if (SHEET_OUT_) return;             /* already leaving: its exit finishes the close */
  const was = !sh.classList.contains('hidden');
  sh.classList.add('hidden');
  const f = sheetOnClose; sheetOnClose = null;
  if (f) { try { f(); } catch (err) { console.error('[sheet onClose]', err); } }
  /* EMPTIED AND SENT HOME after `onClose` has read it, and only if that did not open another. */
  const home = () => {
    sh.querySelector('#sheet-body').innerHTML = '';
    SHEET_AT_ = null;
    document.querySelectorAll('.sheet-host').forEach(h => h.classList.remove('sheet-host', 'sheet-swap'));
    if ($('sheet-home')) $('sheet-home').after(sh);
  };
  const placed = () => { if (was) { try { placeCells(undefined, true); } catch (err) { oops_(err, 'shell:closeSheet') } } };
  if (!sh.classList.contains('hidden')) { placed(); return; }
  const host = sh.closest('.sheet-host');
  if (!was || !sh.closest('#screen') || !expandMoves_(sh) || !MOTION_.exit) { home(); placed(); return; }
  /* THE EXIT PLAYS BEFORE IT IS GONE (537, U6): drawn again for the fade, then hidden, and what was below closes the gap. */
  sh.classList.remove('hidden');
  sh.classList.add('is-leaving');
  const swap = !!(host && host.classList.contains('sheet-swap'));
  SHEET_OUT_ = expandOut_([sh], () => {
    SHEET_OUT_ = null;
    sh.classList.remove('is-leaving');
    sh.classList.add('hidden');
    home();
  }, { anchors: [sh], content: swap ? () => [...host.children].filter(c => c !== sh) : null, done: placed });
}

/* ---------- A HEIGHT THAT CHANGES ON THE GLASS MOVES, IT DOES NOT JUMP (537, U6) ---------- */
/* What is below a change, at most this many boxes, is slid from where it stood (FLIP); the rest of the page is out of sight anyway. */
const EXPAND_FOLLOW_ = 24;
const expandMoves_ = el => !!(el && typeof el.animate === 'function' && motionOK_() && MOTION_.move > 0);
function expandFollowers_(anchors) {
  const out = new Set();
  anchors.forEach(a => {
    for (let n = a; n && n.parentElement && out.size < EXPAND_FOLLOW_; n = n.parentElement) {
      if (n.matches('.page, .screen, #screen, body')) break;
      for (let s = n.nextElementSibling; s && out.size < EXPAND_FOLLOW_; s = s.nextElementSibling) out.add(s);
    }
  });
  return [...out];
}
const expandCancel_ = (el, key) => { const a = el && el[key]; if (a) { try { a.cancel(); } catch (e) { /* already gone */ } el[key] = null; } };
/* `mutate` changes what `anchors` hold. What is below them slides from where it was, and `content` (what the change shows) opens downward as it fades in. Compositor only: translate, opacity, clip-path. */
function expand_(anchors, mutate, o) {
  const opt = o || {};
  const list = [].concat(anchors).filter(a => a && a.isConnected);
  if (!list.length || !expandMoves_(list[0])) { mutate(); return; }
  const follow = expandFollowers_(list);
  /* A MOVE DURING A MOVE starts from where the eye sees it: read with the old slide still running, then the old one goes. */
  const before = follow.map(f => f.getBoundingClientRect().top);
  follow.forEach(f => expandCancel_(f, 'expandFlip'));
  mutate();
  follow.forEach((f, i) => {
    if (!f.isConnected || !f.getClientRects().length) return;
    const dy = before[i] - f.getBoundingClientRect().top;
    if (Math.abs(dy) < 1) return;
    const z = f.currentCSSZoom || 1;
    f.expandFlip = f.animate([{ translate: `0 ${dy / z}px` }, { translate: '0 0' }], { duration: MOTION_.move, easing: MOTION_.spring });
  });
  const shown = typeof opt.content === 'function' ? opt.content() : opt.content;
  [].concat(shown || []).forEach(c => {
    if (!c || !c.isConnected || !c.getClientRects().length) return;
    expandCancel_(c, 'expandIn');
    c.expandIn = c.animate([{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)' }],
                           { duration: MOTION_.move, easing: MOTION_.spring });
  });
}
/* AND CLOSING: `leaving` fades out first, then `mutate` takes it away and what was below closes the gap with `expand_`. Returns the job (cancel() keeps things as they are), or null when it ran at once. */
function expandOut_(leaving, mutate, o) {
  const opt = o || {};
  const els = [].concat(leaving).filter(e => e && e.isConnected && e.getClientRects().length);
  const end = () => { mutate(); if (opt.done) opt.done(); };
  if (!els.length || !expandMoves_(els[0]) || !MOTION_.exit) { end(); return null; }
  els.forEach(e => expandCancel_(e, 'expandIn'));
  const fades = els.map(e => e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: MOTION_.exit, easing: MOTION_.in, fill: 'forwards' }));
  const job = { done: false, cancel() { if (job.done) return; job.done = true; fades.forEach(f => { try { f.cancel(); } catch (e) { /* already gone */ } }); } };
  /* FINISHED OR CANCELLED BY THE BROWSER (the box taken out under it), the close still happens: only `job.cancel()` keeps it. */
  const finish = () => {
    if (job.done) return;
    job.done = true;
    expand_(opt.anchors || els, () => { mutate(); fades.forEach(f => { try { f.cancel(); } catch (e) { /* already gone */ } }); }, { content: opt.content });
    if (opt.done) opt.done();
  };
  Promise.all(fades.map(f => f.finished)).then(finish, finish);
  return job;
}
/* EVERY FOLD OPENS AND CLOSES WITH THE ONE MOTION (537): the summary's own toggle is taken over only when there is motion to give it. On `window`, after the app's click handlers, so a swipe's click (prevented there) toggles nothing. */
addEventListener('click', e => {
  if (e.defaultPrevented || e.button) return;
  const s = e.target && e.target.closest && e.target.closest('summary');
  const d = s && s.parentElement;
  if (!d || d.tagName !== 'DETAILS' || d.querySelector(':scope > summary') !== s) return;
  /* A CONTROL INSIDE THE SUMMARY is pressed, not the fold. */
  const ctl = e.target.closest('a, button, input, textarea');
  if (ctl && s.contains(ctl)) return;
  if (!expandMoves_(d) || !d.isConnected) return;
  e.preventDefault();
  /* PRESSED AGAIN WHILE IT CLOSES: it stays open. */
  if (d.expandOut && !d.expandOut.done) { d.expandOut.cancel(); d.expandOut = null; return; }
  const kids = () => [...d.children].filter(c => c !== s);
  if (!d.open) expand_([d], () => { d.open = true; }, { content: kids });
  else d.expandOut = expandOut_(kids(), () => { d.open = false; }, { anchors: [d] });
});

/* ---------- MOTION IS ONE SYSTEM (531) ---------- */
/* Whether to move at all. Every script that animates asks this, so less motion is one answer everywhere. */
function motionOK_() {
  try { return !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; }
}
/* THE STYLESHEET'S `--dur-*` AND `--ease-*`, in ms and as curves, read once they exist; the fallbacks are the same numbers, for a page whose CSS has not arrived. */
const MOTION_FALL_ = { press: 0, quick: 120, enter: 220, exit: 180, move: 280, mark: 1300,
  out: 'cubic-bezier(.2, .8, .2, 1)', in: 'cubic-bezier(.4, 0, 1, 1)', spring: 'cubic-bezier(.2, .9, .3, 1)' };
let MOTION_READ_ = null;
function motionRead_() {
  if (MOTION_READ_) return MOTION_READ_;
  let cs = null;
  try { cs = getComputedStyle(document.documentElement); } catch (e) { /* no document yet: the fallbacks answer */ }
  const v = k => (cs && cs.getPropertyValue(k) || '').trim();
  if (!v('--dur-move')) return MOTION_FALL_;                       /* not loaded yet: answer, and ask again next time */
  const ms = s => { const n = parseFloat(s); return !isFinite(n) ? 0 : /ms$/.test(s) ? n : n * 1000; };
  const got = {};
  Object.keys(MOTION_FALL_).forEach(k => {
    const raw = typeof MOTION_FALL_[k] === 'number' ? v('--dur-' + k) : v('--ease-' + k);
    got[k] = !raw ? MOTION_FALL_[k] : typeof MOTION_FALL_[k] === 'number' ? ms(raw) : raw;
  });
  return (MOTION_READ_ = got);
}
/* `MOTION_.move` is ms, `MOTION_.spring` a timing function. Getters, so a script loaded before the CSS still reads the CSS. */
const MOTION_ = {};
/* A MOVEMENT TAKES NO TIME WHILE LESS MOTION IS ASKED FOR, asked live (537): the stylesheet says the same, but its answer was read once. `mark` is information and keeps its time. */
const MOTION_MOVES_ = ['quick', 'enter', 'exit', 'move'];
Object.keys(MOTION_FALL_).forEach(k => Object.defineProperty(MOTION_, k, { enumerable: true,
  get: () => (MOTION_MOVES_.indexOf(k) !== -1 && !motionOK_() ? 0 : motionRead_()[k]) }));
/* READ AGAIN WHEN THE PHONE'S SETTING CHANGES (537), so the numbers read while it was on do not outlive it. */
try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { MOTION_READ_ = null; }); } catch (e) { /* no matchMedia: the fallbacks stand */ }

/* ---------- ONE PRESS, ONE ACTION (534) ---------- */
/* A double tap deleted a post and starred twice: the same control again within PRESS_AGAIN_MS, or while the request it started is out, is dropped. */
const PRESS_AGAIN_MS = 350;
/* KEYS AND STEPS PRESSED FAST ON PURPOSE (a digit typed twice, a month flipped): `data-repeat` on the control, or its action named here. */
const PRESS_REPEAT_ = new Set(['kp-key', 'cal-back', 'cal-fwd', 'tal-size',
                               'pad-undo', 'sp-ctl', 'feed-tap', 'rw-next', 'rw-back', 'speed-back']);
const PRESS_LAST_ = new Map();   /* press key -> { t, el }: when it last acted, and which element */
const PRESS_OUT_ = new Map();    /* press key -> Map(element -> requests it started that are still out) */
let PRESS_ACTING_ = null;        /* { key, el } while a handler runs, so `api()` knows whose request it is */
/* THE SAME CONTROL, EVEN REDRAWN: its kind (first class), action and data, less the arming marks — a star drawn afresh is still the star; an ordering's item and slot are two. */
function pressKey_(el) {
  let k = (String(el.getAttribute('class') || '').trim().split(/\s+/)[0] || el.tagName) + ':' + (el.getAttribute('data-do') || '');
  for (const a of el.attributes) if (/^data-/.test(a.name) && !/^data-(do|sure|armed|repeat)$/.test(a.name)) k += '|' + a.name + '=' + a.value;
  return k;
}
/* TRUE WHEN THIS PRESS IS THE SAME ONE AGAIN; otherwise it is recorded as the last. */
function pressAgain_(el) {
  if (el.hasAttribute('data-repeat') || PRESS_REPEAT_.has(el.getAttribute('data-do'))) return false;
  const key = pressKey_(el), now = performance.now();
  /* HELD BY ELEMENT: another live copy (a Send in another sheet) still works; the one redrawn from a held control is still held. */
  const out = PRESS_OUT_.get(key);
  if (out) for (const o of out.keys()) if (o === el || !o.isConnected) return true;
  /* THE SAME ELEMENT, or the one it was redrawn from; two live copies of a control (a card drawn twice) are two controls. */
  const last = PRESS_LAST_.get(key);
  if (last && now - last.t < PRESS_AGAIN_MS && (last.el === el || !last.el.isConnected)) return true;
  if (PRESS_LAST_.size > 64) PRESS_LAST_.forEach((v, k) => { if (now - v.t >= PRESS_AGAIN_MS) PRESS_LAST_.delete(k); });
  PRESS_LAST_.set(key, { t: now, el });
  return false;
}
/* A REQUEST OR A PROMISE A PRESS STARTED: the control says aria-busy and takes no press until it settles, or `ms` passes — a fetch with no deadline of its own (Spotify, Tasks) cannot hold it for ever. */
function pressOut_(key, el, p, ms) {
  const out = PRESS_OUT_.get(key) || new Map();
  PRESS_OUT_.set(key, out);
  out.set(el, (out.get(el) || 0) + 1);
  if (el && !el.hasAttribute('aria-busy')) { el.setAttribute('aria-busy', 'true'); el.PRESS_BUSY = true; }
  let bell = 0, gone = false;
  const done = () => {
    if (gone) return;
    gone = true; clearTimeout(bell);
    const n = (out.get(el) || 1) - 1;
    if (n > 0) { out.set(el, n); return; }
    out.delete(el);
    if (!out.size && PRESS_OUT_.get(key) === out) PRESS_OUT_.delete(key);
    if (el && el.PRESS_BUSY) { el.PRESS_BUSY = false; el.removeAttribute('aria-busy'); }
  };
  bell = setTimeout(done, (ms || API_DEADLINE_MS) + 1000);
  Promise.resolve(p).then(done, done);
}

/* A PRESS WHOSE SCREEN HAS ALREADY CHANGED (a star, a face) saves in the background: its request does not hold the control, so it can be taken back at once. */
function pressFree_() { PRESS_ACTING_ = null; }

/* ---------- ONE WAY TO POST § */
/* ONE REQUEST, BUILT IN ONE PLACE. § */
/* A MINUTE, AS load() HAS (534): a POST that never answers left its control spinning for ever; past this it rejects into the caller's why_(). */
const API_DEADLINE_MS = 60000;
/* ACTIONS THE BACKEND IS BUILT TO RUN FOR MINUTES wait for Apps Script's own six-minute ceiling instead; check-api-deadline.js finds them by their budgets. */
const API_LONG_ = {
  raceBuild: 6 * 60000,        /* Overpass [timeout:150], then heights until t0 + 280 s (buildRaceMap_) */
  libImportDrive: 6 * 60000,   /* starts files until LIB_DRIVE_MS, four minutes (libImportDrive_) */
};
/* WHAT ACTUALLY WENT WRONG, IN WORDS, WHERE THEY CAN BE READ AND COPIED. § */
function why_(err) {
  const msg = String((err && err.message) || err || '').trim();
  /* A GENUINELY UNREACHABLE SERVER IS THE ONE CASE THE OLD SENTENCE WAS RIGHT ABOUT. `fetch`
     rejects with a TypeError and no useful text when there is no connection at all, which is the
     only time nothing better can be said. */
  if (msg && !/^(TypeError|Failed to fetch|NetworkError|Load failed)/i.test(msg)) return msg;
  /* "NO CONNECTION" WAS SAID TO A PHONE THAT HAD ONE. § */
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  return offline
    ? 'No connection — this phone is offline. Nothing was saved.'
    : 'The server did not answer, so nothing was saved. Try again in a minute.';
}

/* `opts.keepalive` — a request the browser finishes after the page has gone, for the last answers sent as
   an iPad's cover closes (`answersPush_` in js/answers.js). Nothing else passes it. */
function api(body, opts) {
  /* ---------- THE TOKEN GOES ON EVERY REQUEST, FROM ONE PLACE § */
  const b = Object.assign({}, body);
  if (!b.token && typeof USER === 'object' && USER && USER.token) b.token = USER.token;
  const keep = !!(opts && opts.keepalive);
  const wait = API_LONG_[b.action] || API_DEADLINE_MS;
  let stop = null, bell = 0;
  try { if (!keep && typeof AbortController === 'function') stop = new AbortController(); } catch (e) { stop = null; }
  /* THE WHOLE REPLY, headers and body, under the one deadline; a keepalive flush outlives the page and is not cut. */
  const late = keep ? null : new Promise((u, no) => { bell = setTimeout(() => {
    const e = new Error('The server did not answer within ' + (wait > API_DEADLINE_MS ? Math.round(wait / 60000) + ' minutes' : 'a minute')
      + '. It may still have been saved — look before trying again.');
    e.name = 'TimeoutError';
    try { if (stop) stop.abort(); } catch (err) { /* already settled */ }
    no(e);
  }, wait); });
  const asked = fetch(API, Object.assign({ method: 'POST', cache: 'no-store', body: JSON.stringify(b) },
                                         keep ? { keepalive: true } : {}, stop ? { signal: stop.signal } : {}))
    /* ---------- A REPLY THAT IS NOT JSON IS STILL A REPLY § */
    .then(r => r.text().then(txt => {
      try { return JSON.parse(txt); } catch (e) { /* a bad stored value reads as none */ }
      const m = txt.match(/<div[^>]*>([^<]{10,400})<\/div>/i)
             || txt.match(/>\s*(TypeError|ReferenceError|Exception|Error)([^<]{0,300})</i);
      const said = m ? (m[1] + (m[2] || '')).replace(/\s+/g, ' ').trim()
                     : txt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
      throw new Error('Backend: ' + (said || ('HTTP ' + r.status)));
    }))
    .then(d => {
      /* A value the sheet had nowhere to put. § */
      if (d && d.unwritten && d.unwritten.length) {
        banner('Some values were not saved: '
          + d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
          + ' — those columns are not in the sheet.');
      }
      /* ---------- A SESSION THE SERVER HAS ENDED IS ENDED HERE TOO § */
      /* THROUGH `signedOut_` (me.js), THE ONE WAY OUT — this branch cleared `USER` and nothing else, so the person's inbox, stars and done dates outlived a session the § */
      if (d && d.why === 'signed-out' && typeof USER === 'object' && USER && USER.token === b.token) {
        /* WHOSE SESSION IT WAS, read before it is forgotten — see `ansGoneSay_` (answers.js): the box
           that person wrote in is drawn empty under the signed-out key now, and says why (317). */
        const gone = typeof whoIs_ === 'function' ? whoIs_() : '';
        if (typeof signedOut_ === 'function') { try { signedOut_({ ended: true }); } catch (e) { /* the sign-out goes on even if the redraw fails */ } }
        else { USER = null; try { localStorage.removeItem('familyUser'); } catch (e) { /* storage can be blocked; the app runs without it */ } try { repaint(); } catch (e) { oops_(e, 'shell:api') } }
        /* THROUGH `ansRecPut_`, held for the visit when the store refuses or throws: without it a
           browser keeping no site data never knew whose the next answer was (review of the merge). */
        try {
          const rec = gone ? JSON.stringify({ who: gone, at: Date.now() }) : '';
          if (rec && typeof ansRecPut_ === 'function') ansRecPut_('familyGone', rec);
          else if (rec) localStorage.setItem('familyGone', rec);
        } catch (e) { /* storage can be blocked; the app runs without it */ }
        try { if (typeof ansSavedPaint_ === 'function') ansSavedPaint_(); } catch (e) { oops_(e, 'shell:api') }
        toast('Signed out — please sign in again');
      }
      return d || {};
    });
  if (keep) return asked;
  asked.catch(() => { /* the deadline answered first; this rejection is the abort it caused */ });
  const p = Promise.race([asked, late]).finally(() => clearTimeout(bell));
  if (PRESS_ACTING_) pressOut_(PRESS_ACTING_.key, PRESS_ACTING_.el, p, wait);
  return p;
}

/* A READ DRAWN FROM ITS LAST KNOWN REPLY (owner, 11 Nov): `use` (then `after`) runs at once with the kept copy, then again with the server's, marked fresh. */
/* ONE RULE FOR EVERY FETCHED CARD, so Apps Script's seconds are spent behind content, not a loader; a failure with a copy on hand stays quiet. */
function apiKept_(body, use, after) {
  const run = (d, old) => { use(d, old); if (typeof after === 'function') after(); };
  const k = keptKey_(body), kept = keptGet_(k);
  const shown = kept ? JSON.stringify(kept) : null;
  if (kept) { Promise.resolve().then(() => run(kept, true)).catch(e => oops_(e, 'shell:kept')); }
  return api(body).then(d => {
    if (!d || d.error) { if (!kept) run(d || {}, false); return d; }
    const t = JSON.stringify(d);
    if (t !== shown) keptPut_(k, t);
    run(d, false);
    return d;
  }, err => { if (kept) return kept; throw err; });
}

/** The same request, refusing to resolve on a refusal — for callers that would rather catch. */
function send(body) {
  return api(body).then(d => {
    /* ---------- AN ACTION THE LIVE BACKEND HAS NEVER HEARD OF § */
    if (d && d.error && /unknown action|not recognis/i.test(String(d.error))) {
      const act = (String(d.error).match(/:\s*(\w+)/) || [])[1] || 'that action';
      const has = (DATA.features || []).indexOf(act) !== -1;
      throw new Error(has
        ? act + ' is not working — the backend knows it but returned an error'
        : 'The backend does not have `' + act + '` yet. Paste the newest .gs files into Apps '
          + 'Script and deploy. Live version: ' + (DATA.version || 'unknown'));
    }
    /* THE WHOLE REPLY RIDES ON THE ERROR. § */
    if (d && d.error) { const e = new Error(d.error); e.reply = d; throw e; }
    return d;
  });
}

/* ---------- SAYING SOMETHING BRIEFLY (537, D10) ------------------------------------------------- */
/* EVERY MESSAGE IS SHOWN, none replaced: a new one comes in at the foot and lifts the older, each staying for its own length. `#toast` is always the newest. */
const TOASTS_ = [];
const TOAST_MAX_ = 3;
/* LONG ENOUGH TO READ: two seconds and a twentieth for every letter, never past seven. */
const toastMs_ = s => Math.min(7000, 2000 + 50 * String(s).length);
function toastHost_() {
  let h = $('toasts');
  if (!h) {
    h = document.createElement('div');
    h.id = 'toasts';
    /* ONE LIVE REGION THAT STAYS, so a reader announces each line as it is added rather than a box that keeps being born. */
    h.setAttribute('role', 'status');
    h.setAttribute('aria-live', 'polite');
    document.body.appendChild(h);
  }
  return h;
}
const toastMoves_ = el => motionOK_() && typeof el.animate === 'function';
/* THE NEWEST AT THE FOOT, each older one lifted above it by `translate`, which moves without laying anything out. */
function toastStack_() {
  let up = 0;
  for (let i = TOASTS_.length - 1; i >= 0; i--) {
    const t = TOASTS_[i];
    t.el.style.translate = up ? `0 ${-up}px` : '';
    if (!t.leaving) up += t.el.offsetHeight + 6;
  }
}
function toastEnter_(t) {
  if (t.anim) { try { t.anim.cancel(); } catch (e) { /* already gone */ } t.anim = null; }
  if (!toastMoves_(t.el)) return;
  t.anim = t.el.animate([{ opacity: 0, transform: 'translateY(.5rem) scale(.97)' }, { opacity: 1, transform: 'none' }],
                        { duration: MOTION_.enter, easing: MOTION_.spring });
}
function toastLeave_(t) {
  if (t.leaving) return;
  t.leaving = true;
  clearTimeout(t.timer);
  const gone = () => {
    t.el.remove();
    const i = TOASTS_.indexOf(t);
    if (i > -1) TOASTS_.splice(i, 1);
    /* THE NAME PASSES TO THE NEWEST STILL SHOWN, so `#toast` is what the screen says now. */
    if (isToast_(t.el)) { t.el.removeAttribute('id'); const n = TOASTS_.filter(x => !x.leaving).pop(); if (n) n.el.id = 'toast'; }
    toastStack_();
  };
  if (t.anim) { try { t.anim.cancel(); } catch (e) { /* already gone */ } t.anim = null; }
  if (!toastMoves_(t.el) || !MOTION_.exit) { gone(); return; }
  t.anim = t.el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(.35rem) scale(.97)' }],
                        { duration: MOTION_.exit, easing: MOTION_.in, fill: 'forwards' });
  /* REMOVED WHEN ITS EXIT HAS PLAYED, not on a timer that might cut it short. */
  t.anim.finished.then(gone, gone);
}
function toast(msg) {
  const text = String(msg == null ? '' : msg);
  const host = toastHost_();
  const last = TOASTS_[TOASTS_.length - 1];
  /* THE SAME WORDS AGAIN come in again, on the same line, with their time started over. */
  let t = last && !last.leaving && last.text === text ? last : null;
  if (!t) {
    TOASTS_.forEach(x => { if (isToast_(x.el)) x.el.removeAttribute('id'); });
    const el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.textContent = text;
    host.appendChild(el);
    t = { el, text, timer: 0, anim: null, leaving: false };
    TOASTS_.push(t);
    const live = TOASTS_.filter(x => !x.leaving);
    live.slice(0, Math.max(0, live.length - TOAST_MAX_)).forEach(toastLeave_);
  }
  clearTimeout(t.timer);
  t.timer = setTimeout(() => toastLeave_(t), toastMs_(text));
  toastEnter_(t);
  toastStack_();
}

/* ---------- A CANVAS SHARED AS A PNG (413) ----------
   The share sheet with the file; else a download, the link copied. Resolves shared, saved or cancelled.
   fix-profile-png's `tutorPngHand_` does the same: keep one at the merge. */
function shareCanvasPng_(canvas, filename, text) {
  const name = String(filename || 'family.png');
  const words = String(text || '');
  const blobOf = () => new Promise((ok, no) => {
    try { canvas.toBlob(b => (b ? ok(b) : no(new Error('empty picture'))), 'image/png'); } catch (e) { no(e); }
  });
  return blobOf().then(blob => {
    const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
    let can = false;
    try { can = !!(file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })); } catch (e) { can = false; }
    const url = (words.match(/https?:\/\/\S+/) || [])[0] || '';
    const save = () => {
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 60000);   // a download can start after the click returns
      const copy = url && navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(url) : Promise.reject();
      return copy.then(() => toast('Picture saved · link copied'), () => toast('Picture saved')).then(() => 'saved');
    };
    if (!can) return save();
    return navigator.share({ files: [file], text: words })
      .then(() => 'shared', e => (e && e.name === 'AbortError' ? 'cancelled' : save()));
  });
}

/* ---------- SPEAKING, ONE VOICE FOR THE WHOLE APP (394, 453) ----------------------------------- */
/* Imposter's Listen, a question's Read aloud and Hear it all speak through `say_`, so the voice choice, the
   sentence-at-a-time queue and the maths words are written once. */
function canSay_() {
  try { return !!(window.speechSynthesis && window.SpeechSynthesisUtterance); } catch (e) { return false; }
}
function hush_() {
  try { if (canSay_()) window.speechSynthesis.cancel(); } catch (e) { oops_(e, 'shell:hush_') }
}
/* THE DEVICE'S OWN VOICES ONLY, CALMEST NATURAL BRITISH FIRST (453, 463 withdrawn): free, nothing to set up; eSpeak, compact and novelty voices never. */
const VOICE_GOOD = [[/\b(natural|neural|online)\b/i, 60], [/siri/i, 50], [/\b(enhanced|premium)\b/i, 45],
  [/\b(daniel|arthur|oliver|serena|kate)\b/i, 30], [/^google uk english (male|female)\b/i, 20]];
const VOICE_BAD = /espeak|\bfred\b|compact|albert|bad news|bahh|bells|boing|bubbles|cellos|zarvox|trinoids|whisper|wobble|jester|organ|superstar|junior|ralph|kathy|good news|deranged|hysterical/i;
const voiceLang_ = v => String((v && v.lang) || '').replace('_', '-').toLowerCase();
/* A VOICE'S SCORE FOR `lang`: same language and region first, then en-US for English, then the language anywhere; -1000 is another language. */
function voiceScore_(v, lang) {
  const want = String(lang || 'en-GB').toLowerCase(), l = voiceLang_(v), name = String((v && v.name) || '');
  if (l.slice(0, 2) !== want.slice(0, 2)) return -1000;
  let s = l === want ? 300 : (want.slice(0, 2) === 'en' && l === 'en-us') ? 200 : 100;
  s += Math.max(0, ...VOICE_GOOD.filter(g => g[0].test(name)).map(g => g[1]));  /* its best tier only, so the ranking reads in order */
  if (VOICE_BAD.test(name)) s -= 200;
  return s;
}
function voicesAll_() {
  try { const ss = window.speechSynthesis; return (ss && typeof ss.getVoices === 'function' && ss.getVoices()) || []; } catch (e) { return []; }
}
function voicesRanked_(lang, list) {
  return (list || voicesAll_()).map((v, i) => ({ v, i, s: voiceScore_(v, lang) })).filter(x => x.s > -1000)
    .sort((a, b) => b.s - a.s || a.i - b.i).map(x => x.v);
}
/* NO CHOICE: the best the device has; the old kept choice (453) is forgotten. */
function voicePick_(lang, list) { return voicesRanked_(lang, list)[0] || null; }
try { localStorage.removeItem('voice:name'); } catch (e) { /* storage can be blocked; the app runs without it */ }
/* MATHS SAID AS WORDS (453): the symbols a voice skips or reads as "superscript two". Words pass through unchanged. */
const SAY_SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
const SAY_VULGAR = { '½': 'one half', '⅓': 'one third', '⅔': 'two thirds', '¼': 'one quarter', '¾': 'three quarters', '⅕': 'one fifth', '⅛': 'one eighth' };
const SAY_DEN = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['quarter', 'quarters'], 5: ['fifth', 'fifths'],
  6: ['sixth', 'sixths'], 8: ['eighth', 'eighths'], 10: ['tenth', 'tenths'] };
const SAY_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
function sayMaths_(t) {
  return String(t == null ? '' : t)
    .replace(/[½⅓⅔¼¾⅕⅛]/g, c => ' ' + SAY_VULGAR[c] + ' ')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => { const n = m.split('').map(c => SAY_SUP[c]).join('');
      return n === '2' ? ' squared ' : n === '3' ? ' cubed ' : ' to the power of ' + n + ' '; })
    .replace(/(^|[^\d\/])(\d{1,2})\s*\/\s*(\d{1,2})(?![\d\/])/g, (m, a, n, d) => {
      const w = SAY_DEN[+d], k = +n;
      return a + (w && k >= 1 && k < +d ? SAY_ONES[k] + ' ' + w[k > 1 ? 1 : 0] : n + ' over ' + d); })
    .replace(/÷/g, ' divided by ').replace(/×/g, ' times ').replace(/−/g, ' minus ').replace(/±/g, ' plus or minus ')
    .replace(/≤/g, ' is less than or equal to ').replace(/≥/g, ' is greater than or equal to ')
    .replace(/≠/g, ' is not equal to ').replace(/≈/g, ' is approximately ').replace(/√\s*/g, ' the square root of ')
    .replace(/π/g, ' pi ').replace(/∞/g, ' infinity ').replace(/°/g, ' degrees ')
    .replace(/\s+([,.?!:;])/g, '$1').replace(/\s+/g, ' ').trim();
}
/* SENTENCE BY SENTENCE (453) when a text is long: short utterances, so Chrome's cut-off at about fifteen seconds never comes and each full stop is a pause. */
function sayChunks_(text, max) {
  max = max || 180;
  const out = [], all = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
  /* A LINE THAT IS ALREADY SHORT IS ONE UTTERANCE: Read aloud hands over a line at a time, and a split there only adds a gap. */
  if (all.length <= max) return all ? [all] : [];
  all.replace(/([.?!])\s+(?=[A-Z0-9“\u0022\u0027(£¿¡])/g, '$1\u0001').split('\u0001').forEach(s => {
      while (s.length > max) {
        let cut = s.lastIndexOf(', ', max);
        if (cut < max / 3) cut = s.lastIndexOf(' ', max);
        if (cut < 1) cut = max;
        out.push(s.slice(0, cut + 1).trim()); s = s.slice(cut + 1).trim();
      }
      if (s) out.push(s);
    });
  return out;
}
/* CALM DELIVERY: a touch slow and low, a sentence an utterance so each ends on a small pause. */
const SAY_RATE = 0.9, SAY_PITCH = 0.95;
/* QUEUED INSIDE THE TAP'S OWN HANDLER (iPhone Safari speaks only there); `o` = { rate, volume, onend, onstart, lang }. `o.lang` (427): es-ES, fr-FR. */
function say_(text, o) {
  o = o || {};
  try {
    const lang = /^[a-z]{2}-[A-Z]{2}$/.test(String(o.lang || '')) ? o.lang : 'en-GB';
    const parts = sayChunks_(/^en/.test(lang) ? sayMaths_(text) : String(text));
    if (!parts.length || !canSay_()) { if (o.onend) o.onend(); return null; }
    const ss = window.speechSynthesis, voice = voicePick_(lang);
    let u = null;
    parts.forEach((p, i) => {
      u = new window.SpeechSynthesisUtterance(p);
      u.lang = voice && voice.lang ? String(voice.lang).replace('_', '-') : lang;
      if (voice) u.voice = voice;
      u.rate = o.rate || SAY_RATE;
      u.pitch = SAY_PITCH;
      u.volume = o.volume == null ? 1 : o.volume;
      if (i === 0 && o.onstart) u.onstart = o.onstart;
      if (i === parts.length - 1 && o.onend) { u.onend = o.onend; u.onerror = o.onend; }
      ss.speak(u);
    });
    return u;
  } catch (e) { return null; }
}

/* ---------- ONE CLICK HANDLER § */
const ACTIONS = {};
/** Register what a `data-do` means. */
/* EVERY ACTION MOVES `ACT_EPOCH` (see the note over `STALE`): a press is what can edit a column in place,
   and a column edited in place must not be kept by a landing on the grounds that its markup is the same. */
/* A SLOW ACT SHOWS ITS TAP AT ONCE (the tile's ring) and works after the next frame (990); `aria-busy`, so a `send_` inside keeps its own. */
const SLOW_ACTS_ = new Set(['card-share', 'card-cancel', 'lay-split']);
function on(name, fn) {
  ACTIONS[name] = function (el) { ACT_EPOCH++; if (!SLOW_ACTS_.has(name) || !el || !el.setAttribute) return fn.apply(this, arguments);
    const a = arguments; el.setAttribute('aria-busy', 'true');
    requestAnimationFrame(() => setTimeout(() => { try { fn.apply(this, a); } finally { el.removeAttribute('aria-busy'); } })); };
}

/* Asking again. A failure that offers no way to retry costs a whole page reload, and on a phone a
   reload is the thing most likely to lose whatever was half-typed on another screen. */
on('retry', () => { LOADED = false; LOAD_FAILED = ''; LIBRARY_FAILED = '';
  /* THE LIBRARY IS MEMOISED and `Try again` has to actually try again: `libraryRows_`
     returns `LIBRARY_ROWS` untouched once it is set, so leaving the empty array in place
     would make the button repaint the same failure for ever. */
  LIBRARY_ROWS = null;
  banner(''); bootLoaded_(false); repaint(); load(); });

/* CARDS OPEN A SHEET, and an attempt to open them in place has been taken out again. § */

/* ---------- WHAT HAPPENED WHEN YOU PRESSED THAT § */
let CLICK_LOG = false;
function clicks(on) {
  CLICK_LOG = (on === undefined) ? !CLICK_LOG : !!on;
  console.log(CLICK_LOG
    ? 'Watching presses. Tap something. `clicks(false)` to stop.'
    : 'Stopped watching presses.');
  return CLICK_LOG;
}

/* ---------- A SWIPE IS NOT A PRESS, AND THE BROWSER CANNOT TELL § */
let PRESS_MOVED = false;
/* AND A PRESS THAT BEGAN ON A CARD STILL SLIDING — see `SLIDE_UNTIL` above `placeGrid`. § */
let PRESS_SLIDING = false;

/* THE THING YOU PRESSED STAYS LIT UNTIL THE SCREEN HAS ANSWERED. § */
let PRESSED = null;
let PRESSED_OFF = 0;

const PRESS_SEL_ = '[data-do], .tab, button, a[href], summary, label, [role="button"]';
function pressMark_(t) {
  pressClear_();
  /* THE NEAREST CONTROL OF ANY KIND, not the exact target — a word inside a card lights the card; a calculator key, a link tile or a fold's summary carries no `data-do` and is lit too (536). */
  const el = t && t.closest && t.closest(PRESS_SEL_);
  /* NOT A DISABLED CONTROL. § */
  if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
  PRESSED = el;
  el.classList.add('is-pressed');
}

function pressClear_() {
  clearTimeout(PRESSED_OFF);
  if (PRESSED) { try { PRESSED.classList.remove('is-pressed'); } catch (e) { oops_(e, 'shell:pressClear_') } }
  PRESSED = null;
}

/* TWO FRAMES, NOT ONE. § */
function pressDone_() {
  /* ONLY THE PRESS IT WAS ASKED FOR: a new finger landing inside those two frames keeps its own mark. */
  const was = PRESSED;
  requestAnimationFrame(() => requestAnimationFrame(() => { if (PRESSED === was) pressClear_(); }));
}

addEventListener('pointerdown', e => {
  if (!e.isPrimary) return;
  if (e.pointerType === 'mouse' && e.buttons !== 1) return;
  /* THE LAST 60ms ARE LET THROUGH — by then the card has all but arrived. § */
  PRESS_SLIDING = performance.now() < SLIDE_UNTIL - 60
    && !!(e.target && e.target.closest && e.target.closest('#screen'));
  /* AND NOTHING IS LIT UNDER A FINGER THAT IS CATCHING A MOVING CARD rather than pressing it. */
  if (PRESS_SLIDING) { pressClear_(); return; }
  pressMark_(e.target);
}, { passive: true, capture: true });
addEventListener('pointercancel', pressClear_, { passive: true });
/* THE MARK LASTS AS LONG AS THE FINGER (536, U9): it goes two frames after the lift, and the orphan timer starts at the lift too, so a held press stays lit. */
addEventListener('pointerup', e => {
  if (!e.isPrimary || !PRESSED) return;
  pressDone_();
  clearTimeout(PRESSED_OFF);
  PRESSED_OFF = setTimeout(pressClear_, 1200);
}, { passive: true, capture: true });
/* iOS PAINTS `:active` ONLY ON A PAGE WITH A TOUCH LISTENER; this one is the app's own promise of that, not the measuring tool's in find.js. */
document.addEventListener('touchstart', () => {}, { passive: true });
/* A FIELD ON THE CARD IN FRONT TAKING FOCUS, OR A SELECT OR A BOX CHANGED ON IT, HOLDS IT TOO — see `HOLD_AT`. § */
document.addEventListener('focusin', e => holdHere_(e.target), true);
document.addEventListener('change', e => holdHere_(e.target), true);

/* ---------- ON A WIDE WINDOW, PRESSING A CARD BESIDE THE ONE IN FRONT BRINGS IT TO THE FRONT § */
function wideHit_(x, y) {
  if (!WIDE) return null;
  const pages = document.querySelectorAll('#screen > .screen > .page');
  for (const pg of pages) {
    if (pg.classList.contains('on') || pg.style.visibility === 'hidden') continue;
    const host = pg.parentElement;
    if (!host || host.style.visibility === 'hidden' || host.style.opacity === '0') continue;
    const r = pg.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
    const id = host.id.replace(/^s-/, '');
    if (!TABS.some(t => t.id === id)) continue;
    const pos = Array.prototype.indexOf.call(host.querySelectorAll(':scope > .page'), pg);
    return { id: id, p: logIndex_(id, pos), el: pg };
  }
  return null;
}
