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
    /* A TERM THE SERVICE ANSWERED WITH NOTHING is remembered as nothing, so a deck that repeats
       does not ask again for an answer already given.
       A REQUEST THAT FAILED IS NOT AN ANSWER. This used to remember those the same way, and one
       hiccup — a dropped connection, a rate limit, a fetch fired while the page was still loading
       — blanked that fact for the rest of the tab with no way to retry but a reload. It matters
       more now than it did: pages are built five ahead, so these go out in bursts as you swipe
       rather than one at a time, and a burst is exactly when a service says no. Left unknown, it
       is asked again the next time the card comes round. */
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
  /* ---------- THE SHEET NO LONGER BLOCKS EVERYTHING, ONLY THE GRID ------------------------------
     THE GRID STAYS BLOCKED, and must: the sheet is over it and moving a screen nobody can see is
     how you close a card onto a different tab than the one you opened it from. What changes is that
     a sheet WITH neighbours now answers a vertical flick itself, so reading three past papers is
     three swipes rather than close, swipe, open, close, swipe, open.

     STILL FALSE EITHER WAY, because the grid is never the thing that moves here — the flick is
     picked up by the sheet's own watcher below. This returns false so the grid ignores the gesture
     exactly as before; the sheet takes it instead. */
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
   THE BOARD — TILES, THE WAY POLYTOPIA DOES IT.

   A grid of square slabs. Each one is a terrain — grass, water, park, road, or a plot with a
   building standing on it — and the buildings are chunky blocks, not surveyed outlines.

   ---------------------------------------------------------------------------------------------
   WHY THE SURVEYED POLYGONS WENT, AFTER ALL THAT WORK ON THEM.

   The version before this extruded the real footprints: Sainsbury's as its actual thirty-seven
   vertices, ear-clipped and lit. It was accurate and it looked nothing like Polytopia, because
   Polytopia is not accurate — it is deliberately, aggressively simple. A building there is a box
   with a roof. A forest is a cone on a tile. The whole style is the REFUSAL of detail, and a
   thirty-seven-vertex supermarket is exactly the kind of detail it refuses.

   SO THE OUTLINES STILL DO THE WORK, just a different job: they decide WHICH TILES a landmark
   covers. The sheet's vertices are what makes the bus garage nine tiles long and Britannia Point
   one tile square — the shape informs the footprint on the grid, and the grid is what gets drawn.
   Nothing measured is wasted; it is used at the resolution the style wants.

   ---------------------------------------------------------------------------------------------
   WHAT MAKES A TILE READ AS A TILE.

   THICKNESS. A flat quad is a coloured rectangle; a slab with a visible side is a piece of the
   world. Every tile is drawn as a top face and two sides — the two that face the camera — and the
   sides are a darker shade of the top. That one thing is most of the look.

   A GAP BETWEEN THEM, so the grid is visible without a single line being drawn. Ninety per cent of
   the tile size, which leaves a dark seam that reads as edges rather than as gaps.
================================================================================================== */

const OW_WORLD = 'Merton';

const OW = {
  tile: 9,            // metres a side. Small enough for a building to span several
  lift: 2.6,          // how thick a slab is
  gap: 0.9,           // how much of the tile the top face fills — the rest is the seam
  /* THE CAMERA. Looking DOWN at the board, which is the Polytopia angle and the thing the last
     version had wrong: it looked along the street, so the grid was edge-on and invisible. */
  /* ---------- WHERE THE BOARD SITS IN THE FRAME --------------------------------------------------
     THE CAMERA AIMS ABOVE THE GROUND, not at it. Aiming at `look: 0` put the street through the
     middle of the picture with as much empty sky above as board below — and the sky is the half
     with nothing in it.

     RAISING WHAT IT LOOKS AT pushes the whole board DOWN the frame, which leaves the empty space
     under it rather than over it. That is the right way round: a board with room beneath reads as
     standing on something, and the labels have somewhere to go that is not on top of a roof. */
  eyeH: 66,
  back: 70,
  look: 26,
  fov: 42,
  speed: 26,
  sun: [-0.35, 0.86, 0.36],
};

/* THE PALETTE. Bright and flat, because that is the style — the survey colours in the sheet are
   muted greys and browns for drawing a map, and a map is not what this is. The sheet's `kind`
   column already says what each thing IS, so it picks the colour and nobody has to re-enter one. */
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

/* `owInside` — POINT IN POLYGON — STOOD HERE. It decided which tiles a landmark's surveyed outline
   covered, back when the board was laid out geographically. A plot is a run of tiles now, chosen by
   how much room the thing needs rather than by where it really is, so there is nothing to test a
   point against. Deleted rather than kept for later: `check-dead` found it the moment it stopped
   being called, which is the whole reason that checker exists. */


/* ---------- THE WORLD, IN METRES, ON A GRID -------------------------------------------------------
   Degrees to metres, then metres to tiles. The grid is the unit everything below works in. */
/* ---------- THE BOARD IS A PATH, NOT A MAP --------------------------------------------------------
   NOTHING IS TO SCALE AND THAT IS THE POINT. The version before this laid every landmark at its real
   position, which is honest and produces exactly what a real town produces: three buildings bunched
   at one end, four hundred metres of nothing, then two more. A map has to do that. A BOARD does not.

   SO EACH LANDMARK GETS A PLOT OF ITS OWN, in order along the path, and the next one starts where
   the last finishes. A bus garage takes four tiles because a bus garage needs four to look like one;
   a house takes one. The gap between them is the same everywhere, because the gap is a step along a
   path rather than a distance.

   THE ORDER IS STILL THE REAL ONE — west to east by longitude — so walking the board walks the town
   in the order you would actually meet it. Position decides the SEQUENCE and nothing else, which is
   the one thing about geography worth keeping. */
/* ---------- METRES TO TILES, ONCE, FOR EVERYTHING ------------------------------------------------
   THE ONE FORMULA THE BOARD RUNS ON. Every measurement that has to become board space goes through
   here, so adding a landmark is adding a surveyed row and nothing else — no judgement call about how
   many tiles it "should" be, and no drift between one made in March and one made in August.

       tiles = 0.55 × √metres,  held between 2 and 8

   WHY A SQUARE ROOT AND NOT A DIVISION. True scale was tried and put back — at ten metres a tile the
   bus garage is twenty-two tiles and the board is thirty screens of walking. But a flat cap is worse:
   clamp everything to eight and Sainsbury's, the retail park and the bus garage all come out the same
   size, which is a board where nothing is bigger than anything else. A root keeps the ORDER and
   compresses the RANGE — 215m is still the biggest thing on the board, but it is twice the tower
   rather than five times it. That is what a game map does to a real place, and doing it with one
   exponent means it does the same thing to every landmark.

   THE FLOOR IS TWO, because a one-tile plot cannot show a shape — a building on it is a cube and
   every small site would look identical. The ceiling is eight, which is the deepest the camera can
   see the back row of at this angle.

   BOTH SIDES GO THROUGH IT SEPARATELY, so proportion survives: 215×60 becomes 8×4 and stays long,
   147×153 becomes 7×7 and stays square. Nothing is measured in tiles and then adjusted. */
const OW_TILE_K = 0.55;
const OW_TILE_P = 0.5;
/* EIGHT IS THE CEILING FOR A BUILDING AND FOURTEEN FOR OPEN GROUND, and the difference is what the
   ceiling is FOR. Depth is capped because the camera has to see the back row past the front one —
   that is a fact about the angle and applies to everything. Width is capped because a building
   forty tiles long is a wall you walk beside for a minute; but a PARK forty tiles long is a park,
   and walking through one is not the same as walking past a shed.
   IT IS KEYED OFF `kind`, WHICH THE SHEET ALREADY SAYS. Still no judgement call per landmark: a
   river and a rec ground get the wider ceiling because of what they are, not because somebody
   decided they were special. */
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

  /* HOW MANY TILES EACH ONE NEEDS. From the sheet where somebody has said, and from the form where
     they have not — a shed is long by nature and a house is not, so the default follows the shape
     rather than being one number for everything. */
  const WIDE = { shed: 4, hall: 3, tower: 1, house: 1, dome: 2, slab: 2 };
  const items = [];
  let cx = 2;
  order.forEach(l => {
    const form = norm(l.form) || (Number(l.height) >= 30 ? 'tower'
      : Number(l.height) > 0 ? 'slab' : 'park');
    /* HOW WIDE THE PLOT IS. The sheet's `plots` where somebody has said, the form's own habit where
       they have not — AND at least as wide as the parts standing on it, because a part placed at
       x=4 on a two-tile plot would otherwise hang over the neighbour. The parts decide the minimum
       and nobody has to keep two numbers in step by hand. */
    const need = (l.parts || []).reduce((m, p) => Math.max(m, (Number(p.x)||0) + (Number(p.w)||1)), 0);
    /* THE WIDTH, FROM `plots` — how much room this landmark needs to look like itself, not how big
       it really is.

       TRUE SCALE WAS TRIED AND PUT BACK. Ten metres a tile made every landmark honestly sized and
       the board two hundred tiles long — thirty screens of walking, with the farm a speck and the
       rec ground a field you cross in silence. Accurate, and not a board: the whole point of one is
       that each thing gets the room it needs and the next one starts. */
    /* ---------- THE PLOT KEEPS THE SITE'S PROPORTIONS, WHATEVER ANGLE IT IS TURNED TO -------------
       `plots` MEANT WIDTH, AND THAT BROKE EVERY ROTATION. Britannia Point is 71 metres wide and
       106 deep; six tiles across fitted it, and turning it a quarter made it 106 wide and 71 deep
       — still squeezed into six. Everything compressed sideways: the T flattened into a line, and
       the ten-metre gap between the car park and the building fell below one tile and closed.

       IT NOW MEANS THE LONGEST SIDE, and the other one follows from the site's own shape. Turn the
       site and the two swap, because the box they are measured from has swapped — so the number of
       metres a tile stands for never changes, and neither does the shape. A T is a T at every
       bearing, and a gap that is a tile wide stays a tile wide.

       THAT IS THE GENERAL ANSWER to "how do I stop this happening": nothing is measured in tiles
       and then rotated. The rotation happens first, and everything is measured after — so there is
       no number left over from before the turn that could disagree with it. */
    /* MEASURED ONCE, IN THE SQUARED FRAME, BEFORE ANY TURN. `plots` is the longest side and the
       other follows the site's own proportion — and because this happens before the bearing is
       applied, the numbers here describe the site itself rather than a particular view of it. */
    const sb0 = owSiteBox(l);
    /* ---------- HOW BIG IT IS ON THE BOARD, WORKED OUT RATHER THAN DECIDED -------------------------
       `owTiles` IS THE FORMULA AND IT IS THE POINT OF THIS. Every landmark used to need a person to
       look at it and type a `plots` number, so a board of forty was forty judgement calls and no two
       of them made on the same day agreed. The metres are already surveyed — `width_m` and `depth_m`
       are on the tab for every row — so the number of tiles is not a decision, it is a conversion,
       and a conversion belongs in one function that every landmark goes through.

       THE SHEET STILL WINS if `plots` is filled in. It is an override for the one site whose real
       proportions are not what you want on the board, not the place the number comes from. */
    /* THE SURVEYED METRES, under the names that mean metres. `l.depth` is the hand-set PLOT depth in
       tiles and always was — the two shared a key in the payload until today, and the measurement
       lost. Reading `depthM` is what makes the conversion above run on real numbers. */
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
    /* AND THE TURN, IN QUARTERS. Anything else would need the polygon re-sampled, which is the
       fault this whole arrangement exists to prevent — so a bearing is rounded to the nearest
       quarter and nobody loses anything, because 0, 90, 180 and 270 are the only useful answers. */
    const quarters = ((Math.round((Number(l.bearing) || 0) / 90) % 4) + 4) % 4;
    if (quarters === 1 || quarters === 3) { const t = w; w = depth; depth = t; }
    /* HOW DEEP THE PLOT IS. From the sheet where somebody has said, and otherwise from the SITE'S
       OWN PROPORTION — a site half as wide as it is deep gets a plot half as wide as it is deep, so
       a long thin building stays long and thin. Capped, because a board four tiles deep is a board
       you look down on rather than along. */
    /* ---------- HOW DEEP THE PLOT IS, AND WHY THE CAP WAS WRONG ---------------------------------
       IT WAS CAPPED AT FOUR, and Britannia Point is 71 metres wide by 106 deep. Squeezing a site
       half again as deep as it is wide into a plot the same shape as a square one distorts every
       part on it — and it is what made the northern block, which is a genuinely different size and
       position from the southern one, land on no tile at all.

       THE PROPORTION IS THE POINT. A plot as many times deeper than it is wide as the real site is:
       so a T stays a T, and a long site stays long. Eight is the new ceiling, which is deep enough
       for anything in Colliers Wood and shallow enough that the back row is still visible past the
       front one at this camera angle. */
    /* THE SHEET STILL OVERRIDES the depth, for a site whose proportions are not what you want on
       the board — but it is no longer where the depth comes from, because a hand-set depth is a
       number that cannot survive a rotation either. */
    if (Number(l.depth)) depth = Math.max(1, Math.min(10, Number(l.depth)));
    depth = Math.max(1, Math.min(10, depth));
    items.push({ l, form, x0: cx, w, depth, quarters, mid: cx + w / 2 });
    /* ONE EMPTY TILE BETWEEN PLOTS. Without it two buildings share an edge and read as one long
       building; with more than one the board becomes a row of islands. */
    cx += w + 1;
  });

  /* ROWS ARE COUNTED BACK FROM THE PATH, and that is the fix for the landmarks being on the wrong
     side. The camera sits at POSITIVE z looking toward negative — so a bigger z is nearer the
     viewer and a smaller one is further away. Plots were at `+z`, which put every building in FRONT
     of its node, between the walker and the path.
     Row 0 is the path. Row 1 and up go BACKWARDS, away from the camera, which is where a landmark
     behind its node belongs. One rule, and the sign cannot be got wrong by accident again. */
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
  /* ---------- EVERY SIDE, NOT THREE OF THEM ------------------------------------------------------
     THIS DREW TOP, FRONT AND RIGHT ONLY — and that was a bug, not an optimisation. Culling the
     other three is right for a camera that never moves, and this camera walks the whole length of
     the street: anything to the LEFT of where you are standing shows you its left face, and the
     left face was never built. So half the town had a wall missing, and which half changed as you
     walked, which is exactly what a glitch looks like.

     ALL FOUR SIDES NOW. The bottom is still skipped — nothing on this board is ever seen from
     underneath, and that one is safe because the ground is under every box by construction. Four
     more triangles a box; the depth buffer was already doing the hiding. */
  const box = (x0, x1, y0, y1, z0, z1, c) => {
    tri([x0,y1,z0],[x1,y1,z0],[x1,y1,z1], c, 1);        // the roof, full light
    tri([x0,y1,z0],[x1,y1,z1],[x0,y1,z1], c, 1);
    tri([x0,y0,z1],[x1,y0,z1],[x1,y1,z1], c, 0.74);     // the front, toward the walker
    tri([x0,y0,z1],[x1,y1,z1],[x0,y1,z1], c, 0.74);
    tri([x1,y0,z0],[x1,y0,z1],[x1,y1,z1], c, 0.56);     // the right
    tri([x1,y0,z0],[x1,y1,z1],[x1,y1,z0], c, 0.56);
    /* THE TWO THAT WERE MISSING. The left is lit like the right — a flat-shaded box with three
       shades reads as solid, and giving the fourth side a fourth shade would make it read as a
       different building. The back is darkest, because it faces away from the sun. */
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

  /* ---------- THE GROUND ---------------------------------------------------------------------------
     Every tile is grass, the row the walker uses is path, and the tiles a landmark stands on are its
     own plot. No point-in-polygon any more: a plot is a run of tiles, which is what makes this a
     board rather than a survey. */
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

  /* ---------- WHAT STANDS ON EACH PLOT ---------------------------------------------------------
     A LANDMARK IS NOT ONE THING. Priory Retail Park is a store AND a car park; a farm is a barn and
     paddocks and a fence. So the sheet holds PARTS — a row each, placed in tiles on the landmark's
     own plot — and this draws whatever it is given.

     NO PARTS IS THE ORDINARY CASE and it draws exactly what it drew before: one block, from the
     landmark's own `form`. Detail is for the landmarks worth the trouble, and nothing has to be
     filled in for the rest. */
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

  /* ---------- THE NODES ON THE PATH ----------------------------------------------------------------
     One per landmark, in front of its plot — the Mario board's whole grammar. A venue is a bigger,
     gold one, because a venue is a place you can actually be taught. */
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

/* ---------- HEIGHT IS TO SCALE, AND IT WAS NOT --------------------------------------------------
   IT WAS `sqrt(height) * 3.4`, WHICH IS A LIE ABOUT EVERY BUILDING. The square root pulls the range
   together so a tower and a shed both fit comfortably on one board — and the price is that Britannia
   Point, six and a half times the height of the bus garage, drew two and a half times its height.
   Everything looked like the same sort of building because everything nearly was.

   LINEAR. A metre is a metre, so the tower really is four times the northern block beside it and
   six times the garage down the road. That is the thing you actually notice on a board — a landmark
   is a landmark because it is taller than what is round it, and flattening the range takes away the
   only reason to look at it.

   THE FACTOR IS 0.62, chosen so the tallest thing here — 59.5m — draws about 37 units, which stands
   clear against a 4-tile-deep plot without leaving the top of the frame. A taller town would want a
   smaller number, and that is one number in one place. */
const OW_HEIGHT = 0.62;
const owHeight = m => Math.max(3.5, (Number(m) || 0) * OW_HEIGHT);

/* ---------- A REAL SHAPE, ONTO THIS LANDMARK'S TILES ------------------------------------------------
   THE BOUNDING BOX IS WHY EVERY BUILDING LOOKED THE SAME. A part drawn from `w` and `d` is a
   rectangle, so Tandem Centre — a C of shops round a car park — and Priory Retail Park came out as
   the same block, and the plan somebody walked round was thrown away at the last step.

   SO THE POLYGON IS RASTERISED. The landmark's whole site is measured, mapped onto its own plot of
   tiles, and every tile whose centre falls inside a part's outline belongs to that part. A C stays a
   C because the tiles in the middle are simply not in it.

   SCALED TO THE SITE, NOT TO THE BOARD. Within a landmark the shape is true — the car park really
   does wrap round the building in the proportion it does in life. Between landmarks nothing is to
   scale, because a board where Tandem Centre is forty times a corner shop is a board you cannot
   read. True shape, chosen size: the two decisions kept apart.

   `siteBox` IS COMPUTED FROM EVERY PART TOGETHER, which is the thing that makes them line up. Each
   part measured against its own extent would centre all of them on the same spot and the C would
   close.
--------------------------------------------------------------------------------------------- */
/* THE ANGLE THAT PUTS A SITE SQUARE ON THE GRID.
   The longest edge of the outline decides it — for a building that is the long wall, and a long
   wall running along the tiles is what makes the footprint a clean block rather than a staircase.

   TO THE NEAREST NINETY IS THE SAME ANSWER. Turning a rectangle by 105 degrees and by 15 gives the
   same tiling, so the smallest turn is taken: fifteen degrees rather than a hundred and five, which
   also keeps the site pointing roughly the way it really does. */
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

  /* ---------- WHICH WAY ROUND IT STANDS ----------------------------------------------------------
     `bearing` HAS BEEN ON THE LANDMARKS TAB SINCE IT WAS MADE and nothing has ever read it. It is
     the answer to "Priory is facing the wrong way": a plan is surveyed north-up, and the side you
     want to be looking at is whichever side you would actually walk up to.

     WHAT THE NUMBER MEANS. Degrees to turn the site clockwise before it is drawn:
       0    as surveyed — you see its south side, which is right for anything on a north-side street
       90   turned a quarter — you see its EAST side, which is Priory: standing east, looking west
       180  you see its north side
       270  you see its west side

     THE WHOLE SITE TURNS TOGETHER, parts and all, about its own centre — so the car park stays on
     the same side of the building it is really on. Rotating each part separately would spin them
     into each other, which is the mistake that makes this look like a bug rather than a view. */
  /* ---------- SQUARE TO THE GRID FIRST, WHATEVER ANGLE IT WAS BUILT AT --------------------------
     THIS IS WHY BRITANNIA POINT CAME OUT L-SHAPED. Its blocks stand at 105 degrees — fifteen off
     the compass — and a rectangle at fifteen degrees rasterised onto a square grid is a STAIRCASE:
     two tiles, then one across, then two more. At a glance that is an L, and no amount of extra
     resolution fixes it. Finer tiles make a smoother staircase, which is why cutting them into
     sixteenths did not help either.

     SO THE SITE IS TURNED SQUARE BEFORE IT IS RASTERISED. The longest edge of the biggest part is
     found, and the whole site rotated until that edge runs along the grid. A rectangle then covers
     a clean block of tiles, because it is finally parallel to them.

     AND IT IS AUTOMATIC. Nobody should have to protract a satellite photograph to fill in a
     spreadsheet — the corners already say what angle the building stands at, so the number is
     derivable and deriving it is the whole job. `bearing` still overrides, for the cases where the
     view matters more than the tiling: a quarter turn on top of square is still square. */
  /* ---------- ONLY THE SQUARING HAPPENS HERE, NOT THE TURN ---------------------------------------
     THE BEARING USED TO BE ADDED IN AT THIS POINT, and that is why turning a site changed its
     shape: the polygon was rotated and then re-sampled against the tile grid, and re-sampling a
     shape at a different angle gives a different set of tiles. The T flattened, gaps closed, and no
     amount of care about plot sizes could fix it, because the shape was being recomputed each time.

     SO THE SITE IS ONLY SQUARED HERE — turned until its own right angles line up with the grid,
     which is the thing that has to happen before any tile is decided. The BEARING is applied
     afterwards, to the FINISHED TILES, by turning the grid a quarter at a time.

     ROTATING A GRID OF TILES CANNOT CHANGE WHAT IS ON IT. Four tiles in an L are four tiles in an L
     whichever way up you hold them — it is a transposition, not a measurement — so the shape is
     guaranteed identical at every bearing rather than merely observed to be. */
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
/* HOW MANY PIECES A TILE IS CUT INTO for the purpose of shape.

   IT WAS FOUR, AND FOUR WAS WRONG. Sixteen times the resolution meant a building followed its real
   outline closely — tapered ends, notches, a cut corner — and that is precisely what a board is not
   for. The whole style is the REFUSAL of detail: a chunky shape you read at a glance beats an
   accurate one you have to look at. At four, Priory stopped being a shape and became a survey.

   ONE. A part covers whole tiles, which is what makes it read as a piece of a board rather than as
   a plan. The shape still comes from the real corners — a C is still a C, because the tiles in the
   middle are still not in it — it is simply rounded to the grid, which is the point of a grid. */
/* ---------- THE GRID IS AS FINE AS THE SMALLEST THING ON THE SITE --------------------------------
   A FIXED NUMBER OF CELLS PER TILE WAS ALWAYS WRONG FOR SOMETHING. One meant a bridge disappeared;
   four meant a supermarket became a survey of itself. The number was never the problem — using ONE
   number for a 250-metre site and an 8-metre bridge was.

   SO IT IS DERIVED, PER SITE, from the smallest part standing on it: fine enough that the smallest
   part is about three cells across, and no finer. Sainsbury's has a footbridge on it, so its cells
   come out about three metres; Britannia Point has nothing smaller than a 13-metre wall, so its
   cells are coarser and its blocks stay chunky.

   AND A FINE GRID DOES NOT OVER-RESOLVE A BIG BUILDING. A 168-metre store at three-metre cells is
   still a big solid block — it reads chunky because it IS chunky, not because the grid was coarse.
   The only thing extra resolution buys on a large simple shape is a less jagged edge, which is the
   one kind of detail that never hurts.

   `MIN_CELLS` IS WHY THREE. Two cells across is a line with a width; three is the fewest that can
   have a middle, and a thing with no middle cannot read as a shape. */
const OW_MIN_CELLS = 3;
/* AND A CEILING, because one traced doorstep should not drag a whole site to a four-hundred-cell
   grid. Anything below `OW_OBJECT_FRAC` of the site's long side is not rasterised at all — see
   `owPart`, which drops a standard object on one cell instead. Its shape carries nothing; its
   presence carries everything. */
const OW_MAX_CELLS = 120;
const OW_OBJECT_FRAC = 0.05;

/* TURNING A FINISHED GRID OF TILES, a quarter at a time.

   THIS IS THE WHOLE POINT OF THE ARRANGEMENT. Rotating a polygon and re-sampling it gives a
   different set of tiles every time — that is what flattened the T and closed the gap. Rotating the
   TILES is a relabelling: the same cells, at different coordinates. Four in an L are four in an L
   whichever way up the grid is held.

   THE PLOT'S OWN WIDTH AND DEPTH SWAP on an odd quarter, which is why they were swapped when the
   plot was measured — the two have to agree or a tile lands outside its own plot. */
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

/* ---------- ONE PART OF A LANDMARK -----------------------------------------------------------------
   A rectangle of the plot with a nature. Everything the board can put on the ground goes through
   here, so a car park and a barn are the same call with different rows behind them.

   THE PLOT'S FRONT-LEFT CORNER IS THE ORIGIN. `x` and `z` in the sheet are tiles from there, which
   is a thing somebody can count on the screen while filling the row in — a metre offset would be a
   number nobody can check.
--------------------------------------------------------------------------------------------- */
function owPart(it, pt, draw) {
  const { box, pitch, rgb, T, site } = draw;

  /* ---------- A PART WITH REAL CORNERS IS DRAWN TILE BY TILE ------------------------------------
     AND THAT IS THE WHOLE DIFFERENCE. One box over the bounding rectangle turns a C-shaped shopping
     centre into a block — which is exactly what made Tandem Centre and Priory indistinguishable. A
     box per covered tile keeps the hole in the middle, because the tiles in the middle were never
     covered.

     ADJACENT TILES MERGE ON SCREEN. Two boxes sharing a face read as one building, so a run of six
     tiles is a long shed and an L of them is an L — no logic needed for the shape beyond knowing
     which tiles are in. */
  const tiles = owTilesOf(it, pt, site);
  if (tiles.length) {
    tiles.forEach(t => owPartTile(it, pt, t, draw));
    return;
  }

  /* ---------- A PART THAT COVERS NO TILES AT ALL --------------------------------------------------
     IT HAPPENS, AND IT HAPPENS SILENTLY. A small building on a large plot can fall entirely between
     tile centres — Britannia Point's northern block does exactly that at four plots wide and not at
     three. Nothing throws; the part is simply not drawn, and the only way to notice is to know it
     should be there.

     SO IT IS DRAWN ANYWAY, one tile at the middle of where it really is. A building in roughly the
     right place is a fault somebody can see and fix by widening the plot; a building that is not
     there at all is a fault that gets filed as "the board looks wrong" a month later. */
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

  /* ---------- AND A BUILDING ------------------------------------------------------------------
     The same six silhouettes as before, now per part rather than per landmark — so a retail park
     can be a shed AND a car park, which is the whole point of this. */
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

  /* ---------- THE NAMES ARE HTML, OVER THE CANVAS -------------------------------------------------
     TEXT IN WEBGL IS A WHOLE SUBSYSTEM — a font atlas, a texture, a quad per glyph, and kerning done
     by hand. For six labels that is a fortnight of work to end up with worse type than the browser
     already has.

     SO THE LABEL IS AN ORDINARY ELEMENT and the 3D only decides WHERE it goes: the landmark's
     position is run through the same camera matrix the buildings use, which gives a point on the
     screen, and the element is moved there each frame. Real text, real font, selectable, and it
     scales with the phone's own type size — none of which a texture atlas would give.

     ONE ELEMENT PER LANDMARK, made once. Moving them is a transform per frame; making them would be
     a layout per frame, and that is the difference between smooth and not. */
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

    /* ---------- AND THE NAMES, PUT WHERE THE 3D SAYS -----------------------------------------------
       The same matrix that drew the buildings, applied to one point above each of them. The divide
       by `w` is the perspective divide — the step that makes a thing further away appear smaller and
       nearer the middle, and the reason a label tracks its building rather than sliding off it.

       BEHIND THE CAMERA IS NOT "OFF TO ONE SIDE". A point behind gives a negative `w` and the
       arithmetic mirrors it back onto the screen, so a label from the far end of the street would
       appear over the near end. Hidden by the sign test rather than by clamping. */
    world.items.forEach(it => {
      /* WELL ABOVE THE ROOFS. Twenty-two metres put the label at about the height of a building, so
         a name sat across whatever it was naming — and the one thing a label must never do is hide
         the thing it points at. Forty-eight clears the tallest silhouette on the board (a tower
         draws about thirty-four) with room to spare.

         AND FURTHER BACK, over the plot rather than over the path — so a label belongs to the
         building behind the node instead of floating above the walker. */
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

/* ---------- TAPPING A NAME -------------------------------------------------------------------------
   The label carries `data-do="ow-tap"`, and the handler for it was lost in one of the rewrites of
   this board — leaving a door onto nothing. `check-doors` did not catch it, because the attribute is
   set in JavaScript rather than written into markup, and that checker reads markup. Worth knowing:
   a door made with `setAttribute` is outside what it can see.

   A VENUE SAYS WHERE IT IS, because that is a thing somebody can act on. Anything else says its
   address, because a landmark on this board is something you navigate by rather than book. */
on('ow-tap', el => {
  const name = el.getAttribute('data-name') || '';
  const l = (DATA.landmarks || []).find(x => S_(x.name) === name);
  if (!l) return;
  const venue = (DATA.venues || []).find(v => norm(v.title) === norm(name));
  toast(venue ? name + ' — ' + (venue.borough || 'a venue you can book')
              : name + (l.address ? ' · ' + S_(l.address) : ''));
});

/* ONE TILE OF A PART. The same vocabulary as a whole part — a surface, a fence, or a building — at
   the size of a single tile, so a rasterised shape is built out of these and a hand-placed
   rectangle is built out of one big one. Same look either way. */
function owPartTile(it, pt, t, draw) {
  const { box, pitch, rgb, T } = draw;
  /* ---------- ONE CELL IS ONE WHOLE TILE ---------------------------------------------------------
     `OW_SUB` WAS USED HERE AND DECLARED NOWHERE, and this would have thrown the moment anybody
     opened the map with a rasterised part on it — a plain ReferenceError, no board at all.

     It is left over from the four-by-four sub-tile experiment: when that was reverted the constant
     went and two uses of it stayed. `check-dead` and `check.js` both found it, which is the whole
     reason those checkers exist — a name used but never declared is invisible until it runs.

     ONE, WRITTEN OUT, rather than a constant nobody else needs. A part covers whole tiles now, so
     the divisor is not a setting; reintroducing it as a variable would invite somebody to change
     it and put the staircase back. */
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
    /* ---------- A BRIDGE IS THE ONE FLAT THING THAT DOES NOT LIE ON THE GROUND -------------------
       Water sits BELOW the tile, which is what makes a river read as a river rather than as a blue
       floor. A bridge has to sit ABOVE it — over the water, with a gap you can see under — or it is
       just a differently coloured stretch of river.

       So it is a deck on two piers rather than a surface: raised, with the water visible either
       side of the supports. Three boxes, and it is the only thing on this board that is off the
       ground. */
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

  /* A BUILDING TILE. The height comes from the part, so every tile of one building is the same
     height and they read as one solid — which is what makes a rasterised C look like a building
     rather than like a row of blocks that happen to touch. */
  const pal = OW_BUILD[norm(it.l.kind)] || OW_BUILD.retail;
  const wall = rgb(pt.wall || pal[0]);
  const roofC = rgb(pt.roof || pal[1]);
  const h = pt.height > 0 ? owHeight(pt.height) : 13;
  box(x0, x1, base, base + h, z0, z1, wall);
  const shape = pt.roofShape || 'flat';
  if (shape === 'pitch') pitch(x0, x1, base + h, 3, z0, z1, roofC);
  else box(x0, x1, base + h, base + h + 1.6, z0, z1, roofC);
}


/* ==================================================================================================
   A FLICK INSIDE AN OPEN SHEET
   --------------------------------------------------------------------------------------------------
   SEPARATE FROM THE GRID'S GESTURE ON PURPOSE. The grid tracks a drag live, moving cells under the
   finger, and everything about that machinery assumes the thing being moved is the grid. Reusing it
   here would mean teaching it about a second kind of target for the sake of one gesture.

   SO THIS IS A FLICK, NOT A DRAG. Nothing follows the finger; the sheet changes when the finger
   lifts. That is a poorer gesture than the grid's and the right trade: the sheet's content is
   arbitrary HTML of unknown height, and dragging it live would mean deciding, mid-gesture, whether
   a finger on a long question is scrolling it or leaving it.

   WHICH IS ALSO WHY IT DEFERS TO SCROLLING. If the sheet's own body can still scroll in the
   direction of the flick, the flick was a scroll — the step only happens at the end of the travel,
   which is where a reader is when they have finished reading.
================================================================================================== */
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
