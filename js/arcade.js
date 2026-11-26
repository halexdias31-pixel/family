/* @family. — arcade.js ONE FILE, SPLIT. § */


/* ---------- ARCADE § */

/* THE WIDGETS — nine things you USE rather than things you find. § */
/* TOOLS AND GAMES, AS COLUMNS — `What for · Tools` and `· Games` were always funnel answers. § */

/* ---------- WHAT THIS PERSON MAY OPEN § */
/* ---------- ONE LIST, ASKED BY BOTH THE RENDER AND THE COUNT § */
/* `admin` AND `tutor` ARE TWO FLAGS BECAUSE THEY ARE TWO AUDIENCES. § */
/* ---------- WHO MAY OPEN A WIDGET, ASKED IN ONE PLACE § */
/* AND `signedIn`, A THIRD AUDIENCE: § */
function widgetFor_(w) {
  if (!w) return false;
  if (w.admin && !(typeof may_ === 'function' && may_('admin'))) return false;
  if (w.tutor && !(typeof may_ === 'function' && may_('staff'))) return false;
  if (w.signedIn && !(typeof USER !== 'undefined' && USER)) return false;
  /* AND kinds.json, THE ONE PLACE A TOOL IS SHOWN OR HIDDEN (18 Nov): its entry's `who` (`tool.entries.<id>.who`), asked through may_. */
  const e = typeof ITEM_KINDS === 'object' && ((ITEM_KINDS.kinds[w.kind] || {}).entries || {})[w.id];
  if (e && e.who && e.who !== 'anyone' && !String(e.who).split(',').some(x => typeof may_ === 'function' && may_(x.trim()))) return false;
  /* WHO SEES THIS (497, words.js): an admin's narrowing, asked after the code's own gates, which always win. */
  return true;
}

/* ---------- ONE WIDGET, ONE CARD, AND A STAR ON IT § */
const WIDGET_KEY = w => 'w:' + String(w.id);

/* NAMED FOR THE COLUMN, because `find.js` already has a `widgetCard_` and it is a different object: § */
/* ---------- AND UNTIL IT HAS STARTED, IT IS WAITING, AND IT LOOKS IT § */
/* `own` is its own card (not Saved): only there does an admin get Edit words (`wordsOpts_`, words.js). */
function widgetOnColumn_(w, own) {
  const held = typeof gameLocked_ === 'function' && gameLocked_(w.id), name = w.name || w.title || w.label || '';
  return renderCard({ kind: 'panel', look: 'is-widget' + (held ? ' is-locked' : ''), name, tags: name ? [name] : [],
    body: [widgetSlot_(w, name)], tiles: widgetTiles_(w, own) });
}
/* ONE PLACE FOR A WIDGET'S TILES (472): the star, the padlock, Suggest, then the admin's Edit words — the card's one row. */
const widgetTiles_ = (w, own) => [].concat(typeof favOpts_ === 'function' ? [favOpts_({ key: WIDGET_KEY(w), kind: 'widget' }),
  typeof gameLockOpts_ === 'function' ? gameLockOpts_(w.id) : null, typeof suggestOpts_ === 'function' ? suggestOpts_('widget', String(w.id), w.name || w.title || w.label || '') : null] : [],
  own === true && typeof wordsOpts_ === 'function' ? wordsOpts_('w:' + String(w.id)) || [] : []).filter(Boolean);
/* A WIDGET'S SLOT, its own maker's drawing inside (a heading saying the card's name goes: the name tag says it); waiting until it has started. */
function widgetSlot_(w, name) {
  const waits = typeof w.start === 'function' && typeof loading_ === 'function';
  const html = typeof wordsIn_ === 'function' ? wordsIn_('w:' + String(w.id), w.html) : w.html;
  return { type: 'group', id: 'wgt-' + String(w.id), look: 'widget-slot', attrs: { role: 'region', 'aria-label': String(w.name || w.id), 'aria-busy': waits ? 'true' : null },
    inner: (typeof kcTidy_ === 'function' ? kcTidy_('', html, name).lines : String(html || '')) + (waits ? loading_() : '') };
}




/* STARTED AND STOPPED LIKE THE OTHER TWO COLUMNS. A starred timer is a running timer, and a canvas
   loop behind a screen nobody is looking at is the flat battery `toolsStop_` already exists for. */

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


/* A WIDGET THAT IS ITS OWN FIRST ANSWER IN FIND (batch B): a browsable thing gets a menu pill, not a column or a mini-app. */
const FIND_WIDGET_GROUPS = { videos: 'Videos', reels: 'Tools', newspaper: 'Tools' };
/* EVERY WIDGET IS A FIND CARD (790) FOR THIS VIEWER, in the code's order — but the reel's: each of its videos is a Find card of its own (kind video). */
function findWidgetList_() {
  return allWidgets().filter(w => w && w.kind !== 'reel').filter(widgetFor_);
}
/* THE WIDGETS ON A FINDER: the slots its filled pages hold — Find fills only the pages near the glass, so a card not drawn yet has nothing to start. */
function finderWidgets_(col) {
  return widgetsReveilAll_(col).map(e => e.w).filter((w, i, a) => a.indexOf(w) === i).filter(widgetFor_);
}

/* WHICH WIDGETS A COLUMN HOLDS, by its id — the lists `toolsStart_` and `savedStart_` start from, asked by `widgetsGlass_` of a column beside the one in front. § */
/* `reel` (414): the widgets leading the Reels column, before the admin's "+" and the first reel (`reelLead_`, posts.js). */
/* `stuff` (790): the tools and games are Find cards, started and stopped as a column's are. */
const WIDGET_COLS = ['stuff'];
function widgetsOn_(col) {
  return col === 'stuff' ? finderWidgets_(col) : [];
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
    const busy = typeof GLASS !== 'undefined' && GLASS.at !== AT;
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


/* THE EXAM DATES CHANGED UNDER THE COLUMN, so it is REDRAWN IF IT IS DRAWN — the rule `profileRefresh_` keeps for Settings, whose About you holds the same two § */

const progressToday_ = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
const progressDaysSaid_ = n => (n === 0 ? 'today' : n + (n === 1 ? ' day' : ' days'));
/* ---------- THE COUNTDOWNS WIDGET ON TOOLS (466): every copy by class, as the Saved column draws it too ---------- */
/* DAYS TO GO BY DEFAULT; one tile shows each one's date instead (a safe press, owner 12 Nov). */

/* EASTER SUNDAY (Meeus/Butcher), as a local date: the one rule the site and the backend (booking.gs, setup.gs, via tools/cards-gen.js) both date by. */
function tdEaster_(yy) {
  const D = (y, m, d) => new Date(y, m, d);
  const a = yy % 19, b = Math.floor(yy / 100), c = yy % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return D(yy, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
}
/* ---------- TERM DATES (491): THE YEAR AS INTERVALS — terms, half-terms and holidays, each with its real first and last day ---------- */
/* THE ONE SCHOOL-YEAR RULE: the backend's `schoolYear` (booking.gs) reads this, copied by tools/cards-gen.js: a term runs Monday to Friday, a holiday Saturday to Sunday; `check-terms` holds the two together. */
function tdYear_(y) {
  const D = (yy, m, d) => new Date(yy, m, d), add = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const nth = (yy, mo, wd, n) => {
    if (n > 0) { const d = D(yy, mo, 1); return add(d, ((wd - d.getDay() + 7) % 7) + 7 * (n - 1)); }
    const d = D(yy, mo + 1, 0); return add(d, -((d.getDay() - wd + 7) % 7));
  };
  const fri = d => add(d, -((d.getDay() - 5 + 7) % 7)), mon = d => add(d, (8 - d.getDay()) % 7);
  const octMon = nth(y, 9, 1, -1), octHalf = octMon.getDate() + 4 > 31 ? add(octMon, -7) : octMon;
  let xmas = fri(D(y, 11, 21)); if (xmas.getDate() < 16) xmas = D(y, 11, 20);
  let jan = mon(D(y + 1, 0, 2)); if (jan.getDate() <= 3 && D(y + 1, 0, 1).getDay() % 6 === 0) jan = add(jan, 1);
  const feb = mon(D(y + 1, 1, 12)), eas = tdEaster_(y + 1), gf = add(eas, -2), em = add(eas, 1);
  const floor = mon(em < D(y + 1, 2, 29) ? em : D(y + 1, 2, 29)), early = add(gf, -11), easStart = early > floor ? early : floor;
  const springEnd = gf < easStart ? add(gf, -1) : add(easStart, -3), summer = add(easStart, 14) > em ? add(easStart, 14) : add(em, 1);
  const may = nth(y + 1, 4, 1, -1), jul = tdJul_(y + 1);
  const terms = [['Autumn 1', tdYear0_(y), add(octHalf, -3)], ['Autumn 2', add(octHalf, 7), xmas], ['Spring 1', jan, add(feb, -3)],
    ['Spring 2', add(feb, 7), springEnd], ['Summer 1', summer, add(may, -3)], ['Summer 2', add(may, 7), jul]];
  /* THE BREAKS' NAMES AND KINDS, IN ORDER: settings.json's `calendar` (SHARED_SETTINGS), the summer last. */
  const hols = SHARED_SETTINGS.calendar.breaks, summerHols = hols[hols.length - 1];
  const out = [];
  terms.forEach((t, i) => {
    out.push({ name: t[0], kind: 'term', from: t[1], to: t[2] });
    if (i < hols.length - 1) out.push({ name: hols[i].name, kind: hols[i].kind, from: add(t[2], 1), to: add(terms[i + 1][1], -1) });
  });
  out.push({ name: summerHols.name, kind: summerHols.kind, from: add(jul, 1), to: add(tdYear0_(y + 1), -1) });
  return out;
}
/* THE LAST DAY OF SUMMER TERM: 22 July, or the Friday before when that is a weekend. */
function tdJul_(y) { const d = new Date(y, 6, 22); return d.getDay() % 6 ? d : new Date(y, 6, d.getDay() ? 21 : 20); }
/* THE FIRST DAY OF A YEAR'S AUTUMN TERM: the first Wednesday from 1 Sep, or past the 5th the first Mon-Thu. */
function tdYear0_(y) {
  let d = new Date(y, 8, 1 + ((3 - new Date(y, 8, 1).getDay() + 7) % 7));
  if (d.getDate() > 5) { d = new Date(y, 8, 1); while (d.getDay() === 0 || d.getDay() > 4) d.setDate(d.getDate() + 1); }
  return d;
}
/* MY SCHOOL (491): starts and ends a few school days earlier or later, kept on this phone for whoever is signed in. */
const tdKey_ = () => 'familyTermShift:' + ((typeof USER !== 'undefined' && USER && USER.personId) || 'anon');
function tdShift_() { try { const o = JSON.parse(keep_.get(tdKey_()) || 'null'); return { s: +(o && o.s) || 0, e: +(o && o.e) || 0 }; } catch (e) { return { s: 0, e: 0 }; } }
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
const tdDay_ = d => fmtDate_(d, 'day') + ' ' + fmtDate_(d);
/* A TERM SAYS ITS FIRST AND LAST DAY OF TERM; A BREAK SAYS WHEN IT STARTS AND THE FIRST DAY BACK — never "ends" on a Sunday. */
function tdLine_(x) {
  const back = new Date(x.to.getFullYear(), x.to.getMonth(), x.to.getDate() + 1);
  while (back.getDay() % 6 === 0) back.setDate(back.getDate() + 1);
  const v = x.kind === 'term' ? `${tdDay_(x.from)} – last day of term ${tdDay_(x.to)}` : `from ${tdDay_(x.from)} · first day back ${tdDay_(back)}`;
  return progRow_((x.now ? 'Now: ' : '') + x.name, v, '', `td-${x.kind}${x.now ? ' td-now' : ''}`);
}
/* ONE LABEL–VALUE ROW (the one `.row` look) as a block: `v` a text, or a block (a control) in the value's place. */
const progRow_ = (k, v, vLook, rowLook) => ({ type: 'group', look: 'row' + (rowLook ? ' ' + rowLook : ''), blocks: [{ type: 'group', tag: 'span', look: 'k', text: String(k) },
  Object.assign({ type: 'group', tag: 'span', look: 'v' + (vLook ? ' ' + vLook : '') }, v && typeof v === 'object' && v.type ? { blocks: [v] } : { text: String(v) })] });
/* THE NEXT FOUR BY DEFAULT; one tile shows the rest of the year ahead too (owner, 12 Nov: a safe press on every tool). */
let TD_MORE = false;
function paintTermDates_() {
  const rows = termDatesRows_(), sh = tdShift_();
  const adj = (id, v, label) => progRow_(label, { type: 'control', tag: 'select', attrs: { class: 'td-adj', 'data-td': id, 'aria-label': label },
    options: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(n => ({ value: String(n), on: n === v, text: n ? (n > 0 ? n + ' later' : -n + ' earlier') : 'as usual' })) });
  const blocks = rows.map(tdLine_).concat(adj('s', sh.s, 'My school starts'), adj('e', sh.e, 'My school ends'),
    { type: 'tiles', tiles: [{ icon: TD_MORE ? 'up' : 'down', label: TD_MORE ? 'Fewer' : 'Later', note: TD_MORE ? 'the next four' : 'the year ahead', act: 'td-more' }] });
  document.querySelectorAll('.td-box').forEach(box => {
    box.removeAttribute('aria-busy');
    box.innerHTML = cardBlocks_(blocks);
  });
}
on('td-more', () => { TD_MORE = !TD_MORE; paintTermDates_(); });
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('.td-adj');
  if (!el) return;
  const o = tdShift_(); o[el.dataset.td] = Number(el.value) || 0;
  keep_.put(tdKey_(), JSON.stringify(o));
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
/* WHICH SERIES A QUESTION BELONGS TO (ONE QUESTION SET, UNIFY item 3): every set by its source tag — a board's sets by subject, another
   maker's by who made them and subject; no kind of set of its own. */
function progressSeries_(x) {
  const subj = String(x.subject || ''), board = String(x.examBoard || (x.row && x.row.exam_board) || '');
  const co = String(x.company || (x.row && x.row.company) || '');
  if (board) return (subj ? subj + ' ' : '') + 'past papers';
  return [co, co.toLowerCase().indexOf(subj.toLowerCase()) === -1 ? subj : '', 'sets'].filter(Boolean).join(' ');
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
/* A PROGRESS CARD from its blocks, through the one card maker; its name is its first tag. */
const progressCard_ = (look, name, body, more) => setCard_(Object.assign({ card: 'acct:' + look, hook: look, title: name, body }, more || {}));
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
/* A SOURCE'S ROW (4g, owner 20 Nov): its name, marks and what is left; a tap opens each paper, and a paper each question, right or not done. */
function progressSourceRow_(sr) {
  let got = 0, of = 0, left = 0;
  const lines = sr.papers.slice(0, 15).map(pp => {
    const total = pp.all.length, done = Object.keys(pp.done).length, l = Math.max(0, total - done);
    got += pp.got; of += pp.of; left += l;
    const sums = (pp.of ? pp.got + '/' + pp.of + ' marks · ' : '') + (l ? l + ' left' : 'all done');
    const qs = pp.all.map(q => {
      const k = String(q.key || q.name), sc = pp.done[k];
      const v = !sc ? 'not done' : sc.sent ? 'sent' : sc.of > 1 ? sc.got + '/' + sc.of : sc.got ? 'right' : 'wrong';
      const tone = !sc || sc.sent ? '' : sc.got === sc.of ? ' is-good' : ' is-bad';
      return progRow_('Q' + (q.qNumber != null && q.qNumber !== '' ? q.qNumber + (q.qPart || '') : q.name), v, `prog-v${tone}`);
    });
    return progressOpen_('paper:' + pp.id, progRow_(progressPaperName_(pp.x), sums), [{ type: 'group', look: 'prog-qs', blocks: qs }]);
  });
  const untouched = sr.untouched ? [progRow_('Not started', sr.untouched + (sr.untouched === 1 ? ' paper' : ' papers'))] : [];
  const name = sr.name.charAt(0).toUpperCase() + sr.name.slice(1);
  const sums = (of ? progressPct_(got, of) + '% marks · ' : '') + (left ? left + ' left' : 'all done');
  return progressOpen_('src:' + sr.name, progRow_(name, sums), [{ type: 'group', look: 'prog-qs', blocks: lines.concat(untouched) }], 'prog-src');
}
/* A LINE THAT OPENS IN PLACE (no pop-up: a <details> grows where it is), its open state kept across a redraw by PROG_OPEN. */
const progressOpen_ = (k, sum, blocks, look) => ({ type: 'group', tag: 'details', look: 'prog-paper' + (look ? ' ' + look : ''), attrs: { 'data-paper': k, open: PROG_OPEN.has(k) },
  blocks: [Object.assign(sum, { tag: 'summary' })].concat(blocks) });

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
/* EACH SUBJECT'S ESTIMATE as [label, grade]. */
function progressGrades_(st) {
  const by = {};
  Object.keys(st.papers).forEach(pid => {
    const pp = st.papers[pid];
    if (!pp.of) return;
    const x = pp.x, subj = String(x.subject || 'Other');
    const lv = String(x.examBoard || (x.row && x.row.exam_board) || '') ? progressLevel_(x) : '';
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
    return [label, g];
  });
  return rows;
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
  if (!ss.ahead.length && !ss.past.length) return setCard_({ card: 'acct:prog-sessions', title: 'Sessions', state: 'empty' });
  const when = s => fmtDate_(s.d, 'day') + ' ' + fmtDate_(s.d) + (s.j.time ? ' · ' + fmtDate_(s.j.time, 'time') : '');
  const row = s => progRow_(when(s), s.j.title || s.j.subject || 'Session');
  return progressCard_('prog-sessions', 'Sessions', ss.ahead.map(row).concat(ss.past.map(row)),
    { actions: [{ icon: 'book', label: 'Sessions', note: 'on Book', act: 'prog-sessions' }] });
}

/* ---------- THE COLUMN: every widget, always, so each is where it was; one with nothing to say is its title alone (414). ---------- */
function progressCards_() {
  const signed = typeof USER !== 'undefined' && !!USER;
  return [progressAllCard_(), progressSessionsCard_(signed ? progressSessions_() : { ahead: [], past: [] })];
}
/* ---------- ONE PROGRESS CARD (4g, owner 20 Nov): what were History, Questions, Recent activity, Work on next, Grade estimate and a card per
   source, made once by the one card maker: a summary, a row per source, then the day view (`history`, the backend's postHistory_). ---------- */
const progressOfWhom_ = () => (typeof USER !== 'undefined' && USER && !USER.lockedPreview && rank_(whose_()) === 'student' ? String((whose_() && whose_().personId) || USER.personId || '') : '');
function progressAllSpec_(of) {
  const signed = typeof USER !== 'undefined' && !!USER;
  const st = signed ? progressStats_() : { n: 0, weak: [], series: [], papers: {}, topics: [], recent: [] };
  of = of == null ? progressOfWhom_() : of;
  const top = st.n ? [progRow_('Streak', st.streak ? progressDaysSaid_(st.streak) : 'none yet'),
    progRow_('Last 7 days', `${st.week} on ${progressDaysSaid_(st.weekDays)}`),
    progRow_('Marks', st.of ? st.got + ' of ' + st.of + ' (' + progressPct_(st.got, st.of) + '%)' : 'none marked yet', '', 'prog-tot')]
    .concat(progressGrades_(st).map(([k, g]) => progRow_('Grade · ' + k, g, '', 'prog-tot')),
      st.weak.length ? [progRow_('Work on next', st.weak.map(o => o.topic).join(', '))] : []) : [];
  const src = st.series.slice(0, 8).map(progressSourceRow_);
  const day = of && typeof histBody_ === 'function' ? [{ type: 'group', look: 'prog-day', blocks: [{ type: 'msgHead', text: 'Day by day' }].concat(histBody_(of)) }] : [];
  if (!top.length && !src.length && !day.length) return null;
  return { card: 'acct:progress', hook: 'prog-all', title: 'Progress', data: of ? { of, hist: 1 } : {}, body: top.concat(src, day) };
}
function progressAllCard_(of) {
  const spec = progressAllSpec_(of);
  return setCard_(spec || { card: 'acct:progress', title: 'Progress', state: 'empty' });
}
/* ARE PROGRESS'S NUMBERS STILL COMING: the payload or the library, asked of the waits themselves, never of a card's HTML. */
const progressComing_ = () => typeof USER !== 'undefined' && !!USER && ((typeof awaiting_ === 'function' && awaiting_())
  || (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null && !LIBRARY_FAILED));
on('prog-sessions', () => { go('booking'); });
