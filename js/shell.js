/* @family. — shell.js ONE FILE, SPLIT. § */


/* ---------- THE TABS § */
const TABS = [
  /* Posts leftmost: the one screen somebody opens with no errand. Every other tab answers a
     question, and a person with no question needs somewhere to land. */
  /* ---------- ONE TAB § */
  { id: 'stuff',   icon: '🔎', label: 'Find',    title: 'Find' },
  /* ---------- WHO YOU ARE, AT THE START OF THE YOU GROUP (392) § */
  { id: 'account', icon: '👤', label: 'You',     title: 'You' },

  /* ---------- AND SEVEN MORE, WHICH IS THIS TABLE GOING BACK THE WAY IT CAME § */
  /* ---------- `make` WAS HERE, AND THE CAMERA IS THE PAGE ABOVE THE NEWEST POST NOW § */
  { id: 'feed',    icon: '🏠', label: 'Feed',    title: 'Feed' },
  { id: 'booking', icon: '📅', label: 'Book',    title: 'Booking' },
  { id: 'tools',   icon: '🧰', label: 'Tools',   title: 'Tools' },
  { id: 'games',   icon: '🎮', label: 'Games',   title: 'Games' },

  /* ---------- AND THE TWO THE LAYOUT SHEET ASKED FOR § */
  { id: 'reel',    icon: '▶',  label: 'Reels',   title: 'Reels' },
  { id: 'dm',      icon: '✉',  label: 'DMs',     title: 'Messages' },
  /* ---------- SAVED, RIGHT OF FIND 2 WITH THE LEARNING COLUMNS (392) § */
  { id: 'saved',   icon: '★',  label: 'Saved',   title: 'Saved' },
  { id: 'spotlight', icon: '✦', label: 'Spotlight', title: 'Spotlight' },
  /* ---------- AND YOUR SETTINGS, RIGHT OF YOU § */
  { id: 'settings', icon: '⚙', label: 'Settings', title: 'Settings' },
  /* ---------- AND THE SHOP, RIGHT OF BOOKING § */
  { id: 'shop',    icon: '🛒', label: 'Shop',    title: 'Shop' },
  /* ---------- AND PROGRESS, RIGHT OF SAVED (392), WAITING TO BE BUILT § */
  { id: 'progress', icon: '📈', label: 'Progress', title: 'Progress' },
  /* ---------- FIND 2: THE SAME FINDER AGAIN, RIGHT OF FIND § */
  { id: 'res',     icon: '🔎', label: 'Find 2', title: 'Find 2' },
  /* ---------- AND THE BUSINESS'S OWN PAPERWORK, LAST, FOR AN ADMIN AND NOBODY ELSE § */
  { id: 'biz', icon: '📋', label: 'Business', title: 'Business', admin: true },
];

/* ---------- LEFT TO RIGHT, WHICH IS NOT THE ORDER THEY ARE WRITTEN IN § */
/* GROUPED BY PURPOSE, read left to right (392). columns.json lists the same order; check-doors fails if they part. § */
const TAB_ORDER = ['feed', 'spotlight', 'reel', 'dm',                  /* social   (392) */
                   'stuff', 'res', 'saved', 'progress', 'tools',      /* learning */
                   'booking', 'shop',                                 /* business */
                   'games',
                   'account', 'settings', 'biz'];                     /* you, and an admin's */
TABS.sort((a, b) => TAB_ORDER.indexOf(a.id) - TAB_ORDER.indexOf(b.id));

/* ---------- EVERY COLUMN THE BUILD HAS, AND THE ONES THIS VIEWER IS GIVEN § */
const TABS_BUILT = TABS.slice();
const COLUMNS = TABS.slice();

/* ---------- WHICH COLUMNS THIS VIEWER IS GIVEN — THE SMALLEST RULE THAT LEAVES ONE OUT § */
function columnsFor_() {
  let admin = false;
  try { admin = typeof isAdmin === 'function' && isAdmin(); } catch (e) { admin = false; }
  const want = COLUMNS.filter(t => !t.admin || admin);
  const changed = want.length !== TABS.length || want.some((t, i) => TABS[i] !== t);
  if (changed) {
    /* WHERE YOU ARE, IF IT IS THE COLUMN GOING — the nearest column left of it that stays. */
    let at = null;
    try { at = AT; } catch (e) { at = null; }
    if (at && !want.some(t => t.id === at) && COLUMNS.some(t => t.id === at)) {
      const i = COLUMNS.findIndex(t => t.id === at);
      const left = COLUMNS.slice(0, i).reverse().find(t => want.indexOf(t) !== -1);
      AT = (left || want.find(t => t.id === TAB_HOME) || want[0]).id;
    }
    TABS.length = 0;
    want.forEach(t => TABS.push(t));
  }
  /* AND THE SECTIONS, every time — cheap, and it puts the document right even where `TABS` did not
     change (the first call, when index.html has just been parsed). */
  const host = typeof document !== 'undefined' && document.getElementById('screen');
  if (!host) return changed;
  TABS_BUILT.forEach(t => {
    if (!t.admin) return;
    const el = document.getElementById('s-' + t.id);
    const mine = TABS.indexOf(t) !== -1;
    if (mine && !el) {
      const s = document.createElement('section');
      s.className = 'screen hidden';
      s.id = 's-' + t.id;
      host.appendChild(s);
    } else if (!mine && el) {
      el.remove();
    }
  });
  return changed;
}

/* ---------- AND THE SHEET DECIDES, ONCE THERE IS ONE § */
function applyColumns_() {
  const rows = (DATA && DATA.columns) || [];
  if (!rows.length) return;

  const known = {};
  TABS_BUILT.forEach(t => { known[t.id] = t; });

  const want = rows.map(r => known[String(r.screen || '').trim()])
                   .filter(Boolean);
  if (!want.length) return;      /* the sheet names nothing this build has — leave it alone */

  /* THE LABEL AND THE ICON COME FROM THE SHEET TOO, where it gives them. A blank cell means "keep
     what the code says" rather than "make it empty", which is the same rule every other tab in this
     system follows. */
  rows.forEach(r => {
    const t = known[String(r.screen || '').trim()];
    if (!t) return;
    if (String(r.label || '').trim()) t.label = String(r.label).trim();
    if (String(r.icon  || '').trim()) t.icon  = String(r.icon).trim();
  });

  COLUMNS.length = 0;
  want.forEach(t => COLUMNS.push(t));
  columnsFor_();

  /* WHERE `AT` IS NOW. Somebody remembered on a column the sheet has just switched off would be on a
     screen that no longer exists, and `go` would silently send them home without saying why. */
  if (!TABS.some(t => t.id === AT)) AT = (TABS.find(t => t.id === TAB_HOME) || TABS[0]).id;
}

/* ---------- WHERE AN UNKNOWN ROUTE LANDS, NAMED RATHER THAN COUNTED § */
/* ---------- THE FIRST THING ANYBODY SEES IS THE LATEST POST § */
const TAB_HOME = 'feed';

/* ---------- HOW LONG AWAY COUNTS AS OPENING IT AGAIN § */
const AWAY_AGAIN = 6 * 60 * 1000;

/* What each screen draws. Registered separately from the tab list so a screen can be built and
   swapped without touching the navigation — which is the whole reason for splitting them. */
const SCREENS = {};

/* Register a screen. `draw` returns the markup for it, and that is the whole contract. § */
function screen(id, draw) { SCREENS[id] = { draw }; }

/* ---------- WHERE YOU WERE, IF IT IS STILL A PLACE § */
/* FIRST VISIT LANDS ON THE LATEST POST — see `TAB_HOME` above, which is where that is decided and
   where the argument it replaced is written down. Find is one swipe away and is remembered there
   afterwards. */
let AT = TAB_HOME;
/* ---------- REMEMBERED FOR A RELOAD, NOT FOR TOMORROW § */
/* THE VIEWER'S COLUMNS FIRST — `USER` is already read out of storage (data.js), so an admin reloading on
   Business is put back on it, and anybody else's remembered `biz` is not a column and is let go. */
try { columnsFor_(); } catch (e) {}
try {
  const was = localStorage.getItem('familyTab');
  const when = Number(localStorage.getItem('familyTabAt') || 0);
  if (was && TABS.some(t => t.id === was) && when && Date.now() - when < AWAY_AGAIN) AT = was;
} catch {}
/* ---------- AND THE MOMENT IS WHEN YOU LEFT, NOT WHEN YOU ARRIVED § */
function tabStampLeft_() {
  try { if (localStorage.getItem('familyTab') === AT) localStorage.setItem('familyTabAt', String(Date.now())); } catch {}
}
window.addEventListener('pagehide', tabStampLeft_);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') tabStampLeft_(); });

/* ---------- THE COLUMN BEFORE THIS ONE § */
let PREV_AT = '';
function go(id, remember, instant) {
  const tab = TABS.find(t => t.id === id)
           || TABS.find(t => t.id === TAB_HOME)
           || TABS[0];
  const was = AT;
  AT = tab.id;
  if (was && was !== AT) PREV_AT = was;
  if (remember !== false) {
    try {
      localStorage.setItem('familyTab', AT);
      /* THE STAMP IS WRITTEN WITH THE ID AND NEVER WITHOUT IT — see the note over `AT` above. A
         stamp left behind by an id that was not written is a column remembered by its timestamp. */
      localStorage.setItem('familyTabAt', String(Date.now()));
    } catch {}
  }

  /* NOTHING IS HIDDEN ANY MORE. § */
  /* IT ARRIVES FROM THE SIDE IT CAME FROM. One class and one keyframe, rather than eight screens
     held in position so that one of them could be seen sliding in. */
  const from = TABS.findIndex(t => t.id === was), to = TABS.findIndex(t => t.id === AT);
  const way = (was && was !== AT) ? (to > from ? 1 : -1) : 0;
  /* THE WAY THE ROW WAS LAST TRAVELLED — the builder takes the columns on that side first (`ahead_`). */
  if (way) AHEAD.dir.x = way;
  /* AND A COLUMN THIS LANDING WILL SHOW THAT STILL HOLDS THE BOOT'S LOADER IS DRAWN NOW — see `bootGlass_`. */
  bootGlass_();

  /* PAINT FIRST, PLACE SECOND, ALWAYS. § */
  paintNeighbours();
  placeCells('x', instant);


  /* THE HEADER IS GONE, and so is everything that wrote to it — a title, and a slot for one action per screen. § */

  /* ---------- WHY A SIDEWAYS SWIPE WAS THE ROUGH ONE § */
  /* OR IF IT IS STALE — something changed while you were elsewhere. See the note on `STALE`. */
  const painted = !screenHasMarkup_(AT) || !!STALE[AT];
  if (painted) paint(AT);
  if (was !== AT && typeof widgetsBeforeSlide_ === 'function') widgetsBeforeSlide_(AT);
  /* Anything that needs to start running once its markup exists — a canvas, a board, a clock.
     After paint, because none of it can find an element that has not been drawn yet. */
  /* A hoisted FUNCTION, not a const. § */
  /* WHEN, and it is not simply "after the slide". § */
  /* THE REELS USED TO BE BOOKED HERE, ON THEIR OWN, AND THAT IS THE BUG THEY HAD. § */

  /* THE TOOLS AND THE GAMES ARE STARTED WHEN THEIR COLUMN ARRIVES, and stopped when it leaves. § */
  /* `toolsStop_()` WAS HERE, for any column that was not one of the four — and it stopped every widget in the app, including the ones on the column beside you that § */
  /* AND THE CAMERA, for the same reason and with more force: a canvas loop behind a screen nobody
     is looking at is a flat battery, and a live camera behind one is a recording light on for
     nothing. */
  /* THE CAMERA IS A PAGE OF THE FEED NOW, so leaving the FEED is what lets it go. Turning a page
     within the feed is the other half, and it is `feedCamWatch_` — booked from `goPage` and from
     `startScreen_` below. */
  /* ---------- ONLY WHEN LEAVING THE FEED, OR WITH A CAMERA ACTUALLY OPEN § */
  if (typeof camStop_ === 'function' && AT !== 'feed'
      && (was === 'feed' || (typeof CAM_STREAM !== 'undefined' && CAM_STREAM))) camStop_();
  /* AND THE REEL, which is the third of these and was the one nobody had written. § */
  if (typeof reelsStop_ === 'function' && AT !== 'reel') reelsStop_();
  /* AND THE MESSAGE POLL, which is the fourth. § */
  if (typeof dmStop_ === 'function' && AT !== 'dm') dmStop_();
  /* STARTED AFTER THE SLIDE, in one list rather than two. `repaint` needs the same list — it has
     just rebuilt this screen's markup too — and two copies of "what does this screen need running"
     is two places to forget the camera. */
  /* `true`: ARRIVING, so a column of widgets starts the ones in view first — see `widgetsWake_`. § */
  if (was !== AT || painted) afterSlide_(() => startScreen_(AT, true), 'start');
  aheadKick_(AHEAD_QUIET);

  /* EITHER FINDER (find.js, `FINDERS`): § */
  const finder = typeof finderOf_ === 'function' ? finderOf_(AT) : null;
  if (finder) {
    const host = $('s-' + finder.id);
    const drawn = host && host.querySelector('.page[data-filled]');
    if (instant || !drawn) inFinder_(finder, fillStuffPages);
    else afterSlide_(() => inFinder_(finder, fillStuffPages), 'fill:' + finder.id);
  }
  /* After wake, because a page holding a canvas has to exist and be sized before it is moved. § */
  /* `true` used to be written here, and it cancelled the slide `placeCells('x', instant)` had started twenty lines above — two correct calls in one turn § */
  paintPager(AT, instant);

  /* `scrollTo` was here, putting the window back to the top on every tab change. § */

  /* `arrive()` was here too: § */
}

/* DRAW THE SCREEN EITHER SIDE, so a sideways drag reveals one rather than an empty rectangle. § */
/* ---------- WHAT EACH SCREEN NEEDS RUNNING ONCE ITS MARKUP EXISTS § */
function startScreen_(id, arriving) {
  /* NOT A COLUMN A LANDING PAYLOAD LEFT ALONE — its markup was not replaced, so what runs in it is still
     running, and restarting it is what moves the caret: the notepad's `start` writes its value back.
     See `landRepaint_`. */
  if (typeof reconnectKeep_ === 'function' && reconnectKeep_(id)) return;
  /* NOR ONE `paint` HELD UNDER A STROKE (`padHold_`, find.js), for the same reason and one more: § */
  if (typeof padHold_ === 'function' && padHold_(id)) return;
  if (typeof boardHold_ === 'function' && boardHold_(id)) return;
  /* NOR A WIDGET COLUMN `paint` HELD FOR A FORM WITH TYPING IN IT (`settingsKeep_`, me.js) — the library cards on Tools, and their starred copy on Saved § */
  if (!arriving && (id === 'tools' || id === 'saved') && typeof settingsKeep_ === 'function' && settingsKeep_(id)) return;
  /* THE SAVED COLUMN HOLDS WIDGETS TOO, so it starts them — from its own list rather than from a
     kind, because what is on it is whatever was starred. */
  if (id === 'saved' && typeof savedStart_ === 'function') { savedStart_(arriving); }
  else if ((id === 'tools' || id === 'games') && typeof toolsStart_ === 'function') {
    toolsStart_(id === 'tools' ? 'tool' : 'game', arriving);
  }
  /* AND THE SHOP, whose first page is the basket — a widget, with a `start` that draws its lines.
     Without this the basket arrived as a heading over an empty box. */
  else if (id === 'shop' && typeof toolsStart_ === 'function') { toolsStart_('shop', arriving); }
  /* ---------- AND A COLUMN WHOSE CARDS JUST GREW IS PLACED AGAIN § */
  if ((id === 'saved' || id === 'tools' || id === 'games' || id === 'shop') && id === AT) {
    placeCells('y', true, 0, id);
  }
  /* THE CAMERA STARTS ON ARRIVAL rather than on a tap. § */
  /* ONLY ON ITS OWN PAGE. § */
  if (id === 'feed' && typeof feedCamWatch_ === 'function') feedCamWatch_();
  /* AND THE REEL COLUMN PLAYS THE ONE YOU ARE ON. § */
  if (id === 'reel' && typeof reelsWatch_ === 'function') reelsWatch_();
  /* AND A TEXTBOOK'S ANIMATION PLAYS ONLY ON FIND, ONLY ON THE PAGE IN FRONT — for EVERY screen, because
     arriving anywhere else is what pauses the one on Find. See `tbAnimWatch_` in find.js. */
  if (typeof tbAnimWatch_ === 'function') tbAnimWatch_();
  /* AND AN ADMIN'S BUSINESS RECORDS ARE ASKED FOR — a POST, once, and never the payload (see js/records.js). § */
  if (id === 'biz' && typeof bizStart_ === 'function') bizStart_();
  /* AND A CONVERSATION OPENS AT ITS NEWEST MESSAGE. A scroller's natural state is the top, which on
     a thread is last month — so something has to say otherwise, once the markup exists. */
  if (id === 'dm' && typeof dmFoot_ === 'function') dmFoot_();
  /* AND IT KEEPS ITSELF UP TO DATE WHILE IT IS THE SCREEN YOU ARE ON — see `dmPoll_` in posts.js,
     which is where the interval and what it costs are written down. */
  if (id === 'dm' && typeof dmPoll_ === 'function') dmPoll_();
}

/* ---------- A COLUMN THE LANDING WILL SHOW, STILL ON THE BOOT'S LOADER, IS DRAWN BEFORE THE SLIDE § */
function bootGlass_() {
  if (!PRE_PAYLOAD.size || typeof GLASS === 'undefined') return;
  const ti = TABS.findIndex(t => t.id === AT);
  if (ti < 0) return;
  const k = WIDE ? Math.max(1, GLASS.reach || 1) : 1;
  TABS.forEach((t, i) => {
    if (t.id === AT || Math.abs(i - ti) > k || !PRE_PAYLOAD.has(t.id) || !STALE[t.id]) return;
    paint(t.id);
    if (!STALE[t.id] && PAGER[t.id]) paintPager(t.id, true);
  });
}

/** Has this screen been drawn? A screen with markup needs no redrawing to be arrived at. */
function screenHasMarkup_(id) {
  const el = $('s-' + id);
  /* THE FIRST CHILD, NOT `innerHTML`, which serialises every screen's whole markup to answer yes or no — about a millisecond across eleven at 1x and four at 4x § */
  return !!(el && el.firstElementChild);
}

function paintNeighbours() {
  /* EVERY SCREEN, not the two either side. § */
  TABS.forEach((t, i) => {
    const id = t.id;
    if (id === AT) return;
    const el = $('s-' + id);
    if (!el || el.firstChild) return;         // already drawn; redrawing would only cost
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
/* ---------- WHICH SCREENS ARE OUT OF DATE § */
let STALE = {};
/* ---------- TWO MARKS NOW, AND TWO CLOCKS § */
let ACT_EPOCH = 0;
let DRAW_EPOCH = 0;
/* ---------- A MARK MADE OUTSIDE `repaint` IS ONE CALL, AND IT TELLS THE BUILDER § */
function markStale_(ids) {
  [].concat(ids).forEach(id => { if (id) STALE[id] = 1; });
  if (typeof aheadKick_ === 'function') aheadKick_();
}
/* WHICH MARK `repaint` WRITES — 1, except for the length of a landing. */
let REPAINT_MARK = 1;
/* THE COLUMNS WHOSE MARKUP WAS DRAWN BEFORE THE FIRST PAYLOAD — drawn again from nothing (`fresh`) whenever
   they are drawn, so a widget started on the boot's markup is started again in the payload's (331). */
const PRE_PAYLOAD = new Set();
/* HOW MANY TIMES EACH COLUMN WAS DRAWN, for the journeys that ask what a landing drew (check-flow). */
const PAINT_N = {};

/* `fresh`: DRAWN FROM NOTHING, because the caller starts again whatever runs in it — `repaint`, for the column in front. § */
function paint(id, fresh, o) {
  /* ---------- A SETTINGS CARD WITH SOMETHING TYPED INTO IT IS NOT REDRAWN UNDER THE TYPING § */
  if (typeof settingsKeep_ === 'function' && settingsKeep_(id)) { STALE[id] = 1; return; }
  /* ---------- AND NEITHER FINDER IS REDRAWN UNDER A CHILD WHO IS WRITING § */
  if (typeof findKeep_ === 'function' && findKeep_(id)) { STALE[id] = 1; return; }
  /* AND NO COLUMN IS REBUILT BY A PAYLOAD LANDING UNDER SOMEBODY TYPING IN IT — see `landRepaint_`. */
  if (typeof reconnectKeep_ === 'function' && reconnectKeep_(id)) { STALE[id] = 1; return; }
  /* ---------- AND NO COLUMN IS REDRAWN UNDER A STROKE, WHICHEVER COLUMN IT IS § */
  if (typeof padHold_ === 'function' && padHold_(id)) { STALE[id] = 1; return; }
  if (typeof boardHold_ === 'function' && boardHold_(id)) { STALE[id] = 1; return; }
  /* Drawn is fresh, by definition, whoever asked for it. THE MARK IS KEPT FOR ONE QUESTION FIRST: whether
     a landing's `'maybe'` may be answered by writing nothing (below). */
  const mark = STALE[id];
  delete STALE[id];
  /* A COLUMN STILL HOLDING THE BOOT'S MARKUP: § */
  const pre = PRE_PAYLOAD.has(id);
  /* A PAGED SCREEN HAS NO PADDING OF ITS OWN — each page supplies it, because a page is positioned against the screen's padding box and would otherwise be inset by § */
  $('s-' + id)?.classList.toggle('paged', !!PAGER[id]);
  const el = $('s-' + id);
  const s = SCREENS[id];
  if (!el) return;

  /* ONE SCREEN THAT WILL NOT DRAW MUST NOT TAKE THE OTHERS WITH IT. § */
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
  /* ---------- AND A WIDGET RUNNING ON THIS COLUMN KEEPS THE SLOT IT IS RUNNING IN § */
  /* ---------- A LANDING THAT CHANGES NOTHING WRITES NOTHING § */
  const want = (o && o.land && mark !== 1) ? 'maybe' : mark;
  if (want === 'maybe' && !fresh && html !== null && !PRE_PAYLOAD.has(id)
      && !(typeof finderOf_ === 'function' && finderOf_(id))
      && el.DRAWN && el.DRAWN.html === html && el.DRAWN.epoch === ACT_EPOCH && el.firstElementChild) {
    if (typeof widgetsReveil_ === 'function') widgetsReveil_(id, false);
    return 'kept';
  }
  const held = !fresh && typeof widgetsHeld_ === 'function' ? widgetsHeld_(id, pre) : [];
  el.innerHTML = html !== null
    ? html
    : '<p class="empty">Nothing here yet.</p>';
  el.DRAWN = { html: html, epoch: ACT_EPOCH };
  PRE_PAYLOAD.delete(id);
  PAINT_N[id] = (PAINT_N[id] || 0) + 1;
  if (held.length) widgetsBack_(id, held);
  /* NEW MARKUP IS NEW PAGES, so the next placement walks this column's pages whatever its signature says
     (`placePages_`). */
  el.PG_SIG = null;

  /* ---------- AND THE COLUMN IS CENTRED ON WHAT WAS JUST DRAWN § */
  if (typeof PLACED_ONCE !== 'undefined' && PLACED_ONCE && !(o && o.ahead)
      && !(typeof SWIPE !== 'undefined' && SWIPE.live && SWIPE.axis)) {
    placeCells('y', true, 0, id);
  }

  /* ---------- AND WHETHER THE NEW CARDS FIT THE PANES THEY ARE IN § */
  if (typeof afterSlide_ === 'function' && typeof paneWatch_ === 'function' && !(o && o.ahead)) {
    afterSlide_(() => paneWatch_($('s-' + id)), 'panes:' + id);
  }
}

/* WHAT TO SAY WHEN THERE IS NOTHING. § */
function nothingHere(whenEmpty, needsLibrary) {
  /* EITHER REQUEST CAN BE THE ONE THAT FAILED. § */
  /* ---------- BUT NOT WHILE THE APP IS ASKING AGAIN BY ITSELF § */
  /* AND THE COLUMN'S WAIT IS THE ONE LOADER. § */
  /* `retrying_` (below, beside `awaiting_`), so this and every card that waits for the payload read
     the retry through one definition. */
  const asking = retrying_();
  if (asking && !LIBRARY_FAILED) return loading_();
  const why = (asking ? '' : LOAD_FAILED) || LIBRARY_FAILED;
  if (why) {
    return `<p class="empty">Couldn’t load.<br>
        <span class="faint">${esc(why)}</span><br>
        <span class="text-action" data-do="retry">Try again</span></p>`;
  }
  /* ---------- AND STILL COMING IS NOT THE SAME AS EMPTY § */
  /* ---------- AND THE WAIT IS THE ONE LOADER NOW, NOT A SENTENCE OF ITS OWN § */
  if (needsLibrary && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null) {
    return loading_();
  }
  return `<p class="empty">${whenEmpty}</p>`;
}

/* WAITING — ONE LOADER FOR EVERY CARD, AND THIS IS THE ONLY PLACE IT IS WRITTEN § */
function loading_() {
  return '<div class="loading" role="status" aria-label="Loading">'
    + '<span></span><span></span><span></span></div>';
}

/* AND TAKEN OFF AGAIN — the one way a box drawn `aria-busy="true"` with a loader over it shows what
   is under it. Silent on a box that was never waiting, so a caller need not know whether it was. */
function loaded_(el) {
  if (!el || !el.removeAttribute) return;
  el.removeAttribute('aria-busy');
  el.querySelectorAll(':scope > .loading').forEach(l => l.remove());
}

/* ---------- AND WHEN IS THE PAYLOAD STILL ON ITS WAY: ONE ANSWER, ASKED BY EVERY CARD § */
function retrying_() {
  try { return !!LOAD_FAILED && typeof reconnecting_ === 'function' && reconnecting_(); }
  catch (e) { return false; }
}
function awaiting_() {
  try {
    if (!LOADED) return true;
    return retrying_() && !RECONNECT.shown;
  } catch (e) { return typeof LOADED !== 'undefined' && !LOADED; }
}

/** Redraw whatever is showing. What almost everything calls after a change. */
/* THE ORDER A REDRAW HAPPENS IN, WRITTEN DOWN ONCE § */
const repaint = (instant) => {
  /* 00. WHICH COLUMNS THERE ARE, for whoever is signed in now — every sign-in and sign-out ends here, so
         an admin's column comes and goes with them, without a reload. See `columnsFor_`. */
  try { columnsFor_(); } catch (e) {}
  /* 000. A CHANGE OF PERSON PUTS AWAY WHAT WAS DRAWN FOR THE LAST ONE, NOW — before this returns, with no idle moment in between: § */
  const who = typeof widgetWho_ === 'function' ? widgetWho_() : '';
  if (REPAINT_WHO !== null && who !== REPAINT_WHO) {
    ACT_EPOCH++;
    if (typeof widgetsReveil_ === 'function') WIDGET_COLS.forEach(c => widgetsReveil_(c, true));
  }
  REPAINT_WHO = who;
  DRAW_EPOCH++;
  /* 0. EVERY OTHER SCREEN IS NOW OUT OF DATE — see the note on `STALE`. § */
  TABS.forEach(t => { if (t.id !== AT) STALE[t.id] = STALE[t.id] === 1 ? 1 : REPAINT_MARK; });
  /* 0b. AND EVERY WIDGET DRAWN FROM THE FACTS THAT HAVE JUST MOVED IS PUT BACK UNDER ITS LOADER NOW, on every column just marked — not when the column is next § */
  if (typeof widgetsReveil_ === 'function') WIDGET_COLS.forEach(c => { if (c !== AT && STALE[c]) widgetsReveil_(c, false); });
  /* 1. THE SCREEN YOU ARE ON, drawn from nothing (it is restarted below) — UNLESS A LANDING FINDS IT AS IT WAS. § */
  const land = REPAINT_MARK === 'maybe' && !(typeof WIDGET_COLS !== 'undefined' && WIDGET_COLS.indexOf(AT) !== -1)
            && !(typeof finderOf_ === 'function' && finderOf_(AT));
  const kept = paint(AT, !land, land ? { land: true } : undefined) === 'kept';
  /* 1b. AND WHATEVER THAT SCREEN HAS RUNNING, because `paint` has just replaced the markup it was running in. § */
  if (!kept && typeof startScreen_ === 'function') startScreen_(AT);
  paintNeighbours();               // 2. the ones either side
  /* 3. A repaint rebuilds the markup, which throws the positions away with it — so the page you were on would silently become the first one every time anything § */
  paintPager(AT, true);
  placeCells('x', instant !== false);   // 4. and only now, positions
  /* 5. AND EVERY COLUMN JUST MARKED IS DRAWN AGAIN IN THE NEXT QUIET MOMENTS, nearest first — see `ahead_`. */
  if (typeof aheadKick_ === 'function') aheadKick_();
};
/* WHO THE LAST REPAINT DREW FOR — see step 000 above. Null until the first, which has nobody before it. */
let REPAINT_WHO = null;

/* THE TAB BAR IS GONE. § */

/* ONE GRID. TWO AXES. THE SAME BEHAVIOUR ON BOTH. § */
const AXES = {
  /* X — the tabs. */
  x: {
    prop: '--dx',                                   // the drag offset, in the cell's transform
    /* HOW FAR A SIDEWAYS SWIPE HAS TO TRAVEL to count, and it is a share of the APP's width rather than the window's — the same mistake `stepX_` had. § */
    span: () => appWidth_(),
    /* The same signature as the other axis, `id` ignored — there is only one row of tabs. Written
       the same way so nothing calling an axis has to know which one it has. */
    at:    () => Math.max(0, TABS.findIndex(t => t.id === AT)),
    count: () => TABS.length,
    /* IN TAB ORDER, not in the order the sections happen to appear in index.html. § */
    cells: () => TABS.map(t => $('s-' + t.id)).filter(Boolean),
    /* CLAMPED. The other axis clamps inside `goPage` and this one did not, so a swipe past the last tab asked for `TABS[4]` and read `.id` off nothing. § */
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
    /* EVERY ONE OF THESE TAKES AN `id`, defaulting to the screen in front. § */
    at:    id => PAGE[id || AT] || 0,
    count: id => PAGER[id || AT] ? pageCount(id || AT) : 0,
    /* WHAT MOVES, which is the screen — the pages are stacked inside it by CSS and never carry a transform of their own. § */
    cells: id => [$('s-' + (id || AT))].filter(Boolean),
    go:    (n, instant) => goPage(AT, n, instant),
  },
};

/* PLACE EVERY CELL ON AN AXIS. § */
/* PLACE EVERY CELL, ON BOTH AXES AT ONCE. § */
/* HOW BIG A CELL IS, AND THE ONE GAP BETWEEN THEM. § */
/* HOW MUCH OF THE VIEWPORT A CELL TAKES, and it is the same number for every cell on the grid, always. § */
/* ---------- HOW WIDE A CARD IS, AND HOW MUCH OF THE NEXT ONE YOU CAN SEE § */
const CARD_W       = 0.84;    // a card, as a fraction of the screen's width
const EDGE_SHOWING = 0.06;    // how much of the card either side you can see, same units

/* ---------- ON A WIDE WINDOW THE GRID SHOWS MORE OF ITSELF § */
const WIDE_FROM     = 700;    // px of WINDOW — a phone held either way, and a small tablet upright, are below it
const WIDE_CARD_MIN = 21;     // rem — the narrowest card that is put beside another
const WIDE_CARD_MAX = 28;     // rem — the widest a card grows to fill the room
const WIDE_EDGE     = 24;     // px — at least this much of the next column shows past the last whole one
let WIDE = false;

/* SAID ON `<html>` AS `.wide`, which is what lets `body` stop being a phone (style.css, THE WIDE WINDOW). § */
function wideSet_() {
  let w;
  try { w = matchMedia('(min-width: ' + WIDE_FROM + 'px)').matches; } catch (e) { w = innerWidth >= WIDE_FROM; }
  if (w !== WIDE || document.documentElement.classList.contains('wide') !== w) {
    WIDE = w;
    document.documentElement.classList.toggle('wide', w);
    /* AND WHAT THE POINTER WAS SAYING ON A WIDE WINDOW GOES WITH IT — see `wideOverClear_`. */
    if (!w) wideOverClear_();
  }
  return WIDE;
}

/* THE CARD'S WIDTH ON A WIDE WINDOW, in px, and how many whole ones fit — see above. */
function wideCard_() {
  const W = appWidth_();
  let rem = 16;
  try { rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; } catch (e) {}
  const lo = WIDE_CARD_MIN * rem, hi = WIDE_CARD_MAX * rem;
  let k = 1;
  while ((k + 2) * lo + (k + 1) * CELL_GAP + 2 * WIDE_EDGE <= W) k += 2;
  const card = Math.min(hi, (W - 2 * WIDE_EDGE - (k - 1) * CELL_GAP) / k);
  return { card: Math.max(lo, card), k: k };
}

/* ---------- `wideShift_` WAS HERE: AT EITHER END OF THE ROW, THE ROW SLID TO THE EDGE § */

/* THESE TWO COME OUT OF THE SAME WIDTH, which is the whole thing to understand before changing either. § */
/* Kept under its old name because the vertical spacing still uses it and 16px is right there —
   a column of cards is read one after another, and the gap only has to say "these are separate". */
const CELL_GAP   = 16;        // pixels between one card and the next, going DOWN

/* HOW FAR APART TWO PANES SIT, so that the gap between what you SEE is `CELL_GAP`. § */
/* ---------- THE BROWSER STACKS THE COLUMN, NOT THIS FILE § */
/* ---------- THE CARD YOU ARE ON SITS IN THE MIDDLE OF THE SCREEN § */
function columnShift_(host, at) {
  const pages = host.querySelectorAll(':scope > .page');
  const cur = pages[Math.max(0, Math.min(pages.length - 1, at))];
  if (!cur) return 0;
  const boxH = host.clientHeight || innerHeight;
  const h = HOLD_AT;
  if (h && host.id === 's-' + h.id && (PAGE[h.id] || 0) === h.p && at === domIndex_(h.id, h.p)
      && h.vp === innerWidth + 'x' + innerHeight) {
    const room = boxH - cur.offsetHeight;
    /* `lift` IS THE MATHS KEYPAD'S, and only the keypad's — see `kpLift_` in keypad.js. § */
    return (room <= 0 ? 0 : Math.max(0, Math.min(room, h.top))) - (h.lift || 0) - cur.offsetTop;
  }
  return Math.max(0, (boxH - cur.offsetHeight) / 2) - cur.offsetTop;
}

/* ---------- ONCE YOU ARE USING A CARD, IT STAYS WHERE IT IS § */
let HOLD_AT = null;      // { id, p, top, vp, lift } — the card being used, where its top is held, and how far the keypad lifted it

function holdHere_(t) {
  try {
    const pg = t && t.closest && t.closest('#screen .page.on');
    const host = pg && pg.parentElement;
    if (!host || host.id !== 's-' + AT) return;
    /* ONCE PER CARD. The first touch says where it is; asking again on every keystroke would force a
       layout per letter typed, for the answer the first one already gave. */
    if (HOLD_AT && HOLD_AT.id === AT && HOLD_AT.p === (PAGE[AT] || 0)) return;
    const at = colPlaced_(host);
    if (!at) return;
    HOLD_AT = { id: AT, p: PAGE[AT] || 0, top: at[1] + pg.offsetTop, vp: innerWidth + 'x' + innerHeight };
  } catch (e) { HOLD_AT = null; }
}

/* ---------- A CARD ABOVE CHANGED HEIGHT, SO THE COLUMN IS HELD ON THE PAGE YOU ARE READING § */
/* ---------- AND ONLY ON THE PAGE IT WAS PLACED FOR, AND IT SAYS WHETHER IT COULD § */
function holdColumn_(id) {
  try {
    const host = $('s-' + id);
    if (!host) return false;
    if (PLACE_FRAME && PLACE_WANT && !PLACE_WANT.instant) return false;
    if (host.PLACED_P !== (PAGE[id] || 0)) return false;
    const at = colPlaced_(host);
    if (!at) return false;
    /* A FINGER IS DOWN: this column's entry in this drag's plan, or nothing to correct — a plan
       made for another card in front is one the next drag frame throws away and measures afresh. */
    let plan = null;
    if (host.classList.contains('dragging')) {
      const p = DRAG_PLAN;
      plan = p && p.at === AT && p.page === (PAGE[AT] || 0) ? p.cols.find(c => c.host === host) : null;
      if (!plan) return true;
    }
    const want = columnShift_(host, domIndex_(id, PAGE[id] || 0));
    const rest = plan ? plan.y : at[1];
    if (!isFinite(want)) return false;
    if (Math.abs(rest - want) < 0.5) return true;
    const run = typeof host.getAnimations === 'function'
      && host.getAnimations().find(a => a.playState === 'running' && a.transitionProperty === colProp_('y'));
    if (plan) plan.y = want;
    /* ---------- MID-SLIDE, THE SLIDE IS MOVED WITH THE LAYOUT, NOT RETARGETED UNDER IT § */
    if (run && !plan) {
      let left = 0;
      try { const tm = run.effect.getComputedTiming(); left = Math.max(0, tm.endTime - tm.localTime); } catch (e) {}
      colShiftNow_(host, want - rest);
      colTransition_(host, null, { d: Math.max(80, Math.round(left)) + 'ms', tf: 'cubic-bezier(.25, .6, .25, 1)', delay: '0s' });
    } else if (!run) colTransition_(host, null, SLIDE_NONE);
    colWrite_(host, at[0], want + (at[1] - rest));
    return true;
  } catch (e) { /* a column left where it was is the behaviour before this existed */ return false; }
}

/* ---------- HOW FAR IT IS TO THE NEXT CARD DOWN § */
function stepY_() {
  const host = $('s-' + AT);
  const pages = host ? host.querySelectorAll(':scope > .page') : [];
  const at = Math.max(0, Math.min(pages.length - 1, domIndex_(AT, PAGE[AT] || 0)));
  const here = pages[at], next = pages[at + 1] || pages[at - 1];
  if (here && next) {
    const gap = Math.abs(next.offsetTop - here.offsetTop);
    if (gap > 20) return gap;
  }
  return innerHeight * 0.66;
}

/* ACROSS IS A CONSTANT — every card is the same width by rule, so there is nothing to measure. */
/* WHERE THE NEXT CARD SITS, from the two fractions above and nothing else. § */
/* ---------- ONE SOURCE FOR THE CARD'S WIDTH § */
function publishCardWidth_() {
  /* A WIDE WINDOW'S CARD IS A WIDTH, NOT A SHARE — see THE GRID SHOWS MORE OF ITSELF. `wideSet_`
     first, because the class it writes is what decides the width `wideCard_` measures. */
  if (wideSet_()) {
    document.documentElement.style.setProperty('--card-w', wideCard_().card.toFixed(1) + 'px');
  } else {
    document.documentElement.style.setProperty('--card-w', (CARD_W * 100).toFixed(2) + '%');
  }
  /* AND HOW SOFT A CARD OUT OF FOCUS IS, for the same reason: § */
  document.documentElement.style.setProperty('--soft-blur', SOFT_BLUR + 'px');
}

/* ---------- THE WIDTH THAT MATTERS IS THE APP'S, NOT THE WINDOW'S § */
function appWidth_() {
  const el = $('screen');
  return (el && el.clientWidth) || innerWidth;
}

function stepX_() {
  /* THE GAP THE TWO FRACTIONS LEAVE, and a refusal if they leave none. § */
  /* ON A WIDE WINDOW: ONE CARD AND ONE GAP. § */
  if (WIDE) return wideCard_().card + CELL_GAP;
  const gap = Math.max(0.005, 0.5 - CARD_W / 2 - EDGE_SHOWING);
  return appWidth_() * (CARD_W + gap);
}

/* ---------- THE SETTLE AFTER A SWIPE, MATCHED TO THE FINGER § */
let SETTLE_FROM = null;        // { axis, v, at } — the release the next placement settles from
/* { axis, dur, tf, until } — the settle the columns are running now. THE AXIS IS PART OF IT: a
   settle is one axis's transition and the other axis keeps its own — see `colWrite_`. */
let SETTLE_ON = null;
function settleFrom_(axis, v) {
  SETTLE_FROM = axis ? { axis: axis, v: Number(v) || 0, at: performance.now() } : null;
}
function settleCurve_(D, v) {
  const dist = Math.abs(D);
  const dur = Math.round(Math.max(260, Math.min(420, 220 + 0.45 * dist)));
  const toward = v * Math.sign(D);                  // px/ms in the direction the card is going
  if (!(toward > 0.02) || dist < 1) return { dur: dur, tf: 'cubic-bezier(.3, 0, .2, 1)' };
  const s = toward * dur / dist;
  let x1 = 0.3, y1 = 0.3 * s;
  if (y1 > 1) { x1 = 1 / s; y1 = 1; }
  return { dur: dur, tf: 'cubic-bezier(' + x1.toFixed(3) + ', ' + y1.toFixed(3) + ', .25, 1)' };
}

/* ---------- EACH AXIS HAS ITS OWN CLOCK § */
const SPLIT_AXES = (() => {
  try { return !(window.CSS && window.CSS.supports) || window.CSS.supports('translate', '1px 2px'); }
  catch (e) { return false; }
})();
/* THE SLIDE NOBODY'S FINGER IS IN — a tab tapped, a tile that turns a page — and the stylesheet's
   `.screen` transition says the same, for the moment before anything is placed. */
const SLIDE_TAP = { d: '.3s', tf: 'cubic-bezier(.3, 0, .2, 1)', delay: '0s' };
const SLIDE_NONE = { d: '0s', tf: 'linear', delay: '0s' };
const colProp_ = axis => (SPLIT_AXES && axis === 'y' ? 'translate' : 'transform');

function colWrite_(host, x, y) {
  if (SPLIT_AXES) {
    host.style.transform = `translateX(${x.toFixed(1)}px)`;
    host.style.translate = `0px ${y.toFixed(1)}px`;
  } else {
    host.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }
}
/* ---------- A COLUMN MOVED BY WHAT ITS LAYOUT MOVED, FROM WHERE IT IS DRAWN § */
/* AND WITH NO TRANSITION AT ALL, NOT A SHORT ONE. § */
function colShiftNow_(host, d) {
  if (!host || !(Math.abs(d) >= 0.5)) return;
  const at = colPlaced_(host);
  if (!at) return;
  const now = colNow_(host);
  colTransition_(host, null, SLIDE_NONE);
  const list = host.style.transitionProperty;
  host.style.transitionProperty = SPLIT_AXES ? 'transform, opacity' : 'opacity';
  colWrite_(host, SPLIT_AXES ? at[0] : now[0], now[1] + d);
  void getComputedStyle(host).getPropertyValue(colProp_('y'));
  host.style.transitionProperty = list;
}

/* WHERE THE LAST PLACEMENT PUT IT — the inline values, which are where it is going, not where it is
   drawn mid-slide (that is `colNow_`). `translate: 0px 0px` reads back as `0px`, so a missing second
   half is nought. */
function colPlaced_(host) {
  if (SPLIT_AXES) {
    const mx = /translateX\(\s*(-?[\d.]+)px/.exec(host.style.transform || '');
    if (!mx) return null;
    const t = String(host.style.translate || '').trim().split(/\s+/);
    return [parseFloat(mx[1]), parseFloat(t[1]) || 0];
  }
  const m = /translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px/.exec(host.style.transform || '');
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : null;
}
/* AND WHERE IT IS DRAWN NOW, off the running transitions. § */
function colNow_(host) {
  const cs = getComputedStyle(host);
  const m = String(cs.transform || '').match(/matrix\(([^)]+)\)/);
  const v6 = m ? m[1].split(',').map(Number) : [1, 0, 0, 1, 0, 0];
  if (!SPLIT_AXES) return [v6[4], v6[5]];
  const t = String(cs.translate || '').trim().split(/\s+/);
  return [v6[4], parseFloat(t[1]) || 0];
}
/* THE THREE TRANSITIONS, AS LONGHANDS. `x` and `y` are `{ d, tf, delay }`; a `null` keeps what this
   column had, which is how `holdColumn_` zeroes the vertical without touching a sideways slide. */
function colTransition_(host, x, y, o) {
  const t = host._slide || (host._slide = { x: SLIDE_TAP, y: SLIDE_TAP, o: { d: '.22s', tf: 'ease', delay: '0s' } });
  if (x) t.x = x;
  if (y) t.y = y;
  if (o) t.o = o;
  /* ONE TRANSFORM, ONE CLOCK: whichever axis a finger holds wins, then a settle, then the tap. */
  const one = t.x === SLIDE_NONE || t.y === SLIDE_NONE ? SLIDE_NONE : (t.x !== SLIDE_TAP ? t.x : t.y);
  const list = SPLIT_AXES ? [t.x, t.y, t.o] : [one, t.o];
  host.style.transitionProperty = SPLIT_AXES ? 'transform, translate, opacity' : 'transform, opacity';
  host.style.transitionDuration = list.map(v => v.d).join(', ');
  host.style.transitionTimingFunction = list.map(v => v.tf).join(', ');
  host.style.transitionDelay = list.map(v => v.delay).join(', ');
}

/* WHERE A SETTLING COLUMN REALLY IS, against where it is going — for a drag that starts before the last one has landed (`SWIPE.catch` in overworld.js). § */
function settleLeft_(axis) {
  try {
    const host = $('s-' + AT);
    const prop = colProp_(axis);
    if (!host || !host.getAnimations || !host.getAnimations().some(a => a.transitionProperty === prop)) return 0;
    const placed = colPlaced_(host);
    if (!placed) return 0;
    const now = colNow_(host);
    const off = axis === 'x' ? now[0] - placed[0] : now[1] - placed[1];
    return Math.abs(off) < 0.5 ? 0 : off;
  } catch (e) { return 0; }
}

/* ---------- THE CARDS NOT IN FRONT ARE SLIGHTLY OUT OF FOCUS § */
const SOFT_BLUR = 2;              // px — the stylesheet reads it as `--soft-blur`, published once
let SOFT_DRAG = null;             // { ok, b, keep } — the gesture the out-of-focus look is following
const SOFT_EASE = new Set();      // panes carrying an inline filter, will-change and transition
let SOFT_DONE = 0;

function softMotion_() {
  try { return !matchMedia('(prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce)').matches; }
  catch (e) { return true; }
}
const glassOf_ = page => (page && page.querySelector(':scope > .pane')) || null;
/* A PANE THAT REPAINTS ITSELF is dimmed rather than blurred — see above. § */
const softDim_ = page => !!(page && (
  [...page.querySelectorAll('iframe')].some(f => !f.closest('.feed-yt:not(.is-live)'))
  || [...page.querySelectorAll('video')].some(v => !v.paused && !v.ended)));
/* AND ONE THE KEYBOARD IS TYPING INTO is left sharp while a finger drags it away. */
function softKeep_(page) {
  if (!page) return true;
  if (SOFT_DRAG && SOFT_DRAG.keep.has(page)) return SOFT_DRAG.keep.get(page);
  const fe = document.activeElement;
  const k = softDim_(page) || !!(fe && fe !== document.body && page.contains(fe)
    && /^(INPUT|TEXTAREA|SELECT)$/.test(fe.tagName));
  if (SOFT_DRAG) SOFT_DRAG.keep.set(page, k);
  return k;
}
function softHold_(glass) {
  if (!glass) return;
  if (!SOFT_EASE.has(glass)) SOFT_EASE.add(glass);
  if (glass.style.willChange !== 'filter') glass.style.willChange = 'filter';
  if (glass.style.transition !== 'none') glass.style.transition = 'none';
}

function softDrag_(which, px, stepX) {
  /* A WIDE WINDOW BLURS ITS NEIGHBOURS TOO NOW (see `placeGrid`), so the finger eases it there as well. */
  if (!SOFT_DRAG) SOFT_DRAG = { ok: softMotion_(), b: null, keep: new Map() };
  if (!SOFT_DRAG.ok) return;
  /* THE NEIGHBOUR AND HOW FAR AWAY IT IS, WORKED OUT ONCE A DIRECTION. § */
  const key = which + (px < 0 ? '+' : '-');
  const seen = DRAG_PLAN ? DRAG_PLAN.near || (DRAG_PLAN.near = new Map()) : new Map();
  let a, b = null, step = 0;
  if (seen.has(key)) {
    ({ a, b, step } = seen.get(key));
  } else {
    const host = $('s-' + AT);
    a = host && host.querySelector(':scope > .page.on');
    if (!a) return;
    if (which === 'x') {
      const next = TABS[TABS.findIndex(t => t.id === AT) + (px < 0 ? 1 : -1)];
      const col = next && $('s-' + next.id);
      b = col ? col.querySelectorAll(':scope > .page')[domIndex_(next.id, PAGE[next.id] || 0)] || null : null;
      step = stepX;
    } else {
      b = px < 0 ? a.nextElementSibling : a.previousElementSibling;
      if (b && !b.classList.contains('page')) b = null;
      if (b) step = Math.abs((b.offsetTop + b.offsetHeight / 2) - (a.offsetTop + a.offsetHeight / 2));
    }
    seen.set(key, { a, b, step });
  }
  if (!a) return;
  /* THE ONE THE FINGER TURNED AWAY FROM goes back to the look its class gives it. */
  if (SOFT_DRAG.b && SOFT_DRAG.b !== b) { const g = glassOf_(SOFT_DRAG.b); if (g) g.style.filter = ''; }
  SOFT_DRAG.b = b;
  const f = b && step > 0 ? Math.min(1, Math.abs(px) / step) : 0;
  if (f < 0.01) return;
  if (!softKeep_(a)) { const g = glassOf_(a); softHold_(g); g.style.filter = `blur(${(SOFT_BLUR * f).toFixed(2)}px)`; }
  if (b && !softKeep_(b)) { const g = glassOf_(b); softHold_(g); g.style.filter = `blur(${(SOFT_BLUR * (1 - f)).toFixed(2)}px)`; }
}

/* THE RELEASE, OR ANY PLACEMENT THAT MOVED THE FOCUS: § */
function softSettle_(timing, instant) {
  /* NOT UNDER A FINGER: a placement asked for by something else mid-drag must not take the blur the
     finger is easing off the two cards it is between. */
  if (typeof SWIPE !== 'undefined' && SWIPE.live && SWIPE.axis) return;
  SOFT_DRAG = null;
  if (!SOFT_EASE.size) return;
  SOFT_EASE.forEach(g => { g.style.transition = 'none'; g.style.filter = ''; });
  clearTimeout(SOFT_DONE);
  const ms = instant ? 0 : (parseFloat(timing.d) || 0) * (/ms$/.test(timing.d) ? 1 : 1000);
  SOFT_DONE = setTimeout(function done() {
    /* A FINGER DOWN AGAIN OWNS THESE NOW — wait for it rather than pull its inline blur away. */
    if (SOFT_DRAG) { SOFT_DONE = setTimeout(done, 120); return; }
    SOFT_EASE.forEach(g => { g.style.willChange = ''; g.style.transition = ''; g.style.filter = ''; });
    SOFT_EASE.clear();
  }, ms + 80);
}

/* ---------- A TAP ON A CARD STILL SLIDING IS NOT A PRESS § */
let SLIDE_UNTIL = 0;

/* The two axes still call in — one placer underneath, so a horizontal move and a vertical one
   cannot disagree about where a cell is. */

/* ---------- A DRAG FRAME MOVES THE CARDS AND DOES NOTHING ELSE § */
let DRAG_PLAN = null;    // { which, at, page, stepX, cols: [{ host, x, y, front }], near } — this drag's sums
function dragPlan_(drag) {
  if (PLACE_FRAME) return null;
  const cols = [];
  for (const t of TABS) {
    const host = $('s-' + t.id);
    if (!host) continue;
    const at = colPlaced_(host);
    if (!at || !host._slide) return null;
    cols.push({ host: host, x: at[0], y: at[1], front: t.id === AT });
  }
  if (!cols.some(c => c.front)) return null;
  cols.forEach(c => {
    c.host.classList.add('dragging');
    if (drag.which === 'x') colTransition_(c.host, SLIDE_NONE, null);
    else if (c.front) colTransition_(c.host, null, SLIDE_NONE);
  });
  return { which: drag.which, at: AT, page: PAGE[AT] || 0, stepX: drag.which === 'x' ? stepX_() : 0, cols: cols };
}
function dragFast_(drag) {
  if (!DRAG_PLAN) DRAG_PLAN = dragPlan_(drag);
  const p = DRAG_PLAN;
  if (!p || p.which !== drag.which || p.at !== AT || p.page !== (PAGE[AT] || 0)) return false;
  if (!p.cols.every(c => c.host.isConnected)) return false;
  const dx = drag.which === 'x' ? drag.px : 0, dy = drag.which === 'y' ? drag.px : 0;
  p.cols.forEach(c => { if (dx || c.front) colWrite_(c.host, c.x + dx, c.y + (c.front ? dy : 0)); });
  softDrag_(drag.which, drag.px, p.stepX);
  return true;
}

/* ---------- HOW MANY CARDS ABOVE AND BELOW THE ONE IN FRONT THE GLASS SHOWS § */
const glassRows_ = () => (WIDE ? 3 : 2);

/* ---------- WHICH CARDS ARE ON THE GLASS, SAID ONCE PER PLACEMENT § */
let GLASS = { at: null, cols: [], pages: [] };

function glassNow_(hosts, ti, stepX) {
  const out = { at: AT, cols: [], pages: [] };
  const W = appWidth_();
  const card = WIDE ? stepX - CELL_GAP : 0;
  /* `reach`: HOW MANY COLUMNS EITHER SIDE OF THE ONE IN FRONT THIS WINDOW SHOWS — the same sum as `across` below, for any column. § */
  out.reach = 0;
  if (WIDE && stepX > 0) while (out.reach < TABS.length && W / 2 + card / 2 - (out.reach + 1) * stepX > WIDE_EDGE) out.reach++;
  hosts.forEach(h => {
    const dx = h.i - ti;
    /* HOW MUCH OF THIS COLUMN'S CARD IS INSIDE THE WINDOW, ACROSS — all of it for the column in front. */
    const across = dx ? W / 2 + card / 2 - Math.abs(dx) * stepX : Infinity;
    if (dx && !(WIDE && across > WIDE_EDGE)) return;
    out.cols.push(h.id);
    const H = h.host.clientHeight || innerHeight;
    const at = PAGE[h.id] || 0;
    h.host.querySelectorAll(':scope > .page').forEach((el, pos) => {
      if (Math.abs(logIndex_(h.id, pos) - at) > glassRows_()) return;
      if (glassShows_(el, h.shift + el.offsetTop, H, across)) out.pages.push(el);
    });
  });
  return out;
}

/* IS A PAGE'S WIDGET ON THE GLASS — its slot, or the page when it has none, showing more than `WIDE_EDGE` of itself inside a window `H` tall, with the page's top § */
function glassShows_(el, top, H, across) {
  const sl = el.querySelector('.widget-slot');
  const at = sl && glassOffset_(sl, el);
  const y = at ? top + at.top : top;
  const tall = at ? sl.offsetHeight : el.offsetHeight;
  if (!tall) return y > 0 && y < H;
  const down = Math.min(y + tall, H) - Math.max(y, 0);
  const side = Math.min((at ? sl.offsetWidth : el.offsetWidth) || Infinity, across - (at ? at.left : 0));
  return down > WIDE_EDGE && side > WIDE_EDGE;
}

/* WHERE A SLOT SITS INSIDE ITS PAGE, by offsets — the same untransformed layout the page's own `offsetTop` is, so it agrees with where this placement puts the § */
function glassOffset_(sl, page) {
  let top = 0, left = 0, n = sl;
  const base = page.offsetParent;
  while (n && n !== page && n !== base) { top += n.offsetTop; left += n.offsetLeft; n = n.offsetParent; }
  if (!n) return null;
  if (n !== page) { top -= page.offsetTop; left -= page.offsetLeft; }
  for (let p = sl.parentNode; p && p !== page; p = p.parentNode) top -= p.scrollTop || 0;
  return { top, left };
}

function placeGrid(instant, drag) {
  if (drag && dragFast_(drag)) return;
  DRAG_PLAN = null;
  /* Said before anything is measured or moved, so the width the stylesheet draws and the width
     this function spaces by cannot be different on the same frame. Setting a custom property that
     already holds that value costs nothing. */
  publishCardWidth_();
  const tabs = TABS.map(t => t.id);
  const ti = Math.max(0, tabs.indexOf(AT));
  const dxPx = (drag && drag.which === 'x') ? drag.px : 0;
  const dyPx = (drag && drag.which === 'y') ? drag.px : 0;
  const stepX = stepX_();

  /* ---------- THREE PASSES — WRITE, READ, WRITE — AND THAT IS THE WHOLE OF THE SPEED § */
  /* ---------- AN INSTANT PLACEMENT DOES NOT CANCEL A SLIDE THAT IS STILL RUNNING § */
  if (instant && !drag && SETTLE_ON && performance.now() < SETTLE_ON.until) instant = false;
  const hosts = [];
  tabs.forEach((id, i) => {
    const host = $('s-' + id);
    if (!host) return;
    hosts.push({ id: id, i: i, host: host, wasFront: host.classList.contains('is-front') });

    /* A SCREEN IS THE COLUMN, and the column is what moves. § */
    host.classList.remove('hidden');
    host.style.display = 'flex';
    host.style.position = 'absolute';
    host.style.top = '0'; host.style.right = '0'; host.style.bottom = '0'; host.style.left = '0';
    host.style.overflow = 'visible';
    /* `is-front`, NOT `on`. § */
    host.classList.toggle('is-front', id === AT);
    /* A FINGER IS DOWN — read by `holdColumn_`. It used to be `no-anim`, which switched off every
       transition on the column; a drag now zeroes only its own axis (`colTransition_` below). */
    host.classList.toggle('dragging', !!drag);
  });
  /* A CARD HELD BECAUSE YOU WERE USING IT IS LET GO THE MOMENT ANOTHER ONE IS IN FRONT — see
     `HOLD_AT`. Before the shifts are read, so the card arrived at is centred. */
  if (HOLD_AT && (HOLD_AT.id !== AT || (PAGE[AT] || 0) !== HOLD_AT.p)) HOLD_AT = null;
  /* Slid so the page being read sits in the middle — see `columnShift_`. A vertical drag only ever
     moves the screen in front; the others have no finger on them. READ ONLY — see the three passes
     above. */
  hosts.forEach(h => {
    h.shift = columnShift_(h.host, domIndex_(h.id, PAGE[h.id] || 0)) + (h.id === AT ? dyPx : 0);
  });
  /* AND WHICH CARDS THAT LEAVES ON THE GLASS — see `GLASS`. Still in the reading pass. */
  if (!drag) GLASS = glassNow_(hosts, ti, stepX);
  /* THE SETTLE, if this placement is the one a release asked for. § */
  /* WHENEVER IT COMES. A window of 150ms was the first version, and on a slow phone the placement a release asks for can start later than that — it then fell back § */
  const rel = !instant && !drag && SETTLE_FROM ? SETTLE_FROM : null;
  if (rel) {
    SETTLE_FROM = null;
    let D = 0;
    hosts.forEach(({ i, host, shift }) => {
      const was = colPlaced_(host);
      if (!was) return;
      const d = rel.axis === 'x' ? (i - ti) * stepX - was[0] : shift - was[1];
      if (Math.abs(d) > Math.abs(D)) D = d;
    });
    const c = settleCurve_(D, rel.v);
    /* SIXTEEN MILLISECONDS IN ALREADY — see the delay below. */
    SETTLE_ON = { axis: rel.axis, dur: c.dur, tf: c.tf, until: performance.now() + c.dur - 16 };
  }
  const settle = !instant && !drag && SETTLE_ON && performance.now() < SETTLE_ON.until ? SETTLE_ON : null;
  /* ON THE COLUMN, NOT THE ROOT — see `settleCurve_`. § */
  const runs = ax => (settle && settle.axis === ax
    ? { d: settle.dur + 'ms', tf: settle.tf, delay: '-16ms' } : SLIDE_TAP);
  const front = hosts.find(h => h.id === AT);
  const before = front && !instant && !drag ? colPlaced_(front.host) : null;
  /* ON A WIDE WINDOW, how far from the middle a column can be and still have a card on the glass:
     half the window and half a card, and one step more, so a column a drag is about to bring in is
     already drawn. */
  const glass = WIDE ? appWidth_() / 2 + stepX * 1.5 : 0;
  /* ---------- AND WHAT A SLIDE CARRIES ACROSS THE GLASS STAYS DRAWN WHILE IT IS CARRIED § */
  const now = performance.now();
  if (!drag) TRAIL_X = trailX_(ti, now, !!instant, settle);
  const xRun = now < TRAIL_X.until || !drag;
  const xlo = xRun ? Math.min(TRAIL_X.lo, ti) : ti, xhi = xRun ? Math.max(TRAIL_X.hi, ti) : ti;
  let wider = xlo < xhi;
  hosts.forEach(h => {
    const dx = h.i - ti;
    const at = PAGE[h.id] || 0;
    const acrossT = h.i < xlo ? xlo - h.i : h.i > xhi ? h.i - xhi : 0;
    const glassH = h.host.clientHeight || innerHeight;
    const dur = settle ? settle.dur : 300;
    const band = trailY_(h.host, h.shift, glassH, now, !!drag, !!instant, dur);
    if (band.top < -h.shift - 1 || band.bot > -h.shift + glassH + 1) wider = true;
    const c = { at: at, across: Math.abs(dx), acrossT: acrossT,
      onGlass: WIDE && acrossT * stepX < glass,
      drag: !!drag, lo: band.top - glassH, hi: band.bot + glassH };
    c.skip = !drag && h.id !== AT && GLASS.cols.indexOf(h.id) === -1;
    h.c = c;
    h.pg = pagesRead_(h.host, h.id, c);
  });
  /* PUT BACK TO THE GLASS ONCE THE SLIDE HAS ENDED — see `trailEnd_`. */
  if (wider && !drag && typeof afterSlide_ === 'function') afterSlide_(trailEnd_, 'trail');
  hosts.forEach(({ id, i, host, shift, c, pg, wasFront }) => {
    const dx = i - ti;
    const at = c.at;
    const x = dx * stepX + dxPx;
    /* A COLUMN ARRIVING ON THE PAGE IT WAS PLACED FOR, WHOSE CARD CHANGED HEIGHT SINCE, TAKES ITS NEW HEIGHT NOW: the slide carries it across, never down (382). */
    if (!instant && !drag && !wasFront && host.PLACED_P === at) {
      const was = colPlaced_(host);
      if (was && Math.abs(shift - was[1]) > 0.5) colShiftNow_(host, shift - was[1]);
    }

    /* EACH AXIS ITS OWN CLOCK — see `colWrite_`. The finger's axis follows the finger; the other
       keeps whatever slide it is in the middle of. */
    colTransition_(host,
      instant || (drag && drag.which === 'x') ? SLIDE_NONE : runs('x'),
      instant || (drag && drag.which === 'y' && id === AT) ? SLIDE_NONE : runs('y'),
      instant ? SLIDE_NONE : { d: '.22s', tf: 'ease', delay: '0s' });
    colWrite_(host, x, shift);
    /* WHICH PAGE THIS SHIFT WAS WORKED OUT FOR — read by `holdColumn_`, which corrects a column only
       for the page it was sent to. */
    host.PLACED_P = at;
    /* Only the screen in front takes presses. A sliver of the next tab showing at the edge is
       something to look at, not something to tap. */
    /* STILL TRUE ON A WIDE WINDOW, where the columns beside are whole and readable: § */
    host.style.pointerEvents = dx === 0 ? 'auto' : 'none';
    const across = Math.abs(dx);
    /* ---------- THE NEIGHBOUR IS BARELY DIMMED, AND HERE IS WHY § */
    /* ---------- AND THE ROW KEEPS DRAWN THE COLUMNS A SLIDE CROSSES § */
    const onGlass = c.onGlass;
    const lit = WIDE && c.acrossT * stepX < glass + stepX;
    const op = across === 0 ? '1' : WIDE ? (lit ? '1' : '0')
      : c.acrossT <= 3 ? '.92' : '0';
    /* ---------- AND A COLUMN COMING BACK FROM NOUGHT IS DRAWN AT ONCE, NOT FADED IN § */
    const was = +host.style.opacity || 0;
    if (!instant && was <= 0.05 && +op > 0.05) colTransition_(host, null, null, { d: '0s', tf: 'linear', delay: '0s' });
    host.style.opacity = op;
    /* AND SIDEWAYS, THE SAME. § */
    host.style.visibility = c.acrossT > 4 && !lit ? 'hidden' : 'visible';

    /* AND EACH PAGE — `placePages_`, below, which a builder placing one column alone (`placeOne_`) shares. § */
    placePages_({ id: id, host: host }, c, pg);
  });

  if (drag) {
    /* THE SUMS THIS FRAME DID, KEPT FOR THE REST OF THE DRAG — see `dragFast_`. The finger's own
       offset taken back out, so the plan is where each column RESTS. */
    DRAG_PLAN = { which: drag.which, at: AT, page: PAGE[AT] || 0, stepX: stepX,
      cols: hosts.map(h => ({ host: h.host, x: (h.i - ti) * stepX, y: h.shift - (h.id === AT ? dyPx : 0), front: h.id === AT })) };
    softDrag_(drag.which, drag.px, stepX);
    return;
  }
  softSettle_(settle ? runs(settle.axis) : SLIDE_TAP, instant);

  /* A SLIDE THE EYE CAN FOLLOW — the column in front going somewhere new — is a window in which a tap
     is not a press. See `SLIDE_UNTIL`. */
  if (before && front) {
    const now = colPlaced_(front.host);
    if (now && (Math.abs(now[0] - before[0]) > 2 || Math.abs(now[1] - before[1]) > 2)) {
      SLIDE_UNTIL = performance.now() + (settle ? settle.dur : 300);
    }
  }

  /* ---------- A FIELD ON A CARD THAT HAS LEFT IS LET GO OF § */
  try {
    const fe = document.activeElement;
    const pg = fe && fe !== document.body && fe.closest ? fe.closest('#screen .page') : null;
    if (pg && !pg.classList.contains('on') && typeof fe.blur === 'function') fe.blur();
  } catch (e) { /* a field that keeps its focus is the behaviour before this existed */ }
}

/* ---------- EACH PAGE OF ONE COLUMN, AND ONLY WHAT CHANGED § */
function placePages_(h, c, pg) {
  const id = h.id, host = h.host;
  const r = pg || pagesRead_(host, id, c);
  if (r.skipped) return;
  /* A DRAG'S WRITES ARE NOT A RESTING STATE — the blur is left to the finger — so the next placement walks. */
  host.PG_SIG = c.drag ? null : r.sig;
  r.pages.forEach((el, pos) => {
    /* WHICH PAGE THIS ELEMENT IS -- see `logIndex_`. Identical to `pos` on every screen that
       holds all of its pages, which is all of them but the Find screen. */
    const p = logIndex_(id, pos);
    const d = Math.abs(p - c.at);
    const focused = id === AT && p === c.at;
    const was = el.PG || null;
    /* OUT OF FOCUS — see the note over `SOFT_BLUR`. Not during a drag: the classes describe where
       the cards ARE, and a finger has not moved the focus until it lets go. */
    /* AND ON A WIDE WINDOW, EVERY CARD ON THE GLASS BUT ONE. § */
    let soft = was ? was.soft : false, dim = was ? was.dim : null;
    if (!c.drag) {
      soft = !focused && (WIDE ? (c.across === 0 || c.onGlass) && d <= 3 : c.across <= 1 && d <= 2);
      if (soft) dim = softDim_(el);
    }
    /* ---------- DRAWN WHILE ITS BOX MEETS THE BAND, AND ONLY THEN § */
    const box = r.boxes[pos];
    const inBand = !!box && box[0] < c.hi && box[0] + box[1] > c.lo;
    /* DIMMING ON A BLACK SCREEN IS DELETING. § */
    /* A TALL WIDE WINDOW SHOWS A FOURTH CARD DOWN, so there nothing near is faded to nothing —
       it would be a hole in a column you can otherwise read. The focus is said by `.soft` above. */
    pageWrite_(el, {
      on: focused,
      far: !inBand,
      soft: soft, dim: dim,
      op: !inBand ? '0' : WIDE ? '1' : d === 0 ? '1' : d === 1 ? '.9' : '.75',
      /* ---------- THE CARD IN FRONT, NOT EVERY COLUMN'S CURRENT CARD § */
      vis: inBand ? 'visible' : 'hidden',
    });
    /* A pane used to be measured here, to decide whether it had overflowed and should therefore get the vertical gesture back for scrolling. § */
  });
}
/* THE READING HALF, done in `placeGrid`'s reading pass so no offset is asked after a write: § */
const PAGE_READ = 12;
function pagesRead_(host, id, c) {
  const pages = host.querySelectorAll(':scope > .page');
  const sig = [c.at, Math.round(c.lo), Math.round(c.hi), c.across, c.onGlass ? 1 : 0, WIDE ? 1 : 0,
    pages.length, PAGE_LO[id] || 0].join('|');
  if (c.skip && host.PG_SIG === sig) return { skipped: true };
  const boxes = [];
  for (let pos = 0; pos < pages.length; pos++) {
    const p = logIndex_(id, pos);
    boxes.push(Math.abs(p - c.at) > PAGE_READ ? null : [pages[pos].offsetTop, pages[pos].offsetHeight]);
  }
  return { pages: pages, sig: sig, boxes: boxes };
}

/* ---------- THE TRAIL, DOWN ONE COLUMN § */
const TRAIL_CAP = 8;
function trailY_(host, shift, glassH, now, drag, instant, dur) {
  const tTop = -shift, tBot = -shift + glassH;
  const T = host.TRAIL;
  const run = !!(T && (now < T.until || (!drag && !instant && slideRunning_(host, colProp_('y')))));
  let top = tTop, bot = tBot;
  if (run) { top = Math.min(top, T.top); bot = Math.max(bot, T.bot); }
  else if (!drag && !instant) {
    const was = colPlaced_(host);
    if (was) { top = Math.min(top, -was[1]); bot = Math.max(bot, -was[1] + glassH); }
  }
  top = Math.max(top, tTop - TRAIL_CAP * glassH);
  bot = Math.min(bot, tBot + TRAIL_CAP * glassH);
  const band = { top: top, bot: bot, until: drag || instant ? (run ? T.until : 0) : now + dur + 50 };
  if (!drag) host.TRAIL = band;
  if (!drag && !instant) trailFrom_(band, dur);
  return band;
}
/* ---------- A SLIDE ENDS `dur` AFTER THE FRAME IT STARTS IN, NOT AFTER THE WRITE THAT ASKED FOR IT § */
function trailFrom_(band, dur) {
  try { requestAnimationFrame(() => { band.until = Math.max(band.until, performance.now() + dur + 50); }); } catch (e) {}
}
/* ---------- AND A SLIDE STILL RUNNING IS STILL A SLIDE, WHATEVER THE CLOCK SAYS § */
function slideRunning_(host, prop) {
  try {
    return !!(host && host.getAnimations && host.getAnimations().some(a => a.playState === 'running'
      && (prop ? a.transitionProperty === prop : a.transitionProperty === 'transform' || a.transitionProperty === 'translate')));
  } catch (e) { return false; }
}
/* AND ACROSS THE ROW: the column indices the row has swept while its sideways slide still runs, the index
   it is leaving and the one it is going to. `at` is the index this placement was for. */
let TRAIL_X = { lo: 0, hi: 0, at: null, until: 0 };
function trailX_(ti, now, instant, settle) {
  const T = TRAIL_X;
  const run = now < T.until || (!instant && T.at != null && slideRunning_($('s-' + ((TABS[T.at] || {}).id)), colProp_('x')));
  let lo = ti, hi = ti;
  if (run) { lo = Math.min(lo, T.lo); hi = Math.max(hi, T.hi); }
  else if (!instant && T.at != null) { lo = Math.min(lo, T.at); hi = Math.max(hi, T.at); }
  const moved = T.at !== ti;
  const dur = settle && settle.axis === 'x' ? settle.dur : 300;
  const out = { lo: lo, hi: hi, at: ti,
    until: instant ? (run ? T.until : 0) : moved || run ? now + dur + 50 : T.until };
  if (!instant && (moved || run)) trailFrom_(out, dur);
  return out;
}
/* ONCE THE SLIDES HAVE ENDED, THE BAND GOES BACK TO THE GLASS. § */
function trailEnd_() {
  const now = performance.now();
  let until = TRAIL_X.until;
  TABS.forEach(t => { const h = $('s-' + t.id); if (h && h.TRAIL) until = Math.max(until, h.TRAIL.until); });
  if (until > now) { setTimeout(() => afterSlide_(trailEnd_, 'trail'), Math.ceil(until - now)); return; }
  /* NOR WHILE A SLIDE IS STILL RUNNING past its clock (`slideRunning_`, above). */
  if (TABS.some(t => slideRunning_($('s-' + t.id)))) { setTimeout(() => afterSlide_(trailEnd_, 'trail'), 100); return; }
  const wide = TRAIL_X.lo < TRAIL_X.hi || TABS.some(t => {
    const h = $('s-' + t.id);
    const was = h && h.TRAIL && colPlaced_(h);
    return !!(was && (h.TRAIL.top < -was[1] - 1 || h.TRAIL.bot > -was[1] + (h.clientHeight || innerHeight) + 1));
  });
  if (wide) placeCells('y', true);
}
/* ONE PAGE'S WRITES, EACH ONLY IF IT DIFFERS FROM WHAT THIS ELEMENT WAS LAST GIVEN. § */
function pageWrite_(el, st) {
  const was = el.PG;
  if (!was) { el.style.position = 'static'; el.style.transform = 'none'; }
  if (!was || was.on !== st.on) {
    el.classList.toggle('on', st.on);
    el.style.pointerEvents = st.on ? 'auto' : 'none';
  }
  if (!was || was.far !== st.far) el.classList.toggle('far', st.far);
  if (!was || was.soft !== st.soft) el.classList.toggle('soft', st.soft);
  if (st.soft && (!was || was.dim !== st.dim)) el.classList.toggle('soft-dim', !!st.dim);
  if (!was || was.op !== st.op) el.style.opacity = st.op;
  if (!was || was.vis !== st.vis) el.style.visibility = st.vis;
  el.PG = st;
}

/* ---------- ONE COLUMN PLACED ON ITS OWN, WITH NOTHING MOVING § */
function placeOne_(id) {
  const host = $('s-' + id);
  if (!host || !PLACED_ONCE || !host.style.transform) return;
  if (id === AT || GLASS.cols.indexOf(id) !== -1) { placeCells('y', true, 0, id); return; }
  const tabs = TABS.map(t => t.id);
  const ti = Math.max(0, tabs.indexOf(AT)), i = tabs.indexOf(id);
  if (i < 0) return;
  const stepX = stepX_();
  const at = PAGE[id] || 0;
  const shift = columnShift_(host, domIndex_(id, at));
  const across = Math.abs(i - ti);
  const onGlass = WIDE && Math.abs((i - ti) * stepX) < appWidth_() / 2 + stepX * 1.5;
  const glassH = host.clientHeight || innerHeight;
  /* NOTHING IS SLIDING (the builder's own gate), so the band is this column's glass and one either side. */
  const band = trailY_(host, shift, glassH, performance.now(), false, true, 0);
  const c = { at: at, across: across, acrossT: across, onGlass: onGlass, drag: false, skip: false,
    lo: band.top - glassH, hi: band.bot + glassH };
  const pg = pagesRead_(host, id, c);
  colTransition_(host, SLIDE_NONE, SLIDE_NONE, null);
  colWrite_(host, (i - ti) * stepX, shift);
  host.PLACED_P = at;
  placePages_({ id: id, host: host }, c, pg);
}

/* ONE PLACEMENT PER FRAME, AND ANIMATION WINS § */
let PLACE_WANT = null;      // { which, instant, id } — what has been asked for this turn
let PLACED_ONCE = false;    // the very first placement runs now, not next frame
let PLACE_FRAME = 0;

function placeCells(which, instant, dragPx, id) {
  /* A DRAG IS NOT A REQUEST. It is already once-per-frame — `pointermove` books its own frame —
     and it must land now rather than next frame. Straight through. */
  if (dragPx) return placeNow_(which, instant, dragPx, id);
  /* A QUESTION BEING READ ALOUD STOPS WHEN ITS PAGE OR COLUMN IS LEFT (394). */
  if (typeof readAloudStray_ === 'function') readAloudStray_();

  /* THE FIRST ONE IS NOT DEFERRED. § */
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

  /* `bookDropMove_` WAS CALLED HERE, before the drag guard below, for the one thing this app ever placed against the viewport rather than the grid: § */

  /* THE TWO SWEEPS BELOW DO NOT RUN WHILE A FINGER IS DOWN. § */
  if (dragPx) return;

  /* ---------- AND WHAT RUNS IN THE CARDS THIS LEFT ON THE GLASS § */
  if (typeof widgetsGlass_ === 'function') widgetsGlass_();

  /* ---------- AND WHICH CARDS ARE TOO TALL FOR THE PANE THEY ARE IN § */
  if (typeof paneWatch_ === 'function') paneWatch_($('s-' + AT));
  /* THE NEXT PICTURES OF THE COLUMN IN FRONT, asked for six pages ahead — see `picsAhead_` in posts.js. § */
  if (typeof picsAhead_ === 'function') picsAhead_(AT);

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

/* ---------- WIDGETS AS PAGES § */
const PAGER = {
  /* POSTS ARE HOWEVER MANY THERE ARE, so this is a function rather than a list. § */
  /* EVERY SCREEN IS PAGED. § */
  /* ---------- THESE KEYS ARE SCREEN IDS, AND TWO OF THEM NAMED SCREENS THAT DO NOT EXIST § */
  /* ---------- THE PAGER COUNTED A LIST THE SCREEN DOES NOT DRAW § */
  account: () => {
    const n = (typeof accountPages_ === 'function' ? accountPages_().length : 0)
            + (typeof termsPages_ === 'function' ? termsPages_().length : 0);
    return Array.from({ length: n }, (_, i) => (n > 1 ? (i + 1) + ' of ' + n : ''));
  },
  /* `book` WAS HERE — a pager for a column that no longer exists. Find has its own count. */

  /* Empty names, one per post. § */
  /* One name per page, and the ＋ card is a page — so it is counted here too, or the pager stops one short and the last post can never be reached. § */
  /* The ＋ card is a page and everybody signed in has one, so everybody's count includes it. § */
  /* ---------- THE FEED IS FOUR KINDS OF PAGE NOW, NOT TWO § */
  /* GUARDED, because shell.js is file five and collections.js is file twenty-one. § */
  /* ---------- TOOLS AND GAMES PAGE NOW, SO THEY NEED NAMING § */
  tools:  () => (typeof widgetsOf_ === 'function' ? widgetsOf_('tool') : []).map(w => w.name || ''),
  games:  () => (typeof widgetsOf_ === 'function' ? widgetsOf_('game') : []).map(w => w.name || ''),
  /* THE SAME LIST THE COLUMN IS BUILT FROM, which is the rule every other entry here follows: § */
  saved:  () => (typeof savedCards_ === 'function' ? savedCards_().length : 1),
  /* NEVER 0, because the column always draws SOMETHING — the sentence saying nothing is spotlit is a page, and a count of nothing over a page that exists is a § */
  spotlight: () => (typeof spotlightCards_ === 'function' ? spotlightCards_().length : 1),
  /* AND THE SAME AGAIN FOR SETTINGS. § */
  settings: () => (typeof settingsPages_ === 'function' ? settingsPages_().length : 1),
  /* THE SHOP, COUNTED FROM `shopCards_`, the list `screen('shop')` draws. Never nought: the basket
     is always page 0, and with nothing for sale the shop says so in a page of its own. */
  shop: () => (typeof shopCards_ === 'function' ? shopCards_().length : 1),
  /* PROGRESS, COUNTED FROM `progressCards_`, the list `screen('progress')` draws. § */
  progress: () => (typeof progressCards_ === 'function' ? progressCards_().length : 1),
  /* THE BUSINESS RECORDS, COUNTED FROM `bizPages_`, the list `screen('biz')` draws — five cards for an admin. § */
  biz: () => (typeof bizPages_ === 'function' ? bizPages_().length : 0),

  /* ---------- AND `booking` HAD NO ENTRY AT ALL, WHICH IS THE FAULT THE NOTE ABOVE DESCRIBES § */
  booking: () => {
    if (typeof bookingPages_ !== 'function') return [];
    let n = 0;
    try { n = bookingPages_({ column: true }).length; } catch (e) { return []; }
    if (!n) return [];
    const jobs = typeof myJobsOrdered_ === 'function' ? myJobsOrdered_() : [];
    return Array.from({ length: n }, (_, i) => {
      if (i === 0) return typeof USER !== 'undefined' && USER ? 'Book' : 'Sign in';
      const j = jobs[i - 1];
      /* PAST THE SESSIONS IS THE BASKET — `bookingPages_` appends it in column mode only. Derived
         from running off the end of the job list rather than from a second count of it. */
      if (!j) return 'Basket';
      return [j.subject, j.weekday].filter(Boolean).join(' \u00b7 ') || 'Session';
    });
  },

  /* `.concat(USER ? [''] : [])` WAS HERE, COUNTING THE ＋ CARD. § */
  /* ---------- AND `spotPages()` WENT FROM HERE, BECAUSE THE FEED STOPPED DRAWING IT § */
  /* COUNTED FROM `feedColumn_`, the list `screen('feed')` draws, which now holds the camera as well — one page directly above the newest post. § */
  feed:   () => (typeof feedColumn_ === 'function' ? [].concat(feedColumn_()) : ['']).map(() => ''),
  /* ---------- THE REELS COLUMN HAD NO ENTRY HERE, AND THAT IS WHY IT MOVED DIFFERENTLY § */
  reel:   () => (typeof reelPages_ === 'function' ? reelPages_() : ['']),
  /* ---------- AND MESSAGES WAS THE SIXTH COLUMN TO LOSE ITS AXIS THIS WAY § */
  dm:     () => (typeof dmPages_ === 'function' ? dmPages_().map(p => p.name) : ['']),
  /* THE CAMERA, WHICH IS ONE PAGE AND IS COUNTED ANYWAY. § */
  /* `make:` WAS HERE, counting the camera column's one card. The camera is a page of the feed
     now and `PAGER.feed` counts it — see the note there. */
  /* The controls, then the results. Named so the header says which page of how many — on a list
     you are working through, that is the one thing a title cannot tell you and the number is
     worth having. */
  /* ---------- THE FIND PAGER COUNTS EVERY PAGE, NOT JUST THE RESULTS § */
  /* A COUNT RATHER THAN A LIST OF NAMES, and it is the only entry that needs to be. § */
  /* ---------- THE SAME GROUPS `screen('stuff')` BUILDS FROM, WHICH IS THIS TABLE'S OWN RULE § */
  stuff:  () => finderPageCount_('stuff'),
  /* THE SECOND FINDER, counted by the same engine in its own binding (`finderPageCount_` in find.js)
     — the question, then its results; it has no pages in front of the question. */
  res:    () => finderPageCount_('res'),
};

/** The page names for a screen, whether they are a list or worked out each time. */
function pagerNames(id) {
  const v = PAGER[id];
  return typeof v === 'function' ? v() : (v || []);
}

/* Which page each paged screen is showing. § */
/* ---------- WHERE EACH COLUMN OPENS § */
/* A FUNCTION, NOT A NUMBER, and the Posts column is why. § */
const PAGE_HOME = {
  /* ---------- SPOTLIGHT IS WHAT THE COLUMN OPENS ON, WHEN THERE IS ONE § */
  /* SAME RENAME AS `PAGER` ABOVE, and the same silent failure: § */
  /* THE `USER ? 1 : 0` SKIPPED PAST THE ＋ CARD, which is no longer on this screen — so it now skips past the first festive card or the newest post instead, which § */
  /* ---------- THE NEWEST POST, PAST THE CAMERA ABOVE IT § */
  /* ---------- AND WHEN THERE IS NO POST, NOT THE CAMERA EITHER § */
  feed:    () => {
    if (typeof feedCamAt_ !== 'function') return 0;
    const at = feedCamAt_();
    return pageCount('feed') > at + 1 ? at + 1 : Math.max(0, at - 1);
  },
  /* ---------- AND `account` HAS BEEN OPENING ON SOMEBODY ELSE § */
  account: () => 0,
  /* `dm` WAS HERE, AT 1, TO SKIP THE HEAD CARD — and the head card is gone, so page 0 is the newest conversation by construction § */
};
/* `book` WAS HERE — a column that no longer exists. */
/* ---------- THE ICON, FROM THE SHEET § */
function applyBrandIcon_() {
  /* ---------- A DRIVE SHARE LINK IS A PAGE, NOT A PICTURE § */
  const raw = ((DATA || {}).brand || {}).logo_square;
  if (!raw) return;
  const m = String(raw).match(/[-\w]{25,}/);
  const url = /^https?:\/\//i.test(raw) && !/drive\.google\.com\/file/.test(raw)
    ? String(raw)
    : (m ? 'https://drive.google.com/thumbnail?id=' + m[0] + '&sz=w512' : String(raw));
  [['favicon', 'icon'], ['favicon-ios', 'apple-touch-icon']].forEach(([id, rel]) => {
    const old = document.getElementById(id);
    if (old) old.remove();
    const el = document.createElement('link');
    /* THE DEFAULT `logo_square` IS `icon.png`, THE SQUARE ONE, so taken as given it would put the square back on the tab the moment the payload lands. § */
    el.id = id; el.rel = rel;
    el.href = (rel === 'icon' && url === 'icon.png') ? 'favicon.png' : url;
    document.head.appendChild(el);
  });
}

/* KEYED BY SCREEN ID, like `PAGER` and `PAGE_HOME` — and `posts` and `me` are not screen ids. See
   the long note on `PAGER`. Every screen that pages needs an entry here or its position is not
   remembered between visits. */
/* `booking` AND `dm` WERE MISSING, and this table's own sentence above is the rule they broke: § */
const PAGE = { feed: 0, stuff: 0, account: 0, tools: 0, games: 0, reel: 0, booking: 0, dm: 0, make: 0,
               saved: 0, settings: 0, spotlight: 0, shop: 0, progress: 0, res: 0, biz: 0 };

/* A COLUMN MAY HOLD FEWER PAGE ELEMENTS THAN IT HAS PAGES. § */
const PAGE_KEEP = {};
const PAGE_LO = {};
/* WHICH ELEMENT IS PAGE `i` — AND -1 FOR A PAGE THAT HAS SCROLLED OFF THE FRONT OF THE WINDOW. § */
const domIndex_ = (id, i) => {
  const keep = PAGE_KEEP[id] || 0;
  if (i < keep) return i;
  const d = i - (PAGE_LO[id] || 0);
  return d < keep ? -1 : d;
};
/* AND WHICH PAGE ELEMENT `p` IS. */
const logIndex_ = (id, p) => (p < (PAGE_KEEP[id] || 0) ? p : p + (PAGE_LO[id] || 0));

/* WHETHER A COLUMN HAS BEEN OPENED YET. The home position applies once — after that `PAGE` is where
   somebody left it, and putting them back at the top every time is a pager they have to
   re-navigate on every glance at another tab. */
const PAGE_OPENED = {};
function pageHome_(id) {
  if (PAGE_OPENED[id]) return;
  const home = PAGE_HOME[id];
  if (!home) { PAGE_OPENED[id] = true; return; }

  /* ---------- NOT UNTIL THE COLUMN IS THE SHAPE IT WILL BE § */
  if (pageCount(id) < 2) return;
  if (!LOADED) return;

  PAGE_OPENED[id] = true;
  const n = home();
  PAGE[id] = Math.max(0, Math.min(n, Math.max(0, pageCount(id) - 1)));
}

/* A NUMBER OR A LIST. The names were read by the header and there is no header, so `pagerNames` is only ever asked for its LENGTH -- and `PAGER.stuff` was § */
/* ---------- AND COUNTED ONCE A HANDLER, NOT FIVE TIMES A FLICK § */
let COUNT_HOLD = null;
function countHold_(on) { COUNT_HOLD = on ? new Map() : null; }
/* ---------- AND NOT BUILT AT ALL WHILE THE COLUMN IS THE ONE IT WAS § */
const COUNT_MEMO = new Map();
const pageCount = id => {
  if (COUNT_HOLD && COUNT_HOLD.has(id)) return COUNT_HOLD.get(id);
  const host = typeof finderOf_ === 'function' && finderOf_(id) ? null : document.getElementById('s-' + id);
  const k = host && host.firstElementChild;
  const m = k ? COUNT_MEMO.get(id) : null;
  let n;
  if (m && m.k === k && m.len === host.childElementCount) n = m.n;
  else {
    const v = pagerNames(id);
    n = typeof v === 'number' ? Math.max(0, v | 0) : v.length;
    if (k) COUNT_MEMO.set(id, { k: k, len: host.childElementCount, n: n });
  }
  if (COUNT_HOLD) COUNT_HOLD.set(id, n);
  return n;
};

/* THE DIAL. Every widget sits on the same spindle and only the one at the front is full size. § */
/* ---------- WORK THAT MUST NOT HAPPEN DURING A SLIDE § */
/* ---------- ONE TIMER HELD ONE JOB, AND THERE HAVE ALWAYS BEEN THREE § */
let AFTER_SLIDE = null;
const AFTER_SLIDE_JOBS = new Map();
let AFTER_SLIDE_HELD = 0;   // when the booked jobs first found a finger down, for the cap below

function afterSlide_(fn, key) {
  AFTER_SLIDE_JOBS.set(key || fn, fn);
  if (AFTER_SLIDE) clearTimeout(AFTER_SLIDE);
  AFTER_SLIDE = setTimeout(function run() {
    /* NOT INSIDE A SETTLE, AND NOT UNDER A FINGER. § */
    /* ---------- A FINGER DOWN AT ALL, NOT ONLY ONE THAT HAS CHOSEN ITS AXIS § */
    const now = performance.now();
    const down = typeof SWIPE !== 'undefined' && !!SWIPE.live;
    if (!down) AFTER_SLIDE_HELD = 0;
    else if (!AFTER_SLIDE_HELD) AFTER_SLIDE_HELD = now;
    const wait = SETTLE_ON && now < SETTLE_ON.until ? Math.ceil(SETTLE_ON.until - now) + 50
               : down && now - AFTER_SLIDE_HELD < 1500 ? 100 : 0;
    if (wait) { AFTER_SLIDE = setTimeout(run, wait); return; }
    AFTER_SLIDE_HELD = 0;
    const jobs = [...AFTER_SLIDE_JOBS.values()];
    AFTER_SLIDE_JOBS.clear();
    /* ---------- AND STILL "BOOKED" UNTIL THE LAST OF THEM HAS RUN (`AFTER_SLIDE` is this run's mark) § */
    const mark = {};
    AFTER_SLIDE = mark;
    /* ONE JOB THAT THROWS MUST NOT TAKE THE REST WITH IT. § */
    const next = () => {
      const f = jobs.shift();
      if (f) { try { f(); } catch (e) {} }
      if (jobs.length) { setTimeout(next, 0); return; }
      if (AFTER_SLIDE === mark) AFTER_SLIDE = null;
      /* AND THEN THE BUILDER, which waits for exactly this list to be empty — see `ahead_` below. */
      if (typeof aheadKick_ === 'function') aheadKick_();
    };
    next();
  }, 300);
}

/* AHEAD: WHAT A FLICK CAN REACH IS DRAWN BEFORE IT GETS THERE § */
const AHEAD = { open: false, pre: false, opened: 0, input: 0, booked: 0, timer: 0, dir: { x: 0, y: {} }, stuck: new Set(), running: false };
const AHEAD_SLOW = new Set();
const AHEAD_QUIET = 400, AHEAD_QUIET_SLOW = 1000, AHEAD_SLOW_MS = 150;
/* ---------- THE SLOW BIT IS KEPT ON THE DEVICE, AND A COLUMN'S FIRST DRAW IS SLOW UNTIL IT HAS BEEN TIMED § */
const AHEAD_SLOW_KEY = 'familyAheadSlow';
try { (JSON.parse(localStorage.getItem(AHEAD_SLOW_KEY) || '[]') || []).forEach(k => { if (typeof k === 'string') AHEAD_SLOW.add(k); }); } catch (e) {}
function aheadSlowKeep_() {
  try { localStorage.setItem(AHEAD_SLOW_KEY, JSON.stringify([...AHEAD_SLOW].filter(k => /^(paint|widget):/.test(k)))); } catch (e) {}
}
/* THE LAST TWO HUNDRED SLICES, for the harness and the journeys: what ran, for how long, and whether any
   gate was open that should not have been. */
window.__aheadLog = [];
/* ONE PASSIVE LISTENER FOR THE QUIET — the time of the last thing a hand did. A pointer lifting is a stroke
   or a swipe ending, which is a reason to look again once the quiet has come. */
['pointerdown', 'pointermove', 'wheel', 'keydown'].forEach(t =>
  addEventListener(t, () => { AHEAD.input = performance.now(); }, { capture: true, passive: true }));
addEventListener('pointerup', () => { AHEAD.input = performance.now(); aheadKick_(AHEAD_QUIET); }, { capture: true, passive: true });
document.addEventListener('focusout', () => { AHEAD.stuck.clear(); aheadKick_(AHEAD_QUIET); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) aheadKick_(); });

/* OPENED TWO FRAMES AFTER THE FIRST GOOD PAYLOAD'S LANDING TASK — the screen in front has been drawn and
   shown before anything is built behind it. */
function aheadOpen_() {
  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f => setTimeout(f, 16));
  raf(() => raf(() => { AHEAD.open = true; AHEAD.opened = performance.now(); AHEAD.input = Math.max(AHEAD.input, AHEAD.opened); aheadKick_(); }));
}

/* AND BEFORE THE PAYLOAD, WHICH TAKES 15–45s FROM THE REAL BACKEND: § */
function aheadPreOpen_() {
  try { if (navigator.connection && navigator.connection.saveData) return; } catch (e) {}
  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f => setTimeout(f, 16));
  raf(() => raf(() => { if (AHEAD.open) return; AHEAD.pre = true; AHEAD.input = Math.max(AHEAD.input, performance.now()); aheadKick_(); }));
}

/* -1: SHUT UNTIL SOMETHING KICKS IT (not open, hidden, held, somebody writing). >0: shut for about that
   long — looked at again then. 0: open, apart from the quiet, which the caller weighs per job. */
function aheadGate_() {
  if (!(AHEAD.open || AHEAD.pre) || document.hidden || window.__aheadHold) return -1;
  const now = performance.now();
  if (typeof SWIPE !== 'undefined' && SWIPE.live) return 100;
  if (SETTLE_ON && now < SETTLE_ON.until) return SETTLE_ON.until - now + 20;
  if (now < SLIDE_UNTIL) return SLIDE_UNTIL - now + 20;
  if (GLASS.at !== AT || PLACE_FRAME) return 50;
  if (AFTER_SLIDE || AFTER_SLIDE_JOBS.size || (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length)) return 150;
  /* SOMEBODY WRITING: a box focused anywhere — Find's answer box too, whatever `typingBox_` leaves out for
     its own reasons — or the pen's ink in a stroke. Kicked again by `focusout` and by the pointer lifting. */
  const a = document.activeElement;
  if (a && a.matches && a.matches(TYPING_)) return -1;
  if (typeof PAD_GO !== 'undefined' && PAD_GO) return -1;
  /* AN INPUT ALREADY WAITING FOR THE PAGE — `inputWaiting_`, below. */
  if (inputWaiting_()) return 50;
  return 0;
}
/* ---------- AND NOT WHILE AN INPUT IS ALREADY WAITING FOR THE PAGE § */
function inputWaiting_() {
  try { return !!(navigator.scheduling && navigator.scheduling.isInputPending && navigator.scheduling.isInputPending({ includeContinuous: true })); }
  catch (e) { return false; }
}

/* LOOK AGAIN IN `ms` — once; a look already booked is the one that happens. */
function aheadKick_(ms) {
  if (AHEAD.timer || AHEAD.booked) return;
  AHEAD.timer = setTimeout(aheadCheck_, ms == null ? 30 : Math.max(16, ms));
}
function aheadCheck_() {
  AHEAD.timer = 0;
  if (AHEAD.booked) return;
  const g = aheadGate_();
  if (g < 0) return;
  if (g > 0) { AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, Math.max(16, g))); return; }
  const quiet = performance.now() - AHEAD.input;
  if (quiet < AHEAD_QUIET) { AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, AHEAD_QUIET - quiet + 5)); return; }
  const pick = aheadPick_(quiet >= AHEAD_QUIET_SLOW);
  if (!pick.job) {
    if (pick.slow) AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, AHEAD_QUIET_SLOW - quiet + 5));
    return;
  }
  AHEAD.booked = 1;
  if (typeof requestIdleCallback === 'function') requestIdleCallback(aheadSlice_);
  else setTimeout(aheadSlice_, 60);
}
function aheadSlice_() {
  AHEAD.booked = 0;
  const g = aheadGate_();
  const quiet = performance.now() - AHEAD.input;
  if (g !== 0 || quiet < AHEAD_QUIET) { aheadKick_(g > 0 ? g : AHEAD_QUIET - quiet); return; }
  const job = aheadPick_(quiet >= AHEAD_QUIET_SLOW).job;
  if (!job) { aheadKick_(AHEAD_QUIET_SLOW - quiet); return; }
  const t0 = performance.now();
  /* THE JOB'S KEY WHILE IT RUNS — truthy, so `AHEAD.running` still says "a slice is running"; and what a draw
     or a check asks to know which job it is inside (the dm draw asks nobody when drawn ahead, posts.js). */
  AHEAD.running = job.key || true;
  let left = false;
  try { left = job.run() === false; }
  catch (e) { left = true; try { console.warn('[ahead]', job.key, e); } catch (x) {} }
  finally { AHEAD.running = false; }
  const ms = performance.now() - t0;
  const was = AHEAD_SLOW.has(job.key);
  if (ms > AHEAD_SLOW_MS) AHEAD_SLOW.add(job.key); else AHEAD_SLOW.delete(job.key);
  if (was !== AHEAD_SLOW.has(job.key) && /^(paint|widget):/.test(job.key)) aheadSlowKeep_();
  /* A JOB WHOSE REASON IS STILL STANDING AFTER IT RAN is not picked again until something kicks — a paint
     refused under typing, a widget whose start threw. Without this it would be picked every slice. */
  if (left || aheadStill_(job)) AHEAD.stuck.add(job.key);
  const log = window.__aheadLog;
  log.push({ key: job.key, ms: Math.round(ms * 10) / 10, t: Math.round(t0), quiet: Math.round(quiet),
    live: !!(typeof SWIPE !== 'undefined' && SWIPE.live), settle: !!(SETTLE_ON && t0 < SETTLE_ON.until),
    after: !!(AFTER_SLIDE || AFTER_SLIDE_JOBS.size) });
  if (log.length > 200) log.splice(0, log.length - 200);
  aheadKick_(0);
}
/* WHETHER A JOB THAT JUST RAN IS STILL WANTED — asked of the picker, which is the one place a job is made. */
function aheadStill_(job) {
  try { return aheadJobs_(true).some(j => j.key === job.key); } catch (e) { return false; }
}

/* ---------- THE JOBS, AS THEY STAND NOW § */
const AHEAD_KINDS = [];
const AHEAD_RANK = ['paint', 'fill', 'widget', 'pics', 'reels', 'centre', 'bible'];
function aheadJobs_(all) {
  const out = [];
  AHEAD_KINDS.forEach(k => { try { (k() || []).forEach(j => { if (AHEAD.open || j.pre) out.push(j); }); } catch (e) {} });
  return all ? out : out.filter(j => !AHEAD.stuck.has(j.key));
}
/* HOW FAR, IN MOVES, AND HALF A MOVE NEARER IN THE DIRECTION OF TRAVEL. */
function aheadDist_(id, page) {
  const ti = TABS.findIndex(t => t.id === AT), ci = TABS.findIndex(t => t.id === id);
  if (ci < 0 || ti < 0) return Infinity;
  const dc = ci - ti;
  let d = Math.abs(dc);
  if (dc && AHEAD.dir.x && Math.sign(dc) === AHEAD.dir.x) d -= 0.5;
  if (page != null) {
    const dp = page - (PAGE[id] || 0);
    d += Math.abs(dp);
    const dy = AHEAD.dir.y[id] || 0;
    if (dp && dy && Math.sign(dp) === dy) d -= 0.5;
  }
  return d;
}
function aheadPick_(slowOk) {
  let best = null, slow = false;
  aheadJobs_(false).forEach(j => {
    if ((AHEAD_SLOW.has(j.key) || j.cold) && !slowOk) { slow = true; return; }
    if (!best || j.d < best.d - 1e-9
        || (Math.abs(j.d - best.d) < 1e-9 && AHEAD_RANK.indexOf(j.kind) < AHEAD_RANK.indexOf(best.kind))) best = j;
  });
  return { job: best, slow: slow };
}
/* WHETHER ANYTHING IS LEFT TO BUILD — for the checks, which wait for it as they wait for `afterSlide_`. */
function aheadBusy_() {
  if (!(AHEAD.open || AHEAD.pre) || window.__aheadHold) return false;
  if (AHEAD.booked || AHEAD.running) return true;
  try { return aheadJobs_(false).length > 0; } catch (e) { return false; }
}

/* ---------- PAINT: A COLUMN MARKED `STALE`, DRAWN AGAIN BEFORE ANYBODY ARRIVES § */
AHEAD_KINDS.push(() => TABS.filter(t => t.id !== AT && STALE[t.id] && $('s-' + t.id)).map(t => ({
  key: 'paint:' + t.id, kind: 'paint', d: aheadDist_(t.id, null),
  /* NEVER TIMED ON A PAYLOAD YET — slow until it has been (see `AHEAD_SLOW_KEY`'s note). */
  cold: PRE_PAYLOAD.has(t.id),
  run: () => aheadPaint_(t.id),
})));
function aheadPaint_(id) {
  const host = $('s-' + id);
  if (!host || id === AT) return;
  paint(id, false, { ahead: true });
  if (STALE[id]) return false;
  PRE_PAYLOAD.delete(id);
  if (PAGER[id] && host.querySelector(':scope > .page')) {
    pageHome_(id);
    PAGE[id] = Math.max(0, Math.min(pageCount(id) - 1, PAGE[id] || 0));
  }
  /* A FINDER ON THE GLASS (beside the one in front, on a wide window) is filled as far as the glass shows, in this slice and before it is placed — its draw no § */
  const F = typeof finderOf_ === 'function' ? finderOf_(id) : null;
  if (F && typeof stuffOnGlass_ === 'function' && stuffOnGlass_(id)) {
    try { inFinder_(F, () => { if ($(id + '-controls')) stuffBandFill_(); }); } catch (e) {}
  }
  placeOne_(id);
  if (typeof paneWatch_ === 'function') paneWatch_(host);
  drawnScreen_(id);
}
/* THE HALF OF `startScreen_` THAT RUNS NOTHING — a conversation opened at its newest message. */
function drawnScreen_(id) {
  if (id === 'dm' && typeof dmFoot_ === 'function') { try { dmFoot_(); } catch (e) {} }
}

function paintPager(id, instant) {
  if (!PAGER[id]) return;
  const host = $('s-' + id);
  if (!host || !host.querySelector(':scope > .page')) return;
  /* THE HOME POSITION, on first sight of this column only. § */
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
  /* A FINDER IS TURNED IN ITS OWN BINDING — Find, or the second finder (find.js, `inFinder_`) — so its window, its fills and its kept place below are its own and § */
  const F = typeof finderOf_ === 'function' ? finderOf_(id) : null;
  if (F && F !== FINDER) return inFinder_(F, () => goPage(id, to, instant));
  const n = Math.max(0, Math.min(pageCount(id) - 1, to));
  const was = PAGE[id] || 0;
  if (n === was && !instant) return;
  PAGE[id] = n;
  /* AND WHICH WAY THIS COLUMN WAS LAST TURNED — the builder fills and fetches on that side first. */
  if (n !== was) AHEAD.dir.y[id] = n > was ? 1 : -1;
  aheadKick_(AHEAD_QUIET);
  /* MOVE FIRST, FILL AFTER — as long as the page being turned to is already there. § */
  /* Page 0 is the question, which is drawn with the screen and never filled lazily — so it has no
     `filled` mark and must not be mistaken for an empty one. */
  /* ---------- THE WINDOW FIRST, BECAUSE EVERYTHING BELOW MEASURES ELEMENTS § */
  if (F && typeof stuffWindow_ === 'function') { try { stuffWindow_(); } catch (e) {} }
  const bare = !!F && n > 0 && (() => {
    const host = $('s-' + id);
    const el = host && host.querySelectorAll(':scope > .page')[domIndex_(id, n)];
    return !el || el.dataset.filled !== '1';
  })();
  /* ---------- AND THE FAR EDGE OF THE GLASS, ONE CARD PER TURN § */
  /* ---------- AND NOW AS FAR AS THE BAND WILL SHOW, IN ITS OWN UNITS (docs/history/341) § */
  const edge = !!F && n !== was && Math.abs(n - was) <= glassRows_() && typeof stuffEdgeFill_ === 'function';
  /* ---------- AND A CARD DRAWN ABOVE THE ONE IN FRONT DOES NOT MOVE IT § */
  const above = !!F && (bare || (edge && n < was));
  const ref = above && $('s-' + id) ? $('s-' + id).querySelectorAll(':scope > .page')[domIndex_(id, n)] : null;
  const top0 = ref ? (typeof stuffTop_ === 'function' ? stuffTop_(ref) : ref.offsetTop) : 0;
  if (bare) fillStuffPages();
  if (edge) { try { stuffEdgeFill_(n, n > was ? 1 : -1); } catch (e) {} }
  if (ref && typeof stuffKeepPlace_ === 'function') stuffKeepPlace_($('s-' + id), top0 - (typeof stuffTop_ === 'function' ? stuffTop_(ref) : ref.offsetTop));
  /* A WIDGET STILL WAITING ITS TURN to start is started now if this is its page — see `widgetsNear_` in arcade.js. § */
  if (typeof widgetsNear_ === 'function') widgetsNear_(id);
  /* AND THE REELS KEPT SIX AHEAD, one slide appended now if fewer are left — markup only (`reelAhead_`). */
  if (id === 'reel' && typeof reelAhead_ === 'function') { try { reelAhead_(n); } catch (e) {} }
  if (id === AT) placeCells('y', instant);
  /* AFTER THE SLIDE, THE LANDING'S OWN WORK — the page in front and one either side if a jump left them empty, its textbook animation and its running widget. § */
  if (F && !bare) afterSlide_(() => inFinder_(F, fillStuffPages), 'fill:' + id);
  /* ---------- THE REEL BEING WATCHED IS THE PAGE BEING SHOWN § */
  if (id === 'reel' && typeof reelsWatch_ === 'function') afterSlide_(reelsWatch_);
  /* AND THE TEXTBOOK'S ANIMATION ON THE PAGE TURNED TO, by name for the reason `reelsWatch_` is. */
  if (F && typeof tbAnimWatch_ === 'function') afterSlide_(tbAnimWatch_);
  /* AND THE CAMERA, WHICH IS A PAGE OF THE FEED — started when its page arrives and let go when the page turns away, booked under its own name for the reason § */
  if (id === 'feed' && typeof feedCamWatch_ === 'function') afterSlide_(feedCamWatch_);
  /* AND A TURN OFF THE CAMERA'S PAGE PUTS ITS VIEWFINDER AT REST NOW, not after the slide: the slide is what
     carries the page across the glass, loader and all (`camRest_`, posts.js; docs/history/341). */
  if (id === 'feed' && n !== 0 && typeof camRest_ === 'function') camRest_();
  paintPager(id);
}

/* Wrap a screen's cards into a vertical strip of pages. § */
/* A SCREEN'S PAGES, all of them, in one scroller. § */
/* THE CELL AND THE GLASS ARE TWO THINGS. § */
/* ---------- THE MARKS, ADOPTED FROM THE PAYLOAD JUST LANDED § */
function adoptMarks_() {
  try { adoptFavourites_(); } catch (e) {}
  try { adoptSpotlight_(); } catch (e) {}
  /* AND THE LATEST ANSWER SENT FOR EACH QUESTION, from the account — onto the cards and into the boxes — and whatever this device has waiting to send goes up. § */
  try { if (typeof subAdopt_ === 'function') subAdopt_(); } catch (e) {}
  /* AND A MARK WITH AI TILE DRAWN WAITING FOR THIS PAYLOAD (`aiDecided_`, keypad.js) — let go where it stands,
     because the column holding it may be held back from the repaint that would draw it again. */
  try { if (typeof aiDecided_ === 'function') aiDecided_(); } catch (e) {}
  /* AND WHAT THIS PERSON HAS WRITTEN ON THEIR OTHER DEVICES — once a visit, and whatever this device has
     waiting for the account goes up with it. See `answersPull_` in js/answers.js. */
  try { if (typeof answersPull_ === 'function') answersPull_(); } catch (e) {}
}

const pages = (id, cards) =>
  cards.map(c => `<section class="page"><div class="pane">${c}</div></section>`).join('');

/* ---------- ALL OF THEM ON ONE, WHICH IS WHAT A LIST IS § */
const stack = (id, cards) =>
  `<section class="page"><div class="pane">${cards.join('')}</div></section>`;

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


/* How many of each thing a phone holds without cutting the last one in half. Different per screen
   because a tile is not a card and a card is not a post — one number for all of them would be
   wrong four times out of five. */
/* `me` is not here any more — the You screen is one scrolling page. See `mePages`. */
/* Book fits more now that a session is a stub rather than a whole receipt — five full receipts was
   a page you scrolled, and the point of a stub is that a page of them is a page you scan. */
/* `book` is not here any more — a session is a pane of its own. See `bookPages`. */
const PER_PAGE = { library: 12 };

/* The dot's handler is registered further down, WITH the other actions. § */

/* ---------- THE SHEET § */
let sheetOnClose = null;

/* THE CARD THAT WAS PRESSED, caught on its way past. § */
let SHEET_FROM = null;

/* The four numbers that say where the panel starts: § */
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

/* ---------- WHAT THE SHEET IS ONE OF § */
let sheetStep = null;

function openSheet(title, html, onClose, step) {
  /* A SHEET OPENED OVER A SHEET. § */
  if (sheetOnClose) { const f = sheetOnClose; sheetOnClose = null; try { f(); } catch (err) {} }

  /* SET AFTER the old sheet's `onClose` above, which may itself open a sheet. */
  sheetStep = typeof step === 'function' ? step : null;

  /* ---------- WHERE IT GROWS FROM § */
  /* ---------- ALREADY OPEN? THEN IT DOES NOT MOVE § */
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

/* ---------- CLOSING IT § */
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

/* ---------- ONE WAY TO POST § */
/* ONE REQUEST, BUILT IN ONE PLACE. § */
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
  return fetch(API, Object.assign({ method: 'POST', cache: 'no-store', body: JSON.stringify(b) },
                                  opts && opts.keepalive ? { keepalive: true } : {}))
    /* ---------- A REPLY THAT IS NOT JSON IS STILL A REPLY § */
    .then(r => r.text().then(txt => {
      try { return JSON.parse(txt); } catch (e) {}
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
        if (typeof signedOut_ === 'function') { try { signedOut_({ ended: true }); } catch (e) {} }
        else { USER = null; try { localStorage.removeItem('familyUser'); } catch (e) {} try { repaint(); } catch (e) {} }
        /* THROUGH `ansRecPut_`, held for the visit when the store refuses or throws: without it a
           browser keeping no site data never knew whose the next answer was (review of the merge). */
        try {
          const rec = gone ? JSON.stringify({ who: gone, at: Date.now() }) : '';
          if (rec && typeof ansRecPut_ === 'function') ansRecPut_('familyGone', rec);
          else if (rec) localStorage.setItem('familyGone', rec);
        } catch (e) {}
        try { if (typeof ansSavedPaint_ === 'function') ansSavedPaint_(); } catch (e) {}
        toast('Signed out — please sign in again');
      }
      return d || {};
    });
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

/* ---------- SPEAKING, ONE VOICE FOR THE WHOLE APP (394) ---------------------------------------- */
/* Imposter's Listen and a question's Read aloud both speak through these three, so the British voice
   and the Chrome no-voices-yet fallback (`lang` as well as `voice`) are written once. */
function canSay_() {
  try { return !!(window.speechSynthesis && window.SpeechSynthesisUtterance); } catch (e) { return false; }
}
function hush_() {
  try { if (canSay_()) window.speechSynthesis.cancel(); } catch (e) {}
}
/* ONE UTTERANCE, QUEUED. Called inside the tap's own handler, which is what iPhone Safari needs to speak at all; `o` = { rate, volume, onend }. */
function say_(text, o) {
  o = o || {};
  try {
    const ss = window.speechSynthesis;
    const u = new window.SpeechSynthesisUtterance(String(text));
    u.lang = 'en-GB';
    const gb = (typeof ss.getVoices === 'function' ? ss.getVoices() || [] : [])
      .find(v => /^en[-_]GB/i.test(String(v.lang || '')));
    if (gb) u.voice = gb;
    u.rate = o.rate || 0.9;
    u.volume = o.volume == null ? 1 : o.volume;
    if (o.onend) { u.onend = o.onend; u.onerror = o.onend; }
    if (o.onstart) u.onstart = o.onstart;
    ss.speak(u);
    return u;
  } catch (e) { return null; }
}

/* ---------- ONE CLICK HANDLER § */
const ACTIONS = {};
/** Register what a `data-do` means. */
/* EVERY ACTION MOVES `ACT_EPOCH` (see the note over `STALE`): a press is what can edit a column in place,
   and a column edited in place must not be kept by a landing on the grounds that its markup is the same. */
function on(name, fn) {
  ACTIONS[name] = function () { ACT_EPOCH++; return fn.apply(this, arguments); };
}

/* Asking again. A failure that offers no way to retry costs a whole page reload, and on a phone a
   reload is the thing most likely to lose whatever was half-typed on another screen. */

/* Asking again. A failure that offers no way to retry costs a whole page reload, and on a phone a
   reload is the thing most likely to lose whatever was half-typed on another screen. */
on('retry', () => { LOADED = false; LOAD_FAILED = ''; LIBRARY_FAILED = '';
  /* THE LIBRARY IS MEMOISED and `Try again` has to actually try again: `libraryRows_`
     returns `LIBRARY_ROWS` untouched once it is set, so leaving the empty array in place
     would make the button repaint the same failure for ever. */
  LIBRARY_ROWS = null;
  banner(''); splashOn_(); repaint(); load(); });

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

function pressMark_(t) {
  pressClear_();
  /* THE NEAREST THING THAT ACTS, not the exact target — pressing a word inside a card lights the
     card, which is the same rule `SHEET_FROM` follows for where a sheet grows from. */
  const el = t && t.closest && t.closest('[data-do], .tab');
  /* NOT A DISABLED CONTROL. § */
  if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
  PRESSED = el;
  el.classList.add('is-pressed');
  PRESSED_OFF = setTimeout(pressClear_, 1200);
}

function pressClear_() {
  clearTimeout(PRESSED_OFF);
  if (PRESSED) { try { PRESSED.classList.remove('is-pressed'); } catch (e) {} }
  PRESSED = null;
}

/* TWO FRAMES, NOT ONE. § */
function pressDone_() {
  requestAnimationFrame(() => requestAnimationFrame(pressClear_));
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
addEventListener('click', e => {
  if (!WIDE || PRESS_MOVED || PRESS_SLIDING) return;
  /* ---------- A CLICK WITH NO POINTER UNDER IT IS NOT A PRESS BESIDE THE CARD § */
  if (!e.detail) return;
  const t = e.target;
  /* ONLY A PRESS THAT NOTHING IN FRONT TOOK — on the front card it is that card's press. */
  if (t && t.closest && t.closest('#screen .page.on')) return;
  if (!(t && t.closest && t.closest('#screen'))) return;
  const hit = wideHit_(e.clientX, e.clientY);
  if (!hit) return;
  try {
    /* THE PAGE FIRST, while its column is still beside: `goPage` on a column not in front only
       records where it is and places it, and `go` then slides the whole grid once. */
    if (PAGER[hit.id] && hit.p !== (PAGE[hit.id] || 0)) goPage(hit.id, hit.p);
    if (hit.id !== AT) go(hit.id, true);
  } catch (err) { /* a press that moved nothing is the behaviour before this existed */ }
}, true);

/* AND THE POINTER SAYS SO BEFORE THE PRESS. § */
let WIDE_OVER = null, WIDE_OVER_F = 0;
addEventListener('pointermove', e => {
  if (!WIDE || e.pointerType !== 'mouse' || WIDE_OVER_F) return;
  const x = e.clientX, y = e.clientY;
  WIDE_OVER_F = requestAnimationFrame(() => {
    WIDE_OVER_F = 0;
    const onFront = document.elementFromPoint(x, y);
    const hit = onFront && onFront.closest && onFront.closest('#screen .page.on') ? null : wideHit_(x, y);
    const el = hit ? hit.el : null;
    if (el === WIDE_OVER) return;
    if (WIDE_OVER) WIDE_OVER.classList.remove('wide-over');
    WIDE_OVER = el;
    if (el) el.classList.add('wide-over');
    const scr = $('screen');
    if (scr) scr.style.cursor = el ? 'pointer' : '';
  });
}, { passive: true });
/* ---------- LEAVING A WIDE WINDOW TAKES THE HAND AWAY § */
function wideOverClear_() {
  try {
    if (WIDE_OVER) WIDE_OVER.classList.remove('wide-over');
    WIDE_OVER = null;
    const scr = $('screen');
    if (scr) scr.style.cursor = '';
  } catch (e) { /* before this file has finished loading there is nothing to clear */ }
}

/* ---------- A SWIPE THAT BEGAN ON A FIELD OPENS NOTHING AND TICKS NOTHING § */
const FIELD_ACTS_ = 'select, label, summary, input[type="checkbox"], input[type="radio"]';
addEventListener('mousedown', e => {
  if (!PRESS_MOVED && !PRESS_SLIDING) return;
  if (e.target && e.target.closest && e.target.closest(FIELD_ACTS_)) e.preventDefault();
}, true);

document.addEventListener('click', e => {
  /* FIRST, because a swipe that ends on a tab must not change tab either. */
  if (PRESS_MOVED) {
    PRESS_MOVED = false;
    PRESS_SLIDING = false;
    pressClear_();
    /* AND ON A FIELD, NOT EVEN THE BROWSER'S OWN DEFAULT — see `FIELD_ACTS_` above. */
    if (e.target && e.target.closest && e.target.closest(FIELD_ACTS_)) e.preventDefault();
    if (CLICK_LOG) console.log('[click] swallowed — the finger moved, so this was a swipe');
    return;
  }
  /* A TAP ON A CARD STILL GLIDING STOPS NOTHING AND PRESSES NOTHING — see `SLIDE_UNTIL`. */
  if (PRESS_SLIDING) {
    PRESS_SLIDING = false;
    pressClear_();
    if (e.target && e.target.closest && e.target.closest(FIELD_ACTS_)) e.preventDefault();
    if (CLICK_LOG) console.log('[click] swallowed — it began on a card still sliding');
    return;
  }
  pressDone_();
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
  /* A PRESS ON THE CARD IN FRONT HOLDS IT WHERE IT IS, before the handler below changes it — see
     `HOLD_AT`. After the two swallows above, because a swipe is not somebody using the card. */
  holdHere_(e.target);
  const tab = e.target.closest('.tab');
  if (tab) { go(tab.dataset.tab); return; }

  if (e.target.closest('#sheet-close') || e.target.id === 'sheet-back') { closeSheet(); return; }

  const doer = e.target.closest('[data-do]');
  /* THE CARD, remembered for the length of this press. § */
  /* `.pass` WAS IN THIS LIST and the class no longer exists — a person is `.card.is-widget` now,
     which the first entry already catches. See `findCard`. */
  SHEET_FROM = e.target.closest('.card, .rc, .rc-stub, .paper, .slip, .post, .thing') || doer;
  /* A SELECT AND A CHECKBOX SPEAK THROUGH `change`, NOT `click`. § */
  if (doer && (doer.tagName === 'SELECT' || doer.type === 'checkbox')) return;
  if (doer && ACTIONS[doer.dataset.do]) {
    /* CAUGHT HERE, WHERE THE MESSAGE STILL EXISTS. § */
    try {
      ACTIONS[doer.dataset.do](doer, e);
    } catch (err) {
      console.error('[' + doer.dataset.do + ']', err);
      toast(doer.dataset.do + ' — ' + String((err && err.message) || err));
    }
  }
});

/* Swiping between tabs is further down, with the gesture handling it belongs to — I wrote a second, cruder version here before noticing the first. § */

/* Escape closes the sheet, for anybody on a keyboard. Costs one line and is the first thing
   somebody tries. */
/* ---------- THE ARROW KEYS § */
const ARROWS = { ArrowLeft: ['x', -1], ArrowRight: ['x', 1],
                 ArrowUp: ['y', -1], ArrowDown: ['y', 1] };

addEventListener('keydown', e => {
  /* ESCAPE SHUT `#drop` FIRST while there was one. § */
  if (e.key === 'Escape' && !$('sheet').classList.contains('hidden')) { closeSheet(); return; }

  const arrow = ARROWS[e.key];
  if (!arrow) return;
  if (typeof SWIPE !== 'undefined' && SWIPE.lock) return;   // the console's padlock
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

/* THE EDGES OF THE SCREEN were tappable from here — a second `click` listener that turned to the next card when you pressed the sliver either side. § */



/* ---------- LOADING ------------------------------------------------------------------------------ */
/* WHAT THE APP IS MADE OF WHEN THE BACKEND SAYS NOTHING. § */
async function filesOnly_() {
  try {
    if (DATA && DATA.questions && DATA.questions.length) return;
  } catch (e) { return; }
  const d = {};
  try {
    libraryInto_(d, await libraryRows_());
    const extra = await libraryExtraRows_();
    libraryExtras_(d, extra);
    settingsInto_(d, extra);
    try { splashSync_(d, extra); } catch (e) {}
  } catch (e) {}
  /* THE SAME THREE REPAIRS THE PAYLOAD PATH MAKES, because every reader downstream expects them
     and an absent `checklists` is a throw rather than an empty screen. */
  d.questions = d.questions || [];
  d.dropdowns = d.dropdowns || {};
  d.dropdowns.checklists = d.dropdowns.checklists || {};
  /* A PLAIN OBJECT, NOT THE PROXY. § */
  DATA = d;
  /* THE COLUMNS AND THE ICON ARE IN `data/settings/`, so they are knowable here and are the two
     things that decide what the app looks like before anything is drawn. */
  try { applyColumns_(); } catch (e) {}
  try { applyBrandIcon_(); } catch (e) {}
}

/* The boot reply as JSON, or an error whose message says what arrived instead. See the note in
   `load()` where it is called; `not valid JSON` is the phrase `load()`'s banner listens for. */
async function bootJson_(res) {
  if (!res || typeof res.text !== 'function') return res.json();
  const body = await res.text();
  try { return JSON.parse(body); }
  catch (e) {
    /* The page's text rather than its title: an Apps Script error page is titled just "Error". */
    const said = String(body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 160);
    const no = new Error('The reply was not valid JSON (HTTP ' + res.status + ')'
      + (said ? ': ' + said : ': it was empty'));
    /* A WEB PAGE, as against an empty or cut-off reply. § */
    no.page = /^\s*</.test(body);
    throw no;
  }
}

/* A PAYLOAD THAT DID NOT ARRIVE IS ASKED FOR AGAIN BY THE APP, NOT REPORTED TO THE VISITOR. § */
const RECONNECT = {
  timer: 0,        /* the next ask, booked */
  at: 0,           /* when it comes round */
  tries: 0,        /* failures in a row; 0 is "nothing is failing" */
  since: 0,        /* when the first of them happened */
  flying: 0,       /* loads in the air */
  asked: 0,        /* when the last one went */
  due: false,      /* an ask is owed: it came round while nobody was looking or a load was in the air,
                      or a reply was dropped and the person here has no payload of their own */
  seq: 0,          /* every load's number, in the order they went */
  shown: 0,        /* the number of the load whose payload is drawn */
  shownFor: null,  /* and whom it was asked for — `loadWho_` */
  banner: false,   /* the diagnostic is up, put there by this */
  hold: null,      /* the box being typed in, only while a landing payload repaints — `landRepaint_` */
  kept: null,      /* the box a landing payload was not drawn under, until it is left */
};
const RECONNECT_SOON = 3000;
/* THE LADDER, and its last step repeats for as long as the page is open. */
const RECONNECT_STEPS = [10000, 30000, 60000, 120000];
/* "ABOUT TWO MINUTES" — when the line says the plain sentence and an admin is shown why. */
const RECONNECT_TELL = 120000;
/* COMING BACK TO THE PAGE within this long of the last ask is flicking between apps, not an ask. */
const RECONNECT_FLICK = 5000;

function reconnectAdmin_() {
  try {
    return (typeof isAdmin === 'function' && isAdmin())
      || (typeof hasRole === 'function' && hasRole('admin'));
  } catch (e) { return false; }
}
function reconnectSay_(text) {
  const el = document.getElementById('reconnect');
  if (el && el.textContent !== text) el.textContent = text;
}
/* WHETHER THE APP IS ASKING AGAIN BY ITSELF — what `nothingHere` asks before it prints a failure and a
   Try again. A function rather than the object, because nothingHere is above this in the file. */
function reconnecting_() {
  try { return RECONNECT.tries > 0; } catch (e) { return false; }
}
function reconnectBook_(wait) {
  const R = RECONNECT;
  clearTimeout(R.timer);
  R.at = Date.now() + wait;
  R.timer = setTimeout(() => { R.timer = 0; reconnectAsk_('timer'); }, wait);
}
/* A real answer, or a load somebody asked for: nothing booked, nothing said. */
function reconnectStop_() {
  const R = RECONNECT;
  clearTimeout(R.timer);
  R.timer = 0; R.tries = 0; R.since = 0; R.due = false;
  reconnectSay_('');
}
/* AND THE DIAGNOSTIC THIS PUT UP GOES WITH IT — but only while it still says what this put there. A
   banner written since (a missing column, a newer build) is somebody else's, and true. */
function reconnectDone_() {
  const had = RECONNECT.banner;
  RECONNECT.banner = false;
  reconnectStop_();
  const el = document.getElementById('banner');
  if (had && el && /^(Could not reach the backend|The server said)/.test(el.textContent || '')) banner('');
}
/* A LOAD FAILED. Books the next ask, says the quiet line, and answers whether an admin should be shown the diagnostic now. § */
function reconnectFail_(err, how) {
  const R = RECONNECT;
  if (how === 'ours') {
    reconnectStop_();
    R.banner = reconnectAdmin_();
    return R.banner;
  }
  const now = Date.now();
  if (!R.tries) R.since = now;
  R.tries++;
  const timeout = (err && err.name === 'AbortError') || String((err && err.message) || err) === 'timeout';
  const slowest = RECONNECT_STEPS[RECONNECT_STEPS.length - 1];
  let wait = how === 'refused' ? slowest
    : R.tries === 1 ? (timeout ? 0 : RECONNECT_SOON)
    : RECONNECT_STEPS[Math.min(R.tries - 2, RECONNECT_STEPS.length - 1)];
  /* THE ASK THAT WOULD LAND PAST THE TWO-MINUTE MARK IS BROUGHT FORWARD TO IT, so the sentence that
     says it has been two minutes is said at two minutes, and by a failure rather than by a clock. */
  const left = R.since + RECONNECT_TELL - now;
  if (left > 0 && wait > left) wait = left;
  /* WHATEVER WAS OWED IS ANSWERED: this load was the ask, and the next one is booked here. */
  R.due = false;
  reconnectBook_(wait);
  const late = now - R.since >= RECONNECT_TELL;
  const tell = reconnectAdmin_()
    && (how === 'refused' || !!(err && err.page) || location.protocol === 'file:' || late);
  if (tell) R.banner = true;
  /* THE BANNER SAYS IT FOR AN ADMIN, so the line says nothing under it: one statement at a time. */
  reconnectSay_(tell ? '' : late ? 'Can’t reach the server — still trying.' : 'Reconnecting…');
  return tell;
}
function reconnectAsk_(why) {
  const R = RECONNECT;
  if (!R.tries && !R.due) return;               /* nothing is failing, and nothing is owed */
  /* A LOAD IN THE AIR: owed, and asked by `load()`'s `finally` if that one does not settle it. */
  if (R.flying) { R.due = true; return; }
  /* NOBODY IS LOOKING — a tab in the background, a phone in a pocket. Coming back asks at once, so a
     backend that is down all afternoon is not asked every two minutes by a tab nobody has open. */
  if (document.hidden) { R.due = true; return; }
  /* FLICKING BETWEEN APPS IS NOT FIVE ASKS — but the ask is only put off to the end of the five seconds, never left to a rung two minutes away. § */
  if (why === 'back' && !R.due && Date.now() - R.asked < RECONNECT_FLICK) {
    const end = R.asked + RECONNECT_FLICK;
    if (!R.timer || R.at > end) reconnectBook_(Math.max(0, end - Date.now()));
    return;
  }
  clearTimeout(R.timer);
  R.timer = 0; R.due = false;
  load(true);
}
addEventListener('online', () => reconnectAsk_('online'));
document.addEventListener('visibilitychange', () => { if (!document.hidden) reconnectAsk_('back'); });

/* ---------- WHOM A LOAD WAS ASKED FOR § */
function loadWho_() {
  const q = [];
  if (USER && USER.personId) q.push('person=' + encodeURIComponent(USER.personId));
  if (USER && USER.name) q.push('name=' + encodeURIComponent(USER.name));
  if (USER && USER.token) q.push('token=' + encodeURIComponent(USER.token));
  return q.length ? '?' + q.join('&') : '';
}
/* ---------- IS THIS REPLY STILL THE ANSWER § */
function loadStale_(n, who) {
  const R = RECONNECT;
  const now = loadWho_();
  if (who === now && n > R.shown) return false;
  if (R.shownFor !== now) R.due = true;
  return true;
}

/* ---------- A PAYLOAD THAT LANDS DOES NOT REBUILD THE BOX SOMEBODY IS TYPING IN § */
/* ---------- AND NOT THE SELECT WHOSE LIST IS OPEN EITHER § */
const TYPING_ = 'textarea, input[type="text"], input[type="search"], input[type="email"], '
  + 'input[type="tel"], input[type="number"], input:not([type]), [contenteditable="true"], select';
function typingBox_() {
  const a = document.activeElement;
  if (!a || !a.matches || !a.matches(TYPING_)) return null;
  const s = a.closest ? a.closest('.screen') : null;
  const id = s ? String(s.id).replace(/^s-/, '') : '';
  return (typeof finderOf_ === 'function' ? finderOf_(id) : id === 'stuff') ? null : a;
}
/* `draw` IS ANY OTHER REPAINT THAT A LANDING REPLY MAKES — `profileRefresh_` (me.js) drawing your own settings once per app open is the other one, and it rebuilt § */
function landRepaint_(draw) {
  const R = RECONNECT;
  R.hold = typingBox_();
  /* A LANDING MARKS `'maybe'`, not 1 — see the note over `STALE`: a column it marks is drawn again, and
     written only if what it would draw differs from what it holds. */
  REPAINT_MARK = 'maybe';
  try { (typeof draw === 'function' ? draw : repaint)(); } finally { R.hold = null; REPAINT_MARK = 1; }
  DRAW_EPOCH++;
  if (typeof aheadKick_ === 'function') aheadKick_();
}
/* `paint` asks this beside `settingsKeep_` and `findKeep_`, and `startScreen_` before it restarts
   anything. In a `try`, because both are hoisted and this const is not. */
function reconnectKeep_(id) {
  try {
    const box = RECONNECT.hold;
    if (!box || document.activeElement !== box) return false;
    const host = document.getElementById('s-' + id);
    if (!host || !host.contains(box)) return false;
    RECONNECT.kept = box;
    return true;
  } catch (e) { return false; }
}
/* AND DRAWN WHEN IT IS LEFT — a moment after, so a tap from one box to the next in the same column
   (focusout, then focusin) finds the next box focused and waits on that one instead. */
document.addEventListener('focusout', () => {
  if (!RECONNECT.kept) return;
  setTimeout(() => {
    const box = RECONNECT.kept;
    if (!box) return;
    const a = document.activeElement;
    if (a === box && box.isConnected) return;
    const host = box.isConnected && box.closest ? box.closest('[id^="s-"]') : null;
    if (host && a && a !== box && host.contains(a) && a.matches && a.matches(TYPING_)) { RECONNECT.kept = a; return; }
    RECONNECT.kept = null;
    /* REDRAWN SINCE — a press, or arriving — and there is nothing left to do. */
    try { if (host && host.id === 's-' + AT && STALE[AT]) repaint(); } catch (e) {}
  }, 400);
});

/* THE LOAD, AS EVERY CALLER ASKS FOR IT. `again` is the retry above and nothing else passes it: any
   other caller is somebody signing in, saving, or pressing Try again, and that starts the count over. */
async function load(again) {
  const R = RECONNECT;
  if (!again) reconnectStop_();
  R.asked = Date.now();
  R.flying++;
  try { await loadOnce_(again, ++R.seq); }
  finally {
    R.flying--;
    /* THE ASK THAT WAITED FOR THIS ONE — see `due`. Not while another is still in the air: the last
       to land makes it, so two that land together are still one ask. */
    if (!R.flying && R.due) reconnectAsk_('owed');
  }
}

/* WHETHER A GOOD PAYLOAD HAS EVER BEEN PAINTED — see the end of `load()`. */
let FIRST_PAINT_DONE = false;
async function loadOnce_(again, n) {
  /* THE REPLY ARRIVED AND WAS DATA — so a throw after this is our own code, not the connection. */
  let reached = false;
  /* AND IT BECAME `DATA` — the one outcome a retry repaints for. */
  let got = false;
  /* WHOM IT IS ASKED FOR, kept to check the reply against — see `loadStale_`, and the note below on
     why each of the three keys is sent. */
  const who = loadWho_();
  try {
    /* The person's id goes with the request so the server can say which posts YOU liked — it
       cannot know otherwise, and sending every like to every phone to answer it would be absurd. */
    /* AND THE NAME, which is a different question from the id and was never being asked. § */
    /* ---------- AND THE TOKEN, WHICH IS THE ONLY ONE OF THE THREE THAT PROVES ANYTHING § */
    /* ALL THREE ARE BUILT BY `loadWho_` — `who`, at the top of this function. */
    /* NO CACHE, AND A DIFFERENT URL EVERY TIME. § */
    const bust = (who ? '&' : '?') + '_=' + Date.now();
    /* THE SLOW-LOAD LINE STARTS ITS CLOCK HERE, beside the request it is about, rather than at boot:
       this is the moment the app begins waiting, and it is the only moment worth timing from. */
    splashWaitWatch_();
    /* ---------- AND AT THE SAME MOMENT, COME UP ON THE FILES § */
    clearTimeout(splashEarlyTimer);
    splashEarlyTimer = setTimeout(() => {
      if (LOADED) return;
      filesOnly_().then(() => {
        if (LOADED) return;
        try { repaint(); } catch (e) {}
        splashOff_();
      }).catch(() => {});
    }, SPLASH_SAY_AFTER);
    /* ---------- A DEADLINE, BECAUSE A REQUEST THAT NEVER ANSWERS IS THE WORST FAILURE § */
    let bell;
    const deadline = new Promise((unused, no) => {
      bell = setTimeout(() => {
        const e = new Error('timeout');
        e.name = 'AbortError';
        no(e);
      }, 60000);
    });
    /* ---------- THE ONE THE HEAD ALREADY STARTED § */
    const early = window.BOOT_GET || null;
    window.BOOT_GET = null;
    let res;
    try {
      /* FROM A FILE, ASK A DIFFERENT WAY. `fetch` is refused outright by a page with no origin;
         a script tag is not. Served properly — Live Server, GitHub Pages — `fetch` is better in
         every way and this stays out of the way. */
      res = await Promise.race([
        early
          ? early.then(r => (r && r.ok ? r : (location.protocol === 'file:'
              ? jsonp(API + who + bust)
              : fetch(API + who + bust, { cache: 'no-store' }))))
          : location.protocol === 'file:'
          ? jsonp(API + who + bust)
          : fetch(API + who + bust, { cache: 'no-store' }),
        deadline]);
    } finally {
      /* Cleared whichever way it went, or a load that answered at 59 seconds leaves a timer running
         to reject a promise nobody is holding. */
      clearTimeout(bell);
    }
    /* JSONP HANDS BACK THE VALUE ITSELF — a script tag delivers a value, not a reply, so there is nothing to unwrap. § */
    if (res && res.__jsonp) {
      const got = res.__jsonp;
      res = { ok: true, status: 200, statusText: 'OK', json: () => got };
    }
    /* ---------- READ AS TEXT, THEN PARSE, so a web page says what it is § */
    const d = await bootJson_(res);
    reached = true;
    /* THE ANSWER TO A QUESTION NOBODY IS ASKING ANY MORE — for somebody who has signed out or been signed in over since it went, or older than a payload already § */
    if (loadStale_(n, who)) return;
    if (d && !d.error) {
      /* WHAT WAS ASKED FOR AND NOT SENT. § */
      /* `splashOff` WAS WRITTEN HERE, and that is why retiring a splash never reached a device. § */
      /* AND THE STARS THE SHEET KNOWS ABOUT — see `adoptFavourites_`. Called here rather than in
         `find.js` because this is the moment a payload becomes DATA, and a favourite read before
         that is the last device's guess. */
      /* ---------- THE LIBRARY, MERGED IN BEFORE THIS BECOMES `DATA` § */
      /* ---------- NOT `d = ...`, AND THAT LINE HAD BEEN THROWING ON EVERY LOAD § */
      try {
        libraryInto_(d, await libraryRows_());
        /* THE OTHER THREE TABS, WHICH MAY STILL BE EMPTY. § */
        const extra = await libraryExtraRows_();
        libraryExtras_(d, extra);
        /* AND THE SETTINGS TABS, ON THE SAME RULE AND FROM THE SAME FETCH. § */
        settingsInto_(d, extra);
        /* AND WHAT THE NEXT LOAD'S SPLASH IS CHOSEN FROM — see `splashSync_`. Its own `try`, so a
           full or forbidden storage cannot cost this payload its library. */
        try { splashSync_(d, extra); } catch (e) {}
      } catch (e) {
        d.questions = d.questions || [];
        d.dropdowns = d.dropdowns || {};
        d.dropdowns.checklists = d.dropdowns.checklists || {};
      }

      /* AND ASKED AGAIN AT THE MOMENT IT BECOMES `DATA`. § */
      if (loadStale_(n, who)) return;
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
      got = true;
      RECONNECT.shown = n; RECONNECT.shownFor = who;

      /* THE STARS AND THE SPOTLIGHTS, from the payload that has just landed. § */
      adoptMarks_();
      /* BEFORE THE ICON AND BEFORE ANYTHING IS DRAWN. `applyColumns_` can change which screen you
         are on, and everything painted after it reads `AT`. */
      applyColumns_();
      applyBrandIcon_();

      /* ---------- THE WATCHDOG'S MESSAGE IS NOT TRUE ANY MORE § */
      if (LOAD_SLOW) banner('');
      /* AND THE ASKING-AGAIN STOPS — the quiet line goes, and an admin's diagnostic with it. Here, for
         the same reason as the line above: before the checks below write anything of their own. */
      reconnectDone_();

      /* WHAT THE BACKEND CAN DO, against what this site needs. § */
      /* A payload that could not write something — the schema check ran and a column is still
         missing. Said on load rather than waiting for somebody to try to save into it. */
      if (d.unwritten && d.unwritten.length) {
        banner('The sheet is missing columns: '
          + d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
          + '. Anything saved to them is discarded.');
      }
      /* ---------- AND THE QUESTION FILE, WHICH FAILS SEPARATELY AND USED TO FAIL SILENTLY § */
      if (LIBRARY_FAILED) {
        banner('The questions did not load — ' + LIBRARY_FAILED
          + '. Everything else is here; reload the page to try again.');
      }

      /* ---------- THE MESSAGE WIDGETS COULD NOT EXIST UNTIL YOU OPENED THE MESSAGE SCREEN § */
      if (USER && typeof loadMessages === 'function') {
        loadMessages().then(() => { try { landRepaint_(); } catch (e) {} });
      }
      /* AND YOUR OWN SETTINGS, AS THE SHEET HOLDS THEM — see `profileRefresh_` in me.js. § */
      if (USER && typeof profileRefresh_ === 'function') profileRefresh_();
      /* NO BANNER FOR A VERSION MISMATCH ANY MORE. § */
      /* `editResource` AND `deleteResource` WERE IN THIS LIST. § */
      const NEEDS = ['editPost', 'deletePost'];
      const missing = NEEDS.filter(f => (d.features || []).indexOf(f) === -1);
      if (missing.length) {
        /* THE VERSION IT ACTUALLY REACHED, said out loud. § */
        banner('The backend at this URL is ' + (d.version || 'an unknown version')
             + ', which cannot ' + missing.join(', ') + '. Either that deployment is old, or '
             + 'this site is pointed at the wrong one — check the id in API against the '
             + 'Deployment ID in Manage deployments.');
      }
    }
    else {
      LOAD_FAILED = String(d.error || 'the server refused the request');
      /* THE FILES STILL STAND -- see `filesOnly_`. A refusal from the backend is not a reason for
         a student to lose the paper they are working through. */
      await filesOnly_();
      /* ASKED AGAIN, EVERY TWO MINUTES — doGet's catch-all answers ANY exception this way, and the client cannot tell a throw that will pass from a refusal that will § */
      if (reconnectFail_(null, 'refused')) banner('The server said: ' + (d.error || 'something went wrong'));
    }
  } catch (err) {
    /* A FAILURE IS STALE THE SAME WAY — it would put the quiet line back over a payload that came. Not
       once the payload is `DATA`: a throw after that is this load's own, and this load is current. */
    if (!got && loadStale_(n, who)) return;
    LOAD_FAILED = String((err && err.message) || err || 'could not reach the backend');
    await filesOnly_();
    /* ASKED AGAIN, AND SAID QUIETLY — see `RECONNECT`. What follows is the diagnostic, and it is drawn
       only when `reconnectFail_` says an admin should see it now. */
    const tell = reconnectFail_(err, reached ? 'ours' : 'way');
    /* WHICH URL IT TRIED, as something you can press. § */
    const el = tell ? $('banner') : null;
    if (el) {
      el.classList.remove('hidden');
      /* NOT A DOOR. `banner(msg, true)` makes the whole bar a "tap to load the new build", and this writes its own markup over it — found by review: § */
      el.removeAttribute('data-do');
      /* THE ADVICE MATCHES THE FAULT. § */
      const msg = String((err && err.message) || err || '');
      const why = /Unexpected token|not valid JSON/.test(msg)
        /* A reply arrived and it was a web page. § */
        ? 'The backend answered with a web page instead of data. Open it in a tab and read what '
          + 'it says — “Authorization is required” means the scopes changed and nobody has '
          + 'consented yet: run authoriseDrive from the Apps Script editor, accept the prompt with '
          + 'every box ticked, and deploy a new version once its last line says READY.'
        /* ---------- A PAGE OPENED FROM A FILE CANNOT REACH ANYTHING § */
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
        /* ---------- THE DEADLINE, WHICH WAS FILED UNDER "SOMETHING ELSE" § */
        : /^timeout$/.test(msg)
        ? 'The backend took longer than a minute, again and again. One slow answer is a payload '
          + 'built cold (after clearPayloadCache) and the next ask gets the copy it kept; minutes of '
          + 'them is the script itself — open it in a tab and see how long it takes.'
        : 'Something else went wrong on the way.';

      el.innerHTML = 'Could not reach the backend.' + (reached ? '' : ' Still trying by itself.') + '<br>'
        + '<span class="faint">' + esc(why) + '</span><br>'
        + '<a class="link" href="' + esc(API) + '" target="_blank" rel="noopener">Open it in a '
        + 'tab</a> — the page itself will say which it is.<br>'
        + '<span class="faint">' + esc(msg)
        + ' · site ' + esc(SITE_VERSION) + ' · css ' + esc(cssVersion()) + '</span>';
    }
  }
  /* A RETRY THAT BROUGHT NO PAYLOAD CHANGED NOTHING — failed on the way, or refused: § */
  if (again && !got && LOADED && reconnecting_()) return;
  /* Set whether it SUCCEEDED or failed — a failed load is still a finished one, and leaving the
     loader up for ever would be the app pretending it is still trying. */
  LOADED = true;
  /* THE SPLASH COMES OFF HERE, and here is the only place it can: § */
  splashOff_();

  /* THE OFFER TO KEEP IT, a bar three seconds in, was here — removed at the owner's word; see me.js. */

  /* ---------- THE STALE SCREENS, CLEARED BEFORE THE REDRAW § */
  /* ---------- ONCE, NOT ON EVERY LOAD § */
  /* ---------- AND NOT EMPTIED AT ALL ANY MORE — THE GLASS IS DRAWN, THE REST IN THE QUIET AFTER IT § */
  const first = !FIRST_PAINT_DONE && !LOAD_FAILED;
  if (first) TABS.forEach(t => { if (t.id !== AT && screenHasMarkup_(t.id)) PRE_PAYLOAD.add(t.id); });
  if (!LOAD_FAILED) FIRST_PAINT_DONE = true;

  /* AND THE WHOLE SEQUENCE, in the one order it may happen in — see `repaint`. Around the box somebody
     is typing in, if they are: see `landRepaint_`. */
  landRepaint_();
  /* THE FIRST PAYLOAD IS A FACT, NOT A MAYBE — every column holding the boot's markup is drawn from it. */
  if (first) {
    PRE_PAYLOAD.forEach(id => { if (STALE[id]) STALE[id] = 1; });
    GLASS.cols.forEach(id => {
      if (id === AT || !STALE[id]) return;
      paint(id);
      if (!STALE[id]) { PRE_PAYLOAD.delete(id); if (PAGER[id]) paintPager(id, true); }
    });
    aheadOpen_();
  }
  openSharedPost();     // if the app was opened on a shared link, go to that post
  try { openSharedTutor(); } catch (e) {}   // or on a tutor's own link (400)
  /* AND BACK TO THE QUESTION A RELOAD TOOK YOU AWAY FROM — once a visit, on the first payload that
     arrived, when the column came back too. See `findPlaceBack_` in find.js and docs/history/317. */
  if (!LOAD_FAILED && typeof findPlaceBack_ === 'function') findPlaceBack_();
}

/* ---------- THE SPLASH, OFF AND ON § */
/* ---------- AND THE LINE UNDER IT, WHICH ONLY A SLOW LOAD EVER SEES § */
const SPLASH_SAY_AFTER = 15000;
let splashSayTimer = null;
/* The one that draws the app on its files rather than the one that says it is slow -- see `load`. */
let splashEarlyTimer = null;
function splashSay_(on) {
  const el = $('splash-wait');
  if (el) el.hidden = !on;
}
function splashWaitWatch_() {
  clearTimeout(splashSayTimer);
  splashSay_(false);
  /* ONLY WHILE THE SPLASH IS ACTUALLY UP. § */
  const sp = $('splash');
  if (!sp || sp.classList.contains('done')) return;
  splashSayTimer = setTimeout(() => {
    const now = $('splash');
    if (now && !now.classList.contains('done')) splashSay_(true);
  }, SPLASH_SAY_AFTER);
}
/* ---------- WHAT THE NEXT LOAD'S SPLASH IS CHOSEN FROM § */
const SPLASH_CACHE_F = 1;
const SPLASH_CACHE_MAX = 450000;
function splashSync_(d, extra) {
  const rows = extra && extra['settings/splashes'];
  if (rows && rows.length) {
    try { localStorage.setItem('splashOff', JSON.stringify((d && d.splashOff) || [])); } catch (e) {}
  }
  const tb = extra && extra.textbooks;
  if (!tb || !tb.length || !d || !d.textbooks || !d.textbooks.length) return;
  let was = null;
  try { was = JSON.parse(localStorage.getItem('splashAnims') || 'null'); } catch (e) { was = null; }
  const old = was && was.f === SPLASH_CACHE_F && was.h && typeof was.h === 'object' ? was.h : {};
  const idx = { f: SPLASH_CACHE_F, ids: [], h: {} };
  let size = 0, full = false;
  d.textbooks.forEach(b => (b.chapters || []).forEach(c => (c.animations || []).forEach(a => {
    if (full || !a || !a.id || idx.h[a.id]) return;
    const n = String(a.html).length + String(a.css).length;
    if (size + n > SPLASH_CACHE_MAX) return;
    if (old[a.id] !== a.h) {
      try { localStorage.setItem('splashAnim:' + a.id, JSON.stringify({ h: a.h, html: a.html, css: a.css })); }
      catch (e) { full = true; return; }
    }
    size += n;
    idx.ids.push(a.id);
    idx.h[a.id] = a.h;
  })));
  /* A REFUSED WRITE GIVES THE WHOLE COPY BACK — see above. Before the sweep, which would only be
     tidying what is about to go. */
  if (full) { splashGiveWay_(); return; }
  /* EVERY KEPT DRAWING THE BOOKS NO LONGER HAVE GOES, and so does one left half-written by a load that
     stopped. Only this file's own prefix: nothing else in the store is this function's to touch. */
  try {
    const gone = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('splashAnim:') === 0 && !idx.h[k.slice(11)]) gone.push(k);
    }
    gone.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
  /* AND AN INDEX THE STORE REFUSES TAKES ITS DRAWINGS WITH IT: without it nothing can name them, so
     they are room taken for a splash nobody will be shown. */
  try { localStorage.setItem('splashAnims', JSON.stringify(idx)); }
  catch (e) { splashGiveWay_(); }
}
/* THE WHOLE KEPT COPY, OUT: § */
function splashGiveWay_() {
  const gone = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k === 'splashAnims' || k.indexOf('splashAnim:') === 0)) gone.push(k);
    }
    gone.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
  return gone.length > 0;
}
function splashOff_() {
  clearTimeout(splashSayTimer); clearTimeout(splashEarlyTimer); splashSay_(false);
  const el = $('splash'); if (el) el.classList.add('done');
  /* AND OUT OF THE DOCUMENT ONCE IT HAS FADED. § */
  /* AND A DRAWING THE PICKER PUT ON IT FROM THE BOOKS' COPY GOES WITH IT, back to the still name and the loader — so a Try again (`splashOn_`) shows the app § */
  if (el) setTimeout(() => {
    if (!el.classList.contains('done')) return;
    el.style.display = 'none';
    const root = el.querySelector(':scope > [class|="an"]');
    if (root) root.remove();
    if (el.classList.contains('is-an')) { el.classList.remove('is-an'); el.classList.add('is-still'); }
  }, 500);
}
function splashOn_()  { const el = $('splash'); if (el) { el.style.display = ''; el.classList.remove('done'); } }

/* `tap` IS OPTIONAL AND EVERY OLD CALLER PASSES NOTHING, which is why it is a second argument rather than a second function: § */
function banner(msg, tap) {
  const el = $('banner');
  if (!msg) { el.classList.add('hidden'); el.removeAttribute('data-do'); return; }
  el.textContent = msg;
  if (tap) el.setAttribute('data-do', 'reload-build'); else el.removeAttribute('data-do');
  el.classList.remove('hidden');
}

/* THE VERSION THE SERVER HAS, ASKED FOR RATHER THAN ASSUMED § */
let BUILD_TAG = null;
/* THE SERVER'S `Last-Modified` FOR THE ENTRY POINT, as a time — against the one this page was built
   from. See `bootStale_`. */
let BUILD_AT = 0;
let BUILD_ASKED = 0;
/* WHEN THE PAGE WENT AWAY, so a resume can be told from an app-switch. See `checkBuild_`. */
let BUILD_HID = 0;
/* The number is `AWAY_AGAIN`, up beside `TAB_HOME`, because two things now ask it. */

/* HEAD, so nothing is downloaded, and `no-store` so the answer is the server's rather than the browser's copy of it. § */
async function buildTag_() {
  try {
    const res = await fetch(location.pathname.replace(/[^/]*$/, '') + 'index.html',
                            { method: 'HEAD', cache: 'no-store' });
    if (!res || !res.ok) return null;
    BUILD_AT = Date.parse(res.headers.get('last-modified') || '') || 0;
    return res.headers.get('etag') || res.headers.get('last-modified') || null;
  } catch (e) { return null; }
}

async function watchBuild_() {
  /* NO SIGNAL MEANS SAY NOTHING. § */
  BUILD_TAG = await buildTag_();
  if (!BUILD_TAG) return;
  bootStale_();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { BUILD_HID = Date.now(); return; }
    checkBuild_();
  });
  /* ---------- AND `pageshow`, BECAUSE OF THE HOME SCREEN § */
  window.addEventListener('pageshow', e => { if (e && e.persisted) checkBuild_(); });
}

async function checkBuild_() {
  /* NOT ON EVERY GLANCE. Switching apps twice in a minute is not two deploys, and a HEAD per
     switch is a request nobody asked for on somebody's data. */
  if (Date.now() - BUILD_ASKED < 30000) return;
  BUILD_ASKED = Date.now();
  const now = await buildTag_();
  if (!now || !BUILD_TAG || now === BUILD_TAG) return;
  if (buildMayReload_(now) && buildMark_(now)) {
    location.reload();
    return;
  }
  banner('A newer version of the app is ready. Tap to load it.', true);
}

/* ---------- AND ON A HOME SCREEN, IT LOADS ITSELF § */
function buildMayReload_(tag, booted) {
  /* 1. NOT TWICE FOR ONE BUILD. */
  try { if (sessionStorage.getItem('familyBuiltFor') === tag) return false; } catch (e) { return false; }
  /* 2. A RESUME, NOT A GLANCE. § */
  if (booted) {
    const sp = document.getElementById('splash');
    const up = !!(sp && !sp.classList.contains('done'));
    if (!up && !(typeof performance !== 'undefined' && performance.now() < SPLASH_SAY_AFTER)) return false;
  } else if (!BUILD_HID || Date.now() - BUILD_HID < AWAY_AGAIN) return false;
  /* 3. NOTHING TYPED AND UNSAVED. § */
  const typed = [].slice.call(document.querySelectorAll('textarea, input[type="text"], input:not([type])'))
    .filter(el => String(el.value || '').trim())
    .filter(el => el.getAttribute('data-do') !== 'qp-ans' && el.getAttribute('data-do') !== 'qp-multi' && el.id !== 'notepad' && !el.hasAttribute('data-draft'));
  /* 4. NOTHING THE STORE REFUSED — that is in this page and nowhere else, and a reload is the loss
        (`keepAtRisk_`, data.js; 317). */
  if (typeof keepAtRisk_ === 'function' && keepAtRisk_().length) return false;
  return !typed.length;
}

on('reload-build', () => location.reload());

/* ---------- THE MARK THAT STOPS A SECOND RELOAD, WRITTEN AND READ BACK BEFORE THE FIRST § */
function buildMark_(tag) {
  try {
    sessionStorage.setItem('familyBuiltFor', tag);
    return sessionStorage.getItem('familyBuiltFor') === tag;
  } catch (e) { return false; }
}

/* A PAGE THAT OPENS OLDER THAN THE SITE IT CAME FROM REFRESHES ITSELF, ONCE. § */
function bootStale_() {
  const mine = typeof window.LOAD_AT === 'number' ? window.LOAD_AT : 0;
  if (!mine || !BUILD_AT || BUILD_AT - mine < 60000) return;
  if (buildMayReload_(BUILD_TAG, true) && buildMark_(BUILD_TAG)) {
    location.reload();
    return;
  }
  banner('A newer version of the app is ready. Tap to load it.', true);
}

/* ---------- NOTHING MAY BE HELD — AND THEN SOMETHING DELIBERATELY WAS § */
/* ---------- NO FIELD REMEMBERS OR SUGGESTS (383): "every field is trying to fill in suggested memory details … i dont want that on any part". One rule for every box, drawn by any file. */
const QUIET_FIELD = { autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off',
  'data-lpignore': 'true', 'data-1p-ignore': 'true', 'data-form-type': 'other', 'data-bwignore': 'true' };
function quietField_(el) {
  if (!el || !el.setAttribute || !/^(INPUT|TEXTAREA)$/.test(el.tagName)) return;
  Object.keys(QUIET_FIELD).forEach(k => { if (el.getAttribute(k) !== QUIET_FIELD[k]) el.setAttribute(k, QUIET_FIELD[k]); });
  /* A PIN BOX: browsers ignore "off" on a password, so it is a one-time code to them. */
  if (String(el.type).toLowerCase() === 'password' || el.id === 'in-pin' || /pin/i.test(el.id || '')) el.setAttribute('autocomplete', 'one-time-code');
  if (el.tagName === 'INPUT' && el.getAttribute('spellcheck') !== 'false') el.setAttribute('spellcheck', 'false');
  if (el.hasAttribute('list')) el.removeAttribute('list');
}
function quietFields_(root) {
  try {
    if (!root) return;
    quietField_(root);
    if (root.querySelectorAll) [].forEach.call(root.querySelectorAll('input,textarea'), quietField_);
  } catch (e) {}
}
try {
  quietFields_(document.documentElement);
  new MutationObserver(ms => ms.forEach(m => [].forEach.call(m.addedNodes || [], quietFields_)))
    .observe(document.documentElement, { childList: true, subtree: true });
} catch (e) {}
