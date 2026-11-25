/* @family. — map.js ONE FILE, SPLIT. § */



/* A WIDGET'S MARKUP IS DATA (owner, 12 Nov, rule 1.26): its title, then its parts, drawn by the one card maker's blocks. */
const mapHead_ = text => ({ type: 'msgHead', text });
const mapBox_ = (id, look, more) => Object.assign({ type: 'group', id, look }, more || {});
const mapHtml_ = (name, ...parts) => cardBlocks_([mapHead_(name)].concat(parts));

/* ---------- `draw` AND `pure`: WHAT THE BUILDER MAY DO WITH A WIDGET BEFORE ANYBODY ARRIVES § */
const WIDGETS = [

  /* ---------- VIDEOS — TYPE, TAP, WATCH § */
  { id: 'videos', kind: 'reel', name: 'Videos', start: () => window.initVideos?.(),
    /* DRAWN AHEAD FROM WHAT IS ALREADY HERE (`vidPaint_`): `initVideos` asks the network for the list and,
       for an admin, the films' sync. */
    draw: () => window.vidPaint_?.(),
    stop: () => window.videosStop_?.(),
    into: 'vid-box', what: 'The videos',
    get html() { return mapHtml_('Videos', mapBox_('vid-box', 'vid-box')); } },
  /* ---------- NEWSPAPER (owner, 12 Nov): a Sunday paper's fun section, one page on one card, never endless — newspaper.js reads data/settings/newspaper.json. */
  /* `solid` — AN INSTRUMENT, NOT A CARD. § */
  /* MESSAGES, as a widget. § */
  /* MESSAGES IS NOT A WIDGET ANY MORE. § */

  /* ---------- SPEED READ (403): paste, then one word at a time — reader.js ---------- */

  /* ---------- THE BASKET, WHICH HAS NOW LIVED IN FOUR PLACES § */

  /* ---------- TERM DATES AND COUNTDOWNS (466): the owner — "a widget in the Tools column telling the user the end dates of the next 3 academic intervals"; countdowns "available for everyone under Tools". */
  { id: 'termdates', kind: 'tool', name: 'Term dates', pure: true, start: () => paintTermDates_?.(),
    draw: () => paintTermDates_?.(),
    into: 'td-box', what: 'The term dates',
    get html() { return mapHtml_('Term dates', mapBox_('td-box', 'td-box')); } },

  /* ---------- FAVOURITE LINKS (509): ten a person keeps on their account; for everybody, so signing in moves no page (339) — favlinks.js ---------- */
  /* ---------- THE PIXEL EDITOR (547): bare bones -- a grid, a colour, pen or eraser, Clear, a PNG; this device only -- pixel.js ---------- */
  { id: 'pixel', kind: 'tool', name: 'Pixel editor', solid: true, pure: true,
    start: () => window.initPixel_?.(),
    into: 'pxe-box', what: 'The pixel editor',
    get html() { return mapHtml_('Pixel editor', mapBox_('pxe-box')); } },
  /* ---------- THE CONSOLE (389, 441; owner 12 Nov): game files you own, Linked pictures and the guesser behind one picker — games.js. */
  { id: 'console', kind: 'game', name: 'Console', start: () => window.initConsole?.(),
    draw: () => window.consoleStill_?.(),
    stop: () => { window.consoleStop_?.(); },
    into: 'cs-slot', what: 'The console',
    get html() {
      return mapHtml_('Console',
        { type: 'group', tag: 'label', look: 'mat-sel ws-top', blocks: [{ type: 'control', tag: 'select',
          attrs: { id: 'cs-pick', 'data-do': 'cs-pick', 'aria-label': 'Which game' }, inner: window.csOptions_ ? window.csOptions_() : '' }] },
        mapBox_('cs-slot', null, { inner: window.csSlot_ ? window.csSlot_() : '' }));
    } },
  /* ---------- THE WORD GAMES (238, 441; owner 12 Nov): Articulate to Word Search behind one picker — games.js. */
  { id: 'wordgames', kind: 'game', name: 'Word games', start: () => window.initWordGames?.(),
    draw: () => window.wgPaint_?.(),
    stop: () => { window.wordGamesStop_?.(); },
    into: 'wg-slot', what: 'The game',
    get html() {
      return mapHtml_('Word games',
        { type: 'group', tag: 'label', look: 'mat-sel ws-top', blocks: [{ type: 'control', tag: 'select',
          attrs: { id: 'wg-pick', 'data-do': 'wg-pick', 'aria-label': 'Which game' }, inner: window.wgOptions_ ? window.wgOptions_() : '' }] },
        mapBox_('wg-slot', null, { inner: window.wgSlot_ ? window.wgSlot_() : '' }));
    } },
  /* ---------- THE BOARD GAMES (414, 461; back 15 Nov): Chess, Maze, Connect 4, Othello and Scrabble behind one picker — boardgames.js. */
  { id: 'boardgames', kind: 'game', name: 'Board games', start: () => window.initBoardGames?.(),
    draw: () => window.bgPaint_?.(),
    stop: () => { window.boardGamesStop_?.(); },
    into: 'bg-slot', what: 'The board',
    get html() {
      return mapHtml_('Board games',
        { type: 'group', tag: 'label', look: 'mat-sel ws-top', blocks: [{ type: 'control', tag: 'select',
          attrs: { id: 'bg-pick', 'data-do': 'bg-pick', 'aria-label': 'Which game' }, inner: window.bgOptions_ ? window.bgOptions_() : '' }] },
        mapBox_('bg-slot', null, { inner: window.bgSlot_ ? window.bgSlot_() : '' }));
    } },
  /* ---------- DOCKET (owner, 18 Nov): named lists like Google Tasks, kept on your own account (the `todo` cell) — the code is below. */
  /* WHO SEES IT is kinds.json's alone (`tool.entries.docket.who: "owner"`, asked by widgetFor_). */
  { id: 'docket', kind: 'tool', name: 'Docket', start: () => { if (!DK.fresh) DK.say = ''; dkPaint_(); },
    draw: () => dkPaint_(),
    into: 'dk-box', what: 'Your docket',
    get html() { return mapHtml_('Docket', mapBox_('dk-box', 'dk-box')); } },
  /* ---------- ASSIGNMENTS (owner, 18 Nov): anybody's school or uni work, kept on their own account (the `assignments` cell) — the code is below; who sees it, kinds.json. */
  { id: 'assignments', kind: 'tool', name: 'Assignments', start: () => asgPaint_(),
    draw: () => asgPaint_(),
    into: 'asg-box', what: 'Your assignments',
    get html() { return mapHtml_('Assignments', mapBox_('asg-box', 'asg-box')); } },
  /* ---------- YOUR LIBRARY CARDS (docs/history/339) § */
  { id: 'libcards', kind: 'tool', name: 'Library cards', solid: true, signedIn: true,
    start: () => initLibCards_?.(),
    into: 'lib-box', what: 'Your library cards',
    /* THE BOX ONLY: its host draws the card round it, and a card here showed twice (card-render). */
    get html() { return cardBlocks_(mapBox_('lib-box')); } },
];
/* SECONDARY (860): every widget here not named core in data/settings/tiers.json throws into oops_, never into its caller. */
tierGuardWidgets_(WIDGETS);





/* ---------- DOCKET (owner, 18 Nov; ONE LIST, owner 25 Nov night): one list, names only, kept whole in your own `todo` cell as { v, lists: [{ name: 'Docket', items }] }.
   An item is a title, an '8h' repeat or none, a date or none, its done state, and one hidden number, `runs` (minutes it runs by itself); nothing else. tools/docket-onelist.js checks it. */
const DK = { items: null, rest: null, say: '', addr: null, fresh: false, base: null, asking: null, q: Promise.resolve() };
/* THE OWNER'S DAY (owner, 20 Nov): midnight is London's, whatever the device's clock says. */
const dkDay_ = d => todayIso_(d);   // the one today, js/core.js
/* EVERY 8 HOURS (owner, 25 Nov): an '8h' item's `doneOn` is the third of the day it was ticked in (dkOn_: '2026-11-25/2'; 00-08 is 1, 08-16 is 2,
   16-24 is 3), so it is back, unticked, in the next third. A one-off keeps `done` and the day (`doneOn`), and leaves after midnight (dkTidy_).
   Pure, from `now` ('YYYY-MM-DD HH:MM', London's; a bare day is its first third). */
const dkRep_ = i => !!i && i.repeat === '8h';
const dkOn_ = now => { now = String(now || ''); const h = +now.slice(11, 13); return now.slice(0, 10) + '/' + (1 + Math.floor((h >= 0 && h < 24 ? h : 0) / 8)); };
const dkIsDone_ = (i, now) => (dkRep_(i) ? i.doneOn === dkOn_(now) : !!(i && i.done));
const dkDone_ = i => dkIsDone_(i, dkNow_());
const dkGone_ = i => !dkRep_(i) && !!i.done && !!i.doneOn && i.doneOn < dkDay_();
/* THE ONE TICK: every done path (the card, ?eink, the private address) ticks through this. Pure: the items, which one, ticked or not, London's now. */
function dkTick_(items, i, on, now) {
  const it = items[i];
  if (!it) return false;
  if (dkRep_(it)) it.doneOn = on ? dkOn_(now) : '';
  else { it.done = !!on; it.doneOn = on ? String(now).slice(0, 10) : ''; }
  return true;
}
/* SORTED LIKE GOOGLE TASKS (owner, 25 Nov night): Overdue (a dated one-off past its date), then Now (an 8h item not yet done this third), then the
   dated one-offs by date, then the undated, then Done; within Now, the most minutes it runs by itself (`runs`) first. Pure; each group keeps the list's order on a tie. The card, ?eink and the private address
   all read this one order. tools/docket-onelist.js checks it. */
function dkSort_(items, now) {
  now = String(now || '');
  const day = now.slice(0, 10), g = { over: [], now: [], dated: [], undated: [], done: [] };
  (items || []).forEach((it, i) => {
    if (!it) return;
    if (dkIsDone_(it, now)) g.done.push(i);
    else if (dkRep_(it)) g.now.push(i);
    else if (it.date && it.date < day) g.over.push(i);
    else if (it.date) g.dated.push(i);
    else g.undated.push(i);
  });
  const by = (a, b) => String(items[a].date).localeCompare(String(items[b].date)) || a - b;
  /* WITHIN NOW, THE LONGEST PASSIVE ONE FIRST (owner, 25 Nov night): `runs`, the minutes it runs by itself once started (laundry 60), descending. */
  const runs = i => Math.max(0, +items[i].runs || 0);
  g.over.sort(by); g.dated.sort(by); g.now.sort((a, b) => runs(b) - runs(a) || a - b);
  g.open = g.over.concat(g.now, g.dated, g.undated);
  return g;
}
/* ON EVERY LOAD: a one-off ticked before today leaves (the backend's postSaveTodo_ does the same on each save). */
const dkTidy_ = items => items.filter(it => it && !dkGone_(it));
/* ONE LIST: an older cell's lists are read as one, in their order; what else the cell holds is kept as it was (DK.rest). */
function dkLoad_() {
  if (DK.items) return DK.items;
  const raw = String((typeof USER !== 'undefined' && USER && USER.todo) || '');
  let got = null;
  try { got = JSON.parse(raw); } catch (e) { got = null; }
  const ok = !!got && typeof got === 'object' && Array.isArray(got.lists);
  DK.rest = ok ? Object.assign({}, got) : {};
  delete DK.rest.lists;
  DK.items = dkTidy_(ok ? [].concat(...got.lists.map(L => (L && Array.isArray(L.items) ? L.items : [])))
    : raw.split('\n').map(t => t.trim()).filter(Boolean).map(title => ({ title })));
  return DK.items;
}
/* THE SERVER'S DOCKET, NEVER THE CACHED ONE (owner, 25 Nov: a backend job rewrote the cell, the phone kept drawing — and would have saved — the old lists):
   USER.todo is the phone's copy from sign-in, so each app load and each opening asks the cell fresh (docketImport `read`) and draws nothing until it lands;
   a save carries the base it was read from (todoBase_, the same text as backend/post-account.gs's), and one refused as stale brings the server's cell back. */
function todoBase_(cell) {
  let h = 2166136261;
  const s = String(cell == null ? '' : cell);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return s.length.toString(36) + '.' + h.toString(36);
}
function dkTake_(todo, base) {
  if (typeof USER !== 'undefined' && USER) { USER.todo = String(todo || ''); if (typeof saveUser_ === 'function') saveUser_(); }
  DK.items = null; DK.base = base; DK.fresh = true;
  if (typeof stuffForget_ === 'function') stuffForget_(true);
}
function dkFetch_() {
  if (DK.asking) return DK.asking;
  DK.asking = Promise.resolve(api({ action: 'docketImport', read: true, personId: (typeof USER !== 'undefined' && USER && USER.personId) || '' }))
    .then(d => { if (d && d.success) { dkTake_(d.todo, d.base); DK.say = ''; } else DK.say = (d && d.error) || 'Your Docket could not be read — try again.'; })
    .catch(() => { DK.say = 'Your Docket could not be read — you look offline.'; })
    .then(() => { DK.asking = null; dkPaint_(); });
  return DK.asking;
}
function dkSave_() {
  /* NOT YET READ FRESH: nothing is sent (it would be the cached cell); the server's is asked for instead. */
  if (!DK.fresh) { DK.items = null; dkFetch_(); return; }
  /* FIND'S DOCKET CARD IS MADE FROM THESE ITEMS (dkItems_): changed, it is made again. */
  if (typeof stuffForget_ === 'function') stuffForget_(true);
  const todo = JSON.stringify(Object.assign({ v: 1 }, DK.rest || {}, { lists: [{ name: 'Docket', items: dkLoad_() }] }));
  if (typeof USER !== 'undefined' && USER) { USER.todo = todo; if (typeof saveUser_ === 'function') saveUser_(); }
  /* ONE AT A TIME: each save waits for the last, so it carries the base the last one answered. */
  DK.q = DK.q.then(() => Promise.resolve(api({ action: 'item', door: 'save', item: 'todo', personId: (USER && USER.personId) || '', todo, base: DK.base }))
    .then(d => {
      if (d && d.success) { if (d.base) DK.base = d.base; return; }
      if (d && d.stale) { dkTake_(d.todo, d.base); DK.say = 'Your Docket changed elsewhere — reloaded'; dkPaint_(); return; }
      DK.say = (d && d.error) || text_('not-saved-try-again'); dkPaint_();
    })
    .catch(() => { DK.say = 'Not saved — you look offline.'; dkPaint_(); }));
}
/* THE ONE ITEM (owner, 22 Nov, UNIFY NEXT 6): every item of the owner's lists (kinds.json `list`) is drawn as an Item, marked with its shape and kind
   (`data-shape`, `data-item-kind`, read by tools/one-list.js); the Docket's lines are its one card's (dkCard_), Assignments' this. */
const listItem_ = (kind, o) => ({ type: 'group', look: 'dk-item', attrs: Object.assign({ 'data-shape': kindShape_(kind), 'data-item-kind': kind }, o.attrs || {}),
  blocks: (o.blocks || []).filter(Boolean), tiles: o.tiles });
/* WHAT ?eink AND THE PRIVATE ADDRESS SAY: the open items in dkSort_'s order, an overdue one tagged so. Each row's `at` is the item's place (the tick's address). */
function dkNowNextOf_(items, now) {
  const g = dkSort_(items, now), over = i => g.over.indexOf(i) >= 0;
  return { name: text_('docket'), head: text_('docket'), done: text_('dk-all-done'),
    rows: g.open.map(i => ({ at: String(i), title: items[i].title || 'Untitled', missed: over(i), tags: over(i) ? [text_('dk-overdue')] : [] })) };
}
/* THE PLAIN-TEXT ADDRESS'S ANSWER (owner, 21 Nov): dkNowNextOf_ said in one line, for Siri or any assistant to read aloud.
   The backend says it by this copy (tools/cards-gen.js TAKE), so the address and the card cannot differ. tools/docket-address.js checks it. */
function dkSay_(m) {
  return m.rows.length ? text_('dk-say-now', { name: m.name, first: m.rows[0].title, left: m.rows.length }) : text_('dk-say-over', { name: m.name });
}
/* "DONE SHOWER": the open item whose title holds the most of the words said (case ignored, whole words); the first in order on a tie; -1 for none. */
function dkMatch_(titles, what) {
  const ws = s => String(s || '').toLowerCase().match(/[a-z0-9]+/g) || [], said = ws(what);
  let best = -1, most = 0;
  titles.forEach((t, k) => { const has = new Set(ws(t)), n = said.filter(w => has.has(w)).length; if (n > most) { most = n; best = k; } });
  return best;
}
/* THE E-INK PAGE (owner, 21 Nov; open the site with ?eink): the card's open items alone, black on white, large, still, in the card's order. A tick is the
   card's (`data-dkf`). Owner-only: anybody else sees only the way to sign in. Redrawn each minute in place (only when it changed), so the screen does not
   flash. tools/eink.js checks it matches the card's order. */
function dkEinkHtml_(items, now) {
  const m = dkNowNextOf_(items, now);
  const row = r => '<li class="ek-row' + (r.missed ? ' is-missed' : '') + '"><label class="ek-tick">' + formInput_('type="checkbox" data-dkf="' + esc(r.at) + '" aria-label="' + esc('Done: ' + r.title) + '"')
    + '<span class="ek-t">' + esc(r.title) + '</span>' + (r.tags.length ? '<span class="ek-tags">' + esc(r.tags.join(' · ')) + '</span>' : '') + '</label></li>';
  return '<h1 class="ek-now">' + esc(m.head) + '</h1>' + (m.rows.length ? '<ol class="ek-rows">' + m.rows.map(row).join('') + '</ol>' : '<p class="ek-say">' + esc(m.done) + '</p>');
}
const EINK = /(?:^|[?&])eink(?:[=&]|$)/.test(location.search);
function dkEinkPaint_() {
  let box = $('eink');
  if (!box) { box = document.createElement('main'); box.id = 'eink'; document.body.appendChild(box); document.documentElement.classList.add('eink'); }
  const owner = typeof may_ === 'function' && may_('owner');
  const html = owner ? dkEinkHtml_(dkLoad_(), dkNow_())
    : '<p class="ek-say"><a class="ek-sign" href="' + esc(location.pathname) + '">' + esc(text_('dk-eink-sign-in')) + '</a></p>';
  if (box.getAttribute('data-was') !== html) { box.innerHTML = html; box.setAttribute('data-was', html); }
}
/* AFTER THE WHOLE FILE HAS RUN (its consts, dkNow_ among them, exist only then); a throw here never stops the app beneath. */
const dkEinkTry_ = () => { try { dkEinkPaint_(); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'map:eink'); } };
if (EINK) { setTimeout(dkEinkTry_, 0); setInterval(dkEinkTry_, 60000); }
/* EACH APP LOAD, SIGNED IN AS THE OWNER: the Docket is asked fresh at once, so Find's docket card and ?eink draw the server's list too. */
setTimeout(() => { try { if (typeof may_ === 'function' && may_('owner') && typeof api === 'function') dkFetch_(); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'map:dk-fetch'); } }, 0);
/* THE WIDGET: what it has to say and the private address; the list itself is Find's one Docket card beside it (dkCard_). */
function dkPaint_() {
  const box = $('dk-box');
  if (!box) return;
  /* NOT YET READ FRESH: the cached items are not drawn (dkFetch_ paints again when the server's land). */
  if (!DK.fresh) { if (!DK.asking && !DK.say) dkFetch_(); box.innerHTML = cardBlocks_([{ type: 'text', text: DK.say || 'Fetching your Docket…' }]); return; }
  const out = DK.say ? [{ type: 'text', text: DK.say }] : [];
  /* THE PRIVATE ADDRESS (owner, 21 Nov): owner-only; asked of the backend (docketAddress) when opened, never kept on the phone. */
  if (typeof may_ === 'function' && may_('owner')) {
    out.push({ type: 'tiles', tiles: [{ icon: 'key', label: text_('dk-addr-show'), act: 'dk-addr', cls: DK.addr != null ? 'is-submit' : '' }] });
    if (DK.addr != null) out.push({ type: 'section', head: text_('dk-addr-head'), blocks: [{ type: 'text', text: text_('dk-addr-say') },
      { type: 'group', look: 'dk-form', inner: formOf_('docket-address', { address: DK.addr }) },
      { type: 'tiles', tiles: [{ icon: 'again', label: text_('dk-addr-new'), act: 'dk-addr-new', tone: 'danger' }] }] });
  }
  box.innerHTML = cardBlocks_(out);
}
/* ASKED, NOT KEPT: the token comes from the backend each time, the address is the backend's own URL (API) with it; a new one stops the old. */
const dkAddr_ = renew => Promise.resolve(api({ action: 'docketAddress', personId: (USER && USER.personId) || '', renew: renew ? 1 : '' }))
  .then(d => { if (d && d.token) DK.addr = API + '?docket=' + d.token; else { DK.addr = null; DK.say = (d && d.error) || text_('err-docket-saved'); } dkPaint_(); })
  .catch(() => { DK.addr = null; DK.say = 'Not saved — you look offline.'; dkPaint_(); });
on('dk-addr', () => { if (DK.addr != null) { DK.addr = null; dkPaint_(); } else { DK.addr = ''; dkPaint_(); dkAddr_(false); } });
on('dk-addr-new', () => { if (confirm(text_('dk-addr-new') + '? The old address stops working.')) dkAddr_(true); });
/* THE DOCKET IN FIND (owner, 20 Nov; one list, 25 Nov night): Tools › Docket is its one card (kinds.json kind `docket`, drawn by `dkCard_` through the one maker). */
function dkItems_() {
  /* NOT YET READ FRESH: no card (the cached cell is never drawn); dkFetch_'s answer makes Find draw it. */
  if (typeof may_ !== 'function' || !may_('owner') || !DK.fresh) return [];
  return [{ kind: 'docket', name: 'Docket', key: 'dk', seq: 0, sub: '', image: '', row: {}, text: ['Docket'].concat(dkLoad_().map(it => it.title)).filter(Boolean).join(' ') }];
}
/* LONDON'S MOMENT, as dkSort_ reads it. */
const dkNow_ = () => { let t = ''; try { t = new Intl.DateTimeFormat('en-GB', { timeZone: tz_(), hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); } catch (e) { t = ''; }
  return dkDay_() + ' ' + (t || '00:00'); };
const DKF = { edit: -1 };
/* ONE CARD, LIKE GOOGLE TASKS (owner, 25 Nov night): each item one line, its tick and title only, in dkSort_'s order; tapping a line (the one fold,
   js/cards-render.js cardFold_) shows only Edit (its name) and Delete; the ticked fold into one "Done (n)" line at the foot; then the quick add
   (an undated one-off). Plain rows, thin lines (style.css .kc-fold). tools/docket-look.js checks it. */
function dkLine_(i) {
  const it = dkLoad_()[i], editing = DKF.edit === i;
  return cardFold_('dk:' + i, { type: 'tick', text: it.title || 'Untitled', attrs: { 'data-dkf': String(i), checked: dkDone_(it), 'aria-label': 'Done: ' + (it.title || '') } }, [
    editing ? { type: 'group', look: 'dk-form', inner: formOf_('docket-item', { title: it.title || '' }) } : null,
    { type: 'tiles', tiles: editing ? [{ icon: 'save', label: text_('save'), act: 'dk-fsave', cls: 'is-submit', data: { at: i } }, { icon: 'close', label: 'Close', act: 'dk-fedit', data: { at: i } }]
      : [{ icon: 'edit', label: 'Edit', act: 'dk-fedit', data: { at: i } }, { icon: 'bin', label: 'Delete', act: 'dk-fdel', tone: 'danger', data: { at: i } }] }].filter(Boolean), 'dk-line');
}
function dkCard_() {
  const g = dkSort_(dkLoad_(), dkNow_());
  return renderCard(shapeCard_('docket', { kind: 'docket', name: 'Docket', tags: [],
    body: g.open.map(dkLine_)
      .concat(g.done.length ? cardFold_('dk:done', { type: 'text', text: 'Done (' + g.done.length + ')' }, g.done.map(dkLine_), 'dk-done') : [])
      .concat({ type: 'field', look: 'dk-qadd-f', blocks: [{ type: 'control', attrs: { class: 'dk-qadd', placeholder: 'Add an item, then Enter', 'aria-label': 'Add to the Docket', maxlength: 300, enterkeyhint: 'done' } }] }),
    tiles: [{ icon: 'plus', label: 'Add', act: 'dk-qadd', cls: 'is-submit' }] }));
}
/* A CHANGE IS SAVED (dkSave_, the backend's todoTidy_) and every place that draws the Docket draws it again in the new order. */
const dkKeep_ = () => { DK.say = ''; dkSave_(); dkPaint_(); if (typeof lateCame_ === 'function') lateCame_(); if (EINK) dkEinkTry_(); };
const dkRedraw_ = () => { dkPaint_(); if (typeof lateCame_ === 'function') lateCame_(); };
on('dk-fedit', el => { const i = +el.getAttribute('data-at'); if (DKF.edit === i) { DKF.edit = -1; stepDone_(DKF.step, false); dkRedraw_(); return; }
  DKF.step = openStep_({ el, draw: () => { DKF.edit = i; CARD_OPEN.add('dk:' + i); dkRedraw_(); }, undo: () => { if (DKF.edit === i) { DKF.edit = -1; dkRedraw_(); } } }); });
on('dk-fsave', el => { const it = dkLoad_()[+el.getAttribute('data-at')], card = el.closest('.card'), b = card && card.querySelector('[data-dke="title"]'), v = String((b && b.value) || '').trim();
  if (!it) return;
  if (v) it.title = v.slice(0, 300);
  DKF.edit = -1; stepDone_(DKF.step, false); dkKeep_(); });
on('dk-fdel', el => { const i = +el.getAttribute('data-at'), it = dkLoad_()[i]; if (!it || !confirm('Delete "' + (it.title || 'this item') + '"?')) return;
  dkLoad_().splice(i, 1); DKF.edit = -1; stepDone_(DKF.step, false); dkKeep_(); });
on('dk-qadd', el => { const card = el.closest('.card'), inp = card && card.querySelector('.dk-qadd'), t = String((inp && inp.value) || '').trim();
  if (!t) return;
  dkLoad_().push({ title: t.slice(0, 300) }); dkKeep_();
  setTimeout(() => { const again = document.querySelector('.dk-qadd'); if (again) again.focus(); }, 400); });
document.addEventListener('change', e => {
  const el = e.target, at = el && el.getAttribute && el.getAttribute('data-dkf');
  if (at == null) return;
  if (!dkTick_(dkLoad_(), +at, el.checked, dkNow_())) return;
  dkKeep_();
});
document.addEventListener('keydown', e => { const c = e.target && e.target.classList;
  if (e.key !== 'Enter' || !c || !c.contains('dk-qadd') || typeof ACTIONS === 'undefined' || !ACTIONS['dk-qadd']) return;
  e.preventDefault(); ACTIONS['dk-qadd'](e.target); });


/* ---------- ASSIGNMENTS (owner, 18 Nov): one list a person, sorted by due date and grouped Overdue / This week / Later / Done, each with its days left,
   size and weight as tags. Added and edited through the one form engine (kinds.json `assignment-new`, asked a field a step), saved whole by `assignmentsSave`.
   A parent sees each child's, a tutor each booked student's (`others`, from `assignmentsOf`), the admin anybody's through the lens; only the person changes theirs. */
const ASG = { of: '', got: {}, add: false, edit: '', say: '' };
const DK_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dkSayDay_ = d => (+d.slice(8, 10)) + ' ' + DK_MON[+d.slice(5, 7) - 1];
const ASG_FORM = 'assignment-new';
const asgMe_ = () => String((typeof USER !== 'undefined' && USER && USER.personId) || '');
const asgOf_ = () => ASG.of || String(((typeof whose_ === 'function' ? whose_() : USER) || {}).personId || '') || asgMe_();
const asgMine_ = () => asgOf_() === asgMe_();
const asgField_ = f => (FORM_SPECS.forms[ASG_FORM].fields || []).find(x => x.f === f) || {};
const asgSay_ = (f, v) => { const c = (asgField_(f).options || []).find(o => String(o.v) === String(v)); return c ? c.t : String(v || ''); };
function asgOwnList_() {
  let got = null;
  try { got = JSON.parse(String((typeof USER !== 'undefined' && USER && USER.assignments) || 'null')); } catch (e) { got = null; }
  return got && Array.isArray(got.assignments) ? got.assignments : [];
}
/* WHOSE LIST: your own from the sign-in reply at once, then fresh from `assignmentsOf` (which also names whose else you may open). */
function asgLoad_(of) {
  const g = ASG.got[of];
  if (g) return g;
  ASG.got[of] = { rows: of === asgMe_() ? asgOwnList_() : null, others: [], asked: true };
  Promise.resolve(api({ action: 'assignmentsOf', personId: asgMe_(), of })).then(d => {
    if (!d || !d.success) { ASG.say = (d && d.error) || 'Could not load them.'; ASG.got[of].rows = ASG.got[of].rows || []; return asgPaint_(); }
    ASG.got[of].rows = Array.isArray(d.assignments) ? d.assignments : [];
    if (Array.isArray(d.others) && d.others.length) ASG.got[asgMe_()] = Object.assign(ASG.got[asgMe_()] || {}, { others: d.others });
    asgPaint_();
  }).catch(() => { ASG.say = 'You look offline.'; ASG.got[of].rows = ASG.got[of].rows || []; asgPaint_(); });
  return ASG.got[of];
}
const asgDay_ = d => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const asgDaysLeft_ = due => Math.round((Date.parse(due + 'T00:00:00Z') - Date.parse(asgDay_() + 'T00:00:00Z')) / 864e5);
const asgDone_ = a => a.status === 'submitted' || a.status === 'marked';
/* THE FOUR GROUPS: Overdue (past due, not handed in), This week (due within 7 days), Later (further off, or no date), Done (submitted or marked). */
function asgGroups_(rows) {
  const g = { Overdue: [], 'This week': [], Later: [], Done: [] };
  rows.forEach((a, i) => {
    const left = a.due ? asgDaysLeft_(a.due) : null;
    (asgDone_(a) ? g.Done : left != null && left < 0 ? g.Overdue : left != null && left <= 7 ? g['This week'] : g.Later).push(i);
  });
  const by = i => (rows[i].due || '9999-99-99') + ' ' + (rows[i].time || '99:99');
  return Object.keys(g).filter(k => g[k].length).map(k => ({ head: k, rows: g[k].sort((a, b) => by(a).localeCompare(by(b))) }));
}
function asgLeftSay_(a) {
  if (!a.due) return '';
  const n = asgDaysLeft_(a.due);
  if (asgDone_(a)) return 'Due ' + dkSayDay_(a.due);
  return n < 0 ? (-n) + ' ' + plural_(-n, 'day') + ' late' : n === 0 ? 'Due today' : n === 1 ? 'Due tomorrow' : n + ' days left';
}
function asgItem_(a, i, mine) {
  const size = a.amount !== '' && a.amount != null ? Number(a.amount).toLocaleString('en-GB') + (a.unit ? ' ' + asgSay_('unit', a.unit) : '') : '';
  const tags = [asgLeftSay_(a), a.kind ? asgSay_('kind', a.kind) : '', size, a.weight !== '' && a.weight != null ? a.weight + '%' : '',
    asgSay_('status', a.status || 'not-started') + (a.status === 'marked' && a.mark ? ': ' + a.mark : '')].filter(Boolean);
  const when = [a.course, a.due ? dkSayDay_(a.due) + (a.time ? ', ' + a.time : '') : ''].filter(Boolean).join(' · ');
  const editing = mine && ASG.edit === a.id, track = asgTrackOnly_(a);
  return listItem_('assignment', { blocks: [
    { type: 'text', text: [{ b: a.title || 'Untitled' }] },
    when ? { type: 'text', look: 'note', text: when } : null,
    { type: 'tags', tags },
    track ? { type: 'text', look: 'note', text: track.say } : null,
    a.note && !editing ? { type: 'text', paras: String(a.note).split(/\n{2,}/) } : null,
    a.link && !editing ? { type: 'text', text: [{ link: 'Open the link', href: a.link, out: true, look: 'link' }] } : null,
    editing ? { type: 'group', look: 'store-form', inner: askArea_(asgEditForm_(a)) } : null],
    tiles: mine ? [{ icon: editing ? 'close' : 'edit', label: editing ? 'Close' : 'Edit', act: 'asg-edit', data: { id: a.id } },
      { icon: 'bin', label: 'Delete', act: 'asg-del', data: { id: a.id } }] : [] });
}
/* TRACKED ONLY (an assignment marked noAI: no generative AI; kinds.json assignment `list.trackOnly`): the card says so, and nothing here helps with its content. */
const asgTrackOnly_ = a => (((ITEM_KINDS.kinds.assignment || {}).list || {}).trackOnly || []).find(t => a[t.field] === true) || null;
/* AN EDIT IS THE SAME FORM, prefilled under `assignment-new@id` (form.js storeEditForm_), its send this list's. */
function asgEditForm_(a) {
  const fid = storeEditForm_('assignment', a.id, a);
  FORM_SEND_[fid] = v => asgSend_(fid, v, a.id);
  return fid;
}
function asgBlocks_() {
  const of = asgOf_(), mine = asgMine_(), g = asgLoad_(of), me = ASG.got[asgMe_()] || {}, out = [];
  if ((me.others || []).length && !(typeof lensOn_ === 'function' && lensOn_()))
    out.push({ type: 'tiles', look: 'dk-lists', tiles: [{ icon: 'list', label: 'Mine', act: 'asg-who', cls: mine ? 'is-submit' : '', data: { id: '' } }]
      .concat(me.others.map(o => ({ icon: 'list', label: o.name, act: 'asg-who', cls: of === String(o.id) ? 'is-submit' : '', data: { id: o.id } }))) });
  if (ASG.say) out.push({ type: 'text', text: ASG.say });
  if (g.rows === null) return out.concat({ type: 'wait', on: true });
  if (mine) {
    out.push({ type: 'tiles', tiles: [{ icon: ASG.add ? 'close' : 'plus', label: ASG.add ? 'Close' : 'Add an assignment', act: 'asg-add', cls: ASG.add ? '' : 'is-submit' }] });
    if (ASG.add) out.push({ type: 'group', look: 'store-form', inner: askArea_(ASG_FORM) });
  }
  if (!g.rows.length) out.push({ type: 'text', text: mine ? 'Nothing yet — add your first assignment.' : 'Nothing written down yet.' });
  asgGroups_(g.rows).forEach(s => out.push({ type: 'section', head: s.head + ' (' + s.rows.length + ')', blocks: s.rows.map(i => asgItem_(g.rows[i], i, mine)) }));
  return out;
}
function asgPaint_() {
  const box = $('asg-box');
  if (!box) return;
  box.innerHTML = cardBlocks_(asgBlocks_());
}
function asgSave_(rows) {
  const g = ASG.got[asgMe_()];
  if (g) g.rows = rows;
  const cell = JSON.stringify({ v: 1, assignments: rows });
  if (typeof USER !== 'undefined' && USER) { USER.assignments = cell; if (typeof saveUser_ === 'function') saveUser_(); }
  ASG.say = '';
  asgPaint_();
  return Promise.resolve(api({ action: 'assignmentsSave', personId: asgMe_(), assignments: rows }))
    .then(d => { if (!(d && d.success)) { ASG.say = (d && d.error) || text_('not-saved-try-again'); asgPaint_(); return false; }
      if (Array.isArray(d.assignments) && g) { g.rows = d.assignments; USER.assignments = JSON.stringify({ v: 1, assignments: d.assignments }); if (typeof saveUser_ === 'function') saveUser_(); asgPaint_(); }
      return true; })
    .catch(() => { ASG.say = 'Not saved — you look offline.'; asgPaint_(); return false; });
}
/* THE FORM'S SEND: a new one added, an edited one replaced in place; a title is the one thing it needs. */
function asgSend_(fid, v, id) {
  if (!String(v.title || '').trim()) { toast('Give it a title first.'); return; }
  const rows = ((ASG.got[asgMe_()] || {}).rows || []).slice(), a = Object.assign({ status: 'not-started' }, id ? rows.find(r => r.id === id) : {}, v);
  if (a.status !== 'marked') a.mark = '';
  if (id) { const at = rows.findIndex(r => r.id === id); rows[at] = a; delete ASK[fid]; ASG.edit = ''; }
  else { a.id = 'a' + Date.now().toString(36); rows.push(a); askDone_(fid); ASG.add = false; }
  asgSave_(rows).then(ok => { if (ok) toast(text_('saved')); });
}
FORM_SEND_[ASG_FORM] = v => asgSend_(ASG_FORM, v, '');
on('asg-add', () => { ASG.add = !ASG.add; asgPaint_(); });
on('asg-who', el => { ASG.of = String(el.dataset.id || ''); ASG.add = false; ASG.edit = ''; asgPaint_(); });
on('asg-edit', el => { const id = String(el.dataset.id || ''); delete ASK[ASG_FORM + '@' + id]; ASG.edit = ASG.edit === id ? '' : id; asgPaint_(); });
on('asg-del', el => { const id = String(el.dataset.id || ''), rows = ((ASG.got[asgMe_()] || {}).rows || []), a = rows.find(r => r.id === id);
  if (!a || !confirm('Delete "' + (a.title || 'this assignment') + '"?')) return;
  asgSave_(rows.filter(r => r.id !== id)); });
