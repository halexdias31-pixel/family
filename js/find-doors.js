/* @family. — js/find-doors.js FIND'S FRONT DOORS (batch C): Posts, Profiles, Settings and Videos as Find items,
   each answering its own menus through the one funnel (facetList). */

/* THE FRONT DOOR'S FIELD (batch C): Booking, Posts, Practice… are answers to it; `forIs_`, `book-with` and the receipts set and read this, never a literal. */
const DOOR_FIELD = 'kindLabel';

function postState_(p) { const [ok, waiting, gone] = DOOR_WORDS.postState; return !p ? '' : p.active === false ? gone : (p.waiting || p.refused) ? waiting : ok; }
/* A TIME FRAME, NOT A DATE: five answers however many posts there are. */
function whenBand_(v) {
  const d = v ? parseWhen(v) : null, t = d && !isNaN(d) ? d.getTime() : 0;
  if (!t) return '';
  const days = (Date.now() - t) / 864e5;
  const [today, week, month, year, older] = DOOR_WORDS.when;
  return days < 1 ? today : days < 7 ? week : days < 31 ? month : days < 366 ? year : older;
}
function postDoorItems_() {
  const admin = seeMay_('find:all-posts');
  return ((DATA && DATA.posts) || []).filter(p => p && p.id && (admin || postState_(p) === DOOR_WORDS.postState[0] || p.mine)).map(p => {
    const who = (typeof profileOf_ === 'function' && (profileOf_(p.authorId) || {}).handle) || p.handle || p.author || '';
    return { kind: 'post', name: String(p.text || p.caption || p.title || 'Post').slice(0, 80), key: 'post:' + p.id, sub: who, image: '', row: p,
      postState: postState_(p), postBy: who, postWhen: whenBand_(p.at || p.when),
      text: [p.text, p.caption, p.title, p.handle, p.author].filter(Boolean).join(' ') };
  });
}


/* ---------- PROFILES: who they are is the menu; admin-only answers are asked by rank ---------- */
function profileTypes_(p, tutor) {
  const out = [], role = String((p && p.role) || ''), admin = seeMay_('find:admin-tags');
  /* STAFF IS THE CATEGORY (owner, 17 Nov); Tutor, Coach, Head of Boxing are roles inside it, so a coach is found under Staff. */
  const titles = Object.keys(((SHARED_SETTINGS.roles || {}).titles) || {}).join('|');
  if (tutor || /tutor|teacher|staff/i.test(role) || (titles && new RegExp(titles, 'i').test(role + ' ' + [].concat((p && p.titles) || []).join(' ')))) out.push('Staff');
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
    out.push({ kind: 'person', name: fmtName_(p) || p.handle, key: 'person:' + id, sub: '', image: p.image || '', row: p,
      profileType: profileTypes_(p, tutor), text: [p.title, p.name, p.handle, p.role].filter(Boolean).join(' ') });
  };
  /* Tutors are Booking's tutor items, tagged Profiles too (kinds.json `find.under`): never a second card here. */
  ((DATA && DATA.tutors) || []).forEach(t => { if (t) seen[String(t.personId || t.title || t.handle || '')] = 1; });
  if (seeMay_('find:all-people')) ((DATA && DATA.everyone) || []).filter(p => p && p.title).forEach(p => add(p, false));
  /* ADD A PERSON (add-person): one card for an admin, in Settings › Admin beside the other admin tools (owner, 17 Nov), not atop Profiles; drawn by `personAddCard_` (me-people.js). */
  if (typeof personAddMay_ === 'function' && personAddMay_()) out.push({ kind: 'setting', settingFor: 'Admin', add: true, parts: [], ownCard: true, name: 'Add a person', key: 'person:add', sub: '',
    image: '', row: {}, text: 'add a person new account student parent staff tutor' });
  return out;
}
/* A PERSON'S DOOR IS ITS ITEM MAP (ITEM_MAPS.person, cards-parts.js): the face, the name and facets as tags, the handle; an admin's tiles, */
/* and the Edit form while it is open (`personDoorBody_`). */
const personDoorBody_ = t => [t.handle ? { type: 'text', text: '@' + t.handle } : null,
  typeof PERSON_ED_ !== 'undefined' && PERSON_ED_ && String(PERSON_ED_.id) === String(t.personId) ? { type: 'embed', tool: 'person-edit', args: { row: t } } : null].filter(Boolean);
CARD_EMBEDS['person-edit'] = a => (typeof personEdHtml_ === 'function' ? personEdHtml_(a.row) : '');

/* ---------- SETTINGS BY ACCOUNT TYPE: each settings card has one home, Find › Settings › its type ---------- */
/* WHICH COLUMN'S CARDS ANSWER WHICH TYPE, IN THE MENU'S ORDER: the registry's `type:` rows (kinds.json setting.cards); who opens each is permissions.json's `see` rows. */
function settingTypes_() {
  let rows = [];
  try { const t = (DATA && DATA.settingFor) || {}; rows = Object.keys(t).filter(k => /^type:/.test(k)).sort((a, b) => (t[a].rank || 0) - (t[b].rank || 0))
    .map(k => ({ type: k.slice(5), col: t[k].col || '', peek: !!t[k].peek })); } catch (e) { rows = []; }
  return rows;
}
/* WHO MAY SEE A SETTING, A DOOR OR A TYPE IS DATA (86a): one question, `seeMay_` (data.js); absent a row, an admin's only. */
const settingMay_ = key => typeof seeMay_ === 'function' && seeMay_(key);
/* AN ITEM'S ACCOUNT-TYPE TAGS (owner, 15 Nov): always its home column's type, so every card registered to Site is under Find › Settings › Site; */
/* the registry's `under` (menu grouping, not who sees it) adds more places, never takes the home away. */
function settingTagsOf_(id, home) {
  let row = null; try { row = ((DATA && DATA.settingFor) || {})[id] || null; } catch (e) { row = null; }
  const under = row && row.under && row.under.length ? [].concat(row.under) : [];
  return [home].concat(under.filter(t => t !== home));
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
/* A COLUMN'S PADLOCK, "NOTHING HERE" LINE OR A TITLE-ONLY PLACEHOLDER IS NOT A SETTING: each says so as data-card="-". */
const settingNone_ = h => /^\s*<div\b[^>]*\sdata-card="-"/.test(h);
/* EVERY SETTING ONCE (owner, 7 Nov): its `see` rows tag it with each account type; one of the same name joins it. */
/* A type you do not hold still shows its cards, shut (`lockedAs_`); Business and Site hold the business's own data, so stay an admin's. */
function settingDoorItems_() {
  /* JOIN IS A FORM (owner, 10 Nov), drawn open; signing in is Find's first menu (`signMenu_`, owner 13 Nov). */
  if (!USER) return [{ kind: 'setting', name: text_('make-an-account'), key: 'set:join', sub: '', image: '', join: true, open: true, text: 'join make an account' }];
  const tags = (DATA && DATA.settingFor) || {}, out = [], byName = {}, seen = {};
  /* RECORDS ARE LAZY (the weekly email's cards): until that batch lands they are missing, so Find is drawn again once it does. */
  try { if (typeof lazyFiles_ === 'function' && !lazyFiles_.in) doorAsk_(lazyFiles_()); } catch (e) { oops_(e, 'find:doorAsk'); }
  const add = (name, id, part, type, mine) => {
    const row = tags[id], fr = settingTagsOf_(id, type);
    const x = byName[norm(name)];
    if (x) { x.parts.push(part); if (row && (row.rank || 0) < x.rank) x.rank = row.rank || 0; fr.forEach(t => { if (x.settingFor.indexOf(t) === -1) x.settingFor.push(t); }); x.mine = x.mine || mine; return x; }
    const it = { kind: 'setting', name: name, key: 'set:' + (id || part.col + ':' + part.at), sub: '', image: '', parts: [part], mine: mine, settingFor: fr.slice(), rank: row ? row.rank || 0 : 5000 + out.length };
    byName[norm(name)] = it; out.push(it); return it;
  };
  /* THE LENS LEADS (`first`): drawn open, above every type, and sorted ahead by `sortKey_`. */
  if (may_('admin')) Object.assign(add(lensOn_() ? 'Viewing ' + (whose_().name || 'somebody') : 'View as', 'lens', { lens: true }, 'Student', true),
    { rank: -1, open: true, first: true, settingFor: settingTypes_().map(t => t.type) });
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
      /* NOT YOURS, NOT SHOWN (4h, owner 20 Nov): a card its own rows deny is left out, never drawn shut — a child sees only child cards. */
      if (!own) return;
      if (name) add(name, g.id, { col: col, at: i, id: g.id || '' }, type, own && (ok || /^\s*<div\b[^>]*\bdata-yours="1"/.test(html)) && !/^\s*<div\b[^>]*\bis-locked\b/.test(html));
    });
  });
  if (settingMay_('door:notify') && !lensOn_()) add(text_('notifications'), 'set:notify', { notify: true }, 'Business', true);
  /* ORDER IS DATA (the registry's rows, types too); an untagged card keeps its column's place after them. */
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
  if (x.join) return typeof registerCard_ === 'function' ? registerCard_() : '';
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
  if (!may_('admin')) return '';
  const on = lensOn_();
  return renderCard({ kind: 'panel', look: 'lens-card' + (on ? ' is-lens' : ''), tags: [{ text: on ? 'Viewing as' : 'View as', colour: 0 }],
    body: on ? [{ type: 'embed', tool: 'lens-tag' }] : [{ type: 'embed', tool: 'lens-pick' }, { type: 'text', text: ' ', look: 'lens-said' }] });
}
/* FIND'S MEMOS DROPPED, so the settings items are built again for whoever the lens is on now. */
function lensRedraw_() {
  FUNNEL_MEMO.from = null; ITEM_MEMO.from = null; ALL_MEMO.from = null;
  try { if (typeof paintStuff === 'function') inFinder_(FINDER, () => paintStuff(true)); } catch (e) { oops_(e, 'lens:redraw'); }
}
/* THEIR SETTINGS, ASKED FOR: `lensOpen` is an admin's alone (permissions.json); nobody else's tap gets this far. */
on('lens-pick', el => {
  const id = (el && el.getAttribute('data-id')) || '';
  if (!may_('admin') || !id) return;
  const card = el.closest('.lens-card'), said = card && card.querySelector('.lens-said');
  send_({ action: 'item', door: 'get', kind: 'profile', ids: [id], name: USER.name, personId: USER.personId || '', targetId: id }, { button: el, where: said || undefined })
    .then(d => { if (!may_('admin') || !d || !d.personId) return; LENS = Object.assign({ lens: true }, d); lensRedraw_(); })
    .catch(() => {});
});
on('lens-off', () => { LENS = null; lensRedraw_(); });

/* WHAT THE TOP BAR'S RED DOT USED TO SAY (owner, 6 Nov): each Business or Site card that needs you, by name, with a way there. */
function notifyDoorCard_() {
  /* THE BUSINESS RECORDS ARE SWITCHED OFF (attic/js/records.js, owner 13 Nov): their counts come back with them. */
  const BIZ_NEEDS = window.BIZ_NEEDS || {}, needs = Object.keys(BIZ_NEEDS).filter(k => BIZ_NEEDS[k] > 0);
  const waiting = ((DATA && DATA.posts) || []).filter(p => p && p.active !== false && p.waiting).length;
  const rows = needs.map(k => ({ label: k.replace(/[-_]/g, ' '), value: String(BIZ_NEEDS[k]) }))
    .concat(waiting ? [{ label: 'posts waiting for approval', value: String(waiting) }] : []);
  return renderCard({ kind: 'panel', look: 'notify-door', tags: [{ text: text_('notifications'), colour: 0 }],
    body: [rows.length ? { type: 'list', items: rows } : { type: 'text', text: 'Nothing needs you.' }] });
}

/* A LIST THAT COMES LATER (the lazy files) joins Find when it lands: the memo is dropped and Find repainted once. */
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
  return [].concat(postDoorItems_(), profileDoorItems_(), settingDoorItems_());
}
/* SETTINGS AND BOOKING (owner, 13 Nov: a guest books through Find's steps and signs in to Send); no Venues on the signed-out front. */
/* AND THE LIBRARY (owner, 15 Nov), by ONE permissions row (`item` library:read for `anyone`): never a question, its answer or Practice. */
/* AND QUESTIONS AND PRACTICE (owner, 18 Nov: guests do questions too), by the one row `item` question:read for `anyone`. */
/* AND EVERY DOOR THAT HOLDS NOBODY'S PERSONAL DATA (owner, 18 Nov: "guests see everything"): Shop, Tools, Games. Posts and
   Profiles stay signed in — they hold children's names and words (rule: a child's data only to the child, parents, tutors, admins). */
/* Each by its own permissions row, `item` <door>:read for `anyone` (actions.json); Library and Practice answer by card below, not by door. */
const guestDoors_ = () => typeof can_ !== 'function' ? [] : FRONT_ORDER.filter(d => d !== 'Library' && PRACTICE_DOORS.indexOf(d) === -1 && can_('anyone', 'item', d.toLowerCase() + ':read'));
function findSignedOut_(x) { const doors = guestDoors_(); return kindTop_(x) === 'Settings' || asList_(kindTop_(x)).some(t => doors.indexOf(t) !== -1) || x.kind === 'bookform' || (guestLibrary_() && libraryCard_(x)) || (guestPractice_() && practiceCard_(x)); }
const guestPractice_ = () => typeof can_ === 'function' && can_('anyone', 'item', 'question:read');
/* PRACTICE IS NO DOOR (queue item 9, 24 Nov): its kinds are answers of their own, marked `practice` in kinds.json doors. */
const PRACTICE_DOORS = ITEM_KINDS.doors.filter(d => d.practice).map(d => d.name);
const practiceDoor_ = x => asList_(kindTop_(x)).some(t => PRACTICE_DOORS.indexOf(t) !== -1);
const practiceCard_ = x => !!x && x.kind !== 'answer' && (x.kind === 'question' || practiceDoor_(x));
const guestLibrary_ = () => typeof can_ === 'function' && can_('anyone', 'item', 'library:read');
/* A LIBRARY CARD: a Learning thing that is not practice — questions, their answers and the Practice widgets are signed in. */
function libraryCard_(x) {
  if (!x || x.kind === 'question' || x.kind === 'answer') return false;
  if (practiceDoor_(x) && x.kind !== 'practical') return false;
  return asList_(x.groups || kindOf_(x).group).indexOf('Learning') !== -1;
}

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

/* AN OLD SETTINGS NAME ASKED FOR (a tile, a link) opens Find › Settings › its type. */
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
/* AN OLD SCREEN'S NAME (a link, a button, a tab remembered on the phone; screens-moved.json): Settings for its account type, or its door. */
function oldBranch_(id) {
  const to = String(screenMoved_()[id] || '').split(':');
  if (to[0] !== 'find') return false;
  if (to[1] === 'Settings') { findSettings_(to[2] || ''); return true; }
  /* `find:<door>:<field>=<value>` opens the door with that tag already chosen: Profiles › Apprentice; `find::<field>=<value>` the tag alone (Saved). */
  const pick = /^(\w+)=(.+)$/.exec(to.slice(2).join(':'));
  if (!to[1] && !pick) return false;
  const filters = (to[1] ? [{ field: DOOR_FIELD, value: to[1] }] : []).concat(pick ? [{ field: pick[1], value: pick[2] }] : []);
  finderSet_(FINDERS.stuff, { filters, show: true }); go('stuff'); return true;
}

/* ---------- WHICH CARD A SETTINGS PAGE IS (465, from the layout, gone 17 Nov): its id, its name, and each account type's builder ---------- */
/* THE REGISTRY IS DATA (job E, 20 Nov): kinds.json's setting.cards — id, its account type's group, name, and `only` when it is the only place
   a setting is edited (Delete's second step says so). Each card says which it is by its own `data-card` (renderCard's spec.card), never by its classes. */
let SETTING_CARDS_ON_ = null;
/* A ROW THAT ONLY TAGS ONE OF YOUR OWN CARD'S SECTIONS (`own:account:picture`) takes that section's label, place and line from `ownSecReg_`. */
const SETTING_CARDS_ = () => SETTING_CARDS_ON_ || (SETTING_CARDS_ON_ = (() => {
  const reg = ((ITEM_KINDS.kinds.setting || {}).cards || []).map(r => Object.assign({}, r)), at = {};
  reg.forEach(r => { at[r.id] = r; });
  ownSecReg_().forEach(o => { if (at[o.id]) Object.keys(o).forEach(k => { if (!(k in at[o.id])) at[o.id][k] = o[k]; }); else reg.push(o); });
  return reg; })());
/* YOUR OWN CARD'S SECTIONS, A CARD EACH (468): `own:<col>:<section>`, the col the lowest rank it applies to, the same for everyone (469). */
function ownSecReg_() {
  const S = { picture: ['Picture', 'your picture', 'The picture beside your name.'], figure: ['Your figure', 'your figure', 'The figure that stands for you in games.'],
    name: ['Name', 'your name', 'Your first and last name.'], handle: ['Handle', 'your handle', 'The @name people find you by.'],
    seat: ['Rate and extra seat', 'your rate and extra seat', 'Your rate and what each extra student adds for you.'],
    cut: ["@family.'s share", "@family.'s share of a seat", 'What @family. adds for each extra student; an admin sets it.'],
    size: ['Class size', 'your class size', 'The fewest and most students you take, and what a class pays.'], headline: ['Headline', 'your headline', 'The line under your name on your tutor card.'],
    manager: ['Your manager', text_('your-manager'), 'The tutor you answer to, and how your extra-seat money is split.'],
    photos: ['Photographs', 'your photographs', 'The photos and video on your tutor card.'], words: ['3 words', 'your 3 words', '3 words that describe you.'],
    glance: ['At a glance', 'your experience and ages', 'Your experience, the ages you teach and your hours.'], quals: ['Qualifications', 'your qualifications', 'What you are qualified in and teach.'],
    jobs: ['Jobs', 'your jobs', 'Your current and past jobs, shown on your tutor card.'],
    where: [text_('where-you-teach'), 'where you teach', 'The venues you teach at and how far you travel.'], week: ['Available', 'your weekly hours', 'The hours you can teach each week.'] };
  const of = OWN_SEC_OF_SET_;
  /* Each settings group's name from the one table (the registry's type rows, settingGroupOf_), never a copy of it. */
  const where = c => (settingGroupOf_(c) || {}).label || c;
  return [].concat(...Object.keys(of).map(c => of[c].map(k => ({ id: 'own:' + c + ':' + k, col: c, label: S[k][0] + ' (' + where(c) + ')', only: S[k][1], say: S[k][2] }))));
}
const cardReg_ = id => SETTING_CARDS_().find(r => r.id === id);
/* A SETTINGS GROUP (`set:<col>:<group>`) the registry does not list yet, or a Business record card (`biz:rec:<page>`, `biz:profit-terms`), is known by its id alone: the fallback. */
/* A SPLIT CARD'S PIECE is `<card>#<field>` (466). */
const CARD_DYN = /^(item:[a-z]+:[A-Za-z0-9_.-]{1,48}|(set:(family|staff|account):[A-Za-z0-9_:.-]+|biz:rec:[A-Za-z0-9_:.-]+|biz:profit-terms)(#[A-Za-z0-9_.-]{1,40})?)$/;
const cardIs_ = id => !!(cardReg_(id) || CARD_DYN.test(String(id || '')));
/* A MARK FOR A CARD WITH NO ROOT OF ITS OWN (a people list is a page a person): each page carries the list's id. */
const cardMark_ = (id, list) => (list || []).filter(Boolean).map(h => '<!--card:' + id + '-->' + h);
/* AND A PERSON'S PAGE ITS PERSON (`person:<id>`). */
const personMark_ = (pid, h) => h && pid ? '<!--person:' + String(pid).replace(/[^A-Za-z0-9_.-]/g, '') + '-->' + h : h;
/* WHICH CARD A PAGE IS — its mark, its `data-lay-card`, then its `data-card`; '' for a group's own line (a padlock, a wait). */
function cardIdOf_(html) {
  const h = String(html || '');
  let m = /^\s*<!--card:([A-Za-z0-9_:.-]{1,64})-->/.exec(h);
  if (m) return m[1];
  const tag = (/^\s*<div[^>]*>/.exec(h) || [''])[0];
  /* ITS OWN ID (`data-lay-card`): a settings group's `set:<type>:<group>`, a progress series. */
  m = /\sdata-lay-card="([^"]+)"/.exec(tag);
  if (m && cardIs_(m[1])) return m[1];
  m = /\sdata-card="([^"]+)"/.exec(tag);
  return m && cardIs_(m[1]) ? m[1] : '';
}
/* EACH ACCOUNT TYPE'S OWN BUILDER — the code's cards for whoever is signed in, role gates and all. */
const CARD_BUILD = {
  family: () => familyPages_(), staff: () => staffPages_(), account: () => studentSetPages_(),
  biz: () => adminPages_(), site: () => sitePages_(),
  apprentice: () => apprenticePages_(),
};
function cardGroups_(raw) {
  const out = [];
  (raw || []).forEach(h => {
    if (!h) return;
    const id = cardIdOf_(h), last = out[out.length - 1];
    if (id && last && last.id === id) last.pages.push(h);
    else out.push({ id: id, pages: [h] });
  });
  return out;
}
