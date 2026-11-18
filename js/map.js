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
const DK = { lists: null, at: 0, edit: -1, rename: false, showDone: false, say: '' };
const dkDay_ = d => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const dkDone_ = i => (i.repeat === 'daily' ? i.doneOn === dkDay_() : !!i.done);
function dkLoad_() {
  if (DK.lists) return DK.lists;
  const raw = String((typeof USER !== 'undefined' && USER && USER.todo) || '');
  let got = null;
  try { got = JSON.parse(raw); } catch (e) { got = null; }
  /* AN OLD DOCKET WAS LINES OF TEXT: each line an item of one list. */
  DK.lists = got && Array.isArray(got.lists) ? got.lists
    : raw.trim() ? [{ name: 'Docket', items: raw.split('\n').map(t => t.trim()).filter(Boolean).map(title => ({ title })) }] : [];
  return DK.lists;
}
function dkSave_() {
  const todo = JSON.stringify({ v: 1, lists: DK.lists });
  if (typeof USER !== 'undefined' && USER) { USER.todo = todo; if (typeof saveUser_ === 'function') saveUser_(); }
  Promise.resolve(api({ action: 'item', door: 'save', item: 'todo', personId: (USER && USER.personId) || '', todo }))
    .then(d => { if (!(d && d.success)) { DK.say = (d && d.error) || 'Not saved — try again.'; dkPaint_(); } })
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
    tiles: [{ icon: 'save', label: 'Save', act: 'dk-keep', cls: 'is-submit', data: { i } }] };
}
function dkBlocks_() {
  const lists = dkLoad_();
  if (DK.at >= lists.length) DK.at = Math.max(0, lists.length - 1);
  const L = lists[DK.at];
  const out = [{ type: 'group', look: 'tile-row dk-lists', tiles: lists.map((l, i) => ({ icon: 'list', label: l.name, act: 'dk-list', cls: i === DK.at ? 'is-submit' : '', data: { i } }))
    .concat({ icon: 'plus', label: 'New list', act: 'dk-newlist' }) }];
  if (DK.say) out.push({ type: 'text', text: DK.say });
  if (!L) return out.concat({ type: 'text', text: 'Make a list to start.' });
  out.push({ type: 'group', look: 'tile-row', tiles: [{ icon: 'edit', label: 'Rename', act: 'dk-rename' }, { icon: 'up', label: 'Earlier', act: 'dk-move', data: { by: -1 }, off: DK.at === 0 },
    { icon: 'down', label: 'Later', act: 'dk-move', data: { by: 1 }, off: DK.at === lists.length - 1 }, { icon: 'bin', label: 'Delete list', act: 'dk-droplist', tone: 'danger' }] });
  if (DK.rename) out.push({ type: 'field', cap: 'List name', blocks: [{ type: 'control', attrs: { class: 'dk-name', value: L.name, maxlength: 80 } }] },
    { type: 'tiles', tiles: [{ icon: 'save', label: 'Save name', act: 'dk-named', cls: 'is-submit' }] });
  out.push({ type: 'field', cap: 'Add an item', blocks: [{ type: 'control', attrs: { class: 'dk-add', placeholder: 'What to do', maxlength: 300, enterkeyhint: 'done' } }] },
    { type: 'tiles', tiles: [{ icon: 'plus', label: 'Add', act: 'dk-add', cls: 'is-submit' }] });
  dkGroups_(L.items).forEach(g => out.push({ type: 'section', head: g.head, blocks: g.rows.map(i => dkItem_(L.items[i], i)) }));
  const done = L.items.map((it, i) => (dkDone_(it) ? i : -1)).filter(i => i >= 0);
  if (done.length) out.push({ type: 'tiles', tiles: [{ icon: DK.showDone ? 'close' : 'open', label: (DK.showDone ? 'Hide' : 'Show') + ' done (' + done.length + ')', act: 'dk-showdone' }] });
  if (DK.showDone) done.forEach(i => out.push(dkItem_(L.items[i], i)));
  return out;
}
function dkPaint_() {
  const box = $('dk-box');
  if (!box) return;
  box.innerHTML = cardBlocks_(dkBlocks_());
}
const dkList_ = () => dkLoad_()[DK.at];
const dkKeep_ = () => { DK.say = ''; dkSave_(); dkPaint_(); };
on('dk-list', el => { DK.at = +el.getAttribute('data-i') || 0; DK.edit = -1; DK.rename = false; dkPaint_(); });
on('dk-newlist', () => { const L = dkLoad_(); L.push({ name: 'List ' + (L.length + 1), items: [] }); DK.at = L.length - 1; DK.rename = true; dkKeep_(); });
on('dk-rename', () => { DK.rename = !DK.rename; dkPaint_(); });
on('dk-named', () => { const v = ($('dk-box').querySelector('.dk-name') || {}).value; if (dkList_() && String(v || '').trim()) dkList_().name = String(v).trim().slice(0, 80); DK.rename = false; dkKeep_(); });
on('dk-move', el => { const L = dkLoad_(), by = +el.getAttribute('data-by'), j = DK.at + by; if (j < 0 || j >= L.length) return; L.splice(j, 0, L.splice(DK.at, 1)[0]); DK.at = j; dkKeep_(); });
on('dk-droplist', () => { const L = dkLoad_(); if (!L[DK.at] || !confirm('Delete the list "' + L[DK.at].name + '" and everything on it?')) return; L.splice(DK.at, 1); DK.at = 0; dkKeep_(); });
on('dk-add', () => { const inp = $('dk-box').querySelector('.dk-add'), t = String((inp && inp.value) || '').trim(); if (!t || !dkList_()) return; dkList_().items.push({ title: t.slice(0, 300) }); dkKeep_(); const again = $('dk-box').querySelector('.dk-add'); if (again) again.focus(); });
on('dk-edit', el => { const i = +el.getAttribute('data-i'); DK.edit = DK.edit === i ? -1 : i; dkPaint_(); });
on('dk-del', el => { const L = dkList_(); if (!L) return; L.items.splice(+el.getAttribute('data-i'), 1); DK.edit = -1; dkKeep_(); });
on('dk-keep', el => { const it = dkList_() && dkList_().items[+el.getAttribute('data-i')]; if (!it) return;
  $('dk-box').querySelectorAll('.dk-editing .dk-f').forEach(f => { it[f.getAttribute('data-f')] = String(f.value || '').trim(); });
  if (it.repeat !== 'daily') delete it.repeat;
  DK.edit = -1; dkKeep_(); });
on('dk-food', el => { const it = dkList_() && dkList_().items[+el.getAttribute('data-i')]; if (!it) return;
  const f = el.getAttribute('data-f') || ''; if (dkPicked_(it) === f) { it.pick = ''; it.pickOn = ''; } else { it.pick = f; it.pickOn = dkDay_(); } dkKeep_(); });
on('dk-showdone', () => { DK.showDone = !DK.showDone; dkPaint_(); });
document.addEventListener('change', e => {
  const el = e.target;
  if (!el || !el.closest || !el.closest('#dk-box') || !el.hasAttribute('data-dk')) return;
  const it = dkList_() && dkList_().items[+el.getAttribute('data-dk')];
  if (!it) return;
  if (it.repeat === 'daily') it.doneOn = el.checked ? dkDay_() : ''; else it.done = el.checked;
  dkKeep_();
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.classList && e.target.classList.contains('dk-add') && typeof ACTIONS !== 'undefined' && ACTIONS['dk-add']) { e.preventDefault(); ACTIONS['dk-add'](e.target); } });


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
  return n < 0 ? (-n) + ' day' + (n === -1 ? '' : 's') + ' late' : n === 0 ? 'Due today' : n === 1 ? 'Due tomorrow' : n + ' days left';
}
function asgItem_(a, i, mine) {
  const size = a.amount !== '' && a.amount != null ? Number(a.amount).toLocaleString('en-GB') + (a.unit ? ' ' + asgSay_('unit', a.unit) : '') : '';
  const tags = [asgLeftSay_(a), a.kind ? asgSay_('kind', a.kind) : '', size, a.weight !== '' && a.weight != null ? a.weight + '%' : '',
    asgSay_('status', a.status || 'not-started') + (a.status === 'marked' && a.mark ? ': ' + a.mark : '')].filter(Boolean);
  const when = [a.course, a.due ? dkSayDay_(a.due) + (a.time ? ', ' + a.time : '') : ''].filter(Boolean).join(' · ');
  const editing = mine && ASG.edit === a.id;
  return { type: 'group', look: 'dk-item asg-item', blocks: [
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
    .then(d => { if (!(d && d.success)) { ASG.say = (d && d.error) || 'Not saved — try again.'; asgPaint_(); return false; }
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
  asgSave_(rows).then(ok => { if (ok) toast('Saved.'); });
}
FORM_SEND_[ASG_FORM] = v => asgSend_(ASG_FORM, v, '');
on('asg-add', () => { ASG.add = !ASG.add; asgPaint_(); });
on('asg-who', el => { ASG.of = String(el.dataset.id || ''); ASG.add = false; ASG.edit = ''; asgPaint_(); });
on('asg-edit', el => { const id = String(el.dataset.id || ''); delete ASK[ASG_FORM + '@' + id]; ASG.edit = ASG.edit === id ? '' : id; asgPaint_(); });
on('asg-del', el => { const id = String(el.dataset.id || ''), rows = ((ASG.got[asgMe_()] || {}).rows || []), a = rows.find(r => r.id === id);
  if (!a || !confirm('Delete "' + (a.title || 'this assignment') + '"?')) return;
  asgSave_(rows.filter(r => r.id !== id)); });
