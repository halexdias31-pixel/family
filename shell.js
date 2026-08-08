/* ==================================================================================================
   @family. — shell.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   shell.js is number 5 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- THE TABS ----------------------------------------------------------------------------
   One table. It drives the bar, the routing, and which screen is showing — so a tab cannot exist
   without a screen behind it, and a screen cannot be unreachable.

   `render` is the only thing a screen has to provide: a function returning the markup for that
   screen. `title` is what the header reads. Nothing else.
--------------------------------------------------------------------------------------------- */
const TABS = [
  /* Posts leftmost: the one screen somebody opens with no errand. Every other tab answers a
     question, and a person with no question needs somewhere to land. */
  { id: 'posts',   icon: '▦',  label: 'Posts',   title: 'Posts' },
  /* ONE TAB FOR FINDING ANYTHING — tutors, venues, subjects, resources, wearables, things.
     The id stays `stuff` because it keys the pager, the page memory and the tests; only what it is
     called has changed, and renaming an id to match a label is a day of moving things for no
     effect anybody can see. */
  /* FOUR TABS. Everything that is a THING you might want is behind one question here — people,
     places, subjects, resources, links, tools, games — and the three tabs that used to hold some
     of them are gone. What is left is the three things that are not lookups: the feed, booking,
     and you. */
  { id: 'stuff',   icon: '🔎', label: 'Find',    title: 'Find' },

  /* BOOK, dead centre and a plus. The middle is where a thumb rests without moving, and a plus
     says "make something" in a way no other glyph does — it is the one action the whole app is
     for, and it should not be a word among six other words. */
  { id: 'book',    icon: '＋', label: 'Book',    title: 'Book a session', big: true },

  /* NOT "Who". It holds tutors, venues AND subjects — people, places and things — so a name
     asking about people was wrong about two thirds of it. "Find" is what you are doing on it. */
  /* You, last. Everything else is the app; this is the one screen that is only about the person
     using it, and the far corner is where every app in the world has taught people to look. */
  { id: 'me',      icon: '◉',  label: 'You',     title: 'You' },
];

/* What each screen draws. Registered separately from the tab list so a screen can be built and
   swapped without touching the navigation — which is the whole reason for splitting them. */
const SCREENS = {};

/** Register a screen. `draw` returns the markup for it, and that is the whole contract.
    There was a third argument — one action for the header — and there is no header. Removed rather
    than accepted and ignored: a parameter nothing reads is a parameter somebody will pass. */
function screen(id, draw) { SCREENS[id] = { draw }; }

let AT = 'posts';
try { AT = localStorage.getItem('familyTab') || 'posts'; } catch {}

function go(id, remember, instant) {
  const tab = TABS.find(t => t.id === id) || TABS[0];
  const was = AT;
  AT = tab.id;
  if (remember !== false) { try { localStorage.setItem('familyTab', AT); } catch {} }

  /* NOTHING IS HIDDEN ANY MORE. Every screen sits on the X axis and is placed by how far it is
     from the one in front — which is what makes a sideways swipe show the next tab arriving rather
     than nothing at all, and what makes the two axes the same thing.
     A screen keeps its half-filled form and its scroll position exactly as it did when it was
     hidden, because it is still in the document; it is simply somewhere else. */
  /* IT ARRIVES FROM THE SIDE IT CAME FROM. One class and one keyframe, rather than eight screens
     held in position so that one of them could be seen sliding in. */
  const from = TABS.findIndex(t => t.id === was), to = TABS.findIndex(t => t.id === AT);
  const way = (was && was !== AT) ? (to > from ? 1 : -1) : 0;

  /* PAINT FIRST, PLACE SECOND, ALWAYS.
     `paintNeighbours` was running AFTER the placement and repainting the current screen along with
     its neighbours — so the pages that had just been given a position were replaced by fresh ones
     with none, and a page with no position sits at its resting place: off the side, invisible.
     The screen went blank and its neighbour showed a sliver. Placement is the last thing that
     happens here, and nothing after it may write innerHTML. */
  paintNeighbours();
  placeCells('x', instant);


  /* THE HEADER IS GONE, and so is everything that wrote to it — a title, and a slot for one
     action per screen. Both were removed rather than left pointing at an element that is no longer
     in index.html: a write to nothing is not harmless, it is a line somebody has to read and work
     out before deciding it does nothing.
     A screen's own action now lives on the screen, where the thing it acts on is. */

  /* ---------- WHY A SIDEWAYS SWIPE WAS THE ROUGH ONE -------------------------------------------
     This was `paint(AT)`, unconditionally, right here — which rebuilds the whole arriving screen's
     markup with innerHTML. On Posts that is eighteen cards and eighteen <img> tags, built, laid
     out and decoded, at the exact moment the 260ms slide begins. The browser cannot do both, so it
     does the rebuild and drops the frames the slide needed.

     THAT IS THE ONLY REAL DIFFERENCE BETWEEN THE TWO AXES. `goPage` — up and down — never repaints
     anything. It moves markup that is already there, which is why it has always felt right, and
     why no amount of tuning the drag itself was ever going to fix sideways: the drag was not the
     problem, the repaint at the end of it was.

     And it was redundant. `paintNeighbours` above has already drawn every screen that had no
     markup, so by the time you can swipe to a tab it is drawn. Painting it a second time produced
     an identical screen at the cost of the animation.

     So: draw it only if there is nothing there, and otherwise leave it alone. Anything that
     genuinely changes a screen — signing in, a save, a fresh payload — goes through `repaint`,
     which is a different function and still repaints on demand. */
  if (!screenHasMarkup_(AT)) paint(AT);
  /* Anything that needs to start running once its markup exists — a canvas, a board, a clock.
     After paint, because none of it can find an element that has not been drawn yet. */
  /* A hoisted FUNCTION, not a const. The wakers are defined further down with the games they
     start, and a `const` read before its own line throws — including through `typeof`, which is
     the one check that cannot see into a temporal dead zone. A function declaration is hoisted,
     so calling it from up here is fine. */
  /* Immediately when the screen has just been drawn — there is nothing on it yet and no slide to
     protect. Otherwise after, for the same reason as `goPage`. */
  if (AT === 'stuff') { if (instant) fillStuffPages(); else afterSlide_(fillStuffPages); }
  /* After wake, because a page holding a canvas has to exist and be sized before it is moved.
     INSTANT, because this is arriving rather than travelling: the tab remembers which widget you
     were on, and animating there from the top is the app appearing to lose your place and then
     go and find it. */
  /* ---------- WHY A SIDEWAYS SWIPE SNAPPED INSTEAD OF SLIDING -----------------------------------
     `true` used to be written here, and it is the whole fault.

     `placeCells` writes `transition: none` on EVERY cell when it is told `instant`. Twenty lines
     above, `placeCells('x', instant)` has just started the slide by writing `transition: ''`. So
     this call — a millisecond later, on the same cells — took the transition straight back off
     again, and the grid arrived at the new tab by jumping to it.

     `goPage`, which is up and down, places the grid ONCE. That is the entire difference between
     the two axes, and it is why one has always felt right and the other never has.

     Passing `instant` through means both calls agree: a tab arrived at from a swipe slides, and one
     restored on boot appears. The reason `true` was written here — that a tab should remember which
     page you were on rather than travelling there from the top — still holds and costs nothing,
     because that page is already where it belongs. There is no travel to animate. */
  paintPager(AT, instant);

  /* `scrollTo` was here, putting the window back to the top on every tab change. The window does
     not scroll — `#screen` is exactly the height of the viewport and clips, and the page you are on
     scrolls inside it. So it moved nothing, and asked the browser to work out a scroll position at
     the one moment it was busy starting an animation. */

  /* `arrive()` was here too: a class added to the arriving screen to slide it in from the side.
     There is no CSS for `from-left`, `from-right`, `from-above` or `from-below` anywhere in the
     stylesheet — not one rule — so it added a class nothing looked at, listened for an
     `animationend` that could never fire, and left the listener attached. What it DID do was
     `void el.offsetWidth`, which forces the browser to stop and lay out the whole page, on every
     single tab change, at the exact moment the slide begins.
     The slide is the transform transition on the cells. It always was. This was a second one that
     had been deleted from the stylesheet and left behind in the code. */
}

/**
 * DRAW THE SCREEN EITHER SIDE, so a sideways drag reveals one rather than an empty rectangle.
 *
 * Only the neighbours. Eight screens redrawn on every tab change would be most of a second on a
 * phone, and one of them holds four hundred resources — the same reasoning that fills a page of
 * the Stuff list only when you can reach it.
 */
/** Has this screen been drawn? A screen with markup needs no redrawing to be arrived at. */
function screenHasMarkup_(id) {
  const el = $('s-' + id);
  return !!(el && el.innerHTML.trim());
}

function paintNeighbours() {
  /* EVERY SCREEN, not the two either side. Four tabs is not many, each is drawn once and never
     again, and the peek shows whatever has been painted — so a screen nobody has visited is a blank
     rectangle at the edge of the one you are on, which reads as the app being broken rather than as
     a tab you have not opened.
     It was ±1 because only ±1 could ever be revealed by a horizontal drag. A corner is one tab
     across AND one page down, so it can be a screen two away when the pages are counted. */
  TABS.forEach((t, i) => {
    const id = t.id;
    if (id === AT) return;
    const el = $('s-' + id);
    if (!el || el.innerHTML) return;          // already drawn; redrawing would only cost
    paint(id);
    /* And placed, if it is a paged screen. A neighbour whose pages have no position shows nothing
       when a drag reveals it, which is worse than showing an empty rectangle because it looks like
       the screen itself is empty. */
    if (PAGER[id]) paintPager(id, true);
  });
  /* The screen in front is NOT repainted here. `go` has already drawn it, and drawing it a second
     time is what threw its placement away. */
}

/** Redraw one screen where it stands. Called after anything that changes what it should say. */
function paint(id) {
  /* A PAGED SCREEN HAS NO PADDING OF ITS OWN — each page supplies it, because a page is positioned
     against the screen's padding box and would otherwise be inset by it and then pad itself again.
     Marked here rather than in the markup so the two lists of paged screens cannot disagree:
     `PAGER` is the only one. */
  $('s-' + id)?.classList.toggle('paged', !!PAGER[id]);
  const el = $('s-' + id);
  const s = SCREENS[id];
  if (!el) return;
  el.innerHTML = s
    ? s.draw()
    : '<p class="empty">Nothing here yet.</p>';
}

/**
 * WHAT TO SAY WHEN THERE IS NOTHING.
 *
 * "Nothing here yet" and "we could not reach the server" are different facts, and every screen was
 * saying the first for both — so a phone with no signal told people to go and add rows to a
 * spreadsheet. One sentence, so no screen can get it wrong on its own, and so improving the
 * wording improves it everywhere at once.
 */
function nothingHere(whenEmpty) {
  return LOAD_FAILED
    ? `<p class="empty">Couldn’t load.<br>
        <span class="faint">${esc(LOAD_FAILED)}</span><br>
        <span class="text-action" data-do="retry">Try again</span></p>`
    : `<p class="empty">${whenEmpty}</p>`;
}

/** Redraw whatever is showing. What almost everything calls after a change. */
const repaint = () => {
  paint(AT);
  /* A repaint rebuilds the markup, which throws the positions away with it — so the page you were
     on would silently become the first one every time anything saved. Instant for the same reason
     `go` is: nothing moved, so nothing should appear to. */
  paintPager(AT, true);
};

/* THE TAB BAR IS GONE. Four buttons naming the four screens, at the bottom, taking 3.6rem of a
   phone — and every one of them says something the grid now says better: the screens either side
   are visible at the edges, and swiping to one is the same gesture as turning a page.

   A bar that duplicates what you can already see is a bar that costs height and teaches nothing.

   WHAT IS LOST, and it is real: you could reach any screen in one press, and now the far one is
   three swipes. Kept anyway, because three swipes across a grid you can SEE is a different thing
   from three presses through screens you cannot — and the header still names where you are.
   `data-tab` is still handled, so anything else that wants to send somebody to a screen can. */

/* ================================================================================================
   ONE GRID. TWO AXES. THE SAME BEHAVIOUR ON BOTH.

   Tabs sit along X and a tab's widgets sit along Y, and until now those were two different pieces
   of machinery that happened to be operated by the same thumb: different rules about when a drag
   counts, different distances to travel, different-looking movement, and two separate ways of
   committing at the end. Learning one taught you nothing about the other.

   They are one thing here. A CELL is a screen or a page — the difference is only which axis it
   lies on — and everything below is written once and applied to both:

     · the same rule for when a gesture belongs to the grid rather than to what is under the finger
     · the same throw distance, as a fraction of the axis being travelled
     · the same resistance at the ends
     · the same depth and fade while turning, so a neighbour arriving looks the same either way
     · the same commit, so a tap on a tab and a swipe to it are the same movement

   Adding a third axis later would be a third entry in AXES and nothing else.
================================================================================================ */
const AXES = {
  /* X — the tabs. */
  x: {
    prop: '--dx',                                   // the drag offset, in the cell's transform
    span: () => innerWidth,
    /* The same signature as the other axis, `id` ignored — there is only one row of tabs. Written
       the same way so nothing calling an axis has to know which one it has. */
    at:    () => Math.max(0, TABS.findIndex(t => t.id === AT)),
    count: () => TABS.length,
    /* IN TAB ORDER, not in the order the sections happen to appear in index.html.
       This returned `querySelectorAll`, which is document order — and the markup lists the screens
       in a different order from the tab bar. So a screen was placed at the position of whichever
       section happened to sit at that index in the file: switching to Stuff put Library at the
       front and Stuff two screens off, which is a blank screen with a sliver of something else.
       Only Posts and You lined up by luck, which is precisely the two that ever worked.
       The tab bar is the order. Nothing should have to know how the markup is arranged. */
    cells: () => TABS.map(t => $('s-' + t.id)).filter(Boolean),
    /* CLAMPED. The other axis clamps inside `goPage` and this one did not, so a swipe past the
       last tab asked for `TABS[4]` and read `.id` off nothing. The end resistance made the movement
       small but the DECISION is taken on the full travel, so a firm flick at the edge threw every
       time — and a thrown handler leaves the grid mid-drag with no cells placed. */
    go:    (n, instant) => {
      const at = Math.max(0, Math.min(TABS.length - 1, n));
      go(TABS[at].id, true, instant);
    },
  },
  /* Y — the widgets on a paged screen. Absent on a screen that is not paged, which is what makes
     a vertical drag there fall through to ordinary scrolling. */
  y: {
    prop: '--dy',
    span: () => innerHeight,
    /* EVERY ONE OF THESE TAKES AN `id`, defaulting to the screen in front. They used to read `AT`
       and nothing else, so the pages of a screen you were about to swipe onto could not be placed
       until you were already on it — and a page that has not been placed sits at its resting
       position, which is off the side at zero opacity. A blank screen with a sliver of its
       neighbour showing. */
    at:    id => PAGE[id || AT] || 0,
    count: id => PAGER[id || AT] ? pageCount(id || AT) : 0,
    cells: id => $('s-' + (id || AT))?.querySelectorAll(':scope > .page') || [],
    go:    (n, instant) => goPage(AT, n, instant),
  },
};

/**
 * PLACE EVERY CELL ON AN AXIS.
 *
 * Two numbers each, exactly as the dial already used:
 *   --ox / --oy   how far from the front, signed
 *   --a           the same, unsigned, because scale and fade want distance rather than direction
 *
 * `instant` is the difference between arriving and travelling: coming back to a tab has to put you
 * where you left off rather than fly you there, and a boot has to draw rather than animate.
 */
/**
 * PLACE EVERY CELL, ON BOTH AXES AT ONCE.
 *
 * There were two placers, one per axis, and a page could only ever be offset by its own. So a page
 * belonging to another tab had no position on the horizontal — which is why nothing ever peeked at
 * a corner, and why the seven attempts at a preview each fixed one axis and broke the other.
 *
 * ONE PASS OVER EVERY PAGE IN EVERY TAB. A page knows two distances: how many tabs sideways and how
 * many pages down it is from the one being read. Both are written into one transform, so a corner
 * is not a special case — it is simply a cell with two non-zero distances.
 *
 * THE SCREENS STOPPED MOVING. They are containers now and nothing more: no transform, no offset,
 * no z-index. Two things moving the same cell is the fault that broke the carousel, and the fix is
 * that only one of them moves anything.
 *
 * EVERY PROPERTY IS WRITTEN EVERY TIME. The oldest lesson in this file: removing an inline value
 * does not remove the rule beneath it, it REVEALS it — and the stylesheet still says `translateX`
 * and `visibility: hidden`, because that is what an unplaced cell needs. A cell described in full
 * looks the same whatever style.css says.
 */
/* HOW BIG A CELL IS, AND THE ONE GAP BETWEEN THEM.

   The step used to be a PERCENTAGE — 84% of the viewport, on both axes — and a percentage of the
   height is not the same distance as a percentage of the width. On a 401 by 929 phone that is a
   16px gap at the sides and a 37px gap above and below: more than twice as far, for no reason
   anybody could see, because the two numbers were equal and the axes were not.

   ONE GAP, IN PIXELS. A gap is a distance and belongs in a unit of distance, not in a fraction of
   whichever edge it happens to sit near. The step is then whatever it has to be:

     step  = cell + gap        where cell is the viewport times the scale
     peek  = (viewport - cell) / 2 - gap

   Which also means the peek differs per axis, and should: there is more room above a cell on a tall
   phone than beside it, and pretending otherwise is what produced the uneven gap in the first
   place. */
/* HOW MUCH OF THE VIEWPORT A CELL TAKES, and it is the same number for every cell on the grid,
   always. It was 0.80, with anything off-centre shrunk a further 6% on top — so a card grew as it
   arrived and shrank as it left, and its width was never the same twice during a swipe. That reads
   as the layout being unsure of itself: the thing you are dragging changes size under your thumb.

   A card is a fixed size. The peek comes from the STEP being shorter than the viewport, which is
   geometry, and not from the neighbour being drawn smaller, which is decoration pretending to be
   depth. 0.90 leaves a twentieth of the screen either side — enough that the next card shows and
   says it is there, and no more. */
const CELL_SCALE = 0.90;      // how much of the viewport a cell takes — every cell, every time
const CELL_GAP   = 16;        // pixels between one cell and the next, every direction

/**
 * HOW FAR APART TWO PANES SIT, so that the gap between what you SEE is `CELL_GAP`.
 *
 * Half of this pane, the gap, half of the one being read. Measured rather than assumed, because a
 * pane is as tall as whatever is on it and no two are the same — which is the whole reason the
 * previous version, which spaced the cells, put the neighbour off the screen.
 *
 * `offsetHeight` rather than `getBoundingClientRect`, because the cells are scaled and the rect
 * comes back scaled with them: measuring the drawn size and then scaling it again is the error
 * that makes a neighbour drift further away the smaller it gets.
 */
/* THE MEASUREMENTS, HELD STILL WHILE A FINGER IS DOWN.

   `offsetWidth` and `offsetHeight` are not reads. Asking for either forces the browser to stop and
   work out the layout of the page there and then, and `placeGrid` asks for two of them per cell —
   so a sideways drag across four tabs with eighteen posts on one of them was forcing dozens of full
   layouts every single frame, and the frames it could not finish in time are the stutter.

   Nothing being measured can change during a drag: no markup is written, no pane is redrawn, the
   only thing moving is a transform, and a transform does not affect layout. So the answer is the
   same every frame, and it is worked out on the first frame and kept until the finger lifts.

   `DRAG_SIZES` is null except during a drag, which is what makes this a cache with no staleness to
   manage — it does not exist long enough to go stale. */
let DRAG_SIZES = null;

function paneStep_(el, frontEl, axis) {
  const mine = el.querySelector(':scope > .pane');
  const front = frontEl && frontEl.querySelector(':scope > .pane');
  /* WHAT AN UNMEASURABLE PANE IS WORTH.
     A pane that has not been laid out has no height, and so does one that has been deliberately
     EMPTIED — the Find screen blanks the pages you are far from, so their markup is not held for
     pages nobody is looking at. Both come back as 0, and both used to fall back to the whole
     viewport.

     For a page that has not drawn yet, guessing a screen is defensible. For a blanked one it is
     the fault you can see: every emptied page was pushed a full screen away from its neighbour, so
     the tools and games sat miles apart while the posts — which are never blanked — sat close.
     A neighbour is the better guess. An emptied page is going to be filled with something much
     like the page beside it, so it is spaced like the page beside it, and the moment it is filled
     it is measured properly anyway. Only when there is nothing at all to compare with does this
     fall back to the viewport. */
  const fall = (axis === 'W' ? innerWidth : innerHeight);
  const frontSize = front ? (axis === 'W' ? front.offsetWidth : front.offsetHeight) : 0;
  const size = e => {
    if (!e) return fall;
    if (DRAG_SIZES) {
      const hit = DRAG_SIZES.get(e);
      if (hit && hit[axis] !== undefined) return hit[axis];
    }
    const n = (axis === 'W' ? e.offsetWidth : e.offsetHeight) || frontSize || fall;
    if (DRAG_SIZES) {
      const box = DRAG_SIZES.get(e) || {};
      box[axis] = n;
      DRAG_SIZES.set(e, box);
    }
    return n;
  };
  return (size(mine) * CELL_SCALE) / 2 + CELL_GAP + (size(front) * CELL_SCALE) / 2;
}

/* ---------- WHEN A PANE CHANGES SIZE ---------------------------------------------------------------
   The grid measures each pane to work out how far apart they sit, and it measures ONCE — at the
   moment it places them. A photograph has no declared size, so a post pane is measured while its
   picture is still a zero-height box, placed for that height, and then grows when the image
   arrives. Nothing tells the grid, so two posts end up overlapping by exactly the height the
   picture turned out to be.

   That is the whole bug, and it is not specific to images: a pane that gains a row, a widget that
   fills in, a list that loads — every one of them changes a height the layout has already used.

   SO THE LAYOUT IS RE-RUN WHEN A PANE RESIZES. Once per frame at most, and only when a size really
   changed, because `placeGrid` reads heights and writing transforms during a resize callback is
   how a loop starts.
--------------------------------------------------------------------------------------------- */
let PANE_WATCH = null, PANE_SIZES = new WeakMap(), PANE_QUEUED = false;

function watchPanes() {
  if (typeof ResizeObserver !== 'function') return;      // an old browser keeps the first measure
  if (!PANE_WATCH) {
    PANE_WATCH = new ResizeObserver(entries => {
      /* A REAL CHANGE, not a report. An observer fires on the first observation of every element,
         which would re-place the whole grid once per pane on every repaint. */
      let moved = false;
      entries.forEach(e => {
        const h = Math.round(e.target.offsetHeight);
        if (PANE_SIZES.get(e.target) !== h) { PANE_SIZES.set(e.target, h); moved = true; }
      });
      if (!moved || PANE_QUEUED) return;
      PANE_QUEUED = true;
      requestAnimationFrame(() => {
        PANE_QUEUED = false;
        /* Instant: the panes have already moved as far as the person is concerned, and animating
           to where they already are is a second movement nobody asked for. */
        placeCells('x', true);
      });
    });
  }
  PANE_WATCH.disconnect();
  document.querySelectorAll('#screen .pane').forEach(el => PANE_WATCH.observe(el));
}

function placeGrid(instant, drag) {
  const tabs = TABS.map(t => t.id);
  const ti = Math.max(0, tabs.indexOf(AT));
  const dxPx = (drag && drag.which === 'x') ? drag.px : 0;
  const dyPx = (drag && drag.which === 'y') ? drag.px : 0;

  /* The pages of every tab, gathered first — a cell needs to know about the one being READ, which
     may be in another tab, and that cannot be looked up from inside the loop that is placing it. */
  const cells = tabs.map(id => {
    const h = $('s-' + id);
    return h ? [].slice.call(h.querySelectorAll(':scope > .page')) : [];
  });

  /* The pane being read. Everything else is spaced from it. */
  const front = (cells[ti] || [])[PAGE[AT] || 0] || null;

  tabs.forEach((id, i) => {
    const host = $('s-' + id);
    if (!host) return;

    /* A SCREEN IS A CONTAINER. Written out so nothing it was ever given can survive. */
    host.classList.remove('hidden');
    host.style.display = 'block';
    host.style.position = 'absolute';
    host.style.top = '0'; host.style.right = '0'; host.style.bottom = '0'; host.style.left = '0';
    host.style.transform = 'none';
    host.style.opacity = '1';
    host.style.visibility = 'visible';
    host.style.overflow = 'visible';
    /* Presses reach the page, not the screen — the screen is not a surface anybody touches. */
    host.style.pointerEvents = 'none';
    host.classList.toggle('on', id === AT);

    const pages = host.querySelectorAll(':scope > .page');
    const at = PAGE[id] || 0;
    pages.forEach((el, p) => {
      const dx = i - ti;
      const dy = p - at;
      /* HOW FAR AWAY, for the fade. Diagonal counts as further than either straight neighbour,
         which is what makes a corner read as a corner rather than as a third sibling. */
      const away = Math.hypot(dx, dy);

      el.classList.remove('hidden');
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.position = 'absolute';
      el.style.top = '0'; el.style.right = '0'; el.style.bottom = '0'; el.style.left = '0';
      /* THE STEP FOLLOWS THE PANE, NOT THE CELL.
         Every cell is the whole viewport; the pane inside it is only as tall as its content, and
         the pane is the thing you can see. Spacing the CELLS 16px apart therefore spaced the panes
         by 16px PLUS whatever height each of them was short by — a 600px pane in an 880px cell put
         240px between them, which on a phone means the neighbour is off the screen entirely.
         So the offset is worked out from the two panes it sits between: half of mine, the gap, half
         of theirs. That is the only arrangement where the gap you see is the gap that was asked
         for, whatever is on the panes. */
      /* TWO REFERENCES, BECAUSE THERE ARE TWO QUESTIONS.

         ACROSS is "how far is this column from the one being read", so it is measured against the
         front pane — every cell in a column moves sideways together.

         DOWN is "how far is this pane from the one above it IN ITS OWN COLUMN", and it was being
         measured against the front pane too. So a tall tab's pages were spaced by half of a SHORT
         tab's pane: the stack came out too tight, and the pages of the column beside you overlapped
         each other and reached across into yours. Exactly what a screenshot of three columns with
         different-height panes shows.
         A column is spaced by its own. */
      const mine = (cells[i] || [])[PAGE[id] || 0] || null;
      const stepX = paneStep_(el, front, 'W');
      const stepY = paneStep_(el, mine, 'H');
      /* ONE SCALE, NOT TWO. `away ? CELL_SCALE * 0.94 : CELL_SCALE` shrank every cell that was not
         the one in front, so a card was 6% smaller a moment before you arrived at it and grew into
         place as you did — a size that depends on where the grid happens to be is a size that is
         never settled. Distance is already said by the position and by the dimming below; saying it
         a third time in the width was the one saying that could be felt. */
      el.style.transform =
        `translate(${(dx * stepX + dxPx).toFixed(1)}px, ${(dy * stepY + dyPx).toFixed(1)}px)`
        + ` scale(${CELL_SCALE})`;
      /* Neighbours are dimmed, not hidden — being able to see them is the point. Not dimmed far,
         though: a sliver of dark glass at 50% over a dark app is geometrically present and
         invisible, which is indistinguishable from the peek not working at all. Two steps out is
         off the screen and does not need drawing. */
      el.style.opacity = away === 0 ? '1' : away < 1.5 ? '.82' : '.5';
      el.style.visibility = away > 2.2 ? 'hidden' : 'visible';
      el.style.pointerEvents = (id === AT && p === at) ? 'auto' : 'none';
      el.style.zIndex = String(10 - Math.round(away));
      el.style.transition = instant ? 'none' : '';
      el.classList.toggle('on', id === AT && p === at);
    });
  });
}

/* The two axes still call in — one placer underneath, so a horizontal move and a vertical one
   cannot disagree about where a cell is. */
function placeCells(which, instant, dragPx, id) {
  placeGrid(instant, dragPx ? { which, px: dragPx } : null);

  /* THE TWO SWEEPS BELOW DO NOT RUN WHILE A FINGER IS DOWN.

     Both answer questions about what EXISTS — which panes to watch, which screens no tab points at
     — and nothing is created or destroyed during a drag. They were running on every frame anyway:
     a full disconnect and re-observe of every pane in the document, and a second query over every
     screen, sixty times a second, to arrive at the same answer each time.

     That is most of what made a sideways swipe feel heavy, and none of it was doing anything. They
     run when the drag ends, which is when the answer can have changed. */
  if (dragPx) return;

  /* AND THE OBSERVER FOLLOWS THE PANES THAT EXIST NOW. Attached here because this runs after every
     repaint — a pane replaced by a redraw is a pane the old observer is still watching and the new
     one is not, which shows up as the grid never learning that a picture arrived. */
  watchPanes();

  /* ANY SCREEN NO TAB POINTS AT. index.html lists eight sections and the tab table decides which of
     them exist, so removing a tab leaves a section behind that nothing places. */
  const mine = TABS.map(t => $('s-' + t.id));
  document.querySelectorAll('#screen > .screen').forEach(el => {
    if (mine.indexOf(el) === -1) {
      el.style.display = 'none';
      el.classList.add('hidden');
    }
  });
}

/* ---------- WIDGETS AS PAGES --------------------------------------------------------------------
   Tools and Arcade hold four things each, and a column of four cards means the fourth is a
   scroll away from being remembered. One at a time, full height, swipe up for the next — the
   same gesture as the tab bar turned ninety degrees, so there is one thing to learn rather than
   two.

   THE HARD PART IS THE SAME ONE AS THE TAB SWIPE: not breaking scrolling. "Swipe up" and "scroll
   down" are the same movement of the same thumb, and a page that guesses wrong takes away the
   thing people do a thousand times more often. So the rule is a hierarchy rather than a choice:

     the page scrolls if it has anywhere to scroll to
     only at its top or its bottom does the gesture belong to the pager

   Which means a short widget — the calculator, the timer, the board — pages immediately, and a
   long one — a docket with twenty lines, a notepad full of text — reads to the end first. Nobody
   has to know the rule; it is what already happens in every reader anybody has used.

   The names are here rather than in the markup so the header can say which widget you are on
   without the screen having to tell it.
--------------------------------------------------------------------------------------------- */
const PAGER = {
  /* POSTS ARE HOWEVER MANY THERE ARE, so this is a function rather than a list. Everything else
     about them is the same: one to a screen, swipe up for the next.
     They have no names to put in the header, so the position goes there instead. That is the
     thing the dots used to say and the only part of it worth keeping — on a feed, "4 of 12" is
     genuinely useful, where on five named tools it was saying nothing the title did not. */
  /* EVERY SCREEN IS PAGED. Nothing scrolls anywhere: a screen is a screen, and getting from one
     thing to the next is the same movement on both axes on all eight tabs. There is no longer such
     a thing as a screen you have to learn separately.
     The name shown in the header, or an empty string to leave the tab's own title alone — a
     single-page screen has no "1 of 1" worth saying.
     Each count comes from the same function that renders the pages, so the header and the screen
     cannot disagree about how many there are. */
  me:      () => mePages().map((_, i, a) => a.length > 1 ? (i + 1) + ' of ' + a.length : ''),
  book:    () => bookPages().map((_, i, a) => a.length > 1 ? (i + 1) + ' of ' + a.length : ''),

  /* Empty names, one per post. The pager needs the COUNT — that is what it pages through — and
     a post has no name worth putting in a header: "1 of 10" is a fact about the list rather than
     about the photograph, and it changed on every swipe where a title should hold still.
     Empty falls through to the tab's own title, so no special case is needed anywhere. */
  /* One name per page, and the ＋ card is a page — so it is counted here too, or the pager stops
     one short and the last post can never be reached. The count and the render come from the same
     two facts on purpose: a pager that disagrees with its own screen is a post that exists and
     cannot be swiped to. */
  posts:  () => feedPosts().map(() => '').concat(isAdmin() ? [''] : []),
  /* The controls, then the results. Named so the header says which page of how many — on a list
     you are working through, that is the one thing a title cannot tell you and the number is
     worth having. */
  stuff:  () => {
    const n = stuffPageCount();
    return ['Search'].concat(Array.from({ length: n }, (_, i) => (i + 1) + ' of ' + n));
  },
};

/** The page names for a screen, whether they are a list or worked out each time. */
function pagerNames(id) {
  const v = PAGER[id];
  return typeof v === 'function' ? v() : (v || []);
}

/* Which page each paged screen is showing. Kept per screen, so leaving Tools on the calendar and
   coming back puts you on the calendar — a pager that resets is a pager you have to re-navigate
   every time you check something on another tab. */
const PAGE = { posts: 0, stuff: 0, book: 0 };

const pageCount = id => pagerNames(id).length;

/**
 * THE DIAL.
 *
 * Every widget sits on the same spindle and only the one at the front is full size. Its
 * neighbours are still there — smaller, dimmer, a little way off — so the shape of the whole
 * screen is visible while you are using one part of it. A full-page slide showed one thing and
 * gave no sense that there was anything else, which is why the dots had to exist to say so.
 *
 * Each page is told two numbers and CSS does the rest:
 *   --o  how far from the front, SIGNED: -1 is the one above, +1 the one below
 *   --a  the same, unsigned, because CSS has no dependable abs() and scale and fade both want it
 *
 * `instant` is the difference between arriving and travelling. Coming back to a tab has to put
 * you where you left off — not fly you there from the top, which is what it did, and which reads
 * as the app losing your place and then correcting itself.
 */
/* ---------- WORK THAT MUST NOT HAPPEN DURING A SLIDE ---------------------------------------------
   Every screen but one turns a page by moving markup that is already in the document. Find is the
   exception: its pages are filled as you approach them, because four hundred resources' worth of
   markup all at once is not worth building for pages nobody reaches.

   That filling was happening BEFORE the transform moved — deliberately, so a page would "arrive
   with its contents rather than filling in underneath somebody". Which is the same well-meant
   mistake as repainting a screen on a tab change: a synchronous rebuild fired at the exact moment
   the animation starts, so the browser does the rebuild and drops the frames the slide needed. It
   is why the second column has never felt like the others.

   So it goes after. One booking at a time, so a run of quick swipes fills once at the end rather
   than once per swipe, and the timer is a little longer than the transition so the fill lands on a
   grid that has already settled. */
let AFTER_SLIDE = null;

function afterSlide_(fn) {
  if (AFTER_SLIDE) clearTimeout(AFTER_SLIDE);
  AFTER_SLIDE = setTimeout(() => { AFTER_SLIDE = null; fn(); }, 300);
}

function paintPager(id, instant) {
  if (!PAGER[id]) return;
  const host = $('s-' + id);
  if (!host || !host.querySelector(':scope > .page')) return;
  const n = Math.max(0, Math.min(pageCount(id) - 1, PAGE[id] || 0));
  PAGE[id] = n;

  /* THE SAME PLACER THE TABS USE. There were two of these — one setting `--o` on a page and one
     that did not exist at all for screens — which is precisely why the two axes drifted apart. */
  placeCells('y', instant, 0, id);


  /* The page's name used to be written into the header here. There is no header, so it is not.
     `pagerNames` is still what decides how many pages a screen has, which was always the
     load-bearing half of it. */
}

function goPage(id, to, instant) {
  if (!PAGER[id]) return;
  const n = Math.max(0, Math.min(pageCount(id) - 1, to));
  const was = PAGE[id] || 0;
  if (n === was && !instant) return;
  PAGE[id] = n;
  /* MOVE FIRST, FILL AFTER. The page being turned to is already filled — `fillStuffPages` keeps
     two either side ready, which is further than anybody can swipe in one gesture — so there is
     nothing to build at this moment and nothing to wait for. Whatever has come newly into range is
     built once the grid has settled. */
  if (id === AT) placeCells('y', instant);
  if (id === 'stuff') afterSlide_(fillStuffPages);
  paintPager(id);
}

/** Wrap a screen's cards into a vertical strip of pages.

    NO DOTS. There was a column of them down the right edge saying how many widgets there were and
    which one you were on — and once each page fills the screen, the header already names the
    widget, so the dots were saying the same thing twice in a less readable way. The count they
    also carried is not worth a permanent mark on every screen: you find out by turning the dial,
    which takes one movement. */
/* A SCREEN'S PAGES, all of them, in one scroller.
   They used to be eight absolutely-positioned cells with one visible. Now they are a list, and the
   peek above and below is what a list looks like when its items are shorter than the viewport —
   which is a fact about the layout rather than something anybody has to maintain. */
/* THE CELL AND THE GLASS ARE TWO THINGS.
   A page was both: the box the grid positions AND the pane you look at. A positioned cell is
   `inset: 0` — the full screen, always — so a post with a picture and two lines of caption sat in a
   pane the height of the phone with two thirds of it empty glass.
   `.page` is the cell and is invisible. `.pane` inside it is the glass and is as tall as what is on
   it. Nothing that styles a page's contents changes: every rule was written as a DESCENDANT
   (`.page .post`), not a child, so a wrapper between them is not something they can notice. */
const pages = (id, cards) =>
  cards.map(c => `<section class="page"><div class="pane">${c}</div></section>`).join('');

/** The glass inside a page — where content actually goes. */
const paneOf_ = el => (el && el.querySelector(':scope > .pane')) || el;

/* `watchPages` and its observer lived here — they reported which pane the scroller had centred.
   Gone with the scroller. Which page is in front is decided by this file again, which is the only
   way it can be decided once. */

/**
 * BLOCKS INTO PAGES.
 *
 * A screen says what it is made of — cards, tiles, sections — and this cuts the list into screens.
 * Every paged screen was working out its own chunking, which is the same three lines copied four
 * times and four chances for one of them to be off by one.
 *
 * The pager asks THIS for the number of pages and the screen asks it for the markup, so what is
 * rendered and what the header says can never disagree. That is the whole reason it is a function
 * rather than a number written down in two places.
 */
function chunk(blocks, per, wrap) {
  const out = [];
  for (let i = 0; i < blocks.length; i += per) {
    const part = blocks.slice(i, i + per).join('');
    out.push(wrap ? wrap(part) : part);
  }
  /* Never zero pages. A screen with nothing on it is still a screen, and a pager with no pages is
     a blank rectangle with no way to tell it from a fault. */
  return out.length ? out : [''];
}

/* How many of each thing a phone holds without cutting the last one in half. Different per screen
   because a tile is not a card and a card is not a post — one number for all of them would be
   wrong four times out of five. */
/* `me` is not here any more — the You screen is one scrolling page. See `mePages`. */
/* Book fits more now that a session is a stub rather than a whole receipt — five full receipts was
   a page you scrolled, and the point of a stub is that a page of them is a page you scan. */
/* `book` is not here any more — a session is a pane of its own. See `bookPages`. */
const PER_PAGE = { library: 12 };

/* The dot's handler is registered further down, WITH the other actions. `on()` writes into
   `ACTIONS`, which is a `const` declared after this point — and a const read before its own line
   throws rather than coming back undefined. The same trap the comment beside `wake` describes,
   and the reason that one is a hoisted function declaration. */

/* ---------- THE SHEET ---------------------------------------------------------------------------
   One element, reused. Anything needing the whole screen opens here rather than in a card that
   pushes the page around — and it keeps the thing underneath, so somebody filling in a booking has
   not left the list they found it in.
--------------------------------------------------------------------------------------------- */
let sheetOnClose = null;

function openSheet(title, html, onClose) {
  $('sheet-title').textContent = title;
  $('sheet-body').innerHTML = html;
  $('sheet').classList.remove('hidden');
  $('sheet-back').classList.remove('hidden');
  sheetOnClose = onClose || null;
  /* The page behind must not scroll while a sheet is open — two scrolling things at once is the
     thing that makes a phone feel broken. */
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  $('sheet').classList.add('hidden');
  $('sheet-back').classList.add('hidden');
  $('sheet-body').innerHTML = '';
  document.body.style.overflow = '';
  const f = sheetOnClose; sheetOnClose = null;
  if (f) f();
}

/* ---------- ONE WAY TO POST ----------------------------------------------------------------------
   Twenty-odd places call the backend, each with its own `.then(r => r.json())` and its own idea of
   what counts as a failure. That is twenty chances to miss something the server said — and the
   server has just started saying something new: a request that wrote to a column that does not
   exist comes back with `unwritten`, because a save that saved nothing must not report success.

   Handled here, once, so no caller has to know. Anything that reaches the `.then` of `send()` has
   genuinely worked; anything else lands in the `.catch` with a sentence worth showing.
--------------------------------------------------------------------------------------------- */
/**
 * ONE REQUEST, BUILT IN ONE PLACE.
 *
 * Called `api` rather than `post`, because `post` is a NOUN in this app before it is a verb — a
 * photograph with a caption — and three handlers already hold one in a local variable of exactly
 * that name. A shadowed function is a "post is not a function" thrown from a line that looks
 * correct, which is what happened the moment this was introduced.
 *
 * Every call to the backend carried its own copy of the method, the cache policy and the JSON
 * encoding — twenty-one copies of four lines, which is twenty-one places to edit the day any of
 * them has to carry a header, a timeout, a retry, or a queue for when the phone is offline. None
 * of that exists yet; all of it becomes one edit from here rather than twenty-one.
 *
 * IT DOES NOT THROW ON A REFUSAL. That was the tempting version, and it would have meant rewriting
 * every caller's reply handling by hand — most of them already read `d.error` and say something
 * specific about it, which is better than a generic catch. The reply comes back as it came.
 */
function api(body) {
  return fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify(body) })
    .then(r => r.json())
    .then(d => {
      /* A value the sheet had nowhere to put. The server turns this into an error where it can, so
         reaching here means it could not — a read that wrote, or a reply with no `success` to take
         away. Rare, and worth a word rather than nothing. */
      if (d && d.unwritten && d.unwritten.length) {
        banner('Some values were not saved: '
          + d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
          + ' — those columns are not in the sheet.');
      }
      return d || {};
    });
}

/** The same request, refusing to resolve on a refusal — for callers that would rather catch. */
function send(body) {
  return api(body).then(d => {
    if (d && d.error) throw new Error(d.error);
    return d;
  });
}

/* ---------- SAYING SOMETHING BRIEFLY ------------------------------------------------------------ */
let toastTimer = null;
function toast(msg) {
  let el = $('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2600);
}

/* ---------- ONE CLICK HANDLER -------------------------------------------------------------------
   Delegated from the document, so markup can be replaced without rewiring anything. A screen emits
   `data-do="something"` and handles it here; nothing ever attaches its own listener to a card that
   is about to be thrown away.
--------------------------------------------------------------------------------------------- */
const ACTIONS = {};
/** Register what a `data-do` means. */
function on(name, fn) { ACTIONS[name] = fn; }

/* Asking again. A failure that offers no way to retry costs a whole page reload, and on a phone a
   reload is the thing most likely to lose whatever was half-typed on another screen. */
on('retry', () => { LOADED = false; LOAD_FAILED = ''; banner(''); repaint(); load(); });

document.addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (tab) { go(tab.dataset.tab); return; }

  if (e.target.closest('#sheet-close') || e.target.id === 'sheet-back') { closeSheet(); return; }

  const doer = e.target.closest('[data-do]');
  /* A SELECT AND A CHECKBOX SPEAK THROUGH `change`, NOT `click`.
     A click on a select is the dropdown OPENING — its value is still the old one — so running the
     handler here fired every action with a stale answer and then redrew the markup out from under
     the list the person had just opened. Three finding controls did nothing at all, silently,
     which is the same failure as every entry on the list in the notes.
     They are refused here and picked up by the `change` listener further down. */
  if (doer && (doer.tagName === 'SELECT' || doer.type === 'checkbox')) return;
  if (doer && ACTIONS[doer.dataset.do]) {
    /* CAUGHT HERE, WHERE THE MESSAGE STILL EXISTS.
       Almost everything this app does runs from this one line, and an error escaping it reaches
       the window — where a browser serving from file:// reports it as "Script error." with no
       message, no file and no line, because it treats every local script as cross-origin. A real
       fault becomes two words that could mean anything.
       Caught, it keeps its message and names the action that produced it, which is the difference
       between "Script error." and "react — Cannot read properties of null". */
    try {
      ACTIONS[doer.dataset.do](doer, e);
    } catch (err) {
      console.error('[' + doer.dataset.do + ']', err);
      toast(doer.dataset.do + ' — ' + String((err && err.message) || err));
    }
  }
});

/* Swiping between tabs is further down, with the gesture handling it belongs to — I wrote a
   second, cruder version here before noticing the first. The one that survives follows the finger
   and resists at the ends; this one only decided after the fact. */

/* Escape closes the sheet, for anybody on a keyboard. Costs one line and is the first thing
   somebody tries. */
addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('sheet').classList.contains('hidden')) closeSheet();
});

/* ---------- LOADING ------------------------------------------------------------------------------ */
async function load() {
  try {
    /* The person's id goes with the request so the server can say which posts YOU liked — it
       cannot know otherwise, and sending every like to every phone to answer it would be absurd. */
    /* AND THE NAME, which is a different question from the id and was never being asked.
       The backend decides `viewerIsAdmin` from `p.name` and nothing else. This request has only
       ever carried `person`, so that flag has been FALSE on every payload ever built — including
       for an admin — and four things silently followed from it:
         · an unlisted tutor is absent, so the switch that hid them cannot un-hide them
         · a deleted post and a deleted resource are absent, for the same reason
         · `orders` holds only your own, so the queue of paper to print is always empty
         · `health.problems` is never filled in
       None of those looks like a fault. Each looks like a feature that does nothing. */
    const q = [];
    if (USER && USER.personId) q.push('person=' + encodeURIComponent(USER.personId));
    if (USER && USER.name) q.push('name=' + encodeURIComponent(USER.name));
    const who = q.length ? '?' + q.join('&') : '';
    /* NO CACHE, AND A DIFFERENT URL EVERY TIME. Both, because either alone can be got round.
       This is a plain GET, which a browser is entitled to hold — so an edit to the spreadsheet
       could be live, the deploy correct, the site current, and the phone still showing what it
       fetched ten minutes ago. That is indistinguishable from the change not having saved, and it
       is the third time on this project that a stale copy has been mistaken for a broken feature.
       `no-store` tells the browser not to keep it; `_` makes the URL one it has never seen, which
       is what covers the proxies and the service workers that ignore the header. */
    const bust = (who ? '&' : '?') + '_=' + Date.now();
    const res = await fetch(API + who + bust, { cache: 'no-store' });
    const d = await res.json();
    if (d && !d.error) {
      /* WHAT WAS ASKED FOR AND NOT SENT.
         `DATA.liveJobs` was read for weeks and never sent — the `|| []` beside it turned that into
         an empty list, so the Book screen said "No sessions yet" whatever was in the tab. The same
         happened to `DATA.messages` and `DATA.resources`. None of the three throws, none of them
         logs, and all three look exactly like an empty database.

         So a key nothing sends is written down the first time anything reaches for it. Not a
         banner: a key can be genuinely absent for a client and present for an admin, and shouting
         about that would be shouting on every load. It is recorded, and `missingKeys()` typed into
         the console says what they were.

         Costs nothing. A Proxy is only consulted on a property that is not there. */
      DATA = new Proxy(d, {
        get(t, k) {
          /* `then` is asked for by anything that awaits an object, to find out whether it is a
             promise. It is not a missing key, and counting it would put it at the top of the list
             on every single load. */
          if (typeof k === 'string' && !(k in t) && k !== 'then') {
            MISSING_KEYS[k] = (MISSING_KEYS[k] || 0) + 1;
          }
          return t[k];
        }
      });
      LOAD_FAILED = '';
      /* WHAT THE BACKEND CAN DO, against what this site needs. `features` has been in the payload
         since before the rewrite and nothing has ever read it — which is why a stale deploy shows
         up as "That action is not recognised", a sentence written for somebody who did something
         wrong rather than for a deployment that is out of date. */
      /* A payload that could not write something — the schema check ran and a column is still
         missing. Said on load rather than waiting for somebody to try to save into it. */
      if (d.unwritten && d.unwritten.length) {
        banner('The sheet is missing columns: '
          + d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
          + '. Anything saved to them is discarded.');
      }
      /* NO BANNER FOR A VERSION MISMATCH ANY MORE.
         It was built when a cached stylesheet was a real and invisible problem — twice a rule had
         been changed and the browser was serving an old copy, and there was no way to tell that
         from a rule that was simply wrong.
         index.html fixed that at the source: both files are requested with `?t=` and the current
         millisecond, so neither can be cached at all. What is left is a mismatch that means "the
         other file has not been pasted yet", which is true, harmless, and self-correcting — and an
         orange bar across the top of every screen is a heavy way to say it.
         Both versions are still on the You screen, which is where you look when you want to know. */
      const NEEDS = ['editPost', 'deletePost', 'editResource', 'deleteResource'];
      const missing = NEEDS.filter(f => (d.features || []).indexOf(f) === -1);
      if (missing.length) {
        /* THE VERSION IT ACTUALLY REACHED, said out loud. "The backend is older" was true and
           useless: it did not say WHICH backend, and the answer turned out to be a second
           deployment nobody knew was there. A version string in the message is the difference
           between redeploying again and going to look at the URL. */
        banner('The backend at this URL is ' + (d.version || 'an unknown version')
             + ', which cannot ' + missing.join(', ') + '. Either that deployment is old, or '
             + 'this site is pointed at the wrong one — check the id in API against the '
             + 'Deployment ID in Manage deployments.');
      }
    }
    else {
      LOAD_FAILED = String(d.error || 'the server refused the request');
      banner('The server said: ' + (d.error || 'something went wrong'));
    }
  } catch (err) {
    LOAD_FAILED = String((err && err.message) || err || 'could not reach the backend');
    /* WHICH URL IT TRIED, as something you can press.
       "Could not reach the server" is true of four different faults and useful for none of them:
       a wrong deployment id, a deployment whose access is still "Only myself", a browser with no
       connection, and a script that threw while parsing the reply all produce it. The URL is the
       one piece of evidence that separates them, and opening it in a tab answers the question in
       ten seconds — JSON means the address is right, a Google sign-in page means the deployment
       is private, a 404 means the id is wrong. */
    const el = $('banner');
    if (el) {
      el.classList.remove('hidden');
      /* THE ADVICE MATCHES THE FAULT. It used to print all of it every time — including "Failed
         to fetch means the reply never arrived" underneath an error that plainly was a reply. Two
         paragraphs of which one applied, and no way to tell which, is worse than one sentence. */
      const msg = String((err && err.message) || err || '');
      const why = /Unexpected token|not valid JSON/.test(msg)
        /* A reply arrived and it was a web page. Apps Script serves its own errors as HTML, and
           since the scopes were written into the manifest the commonest one by far is a consent
           that has not been given — a manifest change invalidates the authorisation, and only a
           run from the EDITOR can raise the prompt again. */
        ? 'The backend answered with a web page instead of data. Open it in a tab and read what '
          + 'it says — “Authorization is required” means the scopes changed and nobody has '
          + 'consented yet: run any function from the Apps Script editor once, accept the prompt, '
          + 'then deploy a new version.'
        : /Failed to fetch|NetworkError|Load failed/.test(msg)
        /* Nothing arrived at all — so it is the address or the access, not the code. */
        ? 'The reply never arrived, so this URL is not being served. Check Manage deployments: the '
          + 'one under ACTIVE is the only one that answers, an archived id looks exactly like '
          + 'this, and “Only myself” access does too.'
        : 'Something else went wrong on the way.';

      el.innerHTML = 'Could not reach the backend.<br>'
        + '<span class="faint">' + esc(why) + '</span><br>'
        + '<a class="link" href="' + esc(API) + '" target="_blank" rel="noopener">Open it in a '
        + 'tab</a> — the page itself will say which it is.<br>'
        + '<span class="faint">' + esc(msg)
        + ' · site ' + esc(SITE_VERSION) + ' · css ' + esc(cssVersion()) + '</span>';
    }
  }
  /* Set whether it SUCCEEDED or failed — a failed load is still a finished one, and leaving the
     skeleton up for ever would be the app pretending it is still trying. */
  LOADED = true;
  repaint();
  /* AND EVERY OTHER SCREEN, ONCE.
     `repaint` only draws the one in front. The others were drawn before this request came back, so
     each is a skeleton — and now that arriving at a tab no longer repaints it, a skeleton would be
     what you found there for ever.
     Cleared rather than redrawn on the spot: `go` draws a screen with nothing in it, so each is
     rebuilt at the moment it is arrived at, with the data, exactly once. The cost lands on the tab
     somebody actually opens rather than on all four at boot. */
  TABS.forEach(t => {
    if (t.id === AT) return;
    const el = $('s-' + t.id);
    if (el) el.innerHTML = '';
  });
  openSharedPost();     // if the app was opened on a shared link, go to that post
}

function banner(msg) {
  const el = $('banner');
  if (!msg) { el.classList.add('hidden'); return; }
  el.textContent = msg;
  el.classList.remove('hidden');
}

/* ---------- NOTHING MAY BE HELD ------------------------------------------------------------------
   A service worker outlives everything. It is installed once, it survives a reload, it survives
   clearing history on some browsers, and while it is there it can serve a copy of this file from
   months ago no matter what the server sends — which looks exactly like an edit not saving.

   This project has never deliberately registered one. That is not the same as there not being
   one: an experiment, a template, a tool that adds one for offline support, and it is there for
   good. So any worker is removed and every cache it made is emptied, on every load. It costs
   nothing when there is none, which is almost always.

   Run before the first fetch, so a worker cannot intercept the payload on the way past.
--------------------------------------------------------------------------------------------- */
(function purge() {
  try {
    navigator.serviceWorker?.getRegistrations?.().then(rs => {
      if (rs && rs.length) {
        rs.forEach(r => r.unregister());
        /* One reload, and only if there WAS one — otherwise this is a page that refreshes itself
           for ever, which is a worse fault than the one it is fixing. */
        caches?.keys?.().then(ks => Promise.all((ks || []).map(k => caches.delete(k))))
          .finally(() => location.reload());
      } else {
        caches?.keys?.().then(ks => (ks || []).forEach(k => caches.delete(k)));
      }
    }).catch(() => {});
  } catch {}
})();