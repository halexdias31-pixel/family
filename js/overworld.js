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
  id: null,            // which finger this is, so a second one cannot steer it
  /* THE FRAME BOOKED BUT NOT YET DRAWN, and the position it will use when it is. A finger reports
     more often than a screen redraws, so without these the grid was placed twice for every frame
     anybody saw and half of that work was thrown away before it reached the glass. */
  frame: 0,
  px: 0,
  /* HOW FAST, AND WHEN. Two samples is all a flick needs — where the finger was a moment ago and
     where it is now — and keeping only the LAST short stretch is what makes it a measure of the
     flick rather than an average of the whole drag. A gesture that crawls and then snaps should
     read as a snap, because that is what the hand did last. */
  vAt: 0, vD: 0, v: 0,
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
      /* MORE THAN A PIXEL OR TWO, and this number is the whole fault behind "swiping up sometimes
         thinks I am scrolling".

         `scrollHeight` and `clientHeight` are rounded to whole pixels from a layout in fractions,
         so a pane whose contents fit EXACTLY reports one or two pixels of overflow perfectly
         routinely — a border, a line-height, a shadow. One pixel of overflow is not something
         anybody can scroll to, but this read it as a scroll container and handed the gesture over,
         and the pane then moved by a pixel and stopped. From the outside: a swipe that did
         nothing, at random, on the same card that worked a moment ago.

         Six pixels is under the smallest thing a thumb can deliberately scroll to, and well over
         any rounding. */
      if (full > size + 6) {
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
/* ---------- WHAT COUNTS AS TURNING THE PAGE ------------------------------------------------------
   TWO WAYS, because there are two ways people do it.

   FAR ENOUGH: you dragged the card most of the way there and let go. That is the deliberate one,
   and distance is the right measure of it.

   FAST ENOUGH: you flicked. A flick is short — forty pixels and gone — and every version of this
   until now ignored it, because sixty-four pixels of travel was the only question asked. So a
   confident flick did nothing and the card fell back, which is the single thing that makes a
   swipe feel amateur: it is not that the animation is wrong, it is that the app did not believe
   you.

   A phone's own lists have worked both ways for fifteen years, which is why a swipe that only
   answers to distance feels wrong before anybody can say why. */
const THROW_PX = 56;          // far enough, in pixels
const THROW_FRACTION = 0.18;  // ...or this much of the way to the next card, whichever is smaller
const FLICK = 0.4;            // fast enough, in pixels per millisecond

/* Far enough, for this axis. A fraction of the actual step as well as a flat number, so the same
   gesture means the same thing on a small phone and a wide one — sixty-four pixels is a fifth of
   the way across a 320px card and an eighth of the way down a tall one. */
const THROW = axis => {
  /* THE ACTUAL STEP, both ways. `innerHeight * 0.5` was a guess at the vertical one and it did not
     match the guess the settle used or the one the axis used — three numbers for one distance. */
  const step = axis === 'x' ? stepX_() : stepY_();
  return Math.min(THROW_PX, step * THROW_FRACTION) || THROW_PX;
};

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
  SWIPE.held = false;
  SWIPE.vAt = Date.now(); SWIPE.vD = 0; SWIPE.v = 0;
  SWIPE.id = e.pointerId;

  /* NO POINTER CAPTURE, AND THAT WAS THE BUG.

     This captured the pointer on `<html>` on every `pointerdown` — including a plain tap. Capture
     means one element owns the gesture until it is released, so the browser dispatched the release
     to the ROOT rather than to the thing under the finger, and the click never reached the card,
     the chip or the tick. Nothing threw. The app rendered perfectly and simply stopped answering.

     WHY IT WAS ADDED, and why that was wrong: to stop a drag dying when the finger slides off the
     element it started on. A real problem — and not one that had happened, and not one worth
     breaking every press in the app to prevent. The listeners are on the WINDOW, so they receive
     moves wherever the finger goes; capture was solving something that was already solved.

     The lesson is the one from the press animation two rounds ago: the fix for a thing nobody
     reported cost more than the thing it fixed. */
  SWIPE.id = e.pointerId;
}, { passive: true });

addEventListener('pointermove', e => {
  /* THE SAME FINGER THAT STARTED IT, and nothing else. `isPrimary` is not the same question — a
     second finger put down after the first has lifted becomes primary itself, and a second one put
     down DURING a drag reports moves that this would otherwise steer the grid with. The id is the
     only thing that says "this is that gesture". */
  if (!SWIPE.live || e.pointerId !== SWIPE.id) return;
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
  /* THE SPEED, from the last stretch only. Anything older than 90ms is thrown away, so a long slow
     drag that ends in a flick is measured on the flick — which is what the hand meant. */
  {
    const now = Date.now();
    const gap = now - SWIPE.vAt;
    if (gap > 12) {
      if (gap < 90 && SWIPE.vAt) SWIPE.v = (travelled - SWIPE.vD) / gap;
      SWIPE.vAt = now; SWIPE.vD = travelled;
    }
  }
  SWIPE.d = travelled;
  /* ONCE, not on every frame. `classList.add` on a class an element already has does nothing, but
     asking is still a walk of every cell sixty times a second for an answer that cannot change
     while the finger is down. */
  if (!SWIPE.held) {
    SWIPE.held = true;
    SWIPE.cells.forEach(el => el.classList.add('no-anim'));
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
  /* ---------- AT THE END OF THE RUN, NOTHING MOVES ------------------------------------------------
     IT WAS `travelled * 0.25` — a quarter of the finger's travel, the rubber-band every list has.
     That is right for a list, where the give tells you the content continues and you have reached
     the bottom of it. It is wrong here, because there is nothing beyond the last tab and nothing
     beyond the last page: the give says "there is more, pull harder" about a place where there is
     no more, and it is the only movement in the app that leads nowhere.

     ZERO. The screen holds still, which is a stronger statement than a wobble and an honest one —
     the edge is the edge. Everything else about the gesture is unchanged: it still commits, still
     settles, still turns a page anywhere that is not the end. */
  SWIPE.px = end ? 0 : travelled;
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

addEventListener('pointerup', e => {
  /* AND THE SAME FINGER LETTING GO. This had no check at all, so lifting a SECOND finger — resting
     a thumb, a palm on the edge of the screen — ended the drag as though it were the one doing the
     dragging. The card would stop halfway and settle back, which reads as the swipe simply failing
     for no reason. */
  if (!SWIPE.live || (e && e.pointerId !== undefined && e.pointerId !== SWIPE.id)) return;
  const axis = SWIPE.axis, d = SWIPE.d, cells = SWIPE.cells, v = SWIPE.v;
  /* EVERYTHING A DRAG SET, PUT BACK — in one line, so a field added later is added here rather
     than left to be noticed. `px` and the three velocity fields were being left behind: harmless
     while `pointerdown` clears them, and harmless is not the same as correct, because the next
     thing to read one before a drag starts would get the last gesture's answer. */
  SWIPE.live = false; SWIPE.axis = null; SWIPE.d = 0; SWIPE.cells = null;
  SWIPE.held = false; SWIPE.px = 0; SWIPE.v = 0; SWIPE.vD = 0; SWIPE.vAt = 0;
  SWIPE.id = null;
  /* A frame booked and not yet run would place the grid mid-drag AFTER the drag had finished,
     putting it back where the finger left it a moment after it had settled somewhere else. */
  if (SWIPE.frame) { cancelAnimationFrame(SWIPE.frame); SWIPE.frame = 0; }
  if (!axis || !cells) return;

  cells.forEach(el => el.classList.remove('no-anim'));
  const ax = AXES[axis];

  /* FAR ENOUGH, OR FAST ENOUGH — and the flick has to be going the SAME WAY as the drag. A finger
     that pulls back at the last moment has a velocity pointing the other way, and honouring that
     would turn the page somebody just decided against. */
  const far = Math.abs(d) >= THROW(axis);
  const fast = Math.abs(v) >= FLICK && (v < 0) === (d < 0) && Math.abs(d) > 8;
  const going = far || fast;

  /* HOW LONG THE SETTLE TAKES, from how far it still has to go and how fast it was already moving.
     A fixed duration is the other half of why this felt wrong: a card released a hair from its
     destination took the same quarter of a second as one released at the start, so the end of
     every gesture felt like wading. Distance decides the base; a fast release shortens it, because
     the movement is already happening and the animation only has to finish it. */
  /* The same distance the threshold used — see `stepY_` in shell.js. */
  const step = axis === 'x' ? stepX_() : stepY_();
  const left = going ? Math.max(0, step - Math.abs(d)) : Math.abs(d);
  const ms = Math.round(Math.min(400, Math.max(130,
    (left / step) * 520 / (1 + Math.min(2, Math.abs(v) * 1.6)))));
  document.documentElement.style.setProperty('--slide', ms + 'ms');

  /* The sweep `placeCells` skips during a drag — which screens nothing points at — runs once now.
     There is no pane-watching any more: sizes are fixed, so nothing can change size. */
  if (going) ax.go(ax.at() + (d < 0 ? 1 : -1));
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
/* A CANCELLED POINTER. The browser takes the gesture away — a phone call, a system edge swipe, a
   second finger — and `pointerup` never comes, so everything a drag sets up has to be undone here
   as well as there. It was undoing most of it: `held` and the booked frame were not reset, so the
   NEXT drag skipped its own setup and left a booked frame that placed the grid back where this one
   had been. */
addEventListener('pointercancel', e => {
  if (!SWIPE.live || (e && e.pointerId !== undefined && e.pointerId !== SWIPE.id)) return;
  const axis = SWIPE.axis;
  (SWIPE.cells || []).forEach(el => el.classList.remove('no-anim'));
  /* The same reset as `pointerup`, because a cancelled gesture has to leave exactly as little
     behind as a finished one. */
  SWIPE.live = false; SWIPE.axis = null; SWIPE.d = 0; SWIPE.cells = null;
  SWIPE.held = false; SWIPE.px = 0; SWIPE.v = 0; SWIPE.vD = 0; SWIPE.vAt = 0;
  SWIPE.id = null;
  if (SWIPE.frame) { cancelAnimationFrame(SWIPE.frame); SWIPE.frame = 0; }
  if (axis) placeCells(axis);
}, { passive: true });


/* ---------- THE SCREEN CHANGING SHAPE UNDER THE APP ----------------------------------------------
   NOTHING HANDLED THIS AT ALL, and it is the most visible thing left: turn the phone sideways and
   every card stays where it was put for the old width — half off the screen, overlapping, and the
   only way out is a reload. `stepX_` is a fraction of the app's width and the app's width has just
   changed; nothing asked it again.

   It is not only rotation. A phone's address bar sliding away, a keyboard opening under a text
   field, a desktop window being dragged wider — every one of those changes the number every
   position on this grid is derived from.

   PLACED AGAIN, INSTANTLY. Not animated: the cards have not moved as far as anybody is concerned,
   the SCREEN has, and sliding them to their new homes afterwards would look like the app reacting
   rather than the layout simply being right.

   DEBOUNCED, because a resize is not one event. Dragging a window edge fires dozens a second, and
   a rotation fires several as the browser settles on a size — placing on each is placing against
   numbers that are still moving. A tenth of a second after the last one is after it has settled.

   AND NOT DURING A DRAG. A finger is down and the grid is following it; re-placing underneath that
   would snatch the card away mid-gesture. The release places it anyway. */
let RESHAPE = 0;
function reshaped_() {
  if (SWIPE.live) return;
  clearTimeout(RESHAPE);
  /* `'x'` names the axis the placement is FOR, and a full placement does both — every cell gets a
     new transform whichever is named. It was written as a conditional with the same answer in both
     branches, which is a thing that looks like a decision and is not. */
  RESHAPE = setTimeout(() => { try { placeCells('x', true); } catch (err) {} }, 100);
}
addEventListener('resize', reshaped_, { passive: true });
/* `orientationchange` as well as `resize`: on some phones the rotation fires this first and the
   resize only once the new size is known, and on others the reverse. Both, debounced together, so
   whichever arrives first books the same single placement. */
addEventListener('orientationchange', reshaped_, { passive: true });
/* The visual viewport is the part you can actually see — it changes when the address bar slides
   away or a keyboard opens, and neither of those fires a window resize on iOS. */
if (window.visualViewport) {
  visualViewport.addEventListener('resize', reshaped_, { passive: true });
}

/* ---------- COMING BACK TO A TAB THAT WAS LEFT MID-GESTURE ---------------------------------------
   Switch apps with a finger down and the browser may never send the pointerup — so `SWIPE.live`
   stays true, and the next press is treated as the continuation of a gesture from ten minutes ago:
   the grid jumps by however far the two touches happen to be apart. Cheap to close and impossible
   to diagnose from the outside. */
addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') return;
  if (!SWIPE.live) return;
  SWIPE.live = false; SWIPE.axis = null; SWIPE.d = 0;
  SWIPE.held = false; SWIPE.px = 0; SWIPE.v = 0; SWIPE.vD = 0; SWIPE.vAt = 0;
  SWIPE.id = null;
  if (SWIPE.frame) { cancelAnimationFrame(SWIPE.frame); SWIPE.frame = 0; }
  (SWIPE.cells || []).forEach(el => el.classList.remove('no-anim'));
  SWIPE.cells = null;
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


/* ==================================================================================================
   THE OVERWORLD — the board itself, moved in from overworld.html.

   IT WAS A PAGE OF ITS OWN AND NOW IT IS NOT. overworld.html carried its own doctype, its own
   stylesheet, its own error box and its own copy of the loading banner — a second small site beside
   this one, kept in step by hand. Everything it did that this app does not already do is the board;
   everything else was scaffolding for being a page.

   THIS FILE WAS NAMED FOR IT AND CONTAINED NONE OF IT. `overworld.js` held the feed pictures, the
   swipe engine and `bootFailed` — the split of script.js took its section headers as file names and
   this one landed on the wrong section. The name has been right the whole time and now the contents
   are too.

   EVERYTHING IS LOCAL TO ONE FUNCTION, deliberately. The board declares `add`, `merge`, `tiles`,
   `route`, `place`, `posts` and eighty more; at the top level every one of those would be a second
   declaration of a name this app already uses, and `check.js` would say so eighteen times. Inside a
   function they are the board's own and cannot reach anything.

   THREE.JS IS FETCHED WHEN THE BOARD IS OPENED, not when the app starts. It is most of a megabyte
   for one widget in a list, and somebody who never opens the map should never pay for it.
================================================================================================== */

/* THE LOADER. A classic script cannot `import`, but it can WRITE a module script that does — so the
   module build is fetched by URL and hung on `window`, and everything below carries on as ordinary
   script. No importmap, no build step, and no second copy of three.js if the board is opened twice.
   The version is pinned: `latest` is a promise that somebody else's breaking change becomes yours. */
const THREE_URL = 'https://unpkg.com/three@0.160.0/build/three.module.js';
let threePromise = null;
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (threePromise) return threePromise;
  threePromise = new Promise((ok, no) => {
    const s = document.createElement('script');
    s.type = 'module';
    s.textContent = 'import * as T from "' + THREE_URL + '";'
                  + 'window.THREE = T; window.dispatchEvent(new Event("three-ok"));';
    window.addEventListener('three-ok', () => ok(window.THREE), { once: true });
    /* A MODULE SCRIPT WRITTEN THIS WAY DOES NOT FIRE `onerror` when the import inside it fails, so
       a dead CDN would leave this pending for ever and the card would sit empty with no reason
       given. A deadline is the only thing that catches it. */
    setTimeout(() => { if (!window.THREE) no(new Error('three.js did not load from unpkg.com')); }, 12000);
    document.head.appendChild(s);
  });
  return threePromise;
}

/* WHAT IS RUNNING, so opening the board twice does not leave two of them drawing into one card and
   two sets of key handlers fighting over the walker. */
let OW = null;

function stopOverworld() {
  if (!OW) return;
  OW.off.forEach(([t, n, f]) => t.removeEventListener(n, f));
  if (OW.frame) cancelAnimationFrame(OW.frame);
  try { OW.renderer.dispose(); } catch (e) {}
  OW = null;
}

/* THE ENTRY POINT, and the only name this section adds to the app. */
function initOverworldBoard() {
  const mount = document.getElementById('map-board');
  if (!mount) return;
  stopOverworld();
  mount.textContent = 'Loading the map…';
  loadThree().then(() => {
    mount.textContent = '';
    buildOverworld(mount);
  }).catch(err => {
    mount.textContent = String(err.message || err);
  });
}

function buildOverworld(mount) {
  const THREE = window.THREE;
  /* Every listener is written down as it is added, so leaving the screen can take them all off
     again. A board that has been closed still answering the arrow keys is the sort of fault that
     only shows up as "the map moved while I was typing". */
  const off = [];
  const on_ = (target, name, fn) => { target.addEventListener(name, fn); off.push([target, name, fn]); };


  window.__ok = true;

  /* ==================================================================================================
     THE LANDMARKS TAB — VERTICES, AND EVERYTHING ELSE DERIVED

     `shape: 'poly'` with a `points` cell, which your schema already had a column for.

     WIDTH AND DEPTH ARE NOT ENOUGH, and the reason is measurable on these five. A rectangle cannot say
     what an L-shaped building is: Britannia Point fills 48% of its bounding box and the Premier Inn
     46%, so a rectangle round either claims twice the ground the building stands on. Even the simple
     ones are notched — the bus garage 65%, Sainsbury's 68%. Not one of the five is a rectangle.

     AND IT IS THE FOOTPRINT THAT MATTERS, NOT THE AREA. On a tiled board what a building occupies is
     the set of tiles it covers, and a concave building covers tiles it has no floor area in — the notch
     is inside the outline even where there is nothing built. Area cannot express that; vertices can.

     SO ONE COLUMN CARRIES THE SHAPE and the rest fall out of it:
       area       the shoelace formula over the vertices
       perimeter  the sum of the edges
       bearing    no longer needed — the polygon is already at its real angle
       tiles      the polygon rasterised onto the grid
     Stored separately, each is a column that can disagree with the shape and with the others.

     WHAT STAYS: height and storeys, which an outline genuinely does not know; colour; and lat/lng as a
     convenience, being the middle of the vertices.

     THE POINTS CELL is `lat lng;lat lng;…` — 683 characters for Sainsbury's, which is thirty-eight
     corners and the largest here. A spreadsheet cell holds 32,767.
  ================================================================================================== */
  const LANDMARKS = [{"name": "River Wandle", "kind": "river", "lat": 51.4172, "lng": -0.178, "height_m": 0, "storeys": 0, "colour": "#4aa8d8", "points": [[51.42049, -0.17561], [51.41963, -0.17612], [51.41881, -0.17679], [51.41808, -0.17742], [51.41744, -0.17812], [51.41686, -0.17879], [51.41623, -0.17944], [51.4156, -0.18002], [51.41491, -0.18055], [51.41419, -0.18098], [51.41345, -0.18131]], "ground": true, "line": true, "width_m": 14, "label": "The Wandle", "icon": "water"}, {"name": "Merton Bus Garage", "kind": "indust", "lat": 51.41734, "lng": -0.18152, "height_m": 9.0, "storeys": 1, "colour": "#c2bcae", "points": [[51.41837, -0.1819], [51.41839, -0.18147], [51.41841, -0.18124], [51.41774, -0.18113], [51.41772, -0.18142], [51.41705, -0.1813], [51.41684, -0.18118], [51.41662, -0.18118], [51.41655, -0.18113], [51.41652, -0.18124], [51.41648, -0.18138], [51.41654, -0.18142], [51.41677, -0.18143], [51.41702, -0.18158], [51.41699, -0.18196], [51.41716, -0.18198], [51.41783, -0.182], [51.4181, -0.18195], [51.41837, -0.1819]], "venue": true, "node": "start", "label": "Bus Garage", "icon": "bus", "roof": "#5a6b7a", "address": "18 Merton High St, SW19 1DN"}, {"name": "Priory Retail Park", "kind": "retail", "lat": 51.41586, "lng": -0.17899, "height_m": 8.0, "storeys": 1, "colour": "#cfc7b8", "points": [[51.41641, -0.17906], [51.41628, -0.17908], [51.41616, -0.17911], [51.41601, -0.17913], [51.41586, -0.17916], [51.4158, -0.17917], [51.41571, -0.17918], [51.41558, -0.1792], [51.41546, -0.17923], [51.41538, -0.17924], [51.41525, -0.17901], [51.41524, -0.17896], [51.41522, -0.1786], [51.41623, -0.17842], [51.41625, -0.17861], [51.41638, -0.17859], [51.41641, -0.17906]], "venue": true, "label": "Priory Retail Park", "icon": "cart", "roof": "#8a5a3c", "address": "131 High St, SW19 2PP"}, {"name": "Britannia Point", "kind": "resi", "lat": 51.41744, "lng": -0.1784, "height_m": 59.5, "storeys": 17, "colour": "#d8d2c4", "points": [[51.41736, -0.17873], [51.41749, -0.17867], [51.41746, -0.17848], [51.41749, -0.17846], [51.41765, -0.17839], [51.41761, -0.17822], [51.41743, -0.1783], [51.41739, -0.17812], [51.41739, -0.1781], [51.41726, -0.17816], [51.41736, -0.17873]], "venue": true, "label": "Britannia Point", "icon": "tower", "roof": "#33485a", "address": "7-9 Christchurch Rd, SW19 2FF"}, {"name": "Premier Inn", "kind": "civic", "lat": 51.41398, "lng": -0.18042, "height_m": 22.0, "storeys": 7, "colour": "#e0d6c2", "points": [[51.41359, -0.18067], [51.4137, -0.18075], [51.41374, -0.18079], [51.41383, -0.18085], [51.41388, -0.18089], [51.41395, -0.18065], [51.41402, -0.18041], [51.41404, -0.18042], [51.41402, -0.18066], [51.41407, -0.18071], [51.4141, -0.18072], [51.41411, -0.18065], [51.41417, -0.18066], [51.41426, -0.17971], [51.41417, -0.17969], [51.41412, -0.17967], [51.41411, -0.1797], [51.4141, -0.17973], [51.41359, -0.18067]], "venue": true, "node": "castle", "label": "Premier Inn", "icon": "bed", "roof": "#6d3350", "address": "27 Chapter Way, SW19 2RF"}, {"name": "Sainsbury's", "kind": "retail", "lat": 51.41521, "lng": -0.18175, "height_m": 10.0, "storeys": 1, "colour": "#d6cdbd", "points": [[51.4147, -0.18252], [51.41471, -0.18246], [51.41472, -0.18243], [51.41475, -0.18222], [51.41475, -0.18219], [51.41443, -0.18204], [51.41446, -0.18187], [51.4145, -0.18165], [51.4145, -0.18163], [51.41454, -0.18142], [51.41458, -0.18119], [51.41461, -0.18097], [51.41466, -0.18074], [51.41469, -0.18052], [51.41472, -0.18034], [51.41496, -0.18045], [51.41513, -0.18052], [51.41565, -0.18074], [51.41591, -0.18086], [51.41588, -0.18102], [51.41584, -0.18127], [51.41581, -0.18147], [51.41577, -0.1817], [51.41582, -0.18172], [51.41582, -0.18174], [51.41579, -0.18189], [51.41577, -0.182], [51.41585, -0.18203], [51.41583, -0.18216], [51.41581, -0.18228], [51.41573, -0.18225], [51.4157, -0.18241], [51.41551, -0.18255], [51.41543, -0.18261], [51.41539, -0.18261], [51.41534, -0.18259], [51.41531, -0.18278], [51.4147, -0.18252]], "label": "Sainsbury's", "icon": "basket", "roof": "#c8752a", "address": "1 Merton High St, SW19 1DD"}, {"name": "Colliers Wood Recreation Ground", "kind": "park", "lat": 51.41789, "lng": -0.17268, "height_m": 0, "storeys": 0, "colour": "#5f9c39", "points": [[51.41809, -0.17433], [51.41811, -0.17413], [51.41824, -0.17306], [51.41825, -0.17306], [51.41836, -0.17245], [51.41842, -0.1722], [51.41842, -0.17215], [51.41844, -0.17206], [51.41847, -0.17199], [51.41842, -0.17192], [51.41827, -0.17182], [51.41839, -0.17169], [51.41838, -0.17168], [51.41831, -0.17155], [51.41825, -0.17158], [51.41819, -0.17163], [51.41813, -0.1716], [51.41811, -0.17171], [51.41772, -0.1715], [51.41764, -0.17185], [51.41758, -0.17205], [51.41748, -0.17202], [51.41736, -0.17197], [51.41731, -0.17196], [51.4173, -0.17207], [51.41729, -0.17212], [51.41733, -0.17214], [51.41754, -0.17223], [51.4174, -0.17311], [51.41733, -0.17381], [51.41729, -0.17411], [51.41727, -0.17429], [51.41756, -0.17432], [51.41766, -0.17434], [51.41772, -0.17433], [51.4178, -0.17434], [51.41805, -0.17435], [51.41809, -0.17433]], "ground": true, "label": "Rec Ground", "icon": "tree", "address": "21 South Gardens, SW19 2NT"}, {"name": "Wandle Park", "kind": "park", "lat": 51.41907, "lng": -0.17947, "height_m": 0, "storeys": 0, "colour": "#5f9c39", "points": [[51.42047, -0.1796], [51.42048, -0.1795], [51.42048, -0.17944], [51.42046, -0.17939], [51.42029, -0.17913], [51.42012, -0.17887], [51.42008, -0.1789], [51.42, -0.17904], [51.41998, -0.17906], [51.41977, -0.1789], [51.41959, -0.17877], [51.41959, -0.17879], [51.41943, -0.17867], [51.41933, -0.17859], [51.41934, -0.17852], [51.41934, -0.17847], [51.4194, -0.1782], [51.41898, -0.17836], [51.41892, -0.17828], [51.41871, -0.1785], [51.41848, -0.17874], [51.41827, -0.17895], [51.41823, -0.17899], [51.41817, -0.17906], [51.41802, -0.17922], [51.41787, -0.17934], [51.41788, -0.17936], [51.41769, -0.17953], [51.41768, -0.17982], [51.41765, -0.17986], [51.41729, -0.17933], [51.41722, -0.17946], [51.41721, -0.17949], [51.41718, -0.17953], [51.41703, -0.17982], [51.41705, -0.17987], [51.41693, -0.18022], [51.41681, -0.18062], [51.4194, -0.18111], [51.41945, -0.18053], [51.41948, -0.18051], [51.41956, -0.18052], [51.41969, -0.18055], [51.41997, -0.1806], [51.42002, -0.18035], [51.42003, -0.18029], [51.4199, -0.18013], [51.41998, -0.17997], [51.42011, -0.18009], [51.42014, -0.18004], [51.42038, -0.1798], [51.42045, -0.17971], [51.42047, -0.1796]], "ground": true, "label": "Wandle Park", "icon": "tree", "address": "SW19 2BL"}, {"name": "Tandem Centre car park", "kind": "retail", "lat": 51.41415, "lng": -0.17739, "height_m": 9, "storeys": 1, "colour": "#7c7a75", "points": [[51.41366, -0.17523], [51.41327, -0.17722], [51.4132, -0.17752], [51.41304, -0.17832], [51.41323, -0.17839], [51.41332, -0.17838], [51.41362, -0.17847], [51.41373, -0.17851], [51.41425, -0.17861], [51.41428, -0.1786], [51.4143, -0.17857], [51.41431, -0.17851], [51.4143, -0.1784], [51.41449, -0.1783], [51.41444, -0.17813], [51.41437, -0.17798], [51.41453, -0.17775], [51.41456, -0.1777], [51.41458, -0.17761], [51.41471, -0.17673], [51.41477, -0.17627], [51.41485, -0.17574], [51.41494, -0.17523], [51.41478, -0.17515], [51.41469, -0.17564], [51.41366, -0.17523]], "ground": true, "icon": "car"}, {"name": "Priory Retail Park (site)", "kind": "retail", "lat": 51.416, "lng": -0.17931, "height_m": 8, "storeys": 1, "colour": "#7c7a75", "points": [[51.41651, -0.18007], [51.4165, -0.18016], [51.41647, -0.18025], [51.41642, -0.18032], [51.41636, -0.18034], [51.41623, -0.18018], [51.41622, -0.18014], [51.41621, -0.18009], [51.41619, -0.18004], [51.41615, -0.18003], [51.41609, -0.18003], [51.41582, -0.17999], [51.41555, -0.17981], [51.41541, -0.17945], [51.41539, -0.17931], [51.41538, -0.17924], [51.41525, -0.17901], [51.41524, -0.17896], [51.41506, -0.17899], [51.41501, -0.17898], [51.41496, -0.17894], [51.41493, -0.17887], [51.41492, -0.17879], [51.41493, -0.17871], [51.41496, -0.17863], [51.41511, -0.17857], [51.41526, -0.1785], [51.41574, -0.1784], [51.41606, -0.17833], [51.41615, -0.17832], [51.41622, -0.17834], [51.41632, -0.17839], [51.41636, -0.17844], [51.41639, -0.17848], [51.41642, -0.17853], [51.41645, -0.17858], [51.41649, -0.17872], [51.41655, -0.17906], [51.41677, -0.17951], [51.41679, -0.17957], [51.41678, -0.17964], [51.41676, -0.17971], [51.41671, -0.17978], [51.41666, -0.17983], [51.4166, -0.17983], [51.41655, -0.17982], [51.41651, -0.18007]], "ground": true, "icon": "car"}, {"name": "Tandem Centre", "kind": "retail", "lat": 51.4139, "lng": -0.17686, "height_m": 9, "storeys": 1, "colour": "#cfc3b0", "points": [[51.41366, -0.17746], [51.41368, -0.17746], [51.41367, -0.17751], [51.41366, -0.17753], [51.41357, -0.1775], [51.41357, -0.17752], [51.41346, -0.17748], [51.41337, -0.17742], [51.41338, -0.17734], [51.41328, -0.1773], [51.41337, -0.17673], [51.41345, -0.17676], [51.41359, -0.17582], [51.41369, -0.17586], [51.41375, -0.17542], [51.41472, -0.17582], [51.41466, -0.17625], [51.41471, -0.17628], [51.41465, -0.1767], [51.41471, -0.17673], [51.41458, -0.17761], [51.41431, -0.17749], [51.41451, -0.17618], [51.4139, -0.17593], [51.41366, -0.17746]], "venue": true, "label": "Tandem Centre", "icon": "bag", "roof": "#4a6b52", "address": "High St, SW19 2TY"}, {"name": "Merton Abbey Mills", "kind": "retail", "lat": 51.41302, "lng": -0.18329, "height_m": 8, "storeys": 1, "colour": "#c9b79c", "points": [], "venue": true, "post": true, "label": "Merton Abbey Mills", "icon": "market", "roof": "#8a6a4a", "address": "Watermill Way, SW19 2RD"}, {"name": "Deen City Farm", "kind": "farm", "lat": 51.40835, "lng": -0.1854, "height_m": 5, "storeys": 1, "colour": "#a8b56a", "points": [], "venue": true, "post": true, "label": "Deen City Farm", "icon": "farm", "roof": "#6b7a3a", "address": "39 Windsor Ave, SW19 2RR"}];

  /* ---------- WHAT THE VERTICES TELL US ------------------------------------------------------------
     Computed once, on load, from the only column that carries shape.

     THE SHOELACE FORMULA for area: walk the outline summing the cross products of consecutive corners,
     halve it, take the size. It works for any simple polygon, concave included, which is exactly why
     the vertices are the thing worth storing. */
  const M_LAT = 111320;
  const MID = {
    lat: (Math.min(...LANDMARKS.map(l => l.lat)) + Math.max(...LANDMARKS.map(l => l.lat))) / 2,
    lng: (Math.min(...LANDMARKS.map(l => l.lng)) + Math.max(...LANDMARKS.map(l => l.lng))) / 2,
  };
  const M_LNG = M_LAT * Math.cos(MID.lat * Math.PI / 180);
  /* Metres from the middle. A degree of latitude is about 111,320m everywhere; a degree of longitude is
     that times the cosine of the latitude, because the meridians converge. */
  const mx = lng => (lng - MID.lng) * M_LNG;
  const mz = lat => -(lat - MID.lat) * M_LAT;

  LANDMARKS.forEach(l => {
    /* A POST HAS NO OUTLINE, only a point. Everything downstream that walks a ring has to cope with
       an empty one rather than crash on it — a place we know the location of but not the shape of is
       a normal thing for the table to hold, not an error. */
    l.ring = l.points.map(p => [mx(p[1]), mz(p[0])]);
    if (!l.ring.length) { l.area = 0; l.perimeter = 0; l.post = true; return; }
    let a = 0, per = 0;
    for (let i = 0, j = l.ring.length - 1; i < l.ring.length; j = i++) {
      a += l.ring[j][0] * l.ring[i][1] - l.ring[i][0] * l.ring[j][1];
      per += Math.hypot(l.ring[i][0] - l.ring[j][0], l.ring[i][1] - l.ring[j][1]);
    }
    l.area = Math.abs(a / 2);
    l.perimeter = per;
  });

  /* ==================================================================================================
     THE BOARD

     A TILE HAS TO BE SMALLER THAN THE SMALLEST THING YOU WANT TO SEE. At fifty metres Britannia Point —
     a forty by fifteen slab — falls between tile centres and claims nothing at all: it simply is not on
     the board. Twenty metres holds every one of the five.
  ================================================================================================== */
  /* THIRTY-TWO METRES A TILE, not twenty.

     TWENTY WAS TOO FINE FOR THE BUILDINGS. Sainsbury's is 165 metres deep and the bus garage is 215 —
     at twenty metres a tile those need nine and eleven rows of land, and the board has seven north of
     the street. Two of the five had nowhere to stand, which is not a placement problem: the board was
     simply smaller than the things on it.

     At thirty-two the deepest needs seven rows and fits, and the board covers 1.1km rather than 0.7 —
     the town rather than one street. The buildings did not change; the ruler did. */
  /* SIXTEEN METRES A TILE, which is the thirty-two split into four.

     THIRTY-TWO COULD NOT DRAW A BUILDING. Britannia Point came out as a single tile and the Premier
     Inn as two — at that size a footprint is not a shape, it is a lump, and the notch that made the
     vertices worth storing in the first place cannot survive being rounded to one square. The Priory
     car park got two tiles of the fifteen it covers.

     AT SIXTEEN THE SAME BUILDINGS ARE 4, 10 AND 25. Nothing about them changed and the board is the
     same 1,632 by 384 metres — the ruler got finer, which is the whole of it. Four times the tiles,
     2,448 rather than 612, and every one of them still merges into the same handful of meshes.

     THE EARLIER NOTE SAYING TWENTY WAS TOO FINE NO LONGER APPLIES, and it is worth saying why rather
     than deleting it. Twenty failed because COLS and ROWS were typed in, so a finer tile meant a
     physically smaller board and the deep buildings fell off the back of it. Both are computed now,
     and the board grows rows to hold whatever the deepest thing is. The fault was never the tile. */
  /* EIGHT METRES A TILE. At sixteen, Britannia Point was 2.7 tiles across — a seventeen-storey tower
     rendered as a three-tile stub, which is the smallest building on the board and the one whose shape
     matters most. At eight it is 5.5 across and reads as a tower. Sainsbury's goes from 10 tiles wide
     to 21, and the notch in its outline finally survives rasterising.

     THE COST IS 28,000 TILES, four times 7,081. They merge into a handful of meshes so the frame rate
     is unaffected, but building them takes a second or so on a phone. IF IT FEELS SLOW, PUT THIS BACK
     TO 16 — it is one number and everything else on the board is derived from it. */
  const TILE_M = 8;                       // metres of real ground a tile covers
  /* ---------- THE BOARD IS AS BIG AS WHAT IS ON IT ---------------------------------------------------
     COLS AND ROWS WERE TYPED IN, and everything had to fit into them — which is backwards. Add a
     landmark and it had nowhere to go; take one away and there was a stretch of empty terraces.

     NOW THEY ARE COMPUTED. Every node gets its own stretch of street, so the world grows by a fixed
     amount per place you can visit: five landmarks make a short board and fifteen make a long one, and
     nothing has to be retyped for either.

     THE DEPTH COMES FROM THE DEEPEST THING ON IT. Sainsbury's runs 165 metres back and the bus garage
     215 — the board has to be deeper than the deepest, or the biggest building has nowhere to stand,
     which is exactly the fault that forced the tile from twenty metres to thirty-two.

     BOTH ARE WORKED OUT BEFORE ANYTHING IS DRAWN, from the table, so the only way to change the size
     of the world is to change what is in it. */
  /* ---------- THE STREET, AND A NODE IN FRONT OF EVERY LANDMARK ------------------------------------
     THE STRAIGHT PATH IS THE POINT. A world map is a line of places you choose between, each one
     standing behind its own mark, and the order along the line is the thing that carries meaning.
     Real coordinates cannot give you that: the four town-centre landmarks fall within a hundred metres
     of each other and collapse into one another, and the recreation ground sits four hundred metres
     east of everything with nothing between. THE ORDER IS TRUE AND THE SPACING IS NOT — that is the
     trade every one of these maps has ever made, and nobody has read a distance off one.

     EVERY LANDMARK GETS A NODE, NOT JUST THE BUILDINGS. The parks used to keep their real coordinates
     while the buildings were spread along the street, so the board was half arranged and half true and
     the two halves disagreed — Wandle Park was drawn correctly, four hundred metres from anything you
     could walk to, which is indistinguishable from not being drawn at all. A park on the street with a
     node in front of it is findable, and findable is the whole job.

     THE SPACING FITS THE WIDEST THING ON THE BOARD rather than being a number somebody picked. The
     Tandem Centre car park is 240 metres across; a 160-metre slot means it overlaps its neighbour and
     the placement loop below has to shove them apart, which loses the even spacing it was given for. */
  const NODES = LANDMARKS.filter(l => !l.line).sort((a, b) => mx(a.lng) - mx(b.lng));
  const STOPS = NODES.filter(l => l.venue);
  const GROUND = LANDMARKS.filter(l => l.ground || l.line);

  const WIDEST_M = Math.max(...NODES.map(l =>
    l.ring.length ? Math.max(...l.ring.map(p => p[0])) - Math.min(...l.ring.map(p => p[0])) : 0));
  const DEEPEST_M = Math.max(...NODES.map(l =>
    l.ring.length ? Math.max(...l.ring.map(p => p[1])) - Math.min(...l.ring.map(p => p[1])) : 0));

  const PER_NODE_M = WIDEST_M + 64;        // widest footprint plus a gap, so nothing starts overlapping
  const FRONT_M    = 96;                   // ground in front of the street, toward the camera
  const SIDE_M     = 192;                  // margin at the two ends of the street
  const BACK_M     = 64;                   // margin behind the deepest thing

  const per = m => Math.max(1, Math.round(m / TILE_M));
  const PER_NODE = per(PER_NODE_M);
  const FRONT_ROWS = per(FRONT_M);
  const COLS = NODES.length * PER_NODE + per(SIDE_M);
  const ROWS = Math.ceil(DEEPEST_M / TILE_M) + FRONT_ROWS + per(BACK_M);
  const STREET_ROW = ROWS - 1 - FRONT_ROWS;

  /* THE SCALE IS THE FIXED THING, NOT THE TILE. Board units per real metre — hold it steady and a
     finer tile gives more tiles over the same ground rather than a smaller world. */
  const SCALE = 0.6875;
  const TILE = TILE_M * SCALE, GAP = TILE * 0.082, STEP = TILE + GAP;
  const W = COLS * STEP, D = ROWS * STEP;
  const tx = c => -W / 2 + c * STEP + STEP / 2;
  const tz = r => -D / 2 + r * STEP + STEP / 2;
  /* Real metres to a column and row. */
  const colOf = x => Math.round((x * SCALE + W / 2 - STEP / 2) / STEP);
  const rowOf = z => Math.round((z * SCALE + D / 2 - STEP / 2) / STEP);

  /* ---------- THE BIOMES ---------------------------------------------------------------------------
     Colliers Wood is a town centre, not a forest. Counted off the survey: 127 residential areas, 14
     retail, 11 parks, 11 commercial, 6 industrial. `top` is where a tile's surface sits, which is what
     makes tiled ground feel like ground rather than a chessboard. */
  const BIOME = {
    /* A RIVER, not a sea. Three units down rather than nine: the Wandle sits a few feet below the
       towpath, and a channel nine deep reads as a canyon with a stream in it. */
    water:  { colour: 0x4aa8d8, top: -3  },
    park:   { colour: 0x63b03a, top: -1 },
    grass:  { colour: 0x7ab648, top: 0  },
    resi:   { colour: 0xc8b48a, top: 0  },
    retail: { colour: 0xb9a898, top: 0  },
    indust: { colour: 0x9a9a92, top: 0  },
    street: { colour: 0x8c8578, top: 1  },
  };
  /* One character a tile. Written rather than generated: Colliers Wood has a shape, and a rule that
     produced it by accident would be a rule nobody could correct. The middle row is the high street,
     which is where the path runs — the path is not drawn on the ground, it IS a street. */
  /* NOT AN ISLAND, AND THAT WAS A LOOK COPIED INSTEAD OF A PLACE.
     Earlier versions ringed the whole board in sea. Colliers Wood is a town centre in south London;
     the only water in it is the RIVER WANDLE, running north to south down the west side with the
     Pickle Ditch beside it — which is what the survey says and what is here now.

     THE LAND RUNS TO THE EDGE OF THE BOARD, because it does. A world that stops in sea claims there
     is nothing beyond it, and there is: Tooting one way, Morden the other.

     THE RIVER CROSSES THE HIGH STREET, which is true, and is the one place the two lines meet. The
     street carries over it — that is what a bridge is.

       ~ river   p park   g grass   r residential   R retail   i industrial   H high street */
  /* NOT AN ISLAND, AND THAT WAS A LOOK COPIED RATHER THAN A PLACE OBSERVED.

     Earlier versions ringed the whole board in sea. Colliers Wood is a town centre in south London and
     the only water in it is the RIVER WANDLE, running north to south down the west side with the Pickle
     Ditch beside it. That is what the survey says and it is what is here.

     THE LAND RUNS TO THE EDGE OF THE BOARD, because it does. A world that stops in sea is claiming
     there is nothing beyond it, and there is: Tooting one way, Morden the other.

     THE RIVER WANDERS, and that matters more than it sounds. A channel running dead straight down one
     column is a canal; a river bends, and the bend is most of how you know which one it is at a glance.
     Green either side of it the whole way, because there is — Wandle Park, the Mills, and the path.

     AND IT CROSSES THE HIGH STREET, which is true, and is the one point where the two lines meet. The
     street carries over it, which is what a bridge is.

       ~ river   p park   g grass   r residential   R retail   i industrial   H high street */
  /* THE STREET SITS NEAR THE FRONT, four rows from the bottom edge.

     IT WAS IN THE MIDDLE, which split the board in half and left seven rows for everything behind it —
     not enough for Wandle Park, which runs four hundred metres north to south. Moving it forward gives
     eleven rows behind and four in front, and behind is where the parks, the retail sites and the big
     sheds are.

     IT IS ALSO WHERE IT LOOKS RIGHT. The camera is low and in front; a path near the front of the board
     is close to the eye and everything else is laid out beyond it, which is the arrangement in the
     reference and the reason the route reads as the thing you are ON rather than a line across a
     picture.

       ~ river   p park   g grass   r residential   R retail   i industrial   H high street */
  /* ---------- THE GROUND, WORKED OUT RATHER THAN DRAWN ---------------------------------------------
     The map used to be a picture typed out one character a tile, which was readable and correctable
     and could not survive the board changing size. It is derived now, in this order:

       RESIDENTIAL EVERYWHERE, because that is what most of Colliers Wood is — a hundred and twenty-seven
       residential areas against fourteen retail in the survey.
       THE STREET, one row across.
       THE RIVER, wherever its real line falls — see below; it is a landmark like any other now.
       THE PARKS AND SITES, painted from their real outlines by `paintGround`.

     EACH STEP OVERWRITES THE ONE BEFORE, which is the order things actually take precedence in: a park
     beats the terraces it replaced, and the street beats everything because you can walk it. */
  /* NO STREET ROW. It was one line of 'H' across the middle of the map and it was a claim about where
     you can go — the one kind of invention this file had ruled out everywhere else. The real high
     street is a shape somebody would have to trace, the same as every other outline here; until it is
     traced there is no street, rather than a made-up one.

     EVERYTHING STARTS AS TERRACES and the table paints over it. That is what Colliers Wood mostly is,
     and every tile that ends up being something else ends up that way because a row said so. */
  const OF = { '~': 'water', p: 'park', g: 'grass', r: 'resi', R: 'retail', i: 'indust', H: 'street' };


  const GRID = [];
  for (let c = 0; c < COLS; c++) {
    GRID[c] = [];
    for (let r = 0; r < ROWS; r++) {
      GRID[c][r] = { c, r, type: r === STREET_ROW ? 'street' : 'resi', x: tx(c), z: tz(r) };
    }
  }

  /* ---------- RASTERISING A POLYGON ONTO THE TILES --------------------------------------------------
     For every tile whose bounding box the outline touches, ask whether the tile's centre is inside the
     outline. If it is, the building occupies that tile.

     CROSSING COUNT for "inside": a ray from the point, and an odd number of edges crossed means inside.
     Ten lines, it handles concave shapes without knowing it is doing anything special, and that is the
     whole reason vertices beat a width and a depth.

     ANYTHING TOO SMALL TO CLAIM A TILE STILL CLAIMS ONE. A building narrower than a tile can fall
     between two centres and rasterise to nothing — which is not "small", it is absent, and absent is a
     worse answer than approximate. */



  /* ---------- EVERY LANDMARK STANDS BEHIND ITS NODE -------------------------------------------------
     THE NODE IS IN FRONT OF THE THING. That is how these maps have always worked — the castle is behind
     its node and the two read as one: you press the mark and you go into what stands over it.

     THE SHAPE STAYS AND THE POSITION MOVES. The ring keeps its real outline and its real angle — the
     Premier Inn is still the shape it is, courtyard and all — and the whole outline is carried so that
     it stands behind its node. What is kept from the coordinates is the ORDER along the street, which
     is the part that means anything: Sainsbury's really is west of Britannia Point, and the board says
     so.

     BEHIND MEANS THE FAR SIDE, away from the camera, set back by half its own depth plus a pavement, so
     a shop stands close to the road and a deep shed sits back off it — which is what they do.

     AND NOTHING STANDS IN THE RIVER OR OFF THE BOARD. Each is offered its own column first, then one
     either side, then two, until the whole outline is on dry land. The order survives; the even spacing
     does not, and of the two only the order was ever carrying information.

     A LANDMARK THAT WILL NOT FIT IS SAID OUT LOUD. Quietly dropping one is the sort of fault that looks
     like a rendering bug for a week. */
  const PLACED = [];
  NODES.forEach((l, i) => {
    const want = per(SIDE_M) / 2 + Math.round((i + 0.5) * (COLS - per(SIDE_M)) / NODES.length);

    /* A POST HAS NO OUTLINE, so there is nothing to carry — it takes its column and stands on it. */
    if (!l.ring.length) {
      l.nodeCol = Math.max(1, Math.min(COLS - 2, want));
      return;
    }

    const xs = l.ring.map(p => p[0]), zs = l.ring.map(p => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
    const depth = Math.max(...zs) - Math.min(...zs);

    /* Would it stand clear if its node were at column `c`? */
    const fits = c => {
      const wantX = tx(c) / SCALE;
      const wantZ = (tz(STREET_ROW) - STEP * 0.55) / SCALE - depth / 2;
      const dx = wantX - cx, dz = wantZ - cz;
      let c0 = Infinity, c1 = -Infinity, r0 = Infinity, r1 = -Infinity;
      l.ring.forEach(p => {
        const gc = colOf(p[0] + dx), gr = rowOf(p[1] + dz);
        c0 = Math.min(c0, gc); c1 = Math.max(c1, gc);
        r0 = Math.min(r0, gr); r1 = Math.max(r1, gr);
      });
      /* Off the board is as bad as in the water — half a building past the edge is half a building. */
      if (c0 < 0 || c1 > COLS - 1 || r0 < 0 || r1 > ROWS - 1) return null;
      for (let gc = c0; gc <= c1; gc++) {
        for (let gr = r0; gr <= r1; gr++) {
          const g = (GRID[gc] || [])[gr];
          if (!g) return null;
          if (g.type === 'water') return null;
          if (g.resv) return null;                  // something already spoken for is not free ground
        }
      }
      return { dx, dz, c0, c1, r0, r1 };
    };

    let put = null, col = want;
    for (let step = 0; step <= COLS && !put; step++) {
      for (const c of (step ? [want - step, want + step] : [want])) {
        if (c < 1 || c > COLS - 2) continue;
        const f = fits(c);
        if (f) { put = f; col = c; break; }
      }
    }

    if (!put) {
      PLACED.push(l.name + ' has nowhere to stand — it is wider than the dry land on this row.');
      return;
    }
    l.nodeCol = col;
    l.ring = l.ring.map(p => [p[0] + put.dx, p[1] + put.dz]);

    /* ---- THE RESERVATION IS NOT THE BUILDING -------------------------------------------------------
       THIS USED TO WRITE `owner` AND NEVER TAKE IT BACK. `owner` means "a building stands on this
       tile"; the rectangle claimed here is a BOUNDING BOX, which is a much larger thing, and it was
       never cleared once the building was placed. Two thirds of the occupied board was empty air — 229
       tiles of 405 — and every one of them blocked the ground paint and, later, blocked the walker.
       The Priory car park lost thirteen of its fifteen tiles to its own building's reservation.

       So the reservation lives in `resv`, which only this loop reads, and `owner` is written later
       from the real footprint. Two facts, two fields, and the temporary one stops pretending to be
       the permanent one. */
    for (let gc = put.c0; gc <= put.c1; gc++)
      for (let gr = put.r0; gr <= put.r1; gr++)
        if (GRID[gc] && GRID[gc][gr]) GRID[gc][gr].resv = l;
  });
  /* SAID ON THE SCREEN, WITHOUT STOPPING THE BOARD. A landmark that will not fit is worth knowing about
     and is not worth losing the other twelve over, so this warns into the same box the fatal handler
     uses rather than throwing. */
  function say(msg) {
    let d = mount.querySelector('.ow-say');
    if (!d) { d = document.createElement('div'); d.className = 'ow-say'; mount.appendChild(d); }
    d.textContent = (d.textContent ? d.textContent + '\n' : '') + msg;
  }
  if (PLACED.length) say(PLACED.join('\n'));

  /* ---------- WHICH TILES A LANDMARK COVERS ---------------------------------------------------------
     GROUND IS NOT IN THIS LOOP, AND THAT WAS THE FAULT. `owner` means "a building stands here" — it is
     what stops a second building being placed on top and what keeps the street props off. Ground was
     claiming it too, and `paintGround` skips any tile with an owner, so every park claimed its tiles
     and was then refused permission to paint them. Four ground landmarks, nought tiles painted between
     them: no parks, no Tandem Centre, no Priory car park, and a river reduced to the tiles just
     outside its own outline.

     Nothing downstream wanted those tiles anyway — `landmarks()` already filters ground out before
     extruding, so `l.tiles` on a park was written, never read, and cost the park its colour. Ground
     gets its tiles from `paintGround` instead, as `g.ground`, which is the field that means "this
     tile IS the park" rather than "something stands on it". */
  LANDMARKS.filter(l => !l.ground && !l.post).forEach(l => {
    const xs = l.ring.map(p => p[0]), zs = l.ring.map(p => p[1]);
    const c0 = colOf(Math.min(...xs)), c1 = colOf(Math.max(...xs));
    const r0 = rowOf(Math.min(...zs)), r1 = rowOf(Math.max(...zs));
    l.tiles = [];
    for (let c = c0; c <= c1; c++) {
      for (let r = r0; r <= r1; r++) {
        const g = (GRID[c] || [])[r];
        if (!g || g.type === 'water') continue;
        if (!inside(l.ring, g.x / SCALE, g.z / SCALE)) continue;
        g.owner = l;
        l.tiles.push(g);
      }
    }
    if (!l.tiles.length) {
      const g = (GRID[colOf(mx(l.lng))] || [])[rowOf(mz(l.lat))];
      if (g && g.type !== 'water') { g.owner = l; l.tiles.push(g); }
    }
  });
  function inside(ring, x, z) {
    let yes = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i], b = ring[j];
      if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) yes = !yes;
    }
    return yes;
  }



  /* And the node itself, on the street, in front of what it belongs to. */
  LANDMARKS.forEach(l => { if (GRID[l.nodeCol]) GRID[l.nodeCol][STREET_ROW].node = l; });

  const ROUTE = [];
  for (let c = 1; c < COLS - 1; c++) { ROUTE.push([c, STREET_ROW]); GRID[c][STREET_ROW].route = true; }

  /* ==================================================================================================
     THE SCENE
  ================================================================================================== */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8fd6ef);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);

  /* Fixed and low — thirty degrees, square to the board. No orbit, no zoom: a world map is laid out in
     front of you all at once, and the viewpoint is a decision made once rather than handed over. */
  const camera = new THREE.PerspectiveCamera(30, mount.clientWidth / mount.clientHeight, 1, 8000);
  const ANGLE = 30 * Math.PI / 180;
  /* ---------- THE CAMERA FOLLOWS THE WALKER ---------------------------------------------------------
     IT USED TO FRAME THE WHOLE BOARD, which was right while the board was small and stopped being right
     the moment the board grew with the table. Fifty-one columns seen all at once is a strip of confetti;
     the buildings are correct and none of them is legible.

     SO IT SITS A FIXED DISTANCE BEHIND AND ABOVE HIM AND GOES WHERE HE GOES. Same angle as before —
     about thirty degrees, low, looking across the ground rather than down on it — and the board can now
     be any length at all, because you are never looking at more than a few nodes of it.

     IT LAGS, DELIBERATELY. The camera eases toward where it should be rather than snapping there, so
     starting to walk moves him first and the world follows a beat later. Snapped, the world jerks and he
     appears not to move at all — it is the lag that makes it read as him walking rather than the ground
     sliding underneath him. */
  /* ---------- HOW MUCH OF THE TOWN IS IN FRAME ------------------------------------------------------
     MEASURED IN TILES, NOT UNITS. 210 back and 130 up was framed for a board 24 rows deep; on one 97
     rows deep it shows about a dozen tiles and the town might as well not be there — which is what
     "I can't see the parks" was actually describing. Wandle Park is 154 tiles and was simply outside
     the frame.

     THIRTY TILES BACK. Far enough that a park reads as a park and you can see which way the river
     runs, close enough that the walker is still a person rather than a dot. Written as a multiple of
     TILE so it survives the tile size changing again. */
  const CAM_BACK = TILE * 30, CAM_UP = TILE * 20;
  function place() {
    if (!mount.clientWidth || !mount.clientHeight) return;
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
  }
  function followCam(instant) {
    const want = new THREE.Vector3(WALK.x, CAM_UP, WALK.z + CAM_BACK);
    if (instant) camera.position.copy(want);
    else camera.position.lerp(want, 0.09);
    camera.lookAt(WALK.x, TILE, WALK.z - TILE * 4);
  }


  scene.add(new THREE.HemisphereLight(0xe8f6ff, 0x8a8a76, 0.95));
  const sun = new THREE.DirectionalLight(0xfff6e2, 1.5);
  sun.position.set(-W * 0.5, W * 0.7, W * 0.45);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  {
    const s = sun.shadow.camera;
    s.left = -W; s.right = W; s.top = W * 0.6; s.bottom = -W * 0.6;
    s.near = 1; s.far = W * 3;
    s.updateProjectionMatrix();
  }
  scene.add(sun, sun.target);
  const world = new THREE.Group();
  scene.add(world);

  /* ---------- THE TILES -----------------------------------------------------------------------------
     One block per tile: a top at the biome's height, sides all the way down. The sides are why this
     works — a tile with no sides is a square of colour; a tile with sides is a piece of land. */
  /* SHALLOW, because there is no island edge left to show the thickness of. The tiles still have
     sides — that is what makes them tiles — but the sides are a kerb now rather than a cliff, which is
     what ground in a town actually looks like. */
  const FLOOR = -9;
  function tiles() {
    const byType = {};
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const t = GRID[c][r], h = BIOME[t.type].top - FLOOR;
        const g = new THREE.BoxGeometry(TILE, h, TILE);
        g.translate(t.x, FLOOR + h / 2, t.z);
        /* THE ROW'S OWN COLOUR IF IT HAS ONE. The biome says how high a tile sits and what it is like
           to walk on; the landmark says what colour it is. Those had been the same thing, so the
           Priory car park came out #b9a898 against #c8b48a ground — twenty-five tiles of tarmac
           painted almost exactly the tan of the houses around it, present and invisible. Keyed by
           type AND colour so the merge still collapses them into one mesh per shade. */
        const key = t.ground && t.ground.colour ? t.type + '|' + t.ground.colour : t.type;
        (byType[key] = byType[key] || []).push(g);
      }
    }
    Object.keys(byType).forEach(k => {
      const [type, colour] = k.split('|');
      add(merge(byType[k]), colour ? parseInt(colour.slice(1), 16) : BIOME[type].colour, true);
    });
  }

  /* ---------- THE LANDMARKS -------------------------------------------------------------------------
     Extruded from the real outline, not from a box.

     THE POLYGON IS ALREADY AT ITS REAL ANGLE, which is why `bearing` is gone: a bearing exists only to
     tell a rectangle which way to face, and an outline knows. Britannia Point's slab runs at
     seventy-four degrees because its corners do.

     `-z` because Extrude builds in the XY plane and is then laid down, and the sign has to be undone or
     every building is mirrored east-west while the ground is not. */
  /* GROUND IS PAINTED ONTO THE TILES IT COVERS, rather than built as a block. A park is not a thing
     standing on the ground — it IS the ground — so the tiles under it change what they are, and the
     biome does the rest: grass where the park is, tarmac where the retail site is.

     WHICH IS WHY IT COMES BEFORE THE BUILDINGS: a building placed afterwards can stand on a park tile
     and know it, and the park cannot paint over a building that is already there. */
  /* HOW FAR A POINT IS FROM A LINE — the nearest distance to any of its segments.

     CLAMPED TO EACH SEGMENT'S ENDS, so a point beyond the end of one measures to that end rather than
     to an imaginary continuation of it. Without the clamp a river bends and the water appears in a
     straight line carrying on past the bend, which looks like a canal somebody forgot to finish. */
  function distToLine(pts, x, z) {
    let best = Infinity;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dz = b[1] - a[1];
      const len2 = dx * dx + dz * dz;
      let t = len2 ? ((x - a[0]) * dx + (z - a[1]) * dz) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      best = Math.min(best, Math.hypot(x - (a[0] + dx * t), z - (a[1] + dz * t)));
    }
    return best;
  }

  function paintGround() {
    let n = 0;

    /* ---------- A RIVER IS A LINE, NOT AN AREA ------------------------------------------------------
       Everything else on the ground is a polygon and is painted by asking whether a tile's centre is
       inside it. A river has no inside — it is a line with a width — so the question is different: how
       far is this tile from the line, and is that less than half the river's width.

       WHICH IS WHY IT IS A LANDMARK LIKE ANY OTHER now rather than a stripe drawn down a column of the
       map. It has a name, a real course, a width and a colour, and it sits in the table with the rest.
       A river that lives in the terrain-drawing code is a river nobody can move; one in the table is a
       row somebody can correct.

       IT CROSSES THE STREET AND THE STREET WINS. That is a bridge, and it is the one place on the board
       where two things share a tile and the right answer is "you can walk it". */
    GROUND.filter(l => l.line).forEach(l => {
      const half = (l.width_m || 12) / 2 + TILE_M * 0.35;
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
          const g = GRID[c][r];
          if (g.owner) continue;
          if (distToLine(l.ring, g.x / SCALE, g.z / SCALE) > half) continue;
          g.type = 'water';
          g.ground = l;
          n++;
        }
      }
    });

    GROUND.filter(l => !l.line).forEach(l => {
      const biome = l.kind === 'park' ? 'park' : 'retail';
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
          const g = GRID[c][r];
          if (g.type === 'water' || g.owner) continue;
          if (!inside(l.ring, g.x / SCALE, g.z / SCALE)) continue;
          g.type = biome;
          g.ground = l;
          n++;
        }
      }
    });
    return n;
  }

  /* ---------- BUILDINGS ARE BUILT FROM THE TILES THEY COVER ------------------------------------------
     AND NOT FROM THEIR OUTLINE, which is the change that makes them sit square to the board.

     Extruding the real polygon gave a building at its real angle — Britannia Point at seventy-four
     degrees, the bus garage at one — and on a tiled board that reads as wrong even though it is right.
     Everything else is square: the tiles, the street, the river's steps. One building at an angle looks
     like a mistake, and five of them look like the grid is broken.

     SO THE OUTLINE DECIDES WHICH TILES, and the TILES are what gets built. The footprint still comes
     from the survey — its size, its position, which squares it covers — and what stands there is a
     block per tile, square to everything else. That is how a tiled world works: the grid is the unit of
     the world, and a thing that ignores it is not in the world, it is on top of it.

     AND IT GIVES THE C SHAPE FOR FREE. The Tandem Centre wraps its car park; rasterised, the tiles it
     covers are C-shaped and the tiles it does not are the car park. Nothing had to be drawn — the
     survey already knew, and the grid just had to be allowed to show it. */
  /* ---------- A POST FOR A PLACE WITH NO OUTLINE ----------------------------------------------------
     MERTON ABBEY MILLS AND DEEN CITY FARM ARE REAL AND UNTRACED. Their centre points are right and
     their footprints do not exist yet, and the choice was between leaving them off the map or drawing
     an invented shape. Both are wrong. A post is the third answer: it stands exactly where the place
     is, it claims nothing about the shape of it, and it looks like what it is — a marker, not a
     building. When somebody traces the outline the post becomes a building and nothing else changes. */
  function posts() {
    const stems = [], signs = [];
    LANDMARKS.filter(l => l.post).forEach(l => {
      const c = colOf(mx(l.lng)), r = rowOf(mz(l.lat));
      const t = (GRID[c] || [])[r];
      if (!t) return;
      const y = BIOME[t.type].top;
      const stem = new THREE.CylinderGeometry(TILE * 0.07, TILE * 0.07, TILE * 1.6, 8);
      stem.translate(t.x, y + TILE * 0.8, t.z);
      stems.push(stem);
      const sign = new THREE.BoxGeometry(TILE * 0.9, TILE * 0.5, TILE * 0.12);
      sign.translate(t.x, y + TILE * 1.75, t.z);
      signs.push(sign);
      t.ground = l;                                  // so the plate names it when he stands there
    });
    if (stems.length) add(merge(stems), 0x6b4a2a, true);
    if (signs.length) add(merge(signs), 0xf2e6c8, true);
  }

  /* ---------- THE NAMES, ON THE MAP -----------------------------------------------------------------
     A BUILDING YOU CANNOT NAME IS A GREY BLOCK. The plate at the bottom of the screen names one thing —
     whatever he is standing on — and everything else on the board is anonymous until you walk to it.
     On a board of 28,000 tiles that means the town is a shape you have to explore to read, when the
     whole reason for storing real outlines and real heights was to make it recognisable at a glance.

     DRAWN ON A CANVAS, NOT LOADED AS A FONT. Text in three.js normally wants a font file fetched from
     somewhere; a 2D canvas is already in the browser, renders the same monospace as the rest of the
     page, and costs one texture per name. Thirteen textures.

     A SPRITE, so it turns to face you as the camera moves and never ends up edge-on and unreadable.
     depthTest off so a name is never swallowed by the building it belongs to. */


  function nameTexture(text, swatch) {
    const pad = 26, fs = 30;
    const c = document.createElement('canvas');
    let g = c.getContext('2d');
    g.font = `bold ${fs}px ui-monospace, Menlo, monospace`;
    const tw = g.measureText(text).width;
    const dot = swatch ? 34 : 0;
    c.width = Math.ceil(tw + dot + pad * 2);
    c.height = fs + pad;
    g = c.getContext('2d');                          // resizing resets the context, so set up again
    g.font = `bold ${fs}px ui-monospace, Menlo, monospace`;
    g.textBaseline = 'middle';
    const r = 12, w = c.width, h = c.height;
    g.beginPath();
    g.moveTo(r, 0); g.lineTo(w - r, 0); g.quadraticCurveTo(w, 0, w, r);
    g.lineTo(w, h - r); g.quadraticCurveTo(w, h, w - r, h);
    g.lineTo(r, h); g.quadraticCurveTo(0, h, 0, h - r);
    g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0);
    g.closePath();
    g.fillStyle = '#fff8e0'; g.fill();
    g.lineWidth = 5; g.strokeStyle = '#3a2a12'; g.stroke();
    let x = pad;
    if (swatch) {
      g.beginPath(); g.arc(x + 11, h / 2, 11, 0, Math.PI * 2);
      g.fillStyle = swatch; g.fill();
      g.lineWidth = 3; g.strokeStyle = '#3a2a12'; g.stroke();
      x += dot;
    }
    g.fillStyle = '#3a2a12';
    g.fillText(text, x, h / 2 + 1);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    return { tex, ratio: c.width / c.height };
  }

  function signs() {
    LANDMARKS.filter(l => l.label).forEach(l => {
      /* WHERE THE NAME SITS. Over the middle of what it names — the centre of the footprint for a
         building, the real centre point for ground and posts, since a park's tiles average out to
         roughly where the park is. Height clears the roof so the name never sinks into it. */
      let x, z, top;
      if (l.tiles && l.tiles.length) {
        x = l.tiles.reduce((a, t) => a + t.x, 0) / l.tiles.length;
        z = l.tiles.reduce((a, t) => a + t.z, 0) / l.tiles.length;
        top = BIOME[l.tiles[0].type].top + l.height_m * SCALE * 1.7;
      } else {
        const t = (GRID[colOf(mx(l.lng))] || [])[rowOf(mz(l.lat))];
        if (!t) return;
        x = t.x; z = t.z;
        top = BIOME[t.type].top + (l.post ? TILE * 2.1 : TILE * 0.4);
      }
      const { tex, ratio } = nameTexture(l.label, l.roof || l.colour);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true, depthTest: false, depthWrite: false,
      }));
      const hgt = TILE * 1.5;
      sp.scale.set(hgt * ratio, hgt, 1);
      sp.position.set(x, top + hgt * 0.9, z);
      sp.renderOrder = 999;
      scene.add(sp);
    });
  }


  /* ---------- THE PATH, AND A MARK FOR EVERY PLACE --------------------------------------------------
     A DISC AND A RING ON EVERY NODE. The disc is the standing place and the ring is what makes it read
     as a stop rather than a paving slab — the same two shapes these maps have used since the first one.
     The start gets a pipe and the castle gets battlements, because those two are not just stops. */
  function route() {
    const dots = [], discs = [], rings = [], props = [];
    ROUTE.forEach(([c, r]) => {
      const t = GRID[c][r], y = BIOME[t.type].top;
      if (t.node) {
        const d = new THREE.CylinderGeometry(TILE * 0.72, TILE * 0.72, TILE * 0.14, 20);
        d.translate(t.x, y + TILE * 0.11, t.z);
        discs.push(d);
        const ring = new THREE.TorusGeometry(TILE * 0.84, TILE * 0.13, 8, 22);
        ring.rotateX(Math.PI / 2);
        ring.translate(t.x, y + TILE * 0.12, t.z);
        rings.push(ring);
        if (t.node.node === 'start') {
          const pipe = new THREE.CylinderGeometry(TILE * 0.49, TILE * 0.49, TILE * 1.1, 14);
          pipe.translate(t.x, y + TILE * 0.55, t.z);
          props.push({ g: pipe, c: 'pipe' });
          const lip = new THREE.CylinderGeometry(TILE * 0.6, TILE * 0.6, TILE * 0.29, 14);
          lip.translate(t.x, y + TILE * 1.18, t.z);
          props.push({ g: lip, c: 'pipe' });
        } else if (t.node.node === 'castle') {
          /* BATTLEMENTS ON THE CASTLE NODE. The table has said `castle` on the Premier Inn since the
             first version and nothing had ever drawn it — a marker written and never read, which is
             the same class of fault as `venue` was. Four merlons and a base: enough that the node
             reads as the destination rather than another stop. */
          const base = new THREE.BoxGeometry(TILE * 1.1, TILE * 0.5, TILE * 1.1);
          base.translate(t.x, y + TILE * 0.25, t.z);
          props.push({ g: base, c: 'castle' });
          for (let k = 0; k < 4; k++) {
            const m = new THREE.BoxGeometry(TILE * 0.22, TILE * 0.26, TILE * 0.22);
            m.translate(t.x + (k % 2 ? 1 : -1) * TILE * 0.38,
                        y + TILE * 0.63,
                        t.z + (k < 2 ? 1 : -1) * TILE * 0.38);
            props.push({ g: m, c: 'castle' });
          }
        }
      } else {
        /* THE PATH BETWEEN, as a line of small dots — enough to read as a route without competing with
           the marks that mean something. */
        const dot = new THREE.CylinderGeometry(TILE * 0.17, TILE * 0.17, TILE * 0.08, 10);
        dot.translate(t.x, y + TILE * 0.06, t.z);
        dots.push(dot);
      }
    });
    if (dots.length) add(merge(dots), 0xf0e2c0, true);
    if (discs.length) add(merge(discs), 0x2a2a2a, true);
    if (rings.length) add(merge(rings), 0xe8c34a, true);
    const pipes = props.filter(p => p.c === 'pipe').map(p => p.g);
    if (pipes.length) add(merge(pipes), 0x3fa64a, true);
    const cast = props.filter(p => p.c === 'castle').map(p => p.g);
    if (cast.length) add(merge(cast), 0xb04a3a, true);
  }

  function landmarks() {
    const byColour = {}, byRoof = {};
    LANDMARKS.filter(l => !l.ground && !l.post).forEach(l => {
      if (!l.tiles || !l.tiles.length) return;
      /* Upright a little, or a nine-metre shed at this scale is a mark on the floor. */
      const h = l.height_m * SCALE * 1.7;
      l.tiles.forEach(t => {
        /* ONE BLOCK PER TILE, filling it. They merge into a single mesh below, so the seams between
           them never show — what you see is the shape of the whole footprint, in tiles. */
        const g = new THREE.BoxGeometry(TILE, h, TILE);
        g.translate(t.x, BIOME[t.type].top + h / 2, t.z);
        (byColour[l.colour] = byColour[l.colour] || []).push(g);

        /* A cap a touch wider, so the top reads as a roof and throws a line of shadow down the side —
           which is what says the thing has a top at all.

           AND EVERY BUILDING'S ROOF IS ITS OWN COLOUR. One grey cap on everything meant the only thing
           telling two buildings apart from above was their outline, and from the low camera you mostly
           see roofs. The Premier Inn purple, the Sainsbury's orange — the roof is the fastest thing to
           read at a distance, and it costs one more key in the merge. */
        const cap = new THREE.BoxGeometry(TILE + TILE * 0.18, TILE * 0.2, TILE + TILE * 0.18);
        cap.translate(t.x, BIOME[t.type].top + h + TILE * 0.1, t.z);
        (byRoof[l.roof || '#8a8378'] = byRoof[l.roof || '#8a8378'] || []).push(cap);
      });
    });
    Object.keys(byColour).forEach(c => add(merge(byColour[c]), new THREE.Color(c), true));
    Object.keys(byRoof).forEach(c => add(merge(byRoof[c]), new THREE.Color(c), true));
  }

  /* ---------- THE PATH AND THE NODES ---------------------------------------------------------------
     Pale dots along the street, and a dark disc with a gold ring where a venue is. Dots rather than a
     line: a line reads as a road you travel along, dots read as a CONNECTION between places. */

  /* ---------- THE ORDINARY TOWN ---------------------------------------------------------------------
     Blocks on the residential, retail and industrial tiles; trees only in the park.

     INVENTED AT THE LEVEL OF A BIOME, not a building: the tile says "terraces here" and something
     terrace-shaped appears. That is not a claim about any particular house, which is why it is safe
     where inventing a street was not — a street is a claim about where you can GO. */
  /* HOW MANY PROPS, PER HECTARE RATHER THAN PER TILE. A fixed threshold means a finer tile puts four
     times as many houses on the same ground — which is what turned the board into a field of lumps
     when the tile last halved. Scaling by tile AREA holds the real density steady: about one block per
     1,070 square metres, whatever the tile size happens to be. */
  const PROP_RATE = Math.min(0.9, 0.24 * (TILE_M * TILE_M) / (16 * 16));
  function seeded(n) { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }
  function town() {
    const blocks = [], trunks = [], leaves = [];
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const t = GRID[c][r];
        if (t.owner) continue;
        const y = BIOME[t.type].top, s = seeded(c * 41 + r * 7 + 3);
        /* FEWER, AND SIZED IN TILES. At a 32m tile 'every resi tile above 0.22' was a few hundred
           blocks; at 16m the same threshold is nearly two thousand, and because the heights were
           absolute rather than a fraction of a tile they also doubled in apparent size when the tile
           halved. The board stopped being a town and became a field of identical lumps, and the
           landmarks — the things the whole table exists to show — were lost among them.
           A quarter of the tiles now, and every dimension a fraction of TILE, so this holds at any
           tile size rather than needing retuning each time. */
        if (t.type === 'resi' && s > 1 - PROP_RATE) {
          const h = TILE * (0.5 + s * 0.28);
          const g = new THREE.BoxGeometry(TILE * 0.62, h, TILE * (0.3 + s * 0.12));
          g.translate(t.x, y + h / 2, t.z + (seeded(c * 3 + r * 19) - 0.5) * TILE * 0.28);
          blocks.push({ g, k: 'resi' });
        } else if (t.type === 'retail' && s > 1 - PROP_RATE * 0.5) {
          const h = TILE * (0.4 + s * 0.2);
          const g = new THREE.BoxGeometry(TILE * 0.62, h, TILE * 0.5);
          g.translate(t.x, y + h / 2, t.z);
          blocks.push({ g, k: 'retail' });
        } else if (t.type === 'indust' && s > 1 - PROP_RATE * 0.6) {
          const h = TILE * (0.45 + s * 0.22);
          const g = new THREE.BoxGeometry(TILE * 0.7, h, TILE * 0.56);
          g.translate(t.x, y + h / 2, t.z);
          blocks.push({ g, k: 'indust' });
        } else if (t.type === 'park' && s > 0.5) {
          const tr = new THREE.CylinderGeometry(0.9, 1.2, 5, 6);
          tr.translate(t.x, y + 2.5, t.z);
          trunks.push(tr);
          const cone = new THREE.ConeGeometry(3.9, 8.5, 7);
          cone.translate(t.x, y + 8.8, t.z);
          leaves.push(cone);
        }
      }
    }
    const by = {};
    blocks.forEach(({ g, k }) => (by[k] = by[k] || []).push(g));
    const C = { resi: 0xd9c6a2, retail: 0xc4bcae, indust: 0xa8a49a };
    Object.keys(by).forEach(k => add(merge(by[k]), C[k], true));
    if (trunks.length) { add(merge(trunks), 0x7a4f26, true); add(merge(leaves), 0x3f8f27, true); }
  }

  function add(geo, colour, shadow) {
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: colour }));
    m.castShadow = !!shadow; m.receiveShadow = true;
    world.add(m);
    return m;
  }

  /* MERGING. FLATTENED FIRST, THEN MEASURED: a box, cone or extrusion is INDEXED — vertices plus a list
     of indices pointing at them — and `toNonIndexed` writes one vertex per index. Measuring the indexed
     count and filling with the non-indexed one gives a buffer a third too small, and the write past the
     end throws "offset is out of bounds", which names an offset and explains nothing. */
  function merge(geos) {
    const fl = geos.map(g => {
      const p = g.index ? g.toNonIndexed() : g;
      if (!p.attributes.normal) p.computeVertexNormals();
      return p;
    });
    let total = 0;
    fl.forEach(p => { total += p.attributes.position.count; });
    const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3);
    let at = 0;
    fl.forEach((p, i) => {
      pos.set(p.attributes.position.array, at * 3);
      nor.set(p.attributes.normal.array, at * 3);
      at += p.attributes.position.count;
      if (fl[i] !== geos[i]) geos[i].dispose();
      p.dispose();
    });
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    return out;
  }

  /* ==================================================================================================
     GOING
  ================================================================================================== */
  /* ==================================================================================================
     THE WALKER

     A small figure on a tile, who moves one tile at a time in four directions and takes the camera.

     HE USED TO MOVE BETWEEN NODES ONLY, and the note here argued that was the point — that a world map
     is a countable set of choices and free movement makes it a game level. That was a real argument
     and it is being overruled deliberately, not forgotten. What it did not survive was the board
     getting four times finer: at a sixteen metre tile there are 2,448 tiles and four places to stand,
     so the great majority of a carefully built town could only ever be looked at from the street.
     Wandle Park, the recreation ground, the Priory car park — all drawn, none reachable.

     SO HE WALKS THE BOARD. Four directions, one tile a press, and the places are still marked; they
     are somewhere to go rather than the only somewhere.

     WHAT HE CANNOT WALK THROUGH: water, and any tile a building stands on. Those are the two things
     that are solid. Ground — parks, car parks, the recreation ground — is walked on, which is the
     whole reason for painting it.
  ================================================================================================== */
  /* WHERE HE IS is a tile now, not an index into a list of four. c/r is the truth; x/z is where the
     model has got to while it eases toward it. */
  const WALK = { c: 0, r: 0, x: 0, z: 0, tx: 0, tz: 0, moving: false, bump: 0, bx: 0, bz: 0 };
  let walker = null;

  function makeWalker() {
    const g = new THREE.Group();
    const skin = 0xf0c9a0, cloth = 0x3f6fb5, boot = 0x6b4a2a;
    const put = (geo, colour, y) => {
      geo.translate(0, y, 0);
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: colour }));
      m.castShadow = true;
      g.add(m);
    };
    /* CHUNKY AND FEW PARTS. At the size he is on screen a detailed figure is a smudge; what reads is a
       silhouette — round head, square body, two legs — which is exactly how these have always been drawn
       and why they survive being twenty pixels tall. */
    put(new THREE.CylinderGeometry(3.4, 3.4, 7, 10), cloth, 7.5);       // body
    put(new THREE.SphereGeometry(3.6, 12, 10), skin, 14);               // head
    put(new THREE.CylinderGeometry(4.2, 4.2, 1.6, 12), 0xd9433a, 16.6); // cap
    put(new THREE.BoxGeometry(2.2, 4, 2.2), boot, 2);                   // legs, as one block
    return g;
  }

  /* CAN HE STAND HERE? Off the board, in the river, or on a tile a building occupies — those are the
     three noes. Everything else, including every kind of painted ground, is walkable. */
  function walkable(c, r) {
    const g = (GRID[c] || [])[r];
    if (!g) return false;
    if (g.type === 'water') return false;
    if (g.owner) return false;
    return true;
  }

  /* WHAT HE IS STANDING ON, OR NEXT TO. Ground is underfoot, so the tile knows it. A building is never
     underfoot — you cannot stand inside Sainsbury's — so the plate reads the eight tiles around him
     and names the building he is against. Standing in open street it says nothing rather than lying
     about the nearest thing, and an empty plate is hidden rather than left blank. */
  /* THE PLATE IS BUILT, NOT FOUND. It was a `<div id="n">` in overworld.html; there is no such
     page any more, and an id that global would collide the moment anything else wanted it. */
    const nameEl = document.createElement('div');
    nameEl.className = 'ow-name';
    mount.appendChild(nameEl);
  function placeAt(c, r) {
    const g = (GRID[c] || [])[r];
    if (!g) return null;
    if (g.ground) return g.ground.name;
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const n = (GRID[c + dc] || [])[r + dr];
        if (n && n.owner) return n.owner.name;
      }
    }
    return null;
  }
  function showName() {
    if (!nameEl) return;
    const name = placeAt(WALK.c, WALK.r);
    nameEl.textContent = name || '';
    nameEl.classList.toggle('off', !name);
    nameEl.classList.toggle('go', WALK.moving);
  }

  /* ONE TILE PER PRESS, EXCEPT ALONG THE PATH.

     THE PATH IS A FAST LANE AND THAT IS WHAT A PATH IS FOR. Slots are three hundred metres wide because
     the widest thing on the board is a 240-metre car park, which at an eight-metre tile is thirty-eight
     presses of empty terrace between one landmark and the next. Stepping that tile by tile is not
     exploring, it is commuting.

     SO ON THE STREET, LEFT AND RIGHT GO TO THE NEXT NODE — one press, one place, which is the world-map
     move and the reason the marks are there. Step off the street and it is one tile at a time again,
     because that is when you are actually looking at something. The two modes are told apart by the row
     he is standing on, so there is nothing to learn and no button.

     AND A REFUSED PRESS HAS TO SHOW. Walking into the side of the bus garage did exactly nothing, which
     is indistinguishable from the controls not working, and that is how it was read. He leans into it
     and comes back instead. */
  function nextNode(from, dir) {
    for (let c = from + dir; c > 0 && c < COLS - 1; c += dir) {
      if (GRID[c][STREET_ROW].node) return c;
    }
    return null;
  }
  function stepBy(dc, dr) {
    if (WALK.moving) return;
    if (dr === 0 && WALK.r === STREET_ROW) {
      const n = nextNode(WALK.c, dc);
      if (n === null) { WALK.bx = dc; WALK.bz = 0; WALK.bump = 1; return; }
      WALK.c = n;
      const t = GRID[n][STREET_ROW];
      WALK.tx = t.x; WALK.tz = t.z; WALK.moving = true;
      showName();
      return;
    }
    const c = WALK.c + dc, r = WALK.r + dr;
    if (!walkable(c, r)) { WALK.bx = dc; WALK.bz = dr; WALK.bump = 1; return; }
    WALK.c = c; WALK.r = r;
    const t = GRID[c][r];
    WALK.tx = t.x; WALK.tz = t.z;
    WALK.moving = true;
    showName();
  }

  /* Eased toward the next tile, and he is only "there" when he is close enough that another press
     would not look like an interruption. */
  function moveWalker() {
    if (!walker) return;
    if (WALK.moving) {
      WALK.x += (WALK.tx - WALK.x) * 0.14;
      WALK.z += (WALK.tz - WALK.z) * 0.14;
      if (Math.hypot(WALK.tx - WALK.x, WALK.tz - WALK.z) < 0.6) {
        WALK.x = WALK.tx; WALK.z = WALK.tz; WALK.moving = false;
        showName();                                   // arrived — the plate comes up to full
      }
      /* A HOP RATHER THAN A GLIDE. Sliding along the ground reads as a piece being dragged; a bounce
         reads as somebody walking, and it costs one sine. Tied to STEP so it stays one hop per tile
         however fine the tile gets. */
      const left = Math.hypot(WALK.tx - WALK.x, WALK.tz - WALK.z);
      walker.position.y = Math.abs(Math.sin(left / STEP * Math.PI)) * TILE * 0.22;
    } else {
      walker.position.y = 0;
    }
    /* THE LEAN. A fifth of a tile toward whatever refused him, decaying over about a dozen frames.
       Enough to read as "he tried", not enough to look like a step. */
    let lx = 0, lz = 0;
    if (WALK.bump > 0) {
      WALK.bump -= 0.09;
      if (WALK.bump < 0) WALK.bump = 0;
      const lean = Math.sin(WALK.bump * Math.PI) * TILE * 0.2;
      lx = WALK.bx * lean; lz = WALK.bz * lean;
    }
    walker.position.x = WALK.x + lx;
    walker.position.z = WALK.z + lz;
  }

  on_(window, 'keydown', e => {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'd') { stepBy(1, 0);  e.preventDefault(); }
    if (k === 'ArrowLeft'  || k === 'a') { stepBy(-1, 0); e.preventDefault(); }
    /* UP THE SCREEN IS AWAY FROM THE CAMERA, which is a decreasing row — the camera sits south of him
       looking north, so a smaller row number is further up the screen. */
    if (k === 'ArrowUp'    || k === 'w') { stepBy(0, -1); e.preventDefault(); }
    if (k === 'ArrowDown'  || k === 's') { stepBy(0, 1);  e.preventDefault(); }
  });
  /* AND A TAP, because most of the people who will ever see this are holding a phone and there is no
     keyboard on it. FOUR WEDGES FROM THE MIDDLE OF THE SCREEN rather than four corners: whichever of
     left/right/up/down your thumb landed furthest towards is the way he goes, so there is no dead
     zone and no need to hit a target. */
  on_(renderer.domElement, 'pointerdown', e => {
    /* MEASURED FROM THE MIDDLE OF THE BOARD, not the middle of the window. The board is a card in
       a screen now rather than the whole page, so a tap in the lower half of the PHONE can easily be
       the upper half of the BOARD — and the walker would go the opposite way to the one your thumb
       meant. */
    const b = renderer.domElement.getBoundingClientRect();
    const dx = e.clientX - (b.left + b.width / 2);
    const dy = e.clientY - (b.top + b.height / 2);
    if (Math.abs(dx) > Math.abs(dy)) stepBy(dx > 0 ? 1 : -1, 0);
    else stepBy(0, dy > 0 ? 1 : -1);
  });

  let raf = 0;
  try {
    paintGround();
    tiles();
    town();
    route();
    landmarks();
    posts();
    signs();
    place();
    walker = makeWalker();
    world.add(walker);
    /* HE STARTS ON THE FIRST STOP — the bus garage, which is the row marked `start`. The stops are
       still where the map begins even though they no longer bound where it goes. */
    /* HE STARTS ON THE NODE MARKED `start`, which is the bus garage, and only falls back to the first
       stop if no row claims it. Sorting is by longitude, so "first stop" is whatever happens to be
       furthest west — currently Deen City Farm — and starting him there while the green pipe stands a
       mile east is the board contradicting itself. */
    const first = LANDMARKS.find(l => l.node === 'start') || STOPS[0] || NODES[0];
    WALK.c = first && first.nodeCol != null ? first.nodeCol : Math.floor(COLS / 2);
    WALK.r = STREET_ROW;
    const start = GRID[WALK.c] && GRID[WALK.c][WALK.r];
    WALK.x = WALK.tx = start ? start.x : 0;
    WALK.z = WALK.tz = start ? start.z : 0;
    moveWalker();
    showName();                                       // the first place, before a key is ever pressed
    followCam(true);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      moveWalker();
      followCam(false);
      renderer.render(scene, camera);
    };
    tick();
  } catch (err) {
    /* SAID ON THE SCREEN. A 3D page that fails after one frame looks exactly like one that is working. */
    const d = document.createElement('div'); d.className = 'ow-say';
    d.textContent = 'Could not build the board.\n' + String(err.message || err);
    mount.appendChild(d);
    console.error(err);
  }

  on_(window, 'resize', place);
  addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    world.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
    });
    renderer.dispose();
  });

}