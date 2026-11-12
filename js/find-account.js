/* @family. — js/find-account.js BOOKINGS, THE FEED AND YOUR ACCOUNT AS PAGES (cut from find-levels.js; Find is read as one by tools/find-src.js). */
window.KC_FIELDS_MORE = Object.assign(window.KC_FIELDS_MORE || {}, {
  receiptTags: x => { const j = x.row || {}, paid = rcpPaid_(j);
    const rate = Number(j.rate) || (/hour/i.test(String(j.unit || '')) ? Number(j.price) : 0) || 0;
    return `<div class="qtags">${rcpTag_('Booking')}${rcpTag_(j.subject)}${rcpTag_(j.tutor ? displayName_(j.tutor) : '')}${rcpTag_(rcpWhen_(j))}${
      rcpTag_(rate > 0 ? perHour_(rate) : '')}${rcpTag_(paid, paid === 'Unpaid' ? 'is-new' : '')}</div>`; },
  receiptSum: x => { const j = x.row || {};
    const who = (j.slots || []).map(sl => sl && sl.client).filter(Boolean).map(n => displayName_(n)).join(', ') || (j.client ? displayName_(j.client) : '');
    const weeks = Number(j.weeks || (typeof jobDates_ === 'function' ? jobDates_(j).length : 0)) || 0;
    const total = j.price !== '' && j.price != null && isFinite(Number(j.price)) ? money_(Number(j.price)) + ' in all' : '';
    const said = [who, weeks ? weeks + (weeks === 1 ? ' week' : ' weeks') : '', total].filter(Boolean).join(' · ');
    return said ? `<p class="rc-sum">${esc(said)}</p>` : ''; },
});
/* THE FRONT MENU'S ANSWER, read through `DOOR_FIELD` (find-finder.js) — the one name every writer and reader of it uses (1040 friction). */
const forIs_ = want => (STUFF.filters || [])
  .some(f => f.field === DOOR_FIELD && norm(f.value) === want);
function bookingPages_(o) {
  /* ---------- THE COLUMN ASKS FOR IT DIRECTLY § */
  if (!(o && o.column) && !forIs_('booking')) return [];
  /* ---------- THE FORM IS THE ANSWER TO `Booking`, NOT TO EVERYTHING UNDER IT § */
  /* ---------- AND THE COLUMN IS EXEMPT FROM THIS TOO, WHICH IT WAS NOT § */
  const narrowed = (STUFF.filters || []).some(f => f.field !== DOOR_FIELD);
  if (!(o && o.column) && narrowed) return [];
  /* ---------- NOT BEFORE THE PAYLOAD § */
  if (typeof USER !== 'undefined' && USER && typeof awaiting_ === 'function' && awaiting_()) return [loading_()];
  const form = (typeof bookBlocks === 'function' ? bookBlocks() : []).filter(Boolean);
  if (o && o.column) return form;
  /* FIND › BOOKING (owner, 7 Nov): a Book tile on top opens the form in place; the bookings are the cards under it. */
  const top = tileRow_(tile_({ icon: BOOK_OPEN ? 'close' : 'book', label: BOOK_OPEN ? 'Close the form' : 'Book', act: 'book-open', cls: 'primary' }), 'book-top');
  return [top + (BOOK_OPEN || !USER ? (form[0] || '') : '')].concat(form.slice(1));
}
let BOOK_OPEN = false;
/* THE BOOKING FORM TAG: the form itself once that tag is chosen; under plain Booking the Book tile above opens it, so this card only points there. */
function bookFormCard_() {
  const alone = (STUFF.filters || []).some(f => f.field !== DOOR_FIELD);
  if (!alone) return card_(`<div class="book-form-door"><h3>Booking form</h3>${
    tileRow_(tile_({ icon: 'book', label: 'Book', act: 'book-open', cls: 'primary' }), 'book-top')}</div>`);
  if (typeof awaiting_ === 'function' && awaiting_()) return loading_();
  return (typeof bookBlocks === 'function' ? bookBlocks() : [])[0] || '';
}
/* SET THE ROOM, A FORM ON THE RECEIPT from the start (no sheet, owner 7 Nov). */
const jobRoomForm_ = j => `<div class="rc-form room-form">
    <label class="field"><span>the room in the venue — the family sees it</span>
      <input class="room-name" value="${esc(j.room || '')}" autocomplete="off"></label>
    <div class="btn-row">${tile_({ form: true, label: 'Save the room', act: 'job-room', data: { id: String(j.id) } })}</div>
    <p class="note room-said" aria-live="polite"></p></div>`;
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
on('book-open', () => { BOOK_OPEN = !BOOK_OPEN; repaint(); });
/* ---------- THE FEED, BEHIND ITS OWN ANSWER § */
function feedPages_() {
  /* POSTS ARE DOOR ITEMS (find-doors.js); the whole feed only stands in when those are switched off, or each post would show twice. */
  if (!forIs_('posts') || typeof postDoorItems_ === 'function') return [];
  return (typeof postsBlocks === 'function' ? postsBlocks() : []).filter(Boolean);
}
/* ---------- SIGNING IN AND OUT, ON A PAGE OF ITS OWN § */
/* ---------- WHICH ROW IS YOU, ASKED IN ONE PLACE § */
function mineIs_(t) {
  /* ---------- AND A STRANGER HAS NO ROW, WHICH THIS DID NOT HAVE TO KNOW BEFORE § */
  if (typeof USER === 'undefined' || !USER) return false;
  /* ---------- AN ID ON BOTH SIDES DECIDES, AND THE NAME IS ONLY FOR A ROW WITHOUT ONE § */
  if (t && USER.personId && t.personId) return String(t.personId) === String(USER.personId);
  return !!t && (
    (USER.handle && t.handle && norm(t.handle) === norm(USER.handle)) ||
    (USER.name && t.title && norm(t.title) === norm(USER.name)) ||
    (USER.name && t.name && norm(t.name) === norm(USER.name)));
}
/* ---------- YOUR OWN ROW, WHEREVER IT COMES FROM § */
function myCardRow_() {
  return (DATA.tutors || []).filter(mineIs_)[0] || {
    /* ---------- THE HANDLE IS PRINTED UNDER THE NAME, SO IT IS NOT SAID IN IT TOO § */
    title: nameBesideHandle_(USER.name, USER.handle) || 'Signed in',
    role:  roleOf(USER.role || 'student'),
    handle: USER.handle,
    /* YOUR PICTURE AS THE PICKER LAST KEPT IT (`USER.profile.photo`, written by `pfpTake_`), else the sign-in reply's. § */
    image: (USER.profile && typeof USER.profile.photo === 'string') ? USER.profile.photo : (USER.image || USER.photo || ''),
    avatar: USER.avatar || '',
    rate:  USER.rate,
    teaches: [],
    personId: USER.personId,
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
