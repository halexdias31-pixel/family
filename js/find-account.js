/* @family. — js/find-account.js BOOKINGS, THE FEED AND YOUR ACCOUNT AS PAGES (cut from find-levels.js; Find is read as one by tools/find-src.js). */
window.KC_FIELDS_MORE = Object.assign(window.KC_FIELDS_MORE || {}, {
  receiptTags: x => { const j = x.row || {}, paid = rcpPaid_(j);
    const rate = Number(j.rate) || (/hour/i.test(String(j.unit || '')) ? Number(j.price) : 0) || 0;
    return cardBlock_({ type: 'group', look: 'qtags', inner: rcpTag_('Booking') + rcpTag_(j.subject) + rcpTag_(j.tutor ? displayName_(j.tutor) : '') + rcpTag_(rcpWhen_(j))
      + rcpTag_(rate > 0 ? perHour_(rate) : '') + rcpTag_(paid, paid === 'Unpaid' ? 'is-new' : '') }); },
  receiptSum: x => { const j = x.row || {};
    const who = (j.slots || []).map(sl => sl && sl.client).filter(Boolean).map(n => displayName_(n)).join(', ') || (j.client ? displayName_(j.client) : '');
    const weeks = Number(j.weeks || (typeof jobDates_ === 'function' ? jobDates_(j).length : 0)) || 0;
    const total = j.price !== '' && j.price != null && isFinite(Number(j.price)) ? money_(Number(j.price)) + ' in all' : '';
    const said = [who, weeks ? weeks + (weeks === 1 ? ' week' : ' weeks') : '', total].filter(Boolean).join(' · ');
    return said ? cardBlock_({ type: 'group', tag: 'p', look: 'rc-sum', text: said }) : ''; },
});
/* THE FRONT MENU'S ANSWER, read through `DOOR_FIELD` (find-finder.js) — the one name every writer and reader of it uses (1040 friction). */
const forIs_ = want => (STUFF.filters || [])
  .some(f => f.field === DOOR_FIELD && norm(f.value) === want);
function bookingPages_(o) {
  /* ---------- THE COLUMN ASKS FOR IT DIRECTLY § */
  if (o && o.column) {
    if (typeof USER !== 'undefined' && USER && typeof awaiting_ === 'function' && awaiting_()) return [loading_()];
    return (typeof bookBlocks === 'function' ? bookBlocks() : []).filter(Boolean);
  }
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
/* THE BOOKING ITEM ONLY PUTS Booking ON THE FRONT MENU: the steps are the menu and the summary is a front page, so it draws nothing. */
const bookFormCard_ = () => '';

/* ---------- BOOKING IS A FIND BRANCH (owner, 13 Nov): after Booking, one menu of tags a step, in dependency order ---------- */
/* `days` and `slots` are the hour grid asked as two menus; `avail` is a waiting list's week; each step reads only steps above it. */
const BOOK_FIND_ORDER = ['how', 'client', 'joining', 'subjects', 'level', 'tutor', 'loc', 'hosting', 'interval', 'days', 'slots', 'avail', 'kids', 'n'];
/* THE TWO THE SITE ANSWERS ITSELF (`bookPrefill_`): an instant class, a new one; each is still a chip whose × asks it. */
const BOOK_FIND_GIVEN = ['how', 'joining'];
/* SEVERAL ANSWERS: a tap ticks, Next moves on; the second list need at least one before it does. */
const BOOK_FIND_MANY = ['subjects', 'interval', 'kids', 'days', 'slots', 'avail'];
const BOOK_FIND_ONE_PLUS = ['subjects', 'days', 'slots'];
/* Booking IS ASKED AS THE DOOR OR AS WHAT IT IS FOR (`forLabel`, the signed-out front); any other chip narrows to cards instead. */
const BOOK_FIND_DOORS = [DOOR_FIELD, 'forLabel'];
const bookFindOn_ = () => { const fs = STUFF.filters || [];
  return fs.some(f => BOOK_FIND_DOORS.indexOf(f.field) !== -1 && norm(f.value) === 'booking') && fs.every(f => BOOK_FIND_DOORS.indexOf(f.field) !== -1); };
function bookFindStart_() {
  if (typeof bookPrefill_ === 'function') bookPrefill_();
  /* ONCE A FORM: a chip's × on either asks it, and the next draw must not answer it again. */
  if (!BOOK_FIND.started) {
    BOOK_FIND.started = true;
    if (!BOOKING.how) BOOKING.how = 'Instant class';
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
const bookFindPassed_ = id => !!BOOK_FIND.done[id] || (BOOK_FIND_GIVEN.indexOf(id) !== -1 && !!BOOKING[id]);
/* THE STEP BEING ASKED, or '' once every step is answered and the summary card is the answer. */
function bookFindAt_() {
  try { return BOOK_FIND_ORDER.find(id => bookFindAsks_(id) && !bookFindPassed_(id)) || ''; }
  catch (e) { oops_(e, 'book:at'); return ''; }
}
/* A STEP'S TAGS: `act` and `data` are what a tap does; `on` is ticked or chosen; `off` is why it cannot be taken. */
function bookFindOpts_(id) {
  if (id === 'days') return bookOpenDays_().map(d => ({ text: day_(d), act: 'book-pick', data: { step: id, v: d }, on: BOOK_FIND.days.indexOf(d) !== -1 }));
  if (id === 'slots') {
    const on = BOOKING.slots || [];
    return slotGrid().days.filter(d => BOOK_FIND.days.indexOf(d.label) !== -1).flatMap(d => d.hours.map(h => ({
      text: day_(d.label) + ' ' + String(h.h).padStart(2, '0') + ':00', act: 'book-slot', data: { code: h.code },
      on: on.indexOf(h.code) !== -1, off: h.open ? '' : (h.why || 'not available'), note: h.open ? h.why : '' })));
  }
  if (id === 'avail') {
    const on = BOOKING.avail || [];
    return SLOT_DAYS.flatMap(([, label]) => SLOT_BLOCKS.map(b => blockPhrase_(label, b)))
      .map(p => ({ text: p, act: 'book-block', data: { when: p }, on: on.indexOf(p) !== -1 }));
  }
  const st = bookStep_(id);
  let opts = [];
  try { opts = (st.options() || []).filter(Boolean); } catch (e) { opts = []; }
  const v = BOOKING[id];
  const isOn = o => st.multi ? (v || []).some(c => norm(c) === norm(o)) : norm(v) === norm(o);
  return opts.map(o => ({ text: String(st.label_ ? st.label_(o) : o), act: 'book-pick', data: { step: id, v: o }, on: isOn(o),
    off: st.off ? String(st.off(o) || '') : '' }));
}
const BOOK_FIND_ASK = { days: 'Which days?', slots: 'What times? Each tag is one hour.' };
/* THE MENU FOR THE STEP BEING ASKED: its question, its tags (the one tag maker), and Next on a several-answer step. */
function bookMenu_() {
  bookFindStart_();
  const id = bookFindAt_();
  if (!id) return null;
  const many = BOOK_FIND_MANY.indexOf(id) !== -1;
  const opts = bookFindOpts_(id).map(o => ({ text: (many && o.on ? '✓ ' : '') + o.text + (o.off ? ' · ' + o.off : o.note ? ' · ' + o.note : ''),
    act: o.act, data: o.data, pressed: !!o.on, disabled: !!o.off, look: ((o.on ? 'is-on' : '') + (o.off ? ' is-off' : '')).trim() }));
  if (many) opts.push({ text: 'Next', act: 'book-next', data: { step: id }, look: 'is-skip' });
  return ({ type: 'choices', ask: BOOK_FIND_ASK[id] || (bookStep_(id) || {}).label || '',
    rows: [{ look: 'book-step' + (id === 'slots' || id === 'avail' ? ' is-grid' : ''), options: opts }] });
}
/* (Both menus below are blocks for Find's menu card, drawn by `renderCard`, never markup.) */
/* WHAT A STEP'S CHIP SAYS: its answer as the summary says it; a bare number names what it counts. */
function bookSaid_(id) {
  if (id === 'days') return BOOK_FIND.days.map(day_).join(', ');
  if (id === 'slots') return bookRuns().map(r => day_(r.dayName) + ' ' + hours_(r.hour, r.hour + r.hours)).join(', ');
  if (id === 'avail') return blockSay_(BOOKING.avail);
  const st = bookStep_(id), v = BOOKING[id];
  const said = o => String(st.label_ ? st.label_(o) : o);
  const text = st.multi ? (v || []).map(said).join(', ') : v ? said(v) : '';
  return /^\d+$/.test(text) ? st.short + ' ' + text : text;
}
/* THE STEPS ANSWERED, AS CHIPS AFTER Booking's: tapping one (or its ×) asks that step again and every step after it. */
function bookChips_() {
  if (!bookFindOn_() || typeof bookStep_ !== 'function') return [];
  try {
    bookFindStart_();
    return BOOK_FIND_ORDER.filter(id => bookFindAsks_(id) && bookFindPassed_(id)).map(id => {
      const text = bookSaid_(id) || 'None', label = 'Change ' + text;
      return { base: 'chip', look: 'sm book-chip', text: text, act: 'book-back', data: { step: id }, label: label, x: { label: label }, colour: false };
    });
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
  const values = facetValues(items, facet).filter(v => spellKey_(v.value) !== spellKey_(KINDS.bookform.label));
  return values.length ? menu.concat(facetAnswersSpec_(facet, values)) : menu;
}
/* EVERY STEP CHANGE REPAINTS FIND, and the draft is kept as the form's was (`bookKeep_`). */
function bookFindPaint_() {
  if (typeof bookHomeSeats_ === 'function') bookHomeSeats_();
  if (typeof bookKeep_ === 'function') bookKeep_();
  finderEach_(() => paintStuff(true));
}
/* ONE ANSWER: chosen and on to the next step; one of several: ticked or unticked, the step stays. The step's own `set` and `off` as before. */
on('book-pick', el => {
  const id = el.dataset.step, v = el.dataset.v;
  if (id === 'days') {
    const at = BOOK_FIND.days.indexOf(v);
    if (at === -1) BOOK_FIND.days.push(v); else BOOK_FIND.days.splice(at, 1);
    BOOK_FIND.days.sort((a, b) => SLOT_DAYS.findIndex(d => d[1] === a) - SLOT_DAYS.findIndex(d => d[1] === b));
    return bookFindPaint_();
  }
  const st = bookStep_(id);
  if (!st) return;
  if (st.multi) { bookToggle_(st, v); return bookFindPaint_(); }
  const no = st.off && v ? String(st.off(v) || '') : '';
  if (no) { toast(v + ' ' + no); return; }
  BOOKING[id] = v || '';
  if (st.set) st.set(BOOKING[id]);
  BOOK_FIND.done[id] = true;
  bookFindPaint_();
});
on('book-next', el => {
  const id = el.dataset.step;
  const had = id === 'days' ? BOOK_FIND.days : (BOOKING[id] || []);
  if (BOOK_FIND_ONE_PLUS.indexOf(id) !== -1 && !had.length) { toast('Pick at least one first.'); return; }
  BOOK_FIND.done[id] = true;
  bookFindPaint_();
});
/* BACK TO A STEP: it and every step after it are asked again, from empty. */
function bookFindBack_(id) {
  const at = BOOK_FIND_ORDER.indexOf(id);
  if (at === -1) return;
  BOOK_FIND_ORDER.slice(at).forEach(k => {
    delete BOOK_FIND.done[k];
    if (k === 'days') { BOOK_FIND.days = []; return; }
    const st = bookStep_(k);
    if (st) BOOKING[k] = (st.multi || st.grid) ? [] : '';
  });
  bookFindPaint_();
}
on('book-back', el => bookFindBack_(el.dataset.step));
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
      if (!d || d.error) { if (said) said.textContent = (d && d.error) || 'Not saved'; el.disabled = false; return; }
      const j = (DATA.liveJobs || DATA.jobs || []).find(x => String(x.id) === String(el.dataset.id));
      if (j) j.room = room;
      toast('Room saved'); repaint();
    })
    .catch(() => { el.disabled = false; toast('Not saved'); });
});
/* ---------- THE FEED, BEHIND ITS OWN ANSWER § */
function feedPages_() {
  /* POSTS ARE DOOR ITEMS (find-doors.js); the whole feed only stands in when those are switched off, or each post would show twice. */
  if (!forIs_('posts') || typeof postDoorItems_ === 'function') return [];
  return (typeof window.postsBlocks === 'function' ? window.postsBlocks() : []).filter(Boolean);
}
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
      typeof workFileOpts_ === 'function' ? workFileOpts_(f.personId) : null] : null)
    + (typeof peopleOpts_ === 'function' ? tile_(peopleOpts_(row)) : '');
  return personMark_(f.personId, personForm_(row) || tcard_(row) + (more ? tileRow_(more, 'person-tiles') : ''));
}
/* FOR AN ADMIN, EVERYBODY ELSE IN THIS COLUMN, each with Message and New PIN. */
function accountEveryone_(col, famIds, personForm_, tcard_) {
  /* ---------- AND FOR AN ADMIN, EVERYBODY ELSE AS WELL, by their main role (`doGet` sends no tutor or admin here) ---------- */
  return (typeof isAdmin === 'function' && isAdmin() && Array.isArray(DATA.everyone) ? DATA.everyone : [])
    .filter(p => p && p.title && !mineIs_(p) && !(p.personId && famIds.indexOf(String(p.personId)) !== -1))
    .filter(p => (/student/i.test(String(p.role || '')) ? 'students' : 'parents') === col)
    /* A BLANK HANDLE IS SAID, NOT FILLED WITH THE FIRST NAME. § */
    .map(p => Object.assign({}, p, { activity: subsLine_(p.personId),
                                     role: (p.role || 'Client') + (p.handle ? '' : ' · no handle yet') }))
    /* AND "NEW PIN" BESIDE "MESSAGE" — the admin is who a child with no email and no linked parent goes to. § */
    /* THROUGH `tileRow_`, which puts six tiles on even lines rather than leaving one alone (453: Parents is narrower company). */
    /* A PERSON'S ROW STANDS ALONE (498): the list's layout row was joined onto the last person's, so one client "has loads of tile options". */
    .map(p => personMark_(p.personId, personForm_(p) || tcard_(p)
      + (typeof tile_ === 'function' ? tileRow_(tile_({ icon: 'chat',
          label: 'Message', note: 'a note to them', act: 'msg-open',
          data: { to: p.title, id: p.personId || '' } }) + (p.personId ? tile_({ icon: 'key',
          label: 'New PIN', note: 'to sign in with', act: 'kid-pin',
          data: { id: p.personId, name: String(p.title || '').split(' ')[0] } }) : '')
          + tile_(isStudentsCol_(col) ? [typeof workSeeOpts_ === 'function' ? workSeeOpts_(p.personId) : null,
            typeof workFileOpts_ === 'function' ? workFileOpts_(p.personId) : null] : null)
          + (typeof peopleOpts_ === 'function' ? tile_(peopleOpts_(p)) : ''), 'person-tiles') : '')));
}
/* YOUR OWN CARD, IN A LIST OF ONE OR NONE. */
function accountMine_(col, family, myRow, tcard_) {
  /* ---------- YOUR OWN CARD, FIRST IN EVERY COLUMN YOU BELONG TO, ITS EDIT THAT FACE'S (`ownCardSections_(col)`) ---------- */
  const mine = [];
  if (typeof peopleBelong_ === 'function' && peopleBelong_(col, family)) {
    const row = isTutorsCol_(col) ? (cardMine_() || myRow) : myRow;
    /* NEVER AN EDITOR HERE (464): your own card is edited on your role's settings column (`ownCardSetPage_`, me.js). */
    const face = row !== myRow ? tcard_(row) : (typeof meCard === 'function' ? meCard(row) : tcard_(row));
    /* SHARE MY PROFILE (400): their own `?tutor=` link, to send a family — on the tutor face. */
    const share = isTutorsCol_(col) && rankAtLeast_('staff') && USER.handle
      ? tile_({ icon: 'share', label: 'Share my profile', note: 'your link', act: 'tutor-share', data: { handle: USER.handle } }) : '';
    /* SHARE only: Edit is on your settings column (464); Sign out and Send the link again on Student settings (453). */
    /* AND REPORT (486): everything has one, your own card too. */
    const tiles = share + (typeof suggestOpts_ === 'function' ? tile_(suggestOpts_('person', String(USER.personId), row.title || '')) : '');
    mine.push(personMark_(USER.personId, face + (tiles ? tileRow_(tiles, 'own-tiles', true) : '')));
  }
  return mine;
}
/* `col` IS THE PEOPLE COLUMN (453): 'tutors', 'students' or 'parents' — a card per person you may already see, by category. */
function accountPages_(col) {
  if (!col) return ['tutors', 'students', 'parents'].reduce((a, c) => a.concat(accountPages_(c)), []);
  if (!USER) return [];
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
  if (isTutorsCol_(col)) {
    /* THE DIRECTORY EVERYBODY SIGNED IN READS, less you (your card is above). */
    const others = (DATA.tutors || []).filter(t => t && t.title && !mineIs_(t)).map(t => personMark_(t.personId, withTiles_(t)));
    /* EACH LIST A CARD OF ITS OWN (465): the admin's layout tiles go on the list, not on each person. */
    out = cardMark_('ppl:tutors:add', add).concat(cardMark_('ppl:tutors:dir', mine.concat(others)));
  } else if (isStudentsCol_(col)) {
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

/* ---------- SIGNING IN IS FIND'S FIRST STEP (owner, 13 Nov) ---------- */
/* Signed out, the first menu is Guest or who you are; a name is followed by four menus of digits, each picked one a ● chip. */
/* The digits live in `SIGN.pin` for the one call and nowhere else: never a chip's value, the URL, history, storage or a log. */
const SIGN = { step: '', who: '', pin: [], busy: false };
const SIGN_PIN_LEN = 4;
const SIGN_DIGITS = '0123456789'.split('');
const signAsking_ = () => !USER && SIGN.step !== 'guest';
const signPaint_ = () => finderEach_(() => paintStuff());
function signMenu_() {
  if (!signAsking_()) return null;
  if (SIGN.busy) return [{ type: 'wait', on: true }];
  if (SIGN.step === 'join') return [typeof registerSpec_ === 'function' ? { type: 'card', spec: registerSpec_() } : ''];
  if (SIGN.step === 'pin') return [{ type: 'choices', rows: [
    { look: 'is-grid sign-pin', options: SIGN_DIGITS.map(d => ({ text: d, act: 'sign-digit', data: { d: d, repeat: true } })) },
    { look: 'sign-more', options: [{ text: 'Forgot PIN', act: 'forgot-pin' }] }] }];
  /* ONE BOX ON ONE FINDER: Find's carries the id the forgotten-PIN tag and the checks read. */
  const mine = FINDER === FINDERS.stuff, google = mine && !!(DATA.googleClientId || '');
  if (google && typeof mountGoogleWhenDrawn === 'function') mountGoogleWhenDrawn();
  /* THE BLANK TAG YOU TYPE YOUR NAME ON: no example and nothing remembered (383); `mine` gives it the id. */
  const box = signBoxOpt_(mine);
  return [{ type: 'choices', rows: [{ look: 'sign-who', options: [{ text: 'Guest', act: 'sign-guest' }, box,
    { text: 'Make an account', act: 'sign-join' }, { text: 'Forgot PIN', act: 'forgot-pin' }] }].concat(google ? [{ look: 'g-row', id: 'g-btn', options: [] }] : []) }];
}
/* THE BLANK TAG AS DATA (the checks draw it alone through `signBox_`). */
const signBoxOpt_ = mine => ({ box: { id: mine ? 'in-name' : '', cls: 'sign-box', inputmode: 'email', value: SIGN.who, label: 'Your name, @username or email' }, look: 'sign-type' });
const signBox_ = mine => cardChoice_(signBoxOpt_(mine));
/* THE STEP'S CHIPS, first in the row: your name signed in (its × signs out), Guest, or the name and a ● per digit. */
function signChips_() {
  /* DATA FOR THE MENU CARD'S TAGS: a ● says only how many digits, never which. */
  const chip = (text, act, label) => ({ base: 'chip', look: 'sm sign-chip', text: text, act: act, label: label, x: { label: label }, colour: false });
  if (USER) { const who = String(USER.name || USER.handle || '').trim(); return [chip(who, 'signout', 'Sign out ' + who)]; }
  if (SIGN.step === 'guest') return [chip('Guest', 'sign-restart', 'Sign in instead')];
  if (SIGN.step === 'join') return [chip('Make an account', 'sign-restart', 'Back to sign in')];
  if (SIGN.step !== 'pin') return [];
  const dots = SIGN.busy ? SIGN_PIN_LEN : SIGN.pin.length;
  return [chip(SIGN.who, 'sign-restart', 'Not ' + SIGN.who)].concat(Array.from({ length: dots }, () => ({ base: 'chip', look: 'sm sign-dot', text: '●', hidden: true, colour: false })));
}
on('sign-guest', () => { SIGN.step = 'guest'; SIGN.pin = []; signPaint_(); });
on('sign-join', () => { SIGN.step = 'join'; SIGN.pin = []; signPaint_(); });
on('sign-restart', () => {
  SIGN.step = ''; SIGN.pin = [];
  finderEach_(F => finderSet_(F, { paint: false }));
  signPaint_();
});
/* AN ACCOUNT MADE FROM FIND'S Make an account goes straight on to its PIN, under the name it signs in with. */
function signAfterJoin_(who) {
  if (USER || SIGN.step !== 'join' || !who) return;
  SIGN.who = who; SIGN.step = 'pin'; SIGN.pin = [];
  signPaint_();
}
function signWho_(box) {
  const who = String((box && box.value) || '').trim();
  if (!who) { toast('Type your name, @username or email first.'); return; }
  SIGN.who = who; SIGN.step = 'pin'; SIGN.pin = [];
  signPaint_();
}
/* ENTER IN THE BOX PICKS THE NAME, as a tap picks a tag. */
document.addEventListener('keydown', e => {
  const t = e.target;
  if (!t || !t.classList || !t.classList.contains('sign-box') || !/^Enter$/.test(e.key)) return;
  e.preventDefault();
  signWho_(t);
});
/* THE FOURTH DIGIT SENDS: the same `verifyLogin`, so the server's attempt limits are the ones it always had. */
on('sign-digit', el => {
  const d = String((el && el.dataset && el.dataset.d) || '');
  if (USER || SIGN.step !== 'pin' || SIGN.busy || !SIGN.who || !/^\d$/.test(d)) return;
  SIGN.pin.push(d);
  if (SIGN.pin.length < SIGN_PIN_LEN) { signPaint_(); return; }
  const who = SIGN.who, pin = SIGN.pin.join('');
  SIGN.pin = []; SIGN.busy = true;
  signPaint_();
  send_({ action: 'verifyLogin', email: who, name: who, pin: pin })
    .then(d2 => {
      SIGN.busy = false;
      if (!d2.success) { toast(d2.error || 'That did not work.'); signPaint_(); return; }
      SIGN.step = ''; SIGN.who = '';
      signedIn_(d2, who);
    })
    /* `send_` HAS TOASTED THE SERVER'S SENTENCE; a name it does not know goes back to the box to correct. */
    .catch(err => {
      SIGN.busy = false;
      const why = err && err.reply && err.reply.why;
      if (why === 'not-an-email' || why === 'no-such-email') SIGN.step = '';
      signPaint_();
      const box = $('in-name');
      if (box && !SIGN.step) { box.setAttribute('aria-invalid', 'true'); box.focus(); box.select(); }
    });
});
