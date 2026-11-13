/* @family. — js/find-doors.js FIND'S FRONT DOORS (batch C): Posts, Messages, Profiles, Settings and Videos as Find items,
   each answering its own menus through the one funnel (FACETS). */

/* THE FRONT DOOR'S FIELD (batch C): Booking, Posts, Practice… are answers to it; `forIs_`, `book-with` and the receipts set and read this, never a literal. */
const DOOR_FIELD = 'kindLabel';

/* ---------- POSTS: state, then who, then when ---------- */
const POST_STATES = ['Approved', 'Waiting for approval', 'Deleted'];
function postState_(p) { return !p ? '' : p.active === false ? 'Deleted' : (p.waiting || p.refused) ? 'Waiting for approval' : 'Approved'; }
/* A TIME FRAME, NOT A DATE: five answers however many posts there are. */
function whenBand_(v) {
  const d = v ? parseWhen(v) : null, t = d && !isNaN(d) ? d.getTime() : 0;
  if (!t) return '';
  const days = (Date.now() - t) / 864e5;
  return days < 1 ? 'Today' : days < 7 ? 'This week' : days < 31 ? 'This month' : days < 366 ? 'This year' : 'Older';
}
function postDoorItems_() {
  const admin = seeMay_('find:all-posts');
  return ((DATA && DATA.posts) || []).filter(p => p && p.id && (admin || postState_(p) === 'Approved' || p.mine)).map(p => {
    const who = (typeof profileOf_ === 'function' && (profileOf_(p.authorId) || {}).handle) || p.handle || p.author || '';
    return { kind: 'post', name: String(p.text || p.caption || p.title || 'Post').slice(0, 80), key: 'post:' + p.id, sub: who, image: '', row: p,
      postState: postState_(p), postBy: who, postWhen: whenBand_(p.at || p.when),
      text: [p.text, p.caption, p.title, p.handle, p.author].filter(Boolean).join(' ') };
  });
}

/* ---------- MESSAGES: one item a person you have messages with; the card is the conversation ---------- */
function msgDoorItems_() {
  if (!USER || typeof messageThreads_ !== 'function') return [];
  if (typeof MESSAGES === 'undefined' || !MESSAGES) doorAsk_(typeof loadMessages === 'function' ? loadMessages() : null);
  const threads = messageThreads_(), had = {};
  threads.forEach(t => { had[norm(t.name)] = 1; });
  /* AND EVERYONE YOU MAY WRITE TO FROM YOUR SESSIONS, with no conversation yet (1040 friction): the card opens on an empty one. */
  const people = [];
  (typeof myJobs_ === 'function' ? myJobs_() : []).forEach(j => (typeof jobPeople_ === 'function' ? jobPeople_(j) : []).forEach(p => {
    if (!had[norm(p.name)]) { had[norm(p.name)] = 1; people.push(p); } }));
  return threads.map(t => ({ kind: 'msg', name: t.name, key: 'msg:' + t.id, sub: '', image: '', thread: t.id,
    msgWith: t.name, text: t.name }))
    .concat(people.map(p => ({ kind: 'msg', name: p.name, key: 'msg:' + (p.id || p.name), sub: '', image: '', to: p, msgWith: p.name, text: p.name })));
}
/* A CONVERSATION'S CARD, around the one card maker: somebody not yet written to gets the form, a thread gets `msgFindCard_`. */
function msgDoorCard_(x, draw) {
  const t = (typeof messageThreads_ === 'function' ? messageThreads_() : []).find(t2 => t2.id === x.thread);
  if (!t && x.to) return card_(`<div class="dm-card"><div class="dm-head"><h3>${esc(x.name)}</h3></div>
    ${msgForm_(x.to.name, x.to.id)}</div>`);
  if (!t) return renderCard({ kind: 'msg', tags: [{ text: x.name, colour: 0 }] });
  return msgFindCard_(x, t, draw);
}
window.KC_AROUND = Object.assign(window.KC_AROUND || {}, { msg: msgDoorCard_ });

/* ---------- PROFILES: who they are is the menu; admin-only answers are asked by rank ---------- */
function profileTypes_(p, tutor) {
  const out = [], role = String((p && p.role) || ''), admin = seeMay_('find:admin-tags');
  if (tutor || /tutor|teacher/i.test(role)) out.push('Tutor');
  if (/student|child/i.test(role)) out.push('Student');
  if (/client|parent/i.test(role)) out.push('Parent');
  if (admin) {
    if (/apprentice/i.test(role)) out.push('Apprentice');
    if (/admin/i.test(role)) out.push('Admin');
    const age = Number(p && p.age);
    if (age > 0) out.push(age >= 18 ? 'Over 18' : 'Under 18');
    else if (p && p.over18 !== undefined && p.over18 !== '') out.push(p.over18 === true || /^(true|yes|1)$/i.test(String(p.over18)) ? 'Over 18' : 'Under 18');
  }
  return out;
}
function profileDoorItems_() {
  const seen = {}, out = [];
  const add = (p, tutor) => {
    const id = String(p.personId || p.title || p.handle || '');
    if (!id || seen[id]) return;
    seen[id] = 1;
    /* FIRST NAME AND AN INITIAL, WITH ITS CAPITAL (`displayName_`): "fin" is shown "Fin". */
    out.push({ kind: 'person', name: displayName_(p) || p.handle, key: 'person:' + id, sub: '', image: p.image || '', row: p,
      profileType: profileTypes_(p, tutor), text: [p.title, p.name, p.handle, p.role].filter(Boolean).join(' ') });
  };
  /* Tutors are Booking's tutor items, tagged Profiles too (KIND_UNDER): never a second card here. */
  ((DATA && DATA.tutors) || []).forEach(t => { if (t) seen[String(t.personId || t.title || t.handle || '')] = 1; });
  if (seeMay_('find:all-people')) ((DATA && DATA.everyone) || []).filter(p => p && p.title).forEach(p => add(p, false));
  /* ADD A PERSON (add-person): one card for an admin, first among the people, drawn by `personAddCard_` (me-people.js). */
  if (typeof personAddMay_ === 'function' && personAddMay_()) out.unshift({ kind: 'person', add: true, name: 'Add a person', key: 'person:add', sub: '',
    image: '', row: {}, profileType: ['Student', 'Parent', 'Tutor'], text: 'add a person new account student parent tutor' });
  return out;
}
/* PICTURE FIRST: the face fills the top of the card, the name under it; everything else is a tag. */
function profileDoorCard_(x) {
  if (x.add) return typeof personAddCard_ === 'function' ? personAddCard_() : '';
  const t = x.row || {};
  /* NO FACE, NO LETTER: the card draws its own default picture, so a lone initial would only stand beside the handle. */
  return `<div class="is-prof prof-door">${!(t.image || t.avatar) ? '' : personFace_({ pic: t.image, avatar: t.avatar, handle: t.handle, name: t.title || t.name, personId: t.personId },
    { cls: 'prof-big', none: 'prof-none', size: 160 })}<h3>${esc(x.name)}</h3>${t.handle ? `<span class="prof-handle">@${esc(t.handle)}</span>` : ''}
    ${tileRow_((typeof peopleOpts_ === 'function' ? tile_(peopleOpts_(t)) : ''), 'person-tiles')}${typeof personEdHtml_ === 'function' ? personEdHtml_(t) : ''}</div>`;
}

/* ---------- SETTINGS BY ACCOUNT TYPE: each settings card has one home, Find › Settings › its type ---------- */
/* WHICH COLUMN'S CARDS ANSWER WHICH TYPE, IN THE MENU'S ORDER: setting-for.json's `type:` rows; who opens each is permissions.json's `see` rows. */
/* Used only while setting-for.json has no `type:` rows, so an empty sheet still has its Settings doors; who opens them is still the table. */
const SETTING_TYPES_FALLBACK = [['Student', 'account', 1], ['Parent', 'family', 1], ['Staff', 'staff', 1], ['Apprentice', 'apprentice', 1], ['Admin', ''],
  ['Business', 'biz'], ['Site', 'site']].map(([type, col, peek]) => ({ type, col, peek: !!peek }));
function settingTypes_() {
  let rows = [];
  try { const t = (DATA && DATA.settingFor) || {}; rows = Object.keys(t).filter(k => /^type:/.test(k)).sort((a, b) => (t[a].rank || 0) - (t[b].rank || 0))
    .map(k => ({ type: k.slice(5), col: t[k].col || '', peek: !!t[k].peek })); } catch (e) { rows = []; }
  return rows.length ? rows : SETTING_TYPES_FALLBACK;
}
/* WHO MAY SEE A SETTING, A DOOR OR A TYPE IS DATA (86a): one question, `seeMay_` (data.js); absent a row, an admin's only. */
const settingMay_ = key => typeof seeMay_ === 'function' && seeMay_(key);
/* AN ITEM'S ACCOUNT-TYPE TAGS: setting-for.json's `under` (menu grouping, not who sees it), else its home type. */
function settingTagsOf_(id, home) {
  let row = null; try { row = ((DATA && DATA.settingFor) || {})[id] || null; } catch (e) { row = null; }
  return row && row.under && row.under.length ? row.under.slice() : [home];
}
const settingSeeRow_ = id => { try { return (((DATA && DATA.permissions) || {}).see || {})[id] || null; } catch (e) { return null; } };
const cardTitle_ = h => (String(h).match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1];
/* A TITLE CUT FROM DRAWN HTML IS STILL ESCAPED; it is esc()'d again where it is shown, so it goes back to plain text ("Contact &amp; address"). */
const plain_ = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
/* ONE COLUMN'S CARDS, grouped as the layout groups them (a card of several pages is one item). */
/* NOT FROM INSIDE ITSELF: a settings card that counts Find's items (What's missing) would build these again, without end. */
let SETTING_BUILDING = false;
function settingGroups_(col) {
  if (SETTING_BUILDING) return [];
  let raw = [];
  SETTING_BUILDING = true;
  try { raw = (typeof CARD_BUILD !== 'undefined' && CARD_BUILD[col] ? CARD_BUILD[col]() || [] : []).filter(Boolean); } catch (e) { oops_(e, 'doors:' + col); raw = []; } finally { SETTING_BUILDING = false; }
  return typeof cardGroups_ === 'function' ? cardGroups_(raw) : raw.map(h => ({ id: '', pages: [h] }));
}
/* A SETTING'S NAME: its title, else what the data or the card's label calls it; never "Student setting 3". */
function settingName_(html, id, row) {
  const reg = id && typeof cardReg_ === 'function' ? cardReg_(id) : null;
  return (row && row.name) || plain_(cardTitle_(html)) || plain_((String(html).match(/^\s*<div\b[^>]*\saria-label="([^"]+)"/) || [])[1])
    || (reg && reg.label) || '';
}
/* A COLUMN'S PADLOCK, "NOTHING HERE" LINE OR A TITLE-ONLY PLACEHOLDER IS NOT A SETTING. */
const settingNone_ = h => /^\s*<div class="card [^"]*\b(?:rank-off|set-none|own-lock)\b/.test(h);
/* EVERY SETTING ONCE (owner, 7 Nov): its `see` rows tag it with each account type; one of the same name joins it. */
/* A type you do not hold still shows its cards, shut (`lockedAs_`); Business and Site hold the business's own data, so stay an admin's. */
function settingDoorItems_() {
  /* SIGN IN AND JOIN ARE FORMS (owner, 10 Nov): drawn open, never a closed card cut to two lines. */
  if (!USER) return [{ kind: 'setting', name: 'Sign in or join', key: 'set:signin', sub: '', image: '', signIn: true, open: true, text: 'sign in join make an account pin' }];
  const tags = (DATA && DATA.settingFor) || {}, out = [], byName = {}, seen = {};
  /* RECORDS ARE LAZY (the weekly email's cards): until that batch lands they are missing, so Find is drawn again once it does. */
  try { if (typeof lazyFiles_ === 'function' && !lazyFiles_.in) doorAsk_(lazyFiles_()); } catch (e) { /* drawn without them; the next paint has them */ }
  const add = (name, id, part, type, mine) => {
    const row = tags[id], fr = settingTagsOf_(id, type);
    const x = byName[norm(name)];
    if (x) { x.parts.push(part); if (row && (row.rank || 0) < x.rank) x.rank = row.rank || 0; fr.forEach(t => { if (x.settingFor.indexOf(t) === -1) x.settingFor.push(t); }); x.mine = x.mine || mine; return; }
    const it = { kind: 'setting', name: name, key: 'set:' + (id || part.col + ':' + part.at), sub: '', image: '', parts: [part], mine: mine, settingFor: fr.slice(), rank: row ? row.rank || 0 : 5000 + out.length };
    byName[norm(name)] = it; out.push(it);
  };
  if (isAdmin()) add(lensOn_() ? 'Viewing ' + (whose_().name || 'somebody') : 'View as', 'lens', { lens: true }, 'Student', true);
  settingTypes_().forEach(({ type, col, peek }) => {
    /* IN THE LENS, ONLY THE PERSON'S OWN COLUMNS: Business and Site are the business's, not theirs. */
    if (!col || (lensOn_() && LENS_COLS_.indexOf(col) === -1)) return;
    const ok = settingMay_('type:' + type);
    if (!ok && !peek) return;
    settingGroups_(col).forEach((g, i) => {
      const html = g.pages.join('');
      if (settingNone_(html) || (g.id && seen[g.id])) return;
      if (g.id) seen[g.id] = 1;
      const name = settingName_(html, g.id, tags[g.id]);
      /* A CARD WITH ITS OWN `see` ROWS IS YOURS ONLY IF THEY LET YOU (86a); one without keeps its type's answer. */
      const own = !g.id || !settingSeeRow_(g.id) || settingMay_(g.id);
      if (name) add(name, g.id, { col: col, at: i, id: g.id || '' }, type, own && (ok || /^\s*<div\b[^>]*\bdata-yours="1"/.test(html)) && !/^\s*<div\b[^>]*\bis-locked\b/.test(html));
    });
  });
  if (settingMay_('door:notify') && !lensOn_()) add('Notifications', 'set:notify', { notify: true }, 'Business', true);
  const lens = out.find(x => x.key === 'set:lens');
  if (lens) { lens.rank = -1; lens.open = true; lens.settingFor = settingTypes_().map(t => t.type); }
  /* ORDER IS DATA (setting-for.json's rows, types too); an untagged card keeps its column's place after them. */
  out.sort((a, b) => a.rank - b.rank);
  const order = settingTypes_().map(t => t.type);
  out.forEach(x => { x.settingFor.sort((a, b) => order.indexOf(a) - order.indexOf(b)); x.text = x.name + ' ' + x.settingFor.join(' ') + ' settings'; });
  return out;
}
function settingPart_(p) {
  if (p.lens) return lensCard_();
  if (p.notify) return notifyDoorCard_();
  const gs = settingGroups_(p.col), g = (p.id && gs.find(k => k.id === p.id)) || gs[p.at];
  return g ? g.pages.join('').replace(/<!--(card|person):[^>]*-->/g, '') : '';
}
function settingDoorCard_(x) {
  if (x.signIn) { if (typeof mountGoogleWhenDrawn === 'function') mountGoogleWhenDrawn(); return (typeof signInCard_ === 'function' ? signInCard_() : '') + (typeof registerCard_ === 'function' ? registerCard_() : ''); }
  if (x.notify) return notifyDoorCard_();
  return (x.parts || [{ col: x.setCol, at: x.setAt, id: x.setId }]).map(settingPart_).join('');
}
/* ---------- THE ADMIN'S LENS (owner, 13 Nov): Find › Settings drawn as somebody else's, every card through `whose_()` (data-who.js) ---------- */
const LENS_COLS_ = ['account', 'family', 'staff'];
/* THE PICKER, OR THE BANNER: a removable tag like the top bar's name, its ✕ back to your own settings. */
CARD_EMBEDS['lens-pick'] = () => famPick_('lens', 'any', 'Somebody\'s settings');
CARD_EMBEDS['lens-tag'] = () => {
  const who = String(whose_().name || whose_().handle || 'somebody'), label = 'Back to your own settings';
  return qtag_(`Viewing ${esc(who)}'s settings${tile_({ icon: 'close', label: label, act: 'lens-off', cls: 'chip-x' })}`,
    ` data-do="lens-off" role="button" tabindex="0" aria-label="${esc(label)}"`, 'sm lens-tag', 'chip');
};
function lensCard_() {
  if (!isAdmin()) return '';
  const on = lensOn_();
  return renderCard({ kind: 'panel', look: 'lens-card' + (on ? ' is-lens' : ''), tags: [{ text: on ? 'Viewing as' : 'View as', colour: 0 }],
    body: on ? [{ type: 'embed', tool: 'lens-tag' }] : [{ type: 'embed', tool: 'lens-pick' }, { type: 'text', text: ' ', look: 'lens-said' }] });
}
/* FIND'S MEMOS DROPPED, so the settings items are built again for whoever the lens is on now. */
function lensRedraw_() {
  try { FUNNEL_MEMO.from = null; ITEM_MEMO.from = null; ALL_MEMO.from = null; } catch (e) { /* no memo yet: the next paint builds them */ }
  try { if (typeof paintStuff === 'function') inFinder_(FINDER, () => paintStuff(true)); } catch (e) { oops_(e, 'lens:redraw'); }
}
/* THEIR SETTINGS, ASKED FOR: `lensOpen` is an admin's alone (permissions.json); nobody else's tap gets this far. */
on('lens-pick', el => {
  const id = (el && el.getAttribute('data-id')) || '';
  if (!isAdmin() || !id) return;
  const card = el.closest('.lens-card'), said = card && card.querySelector('.lens-said');
  send_({ action: 'lensOpen', name: USER.name, personId: USER.personId || '', targetId: id }, { button: el, where: said || undefined })
    .then(d => { if (!isAdmin() || !d || !d.personId) return; LENS = Object.assign({ lens: true }, d); lensRedraw_(); })
    .catch(() => {});
});
on('lens-off', () => { LENS = null; lensRedraw_(); });

/* WHAT THE TOP BAR'S RED DOT USED TO SAY (owner, 6 Nov): each Business or Site card that needs you, by name, with a way there. */
function notifyDoorCard_() {
  const needs = typeof BIZ_NEEDS !== 'undefined' ? Object.keys(BIZ_NEEDS).filter(k => BIZ_NEEDS[k] > 0) : [];
  const waiting = ((DATA && DATA.posts) || []).filter(p => p && p.active !== false && p.waiting).length;
  const rows = needs.map(k => ({ label: k.replace(/[-_]/g, ' '), value: String(BIZ_NEEDS[k]) }))
    .concat(waiting ? [{ label: 'posts waiting for approval', value: String(waiting) }] : []);
  return renderCard({ kind: 'panel', look: 'notify-door', tags: [{ text: 'Notifications', colour: 0 }],
    body: [rows.length ? { type: 'list', items: rows } : { type: 'text', text: 'Nothing needs you.' }] });
}

/* A LIST THAT COMES LATER (messages) joins Find when it lands: the memo is dropped and Find repainted once. */
const DOOR_ASKED = new Set();
function doorAsk_(p) {
  if (!p || DOOR_ASKED.has(p) || typeof p.then !== 'function') return;
  DOOR_ASKED.add(p);
  p.then(() => {
    FUNNEL_MEMO.from = null; ITEM_MEMO.from = null; ALL_MEMO.from = null;
    try { if (typeof paintStuff === 'function') inFinder_(FINDER, () => paintStuff(true)); } catch (e) { oops_(e, 'doors:late'); }
  }).catch(() => {});
}

/* EVERY DOOR'S ITEMS, in the front menu's order; signed out, only Settings (`finder-members`, rules.js). */
function doorItems_() {
  return [].concat(postDoorItems_(), msgDoorItems_(), profileDoorItems_(), settingDoorItems_());
}
/* SETTINGS ONLY (owner, 7 Nov): no Venues or Booking on the signed-out front. */
function findSignedOut_(x) { return kindTop_(x) === 'Settings'; }

/* ---------- VENUES: every building the booking form offers (items: stuffItemsRaw_), the facts as tags on top, as on a person card, then the picture ---------- */
/* 8-BIT BUILDINGS, drawn by pixSvg_ (find-boxers.js): a shape per kind of building, picked off the venue's name. */
const VENUE_PIX = {
  library: ['', '', '.......kk', '......kssk', '.....kssssk', '....kssssssk', '...kkkkkkkkkk', '...kwwwwwwwwk', '...kckcwwckck', '...kckcwwckck', '...kwwwwwwwwk',
    '...kckckkckck', '...kckctnckck', '...kwwwtnwwwk', '.kkkkkkkkkkkkkk', '.ssssssssssssss'],
  church: ['', '.......y', '......kyk', '......kwk', '......kwk', '.....kkwkk', '.....kwwwk', '..kkkkwcwkkkk', '..kwwwwcwwwwk', '..kwckwwwkcwk', '..kwckwwwkcwk',
    '..kwwwwwwwwwk', '..kwwwktkwwwk', '..kwwwktkwwwk', '.kkkkkkkkkkkkkk', '.ggggggggggggggg'],
  school: ['', '', '.......rr', '.......kr', '.......k', '..kkkkkkkkkkk', '..krrrrrrrrrk', '..kwwwwwwwwwk', '..kckckwkckck', '..kckckwkckck', '..kwwwwwwwwwk',
    '..kckckkkckck', '..kwwwktkwwwk', '..kwwwktkwwwk', '.kkkkkkkkkkkkkk', '.ggggggggggggggg'],
  hall: ['', '', '', '', '...kkkkkkkkkk', '..kttttttttttk', '.kttttttttttttk', '.kwwwwwwwwwwwwk', '.kwckwckwckwckk', '.kwckwckwckwckk', '.kwwwwwwwwwwwwk',
    '.kwwwwwkkwwwwwk', '.kwwwwwknwwwwwk', '.kwwwwwknwwwwwk', 'kkkkkkkkkkkkkkkk', 'gggggggggggggggg'],
  house: ['', '', '', '.......kk', '......krrk', '.....krrrrk', '....krrrrrrk', '...krrrrrrrrk', '....kwwwwwwk', '....kckwwckk', '....kckwwckk',
    '....kwwwwwwk', '....kwwtwwwk', '....kwwtwwwk', '..kkkkkkkkkkkk', '..gggggggggggg'],
};
function venueShape_(v) {
  const s = [v.title, v.description, [].concat(v.focus || []).join(' ')].join(' ');
  return /librar/i.test(s) ? 'library' : /church|chapel|synagogue|mosque|temple/i.test(s) ? 'church'
    : /school|college|academy|universit/i.test(s) ? 'school' : /home|house|flat/i.test(s) ? 'house' : 'hall';
}

/* AN OLD SETTINGS COLUMN ASKED FOR BY NAME (a tile, a link) opens Find › Settings › its type instead. */
function findSettings_(type) {
  try {
    inFinder_(FINDER, () => {
      STUFF.filters = [{ field: 'kindLabel', value: 'Settings' }].concat(USER && type ? [{ field: 'settingFor', value: type }] : []);
      findShow_();
    });
    go(FINDER.id);
    inFinder_(FINDER, () => paintStuff());
  } catch (e) { oops_(e, 'doors:settings'); }
}
/* A SWITCHED-OFF COLUMN THAT MOVED INTO FIND (screens-moved.json): Settings for its account type, or its kind's door. */
function screenGone_(id) {
  const to = String(screenMoved_()[id] || '').split(':');
  if (to[0] !== 'find' || !to[1] || TABS.some(t => t.id === id)) return false;
  if (to[1] === 'Settings') { findSettings_(to[2] || ''); return true; }
  try { if (typeof OPEN_JOB !== 'undefined' && OPEN_JOB) BOOK_OPEN = false; } catch (e) { oops_(e, 'doors:gone'); }
  finderSet_(FINDERS.stuff, { filters: [{ field: DOOR_FIELD, value: to[1] }], show: true }); go('stuff'); return true;
}
