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

  /* SPOTLIGHT WAS A COLUMN HERE. It is the business choosing what to put in front of people, which
     is the same voice as a post with a caption — so it is pages at the top of Posts now, above the
     ＋. Two columns for one voice, and this one cost a swipe on every screen whether or not
     anything was in it. See `spotPages` in collections.js.

     Four columns: Posts, Find, Basket, You. */
  /* ONE TAB FOR FINDING ANYTHING — tutors, venues, subjects, resources, wearables, things.
     The id stays `stuff` because it keys the pager, the page memory and the tests; only what it is
     called has changed, and renaming an id to match a label is a day of moving things for no
     effect anybody can see. */
  /* FOUR TABS. Everything that is a THING you might want is behind one question here — people,
     places, subjects, resources, links, tools, games — and the three tabs that used to hold some
     of them are gone. What is left is the three things that are not lookups: the feed, booking,
     and you. */
  { id: 'stuff',   icon: '🔎', label: 'Find',    title: 'Find' },

  /* BOOK WAS A COLUMN HERE, dead centre, a plus, and argued for at length as the one action the
     whole app is for. It still is — but the funnel beside it was already asking "what for", already
     answering "Booking", and already listing the four things a booking is assembled from. A column
     for making one, next to a screen for finding the parts of one, was the same errand split in
     two.

     Everything that was on it — the form, your sessions, the open classes — is a page on Find now,
     behind that answer. See `bookingPages_` in find.js. */

  /* SAVED WAS A COLUMN HERE. Each saved thing is a PAGE on Find now, in front of the question —
     see `savedPages_` in collections.js for why — so the tab is gone rather than left pointing at a
     screen nobody registers. Six columns, not seven, which is one less swipe to You from every
     screen. */
  { id: 'basket',     icon: '⛁', label: 'Basket', title: 'Your basket' },

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
  /* WHEN, and it is not simply "after the slide".

     Deferring exists so a rebuild does not run during the animation and eat its frames. That is
     right when there is already something on the screen — the cards are drawn, the slide moves
     them, and whatever is newly in range is built once it has settled.

     It is wrong the FIRST time this screen is reached. Nothing is filled, so every pane is empty,
     so the grid places a column of nothing — and three hundred milliseconds later the content
     arrives into positions that were worked out for cards that did not exist. Cards on top of
     cards, until something else moves.

     So: if there is nothing on it yet, fill it now and let the slide be slightly less smooth once.
     After that, always after. */
  if (AT === 'stuff') {
    const drawn = $('s-stuff') && $('s-stuff').querySelector('.page[data-filled]');
    if (instant || !drawn) fillStuffPages(); else afterSlide_(fillStuffPages);
  }
  /* After wake, because a page holding a canvas has to exist and be sized before it is moved.
     INSTANT, because this is arriving rather than travelling: the tab remembers which widget you
     were on, and animating there from the top is the app appearing to lose your place and then
     go and find it. */
  /* `true` used to be written here, and it cancelled the slide `placeCells('x', instant)` had
     started twenty lines above — two correct calls in one turn, disagreeing, which is the fault
     the scheduler in `placeCells` now exists to make unwriteable. Passing `instant` through was
     the patch for it; it stays because it is also simply true. A tab arrived at from a swipe
     slides, and one restored on boot appears.
     Either way the scheduler settles it now: both asks become one placement, and if either wants
     the animation, the animation is what happens. */
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

  /* ONE SCREEN THAT WILL NOT DRAW MUST NOT TAKE THE OTHERS WITH IT.

     `draw()` throwing used to escape here, up through `paintNeighbours` and out of `go`, so the
     first screen with a problem stopped every screen after it and the boot with them. One missing
     file, and an app where three tabs were fine showed nothing and answered nothing.

     Caught, the broken one says what happened ON ITSELF — where you would look — and the rest of
     the app is drawn, placed and usable. The message names the screen and the error, which is more
     than the old behaviour managed: an exception thrown out of here arrived at the boot handler
     with no idea which screen produced it. */
  let html;
  try {
    html = s ? s.draw() : null;
  } catch (err) {
    console.error('[screen ' + id + ']', err);
    el.innerHTML = `<div class="pane"><div class="card">
        <h3>This screen did not draw</h3>
        <p class="sub">${esc(String((err && err.message) || err))}</p>
        <p class="faint">The rest of the app is fine — swipe across. If a file did not load, the
          banner at the top says which.</p>
      </div></div>`;
    return;
  }
  el.innerHTML = html !== null
    ? html
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
/* ==================================================================================================
   THE ORDER A REDRAW HAPPENS IN, WRITTEN DOWN ONCE

   Four things happen when the screen is rebuilt, and they must happen in this order:

     1. THE SCREEN YOU ARE ON gets its markup.
     2. ITS NEIGHBOURS get theirs, so the slivers either side are not blank rectangles.
     3. THE PAGER is painted, which creates the pages that step 4 measures.
     4. EVERYTHING IS PLACED. Nothing may write innerHTML after this.

   WHY THE ORDER IS NOT A PREFERENCE. Markup has to exist before it can be positioned, and a page
   that is replaced after being positioned loses its position — a page with no position sits at its
   resting place, off the side, invisible. That is exactly the bug that made the screen go blank
   with a sliver showing at the edge, and the comment in `go` still describes it.

   AND WHY THIS IS A FUNCTION NOW. That rule was true everywhere and written down in one place: a
   comment inside `go`. Seven call sites sequenced these steps by hand, in five different orders,
   each remembering a different subset — so getting it right depended on whoever wrote the eighth
   having read the comment in the first.

   A rule that has to be remembered is a rule that will be forgotten. This is the rule, executable.
   `repaint` is the whole sequence; the pieces stay callable for the cases that genuinely need only
   part of it, and those cases now stand out as exceptions rather than looking like the norm.
================================================================================================== */
const repaint = (instant) => {
  paint(AT);                       // 1. the screen you are on
  paintNeighbours();               // 2. the ones either side
  /* 3. A repaint rebuilds the markup, which throws the positions away with it — so the page you
        were on would silently become the first one every time anything saved. Instant for the same
        reason `go` is: nothing moved, so nothing should appear to. */
  paintPager(AT, true);
  placeCells('x', instant !== false);   // 4. and only now, positions
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
    /* HOW FAR A SIDEWAYS SWIPE HAS TO TRAVEL to count, and it is a share of the APP's width rather
       than the window's — the same mistake `stepX_` had. On a window wider than the app column a
       swipe had to cross more than the app is wide to register, so it took a longer drag to turn a
       page than the page itself occupies. */
    span: () => appWidth_(),
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
    /* THE SAME DISTANCE the threshold and the settle use — see `stepY_`. This said `innerHeight`,
       which is the SCREEN rather than the step, so a vertical gesture was judged against a number
       it was never travelling. */
    span: () => stepY_(),
    /* EVERY ONE OF THESE TAKES AN `id`, defaulting to the screen in front. They used to read `AT`
       and nothing else, so the pages of a screen you were about to swipe onto could not be placed
       until you were already on it — and a page that has not been placed sits at its resting
       position, which is off the side at zero opacity. A blank screen with a sliver of its
       neighbour showing. */
    at:    id => PAGE[id || AT] || 0,
    count: id => PAGER[id || AT] ? pageCount(id || AT) : 0,
    /* WHAT MOVES, which is the screen — the pages are stacked inside it by CSS and never carry a
       transform of their own. This returned the pages, and the only thing it is used for is taking
       the transition off whatever is being dragged; taking it off a page that does not animate did
       nothing, so a vertical drag was fighting a 260ms ease all the way. */
    cells: id => [$('s-' + (id || AT))].filter(Boolean),
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
/* ---------- HOW WIDE A CARD IS, AND HOW MUCH OF THE NEXT ONE YOU CAN SEE -------------------------
   TWO NUMBERS, BOTH FRACTIONS OF THE SCREEN, and the sideways gap falls out of them rather than
   being a third thing to keep in step.

   It was a width and a gap in PIXELS, and the edge you could see of a neighbour was whatever those
   two happened to leave over — 3.5px on a normal phone, which is not an edge, it is a hairline.
   Worse, it changed with the screen: a fixed 16px gap against a percentage width means a small
   phone shows less of the next card than a large one, so the thing that tells you there IS a next
   card is weakest exactly where the screen is tightest.

   Stated the way it is actually looked at instead: the card is 88% of the screen and you see 4% of
   each neighbour. Both hold on every phone, and the gap is whatever is left — about 8px at 390px
   wide, more on a larger screen, which is right, because a bigger card wants a bigger gap. */
const CARD_W       = 0.80;    // a card, as a fraction of the screen's width
const EDGE_SHOWING = 0.08;    // how much of the card either side you can see, same units

/* THESE TWO COME OUT OF THE SAME WIDTH, which is the whole thing to understand before changing
   either. Across the screen sits: an edge, a gap, the card, a gap, an edge —

     2 × EDGE_SHOWING  +  2 × gap  +  CARD_W  =  1

   so `gap` is not a third setting, it is what is left: `0.5 − CARD_W/2 − EDGE_SHOWING`. Show more
   of the neighbour and the card gets narrower by exactly that much; there is nowhere else for the
   room to come from.

   AND THE GAP MUST NOT GO NEGATIVE. A negative gap is cards overlapping, and it would not throw or
   warn — the neighbour would simply creep over the one you are reading, which reads as a rendering
   fault rather than as two numbers that do not fit. `stepX_` refuses it below rather than drawing
   it. */
/* Kept under its old name because the vertical spacing still uses it and 16px is right there —
   a column of cards is read one after another, and the gap only has to say "these are separate". */
const CELL_GAP   = 16;        // pixels between one card and the next, going DOWN

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
/* ---------- THE BROWSER STACKS THE COLUMN, NOT THIS FILE -----------------------------------------
   OVERLAP IS NOW IMPOSSIBLE, and that is the point of the change rather than a happy result of it.

   Every version of this until now worked out where each card should go — a step, then a step times
   a distance, then a running total — and every version was correct arithmetic that produced wrong
   answers, because all of them depended on measuring a card at a moment when its contents might
   not be there yet. On this screen the contents genuinely arrive late: pages are built as you come
   near them. So there is no moment at which measuring is reliable, and no amount of care in the
   sum can fix a sum whose inputs are not ready.

   So the sum is gone. The pages are laid out by CSS as an ordinary column with a 16px gap, which
   is a thing browsers do perfectly and re-do by themselves the instant anything on the page
   changes size. Two boxes in a column cannot overlap — not late, not early, not ever.

   WHAT IS LEFT FOR THIS FILE: sliding the whole column so the page you are reading is in the
   middle of the screen. One number, from `offsetTop`, which the browser maintains. And if it is
   ever read at a bad moment the worst that happens is the column sits a little high or low for a
   frame — never one card on top of another. */
function columnShift_(host, at) {
  const pages = host.querySelectorAll(':scope > .page');
  const cur = pages[Math.max(0, Math.min(pages.length - 1, at))];
  if (!cur) return 0;
  const boxH = host.clientHeight || innerHeight;
  return boxH / 2 - (cur.offsetTop + cur.offsetHeight / 2);
}

/* ---------- HOW FAR IT IS TO THE NEXT CARD DOWN ---------------------------------------------------
   MEASURED ONCE, IN ONE PLACE, and this is the whole reason down never felt like across.

   Three different numbers were guessing at it: `innerHeight * 0.5` decided whether a drag had gone
   far enough to turn a page, `innerHeight * 0.6` decided how long the settle should take, and plain
   `innerHeight` decided how far a whole page was. All three were invented, none was measured, and
   they disagreed with each other and with the actual layout. Across has had `stepX_` from the
   start; down had three opinions and no answer.

   The real distance is on the screen already: the card you are on and the one below it are laid out
   by CSS, so the gap between them is a fact the browser maintains. Read from the two of them, and
   guessed at only when there is no second card — which is the case where there is nowhere to swipe
   to anyway. */
function stepY_() {
  const host = $('s-' + AT);
  const pages = host ? host.querySelectorAll(':scope > .page') : [];
  const at = Math.max(0, Math.min(pages.length - 1, PAGE[AT] || 0));
  const here = pages[at], next = pages[at + 1] || pages[at - 1];
  if (here && next) {
    const gap = Math.abs(next.offsetTop - here.offsetTop);
    if (gap > 20) return gap;
  }
  return innerHeight * 0.66;
}

/* ACROSS IS A CONSTANT — every card is the same width by rule, so there is nothing to measure. */
/* WHERE THE NEXT CARD SITS, from the two fractions above and nothing else.

   Half of this card, plus the gap, plus half of the next — and the gap is whatever makes exactly
   `EDGE_SHOWING` of that next card fall inside the screen. Written out:

     visible edge = half the screen − half a card − the gap
     so the gap   = 0.5 − CARD_W/2 − EDGE_SHOWING          (all fractions of the width)
     and the step = CARD_W + that gap = CARD_W/2 + 0.5 − EDGE_SHOWING

   One expression, no pixels, and it is right at every screen size because every term is a
   fraction of the same width. */
/* ---------- ONE SOURCE FOR THE CARD'S WIDTH ------------------------------------------------------
   THE STYLESHEET DREW THE CARD AND THIS FILE DECIDED WHERE THE NEXT ONE GOES, and the two had to
   be told the same number by hand. They were not: style.css said 80% and shell.js still spaced the
   columns for 90%, which put the neighbour's left edge sixteen pixels PAST the right of the screen.
   Nothing was dimmed and nothing was blank — the card either side was simply not on the screen, and
   from the outside that is indistinguishable from it not being drawn.

   So the number is published, once, from here — the file that also does the arithmetic. The
   stylesheet reads `--card-w` and has a fallback for the moment before this runs. Set them apart
   now and you cannot: there is only one of them. */
function publishCardWidth_() {
  document.documentElement.style.setProperty('--card-w', (CARD_W * 100).toFixed(2) + '%');
}

/* ---------- THE WIDTH THAT MATTERS IS THE APP'S, NOT THE WINDOW'S --------------------------------
   THIS IS WHY FIVE ROUNDS OF CHANGING THE NUMBERS NEVER MOVED ANYTHING.

   `body` is capped at `--app` — 26.5rem, about 424px — and centred, so on anything wider than a
   phone the app is a column with the page's own background either side. A card is 80% of THAT
   column. The step between columns was 80% of `innerWidth`, which is the whole WINDOW.

   On a phone narrower than 424px the two are the same number and everything worked. On a window
   465px wide the step is 381px against a card of 339px, and the neighbour's left edge lands at
   424px — exactly the right-hand edge of the app. Not dimmed, not blank, not drawn late: one pixel
   past the end of the visible column, on every screen wide enough for the cap to bite.

   So it asks the element. `#screen` is the box the cells actually live in and the box that clips
   them, so its width is the one every one of these fractions is a fraction OF. `innerWidth` is a
   fact about the browser window and has never been the right question. */
function appWidth_() {
  const el = $('screen');
  return (el && el.clientWidth) || innerWidth;
}

function stepX_() {
  /* THE GAP THE TWO FRACTIONS LEAVE, and a refusal if they leave none. Asking for a wide card AND a
     wide edge is asking for more than a screen has, and the honest answer is to keep the cards
     apart and show a little less of the neighbour rather than to let them overlap — an overlap is
     the one outcome that looks broken rather than merely tight. */
  const gap = Math.max(0.005, 0.5 - CARD_W / 2 - EDGE_SHOWING);
  return appWidth_() * (CARD_W + gap);
}

/* The two axes still call in — one placer underneath, so a horizontal move and a vertical one
   cannot disagree about where a cell is. */

function placeGrid(instant, drag) {
  /* Said before anything is measured or moved, so the width the stylesheet draws and the width
     this function spaces by cannot be different on the same frame. Setting a custom property that
     already holds that value costs nothing. */
  publishCardWidth_();
  const tabs = TABS.map(t => t.id);
  const ti = Math.max(0, tabs.indexOf(AT));
  const dxPx = (drag && drag.which === 'x') ? drag.px : 0;
  const dyPx = (drag && drag.which === 'y') ? drag.px : 0;
  const stepX = stepX_();

  tabs.forEach((id, i) => {
    const host = $('s-' + id);
    if (!host) return;

    /* A SCREEN IS THE COLUMN, and the column is what moves. Every page used to be positioned on
       its own; they now sit in an ordinary CSS column inside this and the whole thing slides. One
       transform per screen instead of one per page — and, the reason for the change, two boxes in
       a column cannot land on top of one another however late their contents arrive. */
    host.classList.remove('hidden');
    host.style.display = 'flex';
    host.style.position = 'absolute';
    host.style.top = '0'; host.style.right = '0'; host.style.bottom = '0'; host.style.left = '0';
    host.style.overflow = 'visible';
    host.classList.toggle('on', id === AT);
    /* No transition while a finger is down — the movement is the finger, not an animation. */
    host.classList.toggle('no-anim', !!drag);

    const dx = i - ti;
    const at = PAGE[id] || 0;
    /* Slid so the page being read sits in the middle. A vertical drag only ever moves the screen
       in front; the others have no finger on them. */
    const shift = columnShift_(host, at) + (id === AT ? dyPx : 0);

    host.style.transition = instant ? 'none' : '';
    host.style.transform =
      `translate(${(dx * stepX + dxPx).toFixed(1)}px, ${shift.toFixed(1)}px)`;
    /* Only the screen in front takes presses. A sliver of the next tab showing at the edge is
       something to look at, not something to tap. */
    host.style.pointerEvents = dx === 0 ? 'auto' : 'none';
    const across = Math.abs(dx);
    /* ---------- THE NEIGHBOUR IS BARELY DIMMED, AND HERE IS WHY -----------------------------
       This was `.55`, to say "behind" — and a dark card at 55% over a black app is very nearly
       black. What you see of a neighbour is a sliver: its bright top edge and its border, and
       nothing else. Those are `rgb(255 255 255 / .16)` on a `#101010` fill, which is already
       faint on purpose — put it behind 55% opacity and the edge renders at 30/255 against black.
       Drawn, and invisible.

       Exactly the fault the blur had: the ONE thing making a card visible was the thing being
       dimmed away, so the card was widened and the gap tightened twice over and neither could
       help. `.92` keeps the sense of something sitting behind without taking the edge with it. */
    host.style.opacity = across === 0 ? '1' : across === 1 ? '.92' : '0';
    /* AND SIDEWAYS, THE SAME. This was 1 — one tab either side — so with four tabs the far one was
       hidden until the swipe reached it, and a quick flick across two showed a blank in between.
       Held to the same 3 as the column, for the same reason and at the same cost: a handful of
       tabs is a handful of cards, and there is no version of this app where that is expensive. */
    host.style.visibility = across > 3 ? 'hidden' : 'visible';

    /* AND EACH PAGE, faded by how far down the column it is. No position — the column does that.
       This distance is an INDEX, not a measurement, so nothing here can be read at a bad moment. */
    host.querySelectorAll(':scope > .page').forEach((el, p) => {
      const d = Math.abs(p - at);
      el.style.position = 'static';
      el.style.transform = 'none';
      el.classList.toggle('on', id === AT && p === at);
      /* ---------- HOW MANY PAGES ARE KEPT VISIBLE EITHER SIDE ----------------------------------
         `.far` is `visibility: hidden`, so this number is exactly how many pages up and down the
         column are drawable at any moment. It was 2, which is what you see when you swipe quickly:
         the third one away arrives as a blank and fills in a beat later.

         THREE. One more each way is one more card's worth of work on a screen that is already
         drawing them all — the cost is the browser compositing a card nobody is looking at, and
         the gain is that a fast swipe never shows an empty rectangle. Beyond three the cost grows
         and the gain does not: nobody swipes four pages faster than a frame. */
      el.classList.toggle('far', d > 3);
      /* DIMMING ON A BLACK SCREEN IS DELETING.
         This was .5 and .25, which reads as "further away" on paper and is not what happens here:
         the card's fill is #101010 on black, so half of it is rgb(8) and a quarter is rgb(4) —
         two and one shades off pure black, invisible on a phone in any light. The card either side
         was being drawn and could not be seen, which is indistinguishable from it not being there.
         Barely dimmed instead. What says a card is behind rather than beside is its POSITION and
         its edge, both of which are already doing the work. */
      el.style.opacity = d === 0 ? '1' : d === 1 ? '.9' : d === 2 ? '.75' : '0';
      el.style.pointerEvents = d === 0 ? 'auto' : 'none';
      el.style.visibility = d > 3 ? 'hidden' : 'visible';

      /* A pane used to be measured here, to decide whether it had overflowed and should therefore
         get the vertical gesture back for scrolling. It cannot overflow any more — a card clips
         rather than scrolls — so every vertical drag is the grid's, on every card, everywhere on
         it. Nothing to measure and nothing to decide. */
    });
  });
}

/* ==================================================================================================
   ONE PLACEMENT PER FRAME, AND ANIMATION WINS

   THE BUG THIS EXISTS TO MAKE UNWRITEABLE. `go` started a sideways slide with `placeCells('x')`,
   and twenty lines later `paintPager(AT, true)` placed the grid again — and `true` means INSTANT,
   which writes `transition: none` onto every cell. So the slide was cancelled a millisecond after
   it began and the grid jumped to the new tab instead of moving there. Both calls were correct on
   their own. Nothing anywhere could see that together they were wrong.

   That is the shape of nearly everything that has gone wrong on this screen: not a wrong call, but
   two right ones in the same turn, disagreeing. So placing stops being something anybody DOES and
   becomes something anybody may ASK FOR.

   THE RULES, and they are the whole of it:
     · asking twice in one turn places once
     · if ANY asker wants it animated, it animates — an instant placement can cancel an animation,
       and an animation can never damage an instant one, so animation is the safe side to lose to
     · a drag places THIS INSTANT, because it is following a thumb and a frame of delay is a frame
       of lag; and it never batches, because there is nothing to batch with

   What this deletes is the need to know, at every call site, whether anybody else is about to
   place the grid. Nobody can know that. Now nobody has to.
================================================================================================== */
let PLACE_WANT = null;      // { which, instant, id } — what has been asked for this turn
let PLACED_ONCE = false;    // the very first placement runs now, not next frame
let PLACE_FRAME = 0;

function placeCells(which, instant, dragPx, id) {
  /* A DRAG IS NOT A REQUEST. It is already once-per-frame — `pointermove` books its own frame —
     and it must land now rather than next frame. Straight through. */
  if (dragPx) return placeNow_(which, instant, dragPx, id);

  /* THE FIRST ONE IS NOT DEFERRED. Until the grid has been placed once, every cell is sitting at
     the same spot with no transform on it — so a frame's delay is a frame of the whole app stacked
     on top of itself, which is a flash on boot and on every screen drawn for the first time.
     After that there is always a previous position to hold, and a frame is invisible. */
  if (!PLACED_ONCE) { PLACED_ONCE = true; return placeNow_(which, instant, 0, id); }

  if (!PLACE_WANT) {
    PLACE_WANT = { which, instant: !!instant, id };
  } else {
    /* ANIMATION WINS. One asker wanting a slide and another wanting it instant is the exact
       collision above, and the slide is the one that must survive. */
    PLACE_WANT.instant = PLACE_WANT.instant && !!instant;
    if (which) PLACE_WANT.which = which;
    if (id !== undefined) PLACE_WANT.id = id;
  }

  if (PLACE_FRAME) return;
  PLACE_FRAME = requestAnimationFrame(() => {
    PLACE_FRAME = 0;
    const w = PLACE_WANT;
    PLACE_WANT = null;
    if (w) placeNow_(w.which, w.instant, 0, w.id);
  });
}

/* THE PLACEMENT ITSELF. Everything that used to be `placeCells` — nothing about it changed except
   that it is no longer what the rest of the app calls. */
function placeNow_(which, instant, dragPx, id) {
  placeGrid(instant, dragPx ? { which, px: dragPx } : null);

  /* THE TWO SWEEPS BELOW DO NOT RUN WHILE A FINGER IS DOWN.

     Both answer questions about what EXISTS — which panes to watch, which screens no tab points at
     — and nothing is created or destroyed during a drag. They were running on every frame anyway:
     a full disconnect and re-observe of every pane in the document, and a second query over every
     screen, sixty times a second, to arrive at the same answer each time.

     That is most of what made a sideways swipe feel heavy, and none of it was doing anything. They
     run when the drag ends, which is when the answer can have changed. */
  if (dragPx) return;

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
  /* `book` WAS HERE — a pager for a column that no longer exists. Find has its own count. */

  /* Empty names, one per post. The pager needs the COUNT — that is what it pages through — and
     a post has no name worth putting in a header: "1 of 10" is a fact about the list rather than
     about the photograph, and it changed on every swipe where a title should hold still.
     Empty falls through to the tab's own title, so no special case is needed anywhere. */
  /* One name per page, and the ＋ card is a page — so it is counted here too, or the pager stops
     one short and the last post can never be reached. The count and the render come from the same
     two facts on purpose: a pager that disagrees with its own screen is a post that exists and
     cannot be swiped to. */
  /* The ＋ card is a page and everybody signed in has one, so everybody's count includes it. This
     said `isAdmin()`, which was right while only an admin had the card — and would now stop the
     pager one short for everybody else, which is a post that exists and cannot be swiped to. */
  /* ---------- THE FEED IS FOUR KINDS OF PAGE NOW, NOT TWO ------------------------------------------
     SPOTLIGHT AND THE FESTIVE CARDS JOINED IT and this counted neither, so the pager ran short by
     however many of them there were — and `paintPager` clamps to the names it is given, which makes
     the tail of the feed unreachable from the header. Exactly the fault the Find pager had when
     saved things became pages: a count kept by hand beside a list built somewhere else.

     Each group asks the function that DRAWS it. `spotPages` and `DATA.festive` are what `posts.js`
     splices in, so the two cannot disagree. */
  /* GUARDED, because shell.js is file five and collections.js is file twenty-one. Both of these run
     long after the load — but `paintPager` fires on the app's first frame, and a `ReferenceError`
     there takes the whole boot with it. The same guard `posts.js` uses. */
  posts:  () => (typeof spotPages === 'function' ? spotPages() : []).map(() => '')
    .concat(USER ? [''] : [])
    .concat((DATA.festive || []).map(() => ''))
    .concat(feedPosts().map(() => '')),
  /* The controls, then the results. Named so the header says which page of how many — on a list
     you are working through, that is the one thing a title cannot tell you and the number is
     worth having. */
  /* ---------- THE FIND PAGER COUNTS EVERY PAGE, NOT JUST THE RESULTS -------------------------------
     IT NAMED TWO KINDS OF PAGE and there are four: the things you saved sit in front of the search,
     and the booking form sits between the search and the results. Named as "Search" plus N results,
     the pager ran short of the pages actually there — and `paintPager` clamps to the names it is
     given, so the tail of the list became unreachable by the header even though the pages existed.

     Each group asks the function that DRAWS it how many there are, which is the same rule the rest
     of this table follows: a pager that counts for itself is a pager that can disagree. */
  stuff:  () => {
    const n = stuffPageCount();
    return Array.from({ length: savedPages_().length }, () => 'Saved')
      .concat(['Search'])
      .concat(Array.from({ length: bookingPages_().length }, () => 'Booking'))
      .concat(Array.from({ length: n }, (_, i) => (i + 1) + ' of ' + n));
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
/* ---------- WHERE EACH COLUMN OPENS ---------------------------------------------------------------
   NOT ALWAYS THE TOP, and that is the point. Every column started at page 0, which is the first
   thing built rather than the first thing worth reading:

     posts  page 0 is the ＋ New post card, added by `unshift` for anybody signed in. So the app
            opened on a form to make a post rather than on the most recent post — the feed's own
            front page is the one BELOW it.
     me     page 0 is the name and role card. The thing somebody actually came for is the one after.

   A DEFAULT IS A JUDGEMENT ABOUT WHAT SOMEBODY CAME FOR, and 0 is only the right answer when the
   first pane happens to be it. Written per column so it can differ, and so changing one is a number
   rather than an argument about ordering.

   IT IS ONLY THE OPENING POSITION. `PAGE` is live from then on — leave Tools on the calendar and
   coming back puts you on the calendar, which is the behaviour that was always here and is worth
   keeping. This decides where a column stands the first time it is drawn, and never again. */
/* A FUNCTION, NOT A NUMBER, and the Posts column is why. Its first pane is the ＋ New post card,
   which is only there for somebody signed IN — so a fixed 1 opens on the newest post for them and
   on the SECOND newest for a visitor, silently skipping the most recent thing the business posted
   to the one person most likely to be new.
   Asked at the moment the column is first drawn, when whether anybody is signed in is known. */
const PAGE_HOME = {
  /* ---------- SPOTLIGHT IS WHAT THE COLUMN OPENS ON, WHEN THERE IS ONE ---------------------------
     It is the business choosing what to put in front of people, and a thing put in front of people
     that opens one swipe behind them is a thing nobody sees — which is what happened to it as a
     column and is the reason it moved.

     WITH NOTHING SPOTLIT, NOTHING CHANGES: past the ＋ card if it is there, on the newest post
     either way. */
  posts: () => ((typeof spotPages === 'function' && spotPages().length) ? 0 : (USER ? 1 : 0)),
  me:    () => (USER ? 1 : 0),      // past the name card; signed out there is only the sign-in pane
};
/* `book` WAS HERE — a column that no longer exists. */
const PAGE = { posts: 0, stuff: 0, me: 0 };

/* WHETHER A COLUMN HAS BEEN OPENED YET. The home position applies once — after that `PAGE` is where
   somebody left it, and putting them back at the top every time is a pager they have to
   re-navigate on every glance at another tab. */
const PAGE_OPENED = {};
function pageHome_(id) {
  if (PAGE_OPENED[id]) return;
  const home = PAGE_HOME[id];
  if (!home) { PAGE_OPENED[id] = true; return; }

  /* ---------- NOT UNTIL THE COLUMN IS THE SHAPE IT WILL BE -------------------------------------
     THIS RAN AT BOOT AND WAS THEREFORE ALWAYS WRONG. `paintPager` fires while the app is drawing
     its first frame, long before the payload has landed — so `feedPosts()` was empty, the column
     was one pane long, and `Math.min` clamped the home position to 0. `PAGE_OPENED` then marked it
     done for ever, and signing in or the posts arriving could never put it right. The ＋ card stayed
     the front page and looked like the setting had simply been ignored.

     TWO CONDITIONS, and both are about the column being real yet:

       · THE PAGES HAVE TO EXIST. A column of one pane cannot honour a home position of 1, and
         clamping against a count of nothing is how this failed.
       · SOMEBODY HAS TO BE SIGNED IN OR NOT, SETTLED. `USER` is null for the whole of the first
         frame and is filled from localStorage a moment later, and it is the thing that decides
         whether the ＋ card is there at all — so asking before it is known is asking the wrong
         question and recording the answer permanently.

     Until both hold, this does nothing AND DOES NOT MARK ITSELF DONE, so the next paint asks
     again. Once they hold it applies once and never again — which is the original promise: the
     home position is where a column OPENS, not somewhere it keeps returning to. */
  if (pageCount(id) < 2) return;
  if (!LOADED) return;

  PAGE_OPENED[id] = true;
  const n = home();
  PAGE[id] = Math.max(0, Math.min(n, Math.max(0, pageCount(id) - 1)));
}

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
  /* THE HOME POSITION, on first sight of this column only. Here rather than at startup because the
     pages do not exist until now — a count taken before the screen is built is a count of nothing,
     and clamping against it would put every column back at 0. */
  pageHome_(id);
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
  /* MOVE FIRST, FILL AFTER — as long as the page being turned to is already there.

     `fillStuffPages` keeps two pages ready either side, which is further than anybody can swipe in
     one gesture, so normally there is nothing to build at this moment and nothing to wait for.
     Whatever has newly come into range is built once the grid has settled.

     But "normally" is not "always": jumping several pages at once, or arriving before the first
     fill has run, lands on a page with nothing on it. An empty pane has no height, so the grid
     places it as though it were nothing and the cards around it come out on top of one another.
     If the page you are going to is empty, it is filled before anything moves. */
  /* Page 0 is the question, which is drawn with the screen and never filled lazily — so it has no
     `filled` mark and must not be mistaken for an empty one. */
  const bare = id === 'stuff' && n > 0 && (() => {
    const host = $('s-stuff');
    const el = host && host.querySelectorAll(':scope > .page')[n];
    return !el || el.dataset.filled !== '1';
  })();
  if (bare) fillStuffPages();
  if (id === AT) placeCells('y', instant);
  if (id === 'stuff' && !bare) afterSlide_(fillStuffPages);
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
/* ---------- THE MARKS, ADOPTED FROM THE PAYLOAD JUST LANDED ------------------------------------
   BOTH SETS, AND AFTER `DATA` IS THE NEW ONE. `adoptFavourites_` used to be called a few lines
   ABOVE the `DATA = new Proxy(d, ...)` assignment, so it read `DATA.favourites` off the payload
   BEFORE this one — one load behind on every load, and on the very first load `DATA` is `{}` so
   it adopted nothing at all. Every star was device-only and nobody could have seen why.
   Called from `adoptMarks_` so the two cannot drift apart again. */
function adoptMarks_() {
  try { adoptFavourites_(); } catch (e) {}
  try { adoptSpotlight_(); } catch (e) {}
}

const pages = (id, cards) =>
  cards.map(c => `<section class="page"><div class="pane">${c}</div></section>`).join('');

/** The glass inside a page — where content actually goes. */
/* THE PANE INSIDE A PAGE — AND ONE IS MADE IF THERE IS NOT ONE.

   This has been three things and only the third is right.

   IT WAS `|| el`: no pane, so the contents were written into the PAGE, which threw the glass away
   and drew the cards straight onto the black. Silent, and it looked like a screen half finished.

   THEN IT RETURNED NOTHING, so the caller could skip rather than write somewhere wrong. Honest, and
   it made this file depend on another one: a page built without a pane got nothing at all, so an
   older `find.js` beside a newer `shell.js` meant the filter did nothing when pressed. A fix that
   only works when two files are updated together is a fix that breaks when one of them is not.

   NOW IT BUILDS THE MISSING PANE. The contents want a pane; if there is not one, that is a thing to
   put right rather than a reason to give up. Nothing can go wrong whichever file is newer, no
   caller has to check, and the glass is right either way. */
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

/* THE CARD THAT WAS PRESSED, caught on its way past.

   The click handler sees the element; `openSheet` is called from inside the handler for it and is
   given a title and some markup, not an element. Rather than thread a fifth argument through every
   one of the fifty handlers that opens a sheet — most of which do not care — the press is recorded
   as it goes by and used if a sheet opens during the same press.

   CLEARED THE INSTANT IT IS USED, so a sheet opened a second later by something else does not grow
   out of a card somebody pressed before. It is only ever true for the length of one click. */
let SHEET_FROM = null;

/**
 * The four numbers that say where the panel starts: the middle of the card, and how big it is
 * beside the panel. Written as custom properties for the stylesheet to animate from.
 *
 * MEASURED AGAINST THE SCREEN, not the document — a fixed panel is positioned against the viewport,
 * so an origin measured any other way would be right only while nothing had scrolled.
 */
function setSheetOrigin_(el) {
  const root = $('sheet');
  if (!root) return;
  const st = root.style;
  if (!el || !el.getBoundingClientRect) {
    /* From the middle, at nearly full size — a small, quiet arrival rather than nothing at all. */
    st.setProperty('--from-x', '0px');
    st.setProperty('--from-y', '0px');
    st.setProperty('--from-s', '.94');
    return;
  }
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) { st.setProperty('--from-s', '.94'); return; }

  const panel = root.getBoundingClientRect();
  const px = panel.left + panel.width / 2;
  const py = panel.top + panel.height / 2;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  /* HOW SMALL IT STARTS: the card's width against the panel's. Floored, because a very small card
     — a chip, an arrow — would otherwise start as a dot and read as an explosion rather than as
     something opening. */
  const scale = Math.max(.25, Math.min(1, r.width / (panel.width || r.width)));
  st.setProperty('--from-x', Math.round(cx - px) + 'px');
  st.setProperty('--from-y', Math.round(cy - py) + 'px');
  st.setProperty('--from-s', scale.toFixed(3));
}

/* ---------- WHAT THE SHEET IS ONE OF -------------------------------------------------------------
   A SHEET IS OPENED WITH A TITLE AND SOME HTML AND KNOWS NOTHING ELSE, which is why reading three
   past papers meant open, close, swipe, open, close, swipe. The card underneath is one of a list —
   the app knows that; the sheet was simply never told.

   `step` IS OPTIONAL AND IS THE WHOLE OF IT. A caller that has neighbours hands over a function
   taking -1 or 1; it returns true if it moved, having re-opened the sheet on the next one. A caller
   with nothing to step through passes nothing and the sheet behaves exactly as it always has, which
   is what keeps this from being a change to twenty-five call sites. */
let sheetStep = null;

function openSheet(title, html, onClose, step) {
  /* A SHEET OPENED OVER A SHEET. The second overwrote the first and the first's `onClose` was
     dropped on the floor — never called, and then replaced, so whatever it was going to put right
     never happened. Rare, and the kind of thing that goes unnoticed for a year and then loses
     somebody's half-typed booking.
     Run it first, so opening a second sheet is the same as closing the first and opening one. */
  if (sheetOnClose) { const f = sheetOnClose; sheetOnClose = null; try { f(); } catch (err) {} }

  /* SET AFTER the old sheet's `onClose` above, which may itself open a sheet. */
  sheetStep = typeof step === 'function' ? step : null;

  /* ---------- WHERE IT GROWS FROM -----------------------------------------------------------
     The panel opens OUT OF the thing you pressed. Measured here, at the moment of opening, because
     that is the only moment the card is definitely on the screen and definitely where it looks —
     a rectangle remembered earlier would be a rectangle from before the last placement.

     Four numbers, published as custom properties, and the stylesheet does the rest. No animation is
     driven from JavaScript: the panel simply has a closed shape and an open one, and the transition
     between them is the same `.hidden` rule that was already there. Nothing new can get out of
     step, because there is nothing new to keep in step.

     NO CARD, NO ORIGIN — and then it grows from the middle, which is what a panel with no parent
     should do. That is the case for a sheet opened by a button in the header, or from the keyboard,
     and it should not look like a mistake. */
  /* ---------- ALREADY OPEN? THEN IT DOES NOT MOVE ------------------------------------------
     The booking wizard opens a sheet, you answer, and it opens the next one — six times over. The
     calendar does the same, and so does a reaction list opened from inside a post.

     In every one of those the panel is ALREADY in the middle of the screen, and the thing that was
     pressed is INSIDE it. Growing from that would shrink the panel into one of its own options and
     blow it back up, which reads as a glitch rather than as a step forward: nothing arrived, you
     answered a question and got the next one.

     So the origin is only set when the panel is actually opening. Answering inside an open one just
     swaps what it says, which is what it looks like from the outside and now what it is. */
  const wasOpen = !$('sheet').classList.contains('hidden');
  if (!wasOpen) setSheetOrigin_(SHEET_FROM);
  SHEET_FROM = null;

  $('sheet-title').textContent = title;
  $('sheet-body').innerHTML = html;
  $('sheet').classList.remove('hidden');
  $('sheet-back').classList.remove('hidden');
  sheetOnClose = onClose || null;
  /* The page behind must not scroll while a sheet is open — two scrolling things at once is the
     thing that makes a phone feel broken. */
  document.body.style.overflow = 'hidden';
}

/* ---------- CLOSING IT --------------------------------------------------------------------------
   THE CONTENTS USED TO BE THROWN AWAY ON THE SAME LINE that started it closing — so the panel slid
   down EMPTY, which is half of why the ending looked wrong. What you want to see is the thing you
   were reading going away, not an empty box going away.

   So the class goes on now and the contents go once the slide has finished. The delay matches the
   transition in the stylesheet, and if the two ever drift the worst case is a panel that empties a
   little early or a little late — not a panel that breaks.

   EVERYTHING ELSE HAPPENS AT ONCE, deliberately. The page behind can scroll again immediately, and
   `onClose` runs immediately, because those are about the app rather than about the animation and
   waiting a quarter of a second to save something would be an animation deciding when work happens.
--------------------------------------------------------------------------------------------- */
let sheetClear = 0;

function closeSheet() {
  sheetStep = null;
  $('sheet').classList.add('hidden');
  $('sheet-back').classList.add('hidden');
  document.body.style.overflow = '';
  const f = sheetOnClose; sheetOnClose = null;
  if (f) { try { f(); } catch (err) { console.error('[sheet onClose]', err); } }

  /* Emptied after it has gone. A second close before the first has finished cancels the pending
     one rather than stacking another — otherwise a fast double-close empties the sheet somebody
     has just reopened. */
  clearTimeout(sheetClear);
  sheetClear = setTimeout(() => {
    /* Only if it is still closed. Reopened in the meantime and there is nothing to tidy — the new
       contents are somebody's, not the old sheet's to throw away. */
    if ($('sheet') && $('sheet').classList.contains('hidden')) $('sheet-body').innerHTML = '';
  }, 300);
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
  /* ---------- THE TOKEN GOES ON EVERY REQUEST, FROM ONE PLACE ------------------------------------
     ADDED HERE BECAUSE EVERY WRITE IN THE APP COMES THROUGH THIS FUNCTION. Threading it through
     forty call sites would mean forty chances to forget one, and the one forgotten is a feature
     that stops working for everybody signed in — or worse, a handler that falls back to trusting a
     name because that is what it was given.

     A REQUEST WITH NO TOKEN IS STILL SENT. Registering and signing in have none by definition, and
     the gate decides which actions need one. */
  const b = Object.assign({}, body);
  if (!b.token && typeof USER === 'object' && USER && USER.token) b.token = USER.token;
  return fetch(API, { method: 'POST', cache: 'no-store', body: JSON.stringify(b) })
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
    /* ---------- AN ACTION THE LIVE BACKEND HAS NEVER HEARD OF -------------------------------------
       "THAT ACTION IS NOT RECOGNISED" IS THE WRONG SENTENCE. It reads as "you did something wrong",
       and nine times out of ten it means "the .gs file has not been pasted in yet" — a fault in a
       deploy step, not in anything the person just pressed. The payload has advertised `features`
       since before the rewrite and nothing ever read it, so the app had the answer all along and
       never used it.
       Now it says which, and which version is live, so the next move is obvious. */
    if (d && d.error && /unknown action|not recognis/i.test(String(d.error))) {
      const act = (String(d.error).match(/:\s*(\w+)/) || [])[1] || 'that action';
      const has = (DATA.features || []).indexOf(act) !== -1;
      throw new Error(has
        ? act + ' is not working — the backend knows it but returned an error'
        : 'The backend does not have `' + act + '` yet. Paste the newest .gs files into Apps '
          + 'Script and deploy. Live version: ' + (DATA.version || 'unknown'));
    }
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

/* Asking again. A failure that offers no way to retry costs a whole page reload, and on a phone a
   reload is the thing most likely to lose whatever was half-typed on another screen. */
on('retry', () => { LOADED = false; LOAD_FAILED = ''; banner(''); splashOn_(); repaint(); load(); });

/* CARDS OPEN A SHEET, and an attempt to open them in place has been taken out again.

   The idea was sound and the reason for it still holds — a sheet is for a task, and reading a thing
   you just tapped is not a task. What went in was not: the detail replaced the card's own pane, so
   it had to be remembered, restored, and put back on every move — three states where there had been
   one, and every one of them a way for a card to come back wrong.

   The sheet has none of that. It is one surface, it is over everything, and closing it leaves what
   was underneath exactly as it was because nothing underneath was touched.

   If it is worth doing again it wants a different shape: a page of its own that the grid navigates
   to, rather than a pane rewritten in place. Then going back is a swipe, which the grid already
   knows how to do, and there is no state to keep. */


/* ---------- WHAT HAPPENED WHEN YOU PRESSED THAT ---------------------------------------------------
   Type `clicks()` in the console and press something. Every press then prints what this handler
   actually saw: what was under your finger, the nearest thing carrying a `data-do`, whether a
   handler is registered for it, and whether it ran.

   IT EXISTS BECAUSE GUESSING HAS COST FOUR ROUNDS. "Nothing happens when I click" has exactly four
   causes and they need completely different fixes:

     the scripts never loaded        — no listener at all, so nothing prints
     nothing carries a `data-do`     — the press lands on plain markup
     it does, and no handler is on   — the name in the markup and the name in `on()` disagree
     the handler ran and did nothing — the fault is inside it

   From the outside all four look identical. This says which, in one line, without anybody having
   to read a file. Off unless asked for, so it costs nothing. */
let CLICK_LOG = false;
function clicks(on) {
  CLICK_LOG = (on === undefined) ? !CLICK_LOG : !!on;
  console.log(CLICK_LOG
    ? 'Watching presses. Tap something. `clicks(false)` to stop.'
    : 'Stopped watching presses.');
  return CLICK_LOG;
}

document.addEventListener('click', e => {
  if (CLICK_LOG) {
    const d = e.target.closest('[data-do]');
    console.log('[click]', {
      pressed: e.target.tagName + (e.target.className ? '.' + String(e.target.className).split(' ')[0] : ''),
      nearestAction: d ? d.dataset.do : '(nothing carries a data-do)',
      handlerRegistered: d ? !!ACTIONS[d.dataset.do] : false,
      /* A select or a checkbox is deliberately handled by `change` instead, so "no handler ran" is
         the right answer for those and not a fault. */
      handledByChange: !!(d && (d.tagName === 'SELECT' || d.type === 'checkbox')),
    });
  }
  const tab = e.target.closest('.tab');
  if (tab) { go(tab.dataset.tab); return; }

  if (e.target.closest('#sheet-close') || e.target.id === 'sheet-back') { closeSheet(); return; }

  const doer = e.target.closest('[data-do]');
  /* THE CARD, remembered for the length of this press. If a handler opens a sheet, it grows out of
     whatever was pressed; if none does, this is cleared on the next press and nothing has happened.
     The visible CARD rather than the exact target, so pressing a word inside a card opens from the
     card and not from the word. */
  SHEET_FROM = e.target.closest('.card, .rc, .rc-stub, .paper, .pass, .slip, .post, .thing') || doer;
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
/* ---------- THE ARROW KEYS ------------------------------------------------------------------------
   The grid is a grid, and a grid is the one shape arrow keys already mean something on. Somebody at
   a keyboard has been able to swipe with a mouse and not to press right — which on a screen laid
   out in columns and rows is the obvious thing to try first.

   THE SAME MOVES A SWIPE MAKES, not their own path: `AXES` already holds what a direction means and
   `ax.go` already handles the ends, the animation and the remembering. A second way in that did its
   own arithmetic would be a second thing to keep in step, which is how the two axes came apart in
   the first place.

   NOT WHILE SOMEBODY IS TYPING. An arrow key in a search box moves the caret, and stealing it to
   turn a page is the app deciding it wanted the keystroke more than the person did. A sheet is the
   same case: it is over the grid, so the grid is not what the keys are for. */
const ARROWS = { ArrowLeft: ['x', -1], ArrowRight: ['x', 1],
                 ArrowUp: ['y', -1], ArrowDown: ['y', 1] };

addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('sheet').classList.contains('hidden')) { closeSheet(); return; }

  const arrow = ARROWS[e.key];
  if (!arrow) return;
  /* A modifier means the key belongs to the browser — ⌘← is back, alt+arrow is word-by-word. */
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  /* Typing, or anywhere a caret could be. `isContentEditable` catches the cases a tag name does
     not, which is the sort of thing a list of tag names quietly misses. */
  const t = e.target;
  if (t && (t.isContentEditable
    || /^(input|textarea|select)$/i.test(t.tagName || ''))) return;
  /* The sheet is over the grid; while it is open the grid is not what these are for. */
  if (!$('sheet').classList.contains('hidden')) return;

  const ax = AXES[arrow[0]];
  if (!ax || ax.count() < 2) return;
  e.preventDefault();
  ax.go(ax.at() + arrow[1]);
});

/* THE EDGES OF THE SCREEN were tappable from here — a second `click` listener that turned to the
   next card when you pressed the sliver either side.

   REMOVED, because it was a SECOND click listener on the document. Everything this app does runs
   through one, and the whole reason that is true is so there is one place where a press is decided.
   A second one meant two things reading every press and each having to be careful not to take one
   meant for the other — and being careful is not the same as being unable to get it wrong.

   The arrow keys stay: a key is not a press and cannot be confused with one. */



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
    /* ---------- A DEADLINE, BECAUSE A REQUEST THAT NEVER ANSWERS IS THE WORST FAILURE -------------
       `fetch` waits for ever by default, and `splashOff_()` is at the END of this function — the
       only place the loading screen ever comes off. So a backend that hung left the app behind the
       roundel indefinitely with the animation still playing, and nothing on screen could tell
       "still trying" from "will never finish". That is why it survived: every other failure here
       ends with a message and a Retry.

       A RACE, NOT AN ABORT. `AbortController` is tidier and is one more thing that has to exist on
       every browser this runs on — and this line is the one every single load goes through, so
       anything it depends on that is missing takes the whole app down behind a splash that never
       lifts. A promise that rejects on a timer needs nothing but `setTimeout`.

       THE REQUEST IS NOT CANCELLED, and that is the honest trade: it carries on and its answer is
       thrown away. For a GET that reads a spreadsheet that costs nothing — no write happens and the
       work at the server was going to finish anyway. Not waiting for ever was the point.

       SIXTY SECONDS, and the number is not arbitrary: this backend answers in about fifteen. A
       deadline shorter than the thing it is timing cancels every request and reports it as "no
       answer", which reads exactly like a dead backend and is one caused by the timeout meant to
       diagnose it. That happened, at twelve seconds, and cost an afternoon. */
    let bell;
    const deadline = new Promise((unused, no) => {
      bell = setTimeout(() => {
        const e = new Error('timeout');
        e.name = 'AbortError';
        no(e);
      }, 60000);
    });
    let res;
    try {
      /* FROM A FILE, ASK A DIFFERENT WAY. `fetch` is refused outright by a page with no origin;
         a script tag is not. Served properly — Live Server, GitHub Pages — `fetch` is better in
         every way and this stays out of the way. */
      res = await Promise.race([
        location.protocol === 'file:'
          ? jsonp(API + who + bust)
          : fetch(API + who + bust, { cache: 'no-store' }),
        deadline]);
    } finally {
      /* Cleared whichever way it went, or a load that answered at 59 seconds leaves a timer running
         to reject a promise nobody is holding. */
      clearTimeout(bell);
    }
    /* JSONP HANDS BACK THE VALUE ITSELF — a script tag delivers a value, not a reply, so there is
       nothing to unwrap. Given the shape of a response so the code below need not know which route
       it came by.
       HELD IN ITS OWN NAME FIRST: written as `res = { json: () => res.__jsonp }` it reads the
       variable it is in the middle of replacing, so `json()` returns undefined and the payload is
       silently dropped — which looks exactly like a backend answering with nothing. */
    if (res && res.__jsonp) {
      const got = res.__jsonp;
      res = { ok: true, status: 200, statusText: 'OK', json: () => got };
    }
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
      /* REMEMBERED FOR THE NEXT LOAD. The splash is chosen while the page is still parsing — that
         is what makes it right on the first frame — so it cannot ask DATA which have been retired.
         It reads what the last visit left here instead: one load behind, which for a decorative
         choice nobody will notice, and the alternative is a splash that changes after it appears. */
      try { localStorage.setItem('splashOff', JSON.stringify(d.splashOff || [])); } catch (e) {}
      /* AND THE STARS THE SHEET KNOWS ABOUT — see `adoptFavourites_`. Called here rather than in
         `find.js` because this is the moment a payload becomes DATA, and a favourite read before
         that is the last device's guess. */
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

      /* THE STARS AND THE SPOTLIGHTS, from the payload that has just landed. Called HERE rather
         than a few lines above, which is where `adoptFavourites_` used to sit: up there `DATA` was
         still the PREVIOUS payload, so every load adopted the load before it and the very first
         one — where `DATA` is `{}` — adopted nothing. */
      adoptMarks_();

      /* ---------- THE WATCHDOG'S MESSAGE IS NOT TRUE ANY MORE ---------------------------------
         THE PAYLOAD ARRIVED. Whatever the 30-second watchdog in index.html wrote is now a
         statement about a load that has since finished — "Still loading… Data: not yet" sitting
         above a screen full of posts, which is the app contradicting itself in the one place
         somebody looks when they think it is broken.

         NOTHING TOOK IT DOWN. The watchdog writes straight to the element and only `retry` ever
         cleared it, so a slow load that SUCCEEDED looked exactly like one that never did — and
         reading that banner is what has sent us both after the wrong thing more than once today.

         CLEARED HERE, first thing, before any of the checks below get their turn to write their
         own. If one of them has something to say it says it a line later and this has not eaten
         it; if none of them does, the banner goes, which is the truthful outcome. */
      if (LOAD_SLOW) banner('');

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
        /* ---------- A PAGE OPENED FROM A FILE CANNOT REACH ANYTHING -------------------------------
           THE COMMONEST CAUSE OF THIS EXACT MESSAGE, and this told people to go and check their
           deployment instead. Double-click index.html and the browser gives the page the origin
           `null`, then refuses any request to another address INSTANTLY — no network, no status,
           "Failed to fetch" in zero seconds. Nothing is wrong with the backend, the deployment or
           the code, and every minute spent looking at those is a minute wasted.

           IT IS KNOWABLE, WHICH IS WHY IT GOES FIRST. `location.protocol` says outright which
           situation this is, so the app never has to guess between two faults that produce the
           same words. */
        : location.protocol === 'file:'
        ? 'This page was opened from a file, so the browser blocked the request before it left — '
          + 'that is what “Failed to fetch” in no time at all means, and nothing is wrong with the '
          + 'backend. Serve the folder instead: in VS Code, right-click index.html → Open with '
          + 'Live Server. The address then starts http:// and everything works.'
        : /Failed to fetch|NetworkError|Load failed/.test(msg)
        /* Served properly and still nothing arrived — so now it IS the address or the access. */
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
  /* THE SPLASH COMES OFF HERE, and here is the only place it can: this line runs whether the
     payload arrived or the request failed, and a splash that only lifts on SUCCESS turns a failed
     load into a hang — the app would sit behind a tag that is still cheerfully being sprayed while
     the thing it is covering has already given up.
     Faded by a class rather than removed from the document, so a retry can put it back. */
  splashOff_();

  /* ---------- AND THE OFFER TO KEEP IT --------------------------------------------------------
     AFTER THE APP HAS DRAWN, not before. Asking somebody to put a thing on their home screen while
     they are still looking at a loading animation is asking about something they have not seen.
     Three seconds is long enough to have looked at the feed and short enough to still be there.

     It decides for itself whether to appear at all — installed already, dismissed before, opened
     from a file, or a browser that cannot do it — so this is one call and no conditions. */
  setTimeout(() => { try { installBar(); } catch (err) {} }, 3000);

  /* ---------- THE STALE SCREENS, CLEARED BEFORE THE REDRAW ---------------------------------------
     Every screen but the one in front was drawn before this request came back, so each holds a
     skeleton. Emptied here, and `repaint` below draws them again with the data that has just
     arrived.

     EMPTYING WITHOUT REDRAWING WAS THE BUG. It was left to `go` to rebuild each on arrival, which
     put the cost on the tab somebody actually opens — every word of which is true, and it forgot
     the peek: you can SEE the edge of the tab either side without going to it, and an emptied
     screen has nothing to show. The columns left and right went blank while the card above and
     below stayed visible, because those live inside the screen you are on.

     `repaint` now paints the neighbours as part of the sequence, so this is one line rather than
     three and cannot fall out of step with it. */
  TABS.forEach(t => {
    if (t.id === AT) return;
    const el = $('s-' + t.id);
    if (el) el.innerHTML = '';
  });

  /* AND THE WHOLE SEQUENCE, in the one order it may happen in — see `repaint`. */
  repaint();
  openSharedPost();     // if the app was opened on a shared link, go to that post
}

/* ---------- THE SPLASH, OFF AND ON ---------------------------------------------------------------
   Two lines, named, because they are called from three places — the load finishing, the boot
   failing, and a retry — and three copies of `classList.add('done')` is three chances for one of
   them to be spelt differently. */
function splashOff_() { const el = $('splash'); if (el) el.classList.add('done'); }
function splashOn_()  { const el = $('splash'); if (el) el.classList.remove('done'); }

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