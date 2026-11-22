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
  { id: 'docket', kind: 'tool', name: 'Docket', start: () => dkPaint_(),
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





/* ---------- DOCKET (owner, 18 Nov): lists in your order; each item a title, an optional note, date, time and daily repeat; ticked items fold away.
   A daily item keeps the day it was last done (`doneOn`), so it is undone again tomorrow with no job anywhere. Saved whole to your own `todo` cell. */
const DK = { lists: null, at: 0, edit: -1, rename: false, showDone: false, say: '', addr: null };
/* THE OWNER'S DAY (owner, 20 Nov): midnight is London's, whatever the device's clock says. */
const dkDay_ = d => todayIso_(d);   // the one today, js/core.js
/* DONE IS READ FROM `doneOn` AND THE DAY, never a timer (owner, 20 Nov): a daily item is undone again after midnight; a one-off stays ticked until midnight, then goes (dkTidy_). */
const dkDone_ = i => (i.repeat === 'daily' ? i.doneOn === dkDay_() : !!i.done);
const dkGone_ = i => i.repeat !== 'daily' && !!i.done && !!i.doneOn && i.doneOn < dkDay_();
/* ON EVERY LOAD: a one-off ticked before today leaves its list (the backend's postSaveTodo_ does the same on each save); one ticked before `doneOn` existed is dated today, so it goes at the next midnight. */
function dkTidy_(lists) {
  lists.forEach(L => { L.items = (L.items || []).filter(it => !dkGone_(it)); L.items.forEach(it => { if (it.repeat !== 'daily' && it.done && !it.doneOn) it.doneOn = dkDay_(); }); });
  return lists;
}
function dkLoad_() {
  if (DK.lists) return DK.lists;
  const raw = String((typeof USER !== 'undefined' && USER && USER.todo) || '');
  let got = null;
  try { got = JSON.parse(raw); } catch (e) { got = null; }
  /* AN OLD DOCKET WAS LINES OF TEXT: each line an item of one list. */
  DK.lists = got && Array.isArray(got.lists) ? got.lists
    : raw.trim() ? [{ name: 'Docket', items: raw.split('\n').map(t => t.trim()).filter(Boolean).map(title => ({ title })) }] : [];
  return dkTidy_(DK.lists);
}
function dkSave_() {
  /* FIND'S DOCKET CARDS ARE MADE FROM THESE LISTS (dkItems_): a list changed is a list made again. */
  if (typeof stuffForget_ === 'function') stuffForget_(true);
  const todo = JSON.stringify({ v: 1, lists: DK.lists });
  if (typeof USER !== 'undefined' && USER) { USER.todo = todo; if (typeof saveUser_ === 'function') saveUser_(); }
  Promise.resolve(api({ action: 'item', door: 'save', item: 'todo', personId: (USER && USER.personId) || '', todo }))
    .then(d => { if (!(d && d.success)) { DK.say = (d && d.error) || text_('not-saved-try-again'); dkPaint_(); } })
    .catch(() => { DK.say = 'Not saved — you look offline.'; dkPaint_(); });
}
const DK_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dkSayDay_ = d => (+d.slice(8, 10)) + ' ' + DK_MON[+d.slice(5, 7) - 1];
/* GOOGLE TASKS' GROUPS: Past, Today, each later date, then No date; a daily item is always today's. */
function dkGroups_(items) {
  const today = dkDay_(), g = {};
  items.forEach((it, i) => {
    if (dkDone_(it)) return;
    const d = it.repeat === 'daily' ? today : it.date || '';
    const k = !d ? '~' : d < today ? '!' : d;
    (g[k] = g[k] || []).push(i);
  });
  return Object.keys(g).sort().map(k => ({ head: k === '~' ? 'No date' : k === '!' ? 'Past' : k === today ? 'Today' : dkSayDay_(k),
    rows: g[k].sort((a, b) => String(items[a].time || '99').localeCompare(String(items[b].time || '99'))) }));
}
/* AN ITEM NAMED FOR A FOOD KIND (foods.json, `foodKindOf_`) offers that kind's foods; the one picked is today's, and a daily item is the bare kind again tomorrow. */
const dkPicked_ = it => (it.pick && (it.repeat !== 'daily' || it.pickOn === dkDay_()) ? it.pick : '');
function dkItem_(it, i) {
  const fk = typeof foodKindOf_ === 'function' ? foodKindOf_(it.title) : null, picked = dkPicked_(it);
  const tags = [it.repeat === 'daily' ? 'Daily' : it.date ? dkSayDay_(it.date) : '', it.time || ''].filter(Boolean);
  const row = { type: 'group', look: 'dk-item', blocks: [
    { type: 'tick', text: (it.title || 'Untitled') + (picked ? ': ' + picked.toLowerCase() : ''), attrs: { 'data-dk': i, checked: dkDone_(it), 'aria-label': 'Done: ' + (it.title || '') } },
    tags.length ? { type: 'tags', tags } : null,
    fk && !dkDone_(it) ? { type: 'tiles', tiles: foodsOf_(fk).map(f => ({ label: f.name, note: f.note || '', act: 'dk-food', cls: f.name === picked ? 'is-submit' : '', data: { i, f: f.name } })) } : null,
    it.note && DK.edit !== i ? { type: 'text', paras: String(it.note).split(/\n{2,}/) } : null].filter(Boolean),
    tiles: [{ icon: 'edit', label: 'Edit', act: 'dk-edit', data: { i } }, { icon: 'bin', label: 'Delete', act: 'dk-del', data: { i } }] };
  if (DK.edit !== i) return row;
  const f = (cap, b) => ({ type: 'field', cap, blocks: [b] });
  return { type: 'group', look: 'dk-editing', blocks: [row,
    f('Title', { type: 'control', attrs: { class: 'dk-f', 'data-f': 'title', value: it.title || '', maxlength: 300 } }),
    f('Note', { type: 'control', tag: 'textarea', value: it.note || '', attrs: { class: 'dk-f', 'data-f': 'note', rows: 4, maxlength: 8000 } }),
    f('Date', { type: 'control', attrs: { type: 'date', class: 'dk-f', 'data-f': 'date', value: it.date || '' } }),
    f('Time', { type: 'control', attrs: { type: 'time', class: 'dk-f', 'data-f': 'time', value: it.time || '' } }),
    f('Repeats', { type: 'control', tag: 'select', attrs: { class: 'dk-f', 'data-f': 'repeat' }, options: [{ value: '', text: 'Never', on: !it.repeat }, { value: 'daily', text: 'Daily', on: it.repeat === 'daily' }] })],
    tiles: [{ icon: 'save', label: text_('save'), act: 'dk-keep', cls: 'is-submit', data: { i } }] };
}
function dkBlocks_() {
  const lists = dkLoad_();
  if (DK.at >= lists.length) DK.at = Math.max(0, lists.length - 1);
  const L = lists[DK.at];
  const out = dkNowNext_(lists).concat({ type: 'group', look: 'tile-row dk-lists', tiles: lists.map((l, i) => ({ icon: 'list', label: l.name + (l.start ? ' ' + l.start : ''), act: 'dk-list', cls: i === DK.at ? 'is-submit' : '', data: { i } }))
    .concat({ icon: 'plus', label: 'New list', act: 'dk-newlist' }) });
  if (DK.say) out.push({ type: 'text', text: DK.say });
  /* THE PRIVATE ADDRESS (owner, 21 Nov: NOW, NEXT step 3): owner-only; asked of the backend (docketAddress) when opened, never kept on the phone. */
  if (typeof may_ === 'function' && may_('owner')) {
    out.push({ type: 'tiles', tiles: [{ icon: 'key', label: text_('dk-addr-show'), act: 'dk-addr', cls: DK.addr != null ? 'is-submit' : '' }] });
    if (DK.addr != null) out.push({ type: 'section', head: text_('dk-addr-head'), blocks: [{ type: 'text', text: text_('dk-addr-say') },
      { type: 'group', look: 'dk-form', inner: formOf_('docket-address', { address: DK.addr }) },
      { type: 'tiles', tiles: [{ icon: 'again', label: text_('dk-addr-new'), act: 'dk-addr-new', tone: 'danger' }] }] });
  }
  if (!L) return out.concat({ type: 'text', text: 'Make a list to start.' });
  out.push({ type: 'group', look: 'tile-row', tiles: [{ icon: 'edit', label: 'Rename', act: 'dk-rename' }, { icon: 'up', label: 'Earlier', act: 'dk-move', data: { by: -1 }, off: DK.at === 0 },
    { icon: 'down', label: 'Later', act: 'dk-move', data: { by: 1 }, off: DK.at === lists.length - 1 }, { icon: 'bin', label: 'Delete list', act: 'dk-droplist', tone: 'danger' }] });
  if (DK.rename) out.push({ type: 'group', look: 'dk-form', inner: formOf_('docket-list', { name: L.name, start: L.start || '' }) },
    { type: 'tiles', tiles: [{ icon: 'save', label: text_('save'), act: 'dk-named', cls: 'is-submit' }] });
  out.push({ type: 'field', cap: 'Add an item', blocks: [{ type: 'control', attrs: { class: 'dk-add', placeholder: 'What to do', maxlength: 300, enterkeyhint: 'done' } }] },
    { type: 'tiles', tiles: [{ icon: 'plus', label: 'Add', act: 'dk-add', cls: 'is-submit' }] });
  dkGroups_(L.items).forEach(g => out.push({ type: 'section', head: g.head, blocks: g.rows.map(i => dkItem_(L.items[i], i)) }));
  const done = L.items.map((it, i) => (dkDone_(it) ? i : -1)).filter(i => i >= 0);
  if (done.length) out.push({ type: 'tiles', tiles: [{ icon: DK.showDone ? 'close' : 'open', label: (DK.showDone ? 'Hide' : 'Show') + ' done (' + done.length + ')', act: 'dk-showdone' }] });
  if (DK.showDone) done.forEach(i => out.push(dkItem_(L.items[i], i)));
  return out;
}
/* NOW, NEXT, ONCE (owner, 21 Nov; Docket step 2): what the widget and the e-ink page both show, worked out here and drawn by each, so the two cannot differ.
   `p` is dkPhase_'s answer; null with no phases. Each row: its `at` ('li:i', the tick's address), title and tags (Missed and its list for a missed one, its time). */
function dkNowNextOf_(lists, p) {
  if (!p) return null;
  const L = lists[p.cur], N = p.next == null ? null : lists[p.next];
  return { name: L.name, head: text_('dk-now-at', { name: L.name, at: p.at }), done: text_('dk-day-done'),
    next: N ? text_('dk-next', { name: N.name, at: p.nextAt }) : text_('dk-next-none'),
    rows: p.rows.map(r => { const it = lists[r.li].items[r.i];
      return { at: r.li + ':' + r.i, title: it.title || 'Untitled', missed: r.missed, tags: [r.missed ? text_('dk-missed') : '', r.missed ? lists[r.li].name : '', it.time || ''].filter(Boolean) }; }) };
}
/* THE PLAIN-TEXT ADDRESS'S ANSWER (owner, 21 Nov: NOW, NEXT step 3): dkNowNextOf_'s plan said in one line, for Siri or any assistant to read aloud.
   The backend says it by this copy (tools/cards-gen.js TAKE), so the address and the widget cannot differ. tools/docket-address.js checks it. */
function dkSay_(m) {
  if (!m) return text_('dk-eink-none');
  const now = m.rows.length ? text_('dk-say-now', { name: m.name, first: m.rows[0].title, left: m.rows.length }) : text_('dk-say-over', { name: m.name });
  return now + ' ' + m.next;
}
/* "DONE SHOWER": the plan's row whose title holds the most of the words said (case ignored, whole words); the first in the plan's order on a tie; -1 for none. */
function dkMatch_(titles, what) {
  const ws = s => String(s || '').toLowerCase().match(/[a-z0-9]+/g) || [], said = ws(what);
  let best = -1, most = 0;
  titles.forEach((t, k) => { const has = new Set(ws(t)), n = said.filter(w => has.has(w)).length; if (n > most) { most = n; best = k; } });
  return best;
}
/* NOW, NEXT AT THE TOP (owner, 21 Nov): the current phase's items, each ticked as Find's are (`data-dkf`), the missed ones after; then the next phase and its time. */
function dkNowNext_(lists, p) {
  const m = dkNowNextOf_(lists, p === undefined ? dkPhase_(lists, dkNow_(), dkFill_) : p);
  if (!m) return [];
  const rows = m.rows.map(r => ({ type: 'group', look: 'dk-item', blocks: [{ type: 'tick', text: r.title, attrs: { 'data-dkf': r.at, checked: false, 'aria-label': 'Done: ' + r.title } },
    r.tags.length ? { type: 'tags', tags: r.tags } : null].filter(Boolean) }));
  return [{ type: 'section', head: m.head, blocks: (rows.length ? rows : [{ type: 'text', text: m.done }]).concat({ type: 'text', text: m.next }) }];
}
/* THE E-INK PAGE (owner, 21 Nov: NOW, NEXT step 2; open the site with ?eink): the widget's Now/Next alone, black on white, large, still. Drawn from dkNowNextOf_
   as the widget is; a tick is the widget's (`data-dkf`, saved by the change handler below). Owner-only: anybody else sees only the way to sign in.
   Redrawn each minute in place (only #eink's inside, and only when it changed), so the screen does not flash. tools/eink.js checks it matches the widget. */
function dkEinkHtml_(lists, p) {
  const m = dkNowNextOf_(lists, p);
  if (!m) return '<p class="ek-say">' + esc(text_('dk-eink-none')) + '</p>';
  const row = r => '<li class="ek-row' + (r.missed ? ' is-missed' : '') + '"><label class="ek-tick">' + formInput_('type="checkbox" data-dkf="' + esc(r.at) + '" aria-label="' + esc('Done: ' + r.title) + '"')
    + '<span class="ek-t">' + esc(r.title) + '</span>' + (r.tags.length ? '<span class="ek-tags">' + esc(r.tags.join(' · ')) + '</span>' : '') + '</label></li>';
  return '<h1 class="ek-now">' + esc(m.head) + '</h1>' + (m.rows.length ? '<ol class="ek-rows">' + m.rows.map(row).join('') + '</ol>' : '<p class="ek-say">' + esc(m.done) + '</p>')
    + '<p class="ek-next">' + esc(m.next) + '</p>';
}
const EINK = /(?:^|[?&])eink(?:[=&]|$)/.test(location.search);
function dkEinkPaint_() {
  let box = $('eink');
  if (!box) { box = document.createElement('main'); box.id = 'eink'; document.body.appendChild(box); document.documentElement.classList.add('eink'); }
  const owner = typeof may_ === 'function' && may_('owner');
  const html = owner ? dkEinkHtml_(dkLoad_(), dkPhase_(dkLoad_(), dkNow_(), dkFill_))
    : '<p class="ek-say"><a class="ek-sign" href="' + esc(location.pathname) + '">' + esc(text_('dk-eink-sign-in')) + '</a></p>';
  if (box.getAttribute('data-was') !== html) { box.innerHTML = html; box.setAttribute('data-was', html); }
}
/* AFTER THE WHOLE FILE HAS RUN (its consts, dkNow_ among them, exist only then); a throw here never stops the app beneath. */
const dkEinkTry_ = () => { try { dkEinkPaint_(); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'map:eink'); } };
if (EINK) { setTimeout(dkEinkTry_, 0); setInterval(dkEinkTry_, 60000); }
function dkPaint_() {
  const box = $('dk-box');
  if (!box) return;
  box.innerHTML = cardBlocks_(dkBlocks_());
}
const dkList_ = () => dkLoad_()[DK.at];
const dkKeep_ = () => { DK.say = ''; dkSave_(); dkPaint_(); };
/* A LIST IS A STEP (owner, 22 Nov, ONE WAY TO OPEN): Back returns to the list that was open. */
on('dk-list', el => { const i = +el.getAttribute('data-i') || 0, was = DK.at; if (i === was) return;
  openStep_({ el, draw: () => { DK.at = i; DK.edit = -1; DK.rename = false; dkPaint_(); }, undo: () => { DK.at = was; DK.edit = -1; DK.rename = false; dkPaint_(); } }); });
on('dk-newlist', () => { const L = dkLoad_(); L.push({ name: 'List ' + (L.length + 1), items: [] }); DK.at = L.length - 1; DK.rename = true; dkKeep_(); });
on('dk-rename', el => { if (DK.rename) { closeStep_(DK.renameStep); DK.rename = false; dkPaint_(); return; }
  DK.renameStep = openStep_({ el, draw: () => { DK.rename = true; dkPaint_(); }, undo: () => { DK.rename = false; dkPaint_(); } }); });
/* A LIST'S NAME AND USUAL START (form `docket-list`): the start kept as 'HH:MM' on the list itself, gone when cleared, so an old list stays as it was. */
on('dk-named', () => { const L = dkList_(), box = $('dk-box'), v = f => String((box.querySelector('[data-dkl="' + f + '"]') || {}).value || '').trim(); if (!L) return;
  if (v('name')) L.name = v('name').slice(0, 80);
  if (/^\d\d:\d\d$/.test(v('start'))) L.start = v('start'); else delete L.start;
  DK.rename = false; stepDone_(DK.renameStep, false); dkKeep_(); });
on('dk-move', el => { const L = dkLoad_(), by = +el.getAttribute('data-by'), j = DK.at + by; if (j < 0 || j >= L.length) return; L.splice(j, 0, L.splice(DK.at, 1)[0]); DK.at = j; dkKeep_(); });
on('dk-droplist', () => { const L = dkLoad_(); if (!L[DK.at] || !confirm('Delete the list "' + L[DK.at].name + '" and everything on it?')) return; L.splice(DK.at, 1); DK.at = 0; dkKeep_(); });
on('dk-add', () => { const inp = $('dk-box').querySelector('.dk-add'), t = String((inp && inp.value) || '').trim(); if (!t || !dkList_()) return; dkList_().items.push({ title: t.slice(0, 300) }); dkKeep_(); const again = $('dk-box').querySelector('.dk-add'); if (again) again.focus(); });
on('dk-edit', el => { const i = +el.getAttribute('data-i'); if (DK.edit === i) { DK.edit = -1; stepDone_(DK.editStep, false); dkPaint_(); return; }
  DK.editStep = openStep_({ el, draw: () => { DK.edit = i; dkPaint_(); }, undo: () => { if (DK.edit === i) { DK.edit = -1; dkPaint_(); } } }); });
on('dk-del', el => { const L = dkList_(); if (!L) return; L.items.splice(+el.getAttribute('data-i'), 1); DK.edit = -1; stepDone_(DK.editStep, false); dkKeep_(); });
on('dk-keep', el => { const it = dkList_() && dkList_().items[+el.getAttribute('data-i')]; if (!it) return;
  $('dk-box').querySelectorAll('.dk-editing .dk-f').forEach(f => { it[f.getAttribute('data-f')] = String(f.value || '').trim(); });
  if (it.repeat !== 'daily') delete it.repeat;
  DK.edit = -1; stepDone_(DK.editStep, false); dkKeep_(); });
on('dk-food', el => { const it = dkList_() && dkList_().items[+el.getAttribute('data-i')]; if (!it) return;
  const f = el.getAttribute('data-f') || ''; if (dkPicked_(it) === f) { it.pick = ''; it.pickOn = ''; } else { it.pick = f; it.pickOn = dkDay_(); } dkKeep_(); });
/* ASKED, NOT KEPT: the token comes from the backend each time, the address is the backend's own URL (API) with it; a new one stops the old. */
const dkAddr_ = renew => Promise.resolve(api({ action: 'docketAddress', personId: (USER && USER.personId) || '', renew: renew ? 1 : '' }))
  .then(d => { if (d && d.token) DK.addr = API + '?docket=' + d.token; else { DK.addr = null; DK.say = (d && d.error) || text_('err-docket-saved'); } dkPaint_(); })
  .catch(() => { DK.addr = null; DK.say = 'Not saved — you look offline.'; dkPaint_(); });
on('dk-addr', () => { if (DK.addr != null) { DK.addr = null; dkPaint_(); } else { DK.addr = ''; dkPaint_(); dkAddr_(false); } });
on('dk-addr-new', () => { if (confirm(text_('dk-addr-new') + '? The old address stops working.')) dkAddr_(true); });
on('dk-showdone', () => { DK.showDone = !DK.showDone; dkPaint_(); });
document.addEventListener('change', e => {
  const el = e.target;
  if (!el || !el.closest || !el.closest('#dk-box') || !el.hasAttribute('data-dk')) return;
  const it = dkList_() && dkList_().items[+el.getAttribute('data-dk')];
  if (!it) return;
  if (it.repeat === 'daily') it.doneOn = el.checked ? dkDay_() : ''; else { it.done = el.checked; it.doneOn = el.checked ? dkDay_() : ''; }
  dkKeep_();
});
/* THE DOCKET IN FIND (owner, 20 Nov): Tools › Docket › a list › its items, each its own card (kinds.json kind `docket`, drawn by `dkCard_` through the one maker).
   The steps are the funnel's: `toolName` names the tool, `docketList` the list (facets.json). A tick here saves as the widget's does (`doneOn` for a daily item). */
/* NOW, NEXT (owner, 20 Nov; rules.json 1.82): a list's order by fixed rules, no AI. Pure: the same items and `now` ('YYYY-MM-DD HH:MM', London's) give the same order.
   Returns the items' indexes: (a) a fixed time kept, the rest flowing round it; (b) runs by itself first, the longest first; (c) the closest deadline; (d) must, then high;
   (e) a hard or dread item, then an easy or enjoy one, in turn, the shorter first; (f) then place. Done items last. tools/docket-plan.js checks it. */
function dkPlan_(items, now) {
  now = String(now || '');
  const day = now.slice(0, 10), hm = s => { const m = /^(\d\d?):(\d\d)/.exec(String(s || '')); return m ? +m[1] * 60 + +m[2] : -1; };
  const IMP = { must: 0, high: 1, normal: 2, low: 3 }, PLACE = { home: 0, anywhere: 1, out: 2 };
  const done = it => (it.repeat === 'daily' ? it.doneOn === day : !!it.done);
  const mins = it => Math.max(1, +it.minutes || 5), runs = it => Math.max(0, +it.runs || 0);
  const fixed = it => hm(it.time) >= 0 && it.timeIs !== 'by' && (it.repeat === 'daily' || !it.date || it.date === day);
  const due = it => { const d = it.repeat === 'daily' ? '' : String(it.date || ''), t = hm(it.time) >= 0 ? String(it.time) : '';
    return t && it.timeIs === 'by' ? (d || day) + ' ' + t : d ? d + ' ' + (t || '99:99') : '~'; };
  const heavy = it => it.effort === 'hard' || it.fun === 'dread';
  const all = (items || []).map((it, i) => ({ it: it || {}, i }));
  const open = all.filter(x => !done(x.it)), fix = open.filter(x => fixed(x.it)).sort((a, b) => hm(a.it.time) - hm(b.it.time) || a.i - b.i);
  const key = x => [runs(x.it) ? 0 : 1, -runs(x.it), due(x.it), IMP[x.it.importance] == null ? 2 : IMP[x.it.importance]];
  const cmpKey = (a, b) => { const p = key(a), q = key(b); for (let k = 0; k < p.length; k++) if (p[k] !== q[k]) return p[k] < q[k] ? -1 : 1; return 0; };
  const tie = (a, b) => mins(a.it) - mins(b.it) || (PLACE[a.it.place] == null ? 1 : PLACE[a.it.place]) - (PLACE[b.it.place] == null ? 1 : PLACE[b.it.place])
    || String(a.it.title || '').localeCompare(String(b.it.title || '')) || a.i - b.i;
  const flex = open.filter(x => !fixed(x.it)).sort((a, b) => cmpKey(a, b) || tie(a, b)), order = [];
  /* (e) WITHIN ONE TIE (same runs, deadline and importance): heavy and light in turn, a heavy one first while you are fresh. */
  for (let s = 0; s < flex.length;) {
    let e = s; while (e < flex.length && !cmpKey(flex[s], flex[e])) e++;
    const h = flex.slice(s, e).filter(x => heavy(x.it)), l = flex.slice(s, e).filter(x => !heavy(x.it));
    while (h.length || l.length) { if (h.length) order.push(h.shift()); if (l.length) order.push(l.shift()); }
    s = e;
  }
  /* (f) BY TITLE (owner, 21 Nov), after (b)–(e): the Jesus prayer opens the list; eating comes before the first workout; a shower comes after the last. */
  const is = (re, x) => re.test(String(x.it.title || '').trim().toLowerCase());
  const OPEN = /^jesus prayer$/, EAT = /\b(meat|rice|food|salmon|beef|eat|carbs?|eggs?|tuna)\b/, WASH = /\bshower\w*/;
  const WORK = /\b(jog\w*|pull ?ups?|curls?|ohp|dips?|rows?|rdls?|push ?ups?|sit ?ups?)\b/;
  const lift = (arr, pick, at) => { const moved = arr.filter(pick), rest = arr.filter(x => !pick(x)); rest.splice(at(rest), 0, ...moved); return rest; };
  let seq = order.filter(x => is(OPEN, x)).concat(order.filter(x => !is(OPEN, x)));
  const w0 = seq.findIndex(x => is(WORK, x));
  if (w0 >= 0) {
    seq = lift(seq, x => seq.indexOf(x) > w0 && is(EAT, x) && !is(WORK, x), r => r.findIndex(x => is(WORK, x)));
    const w1 = seq.length - 1 - seq.slice().reverse().findIndex(x => is(WORK, x));
    seq = lift(seq, x => seq.indexOf(x) < w1 && is(WASH, x) && !is(WORK, x), r => r.length - r.slice().reverse().findIndex(x => is(WORK, x)));
  }
  order.splice(0, order.length, ...seq);
  /* (a) A FIXED TIME: it goes in before the item that would run past it; one whose time has come goes first. Runs-by-itself time is not yours, so only `minutes` count. */
  const out = []; let t = Math.max(0, hm(now.slice(11)));
  const putFixed = x => { out.push(x); t = Math.max(t, hm(x.it.time)) + mins(x.it); };
  order.forEach(x => { while (fix.length && hm(fix[0].it.time) < t + mins(x.it)) putFixed(fix.shift()); out.push(x); t += mins(x.it); });
  fix.forEach(putFixed);
  return out.map(x => x.i).concat(all.filter(x => done(x.it)).map(x => x.i));
}
/* THE WHOLE DAY (owner, 21 Nov: NOW, NEXT): a list with a usual start (`start`, 'HH:MM') is a phase of the day, in start order. Pure, as dkPlan_ is.
   The clock picks the last phase begun (before the first, the first); ticks only push it on: a phase with nothing left gives way to the next. A phase whose time
   has passed with items unticked is skipped, and those items carry over to the current one, marked missed. Returns null with no phases, else
   { cur, next, at, nextAt, rows: [{ li, i, missed }], over }, `rows` the current list in dkPlan_ order then the missed ones. tools/docket-plan.js checks it. */
function dkPhase_(lists, now, fill) {
  now = String(now || ''); fill = fill || (x => x);
  const day = now.slice(0, 10), hm = s => { const m = /^(\d\d?):(\d\d)$/.exec(String(s || '').trim()); return m ? +m[1] * 60 + +m[2] : -1; }, t = Math.max(0, hm(now.slice(11)));
  const done = it => (it.repeat === 'daily' ? it.doneOn === day : !!it.done);
  const ph = (lists || []).map((L, li) => ({ L: L || {}, li, at: hm((L || {}).start) })).filter(x => x.at >= 0).sort((a, b) => a.at - b.at || a.li - b.li);
  if (!ph.length) return null;
  const open = x => (x.L.items || []).map((it, i) => ({ it: it || {}, i })).filter(y => !done(y.it));
  const plan = x => dkPlan_((x.L.items || []).map(fill), now).filter(i => !done((x.L.items || [])[i] || {}));
  let c = 0; ph.forEach((x, k) => { if (x.at <= t) c = k; });
  while (c < ph.length - 1 && !open(ph[c]).length) c++;
  const rows = plan(ph[c]).map(i => ({ li: ph[c].li, i, missed: false }));
  ph.slice(0, c).forEach(x => plan(x).forEach(i => rows.push({ li: x.li, i, missed: true })));
  const hh = x => x.L.start.trim().padStart(5, '0');
  return { cur: ph[c].li, at: hh(ph[c]), next: ph[c + 1] ? ph[c + 1].li : null, nextAt: ph[c + 1] ? hh(ph[c + 1]) : '', rows, over: !rows.length };
}
/* LONDON'S MOMENT, as dkPlan_ reads it. */
const dkNow_ = () => { let t = ''; try { t = new Intl.DateTimeFormat('en-GB', { timeZone: tz_(), hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); } catch (e) { t = ''; }
  return dkDay_() + ' ' + (t || '00:00'); };
/* AN ITEM'S ATTRIBUTES ARE kinds.json docket form `docket-item`: what is not set is that field's `default`, so a title alone is a whole item. */
const dkFields_ = () => ((((ITEM_KINDS.kinds.docket || {}).forms || {})['docket-item'] || {}).fields || []);
const dkFill_ = it => Object.assign({}, ...dkFields_().filter(x => x.default != null).map(x => ({ [x.f]: x.default })),
  ...Object.keys(it || {}).filter(k => it[k] !== '' && it[k] != null).map(k => ({ [k]: it[k] })));
const DKF = { edit: '' };
function dkItems_() {
  if (typeof may_ !== 'function' || !may_('owner')) return [];
  const now = dkNow_();
  return dkLoad_().flatMap((L, li) => {
    const items = L.items || [], order = dkPlan_(items.map(dkFill_), now), firsts = order.filter(i => !dkDone_(items[i])).slice(0, 2);
    /* THE QUICK-ADD CARD heads its list: a title and Enter; the defaults fill the rest. */
    return [{ kind: 'docket', name: 'Add to ' + (L.name || 'the list'), key: 'dk:' + li + ':new', sub: L.name || '', image: '', dkList: L.name || '', dkNew: li, seq: 0, row: {}, text: 'add new ' + (L.name || '') }]
      .concat(order.map((i, n) => { const it = items[i];
        return { kind: 'docket', name: it.title || 'Untitled', key: 'dk:' + li + ':' + i, seq: n + 1, sub: L.name || '', image: '', dkMark: ['Now', 'Next'][firsts.indexOf(i)] || '',
          dkList: L.name || '', dkAt: li + ':' + i, row: it, text: [it.title, it.note, L.name].filter(Boolean).join(' ') }; }));
  });
}
function dkCard_(x) {
  if (x.dkNew != null) return renderCard(shapeCard_('docket', { kind: 'docket', name: x.name, tags: [x.name, x.dkList],
    body: [{ type: 'field', cap: 'Add an item', blocks: [{ type: 'control', attrs: { class: 'dk-qadd', 'data-li': x.dkNew, placeholder: 'What to do, then Enter', maxlength: 300, enterkeyhint: 'done' } }] }],
    tiles: [{ icon: 'plus', label: 'Add', act: 'dk-qadd', cls: 'is-submit', data: { li: x.dkNew } }] }));
  const it = x.row || {}, a = dkFill_(it), when = [it.repeat === 'daily' ? 'Daily' : it.date ? dkSayDay_(it.date) : '', it.time ? (it.timeIs === 'by' ? 'by ' : '') + it.time : ''].filter(Boolean);
  const open = DKF.edit === x.dkAt, spec = dkFields_();
  const form = open ? [{ type: 'group', look: 'dk-form', inner: formOf_('docket-item', a, { options: f => ((spec.find(y => y.f === f) || {}).options || []) }) }] : [];
  return renderCard(shapeCard_('docket', { kind: 'docket', name: it.title || 'Untitled', tags: [it.title || 'Untitled', x.dkMark, a.minutes + ' min', +a.runs ? 'Runs by itself ' + a.runs + ' min' : '', x.dkList].concat(when).filter(Boolean),
    body: [{ type: 'tick', text: 'Done', attrs: { 'data-dkf': x.dkAt, checked: dkDone_(it), 'aria-label': 'Done: ' + (it.title || '') } },
      it.note && !open ? { type: 'text', paras: String(it.note).split(/\n{2,}/) } : null].concat(form).filter(Boolean),
    tiles: open ? [{ icon: 'save', label: text_('save'), act: 'dk-fsave', cls: 'is-submit', data: { at: x.dkAt } }, { icon: 'bin', label: 'Delete', act: 'dk-fdel', tone: 'danger', data: { at: x.dkAt } },
      { icon: 'close', label: 'Close', act: 'dk-fedit', data: { at: x.dkAt } }] : [{ icon: 'edit', label: 'Edit', act: 'dk-fedit', data: { at: x.dkAt } }] }));
}
const dkAt_ = at => { const [li, i] = String(at || '').split(':').map(Number), L = dkLoad_()[li]; return { L, i, it: L && L.items[i] }; };
/* A CHANGE IN FIND IS SAVED AS THE WIDGET'S IS (dkSave_, the backend's todoTidy_), and Find draws its list again in the new order. */
const dkFindKeep_ = () => { dkKeep_(); if (typeof lateCame_ === 'function') lateCame_(); if (EINK) dkEinkTry_(); };
const dkFindDraw_ = () => { if (typeof lateCame_ === 'function') lateCame_(); };
on('dk-fedit', el => { const at = el.getAttribute('data-at') || ''; if (DKF.edit === at) { DKF.edit = ''; stepDone_(DKF.step, false); dkFindDraw_(); return; }
  DKF.step = openStep_({ el, draw: () => { DKF.edit = at; dkFindDraw_(); }, undo: () => { if (DKF.edit === at) { DKF.edit = ''; dkFindDraw_(); } } }); });
/* SAVE KEEPS ONLY WHAT DIFFERS FROM A DEFAULT, so an item's cell stays one line and an old item is never broken. */
on('dk-fsave', el => { const { it } = dkAt_(el.getAttribute('data-at')), card = el.closest('.card'); if (!it || !card) return;
  card.querySelectorAll('[data-dke]').forEach(b => { const f = b.getAttribute('data-dke'), x = dkFields_().find(y => y.f === f) || {}, v = String(b.value || '').trim();
    if (f === 'title') { if (v) it.title = v.slice(0, 300); return; }
    if (v === '' || (x.default != null && v === String(x.default))) delete it[f]; else it[f] = x.type === 'number' ? Math.max(0, Math.round(+v) || 0) : v.slice(0, 8000); });
  if (it.repeat !== 'daily') delete it.repeat;
  DKF.edit = ''; stepDone_(DKF.step, false); dkFindKeep_(); });
on('dk-fdel', el => { const { L, i, it } = dkAt_(el.getAttribute('data-at')); if (!it || !confirm('Delete "' + (it.title || 'this item') + '"?')) return; L.items.splice(i, 1); DKF.edit = ''; stepDone_(DKF.step, false); dkFindKeep_(); });
on('dk-qadd', el => { const card = el.closest('.card'), inp = card && card.querySelector('.dk-qadd'), li = +el.getAttribute('data-li'), L = dkLoad_()[li], t = String((inp && inp.value) || '').trim();
  if (!t || !L) return; L.items.push({ title: t.slice(0, 300) }); dkFindKeep_();
  setTimeout(() => { const again = document.querySelector('.dk-qadd[data-li="' + li + '"]'); if (again) again.focus(); }, 400); });
document.addEventListener('change', e => {
  const el = e.target, at = el && el.getAttribute && el.getAttribute('data-dkf');
  if (!at) return;
  const { it } = dkAt_(at);
  if (!it) return;
  if (it.repeat === 'daily') it.doneOn = el.checked ? dkDay_() : ''; else { it.done = el.checked; it.doneOn = el.checked ? dkDay_() : ''; }
  dkFindKeep_();
});
document.addEventListener('keydown', e => { const c = e.target && e.target.classList; if (e.key !== 'Enter' || !c || typeof ACTIONS === 'undefined') return;
  const act = c.contains('dk-add') ? 'dk-add' : c.contains('dk-qadd') ? 'dk-qadd' : ''; if (act && ACTIONS[act]) { e.preventDefault(); ACTIONS[act](e.target); } });


/* ---------- ASSIGNMENTS (owner, 18 Nov): one list a person, sorted by due date and grouped Overdue / This week / Later / Done, each with its days left,
   size and weight as tags. Added and edited through the one form engine (kinds.json `assignment-new`, asked a field a step), saved whole by `assignmentsSave`.
   A parent sees each child's, a tutor each booked student's (`others`, from `assignmentsOf`), the admin anybody's through the lens; only the person changes theirs. */
const ASG = { of: '', got: {}, add: false, edit: '', say: '' };
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
  const editing = mine && ASG.edit === a.id;
  return { type: 'group', look: 'dk-item', attrs: { 'data-shape': kindShape_('assignment'), 'data-item-kind': 'assignment' }, blocks: [
    { type: 'text', text: [{ b: a.title || 'Untitled' }] },
    when ? { type: 'text', look: 'note', text: when } : null,
    { type: 'tags', tags },
    a.note && !editing ? { type: 'text', paras: String(a.note).split(/\n{2,}/) } : null,
    a.link && !editing ? { type: 'text', text: [{ link: 'Open the link', href: a.link, out: true, look: 'link' }] } : null,
    editing ? { type: 'group', look: 'store-form', inner: askArea_(asgEditForm_(a)) } : null].filter(Boolean),
    tiles: mine ? [{ icon: editing ? 'close' : 'edit', label: editing ? 'Close' : 'Edit', act: 'asg-edit', data: { id: a.id } },
      { icon: 'bin', label: 'Delete', act: 'asg-del', data: { id: a.id } }] : [] };
}
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
