
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
  try { requestAnimationFrame(() => { band.until = Math.max(band.until, performance.now() + dur + 50); }); } catch (e) { /* no frame to wait for: the band ends on its own timer */ }
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
    el.style.pointerEvents = st.on || FLOW_LAYOUT ? 'auto' : 'none';
    /* AND THE KEYBOARD WITH IT (561, U15): a page a finger cannot reach is out of the Tab order too. */
    el.inert = !st.on && !FLOW_LAYOUT;
  }
  if (!was || was.far !== st.far) el.classList.toggle('far', st.far);
  if (!was || was.soft !== st.soft) el.classList.toggle('soft', st.soft);
  if (st.soft && (!was || was.dim !== st.dim)) el.classList.toggle('soft-dim', !!st.dim);
  if (!was || was.op !== st.op) el.style.opacity = st.op;
  if (!was || was.vis !== st.vis) el.style.visibility = st.vis;
  el.PG = st;
}

/* ---------- THE ONE SCROLLING PAGE (900) ---------- */
/* Find is always shown; another section only while it is the one asked for (the sign-in card, above Find). */
const flowHome_ = () => (TABS.some(t => t.id === FIND_HOME_) ? FIND_HOME_ : AT);
/* No transform and no glass: each section's inline placement cleared, every page in flow and touchable; `.on` is the page being read. */
function flowPlace_() {
  topbarPaint_();
  const home = flowHome_();
  TABS.forEach(t => {
    const host = $('s-' + t.id);
    if (!host) return;
    if (host.style.cssText) host.style.cssText = '';
    host.classList.toggle('hidden', t.id !== AT && t.id !== home);
    host.classList.toggle('is-front', t.id === AT);
    host.PLACED_P = PAGE[t.id] || 0;
    host.querySelectorAll(':scope > .page').forEach((el, pos) => pageWrite_(el,
      { on: logIndex_(t.id, pos) === (PAGE[t.id] || 0), far: false, soft: false, dim: null, op: '1', vis: 'visible' }));
  });
  /* PLACED, AS THE GLASS SAYS IT (one column, its page being read): else `GLASS.at !== AT` holds the builder and the widgets' wake for ever. */
  const front = $('s-' + AT);
  GLASS = { at: AT, cols: [AT], pages: front ? [...front.querySelectorAll(':scope > .page.on')] : [], reach: 0 };
}
/* THE PAGE BEING READ is the first whose foot is past a quarter of the window; turning to it is `goPage`, so Find's window and fills follow the scroll. */
let FLOW_FRAME = 0, FLOW_TURNING = false;
function flowScrolled_() {
  FLOW_FRAME = 0;
  const id = flowHome_(), host = $('s-' + id);
  if (!host || host.classList.contains('hidden') || !PAGER[id]) return;
  const pages = host.querySelectorAll(':scope > .page'), line = innerHeight / 4;
  let at = -1;
  for (let pos = 0; pos < pages.length && at < 0; pos++) {
    const r = pages[pos].getBoundingClientRect();
    if (r.height && r.bottom > line) at = pos;
  }
  if (at < 0) return;
  FLOW_TURNING = true;
  try { if (logIndex_(id, at) !== (PAGE[id] || 0)) goPage(id, logIndex_(id, at)); } finally { FLOW_TURNING = false; }
  /* NEAR THE FOOT OF WHAT IS DRAWN, the next few results are drawn (`flowMore_`, find.js). */
  if (typeof flowMore_ === 'function' && document.documentElement.scrollHeight - window.scrollY - innerHeight < innerHeight) flowMore_(id);
}
addEventListener('scroll', () => { if (FLOW_LAYOUT && !FLOW_FRAME) FLOW_FRAME = requestAnimationFrame(flowScrolled_); }, { passive: true });
/* A PAGE TURNED TO BY A TAP (a question opened, its answer shown) is scrolled to, once the turn's fills have run. */
function flowShow_(id, n) {
  if (FLOW_TURNING) return;
  afterSlide_(() => {
    const host = $('s-' + id), el = host && host.querySelectorAll(':scope > .page')[domIndex_(id, n)];
    if (el && (PAGE[id] || 0) === n) el.scrollIntoView({ block: 'start' });
  }, 'flow-show');
}

/* THE TOP BAR (900): the brand, and who is signed in with Sign out; never a Sign in tile (owner, 6 Nov). */
function topbarPaint_() {
  const bar = $('topbar-who');
  if (!bar || typeof tile_ !== 'function') return;
  const mark = document.querySelector('.topbar-brand');
  if (mark && mark.textContent !== brand('name', '@family.')) mark.textContent = brand('name', '@family.');
  const who = USER ? String(USER.name || USER.handle || '').trim() : '';
  /* ONLY @family., THE NAME AND SIGN OUT (owner, 6 Nov); signed out, Sign in is Find › Settings (C+). */
  const html = USER ? `<span class="topbar-name">${esc(who)}</span>${tile_({ icon: 'out', label: 'Sign out', act: 'signout' })}` : '';
  if (bar.innerHTML !== html) bar.innerHTML = html;
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
  /* AND A QUESTION'S PADLOCK IS LET GO WHEN A TAB OR LINK LEAVES ITS PAGE (457). */
  if (typeof qLockStray_ === 'function') qLockStray_();
  if (typeof magStray_ === 'function') magStray_();
  if (typeof gameLockStray_ === 'function') gameLockStray_();

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

/* A CARD COLUMN COUNTS WHAT `cardsOf_` DRAWS — the layout's moves and deletes included — or a card moved in sat past the last page and could not be reached (476). */
/* A PAGE'S NAME FOR THE PAGER (730), whatever column drew it: its widget's name, else its card's title — a moved card is named where it went. */
function pageName_(h) {
  const m = /id="wgt-([^"]+)"/.exec(h);
  const w = m && typeof anyWidgetOf_ === 'function' ? anyWidgetOf_(m[1]) : null;
  if (w) return w.name || '';
  const t = /<h3[^>]*>([^<]{1,80})<\/h3>/.exec(String(h || ''));
  return t ? t[1].trim().replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"') : '';
}
/* A CARD COLUMN'S PAGER: a count, or (730) every page's name once a unit has been moved onto it, so the guest is named. */
function cardCount_(col, raw, none) {
  try {
    if (typeof cardsOf_ !== 'function') return raw();
    const L = typeof layoutNow_ === 'function' ? layoutNow_() : null, pages = cardsOf_(col);
    const guests = L && (((L.cards || {})[col] || []).length || ((L.widgets || {})[col] || []).length);
    return guests ? pages.map(pageName_) : pages.length;
  } catch (e) { return none === undefined ? 1 : none; }
}
/* ---------- WIDGETS AS PAGES § */
const PAGER = {
  /* POSTS ARE HOWEVER MANY THERE ARE, so this is a function rather than a list. § */
  /* EVERY SCREEN IS PAGED. § */
  /* ---------- THESE KEYS ARE SCREEN IDS, AND TWO OF THEM NAMED SCREENS THAT DO NOT EXIST § */
  /* ---------- THE PAGER COUNTED A LIST THE SCREEN DOES NOT DRAW § */
  account: () => cardCount_('account', () => studentSetPages_().length),

  /* Empty names, one per post. § */
  /* One name per page, and the ＋ card is a page — so it is counted here too, or the pager stops one short and the last post can never be reached. § */
  /* The ＋ card is a page and everybody signed in has one, so everybody's count includes it. § */
  /* ---------- THE FEED IS FOUR KINDS OF PAGE NOW, NOT TWO § */
  /* GUARDED, because shell.js is file five and collections.js is file twenty-one. § */
  /* THE SAME LIST THE COLUMN IS BUILT FROM, which is the rule every other entry here follows: § */
  saved:  () => (typeof savedCards_ === 'function' ? savedCards_().length : 1),
  /* NEVER 0, because the column always draws SOMETHING — the sentence saying nothing is spotlit is a page, and a count of nothing over a page that exists is a § */
  spotlight: () => cardCount_('spotlight', () => (typeof spotlightCards_ === 'function' ? spotlightCards_().length : 1)),
  /* AND THE SAME AGAIN FOR SETTINGS. § */
  family: () => cardCount_('family', () => familyPages_().length),
  staff: () => cardCount_('staff', () => staffPages_().length),
  apprentice: () => cardCount_('apprentice', () => apprenticePages_().length),
  web: () => cardCount_('web', () => webProfilePages_().length),
  apprentices: () => cardCount_('apprentices', () => apprenticeProfilePages_().length),
  tutors: () => cardCount_('tutors', () => peoplePages_('tutors').length),
  students: () => cardCount_('students', () => peoplePages_('students').length),
  parents: () => cardCount_('parents', () => peoplePages_('parents').length),
  /* THE SHOP, COUNTED FROM `shopCards_`, the list `screen('shop')` draws. Never nought: the basket
     is always page 0, and with nothing for sale the shop says so in a page of its own. */
  shop: () => (typeof shopCards_ === 'function' ? shopCards_().length : 1),
  /* THE BUSINESS RECORDS, COUNTED FROM `bizPages_`, the list `screen('biz')` draws — five cards for an admin. § */
  biz: () => cardCount_('biz', () => adminPages_().length, 0),
  site: () => cardCount_('site', () => sitePages_().length, 0),

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
  stuff:  () => (typeof finderPageCount_ === 'function' ? finderPageCount_('stuff') : 1),
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
    /* THE NEWEST POST; with no post, the page after the camera, never the camera itself (489: camera first). */
    const at = typeof feedPostsAt_ === 'function' ? feedPostsAt_() : feedCamAt_() + 1, n = pageCount('feed');
    return n > at ? at : n > 1 && feedCamAt_() === 0 ? 1 : 0;
  },
  /* ---------- AND `account` HAS BEEN OPENING ON SOMEBODY ELSE § */
  account: () => 0,
  /* THE FIRST REEL (414), past the pages that lead it — the widgets and an admin's "+" (`REEL_LEAD`, posts.js). */
  reel: () => (typeof REEL_LEAD === 'number' ? REEL_LEAD : 0),
};
/* ---------- THE TAB AND HOME-SCREEN ICON ARE THE REPO'S FILES (owner's logo, 6 Nov): a sheet `logo_square` still drives posts and avatars, never these. */
function applyBrandIcon_() {
  /* `?v=` BECAUSE CHROME KEEPS A TAB ICON BY ITS URL: bump it when the logo changes. */
  [['favicon', 'favicon.png?v=1106'], ['favicon-ios', 'icon.png?v=1106']].forEach(([id, file]) => {
    const el = document.getElementById(id);
    if (el && el.getAttribute('href') !== file) el.setAttribute('href', file);
  });
}

/* KEYED BY SCREEN ID, like `PAGER` and `PAGE_HOME` — and `posts` and `me` are not screen ids. See
   the long note on `PAGER`. Every screen that pages needs an entry here or its position is not
   remembered between visits. */
/* `booking` AND `dm` WERE MISSING, and this table's own sentence above is the rule they broke: § */
const PAGE = { feed: 0, stuff: 0, account: 0, reel: 0, booking: 0, dm: 0, make: 0,
               saved: 0, family: 0, staff: 0, tutors: 0, students: 0, parents: 0, spotlight: 0, shop: 0, res: 0, biz: 0 };

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
      if (f) oopsTry_('afterSlide', f);
      if (jobs.length) { setTimeout(next, 0); return; }
      if (AFTER_SLIDE === mark) AFTER_SLIDE = null;
      /* AND THEN THE BUILDER, which waits for exactly this list to be empty — see `ahead_` below. */
      if (typeof aheadKick_ === 'function') aheadKick_();
    };
    next();
  }, FLOW_LAYOUT ? 0 : 300);
}

/* AHEAD: WHAT A FLICK CAN REACH IS DRAWN BEFORE IT GETS THERE § */
const AHEAD = { open: false, pre: false, opened: 0, input: 0, booked: 0, timer: 0, dir: { x: 0, y: {} }, stuck: new Set(), running: false };
const AHEAD_SLOW = new Set();
const AHEAD_QUIET = 400, AHEAD_QUIET_SLOW = 1000, AHEAD_SLOW_MS = 150;
/* ---------- THE SLOW BIT IS KEPT ON THE DEVICE, AND A COLUMN'S FIRST DRAW IS SLOW UNTIL IT HAS BEEN TIMED § */
const AHEAD_SLOW_KEY = 'familyAheadSlow';
try { (JSON.parse(localStorage.getItem(AHEAD_SLOW_KEY) || '[]') || []).forEach(k => { if (typeof k === 'string') AHEAD_SLOW.add(k); }); } catch (e) { /* a bad stored list reads as none */ }
function aheadSlowKeep_() {
  try { localStorage.setItem(AHEAD_SLOW_KEY, JSON.stringify([...AHEAD_SLOW].filter(k => /^(paint|widget):/.test(k)))); } catch (e) { /* storage can be blocked; the app runs without it */ }
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
  try { if (navigator.connection && navigator.connection.saveData) return; } catch (e) { /* the browser may refuse this; nothing depends on it */ }
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
  catch (e) { left = true; try { console.warn('[ahead]', job.key, e); } catch (x) { oops_(x, 'shell:aheadSlice_') } }
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
  AHEAD_KINDS.forEach(k => { try { (k() || []).forEach(j => { if (AHEAD.open || j.pre) out.push(j); }); } catch (e) { /* a look-ahead kind that fails adds nothing */ } });
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
    try { finderSoon_(F, () => { if ($(id + '-controls')) stuffBandFill_(); }); } catch (e) { /* a finder gone mid-draw keeps its old band */ }
  }
  placeOne_(id);
  if (typeof paneWatch_ === 'function') paneWatch_(host);
  drawnScreen_(id);
}
/* THE HALF OF `startScreen_` THAT RUNS NOTHING — a conversation opened at its newest message. */
function drawnScreen_(id) {
  const H = SCREEN_HOOKS[id] || {};
  if (H.drawn) H.drawn();
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
  return finderSoon_(F, () => goPageHere_(id, to, instant, F));
}
function goPageHere_(id, to, instant, F) {
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
  if (F && typeof stuffWindow_ === 'function') { try { stuffWindow_(); } catch (e) { oops_(e, 'shell:goPage') } }
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
  /* AND THE WORDS AHEAD, ON EVERY TURN — not after the slide, which a quick reader never lets end (453). */
  else if (F && typeof libAhead_ === 'function') { try { libAhead_(); } catch (e) { oops_(e, 'shell:goPage') } }
  if (edge) { try { stuffEdgeFill_(n, n > was ? 1 : -1); } catch (e) { oops_(e, 'shell:goPage') } }
  if (ref && typeof stuffKeepPlace_ === 'function') stuffKeepPlace_($('s-' + id), top0 - (typeof stuffTop_ === 'function' ? stuffTop_(ref) : ref.offsetTop));
  /* A WIDGET STILL WAITING ITS TURN to start is started now if this is its page — see `widgetsNear_` in arcade.js. § */
  if (typeof widgetsNear_ === 'function') widgetsNear_(id);
  /* AND THE REELS KEPT SIX AHEAD, one slide appended now if fewer are left — markup only (`reelAhead_`). */
  const H = SCREEN_HOOKS[id] || {};
  if (H.paged) H.paged(n);
  if (id === AT) placeCells('y', instant);
  /* AFTER THE SLIDE, THE LANDING'S OWN WORK — the page in front and one either side if a jump left them empty, its textbook animation and its running widget. § */
  if (F && !bare) afterSlide_(() => finderSoon_(F, fillStuffPages), 'fill:' + id);
  /* ---------- AFTER THE SLIDE, THE SCREEN'S OWN WORK: the reel being watched, the feed's camera started or put at rest (SCREEN_HOOKS). */
  if (H.slid) H.slid(n);
  paintPager(id);
  if (FLOW_LAYOUT) flowShow_(id, n);
}
