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
  /* ---------- ASSIGNMENTS WENT INTO THE DOCKET (owner, 27 Nov: the one time list): each a to-do with its due date, minutes, course, weight, mark and noAI (access.gs assignmentsToDocket27NovRun_). */
  /* ---------- THE LIBRARY CARDS WENT INTO THE ARCHIVE (owner, 27 Nov): each card an Archive entry of its person (kinds.json `archive`; access.gs archive28NovRun_). */
];
/* SECONDARY (860): every widget here not named core in data/settings/tiers.json throws into oops_, never into its caller. */
tierGuardWidgets_(WIDGETS);





/* ---------- DOCKET (owner, 18 Nov; ONE LIST, owner 25 Nov night): one list, names only, kept whole in your own `todo` cell as { v, lists: [{ name: 'Docket', items }] }.
   An item is a title, an '8h' repeat or none, a date or none, its done state, and one hidden number, `runs` (minutes it runs by itself); nothing else. tools/docket-onelist.js checks it. */
const DK = { items: null, rest: null, say: '', addr: null, fresh: false, base: null, asking: null, q: Promise.resolve() };
/* THE OWNER'S DAY (owner, 20 Nov): midnight is London's, whatever the device's clock says. */
const dkDay_ = d => todayIso_(d);   // the one today, js/core.js
/* EACH CYCLE (owner, 25 Nov; one cycle at 06:00, 12:00 and 18:00, 28 Nov): an '8h' item's `doneOn` is the cycle it was ticked in (dkOn_: '2026-11-25/2'),
   so it is back, unticked, in the next. A one-off keeps `done` and the day (`doneOn`), and leaves after midnight (dkTidy_).
   Pure, from `now` ('YYYY-MM-DD HH:MM', London's). */
const dkRep_ = i => !!i && i.repeat === '8h';
/* ONE CYCLE FOR EVERY REPEATING ITEM (owner, 28 Nov): a cycle starts at each of these London times (the last runs to the first, next day). An item
   ticked in the cycle in hand is done until the next starts; its tick is that cycle's ('YYYY-MM-DD/n', n from 1; before the first start, yesterday's
   last). The `repeat` value stays '8h' in the data and means "each cycle" (kinds.json). Single source: the backend copies this (tools/cards-gen.js). */
const DK_CYCLE = ['06:00', '12:00', '18:00'];
const dkOn_ = now => { now = String(now || ''); const hm = now.slice(11, 16), n = DK_CYCLE.filter(x => x <= hm).length; if (n) return now.slice(0, 10) + '/' + n; const d = new Date(Date.UTC(+now.slice(0, 4), +now.slice(5, 7) - 1, +now.slice(8, 10)) - 864e5); return (isNaN(d) ? now.slice(0, 10) : d.toISOString().slice(0, 10)) + '/' + DK_CYCLE.length; };
/* ONE TIME LIST (owner, 27 Nov: "everything with a time follows the common calendar file standard (.ics)"): an item with a `start` ('YYYY-MM-DDTHH:MM',
   London's wall clock; a bare day is all-day) is an event, as an .ics VEVENT: `rrule` its RRULE (FREQ=HOURLY|DAILY|WEEKLY, INTERVAL, BYDAY, UNTIL, COUNT),
   `rdate` extra occurrences (RDATE: a different first one, "Sat 14:30 once, then Wed 18:00 weekly"), `exdate` cancelled ones (EXDATE) and `moved` single
   occurrences elsewhere ('<was>=<now>', RECURRENCE-ID), `minutes` how long. Its tick is the occurrence it ticked (`doneOn`), so the next one comes back.
   An item without a `start` is a to-do, as before. Times are minutes from 1970 on the wall clock (dkMin_), so a clock change moves nothing. tools/docket-repeat.js. */
const dkMin_ = v => { const m = /^(\d{4})-(\d\d)-(\d\d)(?:[T ](\d\d):(\d\d))?$/.exec(String(v == null ? '' : v).trim()); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)) / 6e4 : null; };
const dkIso_ = m => new Date(m * 6e4).toISOString().slice(0, 16);
const dkEv_ = i => !!i && dkMin_(i.start) != null;
const dkIsDone_ = (i, now) => (dkRep_(i) ? i.doneOn === dkOn_(now) : dkEv_(i) ? !!i.doneOn && i.doneOn === dkSlot_(i, now) : !!(i && i.done));
const dkDone_ = i => dkIsDone_(i, dkNow_());
const dkGone_ = i => (dkEv_(i) ? !dkSlot_(i, dkDay_()) : !dkRep_(i) && !!i.done && !!i.doneOn && i.doneOn < dkDay_());
/* AN EVENT'S OCCURRENCES from `from` to `to` (dkMin_ minutes), sorted, each once: the rule's from `start` (COUNT counted from it, UNTIL a day or a moment),
   then RDATE's; an EXDATE gone, a `moved` one at its new time. Pure. */
function dkOccur_(it, from, to) {
  const s = dkMin_(it && it.start), r = {}, list = v => (Array.isArray(v) ? v : []);
  if (s == null) return [];
  String(it.rrule || '').toUpperCase().replace(/^RRULE:/, '').split(';').forEach(p => { const k = p.split('='); if (k[0] && k[1]) r[k[0].trim()] = k[1].trim(); });
  const step = Math.max(1, Math.floor(+r.INTERVAL) || 1), count = Math.max(0, Math.floor(+r.COUNT) || 0);
  const um = /^(\d{4})(\d\d)(\d\d)(?:T(\d\d)(\d\d))?/.exec(r.UNTIL || ''), until = um ? Date.UTC(+um[1], +um[2] - 1, +um[3], um[4] ? +um[4] : 23, um[5] ? +um[5] : 59) / 6e4 : null;
  const ex = list(it.exdate).map(dkMin_), moved = {}, got = [];
  list(it.moved).forEach(x => { const p = String(x).split('='), a = dkMin_(p[0]), b = dkMin_(p[1]); if (a != null && b != null) moved[a] = b; });
  const keep = m => { if (ex.indexOf(m) >= 0) return; const n = moved[m] != null ? moved[m] : m; if (n >= from && n <= to && got.indexOf(n) < 0) got.push(n); };
  const days = (r.BYDAY || '').split(',').map(d => ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].indexOf(d.trim().slice(-2))).filter(d => d >= 0).sort((a, b) => a - b);
  const gap = r.FREQ === 'HOURLY' ? 60 * step : r.FREQ === 'DAILY' ? 1440 * step : r.FREQ === 'WEEKLY' ? 10080 * step : 0, far = to + 31 * 1440;
  if (!gap) keep(s);
  else {
    const d0 = Math.floor(s / 1440), mon = d0 - ((d0 + 3) % 7), tod = s - d0 * 1440, wk = r.FREQ === 'WEEKLY', ds = wk ? (days.length ? days : [(d0 + 3) % 7]) : [0];
    const base = wk ? mon * 1440 + tod : s, skip = count ? 0 : Math.max(0, Math.floor((from - 31 * 1440 - base) / gap));
    for (let k = skip, n = 0; k < skip + 20000; k++) {
      const b = base + k * gap;
      if (b > far || (until != null && b > until + 10080)) break;
      let stop = false;
      for (const d of ds) {
        const m = b + d * 1440;
        if (m < s) continue;
        if ((until != null && m > until) || (count && n >= count) || m > far) { stop = true; break; }
        n++; keep(m);
      }
      if (stop) break;
    }
  }
  list(it.rdate).map(dkMin_).forEach(m => { if (m != null) keep(m); });
  return got.sort((a, b) => a - b);
}
/* WHICH OCCURRENCE IS IN HAND at `now`: the last today that has begun, else the next (within a year and a bit); '' when none is left. Pure. */
function dkSlot_(it, now) {
  const t = dkMin_(now), d0 = t == null ? null : Math.floor(t / 1440) * 1440;
  if (t == null) return '';
  const o = dkOccur_(it, d0, t + 400 * 1440), cur = o.filter(m => m <= t).pop(), next = o.find(m => m > t);
  return cur != null ? dkIso_(cur) : next != null ? dkIso_(next) : '';
}
/* THE ONE TICK: every done path (the card, ?eink, the private address) ticks through this. Pure: the items, which one, ticked or not, London's now. */
function dkTick_(items, i, on, now, pick) {
  const it = items[i];
  if (!it || it.standing === true) return false;
  /* A SLOT RECORDS WHICH OPTION (owner, 27 Nov): `pick` (else the least recent, dkOption_) is this tick's and goes to the end of `picks`; an untick takes it off. */
  if (Array.isArray(it.options) && it.options.length) {
    const got = on ? (pick && it.options.indexOf(pick) >= 0 ? pick : dkOption_(it)) : '', was = String(it.pick || '');
    it.picks = (Array.isArray(it.picks) ? it.picks : []).filter(x => x !== (on ? got : was)).concat(on ? [got] : []);
    it.pick = got;
  }
  if (dkEv_(it)) it.doneOn = on ? dkSlot_(it, now) : '';
  else if (dkRep_(it)) it.doneOn = on ? dkOn_(now) : '';
  else { it.done = !!on; it.doneOn = on ? String(now).slice(0, 10) : ''; }
  return true;
}
/* THE PLAN. PRINCIPLE 1 (owner, 28 Nov): the order minimises the TOTAL TIME to finish everything; a deadline or a time window matters only if it would
   otherwise be missed. Every rule below follows from it (a far deadline never jumps the queue; unknown minutes are DK_UNKNOWN_MIN, 15, not 0; `place`
   is information only, owner 28 Nov: "ignore place and order only by efficiency").
   (owner, 27 Nov: "run from the top down without it giving me a bad order"; every rule a number, none a feeling). Pure and deterministic:
   the items, London's now ('YYYY-MM-DD HH:MM') and the owner's leave times (dkLeaves_: their events away from home; none known, none assumed).
   An event (`start`, dkOccur_) is pinned: open, above the rest, once its occurrence in hand has begun; later until then.
   An item may say `minutes` (hands-on), `runs` (unattended after), `place` (home/out/desk/phone/anywhere), `stay` (must stay at `place` until `runs` ends),
   `from`/`until` ('HH:MM': start at or after `from`, finish minutes+runs by `until`), `days` ('mon-sat', js/form.js clashDays_), `group` (a name `before` can use, e.g. "meal"; it orders nothing),
   `date` (a one-off's hard deadline) and `options` (a slot's choices). Groups: `open` (can start now, in plan order), `later` (cannot yet; `when[i]` the
   minute from today's 00:00 it next can, soonest first; null not this week), `missed` (a one-off past its date: "new date?"), `done`.
   The open order (ONE PRINCIPLE, owner 28 Nov: least total time, plus the items' own `before` facts; no tiers but these two): (-1) an event in
   hand, at its time; (2) an item whose latest start (a one-off's date and `until`) is before the time it would get if it waited behind every other
   open item, latest start first; (3) every other open item, cycle or one-off alike (cycle items first only as data: before: ["one-offs"]): the unattended
   ones first (`runs`, longest first: they run while the rest is done), then the fewest minutes. Overdue is no reason to go first. Ties keep the list's order. The card, ?eink and the private address
   (backend/cards-gen.gs copies this) all read this one plan. Then `before` (below). tools/docket-plan.js and tools/docket-before.js check it. */
function dkSort_(items, now, leaves) {
  /* UNKNOWN MINUTES ARE NOT 0 (owner, 28 Nov): an item without `minutes` takes this many, wherever the plan reads minutes. */
  const DK_UNKNOWN_MIN = 15;
  now = String(now || '');
  items = items || [];
  const day = now.slice(0, 10), hm = v => { const m = /^(\d{1,2}):(\d\d)$/.exec(String(v == null ? '' : v).trim()); return m ? +m[1] * 60 + +m[2] : null; };
  const t = hm(now.slice(11, 16)) || 0, ut = d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
  const wd = (new Date(ut(day)).getUTCDay() + 6) % 7, L = Array.isArray(leaves) ? leaves : [];
  const num = v => Math.max(0, +v || 0), mins = it => (it.minutes === '' || it.minutes == null || !isFinite(+it.minutes) ? DK_UNKNOWN_MIN : num(it.minutes));
  const g = { standing: [], open: [], later: [], missed: [], done: [], when: {} };
  /* THE FIRST MINUTE (from today's 00:00, at or after `at`) IT MAY START AND STILL FINISH: in its days, its window, and, kept at its place, before a leave. */
  const startAt = (it, at) => {
    const need = mins(it) + num(it.runs), f = hm(it.from), u = hm(it.until), days = it.days && typeof clashDays_ === 'function' ? clashDays_(it.days) : [];
    const end = !dkRep_(it) && it.date ? Math.round((ut(String(it.date)) - ut(day)) / 864e5) : 7;
    for (let d = 0; d <= Math.min(7, end); d++) {
      const w = (wd + d) % 7;
      if (days.length && days.indexOf(w) < 0) continue;
      let s = Math.max(at - d * 1440, f == null ? 0 : f);
      for (let k = 0; k < 50 && s < 1440; k++) {
        if (u != null && s + need > u) break;
        const hit = it.stay ? L.find(x => x.s < d * 1440 + s + need && x.e > d * 1440 + s) : null;
        if (!hit) return d * 1440 + s;
        s = Math.max(hit.e - d * 1440, s + 1);
      }
    }
    return null;
  };
  items.forEach((it, i) => {
    if (!it) return;
    /* A STANDING LINE (owner, 28 Nov): never ticked, never gone, above everything, not open work. */
    if (it.standing === true) return g.standing.push(i);
    if (dkIsDone_(it, now)) return g.done.push(i);
    /* AN EVENT IS PINNED AT ITS TIME: open (on top) once its occurrence in hand has begun, else later from then; none left, done. */
    if (dkEv_(it)) { const k = dkSlot_(it, now), m = dkMin_(k) - dkMin_(day);
      if (!k) return g.done.push(i);
      if (m <= t) return g.open.push(i);
      g.later.push(i); g.when[i] = m < 7 * 1440 ? m : null; return; }
    if (!dkRep_(it) && it.date && String(it.date) < day) return g.missed.push(i);
    const at = startAt(it, t);
    if (at === t) g.open.push(i); else { g.later.push(i); g.when[i] = at; }
  });
  const free = t + g.open.reduce((n, i) => n + mins(items[i]), 0);
  const last = it => (dkRep_(it) || !it.date ? null : Math.round((ut(String(it.date)) - ut(day)) / 864e5) * 1440 + (hm(it.until) == null ? 1440 : hm(it.until)) - mins(it) - num(it.runs));
  const tier = it => { const ls = last(it); return dkEv_(it) ? -1 : ls != null && ls < free - mins(it) ? 2 : 3; };
  const key = i => { const it = items[i], k = tier(it), r = num(it.runs);
    return [k, k === 2 ? last(it) : r > 0 ? 0 : 1, k === 2 ? 0 : r > 0 ? -r : mins(it), i]; };
  const by = (a, b) => { const x = key(a), y = key(b); for (let n = 0; n < x.length; n++) if (x[n] !== y[n]) return x[n] - y[n]; return 0; };
  g.open.sort(by);
  /* BEFORE (owner, 28 Nov: "Brush teeth has to go before breakfast"): an open item whose `before` names another open one (its title or its `group`,
     any case: `meal` for every item of the meal group; `one-offs` for every open item with no `repeat` and no `start`; `*` for every other open item: owner 28 Nov, "prayer should still be at the top", whenever the
     cycle is begun, until ticked) is placed ahead of it, absolutely, over a deadline at risk too; two `*` items keep the list's order between them;
     everything else keeps the order above. An event stays on top, never
     jumped. A ticked one is not open, so it binds nothing. Each in turn, in that order, comes after whatever must go before it (pulled
     up just ahead of it, theirs ahead of them); a cycle is broken where it closes on itself, so both stay listed, each once. tools/docket-before.js. */
  const nm = v => String(v == null ? '' : v).trim().toLowerCase(), must = (a, b) => { const A = items[a], B = items[b];
    const star = X => Array.isArray(X.before) && X.before.some(x => nm(x) === '*');
    return a !== b && Array.isArray(A.before) && ((star(A) && (!star(B) || a < b)) || A.before.some(x => nm(x) === nm(B.title) || (!!nm(B.group) && nm(x) === nm(B.group)) || (nm(x) === 'one-offs' && !dkRep_(B) && !dkEv_(B)))); };
  const top = g.open.filter(i => tier(items[i]) <= 0), rest = g.open.filter(i => tier(items[i]) > 0), out = top.slice();
  const put = (b, path) => { if (out.indexOf(b) >= 0 || path.indexOf(b) >= 0) return; rest.forEach(a => { if (must(a, b)) put(a, path.concat(b)); }); if (out.indexOf(b) < 0) out.push(b); };
  rest.forEach(b => put(b, []));
  g.open = out;
  g.later.sort((a, b) => (g.when[a] == null ? 1e9 : g.when[a]) - (g.when[b] == null ? 1e9 : g.when[b]) || a - b);
  return g;
}
/* THE OWNER'S LEAVE TIMES (the Timetable tool went, owner 27 Nov: its times are events on the one list): every occurrence, in the coming eight days,
   of an event not at home that lasts (`minutes`), each { s, e } in minutes from `now`'s day's 00:00. Pure. */
function dkLeaves_(items, now) {
  const t0 = dkMin_(String(now || '').slice(0, 10)), out = [];
  if (t0 == null) return out;
  (Array.isArray(items) ? items : []).forEach(it => { const n = Math.max(0, +(it && it.minutes) || 0);
    if (dkEv_(it) && n && it.place !== 'home') dkOccur_(it, t0 - n, t0 + 8 * 1440).forEach(m => out.push({ s: m - t0, e: m - t0 + n })); });
  return out;
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
/* THE OWNER'S LEAVE TIMES ON THE PHONE: their own events' (dkLeaves_). */
const dkLeavesNow_ = () => dkLeaves_(dkLoad_(), dkNow_());
/* LONDON'S MOMENT, as dkSort_ reads it. */
const dkNow_ = () => { let t = ''; try { t = new Intl.DateTimeFormat('en-GB', { timeZone: tz_(), hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); } catch (e) { t = ''; }
  return dkDay_() + ' ' + (t || '00:00'); };
const DKF = { edit: -1 };
/* ONE CARD, LIKE GOOGLE TASKS (owner, 25 Nov night; the plan, 27 Nov): each item one line, its tick and its words only (dkTitle_: a slot's "Prayer · <option>";
   a later one's "· from 09:00"), in the plan's order (dkSort_): the open, then the later; tapping a line (the one fold, js/cards-render.js cardFold_) shows
   a slot's every option (a tap ticks that one), Edit (its name) and Delete; the missed fold into one "Missed — new date? (n)" line, the ticked into one
   "Done (n)" line at the foot; then the quick add (an undated one-off). Plain rows, thin lines (style.css .kc-fold). tools/docket-look.js checks it. */
/* A STEP (owner, 28 Nov): "name", or "name" a new line and its note; an item's `steps` listed in order under it, each its name then its note in full,
   always written out, no tap (owner, 28 Nov: "even if it looks ugly because it's so long"); the item is ticked once, as a whole. */
const dkStep_ = s => { const t = String(s == null ? '' : s), k = t.indexOf('\n'); return k < 0 ? { name: t.trim(), note: '' } : { name: t.slice(0, k).trim(), note: t.slice(k + 1).trim() }; };
function dkSteps_(it, i) {
  return (Array.isArray(it.steps) ? it.steps : []).map(dkStep_).filter(x => x.name).map((x, n) => [{ type: 'text', look: 'dk-step', text: (n + 1) + '. ' + x.name }]
    .concat(x.note ? [{ type: 'text', look: 'note', text: x.note }] : [])).flat();
}
/* A STANDING LINE: its words alone, no tick box, a tap folds out its steps or note if any. */
function dkStandLine_(i) {
  const it = dkLoad_()[i], kids = dkSteps_(it, i);
  return kids.length ? cardFold_('dk:' + i, { type: 'text', look: 'dk-stand', text: String(it.title || '') }, kids, 'dk-standing')
    : { type: 'text', look: 'dk-stand', text: String(it.title || ''), attrs: { 'data-dkstand': String(i) } };
}
function dkLine_(i, when) {
  const it = dkLoad_()[i], editing = DKF.edit === i, now = dkNow_(), words = dkTitle_(it, now) + (when ? ' · ' + when : '');
  const opts = Array.isArray(it.options) ? it.options.filter(Boolean) : [];
  const track = (((ITEM_KINDS.kinds.docket || {}).list || {}).trackOnly || []).find(t => it[t.field] === true), facts = dkFacts_(it, now);
  return cardFold_('dk:' + i, { type: 'tick', text: words, attrs: { 'data-dkf': String(i), checked: dkDone_(it), 'aria-label': 'Done: ' + words } }, [
    facts ? { type: 'text', look: 'note', text: facts } : null,
    ...dkSteps_(it, i),
    track ? { type: 'text', look: 'note', text: track.say } : null,
    opts.length && !editing ? { type: 'tiles', tiles: opts.map(o => ({ label: o, act: 'dk-pick', cls: o === dkOption_(it) ? 'is-submit' : '', data: { at: i, pick: o } })) } : null,
    editing ? { type: 'group', look: 'dk-form', inner: formOf_('docket-item', { title: it.title || '', before: (Array.isArray(it.before) ? it.before : []).join(', ') }) } : null,
    { type: 'tiles', tiles: editing ? [{ icon: 'save', label: text_('save'), act: 'dk-fsave', cls: 'is-submit', data: { at: i } }, { icon: 'close', label: 'Close', act: 'dk-fedit', data: { at: i } }]
      : [{ icon: 'edit', label: 'Edit', act: 'dk-fedit', data: { at: i } }, { icon: 'bin', label: 'Delete', act: 'dk-fdel', tone: 'danger', data: { at: i } }] }].filter(Boolean), 'dk-line');
}
/* WHAT A TAPPED LINE SAYS BESIDE ITS NAME: an event's occurrence in hand and how it repeats; a moved assignment's due day, course, weight and mark. */
function dkFacts_(it, now) {
  const k = dkEv_(it) ? dkSlot_(it, now) : '', r = String(it.rrule || '').toUpperCase();
  const rep = !r ? '' : (/FREQ=HOURLY/.test(r) ? 'every ' + ((/INTERVAL=(\d+)/.exec(r) || [])[1] || 1) + ' h' : /FREQ=DAILY/.test(r) ? 'daily' : 'weekly' + ((/BYDAY=([A-Z,]+)/.exec(r) || [])[1] ? ' ' + (/BYDAY=([A-Z,]+)/.exec(r) || [])[1].toLowerCase() : ''));
  return [k ? k.replace('T', ' ') : '', rep, it.date && !dkRep_(it) ? 'due ' + it.date : '', it.course, it.weight !== '' && it.weight != null ? it.weight + '%' : '', it.mark ? 'mark ' + it.mark : '']
    .filter(Boolean).join(' · ');
}
const DK_ADD_KINDS = [{ kind: 'task', label: 'Add task', icon: 'plus', act: 'dk-qadd' }, { kind: 'event', label: 'Add event', icon: 'flag', act: 'dk-qevent' },
  { kind: 'lesson', label: 'Add lesson', icon: 'join', act: 'dk-qlesson' }];
function dkCard_() {
  const now = dkNow_(), g = dkSort_(dkLoad_(), now, dkLeavesNow_());
  return renderCard(shapeCard_('docket', { kind: 'docket', name: 'Docket', tags: [],
    body: g.standing.map(i => dkStandLine_(i)).concat(g.open.map(i => dkLine_(i))).concat(g.later.map(i => dkLine_(i, dkWhen_(g.when[i], now))))
      .concat(g.missed.length ? cardFold_('dk:missed', { type: 'text', text: text_('dk-missed') + ' (' + g.missed.length + ')' }, g.missed.map(i => dkLine_(i)), 'dk-missed') : [])
      /* TERM DATES ARE EVENTS ON THE ONE LIST (js/arcade.js tdEvents_: the one rule, your account's shift): the next four, folded, never ticked. */
      .concat(typeof tdEvents_ === 'function' ? cardFold_('dk:terms', { type: 'text', text: text_('term-dates') }, tdEvents_().map(e => ({ type: 'text', look: 'note',
        text: e.title + ' · ' + e.start + (e.end && e.end !== e.start ? ' – ' + e.end : '') })), 'dk-terms') : [])
      .concat(g.done.length ? cardFold_('dk:done', { type: 'text', text: 'Done (' + g.done.length + ')' }, g.done.map(i => dkLine_(i)), 'dk-done') : [])
      .concat({ type: 'field', look: 'dk-qadd-f', blocks: [{ type: 'control', attrs: { class: 'dk-qadd', placeholder: 'Add an item, then Enter', 'aria-label': 'Add to the Docket', maxlength: 300, enterkeyhint: 'done' } }] })
      /* ADD ASKS THE KIND (owner, 27 Nov): a task (undated), an event (its first moment, a calendar entry), or a lesson (booked, paid to the term's end). */
      .concat({ type: 'field', look: 'dk-qadd-f', cap: 'When (an event)', blocks: [{ type: 'control', attrs: { class: 'dk-qwhen', type: 'datetime-local', 'aria-label': 'When the event starts' } }] }),
    tiles: DK_ADD_KINDS.map(k => ({ icon: k.icon, label: k.label, act: k.act, cls: k.act === 'dk-qadd' ? 'is-submit' : '' })) }));
}
/* A CHANGE IS SAVED (dkSave_, the backend's todoTidy_) and every place that draws the Docket draws it again in the new order. */
const dkKeep_ = () => { DK.say = ''; dkSave_(); dkPaint_(); if (typeof lateCame_ === 'function') lateCame_(); if (EINK) dkEinkTry_(); };
const dkRedraw_ = () => { dkPaint_(); if (typeof lateCame_ === 'function') lateCame_(); };
on('dk-fedit', el => { const i = +el.getAttribute('data-at'); if (DKF.edit === i) { DKF.edit = -1; stepDone_(DKF.step, false); dkRedraw_(); return; }
  DKF.step = openStep_({ el, draw: () => { DKF.edit = i; CARD_OPEN.add('dk:' + i); dkRedraw_(); }, undo: () => { if (DKF.edit === i) { DKF.edit = -1; dkRedraw_(); } } }); });
on('dk-fsave', el => { const it = dkLoad_()[+el.getAttribute('data-at')], card = el.closest('.card'), b = card && card.querySelector('[data-dke="title"]'), v = String((b && b.value) || '').trim();
  if (!it) return;
  if (v) it.title = v.slice(0, 300);
  /* BEFORE: names, comma-separated (an item, a slot, or `meal`); none clears it. */
  const bf = card && card.querySelector('[data-dke="before"]');
  if (bf) { const a = String(bf.value || '').split(',').map(x => x.trim().slice(0, 300)).filter(Boolean).slice(0, 20); if (a.length) it.before = a; else delete it.before; }
  DKF.edit = -1; stepDone_(DKF.step, false); dkKeep_(); });
/* A SLOT'S OPTION TAPPED: the item ticked with that option (dkTick_ records it). */
on('dk-pick', el => { if (dkTick_(dkLoad_(), +el.getAttribute('data-at'), true, dkNow_(), el.getAttribute('data-pick') || '')) dkKeep_(); });
on('dk-fdel', el => { const i = +el.getAttribute('data-at'), it = dkLoad_()[i]; if (!it || !confirm('Delete "' + (it.title || 'this item') + '"?')) return;
  dkLoad_().splice(i, 1); DKF.edit = -1; stepDone_(DKF.step, false); dkKeep_(); });
on('dk-qadd', el => { const card = el.closest('.card'), inp = card && card.querySelector('.dk-qadd'), t = String((inp && inp.value) || '').trim();
  if (!t) return;
  dkLoad_().push({ title: t.slice(0, 300) }); dkKeep_();
  setTimeout(() => { const again = document.querySelector('.dk-qadd'); if (again) again.focus(); }, 400); });
/* AN EVENT: its title and first moment (.ics DTSTART); pinned at its time in the plan. A LESSON is booked where its tutor's free time is (the booking form). */
on('dk-qevent', el => { const card = el.closest('.card'), inp = card && card.querySelector('.dk-qadd'), w = card && card.querySelector('.dk-qwhen'),
    t = String((inp && inp.value) || '').trim(), at = String((w && w.value) || '').slice(0, 16);
  if (!t || !/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(at)) { toast('An event needs a name and a time.'); return; }
  dkLoad_().push({ title: t.slice(0, 300), start: at }); dkKeep_(); });
on('dk-qlesson', () => go('booking'));
document.addEventListener('change', e => {
  const el = e.target, at = el && el.getAttribute && el.getAttribute('data-dkf');
  if (at == null) return;
  if (!dkTick_(dkLoad_(), +at, el.checked, dkNow_())) return;
  dkKeep_();
});
document.addEventListener('keydown', e => { const c = e.target && e.target.classList;
  if (e.key !== 'Enter' || !c || !c.contains('dk-qadd') || typeof ACTIONS === 'undefined' || !ACTIONS['dk-qadd']) return;
  e.preventDefault(); ACTIONS['dk-qadd'](e.target); });
