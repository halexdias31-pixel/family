/* ---------- GOING TO A COLUMN AND PAINTING IT (cut from shell-boot.js; read with the other shell-*.js by tools/piece-src.js). */
function go(id, remember, instant) {
  id = screenNow_(id); if (typeof screenGone_ === 'function' && screenGone_(id)) return;  /* a column switched off is a Find door now (batch C) */
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
    } catch { /* storage blocked: the tab is not remembered */ }
  }

  /* NOTHING IS HIDDEN ANY MORE. § */
  /* IT ARRIVES FROM THE SIDE IT CAME FROM. One class and one keyframe, rather than eight screens
     held in position so that one of them could be seen sliding in. */
  const from = TABS.findIndex(t => t.id === was), to = TABS.findIndex(t => t.id === AT);
  const way = (was && was !== AT) ? (to > from ? 1 : -1) : 0;
  /* THE WAY THE ROW WAS LAST TRAVELLED — the builder takes the columns on that side first (`ahead_`). */
  if (way) AHEAD.dir.x = way;
  /* AND A COLUMN THIS LANDING WILL SHOW THAT STILL HOLDS THE BOOT'S LOADER IS DRAWN NOW — see `bootGlass_`. */
  oopsTry_('go:glass', bootGlass_);

  /* PAINT FIRST, PLACE SECOND, ALWAYS. § */
  oopsTry_('go:neighbours', paintNeighbours);
  oopsTry_('go:place', () => placeCells('x', instant));

  /* ---------- WHY A SIDEWAYS SWIPE WAS THE ROUGH ONE § */
  /* OR IF IT IS STALE — something changed while you were elsewhere. See the note on `STALE`. */
  const painted = !screenHasMarkup_(AT) || !!STALE[AT];
  if (painted) oopsTry_('go:paint:' + AT, () => paint(AT));
  if (was !== AT && typeof widgetsBeforeSlide_ === 'function') oopsTry_('go:beforeSlide', () => widgetsBeforeSlide_(AT));
  /* Anything that needs to start running once its markup exists — a canvas, a board, a clock.
     After paint, because none of it can find an element that has not been drawn yet. */
  /* A hoisted FUNCTION, not a const. § */
  /* WHEN, and it is not simply "after the slide". § */

  /* THE TOOLS AND THE GAMES ARE STARTED WHEN THEIR COLUMN ARRIVES, and stopped when it leaves. § */
  /* AND THE CAMERA, for the same reason and with more force: a canvas loop behind a screen nobody
     is looking at is a flat battery, and a live camera behind one is a recording light on for
     nothing. */
  /* THE CAMERA IS A PAGE OF THE FEED NOW, so leaving the FEED is what lets it go. Turning a page
     within the feed is the other half, and it is `feedCamWatch_` — booked from `goPage` and from
     `startScreen_` below. */
  /* ---------- ONLY WHEN LEAVING THE FEED, OR WITH A CAMERA ACTUALLY OPEN § */
  /* PARKED, NOT STOPPED (427): coming back must not ask again, and a parked stream is no reason to run this on other columns. */
  if (typeof window.camStop_ === 'function' && AT !== 'feed'
      && (was === 'feed' || (typeof window.camOn_ === 'function' && window.camOn_()))) window.camStop_(false, true);
  /* AND THE REEL, which is the third of these and was the one nobody had written. § */
  if (typeof window.reelsStop_ === 'function' && AT !== 'reel') window.reelsStop_();
  /* A PIN SHOWN ON A CARD (452) goes when its column is left. */
  if (was !== AT && typeof pinHideAll_ === 'function') pinHideAll_();
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
    if (instant || !drawn) oopsTry_('go:fill:' + finder.id, () => finderSoon_(finder, fillStuffPages));
    else afterSlide_(() => finderSoon_(finder, fillStuffPages), 'fill:' + finder.id);
  }
  /* After wake, because a page holding a canvas has to exist and be sized before it is moved. § */
  oopsTry_('go:pager', () => paintPager(AT, instant));
  if (FLOW_LAYOUT) oopsTry_('go:flow', () => { topbarPaint_(); if (was && was !== AT) $('s-' + AT).scrollIntoView({ block: 'start' }); });

}
/* DRAW THE SCREEN EITHER SIDE, so a sideways drag reveals one rather than an empty rectangle. § */
/* ---------- WHAT EACH SCREEN NEEDS RUNNING ONCE ITS MARKUP EXISTS § */
/* SCREEN HOOKS: what one screen runs on starting, on being drawn and after a page turn; the shell keeps one rule.
   Saved, Shop and Reels hold widgets (414) whose cards grow (regrow); a start returns true when it ran. */
const SCREEN_HOOKS = {
  saved: { regrow: true, start: a => typeof savedStart_ === 'function' && (savedStart_(a), true) },
  shop: { regrow: true, start: a => typeof toolsStart_ === 'function' && (toolsStart_('shop', a), true) },
  reel: { regrow: true, start: a => typeof toolsStart_ === 'function' && (toolsStart_('reel', a), true),
    started: [() => typeof window.reelsWatch_ === 'function' && window.reelsWatch_()],
    paged: n => { if (typeof window.reelAhead_ === 'function') { try { window.reelAhead_(n); } catch (e) { oops_(e, 'shell:goPage') } } },
    slid: () => { if (typeof window.reelsWatch_ === 'function') afterSlide_(window.reelsWatch_); } },
  /* the camera is a page of the feed: started when its page arrives, put at rest at once when the page turns away (docs/history/341) */
  feed: { started: [() => typeof window.feedCamWatch_ === 'function' && window.feedCamWatch_()],
    slid: n => { if (typeof window.feedCamWatch_ === 'function') afterSlide_(window.feedCamWatch_); if (n !== 0 && typeof window.camRest_ === 'function') window.camRest_(); } },
  /* an admin's business records are asked for, a POST, once (js/records.js) */
  biz: { started: [() => typeof window.bizStart_ === 'function' && window.bizStart_()] },
  /* a conversation opens at its newest message, and keeps itself up to date while it is the screen you are on (`dmPoll_`) */
  dm: { started: [() => typeof dmFoot_ === 'function' && dmFoot_(), () => typeof dmPoll_ === 'function' && dmPoll_()],
    drawn: () => { if (typeof dmFoot_ === 'function') { try { dmFoot_(); } catch (e) { oops_(e, 'shell:drawnScreen_') } } } },
};
function startScreen_(id, arriving) {
  /* NOT A COLUMN A LANDING PAYLOAD LEFT ALONE — its markup was not replaced, so what runs in it is still
     running, and restarting it is what moves the caret: the notepad's `start` writes its value back.
     See `landRepaint_`. */
  if (typeof reconnectKeep_ === 'function' && reconnectKeep_(id)) return;
  /* NOR ONE `paint` HELD UNDER A STROKE (`padHold_`, find.js), for the same reason and one more: § */
  if (typeof padHold_ === 'function' && padHold_(id)) return;
  /* NOR A WIDGET COLUMN `paint` HELD FOR A FORM WITH TYPING IN IT (`settingsKeep_`, me.js) — the library cards on Tools, and their starred copy on Saved § */
  if (!arriving && ['saved', 'stuff'].indexOf(id) !== -1 && typeof settingsKeep_ === 'function' && settingsKeep_(id)) return;
  /* A SCREEN'S OWN WORK on starting is its row of SCREEN_HOOKS: the widgets it holds, its camera, reels, records or thread. */
  const H = SCREEN_HOOKS[id] || {};
  if (H.start && H.start(arriving)) { /* its own widgets, started from its own list */ }
  /* AND A WIDGET MOVED ONTO ANY OTHER COLUMN (710, layout.js). */
  else if (typeof WIDGET_COLS !== 'undefined' && WIDGET_COLS.indexOf(id) !== -1 && typeof widgetsWake_ === 'function') {
    const ws = widgetsOn_(id);
    if (ws.length) { widgetsWake_(ws, id, arriving); if (id === AT) placeCells('y', true, 0, id); }
  }
  /* ---------- AND A COLUMN WHOSE CARDS JUST GREW IS PLACED AGAIN § */
  if (H.regrow && id === AT) placeCells('y', true, 0, id);
  (H.started || []).forEach(f => f());
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
  /* BY ID, NOT `$`: a section is on the page once, and a check that saw data.js fail to load crashed here on `$` */
  const el = document.getElementById('s-' + id);
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
/* A REDRAW KEEPS THE READER'S PLACE (561, U2): each scrolled box's offset, keyed by its path of child indexes from the column, and focus by id. */
function placeKeep_(el) {
  const out = [];
  el.querySelectorAll('*').forEach(n => {
    if (!n.scrollTop && !n.scrollLeft) return;
    const path = [];
    for (let x = n; x && x !== el; x = x.parentElement) path.unshift([...x.parentElement.children].indexOf(x) + ':' + x.tagName);
    out.push({ path: path, top: n.scrollTop, left: n.scrollLeft });
  });
  const f = document.activeElement;
  return { boxes: out, focus: f && f.id && el.contains(f) ? f.id : '' };
}
function placeBack_(el, kept) {
  kept.boxes.forEach(k => {
    let n = el;
    for (const step of k.path) {
      const [i, tag] = step.split(':');
      n = n && n.children[+i];
      if (!n || n.tagName !== tag) return;
    }
    n.scrollTop = k.top; n.scrollLeft = k.left;
  });
  if (kept.focus) { const f = document.getElementById(kept.focus); if (f && el.contains(f)) try { f.focus({ preventScroll: true }); } catch (e) { /* focus is a courtesy: a box that cannot take it keeps the place anyway */ } }
}
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
    /* A COLUMN WHOSE FILE IS STILL ON ITS WAY (670, `LATER`) waits, and `load()` paints it once it is in. */
    html = s ? s.draw() : (filesIn_() ? null : waitShape_(id));
  } catch (err) {
    /* ITS CODE NOT IN YET (670, `LATER`): the column waits, and is drawn again when the payload lands. */
    if (!filesIn_() && err instanceof ReferenceError) { el.innerHTML = waitShape_(id); STALE[id] = 1; return; }
    oops_(err, 'draw:' + id);
    el.innerHTML = cardBlock_({ type: 'group', look: 'pane', inner: renderCard({ kind: 'oops', look: 'draw-oops', tags: [{ text: 'This screen did not draw', colour: 0 }] }) });
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
  const waited = waitingPages_(el);
  const kept = pre ? null : placeKeep_(el);
  el.innerHTML = html !== null
    ? html
    : empty_();
  el.DRAWN = { html: html, epoch: ACT_EPOCH };
  PRE_PAYLOAD.delete(id);
  PAINT_N[id] = (PAINT_N[id] || 0) + 1;
  if (held.length) {
    const left = widgetsBack_(id, held);
    if (typeof finderOf_ === 'function' && finderOf_(id)) WIDGET_HELD[id] = left;
  }
  shapeHold_(el, id);
  arrivePages_(el, waited);
  if (kept) placeBack_(el, kept);
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
