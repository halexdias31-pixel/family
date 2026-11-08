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
  const admin = typeof isAdmin === 'function' && isAdmin();
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
function msgDoorCard_(x) {
  const t = (typeof messageThreads_ === 'function' ? messageThreads_() : []).find(t2 => t2.id === x.thread);
  if (!t && x.to) return `<div class="card dm-card"><div class="dm-head"><h3>${esc(x.name)}</h3></div>
    ${msgForm_(x.to.name, x.to.id)}</div>`;
  if (!t) return `<div class="card"><h3>${esc(x.name)}</h3></div>`;
  try { markRead_(t.msgs); } catch (e) { oops_(e, 'doors:msg'); }
  return `<div class="card dm-card"><div class="dm-head">${typeof dmFace_ === 'function' ? dmFace_(t) : ''}<h3>${esc(t.name)}</h3></div>
    <div class="msg-body">${messagesHtml_(t.msgs)}</div>${msgForm_(t.name, t.id)}</div>`;
}

/* ---------- PROFILES: who they are is the menu; admin-only answers are asked by rank ---------- */
function profileTypes_(p, tutor) {
  const out = [], role = String((p && p.role) || ''), admin = rankAtLeast_('admin');
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
    out.push({ kind: 'person', name: p.title || p.name || p.handle, key: 'person:' + id, sub: '', image: p.image || '', row: p,
      profileType: profileTypes_(p, tutor), text: [p.title, p.name, p.handle, p.role].filter(Boolean).join(' ') });
  };
  ((DATA && DATA.tutors) || []).filter(t => t && t.title && t.listed !== false).forEach(t => add(t, true));
  if (typeof isAdmin === 'function' && isAdmin()) ((DATA && DATA.everyone) || []).filter(p => p && p.title).forEach(p => add(p, false));
  if (typeof canTrack === 'function' && canTrack() && typeof friendHandles === 'function') friendHandles().forEach(h => {
    const s2 = ((DATA && DATA.students) || []).find(x => norm(x.handle) === norm(h)) || {};
    add(Object.assign({ handle: h, title: s2.name || h, role: 'Student' }, s2), false);
  });
  return out;
}
/* PICTURE FIRST: the face fills the top of the card, the name under it; everything else is a tag. */
function profileDoorCard_(x) {
  const t = x.row || {};
  return `<div class="card is-prof prof-door">${personFace_({ pic: t.image, avatar: t.avatar, handle: t.handle, name: t.title || t.name, personId: t.personId },
    { cls: 'prof-big', none: 'prof-none', size: 160 })}<h3>${esc(x.name)}</h3>${t.handle ? `<span class="prof-handle">@${esc(t.handle)}</span>` : ''}
    ${tileRow_((x.profileType.indexOf('Tutor') !== -1 && typeof bookTile_ === 'function' ? bookTile_(x) : '')
      + (typeof peopleTiles_ === 'function' ? peopleTiles_(t) : ''), 'person-tiles')}</div>`;
}

/* ---------- SETTINGS BY ACCOUNT TYPE: each settings card has one home, Find › Settings › its type ---------- */
/* Which column's cards answer which type, and who may see that type; the builders are the old columns' own. */
const SETTING_TYPES = [
  ['Student', 'account', () => !!USER, true],
  ['Parent', 'family', () => rankAtLeast_('client'), true],
  ['Staff', 'staff', () => rankAtLeast_('staff'), true],
  ['Apprentice', 'apprentice', () => rankAtLeast_('admin') || hasRole('apprentice'), true],
  ['Business', 'biz', () => rankAtLeast_('admin')],
  ['Site', 'site', () => rankAtLeast_('admin')],
];
/* THE MENU'S ORDER OF ACCOUNT TYPES; Admin has no column, only the data's tags. */
const SETTING_ORDER = ['Student', 'Parent', 'Staff', 'Apprentice', 'Admin', 'Business', 'Site'];
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
const settingNone_ = h => /^\s*<div class="card (?:rank-off|set-none|own-lock)\b/.test(h);
/* EVERY SETTING ONCE (owner, 7 Nov): data/settings/setting-for.json tags it with each account type; one of the same name joins it. */
/* A type you do not hold still shows its cards, shut (`lockedAs_`); Business and Site hold the business's own data, so stay an admin's. */
function settingDoorItems_() {
  if (!USER) return [{ kind: 'setting', name: 'Sign in or join', key: 'set:signin', sub: '', image: '', signIn: true, text: 'sign in join make an account pin' }];
  const tags = (DATA && DATA.settingFor) || {}, out = [], byName = {}, seen = {};
  const add = (name, id, part, type, mine) => {
    const row = tags[id], fr = (row && row.for && row.for.length) ? row.for : [type];
    const x = byName[norm(name)];
    if (x) { x.parts.push(part); fr.forEach(t => { if (x.settingFor.indexOf(t) === -1) x.settingFor.push(t); }); x.mine = x.mine || mine; return; }
    const it = { kind: 'setting', name: name, key: 'set:' + (id || part.col + ':' + part.at), sub: '', image: '', parts: [part], mine: mine, settingFor: fr.slice() };
    byName[norm(name)] = it; out.push(it);
  };
  SETTING_TYPES.forEach(([type, col, may, peek]) => {
    let ok = false;
    try { ok = may(); } catch (e) { ok = false; }
    if (!ok && !peek) return;
    settingGroups_(col).forEach((g, i) => {
      const html = g.pages.join('');
      if (settingNone_(html) || (g.id && seen[g.id])) return;
      if (g.id) seen[g.id] = 1;
      const name = settingName_(html, g.id, tags[g.id]);
      if (name) add(name, g.id, { col: col, at: i, id: g.id || '' }, type, (ok || /^\s*<div\b[^>]*\bdata-yours="1"/.test(html)) && !/^\s*<div\b[^>]*\bis-locked\b/.test(html));
    });
  });
  if (rankAtLeast_('admin')) add('Notifications', 'set:notify', { notify: true }, 'Business', true);
  out.forEach(x => { x.settingFor.sort((a, b) => SETTING_ORDER.indexOf(a) - SETTING_ORDER.indexOf(b)); x.text = x.name + ' ' + x.settingFor.join(' ') + ' settings'; });
  return out;
}
function settingPart_(p) {
  if (p.notify) return notifyDoorCard_();
  const gs = settingGroups_(p.col), g = (p.id && gs.find(k => k.id === p.id)) || gs[p.at];
  return g ? g.pages.join('').replace(/<!--(card|person):[^>]*-->/g, '') : '';
}
function settingDoorCard_(x) {
  if (x.signIn) { if (typeof mountGoogleWhenDrawn === 'function') mountGoogleWhenDrawn(); return typeof signInCard_ === 'function' ? signInCard_() : ''; }
  if (x.notify) return notifyDoorCard_();
  return (x.parts || [{ col: x.setCol, at: x.setAt, id: x.setId }]).map(settingPart_).join('');
}
/* WHAT THE TOP BAR'S RED DOT USED TO SAY (owner, 6 Nov): each Business or Site card that needs you, by name, with a way there. */
function notifyDoorCard_() {
  const needs = typeof BIZ_NEEDS !== 'undefined' ? Object.keys(BIZ_NEEDS).filter(k => BIZ_NEEDS[k] > 0) : [];
  const waiting = ((DATA && DATA.posts) || []).filter(p => p && p.active !== false && p.waiting).length;
  const rows = needs.map(k => `<li><span class="qtag">${esc(String(BIZ_NEEDS[k]))}</span> ${esc(k.replace(/[-_]/g, ' '))}</li>`)
    .concat(waiting ? [`<li><span class="qtag">${waiting}</span> posts waiting for approval</li>`] : []);
  return `<div class="card notify-door"><h3>Notifications</h3>${rows.length ? `<ul class="notify-list">${rows.join('')}</ul>` : '<p>Nothing needs you.</p>'}</div>`;
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
function venueDoorCard_(x) {
  return `<div class="card fc person venue-door" aria-label="${esc(x.name)}">${tagRow_(x)}<figure class="person-pic">${pixSvg_(VENUE_PIX[venueShape_(x.row || {})], x.name)}</figure></div>`;
}

/* AN OLD SETTINGS COLUMN ASKED FOR BY NAME (a tile, a link) opens Find › Settings › its type instead. */
const SETTINGS_HOME = { account: 'Student', family: 'Parent', staff: 'Staff', apprentice: 'Apprentice', biz: 'Business', site: 'Site' };
function findSettings_(type) {
  try {
    inFinder_(FINDER, () => {
      STUFF.filters = [{ field: 'kindLabel', value: 'Settings' }].concat(USER && type ? [{ field: 'settingFor', value: type }] : []);
      STUFF.q = '';
    });
    go(FINDER.id);
    inFinder_(FINDER, () => paintStuff());
  } catch (e) { oops_(e, 'doors:settings'); }
}
function settingsGone_(id) { if (!SETTINGS_HOME[id] || TABS.some(t => t.id === id)) return false; findSettings_(SETTINGS_HOME[id]); return true; }
