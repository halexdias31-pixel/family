check('Staff hub (405): "Staff hub" is on Tutor settings, "Share my profile" under her card on Tutors (453), and a line says the terms are not agreed; I agree records the version on the server; a new version asks again; a client has no hub', async () => {
  const W = hubWorld_();
  const a = await hubBoot_(W, 'tutor@example.org');
  if (a.err) return [a.err];
  const bad = [];
  /* NO SHEET (owner, 8 Nov): the hub is in its card from the start, on the terms. */
  const hub = () => a.d.querySelector('#s-staff .staff-top:not(.is-locked) .hub') || a.d.createElement('div');
  const tile = a.d.querySelector('#s-staff .staff-top .hub');
  const share = a.d.querySelector('#s-tutors [data-do="tutor-share"][data-handle="adatutor"]');
  if (!tile) return ['Ada\'s Tutor settings has no Staff hub: ' + [...a.d.querySelectorAll('#s-staff .page:first-child [data-do]')].map(x => x.dataset.do).join(',')];
  if (!share) bad.push('Share my profile is not under Ada\'s own card on Tutors');
  const warn = () => String((a.d.querySelector('#s-staff .hub-warn') || {}).textContent || '');
  if (!/not agreed to the tutor terms/.test(warn())) bad.push('no line under Ada\'s card saying the terms are not agreed: ' + JSON.stringify(warn()));
  const text = String(hub().textContent);
  if (!hub().querySelector('.hub-terms')) return bad.concat(['Staff hub did not open on the terms: ' + text.slice(0, 120)]);
  ['self-employed', 'Bookings', 'Cancellations', 'Pay and the business', 'Safeguarding and DBS', 'Conduct', 'Data protection', 'Ending the arrangement', 'Changes to these terms']
    .filter(h => ![...hub().querySelectorAll('.doc h4')].some(x => x.textContent.indexOf(h) !== -1)).forEach(h => bad.push('the terms have no section on ' + h));
  if (!/National Insurance/.test(text) || !/Version v1-2026-10-24/.test(text)) bad.push('the terms do not say tax and NI are the tutor\'s, or carry no version');
  let box = hub().querySelector('[data-do="agree-sign"]');
  box.checked = true; a.A('agree-sign', box); await wait(400);
  const post = a.sent.filter(x => x.action === 'signAgreement').pop();
  if (!post || post.version !== 'v1-2026-10-24') bad.push('I agree posted ' + JSON.stringify(post) + ', not the version v1-2026-10-24');
  if (W.sheet("read(TAB.people).rows.find(r => r.person_id === 'P-T1').agreement_version") !== 'v1-2026-10-24') bad.push('the server did not record the version');
  if (warn()) bad.push('the not-agreed line is still under the card after I agree: ' + warn());
  if (/to agree/.test(String((a.d.querySelector('#s-staff [data-do="hub-part"][data-part="terms"]') || {}).title))) bad.push('the Terms tile still says to agree');
  /* A NEW VERSION ON THE BRAND TAB — a bare date, which the sheet would turn into one, so it is sent as v2026-11-01: asked again, the old record replaced. */
  a.t.DATA().brand = Object.assign({}, a.t.DATA().brand, { tutor_terms_version: '2026-11-01' });
  a.w.paint('staff'); await wait(200);
  if (!/terms have changed/.test(warn())) bad.push('a new terms version did not bring the line back: ' + JSON.stringify(warn()));
  box = hub().querySelector('[data-do="agree-sign"]');
  if (!box || box.checked || box.disabled) bad.push('the new version\'s box is not open to tick');
  if (!/changed since you agreed to version v1-2026-10-24/.test(hub().textContent)) bad.push('the hub does not say which version was agreed before');
  box.checked = true; a.A('agree-sign', box); await wait(400);
  if (W.sheet("read(TAB.people).rows.find(r => r.person_id === 'P-T1').agreement_version") !== 'v2026-11-01') bad.push('agreeing to the new version did not replace the old on the server');
  const c = await hubBoot_(W, 'parent@example.org');
  if (c.err) return bad.concat([c.err]);
  if (c.d.querySelector('#s-staff [data-do="hub-part"]:not([disabled]), #s-staff .hub-warn')) bad.push('a client has a usable Staff hub tile or the terms line');
  return bad;
});

/* ---------- A COLUMN PER RANK (444), AND EVERY SETTING IN ONE PLACE § */
const RANK_COLS_ = [
  ['student@example.org', 'student', 'P-S1'], ['parent@example.org', 'client', 'P-C1'],
  ['tutor@example.org', 'staff', 'P-T1'], ['admin@example.org', 'admin', 'P-A1']];
/* EVERY EDITOR ON THE PAGE, as field → the forms it is in: `data-me` boxes, and the PIN. */
const editorsOf_ = (d, into) => {
  const where = el => { const s = el.closest('section.screen'); return s ? s.id.replace(/^s-/, '') : '?'; };
  const add = (f, el) => {
    /* A PLACE IS A COLUMN AND A CARD'S TITLE — the same card drawn again after a repaint is the same place. */
    const card = el.closest('.card-ed') ? 'your card, editing' : el.closest('.hub') ? 'the hub'
      : String(((el.closest('.card') || {}).querySelector || (() => null)).call(el.closest('.card'), 'h3')?.textContent || '').trim();
    (into[f] = into[f] || new Set()).add(where(el) + ': ' + card);
  };
  /* A LOCKED CARD (467) IS SHOWN, NOT EDITED: its boxes are disabled and are no place to edit anything. */
  const live = el => !el.disabled && !el.closest('.is-locked');
  d.querySelectorAll('[data-me]').forEach(el => { if (live(el)) add(el.dataset.me, el); });
  /* THE HUB'S PRICING SLIDERS ONLY TRY FIGURES SINCE 620 (no Save), so they are no place a setting is edited. */
  d.querySelectorAll('[data-do="pin-save"]').forEach(el => { if (live(el)) add('pin', el); });
  return into;
};
/* ---------- EVERYTHING HAS A REPORT TILE (486): owner, "everything should have a report button" ---------- */
check('486: every top-level card and widget in every column has the one Report tile, for a signed-in student and an admin', async () => {
  const W = hubWorld_();
  const bad = [];
  for (const [who, rank] of RANK_COLS_.filter(r => r[1] === 'student' || r[1] === 'admin')) {
    const a = await hubBoot_(W, who);
    if (a.err) { bad.push(rank + ': ' + a.err); continue; }
    let seen = 0;
    for (const tab of a.t.TABS.map(x => x.id)) {
      try { a.w.paint(tab); } catch (e) {}
      await wait(30);
      const sec = a.d.getElementById('s-' + tab);
      if (!sec) continue;
      /* TOP-LEVEL: a card inside no other card; locked and the padlock line have nothing to press (467). An EMPTY card has its Suggest too (owner, 1 Nov: "no buttons on 'saved'"). */
      const cards = [...sec.querySelectorAll('.card')].filter(c => !c.parentElement.closest('.card') && !c.matches('.is-locked, .rank-off, .col-lock, .people-none, .set-none'));
      cards.forEach(c => {
        seen++;
        /* A PERSON'S CARD HAS ITS ROW RIGHT AFTER IT (`withTiles_`, find.js). */
        const next = c.nextElementSibling;
        if (!c.querySelector('[data-do="rep-box"]') && !(next && next.matches('.tile-row') && next.querySelector('[data-do="rep-box"]'))) bad.push(rank + ' ' + tab + ': no Report on “' + String((c.querySelector('h2, h3') || c).textContent).replace(/\s+/g, ' ').trim().slice(0, 50) + '” (' + c.className + ')');
      });
    }
    if (seen < 10) bad.push(rank + ': only ' + seen + ' cards were seen, so the rule was NOT checked');
    /* YOUR OWN POST AND A "+" CARD TOO (720): both had been let off. */
    if (!/rep-box/.test(a.w.postTiles_({ id: 'P-own', mine: true, title: 'Mine' }))) bad.push(rank + ': your own post has no Suggest a change');
    if (!/rep-box/.test(a.w.addCard_({ act: 'media-add', label: 'Add a reel', data: { kind: 'reel' } }))) bad.push(rank + ': a "+" card has no Suggest a change');
  }
  return bad;
});

check('Six columns (453, 461): Parent, Tutor and Student settings, then Tutor, Student and Parent profiles, in that order and so labelled; the profiles hold a card per person by category, your own first where you belong; the settings hold that type\'s settings, a column above your rank says so; Business is an admin\'s alone; every setting is edited in exactly one place', async () => {
  const W = hubWorld_();
  const bad = [];
  /* THE OWNER'S ORDER SINCE 730: the profiles first, then the settings (Web settings, an admin's, between Tutor and Kids). */
  const SIX = ['s-tutors', 's-students', 's-parents', 's-staff', 's-account', 's-family'];
  const LABELS = ['Tutor profile', 'Student profile', 'Parent profile', 'Tutor settings', 'Kids settings', 'Parent settings'];
  for (const [who, rank, pid] of RANK_COLS_) {
    const a = await hubBoot_(W, who);
    if (a.err) { bad.push(rank + ': ' + a.err); continue; }
    const q = s => a.d.querySelector(s);
    const txt = s => String((q(s) || {}).textContent || '');
    const order = [...a.d.querySelectorAll('#screen > section.screen')].map(s => s.id).filter(id => SIX.indexOf(id) !== -1);
    SIX.forEach(id => { if (order.indexOf(id) === -1) bad.push(rank + ' has no ' + id + ' column'); });
    const tabOrder = a.t.TABS.map(x => 's-' + x.id).filter(id => SIX.indexOf(id) !== -1);
    if (tabOrder.join() !== SIX.join()) bad.push(rank + ': the six read ' + tabOrder.join(' ') + ', wanted ' + SIX.join(' '));
    const tabs = a.t.TABS.map(x => x.id), labs = SIX.map(id => (a.t.TABS.find(x => 's-' + x.id === id) || {}).label);
    if (labs.join('|') !== LABELS.join('|')) bad.push(rank + ': the six are labelled ' + JSON.stringify(labs));
    if (rank === 'admin' && (tabs[tabs.length - 1] !== 'biz' || tabs.indexOf('site') !== tabs.indexOf('staff') + 1)) bad.push('Biz settings is not last, or Web settings not right of Tutor settings, for an admin (730)');
    /* THE READING ALOUD VOICE IS A GENERIC SETTING: Student settings, nowhere else. */
    /* (jsdom has no speech, so `voiceCard_` may draw nothing: what is asked is that it is never anywhere else.) */
    if (a.d.querySelectorAll('.voice-card').length > 1 || (a.d.querySelector('.voice-card') && !q('#s-account .voice-card'))) bad.push(rank + ': Reading aloud is not on Student settings alone');
    /* NEEDS HELP TOPS STUDENT PROFILES FOR STAFF AND UP (HELP_COL), and nobody below sees it. */
    const firstPg = q('#s-students > .page');
    if ((rank === 'staff' || rank === 'admin') !== !!(firstPg && firstPg.querySelector('.help-list'))) bad.push(rank + ': Needs help ' + (rank === 'staff' || rank === 'admin' ? 'is not the first page of Student profiles' : 'is shown below Staff'));
    if (a.d.querySelectorAll('.help-list').length > 1) bad.push(rank + ': Needs help is drawn more than once');
    if ((rank === 'admin') !== !!q('#s-biz')) bad.push(rank + (rank === 'admin' ? ' has no Business column' : ' is given the Business column'));
    /* STUDENT SETTINGS: every account's PIN, roles, notifications and Sign out, and nothing of a parent's, tutor's or people's. */
    if (!q('#s-account .roles-card') || !q('#s-account [data-do="pin-save"]') || !q('#s-account .notify-card') || !q('#s-account [data-do="signout"]')) bad.push(rank + ': Student settings lacks Your roles, the PIN, Notifications or Sign out');
    if (q('#s-account .hub, #s-account .kid-manage, #s-account [data-do="person-add"], #s-account .col-lock')
      || q('#s-account [data-do="card-edit"]')) bad.push(rank + ': a person, a parent\'s or a tutor\'s thing is on Student settings');
    /* 469: EACH SETTING ON ONE COLUMN FOR EVERY RANK, the lowest it applies to — everybody's four on Student settings, usable by every rank. */
    const ownIds = [...a.d.querySelectorAll('#s-account [data-lay-card^="own:"], #s-family [data-lay-card^="own:"], #s-staff [data-lay-card^="own:"]')]
      .map(x => x.closest('.screen').id.slice(2) + '|' + x.dataset.layCard);
    const seen = {};
    ownIds.forEach(x => { const id = x.split('|')[1]; seen[id] = (seen[id] || 0) + 1; if (x.split('|')[0] !== id.split(':')[1]) bad.push(rank + ': ' + id + ' is drawn on ' + x.split('|')[0]); });
    Object.keys(seen).forEach(id => { if (seen[id] !== 1) bad.push(rank + ': ' + id + ' is drawn ' + seen[id] + ' times across the settings columns'); });
    ['picture', 'figure', 'name', 'handle'].forEach(k => {
      const el = q('#s-account .card-ed[data-lay-card="own:account:' + k + '"]');
      if (!el || el.closest('.is-locked')) bad.push(rank + ': your ' + k + ' is not an open card on Student settings');
    });
    if (rank === 'staff' || rank === 'admin') ['headline', 'where'].forEach(k => { if (!q('#s-staff .card-ed[data-lay-card="own:staff:' + k + '"]')) bad.push(rank + ': ' + k + ' is not on Tutor settings'); });
    if (q('#s-family [data-me="email"], #s-staff [data-me="email"], #s-family [data-me="postcode"]')) bad.push(rank + ': your contact is on a column above Student settings');
    const famOff = !!q('#s-family .rank-off'), staffOff = !!q('#s-staff .rank-off');
    /* 467: STAFF AND ADMIN WITH NO PARENT'S DETAILS see Parent settings locked too. */
    if (famOff !== (rank === 'student')) bad.push(rank + ': Parent settings ' + (famOff ? 'says it is not for this account' : 'is drawn unlocked for a non-parent'));
    if (staffOff !== (rank === 'student' || rank === 'client')) bad.push(rank + ': Tutor settings ' + (staffOff ? 'says it is not for this account' : 'is drawn below Staff'));
    /* 467: A COLUMN FOR A ROLE YOU DO NOT HOLD IS THE PADLOCK LINE, THEN EVERY CARD OF IT LOCKED — each with its padlock, nothing pressable. */
    if (staffOff && !/are for tutors/.test(txt('#s-staff .rank-off'))) bad.push(rank + ': Tutor settings does not say plainly it is for tutors');
    for (const [col, off] of [['staff', staffOff], ['family', famOff]]) {
      if (!off) continue;
      const lock = q('#s-' + col + ' .rank-off');
      if (!lock.classList.contains('col-lock') || !lock.querySelector('.col-lock-i svg')) bad.push(rank + ': ' + col + ' is not a padlock');
      if (lock.querySelector('h3, input, select, textarea')) bad.push(rank + ': the ' + col + ' padlock line has a title or a box');
      const shut = [...a.d.querySelectorAll('#s-' + col + ' .is-locked')];
      if (col === 'staff' && shut.length < 2) bad.push(rank + ': ' + col + ' shows ' + shut.length + ' locked cards, wanted every card of the column');
      shut.forEach(c => { if (!c.querySelector(':scope > .card-lock svg')) bad.push(rank + ': a locked ' + col + ' card has no padlock'); });
      const live = [...a.d.querySelectorAll('#s-' + col + ' .is-locked :is(input, select, textarea, button)')].filter(x => !x.disabled && !x.closest('.wgt-admin'));
      if (live.length) bad.push(rank + ': ' + live.length + ' boxes or tiles on locked ' + col + ' cards can still be used');
      if (shut.some(c => !c.querySelector('.card-say'))) bad.push(rank + ': a locked ' + col + ' card does not say what it is for');
      if (col === 'staff' && !q('#s-staff .is-locked [data-do="hub-part"][disabled]')) bad.push(rank + ': the locked Tutor settings does not show the Staff hub');
      /* 468: YOUR CARD'S PLACE IS A LOCKED CARD PER SECTION, each with its own layout id — never one "Your card". */
      const ownLocks = [...a.d.querySelectorAll('#s-' + col + ' .own-lock.is-locked')].map(x => x.dataset.layCard);
      /* 469: EACH SECTION ON ONE COLUMN ONLY — Tutor settings holds a tutor's alone, Parent settings none of everybody's four. */
      const wantLocks = (col === 'staff' ? ['seat', 'cut', 'size', 'headline', 'photos', 'words', 'glance', 'quals', 'where', 'week'] : []).map(k => 'own:' + col + ':' + k);
      if (JSON.stringify(ownLocks) !== JSON.stringify(wantLocks)) bad.push(rank + ': the locked ' + col + ' shows your card as ' + JSON.stringify(ownLocks) + ', wanted a locked card per section');
    }
    if (rank === 'client' && !q('#s-staff .apply-card [data-do="apply-open"]')) bad.push('a client\'s Tutor settings offers no Apply to teach');
    if (rank === 'staff' && !q('#s-staff .staff-top .hub')) bad.push('a tutor\'s Tutor settings has no Staff hub');
    /* THE PEOPLE COLUMNS: your own card first where you belong, a person drawn in each category they hold. */
    const home = { student: 's-students', client: 's-parents', staff: 's-tutors', admin: 's-tutors' }[rank];
    const first = [...a.d.querySelectorAll('#' + home + ' > .page')].find(pg => !pg.querySelector('.add-card, .ps-card'));
    /* 464: YOUR OWN CARD FIRST, and no Edit on it in any profile column — its Edit is on your role's settings column. */
    if (!first || !first.querySelector('.me-card, .card')) bad.push(rank + ': the first card on ' + home.slice(2) + ' is not your own');
    if (q('#s-tutors [data-do="card-edit"][data-pid="' + pid + '"], #s-students [data-do="card-edit"][data-pid="' + pid + '"], #s-parents [data-do="card-edit"][data-pid="' + pid + '"]')) bad.push(rank + ': your own profile card offers Edit');
    const setCol = 'account';
    /* 468: YOUR OWN CARD IS ONLY ITS EDITING THERE, a card per section; no settings column draws it as others see it. */
    if (!q('#s-' + setCol + ' .card-ed[data-pid="' + pid + '"]')) bad.push(rank + ': ' + setCol + ' has no editing cards for your own card');
    if (q('#s-staff .own-set, #s-account .own-set, #s-family .own-set, #s-staff .me-card, #s-account .me-card, #s-family .me-card, [data-do="card-edit"]')) bad.push(rank + ': a settings column still shows your card as others see it, or an Edit tile');
    if (rank === 'client' && !q('#s-students .kid-manage')) bad.push('a client\'s Students has no Manage your child');
    if (!q('#s-students .ps-card')) bad.push(rank + ': Students has no Find someone by handle');
    const myShare = q('#s-tutors [data-do="tutor-share"][data-handle="' + (a.t.whoami().handle || '-') + '"]');
    if (!myShare !== (rank !== 'staff' && rank !== 'admin')) bad.push(rank + ': Share my profile ' + (rank === 'staff' ? 'is missing from Tutors' : 'is offered below Staff'));
    if ((rank === 'admin') !== !!(q('#s-tutors [data-do="person-add"]') && q('#s-students [data-do="person-add"]') && q('#s-parents [data-do="person-add"]'))) bad.push(rank + ': + Add a person is ' + (rank === 'admin' ? 'not on every people column' : 'offered'));
    if (rank === 'admin' && (q('#s-biz [data-do="person-add"]') || !q('#s-site .me-build'))) bad.push('Business still has + Add a person, or Site lost the build stamps');
    /* ONE PLACE EACH: the columns, your own card open for editing in each column it has an Edit, and the hub's Hours and Pricing. */
    const ed = editorsOf_(a.d, {});
    editorsOf_(a.d, ed);
    const hub = q('#s-staff .staff-top:not(.is-locked) .hub');
    if (hub) {
      for (const k of ['pricing']) { if (await a.part(k)) editorsOf_(a.d, ed); }
    }
    Object.keys(ed).filter(f => ed[f].size > 1)
      .forEach(f => bad.push(rank + ': "' + f + '" is edited in ' + ed[f].size + ' places (' + [...ed[f]].join('; ') + ')'));
  }
  return bad;
});

/* ---------- EVERYBODY SEES EVERY CARD, LOCKED WHERE IT IS NOT THEIRS, AND EACH SAYS WHAT IT IS FOR (467) ---------- */
check('467: signed out, Parent, Tutor and Student settings show every card locked — a padlock each, every box and tile disabled, no data — and every card on the right-hand columns says what it is for in one short line', async () => {
  const W = hubWorld_();
  const bad = [];
  const o = await cardOpen_(W, null);
  if (o.err) return [o.err];
  ['family', 'staff', 'account'].forEach(col => { try { o.t.go(col, false, true); o.w.paint(col); } catch (e) { bad.push('drawing ' + col + ' threw: ' + e.message); } });
  await wait(250);
  for (const col of ['family', 'staff', 'account']) {
    const shut = [...o.d.querySelectorAll('#s-' + col + ' .is-locked')];
    /* 469: NOTHING IS A PARENT'S ALONE YET, so Parent settings signed out is its padlock line with no cards under it. */
    if (shut.length < (col === 'family' ? 0 : 2)) bad.push('signed out, ' + col + ' shows ' + shut.length + ' locked cards');
    if (col === 'family' && !o.d.querySelector('#s-family .rank-off')) bad.push('signed out, Parent settings does not say to sign in');
    if (shut.some(c => !c.querySelector(':scope > .card-lock svg'))) bad.push('signed out, a locked ' + col + ' card has no padlock');
    const live = [...o.d.querySelectorAll('#s-' + col + ' .is-locked :is(input, select, textarea, button)')].filter(x => !x.disabled);
    if (live.length) bad.push('signed out, ' + live.length + ' boxes or tiles on ' + col + ' can be used');
    const filled = [...o.d.querySelectorAll('#s-' + col + ' .is-locked :is(input, textarea)')].filter(x => x.type !== 'checkbox' && x.type !== 'hidden' && String(x.value || '').trim());
    if (filled.length) bad.push('signed out, ' + col + ' shows values in its locked boxes: ' + filled.map(x => x.value).slice(0, 3).join(', '));
    if (shut.some(c => !c.querySelector('.card-say'))) bad.push('signed out, a locked ' + col + ' card does not say what it is for');
    if (o.d.querySelector('#s-' + col + ' .is-locked [id]')) bad.push('a locked ' + col + ' card keeps an id a real card could be found by');
  }
  if (!o.d.querySelector('#s-account .signin-card, #s-account [data-do^="signin"], #s-account .card:not(.is-locked)')) bad.push('signed out, Student settings lost its sign-in card');
  if (!o.d.querySelector('#s-account .is-locked [data-me="email"][disabled]')) bad.push('signed out, Student settings does not show the email box, locked');
  if (o.d.querySelector('#s-family [data-me="email"], #s-staff [data-me="email"]')) bad.push('signed out, the email box is on a column above Student settings (469)');
  /* EVERY CARD SAYS WHAT IT IS FOR: the admin, every right-hand column. */
  const a = await hubBoot_(W, 'admin@example.org');
  if (a.err) return bad.concat([a.err]);
  for (const col of ['family', 'staff', 'account', 'tutors', 'students', 'parents', 'biz']) {
    try { a.t.go(col, false, true); a.w.paint(col); } catch (e) { bad.push('drawing ' + col + ' threw: ' + e.message); }
    await wait(150);
    const rows = [...a.d.querySelectorAll('#s-' + col + ' .card-admin[data-lay-for]')];
    if (!rows.length && col !== 'family') bad.push('the admin sees no card rows on ' + col + ', so its lines were NOT checked');
    const seen = new Set();
    rows.forEach(r => {
      const id = r.dataset.layFor;
      if (seen.has(id)) return; seen.add(id);
      const say = a.w.eval('cardSayOf_(' + JSON.stringify(id) + ')');
      if (!say) bad.push(col + ': card ' + id + ' has no line saying what it is for');
      else if (say.length > 90) bad.push(col + ': ' + id + '\'s line is ' + say.length + ' characters');
    });
    const says = a.d.querySelectorAll('#s-' + col + ' .card-say').length;
    /* A SEARCH CARD'S PLACEHOLDER IS ITS LINE (469, 770), so it owes none. */
    const empty = a.d.querySelectorAll('#s-' + col + ' .card.is-empty, #s-' + col + ' .card.ps-card').length;
    /* AN EMPTY WIDGET STAYS ITS TITLE ALONE (414), so it owes no line. */
    if (says < seen.size - empty) bad.push(col + ': ' + says + ' lines drawn for ' + (seen.size - empty) + ' cards with something in them');
  }
  return bad;
});

check('Availability on Tutor settings (487): the week a tutor teaches is the Available card there, saved through updateProfile to the row; the hub has no Hours, Tools no `avail` tool, Student settings no week', async () => {
  const W = hubWorld_();
  const a = await hubBoot_(W, 'tutor@example.org');
  if (a.err) return [a.err];
  const bad = [];
  const parts = [...a.sheet().querySelectorAll('[data-do="hub-part"]')].map(x => x.dataset.part).join(',');
  if (parts !== 'terms,pricing,statement') bad.push('the hub\'s parts are "' + parts + '", wanted terms,pricing,statement');
  try { a.t.go('staff', false, true); a.w.paint('staff'); } catch (e) { return bad.concat(['drawing Tutor settings threw: ' + e.message]); }
  await wait(250);
  const sec = a.d.querySelector('#s-staff .ce-sec[data-sec="week"]');
  if (!sec) return bad.concat(['Tutor settings has no Available card']);
  const hrs = [...sec.querySelectorAll('input[data-me]')];
  if (hrs.length < 70) return bad.concat(['the Available card draws ' + hrs.length + ' hours, wanted the week of seventy']);
  const box = hrs.find(x => !x.checked && !x.disabled);
  if (!box) return bad.concat(['every hour is already ticked or locked — nothing to tick']);
  const code = box.dataset.me;
  const cell = () => W.sheet("String(read(TAB.people).rows.find(r => r.person_id === 'P-T1').availability ?? '')");
  const before = cell();
  box.checked = true; box.dispatchEvent(new a.w.Event('change', { bubbles: true }));
  box.dispatchEvent(new a.w.Event('input', { bubbles: true }));
  /* SAVED AS TYPED (owner, 8 Nov): the tick alone sends it, ~800ms later. */
  for (let k = 0; k < 30 && !a.sent.some(x => x.action === 'updateProfile' && x.fields && x.fields[code] === 'TRUE'); k++) await wait(100);
  const post = a.sent.filter(x => x.action === 'updateProfile').pop();
  if (!post || !post.fields || post.fields[code] !== 'TRUE') bad.push('Save posted ' + JSON.stringify(post && post.fields && post.fields[code]) + ' for ' + code + ', wanted TRUE');
  await wait(300);
  if (cell() === before) bad.push('the server row\'s availability was not written for ' + code + ': ' + JSON.stringify(before));
  if (a.t.widgetsOf('tool').some(x => String(x.id) === 'avail')) bad.push('Tools still carries the `avail` hours tool');
  try { a.t.go('account', false, true); a.w.paint('account'); } catch (e) { return bad.concat(['drawing settings threw: ' + e.message]); }
  await wait(200);
  if (a.d.querySelector('#s-account .me-week')) bad.push('Student settings still draws the week for a tutor — it is Tutor settings\' Available');
  return bad;
});

check('Staff hub pricing (405): an hour for 1, 2 and 3 students split into tutor, room, card fees and @family. by `priceFrom` itself; the bars slide under a held slider; a rate past £200 is refused; nothing is saved here — its tile opens the Rate and class size card (620)', async () => {
  const W = hubWorld_();
  const a = await hubBoot_(W, 'tutor@example.org');
  if (a.err) return [a.err];
  const bad = [];
  if (!(await a.part('pricing'))) return ['the hub has no Pricing tile'];
  const S = a.sheet();
  const row = n => S.querySelector('.pb-row[data-n="' + n + '"]');
  if (![1, 2, 3].every(row)) return ['the pricing part does not draw a bar for 1, 2 and 3 students'];
  const say = n => String(row(n).textContent).replace(/\s+/g, ' ');
  /* RATE 20, SEAT 0.5 OF IT, B 0.25, ROOM 15, FEES 2% + 20p: two students pay 50; Ada 30, room 15, fees 1.20, @family. 3.80. */
  ['family pays £50.00', 'You £30.00', 'Room £15.00', 'Card fees £1.20', '@family. £3.80'].forEach(x => { if (say(2).indexOf(x) === -1) bad.push('two students do not show ' + x + ': ' + say(2)); });
  if (say(1).indexOf('@family. −£0.90') === -1 || !S.querySelector('.pb-note')) bad.push('one student does not show the business paying the card fee: ' + say(1));
  const ada = a.t.DATA().tutors.find(t => t.personId === 'P-T1');
  const p = a.w.priceFrom({ tutorRow: Object.assign({}, ada, { rate: 20, extraSeat: 0.5 }), n: 3, slots: 1, hoursPerWeek: 1, loc: 'Merton Hall' }).earn;
  if (say(3).indexOf('family pays ' + '£' + p.charged.toFixed(2)) === -1 || say(3).indexOf('@family. £' + p.net.toFixed(2)) === -1) bad.push('three students are not what priceFrom says (' + p.charged + ', ' + p.net + '): ' + say(3));
  const slider = S.querySelector('input[type="range"][data-pv="rate"]');
  const seg = () => row(3).querySelector('.pb-seg.is-tutor').style.getPropertyValue('--x');
  const was = seg();
  a.type(slider, '30'); await wait(100);
  if (S.querySelector('input[type="range"][data-pv="rate"]') !== slider) bad.push('moving the rate redrew the slider out from under the thumb');
  if (seg() === was) bad.push('the tutor\'s part of the bar did not move with the rate');
  if (say(1).indexOf('family pays £45.00') === -1) bad.push('the rate at £30 does not make one student £45.00: ' + say(1));
  if (S.querySelector('input.pf-num[data-pv="rate"]').value !== '30') bad.push('the number box did not follow the slider');
  a.type(S.querySelector('input.pf-num[data-pv="rate"]'), '500'); await wait(50);
  if (!/at most £200/.test(S.querySelector('.hub-said').textContent)) bad.push('a rate of £500 is not refused in words: ' + S.querySelector('.hub-said').textContent);
  /* ONE HOME (620): Pricing saves nothing and points to the Rate and class size card. */
  if (S.querySelector('[data-do="price-save"]')) bad.push('Pricing still has its own Save — the rate card is the one home');
  const n0 = a.sent.filter(x => x.action === 'updateProfile').length;
  const to = S.querySelector('[data-do="price-card"]');
  if (!to) return bad.concat(['Pricing has no tile to the Rate and class size card']);
  a.A('price-card', to); await wait(500);
  if (a.sent.filter(x => x.action === 'updateProfile').length !== n0) bad.push('opening the card from Pricing posted a change');
  if (a.d.querySelector('#s-staff .hub[data-hub="pricing"]') && false) bad.push('the tile left Pricing open over the card');
  if (!a.d.querySelector('#s-tutors .card-ed[data-sec="seat"] [data-me="rate_per_hour"], #s-staff [data-me="rate_per_hour"]')) bad.push('no rate box waits where the tile goes');
  return bad;
});

check('Staff hub statement (405): Ada\'s month, session by session with totals, from the real doPost; another month asks again; Download PDF prints a paper copy; the admin opens any tutor\'s from Business, where the Staff card glows for terms not agreed', async () => {
  const W = hubWorld_();
  const a = await hubBoot_(W, 'tutor@example.org');
  if (a.err) return [a.err];
  const bad = [];
  if (!(await a.part('statement'))) return ['the hub has no Statement tile'];
  await wait(300);
  const S = a.sheet();
  const now = new Date(), ym = d => d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
  const ask = a.sent.filter(x => x.action === 'payStatement').pop();
  if (!ask || ask.month !== ym(now) || ask.tutorId) bad.push('the statement asked ' + JSON.stringify(ask) + ', wanted this month and no tutorId');
  const rows = () => S.querySelectorAll('.stmt .stmt-t tbody tr').length;
  if (rows() !== 2) bad.push('this month\'s statement has ' + rows() + ' rows, wanted the two paid sessions');
  const foot = String((S.querySelector('.stmt tfoot') || {}).textContent || '').replace(/\s+/g, ' ');
  if (!/2 sessions/.test(foot) || foot.indexOf('£60.00') === -1 || foot.indexOf('£40.00') === -1 || foot.indexOf('£10.00') === -1) bad.push('the totals are not 2 sessions, £60 paid, £10 business, £40 tutor: ' + foot);
  if (!/not a payslip/.test(S.textContent)) bad.push('the statement does not say it is not a payslip');
  const sel = S.querySelector('select[data-stmt="month"]');
  const next = ym(new Date(now.getFullYear(), now.getMonth() + 1, 1));
  if (sel.querySelector('option[value="' + next + '"]')) bad.push('next month is offered');
  sel.value = ym(new Date(now.getFullYear(), now.getMonth() - 1, 1)); sel.dispatchEvent(new a.w.Event('change', { bubbles: true })); await wait(300);
  if ((a.sent.filter(x => x.action === 'payStatement').pop() || {}).month !== sel.value) bad.push('choosing last month did not ask for it');
  if (rows() || !/No paid sessions/.test(S.textContent)) bad.push('last month (no sessions) does not say so');
  sel.value = ym(now); sel.dispatchEvent(new a.w.Event('change', { bubbles: true })); await wait(300);
  let printed = null;
  a.w.print = () => { printed = a.d.body.classList.contains('printing-stmt') && !!a.d.querySelector('body > .stmt-paper .stmt-t'); };
  a.A('stmt-print', S.querySelector('[data-do="stmt-print"]'));
  if (printed !== true) bad.push('Download PDF did not print a paper copy of the statement (printing-stmt and .stmt-paper)');
  a.w.dispatchEvent(new a.w.Event('afterprint'));
  if (a.d.querySelector('.stmt-paper') || a.d.body.classList.contains('printing-stmt')) bad.push('the paper copy was left behind after printing');
  /* THE ADMIN: the Staff card glows for Ada and Ben not agreed, and opens Ada's statement by her id. */
  const ad = await hubBoot_(W, 'admin@example.org');
  if (ad.err) return bad.concat([ad.err]);
  try { ad.t.go('biz', false, true); ad.w.paint('biz'); } catch (e) { return bad.concat(['drawing Business threw: ' + e.message]); }
  await wait(600);
  const card = ad.d.querySelector('#s-biz [data-staff]');
  if (!card) return bad.concat(['Business has no Staff card']);
  if (!card.classList.contains('needs-you') || !/2 not agreed/.test(card.textContent)) bad.push('the Staff card does not glow "2 not agreed": ' + card.textContent.replace(/\s+/g, ' ').slice(0, 160));
  const st = card.querySelector('[data-do="stmt-for"][data-id="P-T1"]');
  if (!st) return bad.concat(['the Staff card has no Statement tile for Ada']);
  ad.A('stmt-for', st); await wait(400);
  const aAsk = ad.sent.filter(x => x.action === 'payStatement').pop();
  if (!aAsk || aAsk.tutorId !== 'P-T1') bad.push('the admin\'s statement did not name Ada: ' + JSON.stringify(aAsk));
  if (card.querySelector('.hub-for').querySelectorAll('.stmt-t tbody tr').length !== 2) bad.push('the admin was not shown Ada\'s two sessions');
  return bad;
});

check('Message a tutor (405): a signed-in client has a Message tile on a tutor\'s card that opens the conversation with them; a child has none for a tutor (the server refuses it), only for the admin', async () => {
  const W = hubWorld_();
  const bad = [];
  const c = await hubBoot_(W, 'parent@example.org');
  if (c.err) return [c.err];
  const msg = (x, id) => x.d.querySelector('#s-tutors [data-do="msg-open"][data-id="' + id + '"]');
  const m = msg(c, 'P-T1');
  if (!m) return ['a client has no Message tile on Ada\'s card'];
  c.A('msg-open', m); await wait(150);
  if (!/Message Ada Tutor/.test(String((c.d.getElementById('sheet-title') || {}).textContent)) || !c.sheet().querySelector('textarea, [contenteditable], input')) bad.push('Message did not open the conversation with Ada');
  const s = await hubBoot_(W, 'student@example.org');
  if (s.err) return bad.concat([s.err]);
  if (msg(s, 'P-T1') || msg(s, 'P-T2')) bad.push('a child has a Message tile on a tutor\'s card, which the server refuses');
  if (!msg(s, 'P-A1')) bad.push('a child has lost the Message tile on the admin\'s card, which the server allows');
  return bad;
});

check('Student settings (453) hold only what is not on your card — a tutor\'s and an admin\'s lose the card\'s pages, a parent\'s details are on Parent settings, a student\'s keeps their dates — and nobody\'s draws the library cards, the handle or the figure', async () => {
  const W = cardWorld_();
  const bad = [];
  /* THE SETTINGS PAGES OF YOU (444): from the first that says where things went, to Notifications. */
  const setPages = d => { const all = [...d.querySelectorAll('#s-account > .page')];
    /* 469: NO "WHERE THINGS WENT" LINE ANY MORE, so the settings start at the first form of their own or the PIN. */
    const a = all.findIndex(p => p.querySelector('[data-do="pin-save"]') || [...p.querySelectorAll('.me-form')].some(f => !f.closest('.card-ed'))), b = all.findIndex(p => p.querySelector('.notify-card'));
    return a < 0 || b < a ? [] : all.slice(a, b + 1); };
  const inSet = (d, q) => setPages(d).map(p => p.querySelector(q)).find(Boolean) || null;
  const titles = d => [].concat(...setPages(d).map(p => [...p.querySelectorAll('.card > h3, .me-form > h3')])).map(h => h.textContent.trim());
  const settingsOf = async who => {
    const c = await cardOpen_(W, who);
    if (c.err) return c;
    try { c.t.go('account', false, true); c.w.paint('account'); } catch (e) { return { err: 'drawing settings threw: ' + e.message }; }
    await wait(300);
    return c;
  };
  /* WHAT NO ROLE'S SETTINGS DRAWS NOW, AND WHAT EVERY ROLE'S STILL DOES. */
  const common = (who, d) => {
    const on = ['first_name', 'last_name', 'photo', 'lib1_name', 'lib1_no', 'lib1_pin'].filter(f => [...d.querySelectorAll('#s-account [data-me="' + f + '"]')].some(x => !x.closest('.card-ed')));
    if (on.length) bad.push(who + '\'s Settings still has boxes their card or Tools now holds: ' + on.join(', '));
    const moved = ['.pfp', '.handle-shown', '.av-card', '[data-do="av-pick"]', '.lib-face', '[data-do="shelf-more"]']
      .filter(q => inSet(d, q));
    if (moved.length) bad.push(who + '\'s Settings still draws ' + moved.join(', ') + ' — the picture, the handle, the figure or a library card');
    if (!d.querySelector('#s-account #pin-now') || !d.querySelector('#s-account [data-do="pin-save"]')) bad.push(who + '\'s Settings lost the PIN form');
    if (!d.querySelector('#s-account .roles-card') || !d.querySelector('#s-account .notify-card')) bad.push(who + '\'s Settings lost Your roles or Notifications');
    /* 469, the owner: "so much filler space" — no sentence saying where things went. */
    if (d.querySelector('#s-account .ce-moved')) bad.push(who + '\'s Settings still draws the line saying where things went');
    if (!setPages(d).length) bad.push(who + '\'s settings on Student settings were not found');
  };
  for (const who of ['tutor@example.org', 'admin@example.org']) {
    const c = await settingsOf(who);
    if (c.err) { bad.push(who + ': ' + c.err); continue; }
    const t = titles(c.d);
    const gone = ['About you', 'Photos', 'Your rate and group size', 'Qualifications', 'Availability', 'Library cards'].filter(x => t.indexOf(x) !== -1);
    if (gone.length) bad.push(who + '\'s Settings still draws ' + gone.join(', '));
    if (t.indexOf('Contact & address') === -1) bad.push(who + '\'s Settings lost Contact & address (pages: ' + JSON.stringify(t) + ')');
    const on = ['headline', 'rate_per_hour', 'photos_1', 'qual_1', 'm09', 'venues_ok', 'travel_km', 'adjective_1'].filter(f => c.d.querySelector('#s-account [data-me="' + f + '"]'));
    if (on.length) bad.push(who + '\'s Settings still has boxes the card edits: ' + on.join(', '));
    if (!c.d.querySelector('#s-account [data-me="email"]')) bad.push(who + '\'s Settings lost the email box');
    common(who, c.d);
  }
  /* A PARENT AND A STUDENT: their own groups less the card's two and the library cards — every other box. */
  /* A PARENT'S OWN DETAILS ARE ON PARENT SETTINGS (453), a student's on Student settings. */
  /* 469: A PARENT'S CONTACT IS EVERYBODY'S, so on Student settings too — nothing of theirs is on Parent settings. */
  for (const [who, key, want, col] of [['parent@example.org', 'clientFields', ['Contact & address', 'Signing in', 'Your roles'], 'account'],
                                  ['student@example.org', 'studentFields', ['About you', 'Contact & address', 'Signing in', 'Your roles'], 'account']]) {
    const c = await settingsOf(who);
    if (c.err) { bad.push(who + ': ' + c.err); continue; }
    const groups = c.t.DATA()[key] || {};
    const t = titles(c.d);
    if (!Object.keys(groups).length) { bad.push(who + ': the payload sent no ' + key + ', so their Settings was NOT checked'); continue; }
    if (JSON.stringify(t.slice(0, want.length)) !== JSON.stringify(want)) bad.push(who + '\'s Settings pages are ' + JSON.stringify(t) + ', wanted ' + JSON.stringify(want) + ' first');
    const lost = [].concat(...Object.keys(groups).map(g => groups[g]))
      .filter(f => !/^(phone|date_of_birth|photo|first_name|last_name)$/.test(f) && !/^lib\d+_/.test(f))
      .filter(f => !c.d.querySelector('#s-' + col + ' [data-me="' + f + '"]'));
    if (lost.length) bad.push(who + '\'s Settings lost ' + lost.join(', '));
    if (c.d.querySelector('#s-family [data-me="email"]')) bad.push(who + '\'s details are on Parent settings as well as Student settings');
    if (/student/.test(who) && !c.d.querySelector('#s-account [data-me="dob_d"]')) bad.push('the student\'s Settings lost the date of birth');
    common(who, c.d);
  }
  return bad;
});

/* ---------- NOBODY EDITS A PROFILE CARD, THE ADMIN INCLUDED (467) — the owner: "Profile cards are uneditable by anyone, including admin." ---------- */
check('no profile card offers Edit to anybody, an admin included (467): your own card is edited on your settings column alone, and an admin keeps Delete and Show PIN under somebody else', async () => {
  const W = cardWorld_();
  const bad = [];
  for (const who of ['admin@example.org', 'tutor@example.org', 'parent@example.org', 'student@example.org']) {
    const c = await cardOpen_(W, who);
    if (c.err) { bad.push(who + ': ' + c.err); continue; }
    const pid = String(c.t.whoami().personId || '');
    const onProfiles = [...c.d.querySelectorAll('#s-tutors [data-do="card-edit"], #s-students [data-do="card-edit"], #s-parents [data-do="card-edit"], [data-do="person-edit"]')];
    if (onProfiles.length) bad.push(who + ' is offered Edit on a profile card: ' + onProfiles.map(x => x.dataset.pid || x.dataset.id).join(', '));
    const elsewhere = [...c.d.querySelectorAll('[data-do="card-edit"]')].filter(x => x.dataset.pid !== pid);
    if (elsewhere.length) bad.push(who + ' is offered Edit on somebody else\'s card: ' + elsewhere.map(x => x.dataset.pid).join(', '));
    if (typeof c.w.cardMayEdit_ === 'function' && c.w.cardMayEdit_({ personId: 'P-T2' }) && pid !== 'P-T2') bad.push(who + ' may still open somebody else\'s card');
    if (who === 'admin@example.org' && !c.d.querySelector('#s-tutors [data-do="person-del"], #s-students [data-do="person-del"], #s-parents [data-do="person-del"]')) bad.push('the admin lost Delete under somebody else\'s card');
    if (who === 'admin@example.org' && !c.d.querySelector('#s-tutors [data-do="pin-show"], #s-students [data-do="pin-show"], #s-parents [data-do="pin-show"]')) bad.push('the admin lost Show PIN under somebody else\'s card');
  }
  return bad;
});


/* ---------- THE BUSINESS'S CUT OF AN EXTRA SEAT, ON THE TUTOR'S CARD, IN POUNDS (docs/history/345) § */
const CUT_VARS_ = { c: 0.3, B: 0.1 };
/* ---------- THREE CARDS, EACH ONE HOME (620): rate and seat k, @family.'s share g (words to a tutor), class size; a forced cut is still refused § */
check('rate card (620): a tutor\'s three cards — rate and extra seat, @family.\'s share as words, class size — each say their effect in pounds by x + k·x·(n−1) + g·x·(n−1); Save writes the class size; a forced cut is refused alone and left out beside another field', async () => {
  const W = cardWorld_({ vars: CUT_VARS_ });
  const h = W.real.tabs.people[0], ri = W.real.tabs.people.findIndex((x, i) => i > 0 && x[h.indexOf('person_id')] === 'P-T1');
  if (h.indexOf('extra_seat_cut') < 0 || ri < 0) return ['the people tab has no extra_seat_cut column or no Ada, so the tutor\'s view was NOT checked'];
  W.real.tabs.people[ri][h.indexOf('extra_seat_cut')] = 0.15;
  const c = await cardOpen_(W, 'tutor@example.org', { col: 'tutors' });
  if (c.err) return [c.err];
  const bad = [];
  for (let k = 0; k < 20 && !c.form(); k++) await wait(100);
  if (!c.form()) return ['Tutor settings draws no editing cards for Ada'];
  const seat = c.sec('seat'), cut = c.sec('cut'), size = c.sec('size');
  if (!seat || !cut || !size) return ['Ada\'s settings do not draw the three cards: ' + c.secs().join(', ')];
  const txt = el => String(el.textContent).replace(/\s+/g, ' ');
  ['[data-me="rate_per_hour"]', '[data-pound="extra_seat_rate"]'].forEach(q => { if (!seat.querySelector(q)) bad.push('the Rate and extra seat card has no ' + q); });
  if (!size.querySelector('[data-me="max_students"]') || !size.querySelector('[data-me="min_students"]')) bad.push('the Class size card has no min and max boxes');
  const cutBox = cut.querySelector('input:not([type="hidden"]), input[type="hidden"][data-me="extra_seat_cut"]');
  if (cutBox) bad.push('a tutor is offered @family.\'s cut as a box: ' + cutBox.outerHTML.slice(0, 120));
  if (!/£3\.00\/h of each extra student is @family\.'s — only @family\. sets that/.test(txt(cut))) bad.push('the cut is not said in pounds as words a tutor cannot change: ' + txt(cut).slice(0, 200));
  if (!/\+£10\.00\/h a seat/.test(txt(seat))) bad.push('the seat card does not say the tutor\'s £10.00 of a £20 rate: ' + txt(seat).slice(0, 200));
  /* 20 + 0.5·20·3 + 0.15·20·3 = 59 for four. */
  if (!/4: £59\.00/.test(txt(size))) bad.push('the class size card does not say four students pay £59.00/h: ' + txt(size).slice(0, 200));
  c.type(size.querySelector('[data-me="max_students"]'), '3'); await wait(50);
  if (!/3: £46\.00/.test(txt(size))) bad.push('typing 3 did not redraw the class total to £46.00/h: ' + txt(size).slice(0, 200));
  c.A('card-save', c.tileOn('size', 'card-save')); await wait(600);
  const post = c.posts().pop();
  if (!post || 'extra_seat_cut' in post.fields) bad.push('Save posted ' + JSON.stringify(post && post.fields) + ' — wanted the class size and no cut');
  if (Number(W.real.row('P-T1').max_students) !== 3) bad.push('the class size did not reach the sheet: ' + W.real.row('P-T1').max_students);
  const u = W.real.post({ action: 'verifyLogin', email: 'tutor@example.org', pin: '0000' });
  const r = W.real.post({ action: 'updateProfile', token: u.token, name: u.name, personId: 'P-T1', target: 'Ada Tutor', targetId: 'P-T1', fields: { extra_seat_cut: '0' } });
  if (r.success || !/Only @family/.test(r.error || '')) bad.push('the server took a tutor\'s forced cut, or did not say why: ' + JSON.stringify(r));
  const r2 = W.real.post({ action: 'updateProfile', token: u.token, name: u.name, personId: 'P-T1', target: 'Ada Tutor', targetId: 'P-T1', fields: { extra_seat_cut: '0', headline: 'Partly saved' } });
  if (!r2.success || !/Not saved: Only @family/.test(r2.said || '') || W.real.row('P-T1').headline !== 'Partly saved') bad.push('a forced cut beside a headline did not save the headline and name the cut: ' + JSON.stringify(r2));
  if (Number(W.real.row('P-T1').extra_seat_cut) !== 0.15) bad.push('a tutor\'s forced cut reached the sheet: ' + W.real.row('P-T1').extra_seat_cut);
  /* AND THE ADMIN'S OWN CARD, WHERE THE CUT IS A BOX (rankAtLeast_ on both sides). */
  const a = await cardOpen_(cardWorld_({ vars: CUT_VARS_ }), 'admin@example.org', { col: 'tutors' });
  if (a.err) return bad.concat([a.err]);
  for (let k = 0; k < 20 && !a.sec('cut'); k++) await wait(100);
  if (!a.sec('cut') || !a.sec('cut').querySelector('[data-pound="extra_seat_cut"]')) bad.push('the admin\'s own @family.\'s share card offers no box for the cut: ' + a.secs().join(', '));
  return bad;
});

check('the read-only cut a tutor cannot change says who sets it (345)', async () => {
  const W = cardWorld_({ vars: CUT_VARS_ });
  const c = await cardOpen_(W, 'tutor@example.org');
  if (c.err) return [c.err];
  const bad = [];
  if (typeof c.w.fieldHtml === 'function') {
    const ro = c.d.createElement('div'); ro.innerHTML = c.w.fieldHtml('extra_seat_cut', '0.2', { readonly: true });
    const box = ro.querySelector('[data-me="extra_seat_cut"]');
    if (!box || !box.disabled || !/set by @family\./.test(ro.textContent)) bad.push('the read-only cut does not say who sets it, or can be typed into: "' + ro.textContent.replace(/\s+/g, ' ').trim() + '"');
  } else bad.push('fieldHtml is not reachable, so the read-only cut was NOT checked');
  return bad;
});

/* ---------- EVERYBODY EDITS THEIR OWN CARD (docs/history/339) § */
check('every role\'s own card is edited, a card per section, with picture, figure, name and handle on its role\'s settings column (453, 464, 468); a tutor\'s and a listed admin\'s, on Tutors, the rest as well, less what the hub edits; a parent, a student and an admin with no public card their picture, figure, name and handle', async () => {
  const W = cardWorld_();
  const bad = [];
  const bare = ['picture', 'figure', 'name', 'handle'];
  /* ONE FORM ON TUTORS FOR A TUTOR AND A LISTED ADMIN (453): the four, then the rest less what the hub edits; an admin with no hub keeps the week. */
  for (const [who, pid, order] of [['tutor@example.org', 'P-T1', bare.concat(CARD_STAFF_)], ['admin@example.org', 'P-A1', bare.concat(CARD_STAFF_)],
                                   ['parent@example.org', 'P-C1', bare], ['student@example.org', 'P-S1', bare]]) {
    const c = await cardOpen_(W, who);
    if (c.err) { bad.push(who + ': ' + c.err); continue; }
    for (let k = 0; k < 30 && !c.form(); k++) await wait(100);
    if (!c.form()) { bad.push(who + '\'s settings column draws no editing cards'); continue; }
    /* 468: A CARD PER SECTION, already open, each saving as typed (owner, 8 Nov) — no Save tile. */
    const secs = [...c.form().querySelectorAll('.ce-sec')].map(x => x.dataset.sec);
    if (JSON.stringify(secs) !== JSON.stringify(order) || JSON.stringify(c.secs()) !== JSON.stringify(order)) bad.push(who + '\'s own cards are ' + JSON.stringify(c.secs()) + ' holding ' + JSON.stringify(secs) + ', wanted ' + JSON.stringify(order));
    if (c.cards().some(k => k.querySelector('[data-do="card-save"]'))) bad.push(who + ': a section card still has a Save tile — it saves as typed');
    const fig = c.form().querySelector('.ce-sec[data-sec="figure"]');
    if (!fig || fig.querySelectorAll('.av-card .av-figure').length !== 1 || !fig.querySelector('[data-do="av-colour"]') || !fig.querySelector('[data-do="av-pick"]'))
      bad.push(who + '\'s figure section is not the wardrobe — one figure, the colours and the slots');
    const h = c.form().querySelector('.ce-sec[data-sec="handle"]');
    if (!h || (h.querySelector('.handle-shown') || {}).textContent !== c.t.whoami().handle
        || h.querySelector('[data-do="handle-shuffle"], input, .btn'))
      bad.push(who + '\'s handle section is not their handle shown with nothing to press or type (364: no Randomise)');
    if (h && !/first and last letter of your first name and the year you joined/.test(h.textContent)) bad.push(who + '\'s handle section does not say how the handle is made, so nobody can work theirs out');
    /* A CHILD CHOOSES FROM THE GRID AND IS OFFERED NO FILE (413); everybody else has Choose photo as well. */
    const kidPfp = /^student@/.test(who);
    if (!c.form().querySelector('.ce-sec[data-sec="picture"] .pfp [data-do="pfp-choose"]')) bad.push(who + ' is not offered the picture grid on their own card');
    if (!kidPfp && !c.form().querySelector('.ce-sec[data-sec="picture"] .pfp [data-do="pfp-pick"]')) bad.push(who + ' is not offered Choose photo on their own card');
    if (kidPfp && c.form().querySelector('.ce-sec[data-sec="picture"] .pfp [data-do="pfp-pick"], .ce-sec[data-sec="picture"] .pfp-in')) bad.push(who + ', a child, is offered a photo upload on their own card');
    if (!c.box('first_name') || !c.box('last_name')) bad.push(who + ' cannot change their name on their own card');
    if (order === bare && c.form().querySelector('.card-ed [data-me="date_of_birth"], .card-ed [data-me="dob_d"], .card-ed [data-me="email"], .card-ed [data-me^="lib"]')) bad.push(who + '\'s card offers a box their card does not print');
    if (who === 'parent@example.org') {
      c.type(c.box('first_name'), 'Patricia');
      c.sent.length = 0;
      c.A('card-save', c.tileOn('name', 'card-save'));
      await wait(500);
      const p = c.posts();
      if (p.length !== 1 || JSON.stringify(Object.keys(p[0].fields || {})) !== '["first_name"]' || p[0].targetId !== 'P-C1')
        bad.push('Pat\'s Save posted ' + JSON.stringify(p.map(x => [x.targetId, Object.keys(x.fields || {})])) + ', wanted one updateProfile of her first name to her own row');
      if (String(W.real.row('P-C1').first_name) !== 'Patricia') bad.push('Pat\'s row says ' + JSON.stringify(W.real.row('P-C1').first_name) + ' after her card\'s Save');
      const pg = c.pageOf('P-C1');
      if (!pg || !/Patricia Parent/.test(pg.textContent)) bad.push('Pat\'s own card does not say Patricia Parent after her Save');
    }
  }
  /* THE LAB'S ADMIN: no row in `DATA.tutors`, so the card is a face and a name, and every other field of theirs
     is on Settings where it was — the headline here, and the video without a picture box beside it. */
  const { w } = boot({ payload: Object.assign(payload(), { profileFields: {
    'About you': ['first_name', 'last_name', 'headline'], 'Photos': ['photo', 'video'], 'Library cards': LIB_FIELDS_ } }) });
  await wait(300);
  const t = w.__t, d = w.document;
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk', handle: 'testadmin',
           profile: { first_name: 'Test', last_name: 'Admin', headline: 'Runs the place', phone_cc: '+44' } });
  try { t.go('tutors', false, true); w.paint('tutors'); w.paint('account'); w.paint('staff'); } catch (e) { return bad.concat(['drawing the lab admin\'s Tutors column threw: ' + e.message]); }
  await wait(200);
  /* 464, 468: YOUR OWN CARD IS EDITED ON TUTOR SETTINGS, always open there, never on Tutors. */
  if (d.querySelector('#s-tutors [data-do="card-edit"], #s-tutors .card-ed')) bad.push('an admin\'s own profile card on Tutors offers Edit');
  const ls = [...d.querySelectorAll('#s-account .card-ed .ce-sec')].map(x => x.dataset.sec);
  if (JSON.stringify(ls) !== JSON.stringify(bare)) bad.push('an admin with no public card is offered ' + JSON.stringify(ls) + ', wanted ' + JSON.stringify(bare));
  try { w.paint('account'); w.paint('staff'); } catch (e) {}
  /* THE SETTINGS CARDS ON STUDENT AND TUTOR SETTINGS (453), never the card being edited. */
  const notCard = q => [...d.querySelectorAll('#s-account ' + q + ', #s-staff ' + q)].filter(x => !x.closest('.card-ed, .is-prof, .own-set'));
  if (!notCard('[data-me="headline"]').length || !notCard('[data-me="video"]').length) bad.push('the lab admin\'s headline or video left Settings with nowhere to go');
  if (notCard('[data-me="first_name"]').length || notCard('.pfp').length) bad.push('the lab admin\'s Settings still draws the name or the picture their card edits');
  return bad;
});


/* ---------- YOUR FIGURE, DRESSED ON YOUR OWN CARD, IS THE FIGURE YOUR PICTURE DRAWS § */

/* ---------- THE REVIEW OF docs/history/339: WHAT ONE FORM FOR THE HANDLE, THE FIGURE AND THE BOXES COST § */




/* CANCEL WHILE A PICK IS OUT. § */


/* SAVE WITH NOTHING TYPED, AFTER A SECTION SAVED ITSELF. "Nothing had changed" after a pick or a picture
   read as if the press had been thrown away — and for a parent three of her four sections are those. */
check('review 339: Save with nothing typed after a pick or a picture says what was saved, not "Nothing had changed"', async () => {
  const W = cardWorld_();
  const reply = b => (['saveAvatar', 'savePhoto'].indexOf(b.action) !== -1 ? W.real.post(b) : W.reply(b));
  const c = await cardOpen_(W, 'parent@example.org', { reply });
  if (c.err) return [c.err];
  const bad = [];
  const open = async () => { for (let k = 0; k < 30 && !c.form(); k++) await wait(100); return !!c.form(); };
  const save = async () => { c.A('card-save', c.tileOn('name', 'card-save')); await wait(400); return c.toast(); };
  if (!(await open())) return ['Pat\'s card did not open — NOT checked'];
  const sw = c.form().querySelector('.ce-sec[data-sec="figure"] [data-do="av-colour"][data-field="shirt"][data-value="5"]');
  const fox = c.form().querySelector('.pfp [data-do="pfp-choose"][data-pic="fox"]');
  if (!sw || !fox) return bad.concat(['no shirt 5 or no fox on Pat\'s form — NOT checked']);
  c.A('av-colour', sw);
  c.A('pfp-choose', fox);
  for (let k = 0; k < 30 && String(W.real.row('P-C1').photo) !== 'pfp:fox'; k++) await wait(100);
  await wait(300);
  let said = await save();
  if (!/picture and figure were saved/.test(said)) bad.push('Save after a pick and a picture said ' + JSON.stringify(said));
  if (!(await open())) return bad.concat(['Pat\'s card did not open a third time — NOT checked']);
  said = await save();
  if (!/Nothing had changed/.test(said)) bad.push('Save with nothing done at all said ' + JSON.stringify(said));
  return bad;
});

/* THE LOOK AND THE CREDITS THE CARD OPENED WITH SURVIVE A RELOAD. § */

/* A PARENT WHO SHARES A LISTED TUTOR'S NAME. § */
check('review 339: a parent who shares a listed tutor\'s name edits her own card, her own sections, and the tutor\'s card is still the tutor\'s', async () => {
  const W = cardWorld_({ people: [['P-C9', 'Ada', 'Tutor', 'client', 'ada.parent@example.org', { handle: 'adaparent' }]] });
  const c = await cardOpen_(W, 'ada.parent@example.org');
  if (c.err) return [c.err];
  const bad = [];
  if (c.t.whoami().personId !== 'P-C9') return ['signed in as ' + c.t.whoami().personId + ', not the parent — NOT checked'];
  const pids = [...new Set(c.cards().map(k => k.dataset.pid))];
  if (JSON.stringify(pids) !== JSON.stringify(['P-C9'])) bad.push('Parent settings edits ' + JSON.stringify(pids) + ', wanted her own card (P-C9) alone');
  const own = c.pageOf('P-C9');
  if (own && /Maths, mostly/.test(own.textContent)) bad.push('her own card is the tutor Ada Tutor\'s — the headline "Maths, mostly" is on it');
  if (![...c.d.querySelectorAll('#s-tutors .page')].some(pg => pg !== own && /Maths, mostly/.test(pg.textContent))) bad.push('the tutor Ada Tutor is not on the parent\'s Tutors column as somebody else');
  const secs = c.secs();
  if (JSON.stringify(secs) !== JSON.stringify(['picture', 'figure', 'name', 'handle'])) bad.push('her own cards are ' + JSON.stringify(secs) + ', wanted picture, figure, name and handle');
  if (c.box('first_name') && c.box('first_name').value !== 'Ada') bad.push('her own card\'s name box holds ' + JSON.stringify(c.box('first_name').value));
  try { c.t.go('account', false, true); c.w.paint('account'); } catch (x) { bad.push('drawing Settings threw: ' + x.message); }
  await wait(200);
  if (c.d.querySelector('#s-account [data-me="rate_per_hour"], #s-account [data-me="headline"]')) bad.push('her Settings draws a tutor\'s box');
  return bad;
});

/* ---------- IMPOSTER: ONE PLAYER IS NOT TOLD, AND NOBODY SEES ANYBODY ELSE'S CARD § */
check('the imposter game tells everybody the word but one, and hides it between players', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  try { w.localStorage.setItem('wg-game', 'imp'); } catch (e) {}
  try { t.findGroup('Games'); } catch (e) { return ['go("games") threw: ' + e.message]; }
  await wait(700);
  const d = w.document;
  const card = () => d.getElementById('imp-card');
  /* THE CARD IS WAITED FOR, NOT GUESSED AT — `partyBoot_`'s rule. A fixed 700ms failed every run at a
     load average of 57 on four cores (9 Oct), on the commit before as well, with nothing wrong. */
  for (let n = 0; n < 150 && !card(); n++) await wait(100);
  if (!card()) return ['the imposter game did not draw on the Games column'];
  const press = (act, attrs) => {
    const el = d.createElement('button');
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    t.ACTIONS[act](el);
  };
  const bad = [];
  const text = () => String(card().textContent || '').replace(/\s+/g, ' ').trim();
  const html = () => String(card().innerHTML || '');
  /* WHAT A PERSON HOLDING THE PHONE CAN SEE: § */
  const visible = () => [String(card().textContent || '')]
    .concat([...card().querySelectorAll('[title], [aria-label], [alt]')]
      .map(el => [el.getAttribute('title'), el.getAttribute('aria-label'), el.getAttribute('alt')].filter(Boolean).join(' ')))
    .join(' ').replace(/\s+/g, ' ').trim();
  /* A WHOLE WORD OR PHRASE, ANY CASE. `star` is in Space and the play screen says "Player 3 starts";
     a substring test would call that a leak and fail one deal in eight hundred. */
  const lit = p => String(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const has = (txt, p) => !!p && new RegExp('(^|[^A-Za-z])' + lit(p) + '($|[^A-Za-z])', 'i').test(txt);
  /* THE WHOLE GAME'S TEXT — the card, the row under it, and anything else the slot holds. */
  const game = () => card().closest('.wg-game') || card().parentElement;
  const said = () => String(game().textContent || '').replace(/\s+/g, ' ').trim();
  const exactly = (where, want) => {
    if (said() !== want) bad.push(where + ' reads "' + said() + '", wanted exactly "' + want + '"');
  };
  const sym = () => String((card().querySelector('.imp-sym') || {}).textContent || '').trim();
  /* EVERY PICTURE `aria-hidden`, wherever it is drawn: a screen reader reads 🍕 as "slice of pizza"
     before the word it is a picture of (impFrame_, note 343). Taking it off passed every journey. */
  const hidden = where => [...card().querySelectorAll('.imp-sym')].forEach(el => {
    if (el.getAttribute('aria-hidden') !== 'true') bad.push(where + ': a picture is not aria-hidden, so a screen reader reads it out');
  });
  /* THE "?" IS THE IMPOSTER'S AND NOBODY ELSE'S — the mark a child who cannot read "Imposter" knows
     the card by (impFrame_, note 343). On another card it would be a lie; on the play screen, a
     tell. */
  const marked = () => !!card().querySelector('.imp-sym.is-imp');
  /* NO LINE OVER THE CARD AND NO NOTE UNDER IT: the old "Everyone gets the word but one. Find the
     imposter." could come back as quietly as `#imp-said` could. */
  if (game().querySelector('.sub, #imp-said, .note')) bad.push('the imposter game has a sentence line again (.sub, #imp-said or .note): "' + said() + '"');
  const N = 5;
  /* THE WHOLE RANGE, 3 TO 12, BOTH ENDS — the brief's "3–12 players". The top was never pressed
     (twelve down and two up), so `IMP_MAX = 20` passed every journey (the review of 11 October). */
  const step = (d) => card().querySelector('.imp-step[data-d="' + d + '"]');
  for (let i = 0; i < 13; i++) press('imp-count', { 'data-d': '1' });
  exactly('the setup screen at the most players', 'Players − 12 + Deal');
  if (!step('1') || !step('1').disabled) bad.push('at 12 players + is not disabled');
  for (let i = 0; i < 12; i++) press('imp-count', { 'data-d': '-1' });
  exactly('the setup screen at the fewest players', 'Players − 3 + Deal');
  if (!step('-1') || !step('-1').disabled) bad.push('at 3 players − is not disabled');
  for (let i = 0; i < N - 3; i++) press('imp-count', { 'data-d': '1' });
  /* THE SETUP: how many, and Deal. Read aloud is a tile with no word on it (jsdom has no voice, so it
     is not drawn here at all — the read-aloud journey has it). */
  exactly('the setup screen', 'Players − ' + N + ' + Deal');
  press('imp-start');
  const S = t.IMP();
  if (!S || S.phase !== 'deal' || !S.word || !S.cat) return bad.concat(['Deal did not deal a round: ' + JSON.stringify(S)]);
  const word = S.word, cat = S.cat;
  const mine = t.impCards().find(x => x[0] === cat && x[1] === word);
  const pic = mine ? mine[2] : undefined, catPic = t.impCatSym(cat);
  if (!pic) bad.push('the dealt card ' + JSON.stringify([cat, word]) + ' has no picture in the deck');
  if (!catPic) bad.push('the dealt category ' + JSON.stringify(cat) + ' has no picture in the deck');
  /* NOTHING ON THE HAND-OVER IS ANYBODY'S: not the word, not the hint, not the word "imposter", not a
     picture — read off `visible()`, so a `title` or an `aria-label` counts as much as the words do. */
  const secret = (where, h) => {
    if (has(h, word)) bad.push(where + ' has the word "' + word + '" on it');
    if (has(h, cat)) bad.push(where + ' has the category "' + cat + '" on it');
    if (/imposter/i.test(h)) bad.push(where + ' says "imposter"');
    if ((pic && h.indexOf(pic) !== -1) || (catPic && h.indexOf(catPic) !== -1)) bad.push(where + ' has a picture of the round on it');
  };
  const seen = [];
  let pass0 = null;
  for (let i = 0; i < N; i++) {
    exactly('the hand-over to player ' + (i + 1), 'Player ' + (i + 1) + ' Show');
    secret('the screen handed to player ' + (i + 1), visible());
    /* AND IT IS THE SAME SCREEN FOR EVERYBODY bar the number, the imposter's included — a hand-over
       that differed for one player would be the tell. */
    const shape = html().replace(/Player \d+/g, 'Player #');
    if (pass0 === null) pass0 = shape;
    else if (shape !== pass0) bad.push('the screen handed to player ' + (i + 1) + ' is not the one handed to player 1');
    press('imp-show');
    const big = String((card().querySelector('.imp-big') || {}).textContent || '').trim();
    const imposter = /imposter/i.test(text());
    seen.push({ imposter: imposter, word: imposter ? '' : big });
    if (i === S.imp) {
      if (has(visible(), word)) bad.push('the imposter, player ' + (i + 1) + ', was shown the word');
      if (pic && visible().indexOf(pic) !== -1) bad.push('the imposter, player ' + (i + 1) + ', was shown the word\'s picture');
      exactly("the imposter's card", catPic + ' Imposter ' + cat + ' Hide');
      if (sym() !== catPic) bad.push("the imposter's picture is \"" + sym() + '", not the category\'s ' + catPic);
      if (!marked()) bad.push("the imposter's picture has no \"?\" (.is-imp), so a child who cannot read \"Imposter\" takes the category's picture for their word");
    } else {
      if (big !== word) bad.push('player ' + (i + 1) + "'s big line is \"" + big + '", not the word dealt');
      if (has(visible(), cat)) bad.push('player ' + (i + 1) + ' was shown the category "' + cat + '" as well as the word');
      if (/imposter/i.test(visible())) bad.push('player ' + (i + 1) + ' has the word and was told "imposter" too');
      exactly('player ' + (i + 1) + "'s card", pic + ' ' + word + ' Hide');
      if (sym() !== pic) bad.push('player ' + (i + 1) + "'s picture is \"" + sym() + '", not ' + pic + ' for ' + word);
      if (marked()) bad.push('player ' + (i + 1) + ', who has the word, has the imposter\'s "?" on their picture');
    }
    hidden('player ' + (i + 1) + "'s card");
    if (i === 1) {
      /* LEAVING THE COLUMN HIDES A WORD LEFT UP, and keeps whose turn it was. */
      const wd = t.allWidgets().find(x => x.id === 'wordgames');
      if (!wd || !wd.stop) bad.push('the imposter widget has no stop, so a word left up stays up');
      else wd.stop();
      t.findGroup('Games', 'wordgames');
      for (let n = 0; n < 50 && !(card() && said()); n++) await wait(100);   /* Find redraws the card it lands on (790) */
      if (said() !== 'Player 2 Show') {
        bad.push('leaving the column with a word up does not hide it: the game reads "' + said() + '"');
      }
      secret('the card after leaving the column', visible());
      press('imp-show');
    }
    press('imp-hide');
  }
  const imps = seen.filter(s => s.imposter);
  if (imps.length !== 1) bad.push(imps.length + ' of ' + N + ' players were told they were the imposter');
  else if (seen.findIndex(s => s.imposter) !== S.imp) bad.push('the player told they were the imposter is not the one dealt');
  const words = new Set(seen.filter(s => !s.imposter).map(s => s.word));
  if (words.size !== 1 || [...words][0] !== word) {
    bad.push('the others were not all shown the one word dealt: ' + [...words].join(' / '));
  }
  /* THE PLAY SCREEN: the hint and its picture for everybody now, who starts, and still not the word. */
  if (has(visible(), word) || (pic && visible().indexOf(pic) !== -1)) bad.push('the word or its picture is on the screen once everybody has looked');
  exactly('the play screen', catPic + ' Player ' + (S.first + 1) + ' starts ' + cat + ' Reveal');
  if (marked()) bad.push('the play screen has the imposter\'s "?" on the category\'s picture — the whole table sees it');
  hidden('the play screen');
  press('imp-reveal');
  exactly('the reveal', 'Imposter Player ' + (S.imp + 1) + ' ' + pic + ' ' + word + ' Deal Players');
  hidden('the reveal');
  if (!card().querySelector('.imp-sym')) bad.push('the reveal draws no picture to hold aria-hidden');
  press('imp-players');
  exactly('the setup screen after Players', 'Players − ' + N + ' + Deal');
  return bad;
});

/* ---------- IMPOSTER'S DECK: EVERY CARD HAS ITS PICTURE, AND EVERY CARD DRAWS IT § */
check('imposter: every card in the deck has a picture, thirty to a category, none twice, and each is drawn with it', async () => {
  const { w } = boot({ before: w => { try { w.localStorage.setItem('wg-game', 'imp'); } catch (e) {} } });
  await wait(300);
  const t = w.__t;
  try { t.findGroup('Games'); } catch (e) { return ['go("games") threw: ' + e.message]; }
  await wait(700);
  const d = w.document;
  const card = () => d.getElementById('imp-card');
  for (let n = 0; n < 150 && !card(); n++) await wait(100);
  if (!card()) return ['the imposter game did not draw on the Games column'];
  if (typeof t.impCards !== 'function') return ['the journey cannot read the deck (no impCards on __t)'];
  const bad = [];
  const press = act => t.ACTIONS[act](d.createElement('button'));
  const cards = t.impCards();
  const cats = t.impCats();
  if (cards.length !== cats.length * 30) bad.push('the deck holds ' + cards.length + ' cards in ' + cats.length + ' categories, not thirty to each');
  const per = new Map(), words = new Map(), pics = new Map();
  const fold = x => String(x).toLowerCase().replace(/[’']/g, '').split(/[\s-]+/).filter(Boolean).map(s => s.replace(/s$/, '')).join('');
  cats.forEach(c => {
    const p = t.impCatSym(c);
    if (!p) bad.push('the category ' + c + ' has no picture');
    else pics.set(p, 'the category ' + c);
  });
  cards.forEach(([c, wd, p]) => {
    per.set(c, (per.get(c) || 0) + 1);
    if (!p) bad.push(c + ' "' + wd + '" has no picture');
    else if (pics.has(p)) bad.push(c + ' "' + wd + '" has ' + p + ', which is already ' + pics.get(p) + "'s");
    else pics.set(p, c + ' "' + wd + '"');
    const k = fold(wd);
    if (words.has(k)) bad.push(c + ' "' + wd + '" is ' + words.get(k) + ' again');
    else words.set(k, c + ' "' + wd + '"');
  });
  cats.forEach(c => { if (per.get(c) !== 30) bad.push(c + ' holds ' + (per.get(c) || 0) + ' cards, not 30'); });
  /* EVERY CARD DEALT, SHOWN AND READ. Player 1 is never the imposter here, so their card is the word's. */
  const sym = () => String((card().querySelector('.imp-sym') || {}).textContent || '').trim();
  const big = () => String((card().querySelector('.imp-big') || {}).textContent || '').trim();
  const shown = () => String(card().textContent || '').replace(/\s+/g, ' ').trim();
  let drawn = 0;
  const wrong = [];
  cards.forEach(([c, wd, p]) => {
    t.impStack(c, wd);
    press('imp-players');
    press('imp-start');
    const S = t.IMP();
    if (!S || S.word !== wd || S.cat !== c) { wrong.push('dealing ' + c + ' "' + wd + '" dealt ' + JSON.stringify(S && [S.cat, S.word])); return; }
    S.imp = 1;
    press('imp-show');
    if (sym() !== p || big() !== wd || shown() !== p + ' ' + wd + ' Hide') {
      wrong.push(c + ' "' + wd + '" drew "' + shown() + '" (picture "' + sym() + '"), wanted "' + p + ' ' + wd + ' Hide"');
    } else drawn++;
  });
  if (wrong.length) bad.push(wrong.length + ' cards did not draw their picture and word, the first: ' + wrong.slice(0, 3).join(' · '));
  if (drawn !== cards.length) bad.push('drew ' + drawn + ' of ' + cards.length + ' cards with their picture');
  /* AND EVERY CATEGORY'S PICTURE ON ITS IMPOSTER'S CARD. */
  cats.forEach(c => {
    const first = cards.find(x => x[0] === c);
    if (!first) return;
    t.impStack(c, first[1]);
    press('imp-players');
    press('imp-start');
    t.IMP().imp = 0;
    press('imp-show');
    const p = t.impCatSym(c);
    if (sym() !== p || shown() !== p + ' Imposter ' + c + ' Hide') bad.push("the imposter's card for " + c + ' reads "' + shown() + '", wanted "' + p + ' Imposter ' + c + ' Hide"');
  });
  press('imp-players');
  return bad;
});

/* ---------- IMPOSTER READ ALOUD: THE WORD, OR "IMPOSTER", TO THE ONE WHO PRESSES LISTEN, AND NOTHING ELSE § */
check('imposter read aloud says only the word, or "Imposter", and only to the one who presses Listen', async () => {
  const said = [];
  const voiced = w => {
    w.SpeechSynthesisUtterance = function (txt) {
      this.text = String(txt); this.lang = ''; this.voice = null; this.rate = 1; this.volume = 1;
    };
    w.speechSynthesis = {
      speak: u => said.push({ say: u.text, lang: u.lang, voice: u.voice && u.voice.lang, rate: u.rate, volume: u.volume }),
      cancel: () => said.push({ cancel: true }),
      getVoices: () => [{ name: 'American', lang: 'en-US' }, { name: 'British', lang: 'en-GB' }],
    };
  };
  /* A MEMBER (400): Find, where the games are since 790, is for members. */
  const { w } = boot({ before: w => { signedInAs_(MEMBER_)(w); voiced(w); try { w.localStorage.setItem('wg-game', 'imp'); } catch (e) {} } });
  await wait(300);
  const t = w.__t;
  try { t.findGroup('Games', 'wordgames'); } catch (e) { return ['go("games") threw: ' + e.message]; }
  await wait(700);
  const d = w.document;
  const card = () => d.getElementById('imp-card');
  /* THE CARD IS WAITED FOR, NOT GUESSED AT — `partyBoot_`'s rule. A fixed 700ms failed every run at a
     load average of 57 on four cores (9 Oct), on the commit before as well, with nothing wrong. */
  for (let n = 0; n < 150 && !card(); n++) await wait(100);
  if (!card()) return ['the imposter game did not draw on the Games column'];
  const bad = [];
  /* A MARK IN THE LIST FOR EVERYTHING THE JOURNEY DOES, a press or not, so "what came after" always
     means "after this". */
  const mark = (what, note) => said.push(Object.assign({ press: what }, note || {}));
  const press = (act, note) => { mark(act, note); t.ACTIONS[act](d.createElement('button')); };
  const text = () => String(card().textContent || '').replace(/\s+/g, ' ').trim();
  /* WHAT CAME AFTER THE LAST MARK: everything said and stopped since the journey's last press. */
  const since = () => { let i = said.length - 1; while (i >= 0 && !said[i].press) i--; return said.slice(i + 1); };
  const says = list => list.filter(x => x.say !== undefined);
  const quiet = where => { const s = says(since()); if (s.length) bad.push(where + ' said ' + JSON.stringify(s.map(x => x.say))); };
  const sw = () => card().querySelector('[data-do="imp-aloud"]');
  const listen = () => card().querySelector('[data-do="imp-listen"]');
  /* `imp-count` reads `data-d`, so the presses that move it carry one. */
  const step = dd => { const b = d.createElement('button'); b.setAttribute('data-d', String(dd)); t.ACTIONS['imp-count'](b); };
  /* EVERY SCREEN'S WHOLE TEXT WITH READ ALOUD ON, held to the screen journey's exact words. § */
  const game = () => card().closest('.wg-game') || card().parentElement;
  const shown = () => String(game().textContent || '').replace(/\s+/g, ' ').trim();
  const exactly = (where, want) => { if (shown() !== want) bad.push(where + ', with Read aloud on, reads "' + shown() + '", wanted exactly "' + want + '"'); };
  for (let i = 0; i < 12; i++) step(-1);
  step(1);
  const N = 4;

  /* ---- OFF, WHICH IS HOW IT ARRIVES: a switch to turn it on, and not one word out of the phone. ---- */
  if (!sw()) return bad.concat(['with a voice on the device there is no Read aloud switch on the setup screen']);
  if (sw().getAttribute('aria-pressed') !== 'false') bad.push('Read aloud is not off until somebody turns it on');
  /* A TILE, THE REELS' PAIR (note 323): the crossed speaker while it is off, drawn as TILE_ICONS draws it. */
  readAloudSays_(sw(), false, 'the setup screen as it arrives').forEach(x => bad.push(x));
  press('imp-start');
  for (let i = 0; i < N; i++) {
    press('imp-show');
    if (listen()) bad.push('with Read aloud off, player ' + (i + 1) + "'s card still has Listen on it");
    press('imp-listen');
    press('imp-hide');
  }
  press('imp-reveal');
  press('imp-again');
  press('imp-players');
  if (says(said).length) bad.push('with Read aloud off the phone still said: ' + says(said).map(x => '"' + x.say + '"').join(', '));

  /* ---- ON, AND REMEMBERED: the switch says so, the device keeps it, a repaint keeps it. ---- */
  press('imp-aloud');
  let kept = null;
  try { kept = w.localStorage.getItem('imp-aloud'); } catch (e) {}
  if (!sw() || sw().getAttribute('aria-pressed') !== 'true') bad.push('pressing Read aloud did not turn it on');
  if (kept !== '1') bad.push('Read aloud is not remembered on the device (imp-aloud is ' + JSON.stringify(kept) + ')');
  readAloudSays_(sw(), true, 'the setup screen once pressed').forEach(x => bad.push(x));
  quiet('turning Read aloud on');
  /* THE PLAYER COUNT, PRESSED WITH THE SWITCH ON — it was only ever pressed before, so "4 players"
     said on every press passed (the review of 11 October). Marked, so `quiet` asks about each one. */
  mark('imp-count -1'); step(-1); quiet('one player fewer');
  mark('imp-count +1'); step(1); quiet('one player more');
  exactly('the setup screen', 'Players − ' + N + ' + Deal');
  t.repaint(true);
  await wait(50);
  /* FIND FILLS THE PAGE IN FRONT AFTER ITS PAINT (790), so the card is waited for. */
  for (let n = 0; n < 60 && !card(); n++) await wait(50);
  if (!sw() || sw().getAttribute('aria-pressed') !== 'true') bad.push('a repaint turned Read aloud off');
  readAloudSays_(sw(), true, 'the setup screen after a repaint').forEach(x => bad.push(x));

  /* ---- A ROUND WITH THE SWITCH ON, two of them, with known words on top of the pile ---- */
  const start = said.length;
  const round = async (cat, word) => {
    const S = t.IMP();
    if (!S || S.word !== word || S.cat !== cat) { bad.push('the round did not deal the card put on the pile: ' + JSON.stringify(S && [S.cat, S.word])); return null; }
    const pic = (t.impCards().find(x => x[0] === cat && x[1] === word) || [])[2], catPic = t.impCatSym(cat);
    quiet('dealing, with the hand-over to player 1 up,');
    for (let i = 0; i < N; i++) {
      const me = i === S.imp;
      exactly('the hand-over to player ' + (i + 1), 'Player ' + (i + 1) + ' Show');
      if (i === 2) {
        /* A REPAINT IS NOBODY'S PRESS, so it says nothing — and keeps the round. */
        mark('repaint');
        t.repaint(true);
        for (let n = 0; n < 60 && !(card() && text()); n++) await wait(50);   /* Find fills its page after the paint (790) */
        quiet('a repaint');
        if (text() !== 'Player 3 Show') bad.push('a repaint lost the round: "' + text() + '"');
      }
      press('imp-show', { i: i, me: me });
      quiet('player ' + (i + 1) + "'s card coming up, by itself,");
      exactly(me ? "the imposter's card" : 'player ' + (i + 1) + "'s card", me ? catPic + ' Imposter ' + cat + ' Hide' : pic + ' ' + word + ' Hide');
      if (!listen()) bad.push('with Read aloud on, player ' + (i + 1) + "'s card has no Listen");
      press('imp-listen', { i: i, me: me });
      const heard = says(since());
      const want = me ? 'Imposter' : word;
      if (heard.length !== 1) bad.push('Listen for player ' + (i + 1) + ' said ' + heard.length + ' things: ' + JSON.stringify(heard.map(x => x.say)));
      else {
        const h = heard[0];
        /* EXACTLY THE WORD, OR EXACTLY "Imposter" — not "Your word is …", not the word twice, not the
           hint, and never the picture, which a voice reads out by its Unicode name. */
        if (h.say !== want) bad.push('Listen for player ' + (i + 1) + (me ? ', the imposter,' : '') + ' said "' + h.say + '", wanted exactly "' + want + '"');
        if (!(h.volume <= 0.7)) bad.push('Listen was said at volume ' + h.volume + ', not quietly');
        if (!(h.rate >= 0.8 && h.rate < 1)) bad.push('Listen was said at rate ' + h.rate + ', not a little slower');
        if (h.lang !== 'en-GB' && h.voice !== 'en-GB') bad.push('Listen asked for no British voice (' + h.lang + ' / ' + h.voice + ')');
        /* AND AGAIN, BECAUSE "WHAT WAS IT?" IS THE FIRST THING A SIX-YEAR-OLD ASKS. */
        press('imp-listen', { i: i, me: me });
        const again = says(since());
        if (again.length !== 1 || again[0].say !== h.say) bad.push('a second Listen did not say it again: ' + JSON.stringify(again.map(x => x.say)));
      }
      if (i === 1) {
        /* LEAVING THE COLUMN STOPS THE VOICE FIRST, and coming back says nothing. */
        const wd = t.allWidgets().find(x => x.id === 'wordgames');
        mark('stop');
        if (wd && wd.stop) wd.stop();
        else bad.push('the word games widget has no stop');
        const first = since()[0];
        if (!first || !first.cancel) bad.push('leaving the column did not stop the voice first (next: ' + JSON.stringify(first) + ')');
        mark('go');
        t.findGroup('Games');
        quiet('coming back to the column');
        press('imp-show', { i: i, me: me });
        quiet('player 2\'s card coming up again');
      }
      press('imp-hide', { i: i });
      const after = since();
      if (!after.length || !after[0].cancel) bad.push('Hide for player ' + (i + 1) + ' did not stop the voice before anything else (next: ' + JSON.stringify(after[0]) + ')');
      quiet(i < N - 1 ? 'the hand-over to player ' + (i + 2) : 'the play screen');
    }
    exactly('the play screen', catPic + ' Player ' + (S.first + 1) + ' starts ' + cat + ' Reveal');
    press('imp-reveal');
    quiet('the reveal');
    exactly('the reveal', 'Imposter Player ' + (S.imp + 1) + ' ' + pic + ' ' + word + ' Deal Players');
    return S;
  };
  t.impStack('At the seaside', 'octopus');
  press('imp-start');
  await round('At the seaside', 'octopus');
  t.impStack('Music', 'trumpet');
  press('imp-again');
  const again = since();
  if (!again.length || !again[0].cancel) bad.push('the reveal\'s Deal did not stop the voice before anything else (next: ' + JSON.stringify(again[0]) + ')');
  await round('Music', 'trumpet');
  press('imp-players');
  const back = since();
  if (!back.length || !back[0].cancel) bad.push('Players did not stop the voice (next: ' + JSON.stringify(back[0]) + ')');
  quiet('Players');
  exactly('the setup screen after Players', 'Players − ' + N + ' + Deal');

  /* THE WHOLE GAME, SAID: two rounds of four, each Listen pressed twice — sixteen lines, every one the
     round's word or "Imposter", two of them "Imposter" in each round and the rest the word. */
  const lines = says(said.slice(start)).map(x => x.say);
  const heardOf = wd => lines.filter(x => x === wd).length;
  if (lines.length !== 2 * N * 2) bad.push('a whole game with Read aloud on said ' + lines.length + ' lines, wanted ' + (2 * N * 2) + ' (each Listen, twice): ' + JSON.stringify(lines));
  const stray = lines.filter(x => x !== 'octopus' && x !== 'trumpet' && x !== 'Imposter');
  if (stray.length) bad.push('a whole game said ' + stray.length + ' lines that are neither a word nor "Imposter": ' + JSON.stringify(stray));
  if (heardOf('Imposter') !== 4 || heardOf('octopus') !== 2 * (N - 1) || heardOf('trumpet') !== 2 * (N - 1)) {
    bad.push('a whole game said "Imposter" ' + heardOf('Imposter') + ' times, "octopus" ' + heardOf('octopus') + ' and "trumpet" ' + heardOf('trumpet') + ' — wanted 4, ' + 2 * (N - 1) + ' and ' + 2 * (N - 1));
  }

  /* ---- AND OFF AGAIN, BY A FINGER ON THE TILE'S MARK — the real dispatcher, as the reels' journey
     presses its Sound tile — so the pair is seen both ways and the device forgets it. ---- */
  if (!sw()) bad.push('Players did not bring back the setup screen and its Read aloud tile');
  else {
    const drawnOn = (sw().querySelector('svg.tile-i') || {}).innerHTML;
    mark('imp-aloud (a finger on the tile)');
    (sw().querySelector('svg') || sw()).dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
    let forgot = null;
    try { forgot = w.localStorage.getItem('imp-aloud'); } catch (e) {}
    if (forgot !== '0') bad.push('a press on the Read aloud tile did not turn it off on the device (imp-aloud is ' + JSON.stringify(forgot) + ')');
    readAloudSays_(sw(), false, 'the setup screen turned off by a press on the tile').forEach(x => bad.push(x));
    if (sw() && (sw().querySelector('svg.tile-i') || {}).innerHTML === drawnOn)
      bad.push('turning Read aloud off left the same picture on its tile');
    quiet('turning Read aloud off');
  }

  /* AND THE WORD WAS SAID ONLY TO A PLAYER WHO HAD IT AND PRESSED LISTEN, and "Imposter" only to the
     imposter: the press nearest before every line is a Listen by the right player. */
  let lastPress = null;
  said.forEach(x => {
    if (x.press) { lastPress = x; return; }
    if (x.say === undefined) return;
    if (!lastPress || lastPress.press !== 'imp-listen') {
      bad.push('"' + x.say + '" was said after ' + JSON.stringify(lastPress) + ', not after a Listen');
      return;
    }
    if ((x.say === 'Imposter') !== !!lastPress.me) bad.push('"' + x.say + '" was said to player ' + (lastPress.i + 1) + (lastPress.me ? ', the imposter' : ', who has the word'));
  });

  /* ---- AND ON A PHONE WITH NO VOICE, NONE OF IT IS DRAWN, even with the switch remembered on. ---- */
  const mute = boot({ before: w2 => { try { w2.localStorage.setItem('imp-aloud', '1'); w2.localStorage.setItem('wg-game', 'imp'); } catch (e) {} } });
  await wait(300);
  const t2 = mute.w.__t;
  try { t2.findGroup('Games'); } catch (e) { return bad.concat(['go("games") threw with no voice: ' + e.message]); }
  await wait(700);
  const card2 = mute.w.document.getElementById('imp-card');
  if (!card2) return bad.concat(['with no voice the imposter game did not draw']);
  if (card2.querySelector('[data-do="imp-aloud"]')) bad.push('with no speechSynthesis the Read aloud switch is still drawn');
  t2.ACTIONS['imp-start'](mute.w.document.createElement('button'));
  t2.ACTIONS['imp-show'](mute.w.document.createElement('button'));
  if (card2.querySelector('[data-do="imp-listen"]')) bad.push('with no speechSynthesis a card still has Listen on it');
  if (!/Hide/.test(card2.textContent || '')) bad.push('with no speechSynthesis the card did not come up: "' + card2.textContent + '"');
  return bad;
});

