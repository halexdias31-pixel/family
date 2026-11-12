/* @family. — arcade.js ONE FILE, SPLIT. § */


/* ---------- ARCADE § */

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
  /* WHO SEES THIS (497, words.js): an admin's narrowing, asked after the code's own gates, which always win. */
  if (typeof seenOk_ === 'function' && !seenOk_(String(w.id))) return false;
  return true;
}

function widgetsOf_(kind) {
  /* THE LIST IS find.js's, which comes after the first screen (670): none yet. */
  if (typeof allWidgets !== 'function') return [];
  /* THE ADMIN'S LAYOUT FIRST (462, 463): which column each widget is on and in what order, else the code's (`layoutWidgets_`, layout.js). */
  if (typeof layoutWidgets_ === 'function') return layoutWidgets_(kind, allWidgets()).filter(widgetFor_);
  return allWidgets()
    .filter(w => w.kind === kind)
    .filter(widgetFor_);
}

/* A COLUMN'S PAGES: its widgets with each merged card's parts as one (480, `layoutMergeWidgets_`, layout.js) — what the pager counts. */
function widgetPagesOf_(kind) {
  const list = widgetsOf_(kind);
  return typeof layoutMergeWidgets_ === 'function' ? layoutMergeWidgets_(list) : list;
}
function widgetColumn_(kind) {
  /* ANY UNIT ON ANY COLUMN (710): once layout.js is here a widget column is drawn as every column is, its widgets and any card moved onto it (`cardsOf_`). */
  if (typeof cardsOf_ === 'function' && typeof LAYOUT_COL !== 'undefined' && LAYOUT_COL[kind]) return cardsOf_(LAYOUT_COL[kind]);
  return widgetPagesOf_(kind)
    /* ---------- THE WIDGET IS THE CARD. THERE IS NOTHING TO PRESS § */
    /* ---------- AND THE NAME IS PRINTED ONCE § */
    .map(w => widgetOnColumn_(w, true));
}

/* ---------- ONE WIDGET, ONE CARD, AND A STAR ON IT § */
const WIDGET_KEY = w => 'w:' + String(w.id);

/* NAMED FOR THE COLUMN, because `find.js` already has a `widgetCard_` and it is a different object: § */
/* ---------- AND UNTIL IT HAS STARTED, IT IS WAITING, AND IT LOOKS IT § */
/* `own` is its own column (not Saved): only there does an admin get the layout row (463, `layoutOpts_` in layout.js). */
function widgetOnColumn_(w, own) {
  if (w && w.parts) return widgetMergedOn_(w, own);
  const waits = typeof w.start === 'function' && typeof loading_ === 'function';
  const held = typeof gameLocked_ === 'function' && gameLocked_(w.id);
  /* ONE PLACE FOR A WIDGET'S TILES (472): title, content (its own tiles last), then one row — the star, the padlock, then the admin's layout tiles. */
  const keep = typeof favOpts_ === 'function'
    ? `<span class="tile-group wgt-keep">${tile_([favOpts_({ key: WIDGET_KEY(w), kind: 'widget' }),
      typeof gameLockOpts_ === 'function' ? gameLockOpts_(w.id) : null])}${
      typeof suggestOpts_ === 'function' ? tile_(suggestOpts_('widget', String(w.id), w.name || w.title || w.label || '')) : ''}</span>` : '';
  const lay = own === true && typeof layoutOpts_ === 'function' ? tileGroup_(layoutOpts_(w), 'is-admin wgt-admin') : '';
  return card_(`<div class="is-widget${held ? ' is-locked' : ''}">
      <div class="widget-slot" id="wgt-${esc(String(w.id))}" role="region" aria-label="${esc(String(w.name || w.id))}"${waits ? ' aria-busy="true"' : ''}>${
        typeof wordsIn_ === 'function' ? wordsIn_('w:' + String(w.id), w.html) : w.html}${waits ? loading_() : ''}</div>
      ${keep || lay ? `<div class="tile-row wgt-foot">${keep}${lay}</div>` : ''}
    </div>`, '', w.name || w.title || w.label || '');
}

/* A MERGED CARD (480): one frame, each part's own slot (started by its own widget), the lower titles as subheadings, one tile row — the top part's. */
function widgetMergedOn_(m, own) {
  const top = m.parts[0];
  const keep = typeof favOpts_ === 'function' ? `<span class="tile-group wgt-keep">${tile_([favOpts_({ key: WIDGET_KEY(top), kind: 'widget' }),
    typeof gameLockOpts_ === 'function' ? gameLockOpts_(top.id) : null])}${typeof suggestOpts_ === 'function' ? tile_(suggestOpts_('widget', String(top.id), top.name || top.title || top.label || '')) : ''}</span>` : '';
  const lay = own === true && typeof layoutOpts_ === 'function' ? tileGroup_(layoutOpts_(top), 'is-admin wgt-admin') : '';
  const parts = m.parts.map(w => {
    const waits = typeof w.start === 'function' && typeof loading_ === 'function';
    return `<div class="merged-part"><div class="widget-slot" id="wgt-${esc(String(w.id))}" role="region" aria-label="${esc(String(w.name || w.id))}"${waits ? ' aria-busy="true"' : ''}>${typeof wordsIn_ === 'function' ? wordsIn_('w:' + String(w.id), w.html) : w.html}${waits ? loading_() : ''}</div></div>`;
  }).join('');
  return card_(`<div class="is-widget is-merged" data-merged="${esc(m.parts.map(w => String(w.id)).join(' '))}">${parts}
      ${keep || lay ? `<div class="tile-row wgt-foot">${keep}${lay}</div>` : ''}
    </div>`, '', top.name || top.title || top.label || '');
}

/* ---------- THE SAVED COLUMN, WHICH THIS APP HAS HAD BEFORE § */
function savedWidgets_() {
  if (typeof isFav !== 'function') return [];
  /* THROUGH `widgetFor_`. A star outlives the role that made it — `FAVS` is kept on the device
     between payloads — so a flyer starred by an admin must not come back on the Saved column of
     whoever is signed in next. */
  /* `shop` TOO, since the basket moved there: a basket starred while it was a tool is the same
     `w:cart` key, and it would have dropped off Saved the day it changed column. */
  /* `reel` TOO (414): Videos and One more thing lead the Reels column now, and their stars are the same `w:` keys. */
  return allWidgets().filter(w => (w.kind === 'tool' || w.kind === 'game' || w.kind === 'shop' || w.kind === 'reel')
                               && isFav(WIDGET_KEY(w)))
    .filter(widgetFor_);
}

function savedCards_() {
  /* SIGNED OUT THERE IS NO LIST, because `FAVS` is this device's and `savedPages_` has always said
     so. One sentence rather than an empty column — the `nothingHere` rule. */
  if (typeof USER === 'undefined' || !USER) {
    return [emptyCard_('Saved')];
  }
  const wgts = savedWidgets_().map(widgetOnColumn_);
  const rest = typeof savedPages_ === 'function' ? savedPages_() : [];
  /* ---------- A KEPT CARD IS DRAWN AS FIND DRAWS IT, NOT IN A BOX INSIDE THE PANE'S BOX § */
  /* ---------- AND WHAT IS STILL COMING IS NOT "NOTHING KEPT" § */
  const coming = (typeof awaiting_ === 'function' && awaiting_())
    || (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null && !LIBRARY_FAILED);
  const cards = wgts.concat(rest, coming ? [loading_()] : []);
  if (cards.length) return cards;
  return [emptyCard_('Saved')];
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
    slot.innerHTML = w.html;
    waiting_(slot);
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
/* WHAT FOUND NO FRESH SLOT IS RETURNED: a finder fills its pages after its paint (790), so it keeps them in `WIDGET_HELD` for the fill (`stuffFillOne_`). */
const WIDGET_HELD = {};
function widgetsBack_(col, held) {
  return held.filter(e => {
    const fresh = slotOn_(col, String(e.w.id));
    if (fresh && fresh !== e.slot) fresh.replaceWith(e.slot);
    return !fresh;
  });
}

function toolsStart_(kind, arriving) {
  widgetsWake_(widgetsOf_(kind), kind, arriving);
}

/* ---------- A WIDGET THAT IS A FIND CARD (790): data/settings/widgets-in-find.json names a kind or an id, the id's row winning; before it comes, every tool and game ---------- */
const FIND_WIDGET_KINDS = ['tool', 'game', 'shop'];
/* A WIDGET THAT IS ITS OWN FIRST ANSWER IN FIND (batch B): a browsable thing gets a menu pill, not a column or a mini-app. */
const FIND_WIDGET_GROUPS = { videos: 'Videos', reels: 'Tools', newspaper: 'Tools', shopfind: 'Tools', flyers: 'Tools', poster: 'Tools', cart: 'Shop' };
function widgetInFind_(w) {
  if (!w) return false;
  const rows = (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.widgetsInFind)) ? DATA.widgetsInFind : null;
  if (!rows) return FIND_WIDGET_KINDS.indexOf(w.kind) !== -1;
  const said = rows.find(r => r.widget === String(w.id)) || rows.find(r => r.widget === w.kind);
  return !!said && /^(true|yes|1)$/i.test(String(said.find).trim());   /* a sheet's "FALSE" is a string, so truthiness would keep it */
}
/* EVERY WIDGET THAT IS A FIND CARD FOR THIS VIEWER, in the code's order; one an admin deleted (layout.js) is gone here too. */
function findWidgetList_() {
  let gone = [];
  try { const L = typeof layoutNow_ === 'function' ? layoutNow_() : null; gone = (L && L.deleted) || []; } catch (e) { gone = []; }
  return allWidgets().filter(w => widgetInFind_(w) && gone.indexOf(String(w.id)) === -1).filter(widgetFor_);
}
/* THE WIDGETS ON A FINDER: the slots its filled pages hold — Find fills only the pages near the glass, so a card not drawn yet has nothing to start. */
function finderWidgets_(col) {
  return widgetsReveilAll_(col).map(e => e.w).filter((w, i, a) => a.indexOf(w) === i).filter(widgetFor_);
}

/* WHICH WIDGETS A COLUMN HOLDS, by its id — the lists `toolsStart_` and `savedStart_` start from, asked by `widgetsGlass_` of a column beside the one in front. § */
/* `reel` (414): the widgets leading the Reels column, before the admin's "+" and the first reel (`reelLead_`, posts.js). */
/* `stuff` (790): the tools and games are Find cards, started and stopped as a column's are. */
const WIDGET_COLS = ['shop', 'stuff', 'saved', 'reel'];
function widgetsOn_(col) {
  if (col === 'saved') return savedWidgets_();
  if (col === 'reel') return widgetsOf_('reel');
  if (col === 'shop') return widgetsOf_('shop');
  if (col === 'stuff') return finderWidgets_(col);
  /* A WIDGET THE ADMIN MOVED ONTO A CARD COLUMN OR ONE OF THEIR OWN (710). */
  if (typeof layoutWidgetsIn_ === 'function' && typeof allWidgets === 'function') { const L = layoutNow_(); return L ? layoutWidgetsIn_(col, allWidgets(), L).filter(widgetFor_) : []; }
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
  catch (e) { oops_(e, 'widget:' + id, slot); }
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
/* MOVABLE SINCE 730: a card column like the profiles; the whole window is one unit (`spot:list`), moved by its first page's row. */
screen('spotlight', () => pages('spotlight', typeof cardsOf_ === 'function' ? cardsOf_('spotlight') : spotlightCards_()));
/* ---------- PROGRESS (435): ONE WIDGET PER THING, ONE LINE PER THING, EACH ITS TITLE ALONE WITH NOTHING TO SAY ---------- */
/* ---------- YOUR JOURNEY, MOVED HERE FROM THE SETTINGS COLUMN § */
/* A STUDENT'S CARD, AND THE ADMIN'S TO SEE IT — by rank (400), never the role string. */
function mayJourney_() {
  if (typeof rank_ !== 'function') return false;
  return rank_() === 'student' || isAdmin();
}
/* THE EXAM DATES CHANGED UNDER THE COLUMN, so it is REDRAWN IF IT IS DRAWN — the rule `profileRefresh_` keeps for Settings, whose About you holds the same two § */
function progressRedraw_() {
  try {
    /* COUNTDOWNS ARE A TOOLS WIDGET SINCE 466, for everyone; a date saved on About you repaints it there. */
    if (typeof paintCountdowns_ === 'function') paintCountdowns_();
    if (typeof screenHasMarkup_ === 'function' && !screenHasMarkup_('account')) return;
    paint('account');
    paintPager('account', true);
  } catch (e) {}
}

/* ---------- COUNTDOWNS ---------- */
/* WHEN EACH BIG EXAM SEASON STARTS, as MM-DD (or a whole YYYY-MM-DD for one year): the config tab's `exam_*_start` wins, these are the usual second week of May and mid-September. */
const PROG_EXAMS = [
  { id: 'sats', name: 'SATs', key: 'exam_sats_start', at: '05-11' },
  { id: 'elevenplus', name: '11+', key: 'exam_11plus_start', at: '09-12' },
  { id: 'gcse', name: 'GCSE exams', key: 'exam_gcse_start', at: '05-11' },
  { id: 'alevel', name: 'A-level exams', key: 'exam_alevel_start', at: '05-11' }];
/* SCHOOL HOLIDAYS WHEN THE SHEET'S `intervals` NAME NONE AHEAD: config `holiday_starts` ("MM-DD Name, …") wins; these are the usual London starts. */
const PROG_HOLIDAYS = '10-26 October half-term, 12-19 Christmas holidays, 02-13 February half-term, 03-27 Easter holidays, 05-22 May half-term, 07-22 Summer holidays';
const progressVars_ = () => { try { return (DATA && DATA.constants && DATA.constants.vars) || {}; } catch (e) { return {}; } };
const progressToday_ = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
const progressDaysTo_ = d => Math.round((d - progressToday_()) / 864e5);
/* THE NEXT TIME `MM-DD` (or a fixed YYYY-MM-DD) COMES ROUND, today included; `year` asks for that year's. */
function progressWhen_(spec, year) {
  const s = String(spec || '').trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = /^(\d{1,2})-(\d{1,2})$/.exec(s);
  if (!m) return null;
  const t = progressToday_();
  let d = new Date(year || t.getFullYear(), +m[1] - 1, +m[2]);
  if (!year && d < t) d = new Date(t.getFullYear() + 1, +m[1] - 1, +m[2]);
  return d;
}
const progressExamAt_ = (e, year) => progressWhen_(String(progressVars_()[e.key] || '').trim() || e.at, year)
  || progressWhen_(e.at, year);
/* THE SCHOOL YEAR OFF A DATE OF BIRTH (England): Year N is N + 4 on the 1st of September the year began. */
function progressSchoolYear_(dob) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dob || ''));
  if (!m) return null;
  const t = progressToday_();
  const began = t.getMonth() >= 8 ? t.getFullYear() : t.getFullYear() - 1;
  let age = began - +m[1];
  if (+m[2] > 9 || (+m[2] === 9 && +m[3] > 1)) age--;
  const y = age - 4;
  return y >= 1 && y <= 13 ? { year: y, began: began } : null;
}
/* THE ONE BIG EXAM AHEAD: off the school year when there is a birthday, else off the level of a session booked. */
function progressBigExam_() {
  const prof = (USER && USER.profile) || {};
  const sy = progressSchoolYear_(prof.date_of_birth);
  const E = id => PROG_EXAMS.find(e => e.id === id);
  const t = progressToday_();
  if (sy) {
    const y = sy.year, began = sy.began;
    if (y >= 12) return { e: E('alevel'), d: progressExamAt_(E('alevel'), began + (13 - y) + 1) };
    if (y >= 7) return { e: E('gcse'), d: progressExamAt_(E('gcse'), began + (11 - y) + 1) };
    if (y === 6) {
      const eleven = progressExamAt_(E('elevenplus'), began);
      if (eleven && eleven >= t) return { e: E('elevenplus'), d: eleven };
      return { e: E('sats'), d: progressExamAt_(E('sats'), began + 1) };
    }
    if (y >= 3) return { e: E('elevenplus'), d: progressExamAt_(E('elevenplus'), began + (6 - y)) };
    return null;
  }
  const lv = (typeof myJobs_ === 'function' ? myJobs_() : []).map(j => String(j.level || '')).join(' ');
  const id = /a-?level/i.test(lv) ? 'alevel' : /gcse/i.test(lv) ? 'gcse' : /11\s*\+|eleven/i.test(lv) ? 'elevenplus' : /sats|ks2/i.test(lv) ? 'sats' : '';
  return id ? { e: E(id), d: progressExamAt_(E(id)) } : null;
}
/* THE NEXT HOLIDAY: a holiday row of the sheet's `intervals` ahead, else the day after a term ends, else `holiday_starts`. */
function progressHoliday_() {
  const t = progressToday_();
  const ivs = (DATA && DATA.intervals) || [];
  const at = [];
  ivs.forEach(x => {
    const from = typeof parseDMY === 'function' ? parseDMY(x.startDate) : null, to = typeof parseDMY === 'function' ? parseDMY(x.endDate) : null;
    if (/holiday|half/i.test(String(x.kind || '')) && from && from >= t) at.push({ name: x.label || x.term || 'Holiday', d: from });
    else if (to) { const n = new Date(to.getTime()); n.setDate(n.getDate() + 1); if (n >= t) at.push({ name: 'Holiday after ' + (x.label || x.term || 'term'), d: n }); }
  });
  if (!at.length) {
    const list = String(progressVars_().holiday_starts || '').trim() || PROG_HOLIDAYS;
    list.split(',').forEach(bit => {
      const m = /^\s*(\d{1,2}-\d{1,2}|\d{4}-\d{2}-\d{2})\s+(.+?)\s*$/.exec(bit);
      const d = m && progressWhen_(m[1]);
      if (d) at.push({ name: m[2], d: d });
    });
  }
  at.sort((a, b) => a.d - b.d);
  return at[0] || null;
}
const progressDaysSaid_ = n => (n === 0 ? 'today' : n + (n === 1 ? ' day' : ' days'));
/* THE ROWS, for anyone (466): the next holiday needs no account; the exam dates are your own when signed in. */
function progressCountdownRows_() {
  const rows = [];
  if (typeof USER !== 'undefined' && USER) {
    const prof = USER.profile || {};
    /* THE TWO DATES TYPED ON ABOUT YOU, for a student or an admin, as before (`mayJourney_`). */
    if (mayJourney_()) {
      [['Small exam', prof.exam_small_date], ['Big exam', prof.exam_big_date]].forEach(([k, v]) => {
        const d = progressWhen_(/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? v : '');
        if (d && progressDaysTo_(d) >= 0) rows.push([k, progressDaysTo_(d)]);
      });
    }
    const big = progressBigExam_();
    if (big && big.d && progressDaysTo_(big.d) >= 0) rows.push([big.e.name, progressDaysTo_(big.d)]);
  }
  const hol = progressHoliday_();
  if (hol) rows.push([hol.name, progressDaysTo_(hol.d)]);
  return rows;
}
/* ---------- THE COUNTDOWNS WIDGET ON TOOLS (466): every copy by class, as the Saved column draws it too ---------- */
/* DAYS TO GO BY DEFAULT; one tile shows each one's date instead (a safe press, owner 12 Nov). */
let CD_DATES = false;
function paintCountdowns_() {
  const rows = progressCountdownRows_();
  const when = n => { const d = progressToday_(); d.setDate(d.getDate() + n); return esc(day_(d) + ' ' + date_(d)); };
  document.querySelectorAll('.cd-box').forEach(box => {
    box.innerHTML = (rows.length ? rows.map(([k, n]) => `<div class="row"><span class="k">${esc(k)}</span><span class="v">${CD_DATES ? when(n) : progressDaysSaid_(n)}</span></div>`).join('')
      : '<p class="note">Nothing to count down to yet.</p>')
      + (rows.length ? `<div class="tile-row">${tile_({ icon: CD_DATES ? 'speed' : 'table', label: CD_DATES ? 'Days' : 'Dates', note: CD_DATES ? 'how many to go' : 'the day itself', act: 'cd-dates', pressed: CD_DATES })}</div>` : '');
  });
}
on('cd-dates', () => { CD_DATES = !CD_DATES; paintCountdowns_(); });

/* ---------- TERM DATES (491): THE YEAR AS INTERVALS — terms, half-terms and holidays, each with its real first and last day ---------- */
/* The usual England pattern, the backend's `schoolYear` (booking.gs) in the browser: a term runs Monday to Friday, a holiday Saturday to Sunday. */
function tdYear_(y) {
  const D = (yy, m, d) => new Date(yy, m, d), add = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const nth = (yy, mo, wd, n) => {
    if (n > 0) { const d = D(yy, mo, 1); return add(d, ((wd - d.getDay() + 7) % 7) + 7 * (n - 1)); }
    const d = D(yy, mo + 1, 0); return add(d, -((d.getDay() - wd + 7) % 7));
  };
  const easter = yy => {
    const a = yy % 19, b = Math.floor(yy / 100), c = yy % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return D(yy, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
  };
  let autumn = nth(y, 8, 1, 1); if (autumn.getDate() <= 2) autumn = add(autumn, 3);
  const octMon = nth(y, 9, 1, -1), octHalf = octMon.getDate() + 4 > 31 ? add(octMon, -7) : octMon;
  const decFri = nth(y, 11, 5, -1), xmas = decFri.getDate() > 22 ? add(decFri, -7) : decFri;
  let jan = D(y + 1, 0, 2); while (jan.getDay() === 0 || jan.getDay() === 6) jan = add(jan, 1);
  const feb = nth(y + 1, 1, 1, 3), easStart = add(easter(y + 1), -6), easEnd = add(easStart, 11), may = nth(y + 1, 4, 1, -1), jul = nth(y + 1, 6, 5, 3);
  const terms = [['Autumn 1', autumn, add(octHalf, -3)], ['Autumn 2', add(octHalf, 7), xmas], ['Spring 1', jan, add(feb, -3)],
    ['Spring 2', add(feb, 7), add(easStart, -3)], ['Summer 1', add(easEnd, 3), add(may, -3)], ['Summer 2', add(may, 7), jul]];
  const hols = [['October half-term', 'half'], ['Christmas holidays', 'holiday'], ['February half-term', 'half'], ['Easter holidays', 'holiday'], ['May half-term', 'half']];
  const out = [];
  terms.forEach((t, i) => {
    out.push({ name: t[0], kind: 'term', from: t[1], to: t[2] });
    if (i < hols.length) out.push({ name: hols[i][0], kind: hols[i][1], from: add(t[2], 1), to: add(terms[i + 1][1], -1) });
  });
  out.push({ name: 'Summer holidays', kind: 'holiday', from: add(jul, 1), to: add(tdYear0_(y + 1), -1) });
  return out;
}
/* THE FIRST DAY OF A YEAR'S AUTUMN TERM, which ends the summer before it. */
function tdYear0_(y) { let d = new Date(y, 8, 1); d = new Date(y, 8, 1 + ((8 - d.getDay()) % 7)); return d.getDate() <= 2 ? new Date(y, 8, d.getDate() + 3) : d; }
/* MY SCHOOL (491): starts and ends a few school days earlier or later, kept on this phone for whoever is signed in. */
const tdKey_ = () => 'familyTermShift:' + ((typeof USER !== 'undefined' && USER && USER.personId) || 'anon');
function tdShift_() { try { const o = JSON.parse(localStorage.getItem(tdKey_()) || 'null'); return { s: +(o && o.s) || 0, e: +(o && o.e) || 0 }; } catch (e) { return { s: 0, e: 0 }; } }
/* N SCHOOL DAYS ON from a weekday, weekends skipped, so a shift never lands a first day on a Saturday. */
function tdSchoolDays_(d, n) { let x = new Date(d.getTime()); const st = n < 0 ? -1 : 1; for (let k = Math.abs(n); k > 0;) { x.setDate(x.getDate() + st); if (x.getDay() % 6) k--; } return x; }
function termDatesRows_(today) {
  const t = today || progressToday_(), y = t.getMonth() >= 7 ? t.getFullYear() : t.getFullYear() - 1, sh = tdShift_();
  const all = tdYear_(y - 1).concat(tdYear_(y), tdYear_(y + 1)).map(x => Object.assign({}, x));
  all.forEach((x, i) => {
    if (x.kind !== 'term') return;
    if (sh.s) { x.from = tdSchoolDays_(x.from, sh.s); if (all[i - 1]) all[i - 1].to = new Date(x.from.getFullYear(), x.from.getMonth(), x.from.getDate() - 1); }
    if (sh.e) { x.to = tdSchoolDays_(x.to, sh.e); if (all[i + 1]) all[i + 1].from = new Date(x.to.getFullYear(), x.to.getMonth(), x.to.getDate() + 1); }
  });
  const i = all.findIndex(x => x.from <= t && t <= x.to);
  return all.slice(Math.max(0, i), Math.max(0, i) + (TD_MORE ? 10 : 4)).map((x, k) => Object.assign(x, { now: k === 0 && i >= 0 }));
}
const tdDay_ = d => day_(d) + ' ' + date_(d);
/* A TERM SAYS ITS FIRST AND LAST DAY OF TERM; A BREAK SAYS WHEN IT STARTS AND THE FIRST DAY BACK — never "ends" on a Sunday. */
function tdLine_(x) {
  const back = new Date(x.to.getFullYear(), x.to.getMonth(), x.to.getDate() + 1);
  while (back.getDay() % 6 === 0) back.setDate(back.getDate() + 1);
  const v = x.kind === 'term' ? `${tdDay_(x.from)} – last day of term ${tdDay_(x.to)}` : `from ${tdDay_(x.from)} · first day back ${tdDay_(back)}`;
  return `<div class="row td-${x.kind}${x.now ? ' td-now' : ''}"><span class="k">${x.now ? 'Now: ' : ''}${esc(x.name)}</span><span class="v">${esc(v)}</span></div>`;
}
/* THE NEXT FOUR BY DEFAULT; one tile shows the rest of the year ahead too (owner, 12 Nov: a safe press on every tool). */
let TD_MORE = false;
function paintTermDates_() {
  const rows = termDatesRows_(), sh = tdShift_();
  const adj = (id, v, label) => `<div class="row"><span class="k">${label}</span><span class="v"><select class="td-adj" data-td="${id}" aria-label="${label}">${
    [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(n => `<option value="${n}"${n === v ? ' selected' : ''}>${n ? (n > 0 ? n + ' later' : -n + ' earlier') : 'as usual'}</option>`).join('')}</select></span></div>`;
  document.querySelectorAll('.td-box').forEach(box => {
    box.removeAttribute('aria-busy');
    box.innerHTML = rows.map(tdLine_).join('')
      + adj('s', sh.s, 'My school starts') + adj('e', sh.e, 'My school ends')
      + `<div class="tile-row">${tile_({ icon: TD_MORE ? 'up' : 'down', label: TD_MORE ? 'Fewer' : 'Later', note: TD_MORE ? 'the next four' : 'the year ahead', act: 'td-more' })}</div>`;
  });
}
on('td-more', () => { TD_MORE = !TD_MORE; paintTermDates_(); });
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('.td-adj');
  if (!el) return;
  const o = tdShift_(); o[el.dataset.td] = Number(el.value) || 0;
  try { localStorage.setItem(tdKey_(), JSON.stringify(o)); } catch (x) {}
  paintTermDates_();
});

/* ---------- WHAT WAS ANSWERED ---------- */
/* THE LATEST PRESS PER QUESTION: the account's (`DATA.submissions`, this person's only) and this device's (`subAll_`), the later winning, as `subAdopt_` decides. */
function progressPresses_() {
  const who = typeof whoIs_ === 'function' ? whoIs_() : '';
  if (!who) return [];
  const pid = USER && USER.personId ? String(USER.personId) : '';
  const out = {};
  try {
    const s = DATA && DATA.submissions;
    if (pid && s && String(s.for || '') === pid && s.mine && typeof s.mine === 'object') {
      Object.keys(s.mine).forEach(k => {
        const e = s.mine[k];
        if (e && String(e.answer || '').trim()) out[k] = { v: String(e.verdict || ''), at: Number(e.at) || 0 };
      });
    }
  } catch (e) {}
  try {
    const all = typeof subAll_ === 'function' ? subAll_(who) : {};
    Object.keys(all).forEach(k => {
      const e = all[k];
      if (!e || typeof e.a !== 'string' || !e.a.trim()) return;
      const at = Number(e.at) || 0;
      if (!out[k] || out[k].at <= at) out[k] = { v: String(e.v || ''), at: at };
    });
  } catch (e) {}
  return Object.keys(out).map(k => ({ key: k, v: out[k].v, at: out[k].at }));
}
/* A VERDICT AS MARKS — SUBMISSION_VERDICT's vocabulary; `sent` is attempted and not marked, so it counts as tried and never as right or wrong. */
function progressScore_(v) {
  if (v === 'right') return { got: 1, of: 1 };
  if (v === 'wrong') return { got: 0, of: 1 };
  const m = /^(?:ai|rule):(\d{1,3})\/(\d{1,3})$/.exec(String(v || ''));
  return m && +m[2] > 0 ? { got: Math.min(+m[1], +m[2]), of: +m[2] } : null;
}
const progressDay_ = ms => { const d = new Date(ms); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
const progressPaperOf_ = x => String((x && x.row && x.row.paper_id) || (x && x.sub) || '');
/* WHICH SERIES A QUESTION BELONGS TO: past papers by subject; worksheets by who made them and subject. */
function progressSeries_(x) {
  const type = String(x.documentType || (x.row && x.row.document_type) || ''), subj = String(x.subject || '');
  const co = String(x.company || (x.row && x.row.company) || '');
  if (/past|specimen/i.test(type)) return (subj ? subj + ' ' : '') + 'past papers';
  if (/5-a-day/i.test(type)) return (co ? co + ' ' : '') + '5-a-day';
  return [co, co.toLowerCase().indexOf(subj.toLowerCase()) === -1 ? subj : '', /exercise/i.test(type) ? 'exercises' : 'worksheets'].filter(Boolean).join(' ');
}
/* EVERYTHING THE COLUMN SAYS, counted once per draw. A key the library does not hold still counts in the totals; it has no topic or paper to file under. */
function progressStats_() {
  const presses = progressPresses_();
  const index = new Map();
  let items = [];
  try { items = (typeof stuffItemsAll_ === 'function' ? stuffItemsAll_() : []) || []; } catch (e) { items = []; }
  items.forEach(x => { if (x && x.kind === 'question') index.set(String(x.key || x.name), x); });
  const topics = {}, days = {}, papers = {};
  let right = 0, got = 0, of = 0;
  const recent = [];
  presses.forEach(p => {
    const x = index.get(p.key.replace(/#[^#]*$/, ''));
    const sc = progressScore_(p.v);
    const ok = !!(sc && sc.got === sc.of);
    if (sc) { got += sc.got; of += sc.of; if (ok) right++; }
    if (p.at > 0) { const d = progressDay_(p.at); days[d] = (days[d] || 0) + 1; }
    recent.push({ x: x, p: p, sc: sc, ok: ok });
    if (!x) return;
    const pid = progressPaperOf_(x);
    if (pid) {
      const pp = papers[pid] || (papers[pid] = { id: pid, x: x, done: {}, got: 0, of: 0, at: 0 });
      pp.done[String(x.key || x.name)] = sc || { sent: 1 };
      if (sc) { pp.got += sc.got; pp.of += sc.of; }
      if (p.at > pp.at) pp.at = p.at;
    }
    let ts = Array.isArray(x.topic) ? x.topic : topicAtoms_(x.topic || (x.row && x.row.topics) || '');
    if (!ts.length) ts = [String(x.subject || 'Other')];
    ts.forEach(t => {
      const o = topics[t] || (topics[t] = { topic: t, n: 0, right: 0, marked: 0, got: 0, of: 0, miss: null });
      o.n++;
      if (sc) { o.marked++; o.got += sc.got; o.of += sc.of; if (ok) o.right++; else if (!o.miss || p.at > o.miss.at) o.miss = { key: p.key, at: p.at }; }
    });
  });
  recent.sort((a, b) => b.p.at - a.p.at);
  /* THE STREAK: days in a row with a press, ending today — or yesterday, so a streak is not lost before today's first question. */
  let streak = 0;
  const t0 = new Date(); t0.setHours(12, 0, 0, 0);
  for (let i = days[progressDay_(t0.getTime())] ? 0 : 1; i < 400; i++) {
    if (!days[progressDay_(t0.getTime() - i * 864e5)]) break;
    streak++;
  }
  let week = 0, weekDays = 0;
  for (let i = 0; i < 7; i++) { const n = days[progressDay_(t0.getTime() - i * 864e5)] || 0; week += n; if (n) weekDays++; }
  const list = Object.keys(topics).map(k => topics[k]).sort((a, b) => b.n - a.n || a.topic.localeCompare(b.topic));
  const weak = list.filter(o => o.of > 0 && o.got < o.of)
    .sort((a, b) => a.got / a.of - b.got / b.of || b.of - a.of || a.topic.localeCompare(b.topic)).slice(0, 3);
  /* EVERY PAPER'S WHOLE LIST OF QUESTIONS, so a paper says what is left — and each series how many papers nobody has started. */
  const inPaper = {}, inSeries = {};
  const started = new Set(Object.keys(papers));
  items.forEach(x => {
    if (!x || x.kind !== 'question') return;
    const pid = progressPaperOf_(x);
    if (!pid) return;
    (inPaper[pid] = inPaper[pid] || []).push(x);
    const sr = progressSeries_(x);
    (inSeries[sr] = inSeries[sr] || new Set()).add(pid);
  });
  const series = {};
  Object.keys(papers).forEach(pid => {
    const pp = papers[pid];
    pp.all = (inPaper[pid] || [pp.x]).slice().sort((a, b) => String(a.qNumber || a.name).localeCompare(String(b.qNumber || b.name), undefined, { numeric: true })
      || String(a.qPart || '').localeCompare(String(b.qPart || '')));
    const sr = progressSeries_(pp.x);
    (series[sr] = series[sr] || { name: sr, papers: [], at: 0 }).papers.push(pp);
    if (pp.at > series[sr].at) series[sr].at = pp.at;
  });
  const seriesList = Object.keys(series).map(k => {
    const sr = series[k];
    sr.papers.sort((a, b) => b.at - a.at);
    sr.untouched = [...(inSeries[k] || [])].filter(pid => !started.has(pid)).length;
    return sr;
  }).sort((a, b) => b.at - a.at);
  return { n: presses.length, right: right, got: got, of: of, topics: list, weak: weak, papers: papers,
           series: seriesList, recent: recent.slice(0, 3), streak: streak, week: week, weekDays: weekDays };
}
const progressPct_ = (a, b) => (b > 0 ? Math.round(100 * a / b) : 0);
function progressAnsweredCard_(st) {
  if (!st.n) return emptyCard_('Questions');
  const rows = st.topics.slice(0, 12).map(o => `<div class="prog-topic">
      <div class="row"><span class="k">${esc(o.topic)}</span><span class="v">${o.marked ? o.right + ' of ' + o.marked + ' right' : o.n + ' tried'}</span></div>
      <div class="prog-bar" aria-hidden="true"><span style="width:${o.marked ? progressPct_(o.right, o.marked) : 0}%"></span></div>
    </div>`).join('');
  return card_(`<div class="prog-answered">
    <h3>Questions</h3>
    <div class="row prog-tot"><span class="k">Answered</span><span class="v">${st.n}</span></div>
    <div class="row prog-tot"><span class="k">Right</span><span class="v">${st.right}</span></div>
    <div class="row prog-tot"><span class="k">Marks</span><span class="v">${st.of ? st.got + ' of ' + st.of + ' (' + progressPct_(st.got, st.of) + '%)' : 'none marked yet'}</span></div>
    ${rows}
  </div>`);
}
function progressActivityCard_(st) {
  if (!st.n) return emptyCard_('Recent activity');
  const said = p => !p.sc ? 'sent' : p.ok ? 'right' : p.sc.of > 1 ? p.sc.got + '/' + p.sc.of : 'wrong';
  const last = st.recent.map(r => `<div class="row"><span class="k">${esc((r.x && (r.x.sub ? r.x.sub + ' · ' : '') + (r.x.name || '')) || 'A question')}</span>
      <span class="v prog-v${r.ok ? ' is-good' : r.sc ? ' is-bad' : ''}">${esc(said(r))}</span></div>`).join('');
  return card_(`<div class="prog-activity">
    <h3>Recent activity</h3>
    <div class="row"><span class="k">Streak</span><span class="v">${st.streak ? progressDaysSaid_(st.streak) : 'none yet'}</span></div>
    <div class="row"><span class="k">Last 7 days</span><span class="v">${st.week} on ${progressDaysSaid_(st.weekDays)}</span></div>
    ${last}
  </div>`);
}
function progressWeakCard_(st) {
  if (!st.weak.length) return emptyCard_('Work on next');
  const items = st.weak.map(o => `<div class="prog-weak">
      <div class="row"><span class="k">${esc(o.topic)}</span><span class="v">${progressPct_(o.got, o.of)}% of marks</span></div>
      <div class="tile-row">${tile_({ icon: 'search', label: 'Practise', note: o.topic + ' in Find', act: 'prog-practise',
        data: { topic: o.topic, key: (o.miss && o.miss.key) || '' } })}</div>
    </div>`).join('');
  return card_(`<div class="prog-weakest">
    <h3>Work on next</h3>
    ${items}
  </div>`);
}

/* ---------- PROGRESS IN A FIELD: ONE CARD PER SERIES, ONE LINE PER PAPER, OPENED IN PLACE ---------- */
/* WHICH PAPERS ARE OPEN, so a redraw does not shut what was opened (no pop-up: a <details> grows the line where it is). */
const PROG_OPEN = new Set();
document.addEventListener('toggle', e => {
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('prog-paper')) return;
  const k = el.getAttribute('data-paper') || '';
  if (el.open) PROG_OPEN.add(k); else PROG_OPEN.delete(k);
}, true);
function progressPaperName_(x) {
  return String((x.row && x.row.name) || x.sub || x.name || 'A paper');
}
function progressSeriesCard_(sr) {
  const lines = sr.papers.slice(0, 15).map(pp => {
    const total = pp.all.length, done = Object.keys(pp.done).length, left = Math.max(0, total - done);
    const sums = (pp.of ? pp.got + '/' + pp.of + ' marks · ' : '') + (left ? left + ' left' : 'all done');
    const qs = pp.all.map(q => {
      const k = String(q.key || q.name), sc = pp.done[k];
      const v = !sc ? 'not done' : sc.sent ? 'sent' : sc.of > 1 ? sc.got + '/' + sc.of : sc.got ? 'right' : 'wrong';
      const tone = !sc || sc.sent ? '' : sc.got === sc.of ? ' is-good' : ' is-bad';
      return `<div class="row"><span class="k">${esc('Q' + (q.qNumber != null && q.qNumber !== '' ? q.qNumber + (q.qPart || '') : q.name))}</span><span class="v prog-v${tone}">${esc(v)}</span></div>`;
    }).join('');
    return `<details class="prog-paper" data-paper="${esc(pp.id)}"${PROG_OPEN.has(pp.id) ? ' open' : ''}>
      <summary class="row"><span class="k">${esc(progressPaperName_(pp.x))}</span><span class="v">${esc(sums)}</span></summary>
      <div class="prog-qs">${qs}</div>
    </details>`;
  }).join('');
  const untouched = sr.untouched ? `<div class="row"><span class="k">Not started</span><span class="v">${sr.untouched}</span></div>` : '';
  /* ITS OWN CARD ID (466), so one series — past papers, Religious Studies — moves or goes alone. */
  const lid = 'prog:series:' + String(sr.name || 'x').toLowerCase().replace(/[^a-z0-9_.-]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  return card_(`<div class="prog-series" data-lay-card="${esc(lid)}">
    <h3>${esc(sr.name.charAt(0).toUpperCase() + sr.name.slice(1))}</h3>
    ${lines}${untouched}
  </div>`);
}

/* ---------- GRADE ESTIMATE ---------- */
/* NO BOUNDARIES IN THE LIBRARY, so a share of the marks reads as a grade by these steps — said as an estimate on the card, every time. */
const PROG_GCSE_STEPS = [[80, '9'], [70, '8'], [60, '7'], [50, '6'], [40, '5'], [30, '4'], [20, '3'], [12, '2'], [5, '1']];
const PROG_ALEVEL_STEPS = [[80, 'A*'], [70, 'A'], [60, 'B'], [50, 'C'], [40, 'D'], [30, 'E']];
const PROG_SATS_STEPS = [[75, 'greater depth'], [55, 'expected standard']];
function progressLevel_(x) {
  const r = x.row || {};
  const said = [x.tier, x.bandValue, r.band_value, r.level, r.key_stage, x.keystage].map(v => String(v || '')).join(' ');
  if (/a-?level|\bas\b/i.test(said)) return 'alevel';
  if (/ks2|sats/i.test(said) || /standards & testing/i.test(String(x.company || r.company || ''))) return 'sats';
  if (/ks4|gcse|foundation|higher/i.test(said)) return 'gcse';
  return '';
}
function progressGrade_(steps, pct, low) {
  const s = steps.find(([at]) => pct >= at);
  return s ? s[1] : low;
}
function progressGradeCard_(st) {
  const by = {};
  Object.keys(st.papers).forEach(pid => {
    const pp = st.papers[pid];
    if (!pp.of) return;
    const x = pp.x, subj = String(x.subject || 'Other');
    const type = String(x.documentType || (x.row && x.row.document_type) || '');
    const lv = /past|specimen/i.test(type) ? progressLevel_(x) : '';
    const grade = x.bandType === 'grade' && x.bandValue ? String(x.bandValue) : '';
    if (!lv && !grade) return;
    const k = subj + '|' + (lv || 'grade');
    const o = by[k] || (by[k] = { subj: subj, lv: lv, got: 0, of: 0, n: 0, best: 0 });
    o.got += pp.got; o.of += pp.of; o.n++;
    /* A GRADED WORKSHEET COUNTS TOWARDS "WORKING AT" WHEN SEVEN IN TEN OF ITS MARKS WERE GOT. */
    if (!lv && pp.got / pp.of >= 0.7 && +grade > o.best) o.best = +grade;
  });
  const rows = Object.keys(by).map(k => by[k]).filter(o => o.lv || o.best).map(o => {
    const pct = progressPct_(o.got, o.of);
    const g = o.lv === 'gcse' ? 'grade ' + progressGrade_(PROG_GCSE_STEPS, pct, 'U')
      : o.lv === 'alevel' ? progressGrade_(PROG_ALEVEL_STEPS, pct, 'U')
      : o.lv === 'sats' ? progressGrade_(PROG_SATS_STEPS, pct, 'working towards')
      : 'working at grade ' + o.best;
    const label = o.subj + (o.lv === 'gcse' ? ' GCSE' : o.lv === 'alevel' ? ' A-level' : o.lv === 'sats' ? ' SATs' : ' worksheets');
    return `<div class="row"><span class="k">${esc(label)}</span><span class="v">${esc(g)}</span></div>`;
  }).join('');
  if (!rows) return emptyCard_('Grade estimate');
  return card_(`<div class="prog-grade">
    <h3>Grade estimate</h3>
    ${rows}
  </div>`);
}

/* ---------- SESSIONS ---------- */
/* SESSIONS FROM `myJobs_`, the Booking column's own list: four weeks either side of today, the next three and the last three. */
function progressSessions_() {
  const jobs = typeof myJobs_ === 'function' ? myJobs_() : [];
  const ahead = [], past = [];
  const t0 = progressToday_();
  jobs.forEach(j => {
    if (/cancel/i.test(String(j.status || '')) || typeof jobOn_ !== 'function') return;
    for (let i = -28; i <= 28; i++) {
      const d = new Date(t0.getTime()); d.setDate(d.getDate() + i);
      let on = false;
      try { on = jobOn_(j, d); } catch (e) { on = false; }
      if (on) (i >= 0 ? ahead : past).push({ d: d, j: j });
    }
  });
  ahead.sort((a, b) => a.d - b.d); past.sort((a, b) => b.d - a.d);
  return { ahead: ahead.slice(0, 3), past: past.slice(0, 3) };
}
function progressSessionsCard_(ss) {
  if (!ss.ahead.length && !ss.past.length) return emptyCard_('Sessions');
  const when = s => day_(s.d) + ' ' + date_(s.d) + (s.j.time ? ' · ' + time_(s.j.time) : '');
  const row = s => `<div class="row"><span class="k">${esc(when(s))}</span><span class="v">${esc(s.j.title || s.j.subject || 'Session')}</span></div>`;
  return card_(`<div class="prog-sessions">
    <h3>Sessions</h3>
    ${ss.ahead.map(row).join('')}
    ${ss.past.map(row).join('')}
    <div class="tile-row">${tile_({ icon: 'book', label: 'Sessions', note: 'on Book', act: 'prog-sessions' })}</div>
  </div>`);
}

/* ---------- THE COLUMN: every widget, always, so each is where it was; one with nothing to say is its title alone (414). ---------- */
function progressCards_() {
  const signed = typeof USER !== 'undefined' && !!USER;
  const st = signed ? progressStats_() : { n: 0, weak: [], series: [], papers: {}, topics: [], recent: [] };
  const cards = [progressAnsweredCard_(st), progressActivityCard_(st), progressWeakCard_(st),
    progressGradeCard_(st)];
  if (st.series.length) st.series.slice(0, 6).forEach(sr => cards.push(progressSeriesCard_(sr)));
  else cards.push(emptyCard_('Papers and worksheets'));
  cards.push(progressSessionsCard_(signed ? progressSessions_() : { ahead: [], past: [] }));
  return cards;
}
/* ARE PROGRESS'S NUMBERS STILL COMING: the payload or the library, asked of the waits themselves, never of a card's HTML. */
const progressComing_ = () => typeof USER !== 'undefined' && !!USER && ((typeof awaiting_ === 'function' && awaiting_())
  || (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null && !LIBRARY_FAILED));
/* PRACTISE A TOPIC: Find with that Topic chip. Questions do not answer Topic (`topicShown_`), so a chip that finds nothing opens the question last got wrong instead. */
on('prog-practise', el => {
  const topic = String((el && el.dataset.topic) || ''), key = String((el && el.dataset.key) || '');
  if (!topic || typeof FINDERS === 'undefined') return;
  const F = FINDERS.stuff;
  let n = 0;
  finderSet_(F, { filters: [{ field: 'topic', value: topic }], paint: false });
  inFinder_(F, () => { try { n = stuffFiltered().length; } catch (e) { n = 0; } });
  if (!n) finderSet_(F, { paint: false });
  if (!n) {
    const x = key ? (stuffItemsAll_() || []).find(y => y && y.kind === 'question' && String(y.key || y.name) === key.replace(/#[^#]*$/, '')) : null;
    if (x && typeof finderOpen_ === 'function') { finderOpen_(x, null, F); return; }
    toast('Nothing in Find on ' + topic + ' yet.');
    return;
  }
  inFinder_(F, () => {
    paintStuff();
    if (AT !== F.id) go(F.id);
    goPage(F.id, stuffFirstResult_());
  });
});
on('prog-sessions', () => { go('booking'); });
