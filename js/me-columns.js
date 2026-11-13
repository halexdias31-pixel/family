/* ---------- THE SETTINGS COLUMNS: a column per rank and the people on each (cut from me-roles.js; read with the other me-*.js by tools/piece-src.js). */
/* ---------- A COLUMN PER RANK (444): YOU FOR EVERY ACCOUNT, THEN FAMILY, TUTOR AND ADMIN ----------
   The owner: one column whose contents change with rank "becomes really messy and hard for me to know what's going on". */
/* A FIELD IS A TUTOR'S WHEN NEITHER A CLIENT'S NOR A STUDENT'S GROUPS HAVE IT — the backend's lists decide, not a list here. */
const STAFF_GROUPS_ = ['Your rate and group size', 'Qualifications', 'Jobs', 'Availability', 'When I can teach'];
function staffField_(f, g) {
  const sets = [DATA.clientFields, DATA.studentFields].filter(x => x && Object.keys(x).length);
  if (!sets.length) return STAFF_GROUPS_.indexOf(g) !== -1;
  return !sets.some(x => Object.keys(x).some(k => (x[k] || []).indexOf(f) !== -1));
}
/* A PARENT'S ALONE (469): a client's field no student's group has — else it is everybody's and lives on Student settings. */
function parentOnly_(f) {
  const c = DATA.clientFields, k = DATA.studentFields, has = x => x && Object.keys(x).length, inn = x => Object.keys(x).some(g => (x[g] || []).indexOf(f) !== -1);
  return !!(has(c) && has(k) && inn(c) && !inn(k));
}
/* WHAT A SPLIT GROUP IS CALLED ON THE TUTOR COLUMN, where "Contact & address" would mislead. */
const STAFF_GROUP_NAMES_ = { 'Contact & address': 'Where you teach', 'About you': 'About you as a tutor' };
/* YOUR SETTINGS' GROUPS, SPLIT: `{ you, staff }`, each `{ group: [fields] }`, card fields already taken out. */
function settingsSplit_() {
  const shown = notLibrary_(cardSettingsGroups_(myGroups_(), ownCardFields_()));
  /* AND STAFF SET THEIR WEEK ON THE AVAILABLE CARD (487), so it is not drawn twice — but that card needs a tutor row, which a new tutor lacks. */
  if (typeof hubFor_ === 'function' && hubFor_() && cardMine_()) Object.keys(shown).forEach(g => { if (isTimetable_(shown[g])) delete shown[g]; });
  const out = { you: {}, parent: {}, staff: {} };
  Object.keys(shown).forEach(g => {
    if (!shown[g].length) return;
    const mine = shown[g].filter(f => !staffField_(f, g)), staff = shown[g].filter(f => staffField_(f, g));
    const kid = mine.filter(f => !parentOnly_(f)), par = mine.filter(parentOnly_);
    if (kid.length) out.you[g] = kid;
    if (par.length) out.parent[g] = par;
    if (staff.length) out.staff[mine.length ? (STAFF_GROUP_NAMES_[g] || g) : g] = staff;
  });
  return out;
}
/* ONE GROUP, ONE CARD, ITS OWN SAVE — `meSave_` posts the boxes of the card it is pressed in, whichever column.
   `col` names the column, so an admin's Split (464, layout.js) can draw a group a field a card, each with its own Save. */
function settingsCards_(shown, moved, col) {
  const p = whose_().profile || {};
  /* THE BUSINESS'S CUT OF AN EXTRA SEAT IS SHOWN TO A TUTOR AND NOT OFFERED (docs/history/345) — an
     admin's to set, and `seatCutRefusal_` refuses it from anybody else; a disabled box is one `meSave_` never posts. */
  const readonly = (DATA.profileReadonly || []).concat(isAdmin() ? [] : ['extra_seat_cut']);
  /* ONE SHAPE FOR EVERY CARD (8 Nov; 84a): `formCard_` — the title, one line per field, saved as you type. */
  const mail = list => (list || []).indexOf('email') !== -1;
  const one = (g, list, top, id, n, lid) => setHeldSay_(formCard_({ title: g, cls: id ? 'set-card' : '', lead: (top || '') + shareBarFor_(list, p),
    attrs: (id ? ` data-split="${esc(id)}"` : '') + (lid ? ` data-lay-card="${esc(lid)}"` : ''),
    groups: { [g]: list },
    fieldOpts: {
      /* THE ADDRESS WAITING TO BE PROVED, in the address's box — see `movingNote_`. */
      value: f => (f === 'email' && p.email_moving) ? p.email_moving : (p[f] ?? ''),
      raw: p,
      readonly: readonly,
      options: fieldOptions_,
    },
    save: mail(list) && p.email_moving ? tile_(RESEND_LINK) : false,
    foot: (mail(list) ? movingNote_(p) : '') + '<p class="note me-said"></p>',
    after: id && typeof splitRow_ === 'function' ? splitRow_(id, n) : '' }));
  const out = [];
  Object.keys(shown).forEach((g, k) => {
    const list = shown[g] || [], top = k === 0 ? moved : '';
    const id = col && settingsSplittable_(list) && typeof splitId_ === 'function' ? splitId_('set', col, g) : '';
    if (id && typeof splitOn_ === 'function' && splitOn_(id))
      list.forEach((f, i) => out.push(one(String((typeof fieldLabel === 'function' && fieldLabel(f)) || ROW_LABEL[f] || g).replace(/^./, c => c.toUpperCase()), [f], i === 0 ? top : '', id, 1, typeof pieceId_ === 'function' ? pieceId_(id, f) : '')));
    else out.push(one(g, list, top, id, list.length, col && typeof splitId_ === 'function' ? splitId_('set', col, g) : ''));
  });
  return out;
}
/* A GROUP SPLITS WHEN ITS FIELDS STAND ALONE: not the qualifications (one shelf) and not a week of hours (one grid). */
const settingsSplittable_ = list => (list || []).length > 1 && !list.some(isQualField_) && !isTimetable_(list);
/* ---------- SIX COLUMNS (453): TUTORS, STUDENTS, PARENTS, THEN EACH ACCOUNT TYPE'S SETTINGS ----------
   The owner: "A user in theory could appear in each of these 3 categories" and "split account settings into 3". */
const tabLabel_ = (id, or) => ((typeof TABS_BUILT !== 'undefined' && TABS_BUILT.find(t => t.id === id)) || {}).label || or;
/* THE PEOPLE COLUMN OF YOUR RANK, where your own card is shown first (453); what you edit is on Student settings for every rank (469). */
const homeCol_ = () => rankAtLeast_('staff') ? 'tutors' : rankAtLeast_('client') ? 'parents' : 'students';
/* DO YOU BELONG IN THIS PEOPLE COLUMN — by rank, or by a family link (a parent is a parent whatever their rank). */
/* THE FAMILY LINK THAT PUTS YOU IN A PEOPLE COLUMN: a parent has a child; anyone else in a column has a parent. */
const PEOPLE_COL_LINK = { parents: 'child' };
function peopleBelong_(col, family) {
  if (!USER) return false;
  const rel = r => (family || []).some(f => f && f.relation === r);
  if (col === homeCol_()) return true;
  if (isTutorsCol_(col)) return !!(typeof cardMine_ === 'function' && cardMine_());
  return rel(Object.prototype.hasOwnProperty.call(PEOPLE_COL_LINK, col) ? PEOPLE_COL_LINK[col] : 'parent');
}
/* A PEOPLE COLUMN: signed out it says where to sign in; with nobody in it, its title and one line. */
function peoplePages_(col) {
  const title = tabLabel_(col, col);
  if (!USER) return [signedOutCard_(title)];
  const out = typeof accountPages_ === 'function' ? accountPages_(col) : [];
  return out.length ? out : [rankOffCard_(title, 'Nobody to show here yet.', null, 'people-none')];
}
/* ---------- YOUR CARD ON YOUR ROLE'S SETTINGS COLUMN: ONLY ITS EDITING, A CARD PER THING (468) — never a preview; the person is drawn on the profile columns. */
function ownCardSetPage_(setCol) {
  const face = FACE_OF_SET_[setCol];
  if (!whose_() || !face || typeof ownCardSections_ !== 'function') return [];
  const secs = ownCardSections_(face);
  if (!secs.length) return [];
  const mine = typeof myCardRow_ === 'function' ? myCardRow_(whose_()) : null;
  const row = face === 'tutors' ? (cardMine_() || mine) : mine;
  if (!row || !row.personId || !cardMayEdit_(row)) return [];
  /* THE PICTURE AND THE VIDEO SAVE TO THE ASKER'S OWN ROW (`savePhoto`, `videoPart`), so in the lens they are shown shut. */
  return cardEditCards_(row, cardOwnOpen_(row), secs, setCol).map(h => (lensOn_() && /data-sec="picture"|class="vid-/.test(h) ? lockCard_(h) : h));
}
/* ALWAYS OPEN: the edit of your own card is the settings column itself, so nothing is pressed to start it. */
function cardOwnOpen_(t) {
  const now = cardEditNow_();
  if (now && now.pid === String(t.personId)) { now.col = 'settings'; return now; }
  const e = CARD_EDIT = cardEditFresh_(t.personId);
  e.pic0 = cardPicNow_(t);
  e.fig0 = String(whose_().avatar || ''); e.cr0 = Number(whose_().credits || 0); e.h0 = String(whose_().handle || whose_().name || '');
  cardRemember_(e);
  return e;
}
/* ---------- STUDENT SETTINGS: EVERY ACCOUNT'S SIGNING IN AND OUT, PIN, ROLES, NOTIFICATIONS, AND A STUDENT'S DETAILS ---------- */
function youSettingsPages_() {
  if (!whose_()) return [];
  /* EVERYBODY'S DETAILS, WHATEVER THE RANK (469): a parent's or tutor's own contact is edited here, as a student's is. */
  const shown = settingsSplit_().you;
  const pages = settingsCards_(shown, '', 'account');
  /* ONE LINE A BOX, ONE Save: a PIN is never saved as you type; its boxes are forms.json's `signing-in`. */
  /* THEIR PIN AND ROLES ARE NOT AN ADMIN'S TO CHANGE IN THE LENS: shown shut, greyed not hidden. */
  const shut = h => (lensOn_() ? lockCard_(h) : h);
  pages.push(shut(formCard_({ id: 'signing-in' })));
  /* YOUR ROLES, THEN WHICH EMAILS YOU WANT — every signed-in person has both. */
  pages.push(shut(rolesCard_()));
  pages.push(notifyCard_());
  const voice = voiceCard_();
  if (voice) pages.push(voice);
  return pages;
}
function studentSetPages_() {
  if (!whose_()) {
    /* THE GOOGLE BUTTON IS MOUNTED A FRAME LATE — Google renders into an element that has to exist first. */
    if (typeof mountGoogleWhenDrawn === 'function') mountGoogleWhenDrawn();
    /* SIGN IN AND SIGNED IN ARE ONE UNIT, `acct:signed-in` (770): the owner moved it, signed out, and it jumped back — one saved place. */
    const signIn = (typeof signInCard_ === 'function' ? [signInCard_()] : []).filter(Boolean);
    const reg = typeof registerCard_ === 'function' ? [registerCard_()] : [];
    return (typeof cardMark_ === 'function' ? cardMark_('acct:signed-in', signIn) : signIn).concat(reg, lockedPages_('account'));
  }
  const who = nameBesideHandle_(whose_().name, whose_().handle) || 'you';
  /* SIGNED IN AS, AND SIGN OUT — off your card since 453, because it is a setting of every account. */
  let top = card_(`<div class="signed-in"><h3>Signed in</h3>
    ${tileRow_(tile_({ icon: 'out', label: 'Sign out', act: 'signout' })
      + (typeof pendingAddr_ === 'function' && pendingAddr_() && typeof RESEND_LINK !== 'undefined' ? tile_(RESEND_LINK) : ''), '', true)}
    ${/* "WE WILL EMAIL YOU ONCE YOU OPEN THE LINK" — one line under Sign out and Send the link again while your address is unproved. */
      typeof mailHeldNote_ === 'function' ? mailHeldNote_() : ''}</div>`);
  const coming = typeof awaiting_ === 'function' && awaiting_() ? [loading_()] : [];
  /* IN THE LENS, SIGN OUT IS THE ADMIN'S OWN SESSION: shut, greyed not hidden (the fixed tile rule). */
  if (lensOn_()) top = lockCard_(top);
  /* WHAT WAS THE PROGRESS COLUMN (461, the owner: "the progress column content can all be moved to student column account settings"). */
  const all = typeof progressCards_ === 'function' ? progressCards_() : [];
  /* `prog-w` MARKS THEM, so a check can ask the progress widgets apart from the settings around them. */
  const prog = all.map(c => String(c).replace(/^(\s*<div class=")/, '$1prog-w ')), wait = coming.length || !(typeof progressComing_ === 'function' && progressComing_()) ? coming : [loading_()];
  /* ONLY SIGN IN HERE (owner, 4 Nov, 880): every other setting is a Coming soon card in Find until it is wanted. */
  if (typeof SETTINGS_OFF !== 'undefined' && SETTINGS_OFF) return [top];
  return [top].concat(ownCardSetPage_('account'), youSettingsPages_(),
    /* WORK ON FILE (owner, 11 Nov): a student's own scanned pages; a tutor's opens each booked student's. */
    /^(student|staff)$/.test(rank_(whose_())) && typeof workFileCard_ === 'function' ? [workFileCard_()].filter(Boolean) : [], soonCards_(),
    prog, wait);
}
/* PLACEHOLDERS (562, owner notes 116, 118, 114): one card each, its title and one line, until the thing is built; each in CARD_REG so it moves and deletes. */
const SOON_CARDS = [
  ['soon-brownie', 'Brownie points', 'Points you earn for good work. Coming soon.'],
  ['soon-roadmap', 'Roadmap', 'How much of your syllabus is left, subject by subject. Coming soon.'],
  ['soon-conduct', 'Code of conduct', 'How we treat each other here. Coming soon.'],
];
const soonCards_ = () => SOON_CARDS.map(([c, h, p]) => renderCard({ kind: 'soon', look: 'soon-card ' + c, tags: [{ text: h, colour: 0 }], body: [{ type: 'text', text: p }] }));
const SETTINGS_OFF = false;
screen('account', () => pages('account', SETTINGS_OFF || typeof cardsOf_ !== 'function' ? studentSetPages_() : cardsOf_('account')));
