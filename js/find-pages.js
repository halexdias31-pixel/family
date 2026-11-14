/* THE ZOOM LADDER (533, U10): a card is drawn at one of these and nothing between, so a title has three sizes and not seven. */
const PANE_ZOOM_STEPS = [1, 0.875, 0.75];
/* HOW SMALL A CARD MAY BE DRAWN TO FIT ITS PANE before it scrolls instead: the ladder's last step. See `paneReach_`. */
const PANE_ZOOM_MIN = PANE_ZOOM_STEPS[PANE_ZOOM_STEPS.length - 1];
/* NEARLY FITTING IS FULL SIZE (533): above this the card is drawn at 1 in a pane with its spacing tightened (`.pane.is-snug`), not at .97. */
const PANE_ZOOM_SNUG = 0.95;
/* THE FLOORS (533, D3): no step that draws body words under 11px, a 44px tile (950) under 36px or a Check under 44px; past them the pane scrolls. */
const PANE_FLOOR_TEXT = 11, PANE_FLOOR_TILE = 36, PANE_FLOOR_SUBMIT = 44;
/* WHAT IS ART AND NOT BODY TEXT, so its small print does not stop a card being drawn smaller. */
const PANE_ART = 'svg, sup, sub, figure';
/* ---------- AND AN ESSAY'S CARD, NO SMALLER THAN KEEPS ITS TILES AT 44px § */
const PANE_ZOOM_ESSAY = 0.92;

/* THE SMALLEST ZOOM THIS PANE'S FLOORS ALLOW: its body words and every tile it shows, read at full size (zoom already cleared). */
function paneFloor_(p) {
  let z = 0;
  const words = [p.firstElementChild].concat([].slice.call(p.querySelectorAll('p, li'), 0, 120));
  words.forEach(e => {
    if (!e || !e.offsetHeight || (e.closest && e.closest(PANE_ART))) return;
    const f = parseFloat(getComputedStyle(e).fontSize) || 0;
    if (f > 0) z = Math.max(z, PANE_FLOOR_TEXT / f);
  });
  p.querySelectorAll('.tile').forEach(t => {
    const h = t.offsetHeight;
    if (h) z = Math.max(z, (t.classList.contains('is-submit') ? PANE_FLOOR_SUBMIT : PANE_FLOOR_TILE) / h);
  });
  return z;
}
/* THE STEP FOR A CARD THAT FITS AT `raw`: the largest step at or under it that keeps the floors, else the smallest that does (and the pane scrolls). */
function paneStep_(raw, floor) {
  if (!(raw < 1) || raw > PANE_ZOOM_SNUG) return 1;
  const ok = PANE_ZOOM_STEPS.filter(s => s >= floor - 1e-6);
  if (!ok.length) return 1;
  return ok.find(s => s <= raw) || ok[ok.length - 1];
}
/* ON THE GLASS: the page in front of its column, inside the window. A card there is not re-zoomed under the reader (U10). */
function paneOnGlass_(p) {
  const pg = p && p.closest && p.closest('.page');
  if (!pg || !pg.classList.contains('on')) return false;
  const r = p.getBoundingClientRect();
  return r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight;
}

/* THE WRITES THAT UNDO LAST TIME'S FIT, THEN EACH KIND OF CARD GIVES WAY ITS OWN WAY; returns what was there. */
function paneReset_(list, kids, hold) {
  const was = kids.map(ks => ks.map(k => k.style.zoom || ''));
  if (!hold) kids.forEach(ks => ks.forEach(k => {
    if (k.style.zoom) {
      k.style.zoom = ''; k.style.width = '';
      k.style.marginInline = ''; k.style.marginLeft = ''; k.style.marginRight = '';
    }
  }));
  /* A SNUG PANE IS MEASURED AT ITS OWN SPACING, so it is snug again only if it still nearly fits. */
  const snugWas = list.map(p => p.classList.contains('is-snug'));
  if (!hold) list.forEach(p => { if (p.classList.contains('is-snug')) p.classList.remove('is-snug'); });
  if (!hold) list.forEach(p => { p.PANE_DUE = false; });
  /* AN ESSAY'S SHEET GIVES WAY BEFORE ITS CARD IS DRAWN SMALLER -- `kpSheetFit_` in keypad.js. § */
  if (!hold && typeof kpSheetFit_ === 'function') list.forEach(p => { if (p.querySelector('.qp-essay')) kpSheetFit_(p); });
  /* AND A LIBRARY CARD GIVES UP ITS BLANK BAND FIRST — `libFit_` in me.js, the sheet's rule for the one card whose height follows its width: § */
  if (!hold && typeof libFit_ === 'function') list.forEach(p => { if (p.querySelector('.lib-face')) libFit_(p); });
  /* A TALMUD SIDE IS FETCHED AND LAID OUT AS ITS PANE IS REACHED (490) -- `talCardsFit_`, talmud.js. */
  if (!hold && typeof window.talCardsFit_ === 'function') list.forEach(p => { if (p.querySelector('.tal-card-page')) window.talCardsFit_(p); });
  /* AND A CARD WITH A FIGURE IN IT GIVES WAY THE SAME WAY -- `cardFigFit_`, the sheet's answer for a picture (356): § */
  if (!hold) list.forEach(p => { if (cardFigs_(p.querySelector('.qcard')).length) cardFigFit_(p); });
  return { was, snugWas };
}

/* WHAT KIND OF CARD EACH PANE HOLDS -- the ones never drawn smaller. */
function paneFlags_(list) {
  /* ---------- AND A CARD WITH A FIGURE IN IT IS NEVER DRAWN SMALLER WHOLE § */
  const drawn = list.map(p => !!cardFigs_(p.querySelector('.qcard')).length);
  const essay = list.map(p => !!p.querySelector('.qp-essay'));
  /* ---------- AND A LIST OF TICKS THAT IS OPEN IS NEVER DRAWN SMALLER § */
  const ticks = list.map(p => !!p.querySelector('details.many-d[open]'));
  /* ---------- AND NEITHER IS A CARD BEING EDITED (`cardEditHtml_`, me.js; docs/history/330) § */
  /* ---------- NOR "MANAGE YOUR CHILD" (`childManageCard_`, me.js; the review of docs/history/339) § */
  const forms = list.map(p => !!p.querySelector('.card-ed .me-form, .kid-manage'));
  /* ---------- NOR A CARD ANSWERED BY TAPPING ITS OPTIONS, ITS ORDER OR ITS CELLS (374): drawn smaller they fell to 39-41px at 320; it scrolls and they stay 44 */
  /* AND THE CONSOLE (419) THE SAME WAY: drawn smaller its pad keys fell to 31px, and every line it showed or hid re-zoomed the whole console under a thumb. */
  const picks = list.map(p => !!p.querySelector('.qcard .qp-opts, .qcard .qp-order, .qcard .qp-cells-box, .nes-wrap'));
  return { drawn, essay, ticks, forms, picks };
}

/* THE ZOOM EACH PANE WANTS; marks `snug` and `held` as it goes. */
function paneWant_(list, was, f, hold, snug, held) {
  const { drawn, essay, ticks, forms, picks } = f;
  const pad = p => {
    const cs = getComputedStyle(p);
    return (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  };
  const t0 = performance.now();
  const want = list.map((p, i) => {
    if (hold) return parseFloat(was[i][0]) || 1;
    const room = p.clientHeight - pad(p);
    const used = p.scrollHeight - pad(p);
    if (room <= 0 || used - room <= 2) return 1;
    if (ticks[i] || forms[i] || drawn[i] || picks[i]) return 1;
    /* FOUR PIXELS SHORT OF THE ROOM, because a 1px border and a sub-pixel line box do not scale:
       measured, a card zoomed to exactly room / used ended 4px past its pane. */
    const raw = (room - 4) / used;
    snug[i] = raw > PANE_ZOOM_SNUG;
    /* ON THE LADDER AND ABOVE THE FLOORS (533); the floors are read only for a card that does not fit, which is the few. */
    let z = paneStep_(raw, snug[i] ? 0 : paneFloor_(p));
    /* AN ESSAY'S CARD: that zoom, or none and a scrolling pane -- `PANE_ZOOM_ESSAY`. */
    if (essay[i] && z < PANE_ZOOM_ESSAY) z = 1;
    /* NO FLIP (533): a change that reverses this pane's last one within three frames is not made -- a card growing and shrinking under its own zoom. */
    const cur = parseFloat(was[i][0]) || 1, dir = Math.sign(z - cur), last = p.PANE_ZD;
    if (dir && last && last.dir === -dir && t0 - last.t < 50) { held[i] = cur > raw; return cur; }
    if (dir) p.PANE_ZD = { dir, t: t0 };
    held[i] = z > raw;
    return z;
  });
}

/* THE WRITES: each card drawn at its zoom, at its own width and centred. */
function paneZoomTo_(list, kids, want, snug, hold) {
  /* AND THE CARD KEEPS ITS OWN WIDTH, so it is the same card drawn smaller rather than a wider card re-flowed. § */
  /* ---------- AND IT STAYS CENTRED WHERE IT WAS, WHICH `margin-inline: auto` DID NOT DO § */
  const box = list.map(p => {
    const r = p.getBoundingClientRect(), cs = getComputedStyle(p);
    return r.left + (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.paddingLeft) || 0);
  });
  const rects = kids.map(ks => ks.map(k => k.getBoundingClientRect()));
  if (!hold) list.forEach((p, i) => {
    if (snug[i] && want[i] === 1) p.classList.add('is-snug');
    if (want[i] < 1) kids[i].forEach((k, j) => {
      const r = rects[i][j], z = want[i];
      const left = (r.left - box[i]) + r.width / 2 - r.width * z / 2;
      k.style.width = r.width + 'px';
      k.style.marginLeft = (left / z) + 'px';
      k.style.marginRight = 'auto';
      k.style.zoom = String(z);
    });
  });
}

/* A PANE WHOSE ZOOM CHANGED HAS ITS SCREEN'S COLUMN PLACED AGAIN. */
function panePlace_(list, was, snugWas, want, hold) {
  /* ---------- A ZOOM THAT CHANGED MOVES THE PAGES UNDER IT, SO THE COLUMN IS PLACED AGAIN § */
  const moved = new Set();
  if (!hold) list.forEach((p, i) => {
    const now = want[i] < 1 ? String(want[i]) : '';
    if (was[i].some(z => z !== now) || snugWas[i] !== p.classList.contains('is-snug')) {
      const scr = p.closest && p.closest('.screen');
      if (scr && scr.id) moved.add(scr.id.replace(/^s-/, ''));
    }
  });
  if (moved.size && typeof placeCells === 'function') {
    moved.forEach(id => placeCells('y', true, 0, id));
  }
}

/* THE PANE SCROLLS OR NOT, written only where it changes. */
function paneScroll_(list, over, drawn) {
  /* WRITTEN ONLY WHERE IT CHANGES, which is what stops `paneWatch_` below feeding itself: § */
  list.forEach((p, i) => {
    const to = over[i] ? 'auto' : '';
    if (p.style.overflowY !== to) {
      p.style.overflowY = to;
      /* A CARD WITH A PEN THAT HAS TO SCROLL OPENS SCROLLED TOWARDS ITS FOOT -- the picture to draw on and its bar on the glass -- AND NO FURTHER THAN PUTS THE § */
      const art = to && drawn[i] ? p.querySelector('.qcard .qpad .qpad-art') : null;
      if (art) {
        const top = art.getBoundingClientRect().top - p.getBoundingClientRect().top - (p.clientTop || 0) + p.scrollTop - 8;
        p.scrollTop = Math.max(0, Math.min(p.scrollHeight - p.clientHeight, Math.floor(top)));
      }
    }
  });
}

/* EVERY READ, THEN EVERY WRITE, AND IT IS THE WHOLE COST OF THIS FUNCTION. § */
/* `o.hold` (533): the zoom each card has stays, and only whether its pane scrolls is asked again -- a card on the glass that grew. */
function paneReach_(panes, o) {
  const list = [].slice.call(panes || []);
  if (!list.length) return;
  const hold = !!(o && o.hold);
  try {
    /* ---------- SHRINK TO FIT FIRST, AND SCROLL ONLY PAST THE FLOOR § */
    const kids = list.map(p => [].slice.call(p.children));
    const { was, snugWas } = paneReset_(list, kids, hold);
    const { drawn, essay, ticks, forms, picks } = paneFlags_(list);
    const snug = list.map(() => false);
    /* HELD AT A SIZE THAT DOES NOT FIT -- snug, a floor, an essay or `o.hold`: its pane scrolls from 2px over, since nothing else reaches its foot (533 review). */
    const held = list.map(() => hold);
    const want = paneWant_(list, was, { drawn, essay, ticks, forms, picks }, hold, snug, held);
    paneZoomTo_(list, kids, want, snug, hold);
    panePlace_(list, was, snugWas, want, hold);
    /* `overflow-y` AND NOT `touch-action`, WHICH IS THE OPPOSITE OF WHAT `padReach_` DOES AND IS DELIBERATE. § */
    /* READ AFTER THE ZOOM. A step at or under the fit fits by construction; one held up by a floor, the snug rule or `o.hold` may not (533). */
    /* AN OPEN LIST SCROLLS FROM ITS FIRST PIXEL OVER, not from `PANE_REACH`'s 24: § */
    /* A CARD BEING EDITED THE SAME: its Save and Cancel are its foot, and the pane has to reach them — and
       "Manage your child", whose foot is Ask them. */
    const over = list.map((p, i) => p.scrollHeight - p.clientHeight > (ticks[i] || forms[i] || drawn[i] || picks[i] || held[i] ? 2 : PANE_REACH));
    paneScroll_(list, over, drawn);
  } catch (e) { /* a pane gone mid-measure keeps its scroll as it was */ }
}

/* ---------- AND A CARD THAT GROWS AFTER ITS SCREEN WAS PLACED § */
/* ---------- AND IT MEASURES A FRAME LATER, NOT INSIDE THE OBSERVER'S OWN CALLBACK § */
let PANE_WATCH = null;
let PANE_WATCH_DUE = null;
/* THE PAGE IN FRONT WHEN `paneWatch_` LAST RAN, so it knows an arrival from a re-placement. */
let PANE_FRONT = '';
/* THE WINDOW'S SIZE, KEPT UNTIL IT RESIZES: reading `innerWidth` straight after a placement forced a whole-app layout on every release (401). */
let PANE_VP_NOW = '';
const paneVp_ = () => PANE_VP_NOW || (PANE_VP_NOW = innerWidth + 'x' + innerHeight);
addEventListener('resize', () => { PANE_VP_NOW = ''; }, { passive: true });
if (window.visualViewport) visualViewport.addEventListener('resize', () => { PANE_VP_NOW = ''; }, { passive: true });
function paneWatch_(host) {
  if (!host || !host.querySelectorAll) return;
  const panes = host.querySelectorAll('.pane');
  /* ---------- ONLY THE PANES IT HAS NOT ALREADY MEASURED § */
  const vp = paneVp_();
  const all = host.PANE_VP !== vp;
  host.PANE_VP = vp;
  /* AN ARRIVAL (533): the page in front is not the one the last call saw, so a card that grew on the glass is zoomed again now, as it comes. */
  const front = (typeof AT !== 'undefined' ? AT : '') + ':' + (typeof PAGE !== 'undefined' && PAGE ? PAGE[AT] || 0 : 0);
  const came = PANE_FRONT !== front;
  PANE_FRONT = front;
  paneReach_(all ? panes : [].filter.call(panes, p =>
    !(p.PANE_SEEN && p.PANE_SEEN === p.firstElementChild && p.PANE_N === p.children.length)
    || (p.PANE_DUE && (came || !paneOnGlass_(p)))));
  [].forEach.call(panes, p => { p.PANE_SEEN = p.firstElementChild; p.PANE_N = p.children.length; });
  if (typeof ResizeObserver !== 'function') return;
  try {
    if (!PANE_WATCH) PANE_WATCH = new ResizeObserver(rows => {
      const due = PANE_WATCH_DUE || (PANE_WATCH_DUE = []);
      const first = due.length === 0;
      const held = new Set();
      /* ---------- AND HOW TALL EACH PANE WAS, FOR THE DAY IT IS EMPTIED § */
      rows.forEach(r => {
        const pane = r.target && r.target.parentElement;
        if (pane && pane.classList.contains('pane')) pane.LAST_H = pane.getBoundingClientRect().height;
      });
      rows.forEach(r => {
        const pane = r.target && r.target.parentElement;
        if (pane && due.indexOf(pane) === -1) due.push(pane);
        const scr = pane && pane.closest && pane.closest('.screen');
        if (scr && scr.id && !held.has(scr.id)) {
          held.add(scr.id);
          /* NOW, INSIDE THE DELIVERY, and not with the measuring a frame later — see `holdColumn_` in shell.js: § */
          if (typeof holdColumn_ === 'function') holdColumn_(scr.id.replace(/^s-/, ''));
        }
      });
      if (first && due.length) requestAnimationFrame(() => {
        const mine = (PANE_WATCH_DUE || []).filter(p => p.isConnected);
        PANE_WATCH_DUE = null;
        /* ON THE GLASS IT KEEPS ITS ZOOM AND MAY SCROLL; it is zoomed again at the next arrival (533, U10). Off the glass, at once. */
        const glass = mine.filter(paneOnGlass_);
        glass.forEach(p => { p.PANE_DUE = true; });
        paneReach_(glass, { hold: true });
        paneReach_(mine.filter(p => glass.indexOf(p) === -1));
      });
    });
    /* ONLY WHAT CHANGED IS UNOBSERVED OR OBSERVED. § */
    const kids = [].slice.call(panes).map(p => p.firstElementChild).filter(Boolean);
    const had = host.PANE_KIDS || [];
    const now = new Set(kids);
    had.forEach(k => { if (!now.has(k)) { try { PANE_WATCH.unobserve(k); } catch (e) { /* already stopped is fine */ } } });
    const old = new Set(had);
    kids.forEach(k => { if (!old.has(k)) PANE_WATCH.observe(k); });
    host.PANE_KIDS = kids;
  } catch (e) { /* a pane gone mid-change is watched again on the next draw */ }
}

/* ---------- ONE PAGE, FILLED: THE LOOP'S BODY, AND THE FAR EDGE OF THE GLASS § */
function stuffFillOne_(i, ctx) {
  const host = $('s-' + FINDER.id);
  if (!host) return false;
  const c = ctx || {};
  const first = c.first != null ? c.first : stuffFirstResult_();
  /* THE PAGE COUNT, not the result count — a practical is four pages. See `stuffPages_`. */
  if (i < first || i > first + stuffPages_().length - 1) return false;
  const pages = c.pages || host.querySelectorAll(':scope > .page');
  const el = pages[domIndex_(FINDER.id, i)];
  if (!el || el.dataset.filled === '1') return false;
  /* INTO THE PANE, not over it — see the note in `fillStuffPages`. `paneOf_` makes one if the page
     has not got one. */
  const pane = paneOf_(el);
  pane.innerHTML = stuffPageHtml(i - first);
  el.dataset.filled = '1';
  /* WHICH CARD THIS IS, AND FOR WHICH QUESTION — so a redraw over a changed list can find it again
     (`stuffHeld_`). An expando, as `pane.LAST_H` is: nothing reads it out of the markup. */
  el.FIND_AT = { ask: stuffAsk_(), id: stuffPageId_(stuffPages_()[i - first]) };
  if (pane.querySelector('.widget-slot')) {
    /* A WIDGET THAT WAS RUNNING BEFORE THE PAINT gets its own slot back, its game and clock as they were (`WIDGET_HELD`, arcade.js). */
    if ((WIDGET_HELD[FINDER.id] || []).length) WIDGET_HELD[FINDER.id] = widgetsBack_(FINDER.id, WIDGET_HELD[FINDER.id]);
    finderWake_(FINDER.id);
  }
  /* THE HEIGHT IT WAS HELD AT WHILE EMPTY GOES, in the same task as the card arrives, so the page is
     its card's height from the first frame it is drawn — see `stuffPin_`. */
  el.style.minHeight = '';
  if (Q_SCROLL_TO) {
    const at = [].find.call(pane.querySelectorAll('[data-part]'), b => b.getAttribute('data-part') === Q_SCROLL_TO);
    if (at) { Q_SCROLL_TO = ''; setTimeout(() => at.scrollIntoView({ block: 'start' }), 0); }
  }
  return true;
}

/* ---------- THE RELEASE'S FLOOR: EVERY PAGE THE BAND WILL SHOW, FILLED BEFORE THE COLUMN MOVES § */
/* `least`: THE FLOOR, in pages — `glassRows_() + 3` for a turn (above); 1 for `stuffBandFill_`, which asks for
   the band and no more. */
function stuffEdgeFill_(n, dir, least) {
  const id = FINDER.id, host = $('s-' + id);
  if (!host) return 0;
  const pages = host.querySelectorAll(':scope > .page');
  const cur = pages[domIndex_(id, n)];
  if (!cur) return 0;
  const rows = typeof glassRows_ === 'function' ? glassRows_() : 2;
  const floor = least == null ? rows + 3 : least;
  const glassH = host.clientHeight || innerHeight;
  const top = cur.offsetTop, h = cur.offsetHeight;
  const gTop = top - Math.max(0, (glassH - h) / 2);
  const reach = dir > 0 ? gTop + 2 * glassH : gTop - glassH;
  let y = dir > 0 ? top + h : top;
  let filled = 0;
  for (let k = 1; k <= STUFF_WIN; k++) {
    const i = n + dir * k;
    const el = pages[domIndex_(id, i)];
    if (!el || !el.classList.contains('is-res')) break;
    if (k > floor && (dir > 0 ? y >= reach : y <= reach)) break;
    if (el.dataset.filled !== '1' && stuffFillOne_(i)) filled++;
    y += dir * el.offsetHeight;
    if (filled >= rows + 3) break;
  }
  return filled;
}

/* ---------- A WINDOW DRAWN AFRESH ON THE GLASS IS FILLED AS FAR AS THE GLASS SHOWS, BOTH WAYS § */
function stuffBandFill_() {
  const at = PAGE[FINDER.id] || 0;
  let n = stuffFillOne_(at) ? 1 : 0;
  n += stuffEdgeFill_(at, 1, 1);
  n += stuffEdgeFill_(at, -1, 1);
  return n;
}
/* WHETHER THIS FINDER'S COLUMN IS ONE THE GLASS SHOWS — in front, or beside it on a wide window. */
function stuffOnGlass_(id) {
  return id === AT || (typeof GLASS !== 'undefined' && GLASS.at === AT && GLASS.cols.indexOf(id) !== -1);
}

/* ---------- THE BUILDER'S FINDER JOBS: THE WHOLE WINDOW FILLED, AND RE-CENTRED, IN THE QUIET § */
function stuffAheadJobs_() {
  const out = [];
  Object.keys(FINDERS).forEach(fid => {
    const F = FINDERS[fid];
    if (!TABS.some(t => t.id === fid) || STALE[fid]) return;
    const host = $('s-' + fid);
    if (!host || !host.querySelector(':scope > .page.is-res')) return;
    inFinder_(F, () => {
      if (!$(fid + '-controls')) return;
      const first = stuffFirstResult_();
      const n = stuffPages_().length;
      if (!n) return;
      const want = stuffPageCount();
      const size = Math.min(want, STUFF_WIN);
      const had = PAGE_LO[fid] || 0;
      const ask = stuffAsk_();
      const at = PAGE[fid] || 0;
      if (stuffLo_(want, first, had, 'centre') !== had) {
        out.push({ key: 'centre:' + fid, kind: 'centre', d: aheadDist_(fid, at), run: () => stuffAheadCentre_(F, ask) });
      }
      const pages = host.querySelectorAll(':scope > .page');
      let best = null;
      for (let i = first + had; i < first + had + size && i < first + n; i++) {
        const el = pages[domIndex_(fid, i)];
        if (!el) continue;
        if (el.dataset.filled === '1' && !(el.FIND_AT && el.FIND_AT.ask !== ask)) continue;
        const d = aheadDist_(fid, i);
        if (!best || d < best.d) best = { i: i, d: d };
      }
      if (best) {
        const i = best.i;
        out.push({ key: 'fill:' + fid + ':' + i, kind: 'fill', d: best.d, run: () => stuffAheadFill_(F, i, ask) });
      }
    });
  });
  return out;
}
/* ONE CARD, AND ITS PANE MEASURED NOW — `paneWatch_` measures the panes it has not seen, which is this one — so nothing later measures the window; and a card § */
function stuffAheadFill_(F, i, ask) {
  return inFinder_(F, () => {
    if (stuffAsk_() !== ask) return;
    const id = F.id, host = $('s-' + id);
    if (!host) return;
    const pages = host.querySelectorAll(':scope > .page');
    const el = pages[domIndex_(id, i)];
    if (!el || !el.classList.contains('is-res')) return;
    if (el.dataset.filled === '1' && el.FIND_AT && el.FIND_AT.ask === ask) return;
    if (el.dataset.filled === '1') stuffBlank_(el);
    const at = PAGE[id] || 0;
    const ref = i < at ? pages[domIndex_(id, at)] : null;
    const top0 = ref ? stuffTop_(ref) : 0;
    if (!stuffFillOne_(i)) return false;
    if (typeof paneWatch_ === 'function') paneWatch_(host);
    if (ref) stuffKeepPlace_(host, top0 - stuffTop_(ref));
  });
}
function stuffAheadCentre_(F, ask) {
  return inFinder_(F, () => {
    if (stuffAsk_() !== ask) return;
    stuffWindow_('centre');
    if (typeof placeOne_ === 'function') placeOne_(F.id);
  });
}
AHEAD_KINDS.push(stuffAheadJobs_);

/* ---------- A FINDER DRAWN FROM NOTHING IS WARMED IN FOUR SLICES BEFORE ITS PAINT (`warm`) § */
const STUFF_WARM = {};
const STUFF_WARM_STEPS = [
  () => stuffItems(),
  () => stuffSorted_(stuffItems()),
  () => stuffFiltered(),
  () => stuffQuestion(),
];
function stuffWarmJobs_() {
  const out = [];
  Object.keys(FINDERS).forEach(fid => {
    if (fid === AT || !STALE[fid] || !TABS.some(t => t.id === fid) || !$('s-' + fid)) return;
    const F = FINDERS[fid];
    inFinder_(F, () => {
      const ask = stuffAsk_(), who = itemMemoKey_();
      const w = STUFF_WARM[fid];
      const step = w && w.data === DATA && w.ask === ask && w.who === who ? w.step : 0;
      if (step >= STUFF_WARM_STEPS.length) return;
      out.push({ key: 'warm:' + fid + ':' + step, kind: 'paint', d: aheadDist_(fid, null) - 0.01, run: () => stuffWarm_(F, ask, step) });
    });
  });
  return out;
}
function stuffWarm_(F, ask, step) {
  return inFinder_(F, () => {
    if (stuffAsk_() !== ask) return false;
    STUFF_WARM_STEPS[step]();
    STUFF_WARM[F.id] = { data: DATA, ask: ask, who: itemMemoKey_(), step: step + 1 };
  });
}
AHEAD_KINDS.push(stuffWarmJobs_);

/* ---------- AN EMPTIED PAGE KEEPS ITS HEIGHT § */
function stuffPin_(el, pane) {
  const h = pane && pane.LAST_H;
  if (el && h > 0) el.style.minHeight = h + 'px';
}

/* `all` WAS THE LATE PASS SAYING "DO THE REST", and the late pass is gone (`STUFF_LATE`'s note). § */
function fillStuffPages(all) {
  const host = $('s-' + FINDER.id);
  if (!host) return;
  let changed = false;
  const pages = host.querySelectorAll(':scope > .page');
  const at = PAGE[FINDER.id] || 0;
  const items = stuffFiltered();
  const first = stuffFirstResult_();
  /* ---------- THE THREE YOU ARE ON, NOT THE FIVE THOUSAND YOU ARE NOT § */
  /* EVERY NUMBER HERE IS A PAGE NUMBER and every lookup goes through `domIndex_`, because the
     results are a window and the element standing for page 400 is not the four-hundredth child.
     See `stuffWindow_`. */
  const last = first + stuffPages_().length - 1;
  const winLo = first + (PAGE_LO[FINDER.id] || 0);
  const lo = Math.max(first, all ? winLo : at - STUFF_SOON);
  const hi = Math.min(last, all ? winLo + STUFF_WIN - 1 : at + STUFF_SOON);
  const ask = stuffAsk_();
  const drawn = [];
  for (let i = lo; i <= hi; i++) {
    const el = pages[domIndex_(FINDER.id, i)];
    if (!el) continue;
    if (el.dataset.filled === '1' && el.FIND_AT && el.FIND_AT.ask !== ask) stuffBlank_(el);
    if (el.dataset.filled === '1') continue;
    /* THE CARD, ITS WIDGET DRAWN WITH IT — see `stuffFillOne_`, which the far edge of the glass in
       `goPage` and the builder share. */
    if (stuffFillOne_(i, { pages: pages, first: first, items: items })) {
      changed = true;
      drawn.push(el);
    }
  }

  /* AND THE CARDS THIS PASS DREW ARE MEASURED ON THE NEXT TURN OF THE EVENT LOOP — only those, never the whole window: § */
  /* THE FINDER IS CAPTURED, because the timer fires outside every binding (`inFinder_`). */
  clearTimeout(STUFF_LATE);
  if (drawn.length) {
    STUFF_LATE = setTimeout(() => paneReach_(drawn.filter(el => el.isConnected && el.dataset.filled === '1')
      .map(el => el.querySelector(':scope > .pane')).filter(Boolean)), 0);
  }

  /* AND THE WORDS OF THE CARD IN FRONT AND THE NEXT FEW, from the Ledger (397) — asked here, where a turn lands. */
  libAhead_();

  settle_(changed);
}

/* THE WORD FOR GOING ON TO THE RESULTS: a scroll on the one page (900), a swipe on the columns. */
const SWIPE_UP = FLOW_LAYOUT ? 'Scroll down' : 'Swipe up';
/* THE ONE SCROLLING PAGE (900): near the foot of what is drawn, the next three results of the window are drawn. */
function flowMore_(id) {
  const F = typeof finderOf_ === 'function' ? finderOf_(id) : null;
  if (!F) return;
  inFinder_(F, () => {
    const host = $('s-' + id);
    if (!host) return;
    const pages = host.querySelectorAll(':scope > .page'), first = stuffFirstResult_(), items = stuffFiltered();
    const last = first + stuffPages_().length - 1;
    let n = 0;
    for (let i = Math.max(first, PAGE[id] || 0); i <= last && n < 3; i++) {
      const el = pages[domIndex_(id, i)];
      if (!el) break;
      if (el.dataset.filled !== '1' && stuffFillOne_(i, { pages: pages, first: first, items: items })) n++;
    }
    if (n) { libAhead_(); settle_(true); }
  });
}

/* The grid measures the panes again and puts everything where it now belongs. § */
/* ---------- HELD, NOT PLACED § */
function settle_(changed) {
  if (!changed) return;
  const host = $('s-' + FINDER.id);
  if (host && typeof paneWatch_ === 'function') paneWatch_(host);
  if (!holdColumn_(FINDER.id)) placeCells('y', true, 0, FINDER.id);
}

/* ---------- EVERY WIDGET, FIXED AND MADE § */
function allWidgets() {
  /* THE STATIC ONES, THEN THE TWO SETS THAT ARE MADE FROM DATA — a widget per conversation and a widget per session you are in. § */
  /* ---------- AND CONVERSATIONS ARE NOT AMONG THEM ANY MORE § */
  return WIDGETS
    .concat(typeof liveWidgets_ === 'function' ? liveWidgets_() : []);
}

/* A WIDGET CARD WAS FILLED ON A FINDER (790): once the fill is done its widgets are woken as a column's are (`widgetsWake_`) — what runs is kept, what is near starts, the rest waits. */
/* THE FINDER'S ID IS CAPTURED, because the timer runs outside every binding (`inFinder_`). */
const FINDER_WAKE = {};
function finderWake_(id) {
  if (FINDER_WAKE[id] || typeof widgetsWake_ !== 'function') return;
  FINDER_WAKE[id] = setTimeout(() => {
    FINDER_WAKE[id] = 0;
    if (AT !== id) return;
    const ws = finderWidgets_(id);
    if (!ws.length) return;
    widgetsWake_(ws, id, true);
    placeCells('y', true, 0, id);
  }, 0);
}

/* THE QUESTION, ON THE PAGE. § */
/* NAMED FOR WHAT IT WAS, not what it is. § */
/* BLOCKS FOR THE MENU CARD (`stuffQuestionBlocks_`), drawn by `renderCard`'s own block renderers; `stuffQuestion` is them as markup. */
function stuffQuestion() { return cardBlocks_(stuffQuestionBlocks_()); }
function stuffQuestionBlocks_() {
  /* SIGNED OUT, THE FIRST MENU IS WHO YOU ARE (`signMenu_`, find-account.js); Guest or a name lets the ordinary menus follow. */
  const sign = signMenu_();
  if (sign) return sign;
  /* UNDER Booking ALONE, THE MENU IS THE BOOKING STEP BEING ASKED (`bookMenu_`, find-account.js), and nothing once the summary card is the answer. */
  if (bookFindOn_()) return bookFindQuestion_();
  const pre = finderTagsAt_() || finderTagsLook_();
  if (pre) return [facetAnswersSpec_(pre.facet, pre.values)];
  const items = stuffFiltered();
  /* ---------- AN EMPTY FUNNEL SAID NOTHING AT ALL, WHICH IS THE WORST OF THE THREE ANSWERS § */
  /* AND WHEN THE WORDS ARE IN THE OTHER FINDER, SAYS SO — `stuffNoneHtml_`, one copy for both. */
  if (!items.length) return stuffNoneBlocks_();

  /* ---------- THE ORDINARY QUESTION FIRST, AND THE LAST RESORT BEHIND IT § */
  /* THE FRONT MENU IS ALWAYS ASKED (C+): one front answer (Settings, signed out) is still a menu, so every first screen is the same shape. */
  const facet = nextFacet(items) || overFacet_(items) || (!STUFF.filters.length ? facetBy('kindLabel') : null);
  if (!facet) {
    /* ---------- "NOTHING LEFT TO NARROW" WAS NOT TRUE, AND IT WAS THE LAST THING ON THE SCREEN § */
    /* AND WHEN A PAPER ENDED IT, IT SAYS SO. § */
    /* ---------- ONE CLASS FOR THE LAST LINE, NOT AN INLINE MARGIN ON EACH § */
    /* AND OVER THE BIBLE, WHICH VERSES — or why there is no question over its cover yet. */
    /* NO END LINE otherwise (owner, 9 Nov: "remove that text"): the cards under the chips say it. */
    return [bibleEnd_(items)].filter(Boolean);
  }

  /* ---------- EVERY ANSWER, IN THE ORDER EVERY OTHER QUESTION USES § */
  /* ---------- NOTHING IS TRIMMED HERE ANY MORE, BECAUSE NOTHING ARRIVES OVERSIZED § */
  const values = facetValues(items, facet);
  /* ---------- AND WHILE THE PAYLOAD IS ON ITS WAY, MORE ANSWERS ARE COMING § */
  const sw = scriptureWait_(items);
  return [facetAnswersSpec_(facet, values, [sw != null ? sw : typeof awaiting_ === 'function' && awaiting_() ? { type: 'wait', on: true } : ''])];
}
/* NO "SHOW SO FAR" ARROW (owner, 9 Nov: "remove it"): cards come when the menus finish (`findPeek_` went). */
/* THE OTHER HALF OF A YES-OR-NO, AT 0 (770), `facetNoneHtml_`, went: switched off since 5 Nov ("Accuracy verified 0" read as noise). */
/* ONE QUESTION'S ANSWERS AS CHIPS, whether counted now or by the build (`finderTagsAt_`): a choices block; `then` is the blocks after them. */
function facetAnswersHtml_(facet, values) { return cardBlock_(facetAnswersSpec_(facet, values)); }
function facetAnswersSpec_(facet, values, then) {
  /* `counted` TAKES THE CHEVRON OFF. § */
  /* ---------- "DOESN'T MATTER", UNDER EVERY QUESTION § */
  /* `counted` WITHOUT A COUNT, which is not a contradiction: § */
  const skip = { text: 'Doesn\'t matter', act: 'facet-skip', data: { field: facet.field }, look: 'is-skip' };
  /* THE "and N more" LINE WENT WITH THE TRIM. § */
  /* `data-value` IS THE FULL NAME (`filterHit` matches it); THE TEXT IS `show`, what tells it apart from the answers beside it, as
     its chip says it (1180: SATs said `Paper 1 · Maths · SATs · KS2`). */
  /* `.answers` IS WHAT MAKES THEM CHIPS ON A LINE rather than rows down the card — see the block of that name in style.css. § */
  /* ---------- A NUMBERED RUN IS A GRID — any facet whose answers are all bare numbers (396) § */
  const grid = numberedRun_(values);
  const opts = values.map(v => ({ text: v.show != null ? v.show : v.say != null ? v.say : answerSay_(facet, v.value), marked: true, act: 'facet-pick',
    data: Object.assign({ tag: tagOf_(facet.field), field: facet.field, value: v.value }, v.also && v.also.length ? { also: JSON.stringify(v.also) } : {}),
    label: grid ? facet.label + ' ' + runNumber_(v)[2] : '', look: facet.field === 'kindLabel' && frontSoonOnly_(v.value) ? 'is-off' : '' }));
  return { type: 'choices', rows: [{ look: grid ? 'is-grid' : '', options: opts.concat([skip]) }], then: then || [] };
}

/* `stuff-jump` went with the group list. § */

/* `paperish_` WAS HERE — "is this row actually an exam paper", by its `resource_type` or a paper
   number in its name. It chose between the exam cover and an ordinary card, and both callers went
   with the cover. */

/* ---------- `paperCard`, `openPaper_` AND `on('paper-read')` WERE ALL HERE § */

/* `stuffCount` was here. Removed with the line it fed — a function whose only caller has gone is
   the thing `check-dead.js` would name next time anyway. */

/* ---------- ONE DRAW FOR BOTH FINDERS § */
/* FIND'S MENU BEFORE THE PAYLOAD (1000): the build's own (FINDER_TAGS). */
setTimeout(() => { try { if (awaiting_() && SCREENS[FINDER.id]) paint(FINDER.id); } catch (e) { oops_(e, 'find:early'); } }, 0);
/* FIND'S MENU CARD AS DATA: drawn whole here, and its two slots (`#…-chips`, `#…-groups`) redrawn from the same spec by `findMenuFill_`. */
const findMenuSpec_ = (F, then) => ({ kind: 'menu', look: 'find-menu', name: 'Find', tags: filterChipTags_(), tagLook: 'chips', tagsKeep: true, tagsId: F.id + '-chips',
  body: [{ type: 'choices', id: F.id + '-groups', then: then || stuffQuestionBlocks_() }] });
/* A REPAINT FILLS THE SLOTS IN PLACE (the card is kept, so the pane's scroll and the name box stay): `then` is the menu's blocks, a wait while it is counted. */
function findMenuFill_(F, then) {
  const spec = findMenuSpec_(F, then), chips = $(spec.tagsId), groups = $(spec.body[0].id);
  if (chips) chips.innerHTML = renderTags(spec.tags, spec.tagLook, spec.tagsKeep);
  if (groups) groups.innerHTML = cardBlocks_(spec.body[0].then);
  return groups;
}
function finderScreen_() {
  const F = FINDER;
  /* THE LIBRARY STILL COMING (670): one wait, and no menu until every card is in, so the first answers shown are the last (546). */
  if (LIBRARY_LATE && !finderTagsAt_()) { PAGE_KEEP[F.id] = 1; return pages(F.id, [loading_()]); }
  const credits = USER ? (USER.credits || 0) : 0;
  /* The control must SAY what it is doing. § */
  const sel = (what, v) => STUFF[what] === v ? ' selected' : '';

  /* `#stuff-controls` MARKS THIS PAGE so the rest of the screen can find it. § */
  /* THE CREDITS STAY ON THE QUESTION and the way in and out does not — see `accountPages_`. A number
     is a fact about you and belongs beside the thing it is spent on; a button is a control and has
     earned a page of its own. */
  /* FIND IS CHIPS ONLY (owner, 8 Nov): no search box. `#stuff-clear` is the slot `paintStuff` rewrites with Clear-all. */
  const controls = `<div id="${F.id}-controls">`
    + `<div id="${F.id}-clear">${filterClear_()}</div>
    ${/* THE SORT WAS HERE — a dropdown offering A–Z and, when anything had a price, cheapest first. § */
          ''}
    ${/* THE MENU IS A CARD (owner, 14 Nov: one template): its tags the path chosen, its body the choices (`#…-chips`, `#…-groups` are the slots a repaint fills). */
      renderCard(findMenuSpec_(F))}
    ${/* SAVED IS NOT ON THIS PAGE AT ALL. It is the pages BEFORE this one — see `savedPages_`. */''}
    ${/* THE FINDER ITSELF TAKES A SUGGESTION TOO (494): "should be on finder widget too". */
      typeof suggestOpts_ === 'function' && tile_(suggestOpts_('finder', F.id, 'Find'))
        ? `<div class="tile-row rep-row find-sg">${tile_(suggestOpts_('finder', F.id, 'Find'))}</div>` : ''}
  </div>`;

  /* THE CONTROLS ARE A PAGE, and the results are the pages after it. § */
  /* Empty pages. `fillStuffPages` puts markup in the ones you can reach, after the screen exists
     — a page cannot be measured or moved until it is in the document. */
  /* ---------- BOOKING IS A THING YOU FIND § */
  /* WHAT YOU ARE PAYING FOR, THEN WHAT YOU KEPT, THEN THE QUESTION. The basket first because it is
     the one with a deadline on it — a thing you meant to buy and forgot is a worse outcome than a
     thing you meant to look at again. */
  /* ---------- WHAT IS PUT IN FRONT OF YOU, THE QUESTION, THEN WHAT YOU KEPT § */
  /* ---------- SPOTLIGHT WAS THE FIRST GROUP HERE AND IT IS A COLUMN NOW § */
  /* ---------- THE DRAW BUILDS THE WINDOW, NOT ONE EMPTY PAGE PER RESULT § */
  /* ---------- AND THE CARD YOU WERE ON, BY NAME, NOT BY NUMBER § */
  libPagesFresh_();
  const held = stuffHeld_();
  /* WHAT'S MISSING (526), above the question for an admin; counted after `held` was read off the page as it stood. */
  const lead = F.lead();
  finderLeadShift_(F, lead.length);
  const front = frontPages_();
  const keep = lead.length + 1 + front.length;
  const want = stuffPageCount();
  stuffBackTo_(held, keep);
  PAGE_KEEP[F.id] = keep;
  PAGE_LO[F.id] = stuffLo_(want, keep, PAGE_LO[F.id]);
  /* AND THE WINDOW IS FILLED A MOMENT LATER, because a page cannot be filled until it is in the document and `paint` writes the markup after this returns. § */
  /* `F` CAPTURED: the microtask runs after this binding has ended (`inFinder_`). */
  /* NOT WHEN THE BUILDER DRAWS IT (`AHEAD.running`, shell.js; docs/history/341). § */
  const ahead = typeof AHEAD !== 'undefined' && !!AHEAD.running;
  if (typeof queueMicrotask === 'function' && !ahead) {
    queueMicrotask(() => { try { inFinder_(F, () => {
      if (!$(F.id + '-controls')) return;
      fillStuffPages();
      if (stuffOnGlass_(F.id) && stuffBandFill_()) settle_(true);
    }); } catch (e) { /* a band redrawn mid-change settles on the next frame */ } });
  }
  /* `is-res` IS "A PAGE OF RESULTS". */
  return finderLeadHtml_(lead) + pages(F.id, [controls].concat(front))
    + '<section class="page is-res"><div class="pane"></div></section>'.repeat(Math.min(want, STUFF_WIN));
}
screen('stuff', () => inFinder_(FINDERS.stuff, finderScreen_));
/* THE `basket ‧ 2` LINK WENT WITH THE SHEET IT OPENED. The basket is the page in front of this one
   — one swipe, and the pager names it — so a control that jumps there is a shortcut to somewhere
   already visible. */

/* ---------- THE DOCKET § */
/* ---------- `x ` AS THE DONE MARKER CORRUPTED ANY LINE STARTING WITH AN X § */
const DOCK_DONE = /^-\s*\[\s*x\s*\]\s+/i;
const DOCK_OPEN = /^-\s*\[\s*\]\s+/;
const DOCK_OLD  = /^(x|\u2713)\s+/i;

function docketLines() {
  return String((USER && USER.todo) || '').split(/\r?\n/)
    .map(t => t.trim()).filter(Boolean)
    .map(t => {
      if (DOCK_DONE.test(t)) return { done: true,  text: t.replace(DOCK_DONE, '') };
      if (DOCK_OPEN.test(t)) return { done: false, text: t.replace(DOCK_OPEN, '') };
      /* THE OLD FORM, READ ONLY — tried last, so a new-style line can never reach it. */
      if (DOCK_OLD.test(t))  return { done: true,  text: t.replace(DOCK_OLD, '') };
      return { done: false, text: t };
    })
    /* A LINE THAT WAS NOTHING BUT A MARKER leaves an empty text, and an empty row is a row you
       cannot tick, delete or read. Dropped here rather than drawn. */
    .filter(l => l.text);
}

/* WRITTEN WITH THE BOX EVERY TIME, done or not. An undone line with no marker would read back
   correctly today, and then two forms would be in circulation and the next person would have to
   know that. One form out. */
const docketText = list =>
  list.map(l => (l.done ? '- [x] ' : '- [ ] ') + l.text).join('\n');

/* Kept in step on the phone first, then sent. A tick that waits for a round trip before moving is
   a tick that feels broken on a train — and this is a scrap of paper, not a payment. */
let dockTimer = null;
