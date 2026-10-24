/* @family. — arcade.js ONE FILE, SPLIT. § */


/* ---------- ARCADE § */
/* TWELVE function keys, not ten. § */
const CALC_KEYS = [
  ['sin(', 'sin', 'fn'], ['cos(', 'cos', 'fn'], ['tan(', 'tan', 'fn'], ['sqrt(', '√', 'fn'],
  ['^2', 'x²', 'fn'],    ['^', 'xʸ', 'fn'],     ['(', '(', 'fn'],      [')', ')', 'fn'],
  ['pi', 'π', 'fn'],     ['left', '◀', 'nav'],  ['right', '▶', 'nav'], ['del', '⌫', 'del'],
  /* ---------- THE KEY PUTS IN WHAT THE KEY SAYS § */
  ['7', '7', ''], ['8', '8', ''], ['9', '9', ''], ['\u00f7', '\u00f7', 'op'],
  ['4', '4', ''], ['5', '5', ''], ['6', '6', ''], ['\u00d7', '\u00d7', 'op'],
  ['1', '1', ''], ['2', '2', ''], ['3', '3', ''], ['\u2212', '\u2212', 'op'],
  ['0', '0', ''], ['.', '.', ''], ['C', 'C', 'op'], ['+', '+', 'op'],
  ['up', '▲', 'nav'], ['down', '▼', 'nav'], ['=', '=', 'eq'],
];

/* THE WIDGETS — nine things you USE rather than things you find. § */
/* TOOLS AND GAMES, AS COLUMNS THEY WERE ALREADY REACHABLE — `What for · Tools` and `What for · Games` are answers in the funnel and always have been. § */

/* ---------- WHAT THIS PERSON MAY OPEN § */
/* ---------- ONE LIST, ASKED BY BOTH THE RENDER AND THE COUNT § */
/* `admin` AND `tutor` ARE TWO FLAGS BECAUSE THEY ARE TWO AUDIENCES. § */
/* ---------- WHO MAY OPEN A WIDGET, ASKED IN ONE PLACE § */
/* AND `signedIn`, A THIRD AUDIENCE: § */
function widgetFor_(w) {
  if (!w) return false;
  if (w.admin && !(typeof isAdmin === 'function' && isAdmin())) return false;
  if (w.tutor && !(typeof isTutorRole === 'function' && isTutorRole())) return false;
  if (w.signedIn && !(typeof USER !== 'undefined' && USER)) return false;
  return true;
}

function widgetsOf_(kind) {
  return allWidgets()
    .filter(w => w.kind === kind)
    .filter(widgetFor_);
}

function widgetColumn_(kind) {
  return widgetsOf_(kind)
    /* ---------- THE WIDGET IS THE CARD. THERE IS NOTHING TO PRESS § */
    /* ---------- AND THE NAME IS PRINTED ONCE § */
    .map(w => widgetOnColumn_(w));
}

/* ---------- ONE WIDGET, ONE CARD, AND A STAR ON IT § */
const WIDGET_KEY = w => 'w:' + String(w.id);

/* NAMED FOR THE COLUMN, because `find.js` already has a `widgetCard_` and it is a different object: § */
/* ---------- AND UNTIL IT HAS STARTED, IT IS WAITING, AND IT LOOKS IT § */
function widgetOnColumn_(w) {
  const waits = typeof w.start === 'function' && typeof loading_ === 'function';
  return `<div class="card is-widget">
      ${typeof favTile_ === 'function'
        ? `<div class="tile-row wgt-keep">${favTile_({ key: WIDGET_KEY(w), kind: 'widget' })}</div>`
        : ''}
      <div class="widget-slot" id="wgt-${esc(String(w.id))}"${waits ? ' aria-busy="true"' : ''}>${
        w.html}${waits ? loading_() : ''}</div>
    </div>`;
}

/* ---------- THE SAVED COLUMN, WHICH THIS APP HAS HAD BEFORE § */
function savedWidgets_() {
  if (typeof isFav !== 'function') return [];
  /* THROUGH `widgetFor_`. A star outlives the role that made it — `FAVS` is kept on the device
     between payloads — so a flyer starred by an admin must not come back on the Saved column of
     whoever is signed in next. */
  /* `shop` TOO, since the basket moved there: a basket starred while it was a tool is the same
     `w:cart` key, and it would have dropped off Saved the day it changed column. */
  return allWidgets().filter(w => (w.kind === 'tool' || w.kind === 'game' || w.kind === 'shop')
                               && isFav(WIDGET_KEY(w)))
    .filter(widgetFor_);
}

function savedCards_() {
  /* SIGNED OUT THERE IS NO LIST, because `FAVS` is this device's and `savedPages_` has always said
     so. One sentence rather than an empty column — the `nothingHere` rule. */
  if (typeof USER === 'undefined' || !USER) {
    return [`<div class="card"><h3>Saved</h3><p class="note">Sign in and the things you star are
      kept here.</p></div>`];
  }
  const wgts = savedWidgets_().map(widgetOnColumn_);
  const rest = typeof savedPages_ === 'function' ? savedPages_() : [];
  /* ---------- A KEPT CARD IS DRAWN AS FIND DRAWS IT, NOT IN A BOX INSIDE THE PANE'S BOX § */
  /* ---------- AND WHAT IS STILL COMING IS NOT "NOTHING KEPT" § */
  const coming = (typeof awaiting_ === 'function' && awaiting_())
    || (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null && !LIBRARY_FAILED);
  const cards = wgts.concat(rest, coming ? [loading_()] : []);
  if (cards.length) return cards;
  return [`<div class="card"><h3>Saved</h3><p class="note">Nothing kept yet.<br>
    <span class="faint">Press <b>Save</b> on a tool, a game or anything you find and it turns up
    here.</span></p></div>`];
}

/* STARTED AND STOPPED LIKE THE OTHER TWO COLUMNS. A starred timer is a running timer, and a canvas
   loop behind a screen nobody is looking at is the flat battery `toolsStop_` already exists for. */
function savedStart_(arriving) {
  widgetsWake_(savedWidgets_(), 'saved', arriving);
}

/* ---------- AND THEN THEY ARE STARTED § */
/* ONE ENTRY PER WIDGET, NOT ONE PER COPY: § */
let TOOLS_ON = [];

/* WHOM A WIDGET WAS STARTED FOR — the person signed in, or nobody. § */
function widgetWho_() {
  try { return typeof USER !== 'undefined' && USER ? String(USER.personId || USER.name || '') : ''; }
  catch (e) { return ''; }
}

/* ---------- A PAINT DOES NOT THROW AWAY THE SLOT A WIDGET IS RUNNING IN § */
/* ---------- AND A DRAWING MADE FROM OLD FACTS, OR FOR SOMEBODY ELSE, GOES BACK UNDER ITS LOADER § */
/* ---------- AT A CHANGE OF PERSON, EVERY SLOT ON THE COLUMN — NOT THE NEW PERSON'S LIST § */
function widgetsReveilAll_(col) {
  const host = document.getElementById('s-' + col);
  if (!host) return [];
  const all = typeof allWidgets === 'function' ? allWidgets() : [];
  return [...host.querySelectorAll('.widget-slot[id^="wgt-"]')].map(slot => {
    const id = slot.id.slice(4);
    const w = all.find(x => String(x.id) === id);
    return w ? { w, slot } : null;
  }).filter(Boolean);
}
function widgetsReveil_(col, who) {
  if (WIDGET_COLS.indexOf(col) === -1 || typeof loading_ !== 'function') return;
  const me = widgetWho_();
  (who ? widgetsReveilAll_(col) : widgetsOn_(col).map(w => ({ w, slot: slotOn_(col, String(w.id)) }))).forEach(({ w, slot }) => {
    if (typeof w.start !== 'function' && typeof w.draw !== 'function') return;
    if (!slot || slot.getAttribute('aria-busy')) return;
    if (TOOLS_ON.some(e => e.slot === slot)) return;
    if (who ? slot.WHO === me : (w.pure || (slot.OWN !== undefined && slot.OWN === me))) return;
    slot.innerHTML = w.html + loading_();
    slot.setAttribute('aria-busy', 'true');
    delete slot.AHEAD;
    delete slot.WHO;
    delete slot.LENT;
    delete slot.OWN;
  });
}

/* `pre`: THE COLUMN STILL HOLDS THE BOOT'S MARKUP (`PRE_PAYLOAD`, shell.js) — then only a slot started after the
   payload landed is carried; one started before it drew without the payload and is started again (331). */
function widgetsHeld_(col, pre) {
  const who = widgetWho_();
  const run = TOOLS_ON.filter(e => e.col === col && e.slot && e.slot.isConnected && e.who === who && (!pre || e.slot.UP_PAID));
  /* AND EVERY SLOT DRAWN AHEAD FOR THIS PERSON BY A WIDGET THAT READS NO FACTS (`pure`) — its drawing cannot be stale, so it crosses the paint as it is, and keeps § */
  const pure = [];
  widgetsOn_(col).forEach(w => {
    if (!w.pure) return;
    const sl = slotOn_(col, String(w.id));
    if (sl && sl.AHEAD && sl.AHEAD.who === who && !run.some(e => e.slot === sl)) pure.push({ w, col, slot: sl, who });
  });
  return run.concat(pure);
}
function widgetsBack_(col, held) {
  held.forEach(e => {
    const fresh = slotOn_(col, String(e.w.id));
    if (fresh && fresh !== e.slot) fresh.replaceWith(e.slot);
  });
}

function toolsStart_(kind, arriving) {
  widgetsWake_(widgetsOf_(kind), kind === 'tool' ? 'tools' : kind === 'game' ? 'games' : kind, arriving);
}

/* WHICH WIDGETS A COLUMN HOLDS, by its id — the lists `toolsStart_` and `savedStart_` start from, asked by `widgetsGlass_` of a column beside the one in front. § */
const WIDGET_COLS = ['shop', 'tools', 'games', 'saved'];
function widgetsOn_(col) {
  if (col === 'saved') return savedWidgets_();
  if (col === 'tools') return widgetsOf_('tool');
  if (col === 'games') return widgetsOf_('game');
  if (col === 'shop') return widgetsOf_('shop');
  return [];
}

/* THE SLOT ON THAT COLUMN, NOT `$()`'s — the note on `widgetUp_` says why. § */
function slotOn_(col, id) {
  const host = col && document.getElementById('s-' + col);
  if (!host) return null;
  const want = 'wgt-' + id;
  try { return host.querySelector('#' + CSS.escape(want)); }
  catch (e) { return [...host.querySelectorAll('.widget-slot')].find(el => el.id === want) || null; }
}

/* ---------- ALL OF THEM STILL, BUT NOT ALL IN ONE TASK WHEN A COLUMN IS ARRIVED AT § */
/* `{ w, col }` still to start — on the column in front, or on a column beside it whose card is on the
   glass (`widgetsGlass_`). */
let TOOLS_WAIT = [];
let TOOLS_WAKE = 0;       // the booked step

/* ONE WAY A WIDGET STARTS, WHICHEVER OF THE THREE ASKS — this was written out three times, here, in `widgetsLater_` and in `widgetsNear_`, and the loader has to § */
/* ---------- AND ONE DRAWN AHEAD WITH NOTHING CHANGED SINCE IS ADOPTED, NOT STARTED § */
const WIDGET_UPS = {};
function widgetAdoptable_(w, slot) {
  const a = slot && slot.AHEAD;
  return !!(a && !w.stop && slot.isConnected && a.who === widgetWho_() && a.act === ACT_EPOCH
    && a.draw === DRAW_EPOCH && a.ups === (WIDGET_UPS[String(w.id)] || 0));
}
function widgetUp_(w, col) {
  const id = String(w.id);
  const slot = col ? slotOn_(col, id) : $('wgt-' + id);
  const adopt = widgetAdoptable_(w, slot);
  TOOLS_ON.push({ w, col, slot, who: widgetWho_() });
  if (slot && col) WIDGET_HOME[slot.id] = col;
  /* WHOM ITS DRAWING IS FOR, kept on the slot after the widget stops — see `widgetsReveil_`. And ANY other
     copy drawn ahead is no longer what this widget's state would draw (`WIDGET_UPS`). */
  /* AND NOT LENT ANY MORE (`LENT`, below): this copy is the one running now. */
  if (slot) { slot.WHO = widgetWho_(); delete slot.AHEAD; delete slot.LENT; slot.UP_PAID = typeof FIRST_PAINT_DONE !== 'undefined' && !!FIRST_PAINT_DONE; }
  WIDGET_UPS[id] = (WIDGET_UPS[id] || 0) + 1;
  try { if (!adopt && w.start) w.start(); }
  catch (e) { console.warn('[widget]', w.id, e); }
  finally {
    if (typeof loaded_ === 'function') {
      loaded_(slot);
      widgetCopies_(id).forEach(el => { if (el !== slot && widgetLit_(el)) { loaded_(el); el.LENT = true; } });
    }
  }
}

/* EVERY SLOT OF ONE WIDGET IN THE DOCUMENT — its own column's and Saved's — and whether the last
   placement left a slot's card on the glass (`GLASS.pages`, shell.js). */
function widgetCopies_(id) {
  return WIDGET_COLS.map(c => slotOn_(c, id)).filter(Boolean);
}
function widgetLit_(el) {
  try { return typeof GLASS !== 'undefined' && GLASS.pages.indexOf(el.closest('.page')) !== -1; } catch (e) { return false; }
}

/* AND STOPPED, the one way — its own `stop`, and `$` told the copy is nobody's now. */
function widgetDown_(e) {
  try { e.w.stop && e.w.stop(); } catch (err) {}
  if (e.slot && WIDGET_HOME[e.slot.id] === e.col) delete WIDGET_HOME[e.slot.id];
}

/* ---------- THE COLUMN IN FRONT: WHAT IT HOLDS IS STARTED, AND WHAT IS ALREADY RUNNING IS LEFT § */
function widgetsWake_(list, col, arriving) {
  const ids = new Set(list.map(w => String(w.id)));
  const keep = e => !ids.has(String(e.w.id)) || (arriving && e.col === col && e.slot && e.slot.isConnected);
  toolsStop_(keep, q => !ids.has(String(q.w.id)));
  const up = list.filter(w => !TOOLS_ON.some(e => String(e.w.id) === String(w.id)));
  if (!arriving) { up.forEach(w => widgetUp_(w, col)); return; }
  /* ARRIVING: WHAT WAS DRAWN AHEAD WITH NOTHING CHANGED IS ADOPTED NOW, every one of them — it costs nothing (`widgetUp_`). § */
  const veiled = w => { const sl = slotOn_(col, String(w.id)); return !sl || !!sl.getAttribute('aria-busy') || !!sl.LENT; };
  const adopt = up.filter(w => widgetAdoptable_(w, slotOn_(col, String(w.id))));
  adopt.forEach(w => widgetUp_(w, col));
  const rest = up.filter(w => adopt.indexOf(w) === -1);
  const now = rest.filter(w => veiled(w) && widgetDistance_(w, col) <= 1);
  now.forEach(w => widgetUp_(w, col));
  rest.filter(w => now.indexOf(w) === -1).forEach(w => TOOLS_WAIT.push({ w, col }));
  if (TOOLS_WAIT.length) widgetsLater_();
}

/* HOW MANY PAGES FROM ITS COLUMN'S OWN PAGE IN FRONT a widget's slot sits — read off the page that holds `#wgt-<id>` ON THAT COLUMN, which is what § */
function widgetDistance_(w, col) {
  try {
    const slot = slotOn_(col, String(w.id)), host = $('s-' + col);
    const pg = slot && slot.closest('.page');
    if (!pg || !host) return 0;
    const i = [...host.querySelectorAll(':scope > .page')].indexOf(pg);
    return i < 0 ? 0 : Math.abs(i - domIndex_(col, PAGE[col] || 0));
  } catch (e) { return 0; }
}

/* ON THE GLASS FIRST, THEN NEAREST ITS COLUMN'S PAGE IN FRONT — what is being looked at before what a
   swipe would bring. `GLASS.pages` is placeGrid's answer to which cards are on the glass. */
function widgetRank_(q) {
  let lit = false;
  try {
    const slot = slotOn_(q.col, String(q.w.id));
    lit = !!(slot && typeof GLASS !== 'undefined' && GLASS.pages.indexOf(slot.closest('.page')) !== -1);
  } catch (e) {}
  return (lit ? 0 : 1000) + widgetDistance_(q.w, q.col);
}

let TOOLS_BUSY_SINCE = 0;   // when `widgetsLater_` first found a finger down, for its cap
function widgetsLater_() {
  if (TOOLS_WAKE) return;
  TOOLS_WAKE = setTimeout(function step() {
    TOOLS_WAKE = 0;
    if (!TOOLS_WAIT.length) return;
    const now = performance.now();
    /* A FINGER DOWN AT ALL, NOT ONLY ONE WHOSE DIRECTION IS DECIDED: § */
    /* AND A COLUMN CHANGE NOT YET PLACED (`GLASS.at`). § */
    const busy = (typeof SETTLE_ON !== 'undefined' && SETTLE_ON && now < SETTLE_ON.until)
              || (typeof SWIPE !== 'undefined' && SWIPE.live)
              || (typeof SLIDE_UNTIL !== 'undefined' && now < SLIDE_UNTIL)
              || (typeof GLASS !== 'undefined' && GLASS.at !== AT);
    /* BUT NOT FOR EVER. A finger resting on the glass — or a `pointerup` the browser never sent — is `SWIPE.live` with nothing moving, and a column of widgets that § */
    if (busy && !(TOOLS_BUSY_SINCE && now - TOOLS_BUSY_SINCE > 1500)) {
      if (!TOOLS_BUSY_SINCE) TOOLS_BUSY_SINCE = now;
      TOOLS_WAKE = setTimeout(step, 60); return;
    }
    if (!busy) TOOLS_BUSY_SINCE = 0;
    /* EACH ASKED ONCE, NOT ONCE PER COMPARISON — a rank reads the column's pages. */
    const rank = new Map(TOOLS_WAIT.map(q => [q, widgetRank_(q)]));
    TOOLS_WAIT.sort((a, b) => rank.get(a) - rank.get(b));
    const next = TOOLS_WAIT.shift();
    /* ALREADY RUNNING — started meanwhile by `widgetsNear_` or an arrival — is left alone: one widget,
       one start, whichever of the three asked first. */
    if (!TOOLS_ON.some(e => String(e.w.id) === String(next.w.id))) {
      widgetUp_(next.w, next.col);
      /* A WIDGET BESIDE THE COLUMN IN FRONT GROWS ITS CARD AS IT DRAWS, and nothing re-centres a column that is not in front § */
      if (next.col !== AT && typeof placeCells === 'function') placeCells('y', true);
    }
    /* A GAP, NOT NOUGHT: `setTimeout(…, 0)` would queue the next start ahead of a touch that is
       already waiting to be delivered on a busy phone. One frame's worth is enough for it to land. */
    if (TOOLS_WAIT.length) TOOLS_WAKE = setTimeout(step, 16);
  }, 0);
}

/* AND A PAGE TURNED TO BEFORE ITS TURN CAME starts its widget NOW, with the ones either side of it — called by `goPage` before the column moves, so a tile that § */
/* IN THE RELEASE, ONLY A SLOT STILL UNDER ITS LOADER IS STARTED (the floor), and one drawn ahead with nothing changed is adopted, which costs nothing. § */
function widgetsNear_(col) {
  if (!TOOLS_WAIT.length) return;
  const now = TOOLS_WAIT.filter(q => {
    if (q.col !== col || widgetDistance_(q.w, col) > 1) return false;
    const sl = slotOn_(q.col, String(q.w.id));
    return !sl || !!sl.getAttribute('aria-busy') || !!sl.LENT || widgetAdoptable_(q.w, sl);
  });
  if (!now.length) return;
  TOOLS_WAIT = TOOLS_WAIT.filter(q => now.indexOf(q) === -1);
  now.forEach(q => { if (!TOOLS_ON.some(e => String(e.w.id) === String(q.w.id))) widgetUp_(q.w, q.col); });
}

/* STOPS EVERY RUNNING WIDGET `keep` DOES NOT KEEP, AND FORGETS EVERY WAITING ONE `wait` DOES NOT — with neither, everything, which is what this always did. § */
/* AND A QUEUE EMPTIED HERE FORGETS WHEN IT FIRST FOUND A FINGER DOWN. § */
function toolsStop_(keep, wait) {
  TOOLS_WAIT = wait ? TOOLS_WAIT.filter(wait) : [];
  if (!TOOLS_WAIT.length) {
    if (TOOLS_WAKE) { clearTimeout(TOOLS_WAKE); TOOLS_WAKE = 0; }
    TOOLS_BUSY_SINCE = 0;
  }
  const off = keep ? TOOLS_ON.filter(e => !keep(e)) : TOOLS_ON;
  TOOLS_ON = keep ? TOOLS_ON.filter(keep) : [];
  off.forEach(widgetDown_);
}

/* A WIDGET WHOSE CARD IS ON THE GLASS IS STARTED, WHICHEVER COLUMN IT IS IN § */
function widgetsGlass_(settled) {
  if (typeof GLASS === 'undefined' || !GLASS || GLASS.at !== AT) return;
  const lit = new Set(GLASS.pages);
  const glassy = (col, slot) => col !== AT && !!slot && slot.isConnected && lit.has(slot.closest('.page'));
  const front = new Set(WIDGET_COLS.indexOf(AT) !== -1 ? widgetsOn_(AT).map(w => String(w.id)) : []);
  /* THE COPIES ON THE GLASS BESIDE THE COLUMN IN FRONT, nearest it first — the order a starred
     widget's copy is chosen in. A widget with no `start` never waits and is not this file's to start. */
  const ti = TABS.findIndex(t => t.id === AT);
  const far = c => Math.abs(TABS.findIndex(t => t.id === c) - ti);
  const beside = new Map();
  GLASS.cols.filter(c => c !== AT && WIDGET_COLS.indexOf(c) !== -1)
    .sort((a, b) => far(a) - far(b) || TABS.findIndex(t => t.id === a) - TABS.findIndex(t => t.id === b))
    .forEach(col => widgetsOn_(col).forEach(w => {
      const id = String(w.id);
      if (typeof w.start !== 'function') return;
      const slot = slotOn_(col, id);
      if (!glassy(col, slot)) return;
      if (!beside.has(id)) beside.set(id, []);
      beside.get(id).push({ w, col });
    }));
  /* STOP WHAT HAS LEFT THE GLASS and forget what was waiting for it. A widget of the column in front
     stays while that column holds it; one beside it stays while its own copy is on the glass. */
  /* A SLOT THAT IS GONE is markup a paint replaced, and what ran in it is stopped; a widget the column
     in front started with no slot of its own at all (`savedStart_` signed out) is left as it was. */
  /* AND ONE BESIDE IT ONLY FOR WHOEVER IS SIGNED IN NOW — see the last point of the note above. */
  const who = widgetWho_();
  const keep = e => (e.col === AT ? front.has(String(e.w.id)) && (!e.slot || e.slot.isConnected)
                                  : glassy(e.col, e.slot) && e.who === who);
  const wait = q => (q.col === AT ? front.has(String(q.w.id)) : glassy(q.col, slotOn_(q.col, String(q.w.id))));
  /* THE WAITING ONES ARE FORGOTTEN NOW AND THE RUNNING ONES STOPPED AFTER THE SLIDE. § */
  if (!settled && TOOLS_ON.some(e => !keep(e))) afterSlide_(widgetsSettle_, 'glass');
  toolsStop_(settled ? keep : () => true, wait);
  /* AND QUEUE WHAT IS ON IT AND NOT RUNNING. § */
  beside.forEach((copies, id) => {
    /* ---------- AND A COPY OF A WIDGET RUNNING IN FRONT, DRAWN AGAIN BY THE BUILDER, IS NOT LEFT VEILED § */
    if (front.has(id)) {
      if (TOOLS_ON.some(e => String(e.w.id) === id && e.col === AT)) copies.forEach(c => {
        const sl = slotOn_(c.col, id);
        if (sl && sl.getAttribute('aria-busy') && typeof loaded_ === 'function') { loaded_(sl); sl.LENT = true; }
      });
      return;
    }
    if (TOOLS_ON.some(e => String(e.w.id) === id && keep(e))) {
      copies.forEach(c => { const sl = slotOn_(c.col, id); if (sl && sl.getAttribute('aria-busy') && typeof loaded_ === 'function') { loaded_(sl); sl.LENT = true; } });
      return;
    }
    if (TOOLS_WAIT.some(q => String(q.w.id) === id)) return;
    TOOLS_WAIT.push({ w: copies[0].w, col: copies[0].col });
  });
  if (TOOLS_WAIT.length) widgetsLater_();
}
/* THE SAME QUESTION ASKED AGAIN ONCE THE SLIDE HAS SETTLED, and this time what has left is stopped — and
   a starred widget whose copy left while its other copy stayed is queued on the one still there. */
function widgetsSettle_() { widgetsGlass_(true); }

/* EVERY WIDGET SLOT IS DRAWN BEFORE IT IS NEEDED — AND NOTHING RUNS FOR NOBODY § */
function aheadDrawWidget_(w, col) {
  const id = String(w.id);
  const slot = slotOn_(col, id);
  if (!slot || !slot.getAttribute('aria-busy')) return;
  const had = Object.prototype.hasOwnProperty.call(WIDGET_HOME, slot.id) ? WIDGET_HOME[slot.id] : undefined;
  WIDGET_HOME[slot.id] = col;
  let drawn = true;
  try { drawn = (typeof w.draw === 'function' ? w.draw() : w.start()) !== false; }
  catch (e) { drawn = false; try { console.warn('[widget ahead]', id, e); } catch (x) {} }
  finally { if (had === undefined) delete WIDGET_HOME[slot.id]; else WIDGET_HOME[slot.id] = had; }
  if (!drawn) { slot.NOAHEAD = true; return; }
  if (typeof loaded_ === 'function') loaded_(slot);
  delete slot.LENT;
  slot.AHEAD = { who: widgetWho_(), act: ACT_EPOCH, draw: DRAW_EPOCH, ups: WIDGET_UPS[id] || 0, pure: !!w.pure };
  slot.WHO = widgetWho_();
  /* AND ITS COLUMN PLACED AGAIN, NOW: a widget grows its card as it draws (`widgetsLater_`'s reason). */
  if (typeof placeOne_ === 'function') placeOne_(col);
}
/* THE BUILDER'S WIDGET JOBS — every slot `aheadDrawWidget_` may draw, with how far it is. § */
function aheadWidgetJobs_() {
  const out = [];
  const front = new Set(WIDGET_COLS.indexOf(AT) !== -1 ? widgetsOn_(AT).map(w => String(w.id)) : []);
  WIDGET_COLS.forEach(col => {
    if (col === AT || STALE[col] || !TABS.some(t => t.id === col)) return;
    const host = document.getElementById('s-' + col);
    if (!host || !host.firstElementChild) return;
    let pages = null;
    widgetsOn_(col).forEach(w => {
      const id = String(w.id);
      if (typeof w.start !== 'function' || (w.stop && typeof w.draw !== 'function')) return;
      if (front.has(id)) return;
      if (TOOLS_ON.some(e => String(e.w.id) === id) || TOOLS_WAIT.some(q => String(q.w.id) === id)) return;
      const slot = slotOn_(col, id);
      if (!slot || !slot.getAttribute('aria-busy') || slot.NOAHEAD) return;
      if (!pages) pages = [...host.querySelectorAll(':scope > .page')];
      const pos = pages.indexOf(slot.closest('.page'));
      const dp = pos < 0 ? 0 : Math.abs(logIndex_(col, pos) - (PAGE[col] || 0));
      out.push({ key: 'widget:' + col + ':' + id, kind: 'widget', d: aheadDist_(col, null) + Math.min(15, dp) / 16, pre: !!w.pure,
        run: () => aheadDrawWidget_(w, col) });
    });
  });
  return out;
}
AHEAD_KINDS.push(aheadWidgetJobs_);

/* ARRIVING AT A CARD STILL UNDER ITS LOADER: its widget is drawn before the slide, so the card comes in at the height it will keep — not short, then a jump (382). */
function widgetsBeforeSlide_(col) {
  if (WIDGET_COLS.indexOf(col) === -1) return;
  widgetsOn_(col).forEach(w => {
    const id = String(w.id);
    if (typeof w.start !== 'function' || (w.stop && typeof w.draw !== 'function')) return;
    if (TOOLS_ON.some(e => String(e.w.id) === id)) return;
    const slot = slotOn_(col, id);
    if (!slot || !slot.getAttribute('aria-busy') || slot.NOAHEAD || widgetDistance_(w, col) !== 0) return;
    aheadDrawWidget_(w, col);
  });
}


/* ---------- A WIDGET IS A SCREEN, NOT AN ITEM IN A LIST § */
screen('saved', () => pages('saved', savedCards_()));
/* THE SHOP WINDOW. Built like Saved and for the same reason — one card per thing, a pager that counts the same array the screen is built from, and a sentence § */
screen('spotlight', () => pages('spotlight', spotlightCards_()));
/* ---------- PROGRESS: A COLUMN WAITING TO BE BUILT, AND IT SAYS SO § */
/* ---------- YOUR JOURNEY, MOVED HERE FROM THE SETTINGS COLUMN § */
function mayJourney_() {
  if (typeof hasRole !== 'function') return false;
  return hasRole('student') || hasRole('admin');
}
function journeyCard_() {
  const prof = (USER && USER.profile) || {};
  /* `Math.round`, NOT `Math.ceil`: § */
  const days = iso => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return null;
    const t = new Date(+m[1], +m[2] - 1, +m[3]), now = new Date();
    return Math.round((t - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
  };
  const exams = [['Small exam', prof.exam_small_date], ['Big exam', prof.exam_big_date]]
    .map(([k, v]) => [k, days(v)]).filter(([, d]) => d !== null && d >= 0)
    .map(([k, d]) => `<div class="row"><span class="k">${esc(k)}</span><span>${d === 0 ? 'today'
      : d + (d === 1 ? ' day' : ' days') + ' to go'}</span></div>`).join('');
  return `<div class="card journey">
    <h3>Your journey</h3>
    <p class="sub">Where you are, where you are going, and what you have done on the way. Coming soon.</p>
    ${exams}
    <div class="row"><span class="k">Goals</span><span class="faint">what you are aiming for</span></div>
    <div class="row"><span class="k">Milestones</span><span class="faint">the steps on the way</span></div>
    <div class="row"><span class="k">Worked through</span><span class="faint">papers and topics you have done</span></div>
  </div>`;
}
/* THE EXAM DATES CHANGED UNDER THE COLUMN, so it is REDRAWN IF IT IS DRAWN — the rule `profileRefresh_` keeps for Settings, whose About you holds the same two § */
function progressRedraw_() {
  try {
    if (typeof screenHasMarkup_ === 'function' && !screenHasMarkup_('progress')) return;
    paint('progress');
    paintPager('progress', true);
  } catch (e) {}
}
function progressCards_() {
  if (mayJourney_()) return [journeyCard_()];
  return [`<div class="card">
    <h3>Progress</h3>
    <p class="sub">Coming soon: everything you have done in one place — the questions you have
      answered, what you got right, and what to work on next.</p>
    <p class="empty">Not built yet.</p>
  </div>`];
}
screen('progress', () => pages('progress', progressCards_()));
screen('tools', () => pages('tools', widgetColumn_('tool')));
screen('games', () => pages('games', widgetColumn_('game')));
