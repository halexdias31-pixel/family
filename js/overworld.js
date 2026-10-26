/* @family. — overworld.js ONE FILE, SPLIT. § */


/* ---------- THE PICTURE § */
const FEED_PICS = {};        // one lookup per search term, for as long as the tab is open

function feedPicture(query) {
  const q = String(query || '').trim();
  if (!q) return Promise.resolve(null);
  if (FEED_PICS[q] !== undefined) return Promise.resolve(FEED_PICS[q]);

  const key = ((DATA.constants || {}).vars || {}).giphy_key;
  const url = key
    ? 'https://api.giphy.com/v1/gifs/search?api_key=' + encodeURIComponent(key)
      + '&q=' + encodeURIComponent(q)
      /* `rating=g` is not optional on a site children open. Without it a search for "pistol
         shrimp" can return anything Giphy has under that phrase. */
      + '&limit=1&rating=g&lang=en'
    /* `origin=*` is what makes Commons answer a browser at all — without it the request is made, refused by CORS, and fails in a way that looks identical to the § */
    : 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*'
      + '&generator=search&gsrnamespace=6&gsrlimit=1'
      + '&gsrsearch=' + encodeURIComponent('filetype:bitmap ' + q)
      + '&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900';

  return fetch(url)
    .then(r => r.json())
    .then(d => {
      let out = null;
      if (key) {
        const g = (d.data || [])[0];
        if (g) out = { src: (g.images && g.images.downsized_medium || {}).url || '',
                       by: 'GIPHY' };
      } else {
        const pages = ((d.query || {}).pages) || {};
        const first = Object.keys(pages).map(k => pages[k])[0];
        const info = first && (first.imageinfo || [])[0];
        if (info) {
          const meta = info.extmetadata || {};
          out = {
            src: info.thumburl || info.url,
            /* The artist field is HTML — Commons stores a link in it — so the tags are stripped
               rather than escaped and rendered. A credit line is a name, not markup. */
            by: String((meta.Artist || {}).value || '').replace(/<[^>]*>/g, '').trim().slice(0, 60)
                || 'Wikimedia Commons',
          };
        }
      }
      FEED_PICS[q] = out && out.src ? out : null;
      return FEED_PICS[q];
    })
    /* A TERM THE SERVICE ANSWERED WITH NOTHING is remembered as nothing, so a deck that repeats does not ask again for an answer already given. § */
    .catch(() => null);
}

function drawFeed() {
  const host = $('feed-screen');
  if (!host) return;
  // No end to reach, so no wrapping and no going below the first.
  FEED_AT = Math.max(0, FEED_AT);
  const it = feedItem(FEED_AT);
  if (!it) return;
  host.innerHTML = feedSlide(it);

  /* The photograph arrives afterwards and fades in over the drawing. § */
  /* A CLIP PLAYS HERE TOO, AND IT HAS TO BE ASKED. § */
  const vid = host.querySelector('video.feed-vid');
  if (vid && typeof reelPlay_ === 'function') reelPlay_(vid);

  const at = FEED_AT;
  if (it.pic) feedPicture(it.pic).then(found => {
    if (!found || at !== FEED_AT) return;
    const art = host.querySelector('.feed-art');
    if (!art) return;
    const img = new Image();
    img.onload = () => {
      if (at !== FEED_AT) return;
      art.style.backgroundImage = `url("${found.src}")`;
      art.classList.add('has-photo');
      const cred = host.querySelector('.feed-credit');
      if (cred && found.by) cred.textContent = found.by;
    };
    /* A src that 404s or is blocked simply never loads, and the gradient stays. Nothing to
       handle: the failure state and the starting state are the same picture. */
    img.src = found.src;
  });

  /* ---------- WHERE YOU GOT TO IS NOT KEPT ANY MORE § */
}

/* THE FACT'S CARD AND NOTHING ELSE — the widget's declared `draw`, for the builder (docs/history/341). § */
function feedPaint_() {
  const host = $('feed-screen');
  if (!host) return false;
  if (FEED_AT === null) FEED_AT = 0;
  const it = feedItem(Math.max(0, FEED_AT));
  if (!it) return false;
  const html = feedSlide(it);
  if (/<video\b/i.test(html)) return false;
  host.innerHTML = html;
  return true;
}

function initFeed() {
  if (!$('feed-screen')) return;
  /* EVERY SESSION STARTS AT THE FIRST CARD OF ITS OWN SHUFFLE — see `drawFeed` above and the long note in `feedShuffle`. § */
  if (FEED_AT === null) FEED_AT = 0;
  drawFeed();
}

/* TAP FOR THE NEXT, and the left third for the one before — the gesture stories taught everybody, and it costs one line more than a tap that only goes forward. § */
on('feed-tap', (el, e) => {
  const box = el.getBoundingClientRect();
  const x = (e && e.clientX !== undefined ? e.clientX : box.right) - box.left;
  FEED_AT += (x < box.width * 0.3 && FEED_AT > 0) ? -1 : 1;
  drawFeed();
});


function paintTimer() {
  const el = $('timer-display');
  if (!el) return;
  const m = Math.floor(timerState.left / 60), s = timerState.left % 60;
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  /* Red in the last minute. The one moment the number has to be findable from across a room, and
     the only thing on this screen allowed to be red. */
  el.classList.toggle('bad', timerState.left > 0 && timerState.left <= 60);
  const btn = $('timer-toggle');
  if (btn) btn.textContent = timerState.running ? '❚❚' : '▶';
}


let flappyState = null;

/* OPEN A WIDGET. Its markup into the sheet, then the one function that brings it to life. § */
/* ---------- `on('widget')` IS GONE, AND IT WAS A POP-UP § */

/* Started when their screen appears, and only then — a canvas loop running behind a screen nobody
   is looking at is a flat battery for nothing. */
/* `wake` IS GONE, and with it the whole idea of a screen having things that need starting. § */

/* `on('chess-new')` and `on('chess-undo')` are in games.js beside the board they act on — they went
   when the board played a computer, and came back when it became two players round one phone. */
on('tt-start',   () => startTimesTables?.());
on('tt-stop',    () => endTimesTables?.());
/* `on('flap-start')` was here — a toast saying "Tap the canvas to flap". § */

/* SWIPING BETWEEN TABS. § */

const SWIPE = {
  x: 0, y: 0,          // where the finger started
  d: 0,                // how far it has travelled along the axis it claimed
  axis: null,          // null until the finger commits: 'x' or 'y'
  live: false,
  cells: null,         // the strip being dragged, held so the release moves the same one
  id: null,            // which finger this is, so a second one cannot steer it
  /* THE FRAME BOOKED BUT NOT YET DRAWN, and the position it will use when it is. § */
  frame: 0,
  px: 0,
  /* HOW FAST, AND WHEN. Two samples is all a flick needs — where the finger was a moment ago and where it is now — and keeping only the LAST short stretch is what § */
  vAt: 0, vD: 0, v: 0,
  /* Whether the one-off setup for this drag has been done — the cells taken off their transition,
     and the measurements held still. Once per gesture, not once per frame. */
  held: false,
  lock: 0,             // the drag's dead zone, put back on every touch: NOT the padlock (`PADLOCK` below)
};

/* THE PADLOCK (457, 461): a game widget's (`game`, 'id@column:page') or a question page's (`q`, 'column:page') holds the column still. Its own name, as `SWIPE.lock` is zeroed on every touch. */
const PADLOCK = { game: '', q: '' };
const padlocked_ = () => !!(PADLOCK.game || PADLOCK.q);
const padHere_ = () => String(typeof AT !== 'undefined' ? AT : '') + ':' + String((typeof PAGE !== 'undefined' && PAGE[AT]) || 0);

/* ONE PADLOCK FOR EVERY GAME (461): `widgetOnColumn_` puts it on each game widget, so a new game has it with no code of its own. */
const gameLocked_ = id => !!PADLOCK.game && PADLOCK.game.split('@')[0] === String(id);
const gameLockLook_ = on => ({ icon: on ? 'lock' : 'unlock', label: on ? 'Locked' : 'Lock',
  note: on ? 'tap to let the page move' : 'hold this game still', on, pressed: on });
function gameLockTile_(id) {
  return tile_(Object.assign(gameLockLook_(gameLocked_(id)), { act: 'game-lock', cls: 'game-lock', data: { w: id } }));
}
function gameLockSet_(v) {
  PADLOCK.game = v || '';
  document.querySelectorAll('.game-lock').forEach(el => {
    const on = gameLocked_(el.getAttribute('data-w'));
    tileSet_(el, gameLockLook_(on));
    el.closest('.is-widget')?.classList.toggle('is-locked', on);
  });
  pageHold_(!!PADLOCK.game);
}
on('game-lock', el => {
  const id = el.getAttribute('data-w');
  gameLockSet_(gameLocked_(id) ? '' : id + '@' + padHere_());
});
/* LET GO WHEN THE PERSON LEAVES: a tab, a link, another page of the column (`placeCells`), or the app hidden. */
function gameLockStray_() { if (PADLOCK.game && PADLOCK.game.split('@')[1] !== padHere_()) gameLockSet_(''); }
document.addEventListener('visibilitychange', () => { if (document.hidden && PADLOCK.game) gameLockSet_(''); });

/* ABSOLUTE WHILE A GAME IS LOCKED: the pager's own drag-scroll fallback, a native pan, a wheel and an arrow key's page scroll were each a way round (461). */
const PAD_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '];
function padStop_(e) {
  if (!e.cancelable) return;
  if (e.type === 'keydown') {
    const t = e.target;
    if (PAD_KEYS.indexOf(e.key) < 0 || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) return;
  }
  e.preventDefault();
}
/* LISTENING ONLY WHILE LOCKED: a blocking touchmove/wheel listener makes every scroll in the app wait for the page's thread (419). */
let PAD_HOLD = false;
function pageHold_(on) {
  if (!!on === PAD_HOLD) return;
  PAD_HOLD = !!on;
  document.documentElement.classList.toggle('padlocked', PAD_HOLD);
  ['touchmove', 'wheel'].forEach(n => (on ? addEventListener : removeEventListener)(n, padStop_, { passive: false }));
  (on ? addEventListener : removeEventListener)('keydown', padStop_);
}

/* DOES THIS DRAG BELONG TO THE GRID, OR TO WHAT IS UNDER THE FINGER? § */
function axisFree(target, axis, dir) {
  /* ---------- THE SHEET NO LONGER BLOCKS EVERYTHING, ONLY THE GRID § */
  if (!$('sheet').classList.contains('hidden')) return false;   // the sheet is the page (420)
  if (padlocked_()) return false;
  /* ---------- A SELECT IS NOT NAMED, AND A TEXTAREA IS MEASURED § */
  if (target.closest?.('[data-noswipe]')) return false;
  /* A cell is not a scroll container any more, so the walk below stops at anything genuinely inside one — the docket's list, the notepad — and hands everything § */

  return !scrollHost_(target, axis, dir);
}

/* ---------- WHICH BOX WANTS IT, NOT MERELY WHETHER ONE DOES § */
function scrollHost_(target, axis, dir) {
  let el = target;
  while (el && el !== document.body) {
    const style = getComputedStyle(el);
    const over = axis === 'x' ? style.overflowX : style.overflowY;
    if (over === 'auto' || over === 'scroll') {
      const size = axis === 'x' ? el.clientWidth : el.clientHeight;
      const full = axis === 'x' ? el.scrollWidth : el.scrollHeight;
      const pos  = axis === 'x' ? el.scrollLeft : el.scrollTop;
      /* MORE THAN A PIXEL OR TWO, and this number is the whole fault behind "swiping up sometimes thinks I am scrolling". § */
      if (full > size + 6) {
        /* It can scroll. Whether it still can IN THIS DIRECTION is what decides: § */
        const atStart = pos <= 0, atEnd = pos + size >= full - 1;
        if ((dir > 0 && !atStart) || (dir < 0 && !atEnd)) return el;
      }
    }
    el = el.parentElement;
  }
  return null;
}

/* HOW FAR IS FAR ENOUGH — one distance, in pixels, whichever way you are going. § */
/* ---------- WHAT COUNTS AS TURNING THE PAGE § */
/* ---------- AND "MOST OF THE WAY" HAD BECOME FIFTY-SIX PIXELS § */
const THROW_PX = 56;          // far enough, in pixels, at the least
const THROW_FRACTION = 0.3;   // ...a third of the way to the next card
const THROW_MAX = 120;        // ...and never more than this, whichever card it is
const FLICK = 0.4;            // fast enough, in pixels per millisecond

/* Far enough, for this axis. § */
/* ---------- THE RELEASE SPEED, FITTED RATHER THAN SUBTRACTED § */
function releaseV_(trail, axis, upAt) {
  const k = axis === 'x' ? 1 : 2, last = trail && trail[trail.length - 1];
  if (!last || upAt - last[0] > 50) return 0;
  const pts = trail.filter(p => p[0] >= last[0] - 80);
  if (pts.length < 2) return 0;
  let n = 0, st = 0, sp = 0, stt = 0, stp = 0;
  pts.forEach(p => { const t = p[0] - last[0]; n++; st += t; sp += p[k]; stt += t * t; stp += t * p[k]; });
  const den = n * stt - st * st;
  return den > 1e-6 ? (n * stp - st * sp) / den : 0;
}

const THROW = axis => {
  /* THE ACTUAL STEP, both ways. `innerHeight * 0.5` was a guess at the vertical one and it did not
     match the guess the settle used or the one the axis used — three numbers for one distance. */
  const step = axis === 'x' ? stepX_() : stepY_();
  return Math.min(THROW_MAX, Math.max(THROW_PX, (step || 0) * THROW_FRACTION));
};

/* POINTER EVENTS, NOT TOUCH EVENTS. § */
addEventListener('pointerdown', e => {
  if (!e.isPrimary) return;                            // a second finger is a pinch, not a swipe
  /* A mouse only counts while a button is down. Without this, moving the cursor across the page
     would drag the grid. */
  if (e.pointerType === 'mouse' && e.buttons !== 1) return;
  SWIPE.x = e.clientX; SWIPE.y = e.clientY;
  SWIPE.d = 0; SWIPE.axis = null; SWIPE.cells = null; SWIPE.scroll = null;
  SWIPE.live = true;
  SWIPE.target = e.target;
  SWIPE.frame = 0;
  SWIPE.held = false;
  SWIPE.vAt = Date.now(); SWIPE.vD = 0; SWIPE.v = 0;
  SWIPE.lock = 0; SWIPE.catch = 0; SWIPE.last = null;
  SWIPE.trail = [[e.timeStamp, e.clientX, e.clientY]];
  /* A FINGER ON A CARD STILL GLIDING STOPS IT WHERE IT IS — see `glide_` below — and a new finger
     is a new drag, which measures its own columns rather than inheriting the last one's (`DRAG_PLAN`
     in shell.js). */
  glideStop_();
  DRAG_PLAN = null;
  /* A RELEASE NOBODY PLACED YET IS NOT THIS GESTURE'S. Cleared so a later tap cannot inherit the
     last swipe's speed — see `settleFrom_` in shell.js. */
  if (typeof settleFrom_ === 'function') settleFrom_(null);
  SWIPE.id = e.pointerId;
  /* A NEW GESTURE HAS NOT MOVED YET — see `PRESS_MOVED` in shell.js. Cleared here as well as
     by the click it swallows, so a drag that ends without one cannot eat the next tap. */
  PRESS_MOVED = false;

  /* NO POINTER CAPTURE, AND THAT WAS THE BUG. § */
  SWIPE.id = e.pointerId;
}, { passive: true });

addEventListener('pointermove', e => {
  /* THE SAME FINGER THAT STARTED IT, and nothing else. § */
  if (!SWIPE.live || e.pointerId !== SWIPE.id) return;
  if (e.pointerType === 'mouse' && e.buttons !== 1) { SWIPE.live = false; return; }
  const dx = e.clientX - SWIPE.x, dy = e.clientY - SWIPE.y;
  /* EVERY SAMPLE, INCLUDING THE ONES THE BROWSER FOLDED TOGETHER — `releaseV_` above. Before any
     early return, so a gesture the grid has not claimed yet still has its start recorded. */
  {
    const co = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
    (co && co.length ? co : [e]).forEach(p => SWIPE.trail.push([p.timeStamp || e.timeStamp, p.clientX, p.clientY]));
    while (SWIPE.trail.length > 2 && SWIPE.trail[0][0] < e.timeStamp - 120) SWIPE.trail.shift();
  }

  /* THIS IS A DRAG, WHATEVER THE GRID DECIDES NEXT. § */
  if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
    /* AND THE PRESSED LOOK GOES WITH IT, NOW. § */
    if (!PRESS_MOVED && typeof pressClear_ === 'function') pressClear_();
    PRESS_MOVED = true;
  }

  /* THE DECISION, made once. § */
  if (!SWIPE.axis) {
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    /* ---------- NOT WHILE A FINGER IS ON THE ARMED DRAWING § */
    if (typeof padBusy_ === 'function' && padBusy_()) { SWIPE.live = false; return; }
    /* NOR WHILE A FINGER IS MOVING A CARET OR A SELECTION IN A BOX (385, `kpBusy_`) */
    if (typeof kpBusy_ === 'function' && kpBusy_()) { SWIPE.live = false; return; }
    /* NOR WHILE THE MAGNIFIER IS HELD OVER A QUESTION (463, `magBusy_`) */
    if (typeof magBusy_ === 'function' && magBusy_()) { SWIPE.live = false; return; }
    /* A LOCKED GAME KEEPS EVERY DRAG: no column turn and no scroll of the page under it (461). */
    if (PADLOCK.game) { SWIPE.live = false; return; }
    /* ONE COUNT FOR THE WHOLE DECISION — `countHold_` in shell.js. § */
    countHold_(true);
    try {
      let axis = Math.abs(dx) > Math.abs(dy) * 1.4 ? 'x' : 'y';
      /* ---------- UNLESS UP AND DOWN HAS NOWHERE TO GO § */
      if (axis === 'y' && Math.abs(dx) >= Math.abs(dy) * 0.5) {
        const n = AXES.y.count(), at = AXES.y.at();
        const nowhere = n <= 1 || (dy > 0 && at <= 0) || (dy < 0 && at >= n - 1);
        if (nowhere && !scrollHost_(SWIPE.target, 'y', dy)) axis = 'x';
      }
      const dir = axis === 'x' ? dx : dy;
      if (!AXES[axis].count() || !axisFree(SWIPE.target, axis, dir)) {
        /* ---------- THE GRID WILL NOT TAKE IT, SO SOMETHING UNDER THE FINGER MIGHT § */
        const host = axis === 'y' && $('sheet').classList.contains('hidden')
          && !SWIPE.target.closest?.('[data-noswipe]')
          ? scrollHost_(SWIPE.target, axis, dir) : null;
        if (!host) { SWIPE.live = false; return; }
        SWIPE.scroll = host;
        /* FROM WHERE THE FINGER IS NOW, not where it started — the grid's own dead-zone pop, in the
           box that scrolls instead. */
        SWIPE.scrollFrom = host.scrollTop + dy;
        SWIPE.axis = axis;
      } else {
        SWIPE.axis = axis;
        SWIPE.cells = AXES[axis].cells();
        /* ---------- THE TEN PIXELS ARE NOT ADDED IN ONE FRAME § */
        SWIPE.lock = Math.sign(dir) * Math.min(Math.abs(dir), 10);
        SWIPE.last = AXES[axis].count() - 1;
        /* ---------- AND A CARD STILL SETTLING IS CAUGHT WHERE IT IS § */
        SWIPE.catch = settleLeft_(axis);
      }
    } finally { countHold_(false); }
  }

  /* SCROLLING THAT BOX AND NOTHING ELSE. No cells, no velocity, no placement -- the grid is not
     moving, so none of the machinery below applies. */
  if (SWIPE.scroll) {
    if (e.cancelable) e.preventDefault();
    SWIPE.scroll.scrollTop = SWIPE.scrollFrom - dy;
    return;
  }

  const ax = AXES[SWIPE.axis];
  const travelled = SWIPE.axis === 'x' ? dx : dy;
  /* THE COUNT FROM THE LOCK, not rebuilt on every move: `ax.count()` walks the column's page list,
     which on Settings is a millisecond a move at 1x and six at 4x, for a number that cannot change
     while the finger is down. */
  const at = ax.at(), last = SWIPE.last !== undefined && SWIPE.last !== null ? SWIPE.last : ax.count() - 1;
  /* Resisted at the ends. The grid still moves, grudgingly, which says "nothing that way" better
     than refusing to move at all. */
  const end = (travelled > 0 && at === 0) || (travelled < 0 && at === last);

  /* A mouse drag selects text as it goes, so the screen ends up half-highlighted behind the movement. § */
  if (e.cancelable) e.preventDefault();
  document.getSelection?.()?.removeAllRanges?.();
  SWIPE.d = travelled;
  /* `no-anim` WAS ADDED TO THE DRAGGED CELLS HERE, and it switched off every transition on them — including the OTHER axis's slide, which is the jump `colWrite_` § */
  SWIPE.held = true;

  /* ONE PLACEMENT PER FRAME THAT IS ACTUALLY DRAWN. § */
  /* ---------- AT THE END OF THE RUN, NOTHING MOVES § */
  SWIPE.px = (end ? 0 : travelled - SWIPE.lock) + SWIPE.catch;
  /* THE CATCH IS IN WHAT IS PLACED AND NEVER IN WHAT IS DECIDED. § */
  SWIPE.d = travelled;
  if (SWIPE.frame) return;
  SWIPE.frame = requestAnimationFrame(() => {
    SWIPE.frame = 0;
    if (!SWIPE.live || !SWIPE.axis) return;
    /* THE SAME PLACER that puts them at rest, given a drag. One function decides where a cell is,
       whether a finger is on it or not — two would be two things to keep in step, which is how the
       axes came apart in the first place. */
    /* A DRAG AT EXACTLY NOUGHT IS STILL A DRAG. § */
    placeCells(SWIPE.axis, false, SWIPE.px || 0.01);
  });
}, { passive: false });

addEventListener('pointerup', e => {
  /* AND THE SAME FINGER LETTING GO. § */
  if (!SWIPE.live || (e && e.pointerId !== undefined && e.pointerId !== SWIPE.id)) return;
  const v = releaseV_(SWIPE.trail, SWIPE.axis, e && e.timeStamp !== undefined ? e.timeStamp : performance.now());
  const axis = SWIPE.axis, d = SWIPE.d, cells = SWIPE.cells, scrolled = SWIPE.scroll;
  /* EVERYTHING A DRAG SET, PUT BACK — in one line, so a field added later is added here rather than left to be noticed. § */
  SWIPE.live = false; SWIPE.axis = null; SWIPE.d = 0; SWIPE.cells = null;
  SWIPE.held = false; SWIPE.px = 0; SWIPE.v = 0; SWIPE.vD = 0; SWIPE.vAt = 0;
  SWIPE.lock = 0; SWIPE.catch = 0;
  SWIPE.id = null;
  /* A frame booked and not yet run would place the grid mid-drag AFTER the drag had finished,
     putting it back where the finger left it a moment after it had settled somewhere else. */
  if (SWIPE.frame) { cancelAnimationFrame(SWIPE.frame); SWIPE.frame = 0; }
  /* A TALL CARD LET GO WHILE IT WAS MOVING CARRIES ON — see `glide_`. The finger's speed is the
     card's, the other way round: a thumb going up moves the text up, which is `scrollTop` going up. */
  if (scrolled && axis === 'y') { SWIPE.scroll = null; glide_(scrolled, -v); return; }
  if (!axis || !cells) return;

  const ax = AXES[axis];
  /* THE COUNT HELD FOR THE RELEASE — see `countHold_`. § */
  if (axis === 'y') countHold_(true);
  try {

    /* FAR ENOUGH, OR FAST ENOUGH — and the flick has to be going the SAME WAY as the drag. § */
    /* ---------- AND FAR ENOUGH IS NOT ENOUGH IF THE FINGER IS ON ITS WAY BACK § */
    const backing = Math.abs(v) >= 0.2 && (v < 0) !== (d < 0);
    const far = Math.abs(d) >= THROW(axis) && !backing;
    const fast = Math.abs(v) >= FLICK && (v < 0) === (d < 0) && Math.abs(d) > 8;
    const going = far || fast;

    /* ---------- THE SETTLE CARRIES ON AT THE SPEED THE FINGER WAS GOING § */
    settleFrom_(axis, v);

    /* The sweep `placeCells` skips during a drag — which screens nothing points at — runs once now.
       There is no pane-watching any more: sizes are fixed, so nothing can change size. */
    /* PAST THE END IS A SETTLE, NOT A TURN. § */
    const to = ax.at() + (d < 0 ? 1 : -1);
    if (going && to >= 0 && to < ax.count()) ax.go(to);
    else placeCells(axis);          // not far enough: it settles back, and is seen to
  } finally { countHold_(false); }
}, { passive: true });

/* ---------- A TALL CARD KEEPS MOVING AFTER THE THUMB LEAVES IT § */
const GLIDE = { frame: 0, el: null };
const GLIDE_DECAY = 0.998;     // per millisecond — a phone's own "normal" deceleration
const GLIDE_MAX = 4;           // px/ms: past this a flick is a throw, and a throw is not reading
function glideStop_() {
  if (GLIDE.frame) cancelAnimationFrame(GLIDE.frame);
  GLIDE.frame = 0; GLIDE.el = null;
}
function glide_(el, v) {
  glideStop_();
  if (!el || !(Math.abs(v) >= 0.15)) return;
  v = Math.max(-GLIDE_MAX, Math.min(GLIDE_MAX, v));
  GLIDE.el = el;
  const id = AT, p = PAGE[AT] || 0;
  let last = performance.now(), pos = el.scrollTop, wrote = pos;
  const step = now => {
    GLIDE.frame = 0;
    if (GLIDE.el !== el || !el.isConnected) return;
    if (AT !== id || (PAGE[id] || 0) !== p || Math.abs(el.scrollTop - wrote) > 1) { GLIDE.el = null; return; }
    const dt = Math.max(1, Math.min(48, now - last));
    last = now;
    /* THE DISTANCE OVER THIS FRAME, integrated rather than v * dt, so a long frame cannot overshoot
       what the decay would have allowed. */
    const k = Math.pow(GLIDE_DECAY, dt);
    pos += v * (1 - k) / (1 - GLIDE_DECAY);
    v *= k;
    const max = el.scrollHeight - el.clientHeight;
    if (pos <= 0 || pos >= max) pos = Math.max(0, Math.min(max, pos));
    el.scrollTop = pos;
    wrote = el.scrollTop;
    if (pos <= 0 || pos >= max || Math.abs(v) < 0.02) { GLIDE.el = null; return; }
    SLIDE_UNTIL = Math.max(SLIDE_UNTIL, performance.now() + 100);
    GLIDE.frame = requestAnimationFrame(step);
  };
  SLIDE_UNTIL = Math.max(SLIDE_UNTIL, performance.now() + 100);
  GLIDE.frame = requestAnimationFrame(step);
}

/* THE SAME GESTURE ON A TRACKPAD. § */
let wheelAt = 0, wheelStop = null, wheelDone = false;
/* A NEW FLICK INSIDE THE LAST ONE'S MOMENTUM: the tail only decays and never turns round, so a reversal or a sharp rise is fingers again (401). */
let wheelLast = 0, wheelSign = 0, wheelTurned = 0;
const wheelWin = [];
const WHEEL_RISE = 3, WHEEL_FRESH = 30, WHEEL_GAP_MS = 300;

addEventListener('wheel', e => {
  const axis = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4 ? 'x' : 'y';
  const delta = axis === 'x' ? e.deltaX : e.deltaY;
  if (!AXES[axis].count()) return;
  if (!axisFree(e.target, axis, -delta)) return;

  /* PIXELS OVER THE LAST 60ms, NOT PER EVENT: input folded or bunched by a slow page keeps the same sum, so only real fingers rise (401). */
  const mag = Math.abs(delta), sign = Math.sign(delta), now = e.timeStamp || performance.now();
  wheelWin.push([now, mag]);
  while (wheelWin.length && wheelWin[0][0] < now - 60) wheelWin.shift();
  const rate = wheelWin.reduce((n, w) => n + w[1], 0);
  if (wheelDone && sign && now - wheelTurned > WHEEL_GAP_MS
      && (sign !== wheelSign || (rate >= WHEEL_FRESH && rate > wheelLast * WHEEL_RISE))) { wheelAt = 0; wheelDone = false; }
  if (sign) { wheelLast = sign === wheelSign ? Math.min(wheelLast * 0.8 + rate * 0.2, rate) : rate; wheelSign = sign; }
  wheelAt += delta;
  /* ONE NOTCH IS ONE WIDGET. § */
  if (!wheelDone && Math.abs(wheelAt) > 40) {
    wheelDone = true;
    wheelTurned = now;
    const ax = AXES[axis];
    const to = ax.at() + (wheelAt > 0 ? 1 : -1);
    if (to >= 0 && to < ax.count()) ax.go(to);
  }
  /* A gap of 140ms means the fingers have stopped: long enough to outlast the momentum, short
     enough that a second deliberate flick is a second gesture. */
  clearTimeout(wheelStop);
  wheelStop = setTimeout(() => { wheelAt = 0; wheelDone = false; wheelLast = 0; wheelSign = 0; wheelWin.length = 0; }, 140);
}, { passive: true });

/* A finger interrupted — a call arriving, the app going to the background. Put the screen back,
   or it stays shifted sideways for ever. */
/* A finger interrupted — a call arriving, the app going to the background. Whatever was being
   dragged is put back, on whichever axis it was. */
/* A CANCELLED POINTER. § */
addEventListener('pointercancel', e => {
  if (!SWIPE.live || (e && e.pointerId !== undefined && e.pointerId !== SWIPE.id)) return;
  const axis = SWIPE.axis;
  /* The same reset as `pointerup`, because a cancelled gesture has to leave exactly as little
     behind as a finished one. */
  SWIPE.live = false; SWIPE.axis = null; SWIPE.d = 0; SWIPE.cells = null;
  SWIPE.held = false; SWIPE.px = 0; SWIPE.v = 0; SWIPE.vD = 0; SWIPE.vAt = 0;
  SWIPE.lock = 0; SWIPE.catch = 0;
  SWIPE.id = null;
  if (SWIPE.frame) { cancelAnimationFrame(SWIPE.frame); SWIPE.frame = 0; }
  if (axis) placeCells(axis);
}, { passive: true });


/* ---------- THE SCREEN CHANGING SHAPE UNDER THE APP § */
let RESHAPE = 0;
function reshaped_() {
  if (SWIPE.live) return;
  clearTimeout(RESHAPE);
  /* `'x'` names the axis the placement is FOR, and a full placement does both — every cell gets a new transform whichever is named. § */
  RESHAPE = setTimeout(() => { try { placeCells('x', true); } catch (err) {} }, 100);
}
addEventListener('resize', reshaped_, { passive: true });
/* `orientationchange` as well as `resize`: § */
addEventListener('orientationchange', reshaped_, { passive: true });
/* The visual viewport is the part you can actually see — it changes when the address bar slides
   away or a keyboard opens, and neither of those fires a window resize on iOS. */
if (window.visualViewport) {
  visualViewport.addEventListener('resize', reshaped_, { passive: true });
}

/* ---------- COMING BACK TO A TAB THAT WAS LEFT MID-GESTURE § */
addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') return;
  if (!SWIPE.live) return;
  const axis = SWIPE.axis;
  SWIPE.live = false; SWIPE.axis = null; SWIPE.d = 0;
  SWIPE.held = false; SWIPE.px = 0; SWIPE.v = 0; SWIPE.vD = 0; SWIPE.vAt = 0;
  SWIPE.lock = 0; SWIPE.catch = 0;
  SWIPE.id = null;
  if (SWIPE.frame) { cancelAnimationFrame(SWIPE.frame); SWIPE.frame = 0; }
  SWIPE.cells = null;
  /* AND PUT BACK, as `pointercancel` does. § */
  if (axis) { try { placeCells(axis); } catch (e) {} }
}, { passive: true });

/* IF ANY OF THIS THROWS, SAY SO ON THE SCREEN. § */
function bootFailed(err, when) {
  /* OFF, FIRST. Whatever went wrong, it is about to be written on the screen — and a splash still
     spraying over the top of it is the app looking busy while it has in fact stopped. */
  try { const sp = document.getElementById('splash'); if (sp) sp.classList.add('done'); } catch (e) {}

  try {
    const box = document.getElementById('screen') || document.body;
    box.innerHTML = ''
      + '<div style="padding:1rem;font:13px/1.5 ui-monospace,Menlo,monospace;color:#ffd7a8">'
      + '<p style="color:#ff8f6b;font-weight:700;margin:0 0 .6rem">'
      + 'The app stopped while ' + String(when) + '.</p>'
      + '<p style="margin:0 0 .6rem;white-space:pre-wrap">'
      + String((err && err.message) || err) + '</p>'
      + (err && err.stack
          ? '<p style="margin:0 0 .6rem;color:#9a8f82;white-space:pre-wrap;font-size:11px">'
            + String(err.stack).split('\n').slice(0, 4).join('\n') + '</p>'
          : '')
      + '<p style="margin:0;color:#9a8f82">site ' + SITE_VERSION + ' · css ' + cssVersion() + '</p>'
      + '</div>';
  } catch (e2) {
    /* Even that failed — the document is not there to write to. Nothing left but the console. */
  }
  try { console.error('@family. stopped while ' + when, err); } catch (e3) {}
}

/* ANYTHING THAT THROWS LATER, and did not get caught nearer to where it happened. § */
let toldYou = false;
addEventListener('error', e => {
  /* A resource, not the code. `target` is the <img> or <script> that failed. */
  if (e && e.target && e.target !== window && e.target.tagName) {
    const src = e.target.currentSrc || e.target.src || '';
    console.warn('[load]', e.target.tagName, src);
    /* A SCRIPT THAT DID NOT ARRIVE is not the same kind of thing as a picture that did not. § */
    if (e.target.tagName === 'SCRIPT') {
      banner('A part of the app did not load: ' + (src.split('/').pop().split('?')[0] || 'unknown')
        + ' — and everything listed after it in index.html is missing too. Check that file is '
        + 'there and that its name matches the list in index.html exactly.');
    }
    return;
  }
  if (toldYou) return;
  toldYou = true;

  const msg = String((e && e.error && e.error.message) || (e && e.message) || 'something went wrong');
  console.error('[window]', (e && e.error) || msg);
  /* A banner rather than the whole screen. Whatever threw, everything else still works — and if it
     did not, the person can see that for themselves without being told. */
  banner('Something went wrong: ' + msg
    + (/^Script error/i.test(msg)
        /* The browser is withholding it, which it does for any script it treats as cross-origin —
           and opening the app from a file:// path makes every script cross-origin. */
        ? ' — the browser will not say more than that when the app is opened from a file rather '
          + 'than from a web address. The console has the real one.'
        : ''));
});

/* A FLICK INSIDE AN OPEN SHEET SEPARATE FROM THE GRID'S GESTURE ON PURPOSE. § */
const SHEET_FLICK = { live: false, id: 0, x: 0, y: 0, at: 0 };

addEventListener('pointerdown', e => {
  if (!e.isPrimary || typeof sheetStep !== 'function' || !sheetStep) return;
  if ($('sheet').classList.contains('hidden')) return;
  if (e.pointerType === 'mouse' && e.buttons !== 1) return;
  if (e.target.closest?.('input, textarea, select, button, a, [data-noswipe]')) return;
  SHEET_FLICK.live = true; SHEET_FLICK.id = e.pointerId;
  SHEET_FLICK.x = e.clientX; SHEET_FLICK.y = e.clientY; SHEET_FLICK.at = Date.now();
}, { passive: true });

addEventListener('pointerup', e => {
  if (!SHEET_FLICK.live || e.pointerId !== SHEET_FLICK.id) return;
  SHEET_FLICK.live = false;
  if (typeof sheetStep !== 'function' || !sheetStep) return;

  const dx = e.clientX - SHEET_FLICK.x, dy = e.clientY - SHEET_FLICK.y;
  /* SIDEWAYS IS NOT THIS GESTURE, and a lazy diagonal is sideways. The grid uses 1.4 to favour the
     vertical; the same number here, for the same reason and so the two agree about what a
     vertical flick is. */
  if (Math.abs(dy) < 60 || Math.abs(dy) < Math.abs(dx) * 1.4) return;
  /* AND NOT A SLOW DRAG. Three quarters of a second of travel is somebody moving the page about,
     not flicking through it. */
  if (Date.now() - SHEET_FLICK.at > 750) return;

  const body = $('sheet-body');
  if (body) {
    const room = body.scrollHeight - body.clientHeight;
    const pos  = body.scrollTop;
    /* 2px, THE SAME SLACK THE GRID USES for the same rounding reason — a body that fits exactly
       still reports a pixel of overflow. */
    if (dy < 0 && room - pos > 2) return;    // flicking up, still more to read below
    if (dy > 0 && pos > 2) return;           // flicking down, still scrolled away from the top
  }

  /* DOWN IS BACKWARDS, up is forwards — the direction the content moves, which is the way the grid
     already reads a swipe and the way every list on a phone reads one. */
  try { sheetStep(dy > 0 ? -1 : 1); } catch (err) {}
}, { passive: true });
