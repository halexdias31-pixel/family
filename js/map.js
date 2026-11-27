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

  /* ---------- SPEED READ (403): paste, then one word at a time — reader.js ---------- */

  /* ---------- THE BASKET, WHICH HAS NOW LIVED IN FOUR PLACES § */

  /* ---------- TERM DATES AND COUNTDOWNS (466): the owner — "a widget in the Tools column telling the user the end dates of the next 3 academic intervals"; countdowns "available for everyone under Tools". */
  { id: 'termdates', kind: 'tool', name: 'Term dates', pure: true, start: () => paintTermDates_?.(),
    draw: () => paintTermDates_?.(),
    into: 'td-box', what: 'The term dates',
    get html() { return mapHtml_('Term dates', mapBox_('td-box', 'td-box')); } },

  /* ---------- FAVOURITE LINKS (509): ten a person keeps on their account; for everybody, so signing in moves no page (339) — favlinks.js ---------- */
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
function dkTick_(items, i, on, now, pick) {
  const it = items[i];
  if (!it) return false;
  /* A SLOT RECORDS WHICH OPTION (owner, 27 Nov): `pick` (else the least recent, dkOption_) is this tick's and goes to the end of `picks`; an untick takes it off. */
  if (Array.isArray(it.options) && it.options.length) {
    const got = on ? (pick && it.options.indexOf(pick) >= 0 ? pick : dkOption_(it)) : '', was = String(it.pick || '');
    it.picks = (Array.isArray(it.picks) ? it.picks : []).filter(x => x !== (on ? got : was)).concat(on ? [got] : []);
    it.pick = got;
  }
  if (dkRep_(it)) it.doneOn = on ? dkOn_(now) : '';
  else { it.done = !!on; it.doneOn = on ? String(now).slice(0, 10) : ''; }
  return true;
}
/* THE PLAN (owner, 27 Nov: "run from the top down without it giving me a bad order"; every rule a number, none a feeling). Pure and deterministic:
   the items, London's now ('YYYY-MM-DD HH:MM') and the owner's leave times (dkLeaves_: their timetable sessions; none known, none assumed).
   An item may say `minutes` (hands-on), `runs` (unattended after), `place` (home/out/desk/phone/anywhere), `stay` (must stay at `place` until `runs` ends),
   `from`/`until` ('HH:MM': start at or after `from`, finish minutes+runs by `until`), `days` ('mon-sat', js/form.js clashDays_), `anchor` (wake/meal/bed),
   `date` (a one-off's hard deadline) and `options` (a slot's choices). Groups: `open` (can start now, in plan order), `later` (cannot yet; `when[i]` the
   minute from today's 00:00 it next can, soonest first; null not this week), `missed` (a one-off past its date: "new date?"), `done`.
   The open order: (0) wake items until the day starts (a wake item ticked today) and through the third it started in; (1) meal items while a meal item
   was ticked this third; (2) a dated one-off whose latest start is before the time it would get if it waited behind every other open item (latest start
   first); (3) the unattended ones (`runs`, longest first); (4) the rest by place, home first and out last (one trip covers every out item), the fewest
   minutes first; (5) meal items; (6) bed items. Overdue is no reason to go first. Ties keep the list's order. The card, ?eink and the private address
   (backend/cards-gen.gs copies this) all read this one plan. tools/docket-plan.js checks it. */
function dkSort_(items, now, leaves) {
  now = String(now || '');
  items = items || [];
  const day = now.slice(0, 10), hm = v => { const m = /^(\d{1,2}):(\d\d)$/.exec(String(v == null ? '' : v).trim()); return m ? +m[1] * 60 + +m[2] : null; };
  const t = hm(now.slice(11, 16)) || 0, ut = d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
  const wd = (new Date(ut(day)).getUTCDay() + 6) % 7, third = dkOn_(now), L = Array.isArray(leaves) ? leaves : [];
  const num = v => Math.max(0, +v || 0), anc = it => (['wake', 'meal', 'bed'].indexOf(it.anchor) >= 0 ? it.anchor : '');
  const ticked = (a, on) => items.some(it => it && anc(it) === a && String(it.doneOn || '').indexOf(on) === 0);
  const wakeNow = !ticked('wake', day) || ticked('wake', third), mealNow = ticked('meal', third);
  const g = { open: [], later: [], missed: [], done: [], when: {} };
  /* THE FIRST MINUTE (from today's 00:00, at or after `at`) IT MAY START AND STILL FINISH: in its days, its window, and, kept at its place, before a leave. */
  const startAt = (it, at) => {
    const need = num(it.minutes) + num(it.runs), f = hm(it.from), u = hm(it.until), days = it.days && typeof clashDays_ === 'function' ? clashDays_(it.days) : [];
    const end = !dkRep_(it) && it.date ? Math.round((ut(String(it.date)) - ut(day)) / 864e5) : 7;
    for (let d = 0; d <= Math.min(7, end); d++) {
      const w = (wd + d) % 7;
      if (days.length && days.indexOf(w) < 0) continue;
      let s = Math.max(at - d * 1440, f == null ? 0 : f);
      for (let k = 0; k < 50 && s < 1440; k++) {
        if (u != null && s + need > u) break;
        const hit = it.stay ? L.find(x => x.days.indexOf(w) >= 0 && x.s < s + need && x.e > s) : null;
        if (!hit) return d * 1440 + s;
        s = Math.max(hit.e, s + 1);
      }
    }
    return null;
  };
  items.forEach((it, i) => {
    if (!it) return;
    if (dkIsDone_(it, now)) return g.done.push(i);
    if (!dkRep_(it) && it.date && String(it.date) < day) return g.missed.push(i);
    const at = startAt(it, t);
    if (at === t) g.open.push(i); else { g.later.push(i); g.when[i] = at; }
  });
  const free = t + g.open.reduce((n, i) => n + num(items[i].minutes), 0);
  const last = it => (dkRep_(it) || !it.date ? null : Math.round((ut(String(it.date)) - ut(day)) / 864e5) * 1440 + (hm(it.until) == null ? 1440 : hm(it.until)) - num(it.minutes) - num(it.runs));
  const tier = it => { const a = anc(it), ls = last(it);
    return a === 'wake' && wakeNow ? 0 : a === 'meal' && mealNow ? 1 : ls != null && ls < free - num(it.minutes) ? 2 : a === 'bed' ? 6 : a === 'meal' ? 5 : num(it.runs) > 0 ? 3 : 4; };
  const place = it => { const p = ['home', 'anywhere', 'desk', 'phone', 'out'].indexOf(it.place); return p < 0 ? 1 : p; };
  const key = i => { const it = items[i], k = tier(it);
    return [k, k === 2 ? last(it) : k === 3 ? -num(it.runs) : place(it), k === 2 || k === 3 ? 0 : num(it.minutes), i]; };
  const by = (a, b) => { const x = key(a), y = key(b); for (let n = 0; n < x.length; n++) if (x[n] !== y[n]) return x[n] - y[n]; return 0; };
  g.open.sort(by);
  g.later.sort((a, b) => (g.when[a] == null ? 1e9 : g.when[a]) - (g.when[b] == null ? 1e9 : g.when[b]) || a - b);
  return g;
}
/* THE OWNER'S LEAVE TIMES: their timetable's sessions (kinds.json `session`: days, start, end), each { days: [0..6, Monday 0], s, e } in minutes. */
function dkLeaves_(rows) {
  return (Array.isArray(rows) ? rows : []).map(r => ({ days: clashDays_(r && r.days), s: clashMin_(r && r.start), e: clashMin_(r && r.end) }))
    .filter(x => x.days.length && x.s != null && x.e != null && x.e > x.s);
}
/* A SLOT'S OPTION (owner, 27 Nov): the one least recently ticked (`picks`, oldest first; never ticked first, in the list's order). */
function dkOption_(it) {
  const o = Array.isArray(it && it.options) ? it.options.filter(Boolean) : [], p = Array.isArray(it && it.picks) ? it.picks : [];
  return o.length ? (o.find(x => p.indexOf(x) < 0) || p.find(x => o.indexOf(x) >= 0) || o[0]) : '';
}
/* THE LINE'S WORDS: the title, and a slot's option ("Prayer · <option>": the one to do, or the one done); nothing else. */
function dkTitle_(it, now) {
  const o = dkIsDone_(it, now) ? String(it.pick || '') : dkOption_(it);
  return (String(it.title || '') || 'Untitled') + (o ? ' · ' + o : '');
}
/* WHEN A LATER ONE CAN START: "from 09:00" today, "from Sat 09:00" another day, "not this week" never. */
function dkWhen_(at, now) {
  if (at == null) return text_('dk-not-week');
  const d = Math.floor(at / 1440), m = at % 1440, s = String(now || ''), wd = (new Date(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))).getUTCDay() + 6 + d) % 7;
  const hhmm = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  return text_('dk-from', { at: (d ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][wd] + ' ' : '') + hhmm });
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
/* WHAT ?eink AND THE PRIVATE ADDRESS SAY: the plan's open items, then the later ones (each with when), then the missed ("new date?"), marked so.
   Each row's `at` is the item's place (the tick's address). */
function dkNowNextOf_(items, now, leaves) {
  const g = dkSort_(items, now, leaves), row = (i, tags, missed) => ({ at: String(i), title: dkTitle_(items[i], now), missed: !!missed, tags });
  return { name: text_('docket'), head: text_('docket'), done: text_('dk-all-done'),
    rows: g.open.map(i => row(i, [])).concat(g.later.map(i => row(i, [dkWhen_(g.when[i], now)])), g.missed.map(i => row(i, [text_('dk-missed')], true))) };
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
function dkEinkHtml_(items, now, leaves) {
  const m = dkNowNextOf_(items, now, leaves);
  const row = r => '<li class="ek-row' + (r.missed ? ' is-missed' : '') + '"><label class="ek-tick">' + formInput_('type="checkbox" data-dkf="' + esc(r.at) + '" aria-label="' + esc('Done: ' + r.title) + '"')
    + '<span class="ek-t">' + esc(r.title) + '</span>' + (r.tags.length ? '<span class="ek-tags">' + esc(r.tags.join(' · ')) + '</span>' : '') + '</label></li>';
  return '<h1 class="ek-now">' + esc(m.head) + '</h1>' + (m.rows.length ? '<ol class="ek-rows">' + m.rows.map(row).join('') + '</ol>' : '<p class="ek-say">' + esc(m.done) + '</p>');
}
const EINK = /(?:^|[?&])eink(?:[=&]|$)/.test(location.search);
function dkEinkPaint_() {
  let box = $('eink');
  if (!box) { box = document.createElement('main'); box.id = 'eink'; document.body.appendChild(box); document.documentElement.classList.add('eink'); }
  const owner = typeof may_ === 'function' && may_('owner');
  const html = owner ? dkEinkHtml_(dkLoad_(), dkNow_(), dkLeavesNow_())
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
/* THE OWNER'S LEAVE TIMES ON THE PHONE: the timetable's sessions Find holds (js/form.js STORE_ROWS_), none if not loaded. */
const dkLeavesNow_ = () => { try { return dkLeaves_(((STORE_ROWS_.session || {}).rows || []).map(r => r.data || {})); } catch (e) { return []; } };
/* LONDON'S MOMENT, as dkSort_ reads it. */
const dkNow_ = () => { let t = ''; try { t = new Intl.DateTimeFormat('en-GB', { timeZone: tz_(), hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); } catch (e) { t = ''; }
  return dkDay_() + ' ' + (t || '00:00'); };
const DKF = { edit: -1 };
/* ONE CARD, LIKE GOOGLE TASKS (owner, 25 Nov night; the plan, 27 Nov): each item one line, its tick and its words only (dkTitle_: a slot's "Prayer · <option>";
   a later one's "· from 09:00"), in the plan's order (dkSort_): the open, then the later; tapping a line (the one fold, js/cards-render.js cardFold_) shows
   a slot's every option (a tap ticks that one), Edit (its name) and Delete; the missed fold into one "Missed — new date? (n)" line, the ticked into one
   "Done (n)" line at the foot; then the quick add (an undated one-off). Plain rows, thin lines (style.css .kc-fold). tools/docket-look.js checks it. */
function dkLine_(i, when) {
  const it = dkLoad_()[i], editing = DKF.edit === i, now = dkNow_(), words = dkTitle_(it, now) + (when ? ' · ' + when : '');
  const opts = Array.isArray(it.options) ? it.options.filter(Boolean) : [];
  return cardFold_('dk:' + i, { type: 'tick', text: words, attrs: { 'data-dkf': String(i), checked: dkDone_(it), 'aria-label': 'Done: ' + words } }, [
    opts.length && !editing ? { type: 'tiles', tiles: opts.map(o => ({ label: o, act: 'dk-pick', cls: o === dkOption_(it) ? 'is-submit' : '', data: { at: i, pick: o } })) } : null,
    editing ? { type: 'group', look: 'dk-form', inner: formOf_('docket-item', { title: it.title || '' }) } : null,
    { type: 'tiles', tiles: editing ? [{ icon: 'save', label: text_('save'), act: 'dk-fsave', cls: 'is-submit', data: { at: i } }, { icon: 'close', label: 'Close', act: 'dk-fedit', data: { at: i } }]
      : [{ icon: 'edit', label: 'Edit', act: 'dk-fedit', data: { at: i } }, { icon: 'bin', label: 'Delete', act: 'dk-fdel', tone: 'danger', data: { at: i } }] }].filter(Boolean), 'dk-line');
}
function dkCard_() {
  const now = dkNow_(), g = dkSort_(dkLoad_(), now, dkLeavesNow_());
  return renderCard(shapeCard_('docket', { kind: 'docket', name: 'Docket', tags: [],
    body: g.open.map(i => dkLine_(i)).concat(g.later.map(i => dkLine_(i, dkWhen_(g.when[i], now))))
      .concat(g.missed.length ? cardFold_('dk:missed', { type: 'text', text: text_('dk-missed') + ' (' + g.missed.length + ')' }, g.missed.map(i => dkLine_(i)), 'dk-missed') : [])
      .concat(g.done.length ? cardFold_('dk:done', { type: 'text', text: 'Done (' + g.done.length + ')' }, g.done.map(i => dkLine_(i)), 'dk-done') : [])
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
/* A SLOT'S OPTION TAPPED: the item ticked with that option (dkTick_ records it). */
on('dk-pick', el => { if (dkTick_(dkLoad_(), +el.getAttribute('data-at'), true, dkNow_(), el.getAttribute('data-pick') || '')) dkKeep_(); });
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
