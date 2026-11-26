/* @family. — js/find-account.js BOOKINGS, THE FEED AND YOUR ACCOUNT AS PAGES (cut from find-levels.js; Find is read as one by tools/find-src.js). */
/* THE FRONT MENU'S ANSWER, read through `DOOR_FIELD` (find-finder.js) — the one name every writer and reader of it uses (1040 friction). */
const forIs_ = want => (STUFF.filters || [])
  .some(f => f.field === DOOR_FIELD && norm(f.value) === want);
function bookingPages_() {
  if (!bookFindOn_()) return [];
  /* ---------- NOT BEFORE THE PAYLOAD § */
  if (typeof USER !== 'undefined' && USER && typeof awaiting_ === 'function' && awaiting_()) return [loading_()];
  if (typeof bookerCard !== 'function') return [];
  bookFindStart_();
  /* THE END OF THE STEPS IS ONE SUMMARY CARD (owner, 13 Nov); the one just sent and your sessions stay under the menu. */
  const sum = bookFindAt_() ? '' : bookerCard();
  return [sum + (typeof askedBlock_ === 'function' ? askedBlock_() || '' : '')].filter(Boolean)
    .concat(USER && typeof myJobPages_ === 'function' ? myJobPages_() : []);
}

/* ---------- BOOKING IS A FIND BRANCH (owner, 13 Nov): after Booking, one menu of tags a step, in dependency order ---------- */
/* ITS STEPS ARE kinds.json's bookform form `booking` (formAsks_, form.js): the order, which the site answers, which take several and how many. */
/* Booking IS ASKED AS THE DOOR OR AS WHAT IT IS FOR (`forLabel`, the signed-out front); any other chip narrows to cards instead. */
const BOOK_FIND_DOORS = [DOOR_FIELD, 'forLabel'];
const bookFindOn_ = () => { const fs = STUFF.filters || [];
  return fs.some(f => BOOK_FIND_DOORS.indexOf(f.field) !== -1 && norm(f.value) === 'booking') && fs.every(f => BOOK_FIND_DOORS.indexOf(f.field) !== -1); };
function bookFindStart_() {
  if (typeof bookPrefill_ === 'function') bookPrefill_();
  /* ONCE A FORM: a chip's × on either asks it, and the next draw must not answer it again. */
  if (!BOOK_FIND.started) {
    BOOK_FIND.started = true;
    if (!BOOKING.how) BOOKING.how = text_('instant-class');
    if (!BOOKING.joining) BOOKING.joining = NEW_LIST;
  }
  /* A CHILD THE CHOSEN CLIENT DOES NOT HAVE IS NEVER ON THE BOOKING, as the form's draw made sure. */
  if (typeof bookKidsFor_ === 'function' && !(typeof awaiting_ === 'function' && awaiting_())) bookKidsFor_();
}
const bookOpenDays_ = () => slotGrid().days.filter(d => d.hours.some(h => h.open)).map(d => d.label);
/* WHETHER THIS STEP IS ASKED NOW: on this branch, with something to choose; a class already chosen answers four. */
function bookFindAsks_(id) {
  if (id === 'days' || id === 'slots') return !isWaiting_() && bookOpenDays_().length > 0;
  if (id === 'avail') return isWaiting_();
  const st = bookStep_(id);
  if (!st || !onlyHas_(st.only, bookOn_())) return false;
  /* NO CHILD TO NAME (a guest, an account with none): the seats say Child, as the form's did. */
  if (id === 'kids') return st.options().some(k => k !== UNNAMED);
  return !stepLocked_(st);
}
/* THE STEP BEING ASKED, or '' once every step is answered and the summary card is the answer. */
function bookFindAt_() {
  try { return (askAt_('booking') || {}).f || ''; }
  catch (e) { oops_(e, 'book:at'); return ''; }
}
/* A STEP'S TAGS, the form's option source: `v` is the answer, `on` ticked or chosen, `off` why it cannot be taken. */
function bookFindOpts_(id) {
  /* THE DAY BY ITS NAME (owner, 15 Nov): "Tuesday", then the next menu is that day's times. */
  if (id === 'days') return bookOpenDays_().map(d => ({ text: d, v: d, on: BOOK_FIND.days.indexOf(d) !== -1 }));
  if (id === 'slots') {
    const on = BOOKING.slots || [], one = BOOK_FIND.day ? [BOOK_FIND.day] : BOOK_FIND.days;
    return slotGrid().days.filter(d => one.indexOf(d.label) !== -1).flatMap(d => d.hours.map(h => ({
      text: (one.length > 1 ? fmtDate_(d.label, 'day') + ' ' : '') + String(h.h).padStart(2, '0') + ':00', v: h.code,
      on: on.indexOf(h.code) !== -1, off: h.open ? '' : (h.why || 'not available'), note: h.open ? h.why : '' })));
  }
  if (id === 'avail') {
    const on = BOOKING.avail || [];
    return SLOT_DAYS.flatMap(([, label]) => SLOT_BLOCKS.map(b => blockPhrase_(label, b))).map(p => ({ text: p, v: p, on: on.indexOf(p) !== -1 }));
  }
  const st = bookStep_(id);
  let opts = [];
  try { opts = (st.options() || []).filter(Boolean); } catch (e) { opts = []; }
  const v = BOOKING[id];
  const isOn = o => st.multi ? (v || []).some(c => norm(c) === norm(o)) : norm(v) === norm(o);
  return opts.map(o => ({ text: String(st.label_ ? st.label_(o) : o), v: o, on: isOn(o), off: st.off ? String(st.off(o) || '') : '' }));
}
/* THE MENU FOR THE STEP BEING ASKED: the one form engine's (`askMenu_`, form.js), a block for Find's menu card. */
function bookMenu_() {
  bookFindStart_();
  return (askMenu_('booking') || [])[0] || null;
}
/* WHAT A STEP'S CHIP SAYS: its answer as the summary says it; a bare number names what it counts. */
function bookSaid_(id) {
  if (id === 'days') return BOOK_FIND.days.map(d => fmtDate_(d, 'day')).join(', ');
  if (id === 'slots') return profRunsSay_(bookRuns()).join(', ');
  if (id === 'avail') return blockSay_(BOOKING.avail);
  const st = bookStep_(id), v = BOOKING[id];
  const said = o => String(st.label_ ? st.label_(o) : o);
  const text = st.multi ? (v || []).map(said).join(', ') : v ? said(v) : '';
  return /^\d+$/.test(text) ? st.short + ' ' + text : text;
}
/* THE STEPS ANSWERED, AS CHIPS AFTER Booking's (`askChips_`): tapping one (or its ×) asks that step again and every step after it. */
function bookChips_() {
  if (!bookFindOn_() || typeof bookStep_ !== 'function') return [];
  try {
    bookFindStart_();
    return askChips_('booking', 'sm book-chip');
  } catch (e) { oops_(e, 'book:chips'); return []; }
}
/* BEFORE ANY STEP IS ANSWERED, Booking's other answers (your sessions, tutors, venues) follow the first step's tags. */
function bookFindQuestion_() {
  if (typeof bookStep_ !== 'function') return [{ type: 'wait', on: true }];
  const menu = [].concat(bookMenu_() || []);
  if (!menu.length || Object.keys(BOOK_FIND.done).length) return menu;
  const items = stuffFiltered().filter(x => x.kind !== 'bookform');
  const facet = items.length > 1 ? nextFacet(items) : null;
  if (!facet) return menu;
  const values = facetValues(items, facet).filter(v => spellKey_(v.value) !== spellKey_(kindMap_().bookform.label));
  return values.length ? menu.concat(facetAnswersSpec_(facet, values)) : menu;
}
/* EVERY STEP CHANGE REPAINTS FIND, and the draft is kept as the form's was (`bookKeep_`). */
function bookFindPaint_() {
  if (typeof bookHomeSeats_ === 'function') bookHomeSeats_();
  if (typeof bookKeep_ === 'function') bookKeep_();
  finderEach_(() => paintStuff(true));
}
/* BOOKING'S SOURCES FOR THE ONE FORM ENGINE: its answers are BOOKING (BOOK_FIND.v), each step's tags, words and side effects are its step's (book-steps.js). */
FORM_ASK_.booking = {
  state: () => BOOK_FIND,
  asks: x => bookFindAsks_(x.f),
  options: x => bookFindOpts_(x.f),
  label: x => (bookStep_(x.f) || {}).label || '',
  said: x => bookSaid_(x.f),
  off: (x, v) => { const st = bookStep_(x.f); return st && st.off ? st.off(v) : ''; },
  set: (x, v) => { const st = bookStep_(x.f); if (st && st.set) st.set(v); },
  /* A DAY IS ONE PICK: it is named and its times are the next menu. */
  pick: (x, v) => {
    if (x.f !== 'days') return false;
    if (BOOK_FIND.days.indexOf(v) === -1) BOOK_FIND.days.push(v);
    BOOK_FIND.days.sort((a, b) => SLOT_DAYS.findIndex(d => d[1] === a) - SLOT_DAYS.findIndex(d => d[1] === b));
    BOOK_FIND.day = v; BOOK_FIND.done.days = true; BOOK_FIND.more = '';
    return true;
  },
  /* AN HOUR OR A WAITING LIST'S BLOCK is ticked as it is; any other answer in the order its step offers them (`bookToggle_`). */
  toggle: (x, v) => {
    if (x.f !== 'slots' && x.f !== 'avail') return bookToggle_(bookStep_(x.f), v);
    const list = BOOKING[x.f] || [], at = list.indexOf(v);
    if (at === -1) list.push(v); else list.splice(at, 1);
    BOOKING[x.f] = list;
  },
  had: x => (x.f === 'days' ? BOOK_FIND.days : (BOOKING[x.f] || [])),
  /* THE WEEK DONE: the days are the ones that have an hour; no day is half-asked. */
  next: x => {
    if (x.f !== 'slots') return;
    const codes = BOOKING.slots || [];
    BOOK_FIND.days = BOOK_FIND.days.filter(dn => { const c = (SLOT_DAYS.find(y => y[1] === dn) || [])[0]; return codes.some(k => k.indexOf(c) === 0 && /^\d+$/.test(k.slice(c.length))); });
    BOOK_FIND.day = ''; BOOK_FIND.done.days = true;
  },
  /* "and" after a time is another day (a day, then its times). */
  and: x => { if (x.f === 'slots') { delete BOOK_FIND.done.days; BOOK_FIND.day = ''; } },
  clear: x => {
    BOOK_FIND.day = '';
    if (x.f === 'days') { BOOK_FIND.days = []; return; }
    const st = bookStep_(x.f);
    if (st) BOOKING[x.f] = (st.multi || st.grid) ? [] : '';
  },
  paint: () => bookFindPaint_(),
};
/* SET THE ROOM, A FORM ON THE RECEIPT from the start (no sheet, owner 7 Nov). */
const jobRoomForm_ = j => cardBlock_({ type: 'group', look: 'rc-form room-form', blocks: [
  { type: 'field', cap: 'the room in the venue — the family sees it', blocks: [{ type: 'control', attrs: { class: 'room-name', value: j.room || '', autocomplete: 'off' } }] },
  { type: 'group', look: 'btn-row', tiles: [{ form: true, label: 'Save the room', act: 'job-room', data: { id: String(j.id) } }] },
  { type: 'group', tag: 'p', look: 'note room-said', attrs: { 'aria-live': 'polite' } }] });
on('job-room', el => {
  const f = el.closest('.room-form');
  const room = ((f && (f.querySelector('.room-name') || {}).value) || '').trim();
  const said = f && f.querySelector('.room-said');
  el.disabled = true;
  api({ action: 'setRoom', jobId: el.dataset.id, room, name: USER.name, personId: USER.personId })
    .then(d => {
      if (!d || d.error) { if (said) said.textContent = (d && d.error) || text_('not-saved'); el.disabled = false; return; }
      const j = (DATA.liveJobs || DATA.jobs || []).find(x => String(x.id) === String(el.dataset.id));
      if (j) j.room = room;
      toast(text_('room-saved')); repaint();
    })
    .catch(() => { el.disabled = false; toast(text_('not-saved')); });
});
/* ---------- SIGNING IN AND OUT, ON A PAGE OF ITS OWN § */
/* ---------- WHICH ROW IS YOU, ASKED IN ONE PLACE § */
function mineIs_(t, u = USER) {
  /* ---------- AND A STRANGER HAS NO ROW, WHICH THIS DID NOT HAVE TO KNOW BEFORE § */
  if (!u) return false;
  /* ---------- AN ID ON BOTH SIDES DECIDES, AND THE NAME IS ONLY FOR A ROW WITHOUT ONE § */
  if (t && u.personId && t.personId) return String(t.personId) === String(u.personId);
  return !!t && (
    (u.handle && t.handle && norm(t.handle) === norm(u.handle)) ||
    (u.name && t.title && norm(t.title) === norm(u.name)) ||
    (u.name && t.name && norm(t.name) === norm(u.name)));
}
/* ---------- YOUR OWN ROW, WHEREVER IT COMES FROM § */
function myCardRow_(u = USER) {
  return (DATA.tutors || []).filter(t => mineIs_(t, u))[0] || {
    /* ---------- THE HANDLE IS PRINTED UNDER THE NAME, SO IT IS NOT SAID IN IT TOO § */
    title: nameBesideHandle_(u.name, u.handle) || 'Signed in',
    role:  roleOf(u.role || 'student'),
    handle: u.handle,
    /* YOUR PICTURE AS THE PICKER LAST KEPT IT (`profile.photo`, written by `pfpTake_`), else the sign-in reply's. § */
    image: (u.profile && typeof u.profile.photo === 'string') ? u.profile.photo : (u.image || u.photo || ''),
    avatar: u.avatar || '',
    rate:  u.rate,
    teaches: [],
    personId: u.personId,
    /* ---------- `dbs` IS DELIBERATELY ABSENT HERE, AND ABSENT IS NOT `false` § */
  };
}
/* YOUR FAMILY AS `doGet` SENT IT, less you; `famMine` only when it was sent for you. */
function accountFamily_() {
  /* ---------- YOUR FAMILY ---------- */
  /* `sibling` ON *"students should be able to see their parents and siblings likewise"*. § */
  const famLabel_ = { parent: 'Your parent', child: 'Your child', sibling: 'Your brother or sister' };
  const famMine = !!(USER.personId && DATA.familyFor && String(DATA.familyFor) === String(USER.personId));
  const family = (famMine && Array.isArray(DATA.family) ? DATA.family : [])
    .filter(f => f && f.personId && f.title && famLabel_[f.relation]
      && !(USER.personId && String(f.personId) === String(USER.personId)));
  return { famLabel_, famMine, family };
}
/* ONE FAMILY MEMBER'S CARD, their tutor row under it when they teach. */
function accountFamCard_(f, famLabel_, personForm_, tcard_) {
  const asTutor = (DATA.tutors || []).find(t => t && t.personId && String(t.personId) === String(f.personId));
  const row = Object.assign({}, asTutor || {}, {
    title: f.title, handle: f.handle || (asTutor || {}).handle, personId: f.personId,
    image: f.image || (asTutor || {}).image || '',
    /* AND THE FIGURE THAT CAME WITH THE FACE — `doGet` sends `avatar` on a family card only when the face is `pfp:avatar` (`faceFig_`). */
    avatar: f.image ? f.avatar : (asTutor || {}).avatar,
    role: famLabel_[f.relation] + (asTutor ? ' · ' + (asTutor.role || 'Tutor') : ''),
  });
  /* A CHILD'S PHOTOGRAPHED WORKING (501), to the parent they accepted; staff see it on the admin's list below. */
  const more = tile_(f.relation === 'child' ? [typeof workSeeOpts_ === 'function' ? workSeeOpts_(f.personId, true) : null,
      typeof workFileOpts_ === 'function' ? workFileOpts_(f.personId) : null, typeof histOpts_ === 'function' ? histOpts_(f.personId) : null] : null)
    + (typeof peopleOpts_ === 'function' ? tile_(peopleOpts_(row)) : '');
  return personMark_(f.personId, personForm_(row) || tcard_(row) + (more ? tileRow_(more, 'person-tiles') : ''));
}
/* FOR AN ADMIN, EVERYBODY ELSE IN THIS COLUMN, each with New PIN. */
function accountEveryone_(col, famIds, personForm_, tcard_) {
  /* ---------- AND FOR AN ADMIN, EVERYBODY ELSE AS WELL, by their main role (`doGet` sends no tutor or admin here) ---------- */
  return (typeof may_ === 'function' && may_('admin') && Array.isArray(DATA.everyone) ? DATA.everyone : [])
    .filter(p => p && p.title && !mineIs_(p) && !(p.personId && famIds.indexOf(String(p.personId)) !== -1))
    .filter(p => (/student/i.test(String(p.role || '')) ? 'students' : 'parents') === col)
    /* A BLANK HANDLE IS SAID, NOT FILLED WITH THE FIRST NAME. § */
    .map(p => Object.assign({}, p, { activity: subsLine_(p.personId),
                                     role: (p.role || 'Client') + (p.handle ? '' : ' · no handle yet') }))
    /* AND "NEW PIN" — the admin is who a child with no email and no linked parent goes to. § */
    /* THROUGH `tileRow_`, which puts six tiles on even lines rather than leaving one alone (453: Parents is narrower company). */
    /* A PERSON'S ROW STANDS ALONE (498): the list's layout row was joined onto the last person's, so one client "has loads of tile options". */
    .map(p => personMark_(p.personId, personForm_(p) || tcard_(p)
      + (typeof tile_ === 'function' ? tileRow_((p.personId ? tile_({ icon: 'key',
          label: 'New PIN', note: 'to sign in with', act: 'kid-pin',
          data: { id: p.personId, name: String(p.title || '').split(' ')[0] } }) : '')
          + tile_(isStudentsCol_(col) ? [typeof workSeeOpts_ === 'function' ? workSeeOpts_(p.personId) : null,
            typeof workFileOpts_ === 'function' ? workFileOpts_(p.personId) : null, typeof histOpts_ === 'function' ? histOpts_(p.personId) : null] : null)
          + (typeof peopleOpts_ === 'function' ? tile_(peopleOpts_(p)) : ''), 'person-tiles') : '')));
}
/* YOUR OWN CARD, IN A LIST OF ONE OR NONE. */
function accountMine_(col, family, myRow, tcard_) {
  /* ---------- YOUR OWN CARD, FIRST IN EVERY COLUMN YOU BELONG TO, ITS EDIT THAT FACE'S (`ownCardSections_(col)`) ---------- */
  const mine = [];
  if (typeof peopleBelong_ === 'function' && peopleBelong_(col, family)) {
    const row = myRow;
    /* NEVER AN EDITOR HERE (464): your own card is edited on your role's settings column (`ownCardSetPage_`, me.js). */
    const face = typeof meCard === 'function' ? meCard(row) : tcard_(row);
    /* REPORT (486): everything has one, your own card too. Share my profile is on your tutor card in Find (`tutorOpts_`). */
    const tiles = (typeof suggestOpts_ === 'function' ? tile_(suggestOpts_('person', String(USER.personId), row.title || '')) : '');
    mine.push(personMark_(USER.personId, face + (tiles ? tileRow_(tiles, 'own-tiles', true) : '')));
  }
  return mine;
}
/* `col` IS THE PEOPLE COLUMN (453): 'students' or 'parents' — a card per person you may already see, by category. */
function accountPages_(col) {
  if (!col) return ['students', 'parents'].reduce((a, c) => a.concat(accountPages_(c)), []);
  /* TUTORS ARE FIND › PROFILES › TUTOR (find-only, 16 Nov): their cards are Find's tutor items, never a second directory here. */
  if (!USER || isTutorsCol_(col)) return [];
  const myRow = myCardRow_();

  /* ---------- AN ITEM, NOT A ROW, AND THAT IS WHY THE MESSAGE TILE WAS MISSING § */
  /* `account: true` IS WHERE A CARD CAN BE EDITED, and `col` which column: a people column, and nowhere else the same person is drawn. */
  const asItem_ = (t, kind) => ({
    kind: kind || 'tutor', name: t.title, key: t.title, sub: t.subtitle || '', image: t.image,
    cost: priced_(t.rate), off: t.listed === false, row: t, account: true, col: col,
    more: typeof peopleOpts_ === 'function' ? tile_(peopleOpts_(t)) : '',
  });

  /* ---------- A CARD OPEN FOR EDITING IS ITS OWN FORM, IN ITS OWN PLACE § */
  const editing_ = t => typeof cardEditing_ === 'function' && cardEditing_(t, col);
  /* AN ADMIN'S PERSON FORM (373, me.js) TAKES THE CARD'S PLACE the same way, in the column it was opened on. */
  const personForm_ = t => typeof personFormFor_ === 'function' ? personFormFor_(t, col) : '';
  const tcard_ = t => typeof findCard === 'function' ? findCard({ kind: 'tutor', row: t }) : '';
  const withTiles_ = t => personForm_(t) || (editing_(t) ? cardEditHtml_(t)
    : tcard_(t) + (typeof cardRow_ === 'function' ? cardRow_(asItem_(t)) : ''));

  const { famLabel_, famMine, family } = accountFamily_();
  const famCard_ = f => accountFamCard_(f, famLabel_, personForm_, tcard_);
  /* A CHILD OR A BROTHER OR SISTER IS A STUDENT; A PARENT IS A PARENT. A family member who teaches is on Tutors as well. */
  const famIn = c => family.filter(f => (f.relation === 'parent' ? 'parents' : 'students') === c);
  const famIds = family.map(f => String(f.personId));

  const everyone = accountEveryone_(col, famIds, personForm_, tcard_);

  const mine = accountMine_(col, family, myRow, tcard_);

  const coming = typeof awaiting_ === 'function' && awaiting_() ? [loading_()] : [];
  /* "+ ADD A …", the very first card for an admin (373, 440), the new person's role ticked for this column. */
  const add = typeof peopleAddPage_ === 'function' ? [peopleAddPage_(col)].filter(Boolean) : [];
  const fam = famIn(col).map(famCard_);
  /* THE SEARCH CARD (442): Students only; the other columns move into Find (770). */
  const search = typeof peopleSearchPage_ === 'function' ? [peopleSearchPage_(col)].filter(Boolean) : [];
  let out;
  if (isStudentsCol_(col)) {
    /* FIND BY HANDLE ON TOP (442), then you, your brothers, sisters and children, then MANAGE YOUR CHILD (339) — the owner:
       "each user can edit their student people in student column". */
    const manage = typeof mayAddChild_ === 'function' && mayAddChild_() && typeof childManageCard_ === 'function' ? [childManageCard_()] : [];
    /* NEEDS HELP (455) ABOVE ALL, for Staff — help.js `HELP_COL` names this column. */
    const help = typeof helpListCard_ === 'function' ? [helpListCard_()].filter(Boolean) : [];
    out = cardMark_('ppl:students:help', help).concat(cardMark_('ppl:students:add', add), cardMark_('ppl:students:search', search),
      cardMark_('ppl:students:family', mine.concat(fam)), cardMark_('ppl:students:manage', manage), cardMark_('ppl:students:all', everyone));
  } else {
    /* A PARENT'S CLAIM ("X says they are your parent") is answered here, by the child. */
    const claims = (famMine && Array.isArray(DATA.claims) && typeof claimCard_ === 'function')
      ? DATA.claims.filter(c => c && c.rowIndex && c.from).map(claimCard_) : [];
    out = cardMark_('ppl:parents:add', add).concat(cardMark_('ppl:parents:you', mine), cardMark_('ppl:parents:claims', claims),
      cardMark_('ppl:parents:family', fam), cardMark_('ppl:parents:all', everyone));
  }
  return out.concat(coming);
}

/* ---------- SIGNING IN IS FIND'S FIRST STEP (owner, 13 Nov; 15 Nov) ---------- */
/* Signed out, the first menu is only the blank tag, typed on the site's keypad; then the digits, each picked one a * tag; tapping it takes it off. */
/* The digits live in `SIGN.pin` for the call and nowhere else: never a chip's value, the URL, history, storage or a log. */
/* A wrong PIN says nothing and clears nothing, as a Find path that matches nothing: the person takes ● tags off themselves. */
const SIGN = { step: '', who: '', pin: [], busy: false, wrong: false, known: null, card: '', dots: 0 };
/* ITS TWO FIELDS ARE kinds.json's person form `sign-in` (the name, then the PIN's digits), drawn by the one tag maker `askTags_` (form.js). */
const signField_ = f => formAsk_('sign-in', f);
/* A PIN'S LENGTH, every PIN field's (form.js `askTags_`) and the backend's (tools/cards-gen.js copies it). */
const SIGN_PIN_LEN = 4;
const signAsking_ = () => !USER && SIGN.step !== 'guest';
const signPaint_ = () => finderEach_(() => paintStuff());
function signMenu_() {
  if (!signAsking_()) return null;
  if (SIGN.busy) return [{ type: 'wait', on: true }];
  /* MAKE AN ACCOUNT IS ASKED HERE A FIELD A STEP (`sign-join`, askMenu_); sending it says what the link does. */
  const join = () => askMenu_('sign-join', { done: REG_NOTE[askOf_('sign-join').v.who] || '' });
  if (SIGN.step === 'join') return join();
  if (SIGN.step === 'pin') {
    if (SIGN.card === 'forgot' && typeof signForgotSpec_ === 'function') return [{ type: 'card', spec: signForgotSpec_() }];
    if (SIGN.card === 'join') return join();
    /* FOUR PICKED AND NOT IN: nothing at all, as a path that matches nothing. */
    /* A NAME NO ACCOUNT ANSWERS TO keeps Make an account on offer, and nothing else. */
    if (SIGN.wrong || SIGN.pin.length >= SIGN_PIN_LEN) return SIGN.known === false && !SIGN.busy
      ? [{ type: 'choices', rows: [{ look: 'sign-more', options: [{ text: text_('make-an-account'), act: 'sign-join-card' }] }] }] : [];
    const more = [SIGN.pin.length ? null : { text: 'Forgot PIN', act: 'sign-forgot' },
      SIGN.known === false ? { text: text_('make-an-account'), act: 'sign-join-card' } : null].filter(Boolean);
    return [{ type: 'choices', rows: [
      askTags_('sign-in', signField_('pin'), { act: 'sign-digit' })]
      .concat(more.length ? [{ look: 'sign-more', options: more }] : []) }];
  }
  /* ONE BOX ON ONE FINDER: Find's carries the id the checks read. */
  /* THE BLANK TAG YOU TYPE YOUR NAME ON, AND ONE TAG BESIDE IT, Guest (owner, 16 Nov): one way in, no Google row. */
  const box = signBoxOpt_(FINDER === FINDERS.stuff);
  return [{ type: 'choices', rows: [{ look: 'sign-who', options: [{ text: 'Guest', act: 'sign-guest' }, box] }] }];
}
/* THE BLANK TAG AS DATA (the checks draw it alone through `signBox_`); a text box, so the site's keypad opens on its letters. */
const signBoxOpt_ = mine => askTags_('sign-in', signField_('who'), { id: mine ? 'in-name' : '', cls: 'sign-box', value: SIGN.who });
/* THE STEP'S CHIPS, first in the row: the name, then a ● per digit, each with its own ×; they stay once signed in (owner, 15 Nov). */
function signChips_() {
  /* DATA FOR THE MENU CARD'S TAGS: a ● says only how many digits, never which. */
  const chip = (text, act, label) => ({ base: 'chip', look: 'sm sign-chip', text: text, act: act, label: label, x: { label: label }, colour: false });
  /* A * PER DIGIT (owner, 16 Nov); the whole tag is the button that takes that digit off, its × only shows it. */
  const dot = i => ({ base: 'chip', look: 'sm sign-dot', text: '*', act: 'sign-dot-drop', data: { i: i }, label: 'Remove this digit', x: { label: 'Remove this digit' }, colour: false });
  if (USER) {
    /* THE LOGIN HANDLE, ONE FORM EVERYWHERE (owner, 17 Nov); the ● tags kept on the stored sign-in, so a refresh keeps them. */
    const h = String(USER.handle || '').replace(/^@/, '').trim();
    const who = h ? '@' + h : (SIGN.who || String(USER.name || '').trim());
    const n = USER.pinDots == null ? SIGN_PIN_LEN : USER.pinDots;
    return [chip(who, 'signout', 'Sign out ' + who)].concat(Array.from({ length: n }, (_, i) => dot(i)));
  }
  if (SIGN.step === 'guest') return [chip('Guest', 'sign-restart', 'Sign in instead')];
  if (SIGN.step === 'join') return [chip(text_('make-an-account'), 'sign-restart', 'Back to sign in')].concat(askChips_('sign-join'));
  if (SIGN.step !== 'pin') return [];
  const card = SIGN.card === 'forgot' ? [chip('Forgot PIN', 'sign-card-off', 'Back to the PIN')]
    : SIGN.card === 'join' ? [chip(text_('make-an-account'), 'sign-card-off', 'Back to the PIN')].concat(askChips_('sign-join')) : [];
  return [chip(SIGN.who, 'sign-restart', 'Not ' + SIGN.who)].concat(SIGN.pin.map((_, i) => dot(i)), card);
}
on('sign-guest', () => { SIGN.step = 'guest'; SIGN.pin = []; signPaint_(); });
on('sign-join', () => { SIGN.step = 'join'; SIGN.pin = []; signJoinStart_(SIGN.who); signPaint_(); });
on('sign-forgot', () => { if (SIGN.step === 'pin' && !SIGN.pin.length) { SIGN.card = 'forgot'; signPaint_(); } });
on('sign-join-card', () => { if (SIGN.step === 'pin') { SIGN.card = 'join'; signJoinStart_(SIGN.who); signPaint_(); } });
on('sign-card-off', () => { SIGN.card = ''; signPaint_(); });
on('sign-restart', () => {
  SIGN.step = ''; SIGN.pin = []; SIGN.wrong = false; SIGN.known = null; SIGN.card = '';
  finderEach_(F => finderSet_(F, { paint: false }));
  signPaint_();
});
/* A ● TAG'S ×: that digit off. Signed in, the tag only goes; signed out, the digits ask again. */
on('sign-dot-drop', el => {
  const i = Number((el && el.dataset && el.dataset.i) || 0);
  /* SIGNED IN, A ● OFF IS A STEP BACK like any tag (owner, 18 Nov): signed out, back on the PIN step under the same name. */
  if (USER) {
    const h = String(USER.handle || '').replace(/^@/, '').trim(), who = h || SIGN.who || String(USER.name || '').trim();
    signOut_();
    SIGN.who = who; SIGN.step = 'pin'; SIGN.pin = []; SIGN.wrong = false; SIGN.known = true; SIGN.card = '';
    signPaint_(); return;
  }
  if (SIGN.step !== 'pin' || SIGN.busy) return;
  SIGN.pin.splice(i >= 0 && i < SIGN.pin.length ? i : SIGN.pin.length - 1, 1);
  SIGN.wrong = false;
  signPaint_();
});
/* AN ACCOUNT MADE FROM FIND'S Make an account goes straight on to its PIN, under the name it signs in with. */
function signAfterJoin_(who) {
  if (USER || !who || (SIGN.step !== 'join' && SIGN.card !== 'join')) return;
  SIGN.who = who; SIGN.step = 'pin'; SIGN.pin = []; SIGN.card = ''; SIGN.known = true; SIGN.wrong = false;
  signPaint_();
}
function signWho_(box) {
  const who = String((box && box.value) || '').trim();
  if (!who) { toast(text_('type-your-name-username-or-email')); return; }
  SIGN.who = who; SIGN.step = 'pin'; SIGN.pin = []; SIGN.wrong = false; SIGN.known = null; SIGN.card = '';
  signPaint_();
  /* IS IT AN ACCOUNT? Asked quietly; no answer (an older backend) offers nothing more. */
  try {
    api({ action: 'verifyLogin', probe: true, email: who, name: who }).then(d => {
      if (SIGN.who !== who || !d || !d.probe || typeof d.known !== 'boolean') return;
      SIGN.known = d.known; if (!USER) signPaint_();
    }).catch(() => {});
  } catch (e) { /* the PIN step works without it */ }
}
/* ENTER IN THE BOX (the keypad's ✓ is its Enter) PICKS THE NAME, as a tap picks a tag. */
document.addEventListener('keydown', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('sign-box') || !/^Enter$/.test(e.key)) return;
  e.preventDefault();
  signWho_(t);
});
/* THE FOURTH DIGIT SENDS: the same `verifyLogin`, so the server's attempt limits are the ones it always had. */
on('sign-digit', el => {
  const d = String((el && el.dataset && el.dataset.d) || '');
  if (USER || SIGN.step !== 'pin' || SIGN.busy || SIGN.wrong || !SIGN.who || !/^\d$/.test(d) || SIGN.pin.length >= SIGN_PIN_LEN) return;
  SIGN.pin.push(d);
  if (SIGN.pin.length < SIGN_PIN_LEN) { signPaint_(); return; }
  const who = SIGN.who, pin = SIGN.pin.join('');
  SIGN.busy = true;
  signPaint_();
  /* A REFUSAL SAYS WHY AND CLEARS THE DIGITS (owner, 18 Nov: four dots and nothing was a dead end). */
  const miss = (why, said) => {
    SIGN.busy = false; SIGN.pin = []; SIGN.wrong = false;
    if (why === 'not-an-email' || why === 'no-such-email') SIGN.known = false;
    toast(said || 'Could not sign in — check your connection and try again.');
    signPaint_();
  };
  api({ action: 'verifyLogin', email: who, name: who, pin: pin })
    .then(d2 => {
      if (!d2 || d2.error || !d2.success) { miss(d2 && d2.why, d2 && d2.error); return; }
      const dots = SIGN.pin.length;
      /* THE TAGS STAY (owner, 15 Nov): the name as typed and a ● per digit (`signedIn_`'s quiet sign-out keeps them). */
      SIGN.busy = false; SIGN.pin = []; SIGN.step = ''; SIGN.wrong = false; SIGN.card = ''; SIGN.who = who; SIGN.dots = dots;
      signedIn_(d2, who);
      if (USER) { USER.pinDots = dots; saveUser_(); }
    })
    .catch(() => miss(''));
});
