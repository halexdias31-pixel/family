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
  lock: false,         // the console's padlock (games.js `nesLock_`): no swipe, wheel or arrow turns
};

/* DOES THIS DRAG BELONG TO THE GRID, OR TO WHAT IS UNDER THE FINGER? § */
function axisFree(target, axis, dir) {
  /* ---------- THE SHEET NO LONGER BLOCKS EVERYTHING, ONLY THE GRID § */
  if (!$('sheet').classList.contains('hidden')) return false;   // the sheet is the page (420)
  if (SWIPE.lock) return false;
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
/* THE BOARD — TILES, THE WAY POLYTOPIA DOES IT. § */

const OW_WORLD = 'Merton';

const OW = {
  tile: 9,            // metres a side. Small enough for a building to span several
  lift: 2.6,          // how thick a slab is
  gap: 0.9,           // how much of the tile the top face fills — the rest is the seam
  /* THE CAMERA. Looking DOWN at the board, which is the Polytopia angle and the thing the last
     version had wrong: it looked along the street, so the grid was edge-on and invisible. */
  /* ---------- WHERE THE BOARD SITS IN THE FRAME § */
  eyeH: 66,
  back: 70,
  look: 26,
  fov: 42,
  speed: 26,
  sun: [-0.35, 0.86, 0.36],
};

/* THE PALETTE. Bright and flat, because that is the style — the survey colours in the sheet are muted greys and browns for drawing a map, and a map is not what § */
const OW_TERRAIN = {
  grass:  '#6ab04c',
  park:   '#4e9b3c',
  water:  '#3aa8d8',
  road:   '#8d8579',
  plot:   '#b8a68c',
  farm:   '#c4b454',
};
const OW_KIND = {
  park: 'park', farm: 'farm', river: 'water', water: 'water',
};
/* And what a building looks like, by what it is. Two colours — walls and roof — and nothing else,
   which is the whole vocabulary Polytopia gives a structure. */
const OW_BUILD = {
  resi:   ['#e8dcc4', '#c0504d'],
  civic:  ['#e0d6c2', '#8e5572'],
  retail: ['#dfd3bb', '#d98c3a'],
  indust: ['#cfc7b8', '#5a6b7a'],
  farm:   ['#e3d9a8', '#7a8b3a'],
};

const OW_VS = `
attribute vec3 pos;
attribute vec3 col;
uniform mat4 mvp;
varying vec3 vcol;
void main() { vcol = col; gl_Position = mvp * vec4(pos, 1.0); }`;

const OW_FS = `
precision mediump float;
varying vec3 vcol;
void main() { gl_FragColor = vec4(vcol, 1.0); }`;

function owPerspective(fovDeg, aspect, near, far) {
  const f = 1 / Math.tan(fovDeg * Math.PI / 360), d = near - far;
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / d, -1, 0, 0, 2 * far * near / d, 0];
}
function owLookAt(eye, at, up) {
  const s = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const x3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const d3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const n3 = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const z = n3(s(eye, at)), x = n3(x3(up, z)), y = x3(z, x);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
          -d3(x, eye), -d3(y, eye), -d3(z, eye), 1];
}
function owMul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1]
                   + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return o;
}

/* `owInside` — POINT IN POLYGON — STOOD HERE. § */


/* ---------- THE WORLD, IN METRES, ON A GRID -------------------------------------------------------
   Degrees to metres, then metres to tiles. The grid is the unit everything below works in. */
/* ---------- THE BOARD IS A PATH, NOT A MAP § */
/* ---------- METRES TO TILES, ONCE, FOR EVERYTHING § */
const OW_TILE_K = 0.55;
const OW_TILE_P = 0.5;
/* EIGHT IS THE CEILING FOR A BUILDING AND FOURTEEN FOR OPEN GROUND, and the difference is what the ceiling is FOR. § */
const OW_SPAN_BUILT = 8;
const OW_SPAN_OPEN = 14;
const OW_OPEN_KINDS = { park: 1, farm: 1, river: 1, water: 1, green: 1, common: 1 };
const owTiles = (m, max) => Math.max(2, Math.min(max || OW_SPAN_BUILT,
  Math.round(OW_TILE_K * Math.pow(Math.max(0, Number(m) || 0), OW_TILE_P))));

function owWorld() {
  const rows = (DATA.landmarks || [])
    .filter(l => !S_(l.world) || norm(l.world) === norm(OW_WORLD))
    .filter(l => Number(l.lat) && Number(l.lng));
  if (!rows.length) return null;

  /* West to east. `sort_order` is not a column and does not need to be: longitude already says
     which order these stand in, and it cannot drift out of step with itself. */
  const order = rows.slice().sort((a, b) => Number(a.lng) - Number(b.lng));

  /* HOW MANY TILES EACH ONE NEEDS. § */
  const WIDE = { shed: 4, hall: 3, tower: 1, house: 1, dome: 2, slab: 2 };
  const items = [];
  let cx = 2;
  order.forEach(l => {
    const form = norm(l.form) || (Number(l.height) >= 30 ? 'tower'
      : Number(l.height) > 0 ? 'slab' : 'park');
    /* HOW WIDE THE PLOT IS. § */
    const need = (l.parts || []).reduce((m, p) => Math.max(m, (Number(p.x)||0) + (Number(p.w)||1)), 0);
    /* THE WIDTH, FROM `plots` — how much room this landmark needs to look like itself, not how big it really is. § */
    /* ---------- THE PLOT KEEPS THE SITE'S PROPORTIONS, WHATEVER ANGLE IT IS TURNED TO § */
    /* MEASURED ONCE, IN THE SQUARED FRAME, BEFORE ANY TURN. § */
    const sb0 = owSiteBox(l);
    /* ---------- HOW BIG IT IS ON THE BOARD, WORKED OUT RATHER THAN DECIDED § */
    /* THE SURVEYED METRES, under the names that mean metres. § */
    const real = { w: Number(l.widthM) || 0, d: Number(l.depthM) || 0 };
    let w, depth;
    if (!Number(l.plots) && real.w && real.d) {
      /* OPEN GROUND MAY RUN LONG ALONG THE PATH; nothing may run deep, because the camera cannot
         see past it. One rule, read off the kind the sheet already holds. */
      const open = OW_OPEN_KINDS[norm(l.kind)] ? OW_SPAN_OPEN : OW_SPAN_BUILT;
      w = owTiles(real.w, open);
      depth = owTiles(real.d, OW_SPAN_BUILT);
    } else {
      const asked = Math.max(1, Math.min(8, Number(l.plots) || WIDE[form] || 2));
      w = asked; depth = asked;
      if (sb0) {
        const bw = Math.max(1, sb0.maxX - sb0.minX), bd = Math.max(1, sb0.maxZ - sb0.minZ);
        if (bw >= bd) { w = asked; depth = Math.max(1, Math.round(asked * bd / bw)); }
        else { depth = asked; w = Math.max(1, Math.round(asked * bw / bd)); }
      }
    }
    w = Math.max(w, need);
    /* AND THE TURN, IN QUARTERS. § */
    const quarters = ((Math.round((Number(l.bearing) || 0) / 90) % 4) + 4) % 4;
    if (quarters === 1 || quarters === 3) { const t = w; w = depth; depth = t; }
    /* HOW DEEP THE PLOT IS. § */
    /* ---------- HOW DEEP THE PLOT IS, AND WHY THE CAP WAS WRONG § */
    /* THE SHEET STILL OVERRIDES the depth, for a site whose proportions are not what you want on the board — but it is no longer where the depth comes from, because § */
    if (Number(l.depth)) depth = Math.max(1, Math.min(10, Number(l.depth)));
    depth = Math.max(1, Math.min(10, depth));
    items.push({ l, form, x0: cx, w, depth, quarters, mid: cx + w / 2 });
    /* ONE EMPTY TILE BETWEEN PLOTS. Without it two buildings share an edge and read as one long
       building; with more than one the board becomes a row of islands. */
    cx += w + 1;
  });

  /* ROWS ARE COUNTED BACK FROM THE PATH, and that is the fix for the landmarks being on the wrong side. § */
  return { items, cols: cx + 2, rows: 6, length: (cx + 2) * OW.tile };
}

/* ---------- THE MESH -----------------------------------------------------------------------------
   Built once. Every tile classified, every tile drawn as a slab, and a block on the ones a building
   covers. */
function owMesh(world) {
  const pos = [], col = [];
  const rgb = hex => {
    const c = String(hex || '#6ab04c').replace('#', '');
    const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };
  const tri = (a, b, c, base, k) => [a, b, c].forEach(p => {
    pos.push(p[0], p[1], p[2]);
    col.push(base[0] * k, base[1] * k, base[2] * k);
  });
  /* A BOX — top and the two sides that face the camera. The other three are never seen from a fixed
     angle, and not building them is a third of the triangles saved on every single thing here. */
  /* ---------- EVERY SIDE, NOT THREE OF THEM § */
  const box = (x0, x1, y0, y1, z0, z1, c) => {
    tri([x0,y1,z0],[x1,y1,z0],[x1,y1,z1], c, 1);        // the roof, full light
    tri([x0,y1,z0],[x1,y1,z1],[x0,y1,z1], c, 1);
    tri([x0,y0,z1],[x1,y0,z1],[x1,y1,z1], c, 0.74);     // the front, toward the walker
    tri([x0,y0,z1],[x1,y1,z1],[x0,y1,z1], c, 0.74);
    tri([x1,y0,z0],[x1,y0,z1],[x1,y1,z1], c, 0.56);     // the right
    tri([x1,y0,z0],[x1,y1,z1],[x1,y1,z0], c, 0.56);
    /* THE TWO THAT WERE MISSING. § */
    tri([x0,y0,z0],[x0,y1,z1],[x0,y0,z1], c, 0.56);     // the left
    tri([x0,y0,z0],[x0,y1,z0],[x0,y1,z1], c, 0.56);
    tri([x0,y0,z0],[x1,y0,z0],[x1,y1,z0], c, 0.44);     // and the back
    tri([x0,y0,z0],[x1,y1,z0],[x0,y1,z0], c, 0.44);
  };
  /* A PITCHED ROOF — two sloping faces meeting at a ridge, and the gable triangle at each end.
     This one shape is most of what separates a house from a warehouse. */
  const pitch = (x0, x1, y0, h, z0, z1, c) => {
    const mz = (z0 + z1) / 2, y1 = y0 + h;
    tri([x0,y0,z1],[x1,y0,z1],[x1,y1,mz], c, 0.92);
    tri([x0,y0,z1],[x1,y1,mz],[x0,y1,mz], c, 0.92);
    tri([x0,y0,z0],[x0,y1,mz],[x1,y1,mz], c, 0.6);
    tri([x0,y0,z0],[x1,y1,mz],[x1,y0,z0], c, 0.6);
    tri([x1,y0,z0],[x1,y1,mz],[x1,y0,z1], c, 0.5);
  };

  const T = OW.tile, g = OW.gap, inset = T * (1 - g) / 2;

  /* ---------- THE GROUND § */
  const plotOf = new Array(world.cols).fill(null);
  world.items.forEach(it => {
    for (let i = 0; i < it.w; i++) plotOf[it.x0 + i] = it;
  });

  for (let cx = 0; cx < world.cols; cx++) {
    for (let cz = 0; cz < world.rows; cz++) {
      const x0 = cx * T + inset, x1 = (cx + 1) * T - inset;
      /* ROW 0 SITS AT z = 0 AND EVERY ROW AFTER IT GOES BACK. So `cz` IS the distance from the
         path in tiles, which is what the two tests below can then say plainly. */
      const z1 = -cz * T - inset, z0 = -(cz + 1) * T + inset;
      const mz = (z0 + z1) / 2;
      /* THE PATH IS ONE TILE. It was `mz > -T*0.6 && mz < T*0.6` — a window a tile and a fifth
         wide, straddling two rows, so it drew as a two-tile road wherever the rounding fell. */
      const onPath = cz === 0;
      const it = plotOf[cx];
      /* AND THE PLOT IS THE TWO ROWS BEHIND IT. */
      const onPlot = it && cz >= 1 && cz <= 2;

      let colour = OW_TERRAIN.grass;
      let top = OW.lift;
      if (onPath) colour = OW_TERRAIN.road;
      else if (onPlot) colour = OW_KIND[norm(it.l.kind)] === 'water' ? OW_TERRAIN.water
        : OW_KIND[norm(it.l.kind)] === 'park' ? OW_TERRAIN.park
        : OW_TERRAIN.plot;
      if (colour === OW_TERRAIN.water) top = OW.lift * 0.45;

      box(x0, x1, 0, top, z0, z1, rgb(colour));

      /* A TREE ON A PARK PLOT. Every other tile, so it reads as trees rather than as a pattern. */
      if (colour === OW_TERRAIN.park && (cx + cz) % 2 === 0) {
        const tx = (x0 + x1) / 2;
        box(tx - 0.5, tx + 0.5, top, top + 2, mz - 0.5, mz + 0.5, rgb('#6b4f2a'));
        box(tx - 2.4, tx + 2.4, top + 2, top + 6.5, mz - 2.4, mz + 2.4, rgb('#2f7d33'));
      }
    }
  }

  /* ---------- WHAT STANDS ON EACH PLOT § */
  world.items.forEach(it => {
    const l = it.l;
    const parts = (l.parts && l.parts.length) ? l.parts : [{
      /* THE WHOLE PLOT, AS ONE PART. Written as a part rather than as a separate branch, so there
         is one drawing path and a landmark with parts and one without cannot drift apart. */
      kind: (it.form === 'park' || norm(l.kind) === 'river' || norm(l.kind) === 'water')
        ? (norm(l.kind) === 'river' || norm(l.kind) === 'water' ? 'water' : 'trees')
        : 'building',
      x: 0, z: 0, w: it.w, d: 2,
      height: Number(l.height) || 0,
      form: it.form, roofShape: norm(l.roofShape),
      wall: '', roof: l.roof || '', feature: norm(l.feature),
    }];

    /* THE SITE, MEASURED ONCE for all its parts together — which is what makes them line up. Each
       part measured against its own extent would centre every one on the same spot and a C would
       close into a rectangle. */
    const site = owSiteBox(l);
    parts.forEach(pt => owPart(it, pt, { box, pitch, rgb, T, site }));
  });

  /* ---------- THE NODES ON THE PATH § */
  world.items.forEach(it => {
    const mx = it.mid * T;
    const venue = norm(it.l.role) === 'venue';
    const r = venue ? 2.6 : 1.7;
    const c = rgb(venue ? '#ffb454' : '#e8e2d4');
    /* ON THE PATH, which is row 0 — so the node is between the walker and the landmark, which is
       the whole grammar of a board like this. */
    box(mx - r, mx + r, OW.lift, OW.lift + 1.1, -T / 2 - r, -T / 2 + r, c);
  });

  return { pos: new Float32Array(pos), col: new Float32Array(col), count: pos.length / 3 };
}

/* ---------- HEIGHT IS TO SCALE, AND IT WAS NOT § */
const OW_HEIGHT = 0.62;
const owHeight = m => Math.max(3.5, (Number(m) || 0) * OW_HEIGHT);

/* ---------- A REAL SHAPE, ONTO THIS LANDMARK'S TILES § */
/* THE ANGLE THAT PUTS A SITE SQUARE ON THE GRID. § */
function owSquareAngle(pts, mLng) {
  if (pts.length < 3) return 0;
  let best = 0, longest = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const dx = (b[1] - a[1]) * mLng, dz = (b[0] - a[0]) * 111320;
    const len = Math.hypot(dx, dz);
    if (len <= longest) continue;
    longest = len;
    best = Math.atan2(dx, dz) * 180 / Math.PI;
  }
  /* HOW FAR THAT EDGE IS FROM THE NEAREST QUARTER TURN — which is how far the site has to turn to
     be square, and never more than forty-five degrees either way. */
  const off = ((best % 90) + 90) % 90;
  return off > 45 ? 90 - off : -off;
}

function owSiteBox(l) {
  const pts = [];
  (l.parts || []).forEach(p => (p.outline || []).forEach(q => pts.push(q)));
  if (!pts.length && (l.outline || []).length) (l.outline || []).forEach(q => pts.push(q));
  if (pts.length < 3) return null;
  const lat0 = pts.reduce((a, q) => a + q[0], 0) / pts.length;
  const mLng = 111320 * Math.cos(lat0 * Math.PI / 180);

  /* ---------- WHICH WAY ROUND IT STANDS § */
  /* ---------- SQUARE TO THE GRID FIRST, WHATEVER ANGLE IT WAS BUILT AT § */
  /* ---------- ONLY THE SQUARING HAPPENS HERE, NOT THE TURN § */
  const rot = owSquareAngle(pts, mLng) * Math.PI / 180;
  const cx = pts.reduce((a, q) => a + q[1] * mLng, 0) / pts.length;
  const cz = pts.reduce((a, q) => a - q[0] * 111320, 0) / pts.length;
  const cosR = Math.cos(rot), sinR = Math.sin(rot);
  const put = q => {
    const x = q[1] * mLng - cx, z = -q[0] * 111320 - cz;
    return { x: x * cosR - z * sinR, z: x * sinR + z * cosR };
  };

  const all = pts.map(put);
  return {
    mLng, put,
    minX: Math.min.apply(null, all.map(q => q.x)),
    maxX: Math.max.apply(null, all.map(q => q.x)),
    minZ: Math.min.apply(null, all.map(q => q.z)),
    maxZ: Math.max.apply(null, all.map(q => q.z)),
  };
}

/* Point in polygon — ray casting. Odd number of crossings means inside. */
function owIn(x, z, ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a.z > z) !== (b.z > z)
        && x < (b.x - a.x) * (z - a.z) / ((b.z - a.z) || 1e-9) + a.x) hit = !hit;
  }
  return hit;
}

/* WHICH TILES A PART COVERS. Returns a list of `{a, b}` tile coordinates on the landmark's plot —
   `a` across, `b` back — which is what the drawing below then puts something on. */
/* HOW MANY PIECES A TILE IS CUT INTO for the purpose of shape. § */
/* ---------- THE GRID IS AS FINE AS THE SMALLEST THING ON THE SITE § */
const OW_MIN_CELLS = 3;
/* AND A CEILING, because one traced doorstep should not drag a whole site to a four-hundred-cell grid. § */
const OW_MAX_CELLS = 120;
const OW_OBJECT_FRAC = 0.05;

/* TURNING A FINISHED GRID OF TILES, a quarter at a time. § */
function owTurn(t, quarters, w, d) {
  if (!quarters) return t;
  if (quarters === 1) return { a: d - 1 - t.b, b: t.a };        // a quarter clockwise
  if (quarters === 2) return { a: w - 1 - t.a, b: d - 1 - t.b }; // a half turn
  return { a: t.b, b: w - 1 - t.a };                            // three quarters
}

function owTilesOf(it, pt, box) {
  const out = [];
  if (!box || !(pt.outline || []).length) return out;
  /* THE SAME ROTATION THE SITE GOT. Using the raw corners here would rasterise the unturned shape
     into a turned box — the part would be the right shape and in the wrong place, which is worse
     than either fault alone. */
  const ring = pt.outline.map(box.put);
  const w = Math.max(1, box.maxX - box.minX), d = Math.max(1, box.maxZ - box.minZ);
  /* THE GRID IS SAMPLED IN THE SITE'S OWN FRAME — the plot as it was measured, before the bearing
     swapped its sides. So `cols` and `rows` here are the UNTURNED plot, and the turn is applied to
     each tile as it comes out. */
  const q = it.quarters || 0;
  const pw = (q === 1 || q === 3) ? it.depth : it.w;
  const pd = (q === 1 || q === 3) ? it.w : it.depth;
  /* THE SUBDIVISION THE SITE ASKED FOR, worked out once in `owWorld` from the smallest part on it —
     so every part of one landmark is sampled on the same grid, which is what keeps them lined up. */
  const sub = it.sub || 1;
  const cols = pw * sub, rows = pd * sub;
  for (let a = 0; a < cols; a++) {
    for (let b = 0; b < rows; b++) {
      /* THE MIDDLE OF THE SUB-TILE, mapped back into metres on the real site. Testing the centre
         rather than a corner is what stops a cell counting as covered because one edge grazed it. */
      const x = box.minX + ((a + 0.5) / cols) * w;
      const z = box.minZ + ((b + 0.5) / rows) * d;
      if (owIn(x, z, ring)) out.push(owTurn({ a, b }, q, cols, rows));
    }
  }
  return out;
}

/* ---------- ONE PART OF A LANDMARK § */
function owPart(it, pt, draw) {
  const { box, pitch, rgb, T, site } = draw;

  /* ---------- A PART WITH REAL CORNERS IS DRAWN TILE BY TILE § */
  const tiles = owTilesOf(it, pt, site);
  if (tiles.length) {
    tiles.forEach(t => owPartTile(it, pt, t, draw));
    return;
  }

  /* ---------- A PART THAT COVERS NO TILES AT ALL § */
  if ((pt.outline || []).length >= 3 && site) {
    const ring = pt.outline.map(site.put);
    const mx = ring.reduce((a, q) => a + q.x, 0) / ring.length;
    const mz = ring.reduce((a, q) => a + q.z, 0) / ring.length;
    const a = Math.max(0, Math.min(it.w - 1, Math.floor(
      ((mx - site.minX) / Math.max(1, site.maxX - site.minX)) * it.w)));
    const b = Math.max(0, Math.min(it.depth - 1, Math.floor(
      ((mz - site.minZ) / Math.max(1, site.maxZ - site.minZ)) * it.depth)));
    owPartTile(it, pt, { a, b }, draw);
    return;
  }
  /* THE PLOT starts one tile behind the path and runs back. `z` counts backwards from there, which
     is the same direction the rows go, so a part at z=0 is against the path and z=1 is behind it. */
  const px = (it.x0 + pt.x) * T;
  const pz = -(1 + pt.z) * T;
  const pad = T * 0.12;
  const x0 = px + pad, x1 = px + pt.w * T - pad;
  const z1 = pz - pad, z0 = pz - pt.d * T + pad;
  const base = OW.lift;

  /* THE FLAT ONES. A surface laid on the plot — no walls, no roof, and a height that is a hair
     above the tile so it reads as a surface rather than z-fighting with the ground under it. */
  const FLAT = {
    tarmac: '#3a3a3d',
    grass:  '#6ab04c',
    water:  '#3aa8d8',
    trees:  '#4e9b3c',
    path:   '#b9b0a0',
  };
  if (FLAT[pt.kind]) {
    const c = rgb(pt.wall || FLAT[pt.kind]);
    const top = pt.kind === 'water' ? base - OW.lift * 0.55 : base + 0.12;
    box(x0, x1, base - OW.lift, top, z0, z1, c);
    /* TREES ON A TREED PART, every other tile — a cone on every one reads as a pattern rather than
       as a wood. */
    if (pt.kind === 'trees') {
      for (let a = 0; a < pt.w; a++) {
        for (let b = 0; b < pt.d; b++) {
          if ((a + b) % 2) continue;
          const tx = px + (a + 0.5) * T, tz = pz - (b + 0.5) * T;
          box(tx - 0.5, tx + 0.5, top, top + 2, tz - 0.5, tz + 0.5, rgb('#6b4f2a'));
          box(tx - 2.4, tx + 2.4, top + 2, top + 6.5, tz - 2.4, tz + 2.4, rgb('#2f7d33'));
        }
      }
    }
    /* AND THE WHITE LINES ON TARMAC, which is the one thing that makes a dark rectangle read as a
       car park rather than as a hole in the board. */
    if (pt.kind === 'tarmac') {
      const bays = Math.max(2, Math.round((x1 - x0) / 3.2));
      for (let i = 1; i < bays; i++) {
        const lx = x0 + (x1 - x0) * i / bays;
        box(lx - 0.16, lx + 0.16, top, top + 0.08, z0 + 1.2, z1 - 1.2, rgb('#c9c4b4'));
      }
    }
    return;
  }

  /* A FENCE — a low rail round the edge of the tiles it covers. Four thin boxes, and it is what
     turns a green rectangle into a paddock. */
  if (pt.kind === 'fence') {
    const c = rgb(pt.wall || '#8a6a48'), t = 0.35, hgt = 1.8;
    box(x0, x1, base, base + hgt, z1 - t, z1, c);
    box(x0, x1, base, base + hgt, z0, z0 + t, c);
    box(x0, x0 + t, base, base + hgt, z0, z1, c);
    box(x1 - t, x1, base, base + hgt, z0, z1, c);
    return;
  }

  /* ---------- AND A BUILDING § */
  const pal = OW_BUILD[norm(it.l.kind)] || OW_BUILD.retail;
  const wall = rgb(pt.wall || pal[0]);
  const roofC = rgb(pt.roof || pal[1]);
  const form = pt.form || 'slab';

  let h = 13, roofH = 2;
  if (form === 'tower') { h = 34; roofH = 2; }
  else if (form === 'shed') { h = 8; roofH = 3; }
  else if (form === 'hall') { h = 11; roofH = 6; }
  else if (form === 'house') { h = 8; roofH = 5; }
  else if (form === 'dome') { h = 10; roofH = 5; }
  /* A HEIGHT IN THE SHEET WINS. The form gives a shape; a number gives a specific building, and
     somebody who has typed one meant it. Squashed the same way as everything else so a tower and a
     shed are both readable on one board. */
  if (pt.height > 0) h = owHeight(pt.height);

  let bx0 = x0, bx1 = x1;
  if (form === 'tower') {
    const wdt = Math.min(bx1 - bx0, T * 0.7), mx = (bx0 + bx1) / 2;
    bx0 = mx - wdt / 2; bx1 = mx + wdt / 2;
  }

  box(bx0, bx1, base, base + h, z0, z1, wall);

  const shape = pt.roofShape || (form === 'house' || form === 'hall' ? 'pitch' : 'flat');
  if (shape === 'pitch') {
    pitch(bx0 - 0.5, bx1 + 0.5, base + h, roofH, z0 - 0.5, z1 + 0.5, roofC);
  } else if (shape === 'dome') {
    for (let i = 0; i < 3; i++) {
      const k = 1 - i * 0.28, wd = (bx1 - bx0) / 2 * k, dp = (z1 - z0) / 2 * k;
      const mx = (bx0 + bx1) / 2, mz = (z0 + z1) / 2;
      box(mx - wd, mx + wd, base + h + i * roofH / 3, base + h + (i + 1) * roofH / 3,
          mz - dp, mz + dp, roofC);
    }
  } else if (shape === 'saw') {
    const n = Math.max(2, Math.round((bx1 - bx0) / (T * 0.5)));
    for (let i = 0; i < n; i++) {
      pitch(bx0 + (bx1 - bx0) * i / n, bx0 + (bx1 - bx0) * (i + 1) / n,
            base + h, roofH, z0, z1, roofC);
    }
  } else {
    box(bx0 - 0.6, bx1 + 0.6, base + h, base + h + roofH, z0 - 0.6, z1 + 0.6, roofC);
  }

  const mx = (bx0 + bx1) / 2, mz = (z0 + z1) / 2, topY = base + h + roofH;
  if (pt.feature === 'chimney') {
    box(bx1 - 2.4, bx1 - 0.6, base + h, topY + 9, mz - 0.9, mz + 0.9, rgb('#8a5a3c'));
  } else if (pt.feature === 'spire') {
    box(mx - 0.8, mx + 0.8, topY, topY + 10, mz - 0.8, mz + 0.8, roofC);
  } else if (pt.feature === 'mast') {
    box(mx - 0.35, mx + 0.35, topY, topY + 12, mz - 0.35, mz + 0.35, rgb('#9aa0a6'));
  } else if (pt.feature === 'clock') {
    box(mx - 1.8, mx + 1.8, base + h - 5, base + h - 1.4, z1 - 0.4, z1 + 0.5, rgb('#f4ecd8'));
  } else if (pt.feature === 'sign') {
    box(bx0 + 0.5, bx1 - 0.5, topY, topY + 2.6, z1 - 0.3, z1 + 0.4, roofC);
  }
}

/* THE WALKER. Two boxes, which is as much as anybody on a board like this ever is. */
function owFigure() {
  const pos = [], col = [];
  const tri = (a, b, c, base, k) => [a, b, c].forEach(p => {
    pos.push(p[0], p[1], p[2]);
    col.push(base[0] * k, base[1] * k, base[2] * k);
  });
  /* THE SAME FOUR SIDES. The walker turns round — walk left and you are looking at what was the
     back of them — so three faces here is the same fault as it was on a building, just smaller and
     harder to see. */
  const box = (r, y0, y1, c) => {
    tri([-r,y1,-r],[r,y1,-r],[r,y1,r], c, 1);
    tri([-r,y1,-r],[r,y1,r],[-r,y1,r], c, 1);
    tri([-r,y0,r],[r,y0,r],[r,y1,r], c, 0.72);
    tri([-r,y0,r],[r,y1,r],[-r,y1,r], c, 0.72);
    tri([r,y0,-r],[r,y0,r],[r,y1,r], c, 0.55);
    tri([r,y0,-r],[r,y1,r],[r,y1,-r], c, 0.55);
    tri([-r,y0,-r],[-r,y1,r],[-r,y0,r], c, 0.55);
    tri([-r,y0,-r],[-r,y1,-r],[-r,y1,r], c, 0.55);
    tri([-r,y0,-r],[r,y0,-r],[r,y1,-r], c, 0.44);
    tri([-r,y0,-r],[r,y1,-r],[-r,y1,-r], c, 0.44);
  };
  box(1.1, 0, 3.2, [1, 0.71, 0.33]);
  box(0.85, 3.2, 4.7, [0.96, 0.86, 0.66]);
  return { pos: new Float32Array(pos), col: new Float32Array(col), count: pos.length / 3 };
}

/* ---------- THE RENDERER --------------------------------------------------------------------------- */
let OW_GL = null;

function owStop() {
  if (!OW_GL) return;
  cancelAnimationFrame(OW_GL.frame);
  OW_GL.off.forEach(([t, n, f]) => t.removeEventListener(n, f));
  OW_GL = null;
}

function initOverworldBoard() {
  const mount = document.getElementById('map-board');
  if (!mount) return;
  owStop();

  const world = owWorld();
  if (!world) {
    mount.innerHTML = `<p class="faint">No landmarks yet. Add rows to the <b>landmarks</b> tab — a
      name, a lat and a lng puts something there, and a <b>points</b> cell of
      <code>lat lng, lat lng, …</code> gives it a footprint. Any number of vertices.</p>`;
    return;
  }

  /* ---------- THE NAMES ARE HTML, OVER THE CANVAS § */
  mount.innerHTML = '<canvas class="ow-c"></canvas><div class="ow-tags"></div>'
    + '<p class="ow-hint">Hold either side to walk</p>';
  const cv = mount.querySelector('canvas');
  const gl = cv.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) {
    mount.innerHTML = '<p class="faint">This browser cannot draw the board — it needs WebGL. '
      + 'Everything else in the app works without it.</p>';
    return;
  }

  const prog = gl.createProgram();
  const add = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    gl.attachShader(prog, sh);
  };
  add(gl.VERTEX_SHADER, OW_VS);
  add(gl.FRAGMENT_SHADER, OW_FS);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const mesh = owMesh(world);
  const figure = owFigure();
  const buf = data => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return b;
  };
  const bufs = {
    town: { pos: buf(mesh.pos), col: buf(mesh.col), n: mesh.count },
    me: { pos: buf(figure.pos), col: buf(figure.col), n: figure.count },
  };
  const aPos = gl.getAttribLocation(prog, 'pos');
  const aCol = gl.getAttribLocation(prog, 'col');
  const uMvp = gl.getUniformLocation(prog, 'mvp');
  gl.enableVertexAttribArray(aPos);
  gl.enableVertexAttribArray(aCol);
  gl.enable(gl.DEPTH_TEST);
  /* Sky. One colour, because a gradient behind a flat-shaded board is the only soft thing in it. */
  gl.clearColor(0.42, 0.68, 0.85, 1);

  /* THE LABELS, one per landmark, built once and moved thereafter. A venue is gold because a venue
     is a place somebody can actually be taught — the same meaning the colour carries everywhere
     else in the app. */
  const tags = mount.querySelector('.ow-tags');
  world.items.forEach(it => {
    const el = document.createElement('span');
    el.className = 'ow-tag' + (norm(it.l.role) === 'venue' ? ' is-venue' : '');
    el.textContent = S_(it.l.label) || S_(it.l.name);
    el.setAttribute('data-do', 'ow-tap');
    el.setAttribute('data-name', S_(it.l.name));
    tags.appendChild(el);
    it.el = el;
  });

  const state = { x: world.length / 2, dir: 0, last: 0, frame: 0, off: [] };
  OW_GL = state;

  const draw = now => {
    if (OW_GL !== state) return;
    const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 0;
    state.last = now;
    if (state.dir) {
      state.x = Math.max(0, Math.min(world.length, state.x + state.dir * OW.speed * dt));
    }

    const w = cv.clientWidth || 1, h = cv.clientHeight || 1;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr)) { cv.width = w * dpr; cv.height = h * dpr; }
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* LOOKING DOWN AT THE BOARD, which is the whole difference from the last attempt — it looked
       ALONG the street, so the grid was edge-on and might as well not have been there. */
    const eye = [state.x, OW.eyeH, OW.back];
    const at = [state.x, OW.look, -14];
    const mvp = owMul(owPerspective(OW.fov, w / h, 1, 900), owLookAt(eye, at, [0, 1, 0]));
    gl.uniformMatrix4fv(uMvp, false, new Float32Array(mvp));

    const drawIt = b => {
      gl.bindBuffer(gl.ARRAY_BUFFER, b.pos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.col);
      gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, b.n);
    };
    drawIt(bufs.town);

    const move = [1,0,0,0, 0,1,0,0, 0,0,1,0, state.x, OW.lift, -OW.tile / 2, 1];
    gl.uniformMatrix4fv(uMvp, false, new Float32Array(owMul(mvp, move)));
    drawIt(bufs.me);

    /* ---------- AND THE NAMES, PUT WHERE THE 3D SAYS § */
    world.items.forEach(it => {
      /* WELL ABOVE THE ROOFS. § */
      const wx = it.mid * OW.tile, wy = OW.lift + 48, wz = -2.2 * OW.tile;
      const cw = mvp[3] * wx + mvp[7] * wy + mvp[11] * wz + mvp[15];
      if (cw <= 0.01) { it.el.style.opacity = '0'; return; }
      const nx = (mvp[0] * wx + mvp[4] * wy + mvp[8] * wz + mvp[12]) / cw;
      const ny = (mvp[1] * wx + mvp[5] * wy + mvp[9] * wz + mvp[13]) / cw;
      /* OFF THE SIDES, HIDDEN. Six labels is nothing to compute, and a label pinned to the edge of
         the screen for a building nobody can see is a label that lies about where something is. */
      if (nx < -1.25 || nx > 1.25) { it.el.style.opacity = '0'; return; }
      it.el.style.opacity = '1';
      it.el.style.transform = 'translate(-50%,-50%) translate('
        + ((nx * 0.5 + 0.5) * w).toFixed(1) + 'px,' + ((0.5 - ny * 0.5) * h).toFixed(1) + 'px)';
    });

    state.frame = requestAnimationFrame(draw);
  };
  state.frame = requestAnimationFrame(draw);

  const on_ = (t, n, f) => { t.addEventListener(n, f); state.off.push([t, n, f]); };
  const go = ev => {
    const box = mount.getBoundingClientRect();
    const at = (ev.touches ? ev.touches[0].clientX : ev.clientX) - box.left;
    state.dir = at < box.width / 2 ? -1 : 1;
  };
  on_(mount, 'pointerdown', go);
  on_(mount, 'pointermove', ev => { if (state.dir) go(ev); });
  on_(window, 'pointerup', () => { state.dir = 0; });
  on_(window, 'pointercancel', () => { state.dir = 0; });
  on_(window, 'keydown', ev => {
    if (ev.key === 'ArrowLeft') state.dir = -1;
    if (ev.key === 'ArrowRight') state.dir = 1;
  });
  on_(window, 'keyup', ev => {
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') state.dir = 0;
  });
}

/* ---------- TAPPING A NAME § */
on('ow-tap', el => {
  const name = el.getAttribute('data-name') || '';
  const l = (DATA.landmarks || []).find(x => S_(x.name) === name);
  if (!l) return;
  const venue = (DATA.venues || []).find(v => norm(v.title) === norm(name));
  toast(venue ? name + ' — ' + (venue.borough || 'a venue you can book')
              : name + (l.address ? ' · ' + S_(l.address) : ''));
});

/* ONE TILE OF A PART. The same vocabulary as a whole part — a surface, a fence, or a building — at the size of a single tile, so a rasterised shape is built out § */
function owPartTile(it, pt, t, draw) {
  const { box, pitch, rgb, T } = draw;
  /* ---------- ONE CELL IS ONE WHOLE TILE § */
  const u = T;
  const px = it.x0 * T + t.a * u, pz = -T - t.b * u;
  /* NO PADDING BETWEEN THE PIECES OF ONE PART. A gap here would draw a shed as a row of separate
     huts — the seam belongs between tiles of the GROUND, not through the middle of a building. */
  const x0 = px, x1 = px + u, z1 = pz, z0 = pz - u;
  const base = OW.lift;

  const FLAT = { tarmac: '#3a3a3d', grass: '#6ab04c', water: '#3aa8d8',
                 trees: '#4e9b3c', path: '#b9b0a0', bridge: '#9a8b74' };
  if (FLAT[pt.kind]) {
    const c = rgb(pt.wall || FLAT[pt.kind]);
    /* ---------- A BRIDGE IS THE ONE FLAT THING THAT DOES NOT LIE ON THE GROUND § */
    if (pt.kind === 'bridge') {
      const deck = base + 2.4;
      box(x0, x1, deck, deck + 0.5, z0, z1, c);
      /* THE PIERS, at each end, down into whatever is underneath. */
      const pier = rgb('#6f6353'), t = (x1 - x0) * 0.18;
      box(x0, x0 + t, base - OW.lift, deck, z0, z1, pier);
      box(x1 - t, x1, base - OW.lift, deck, z0, z1, pier);
      /* AND A RAIL DOWN THE NEAR SIDE, which is what says "you can walk on this". */
      box(x0, x1, deck + 0.5, deck + 1.6, z1 - 0.3, z1, rgb('#c4b8a2'));
      return;
    }
    const top = pt.kind === 'water' ? base - OW.lift * 0.55 : base + 0.12;
    box(x0, x1, base - OW.lift, top, z0, z1, c);
    /* A TREE EVERY FOURTH SUB-TILE, which is one per tile — at sixteen times the resolution, one
       per cell would be a hedge rather than a wood. */
    /* A TREE ON EVERY TREED TILE. At sub-tile resolution this only fired on one cell in sixteen,
       which was right then and wrong now — with whole tiles, skipping fifteen out of sixteen means
       almost no trees at all. */
    if (pt.kind === 'trees') {
      const tx = px + u / 2, tz = pz - u / 2;
      box(tx - 0.5, tx + 0.5, top, top + 2, tz - 0.5, tz + 0.5, rgb('#6b4f2a'));
      box(tx - 2.4, tx + 2.4, top + 2, top + 6.5, tz - 2.4, tz + 2.4, rgb('#2f7d33'));
    }
    /* ONE BAY LINE PER SUB-TILE COLUMN. At this resolution a sub-tile is about the width of a
       parking space, which is a happy accident worth using rather than fighting. */
    if (pt.kind === 'tarmac' && t.a % 2 === 0) {
      box(x0 - 0.12, x0 + 0.12, top, top + 0.08, z0 + u * 0.2, z1 - u * 0.2, rgb('#c9c4b4'));
    }
    return;
  }
  if (pt.kind === 'fence') {
    const c = rgb(pt.wall || '#8a6a48');
    box(x0, x1, base, base + 1.8, z1 - 0.35, z1, c);
    return;
  }

  /* A BUILDING TILE. The height comes from the part, so every tile of one building is the same height and they read as one solid — which is what makes a rasterised § */
  const pal = OW_BUILD[norm(it.l.kind)] || OW_BUILD.retail;
  const wall = rgb(pt.wall || pal[0]);
  const roofC = rgb(pt.roof || pal[1]);
  const h = pt.height > 0 ? owHeight(pt.height) : 13;
  box(x0, x1, base, base + h, z0, z1, wall);
  const shape = pt.roofShape || 'flat';
  if (shape === 'pitch') pitch(x0, x1, base + h, 3, z0, z1, roofC);
  else box(x0, x1, base + h, base + h + 1.6, z0, z1, roofC);
}


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
