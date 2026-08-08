/* ==================================================================================================
   @family. — overworld.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   overworld.js is number 17 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- THE PICTURE -------------------------------------------------------------------------
   Fetched AFTER the card is drawn, and the card is readable without it. That order is the whole
   design: the gradient is not a placeholder waiting to be replaced, it is the floor — so a slow
   connection, a rate limit or a service that has stopped existing costs nothing at all.

   TWO SOURCES, and Commons is the default for a reason. The fourth column of every fact is a
   PHOTOGRAPH search term — `octopus underwater`, `Venice canal buildings` — and Wikimedia Commons
   answers those with photographs of the thing, needs no key, and allows the request from a
   browser. Giphy answers them with reaction GIFs, which read as a joke where an illustration
   should be. Put a key in config and it switches; leave it blank and it does not.

   A KEY IN HERE IS PUBLIC. It ships in a file anybody can read, which for Giphy's free tier is
   normal — the limit is tied to the key rather than the key being a secret — but it is worth
   knowing rather than finding out.
--------------------------------------------------------------------------------------------- */
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
    /* `origin=*` is what makes Commons answer a browser at all — without it the request is made,
       refused by CORS, and fails in a way that looks identical to the network being down.
       `filetype:bitmap` keeps out the SVG diagrams and PDF scans, which are technically images
       and are not photographs. */
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
    /* Remembered as NOTHING rather than left unknown. A term the service cannot answer would
       otherwise be asked again every time the card came round, which on a deck that repeats is a
       request per tap for an answer already given. */
    .catch(() => { FEED_PICS[q] = null; return null; });
}

function drawFeed() {
  const host = $('feed-screen');
  if (!host) return;
  // No end to reach, so no wrapping and no going below the first.
  FEED_AT = Math.max(0, FEED_AT);
  const it = feedItem(FEED_AT);
  if (!it) return;
  host.innerHTML = feedSlide(it);

  /* The photograph arrives afterwards and fades in over the drawing. It is loaded into an Image
     first and only put on screen once it has decoded — setting a background to a URL that is
     still downloading gives a card that flickers from gradient to white to picture.
     `at` is captured so a picture that arrives after three more taps is thrown away rather than
     landing on somebody else's fact. */
  const at = FEED_AT;
  feedPicture(it.pic).then(found => {
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

  /* Where you got to, kept for TODAY only. The deck is reshuffled on a new day, so yesterday's
     card 12 is a different fact and returning to it would mean nothing. */
  try {
    localStorage.setItem('familyFeed', JSON.stringify({ day: feedToday(), at: FEED_AT }));
  } catch {}
}

function initFeed() {
  if (!$('feed-screen')) return;
  if (FEED_AT === null) {
    let saved = 0;
    try {
      const kept = JSON.parse(localStorage.getItem('familyFeed') || '{}');
      if (kept.day === feedToday()) saved = Number(kept.at) || 0;
    } catch {}
    FEED_AT = saved;
  }
  drawFeed();
}

/* TAP FOR THE NEXT, and the left third for the one before — the gesture stories taught everybody,
   and it costs one line more than a tap that only goes forward. Going back is what makes tapping
   quickly safe: without it one tap too many loses a fact you were still reading, with no way to
   reach it again. */
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

/**
 * OPEN A WIDGET. Its markup into the sheet, then the one function that brings it to life.
 *
 * `openSheet` first and `start` second, always: every one of these finds its parts by id, and an
 * id cannot be found before the markup carrying it is in the document. That ordering was the whole
 * content of `wake` and it is the whole content of this.
 *
 * AND IT SAYS SO WHEN IT DOES NOT START. Same as before, in the same place — the space the widget
 * should have filled — because a card with a heading and nothing under it has been mistaken for an
 * unfinished feature twice.
 */
on('widget', el => {
  const wgt = WIDGETS.find(x => x.id === el.dataset.id);
  if (!wgt) return;
  /* Still here for a MIXED result — searching "timer" alongside three resources gives a list of
     cards, and the card has to open something. When Tools or Games is chosen on its own they are
     the pages themselves and nothing needs opening. */
  openSheet(wgt.name, wgt.html);
  startWidget_(wgt);
});

/* Started when their screen appears, and only then — a canvas loop running behind a screen nobody
   is looking at is a flat battery for nothing. */
/* `wake` IS GONE, and with it the whole idea of a screen having things that need starting.
   It existed for two screens and both are gone: nine widgets now open one at a time in the sheet,
   and `on('widget')` does what wake did — markup first, then the one function that brings it to
   life, then a sentence in the empty space if it did not.
   That also ends the fault it was built around. `paint` replaced a screen's markup and threw away
   whatever had been drawn into it, so every repaint blanked the arcade and `repaint` had to
   remember to wake it again. A sheet is not repainted; it is opened, used and closed. */

/* `on('chess-new')` and `on('chess-undo')` were here — New game and Take back, two buttons under
   the board. The board is the whole widget now, so nothing carries either name and neither could
   ever fire. Starting again is leaving the page and coming back; there is no undo, which is how
   chess works away from a screen. */
on('tt-start',   () => startTimesTables?.());
on('tt-stop',    () => endTimesTables?.());
/* `on('flap-start')` was here — a toast saying "Tap the canvas to flap". Nothing in the app has
   ever carried `data-do="flap-start"`, so it has never once been shown to anybody. Removed rather
   than wired up: the canvas already says it, and a handler with no door is the `arrive()` fault
   again — something that looks like it works, so nobody looks past it. */

/* ================================================================================================
   SWIPING BETWEEN TABS.

   The hard part is not the swipe — it is not breaking scrolling. A phone cannot know at the first
   pixel whether a finger is starting a horizontal swipe or a vertical scroll, and guessing wrong
   costs you scrolling, which is the thing people do a thousand times more often.

   So this WATCHES rather than decides. The first few pixels are allowed to happen; only once the
   finger has clearly committed to one axis is the gesture claimed, and under ten pixels nothing is
   claimed at all.
================================================================================================ */

const SWIPE = {
  x: 0, y: 0,          // where the finger started
  d: 0,                // how far it has travelled along the axis it claimed
  axis: null,          // null until the finger commits: 'x' or 'y'
  live: false,
  cells: null,         // the strip being dragged, held so the release moves the same one
  /* THE FRAME BOOKED BUT NOT YET DRAWN, and the position it will use when it is. A finger reports
     more often than a screen redraws, so without these the grid was placed twice for every frame
     anybody saw and half of that work was thrown away before it reached the glass. */
  frame: 0,
  px: 0,
  /* Whether the one-off setup for this drag has been done — the cells taken off their transition,
     and the measurements held still. Once per gesture, not once per frame. */
  held: false,
};

/**
 * DOES THIS DRAG BELONG TO THE GRID, OR TO WHAT IS UNDER THE FINGER?
 *
 * ONE RULE, BOTH AXES. There were two lists — a blocklist of selectors for sideways and a
 * different one for vertical — and they disagreed by construction: the sideways list named the
 * chess board and the keypad, the vertical list reused it, and the result was that the three
 * widgets you most wanted to swipe off were the three you could not.
 *
 * The rule is now the same question asked in either direction: is there something under the finger
 * that can still scroll THIS WAY? If so it is theirs. If not, it is the grid's. A short list of
 * controls that consume a drag for their own reasons is the only exception.
 */
function axisFree(target, axis, dir) {
  if (!$('sheet').classList.contains('hidden')) return false;   // the sheet is over everything
  /* A text area scrolls its own contents and a select opens by dragging on some phones. Neither is
     a scroll container the walk below would notice, so they are named. */
  if (target.closest?.('textarea, select, [data-noswipe]')) return false;
  /* A cell is not a scroll container any more, so the walk below stops at anything genuinely
     inside one — the docket's list, the notepad — and hands everything else to the grid. That is
     what makes a swipe up mean the next widget rather than a few pixels of nothing. */

  let el = target;
  while (el && el !== document.body) {
    const style = getComputedStyle(el);
    const over = axis === 'x' ? style.overflowX : style.overflowY;
    if (over === 'auto' || over === 'scroll') {
      const size = axis === 'x' ? el.clientWidth : el.clientHeight;
      const full = axis === 'x' ? el.scrollWidth : el.scrollHeight;
      const pos  = axis === 'x' ? el.scrollLeft : el.scrollTop;
      if (full > size + 1) {
        /* It can scroll. Whether it still can IN THIS DIRECTION is what decides: at its very top a
           downward drag is nothing to it and everything to the grid, which is what lets a long
           docket be read to the end and then hand over in one movement. */
        const atStart = pos <= 0, atEnd = pos + size >= full - 1;
        if ((dir > 0 && !atStart) || (dir < 0 && !atEnd)) return false;
      }
    }
    el = el.parentElement;
  }
  return true;
}

/* HOW FAR IS FAR ENOUGH — one distance, in pixels, whichever way you are going.
   This was a FRACTION of the axis being travelled, which sounds even-handed and is not: 16% of a
   401px width is 64px and 16% of a 929px height is 149px, so the same flick meant "next" sideways
   and "nothing happened" upwards. Two and a third times the travel for the same intent, and it
   reads as the screen ignoring you.
   The same mistake as the gap between panes, in the same shape: a distance expressed as a
   proportion of whichever edge it happens to lie along. A thumb is the same size in both
   directions. */
const THROW_PX = 64;
const THROW = () => THROW_PX;

/* POINTER EVENTS, NOT TOUCH EVENTS.
   The grid listened for `touchstart` and nothing else, so it worked on a phone and did nothing at
   all on a desktop — there is no touch to listen for, and dragging with a mouse produced no events
   the grid had any handler for. The tabs still worked because a tap is a click; the swipe simply
   was not there, which reads as broken rather than as unsupported.

   One pointer handler covers a finger, a mouse and a pen with the same code, which is the same
   argument as the two axes: a second way of doing it is a second thing to keep in step. */
addEventListener('pointerdown', e => {
  if (!e.isPrimary) return;                            // a second finger is a pinch, not a swipe
  /* A mouse only counts while a button is down. Without this, moving the cursor across the page
     would drag the grid. */
  if (e.pointerType === 'mouse' && e.buttons !== 1) return;
  SWIPE.x = e.clientX; SWIPE.y = e.clientY;
  SWIPE.d = 0; SWIPE.axis = null; SWIPE.cells = null;
  SWIPE.live = true;
  SWIPE.target = e.target;
  SWIPE.frame = 0;
}, { passive: true });

addEventListener('pointermove', e => {
  if (!SWIPE.live || !e.isPrimary) return;
  if (e.pointerType === 'mouse' && e.buttons !== 1) { SWIPE.live = false; return; }
  const dx = e.clientX - SWIPE.x, dy = e.clientY - SWIPE.y;

  /* THE DECISION, made once. Ten pixels is enough to tell a deliberate drag from the wobble in a
     thumb, and 1.4x means an ambiguous diagonal goes to the vertical — which on a phone is the
     safer wrong answer, because scrolling is the thing people do a thousand times more often. */
  if (!SWIPE.axis) {
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    const axis = Math.abs(dx) > Math.abs(dy) * 1.4 ? 'x' : 'y';
    const dir = axis === 'x' ? dx : dy;
    if (!AXES[axis].count() || !axisFree(SWIPE.target, axis, dir)) { SWIPE.live = false; return; }
    SWIPE.axis = axis;
    SWIPE.cells = AXES[axis].cells();
  }

  const ax = AXES[SWIPE.axis];
  const travelled = SWIPE.axis === 'x' ? dx : dy;
  const at = ax.at(), last = ax.count() - 1;
  /* Resisted at the ends. The grid still moves, grudgingly, which says "nothing that way" better
     than refusing to move at all. */
  const end = (travelled > 0 && at === 0) || (travelled < 0 && at === last);

  /* A mouse drag selects text as it goes, so the screen ends up half-highlighted behind the
     movement. Cancelled once the gesture belongs to the grid — and only then, because a drag that
     is still ambiguous might turn out to be somebody selecting a caption. */
  if (e.cancelable) e.preventDefault();
  document.getSelection?.()?.removeAllRanges?.();
  SWIPE.d = travelled;
  /* ONCE, not on every frame. `classList.add` on a class an element already has does nothing, but
     asking is still a walk of every cell sixty times a second for an answer that cannot change
     while the finger is down. */
  if (!SWIPE.held) {
    SWIPE.held = true;
    SWIPE.cells.forEach(el => el.classList.add('no-anim'));
    /* The measurements are held still for the length of the drag — see `paneStep_`. Nothing being
       measured can change while only a transform is moving. */
    DRAG_SIZES = new Map();
  }

  /* ONE PLACEMENT PER FRAME THAT IS ACTUALLY DRAWN.
     `pointermove` fires as often as the screen can report a finger, which on a 120Hz phone is
     twice as often as the screen is redrawn — so half of every drag was a full placement of the
     grid computed, and then thrown away before anybody saw it. Worse, the placements ran between
     frames rather than at the start of one, which is the arrangement most likely to make a
     movement look like it is lagging the thumb.

     Holding the position and placing it inside `requestAnimationFrame` means exactly one placement
     per drawn frame, using the newest position at the moment the browser is ready to draw. Fewer
     placements, and each one landing where the frame begins. */
  SWIPE.px = end ? travelled * 0.25 : travelled;
  if (SWIPE.frame) return;
  SWIPE.frame = requestAnimationFrame(() => {
    SWIPE.frame = 0;
    if (!SWIPE.live || !SWIPE.axis) return;
    /* THE SAME PLACER that puts them at rest, given a drag. One function decides where a cell is,
       whether a finger is on it or not — two would be two things to keep in step, which is how the
       axes came apart in the first place. */
    placeCells(SWIPE.axis, false, SWIPE.px);
  });
}, { passive: false });

addEventListener('pointerup', () => {
  if (!SWIPE.live) return;
  const axis = SWIPE.axis, d = SWIPE.d, cells = SWIPE.cells;
  SWIPE.live = false; SWIPE.axis = null; SWIPE.d = 0; SWIPE.cells = null;
  SWIPE.held = false;
  /* A frame booked and not yet run would place the grid mid-drag AFTER the drag had finished,
     putting it back where the finger left it a moment after it had settled somewhere else. */
  if (SWIPE.frame) { cancelAnimationFrame(SWIPE.frame); SWIPE.frame = 0; }
  /* The held measurements are let go, so the next thing to ask gets a real one. A pane may well
     be a different size by then — a picture arrives, a list is filtered — and the whole reason
     that cache is safe is that it does not outlive the gesture. */
  DRAG_SIZES = null;
  if (!axis || !cells) return;

  cells.forEach(el => el.classList.remove('no-anim'));
  const ax = AXES[axis];
  /* The two sweeps `placeCells` skips during a drag — which panes to watch, which screens nothing
     points at. Run once, now, which is the first moment their answer can have changed. */
  watchPanes();
  if (Math.abs(d) >= THROW(axis)) ax.go(ax.at() + (d < 0 ? 1 : -1));
  else placeCells(axis);          // not far enough: it settles back, and is seen to
}, { passive: true });

/* THE SAME GESTURE ON A TRACKPAD. Two fingers is a `wheel` event rather than a touch, so none of
   the above sees it — and without this a desktop can reach the tabs and not the widgets, because
   every page fits and there is nothing to scroll.
   One handler for both directions now, deciding the axis exactly as the finger does. */
let wheelAt = 0, wheelStop = null, wheelDone = false;

addEventListener('wheel', e => {
  const axis = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4 ? 'x' : 'y';
  const delta = axis === 'x' ? e.deltaX : e.deltaY;
  if (!AXES[axis].count()) return;
  if (!axisFree(e.target, axis, -delta)) return;

  wheelAt += delta;
  /* ONE NOTCH IS ONE WIDGET. The threshold was ninety, which is about one notch of a mouse wheel
     and several of a trackpad — so a small scroll did nothing at all and a large one did one
     thing, and in between it felt like the page had shifted slightly and given up. Forty is past
     any accidental brush and short of a deliberate scroll.
     Still once per gesture: a trackpad keeps sending numbers after the fingers lift, and without
     that guard one flick walks through four tabs. */
  if (!wheelDone && Math.abs(wheelAt) > 40) {
    wheelDone = true;
    const ax = AXES[axis];
    const to = ax.at() + (wheelAt > 0 ? 1 : -1);
    if (to >= 0 && to < ax.count()) ax.go(to);
  }
  /* A gap of 140ms means the fingers have stopped: long enough to outlast the momentum, short
     enough that a second deliberate flick is a second gesture. */
  clearTimeout(wheelStop);
  wheelStop = setTimeout(() => { wheelAt = 0; wheelDone = false; }, 140);
}, { passive: true });

/* A finger interrupted — a call arriving, the app going to the background. Put the screen back,
   or it stays shifted sideways for ever. */
/* A finger interrupted — a call arriving, the app going to the background. Whatever was being
   dragged is put back, on whichever axis it was. */
addEventListener('pointercancel', () => {
  const axis = SWIPE.axis;
  (SWIPE.cells || []).forEach(el => el.classList.remove('no-anim'));
  SWIPE.live = false; SWIPE.axis = null; SWIPE.d = 0; SWIPE.cells = null;
  if (axis) placeCells(axis);
}, { passive: true });


/* ================================================================================================
   IF ANY OF THIS THROWS, SAY SO ON THE SCREEN.

   A script that fails while starting leaves the page exactly as index.html wrote it: a header that
   already says "Posts", an empty tab bar, and eight empty sections. Which looks like a layout bug,
   or a stylesheet problem, or a backend that will not answer — anything except what it is. It has
   looked like all three this week, and each time the actual error was sitting in a console nobody
   had open.

   So the error is put where the app would have been. It costs nothing when nothing goes wrong, and
   the first line of it is worth more than an afternoon of guessing.
================================================================================================ */
function bootFailed(err, when) {
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

/**
 * ANYTHING THAT THROWS LATER, and did not get caught nearer to where it happened.
 *
 * IT DOES NOT WIPE THE SCREEN ANY MORE. It did, and that was wrong twice over: an app that is
 * working is replaced by a message for something that may not matter at all, and the message
 * itself is usually "Script error." — the two words a browser gives for an uncaught error in a
 * script it treats as cross-origin, which on file:// is every script. Trading a working app for
 * two words that could mean anything is a bad trade.
 *
 * A PICTURE THAT FAILED TO LOAD IS NOT A CRASH. A missing avatar, a Drive link nobody shared, a
 * font — these fire an error event with an element as the target, and the app is fine. They are
 * counted and ignored.
 *
 * Once only, still: a loop of failures should not bury the first message, which is the one that
 * says what actually happened.
 */
let toldYou = false;
addEventListener('error', e => {
  /* A resource, not the code. `target` is the <img> or <script> that failed. */
  if (e && e.target && e.target !== window && e.target.tagName) {
    const src = e.target.currentSrc || e.target.src || '';
    console.warn('[load]', e.target.tagName, src);
    /* A SCRIPT THAT DID NOT ARRIVE is not the same kind of thing as a picture that did not.
       index.html names eighteen files, and a name that does not match what is actually on disk is
       eighteen failed requests and a blank screen with nothing said anywhere — the one failure the
       split into separate files can itself cause, and the one nobody can diagnose by looking at it.
       So it says which file, by name.
       A missing picture stays a console line. That is a gap in a page, not a broken app. */
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