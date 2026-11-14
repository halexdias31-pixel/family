/* SWITCHED OFF (owner, 14 Nov): the avatar maker (choosing one of the ten pictures). Lines 723-1007 of check/flow/17-mark-tutor.js before 14 Nov. */
/* ---------- YOUR PICTURE, CHOSEN ON YOUR OWN CARD'S EDIT § */
check('a picture chosen on your Picture card posts savePhoto and the preview shows it, and Settings draws no picker', async () => {
  const URL_ = 'https://drive.google.com/file/d/FILEabcdefghijklmnopqrstuv/view';
  const { w, sent } = boot({ reply: b => b.action === 'savePhoto'
    ? { success: true, photo: b.remove ? '' : URL_ } : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document;
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk',
           profile: { first_name: 'Test', last_name: 'Admin', photo: '', phone_cc: '+44' } });
  try { t.go('account', false, true); w.paint('account'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const bad = [];
  if (d.querySelector('#s-account [data-me="photo"]')) bad.push('Settings still draws a box for a photo link');
  if ([...d.querySelectorAll('#s-account .pfp')].some(x => !x.closest('.card-ed'))) bad.push('Settings still draws the picture picker, which is on your own card\'s Edit now');
  try { t.go('staff', false, true); w.paint('staff'); } catch (e) { return bad.concat(['drawing Tutors threw: ' + e.message]); }
  await wait(200);
  /* 468: NO EDIT TO PRESS — the Picture card is always open on Tutor settings. */
  if (d.querySelector('[data-do="card-edit"]')) bad.push('an Edit tile is still drawn');
  const box = () => d.querySelector('#s-account .card-ed[data-sec="picture"] .pfp');
  if (!box()) return bad.concat(['your own card\'s Edit has no picture picker']);
  if (d.querySelector('#s-staff .card-ed [data-me="photo"]')) bad.push('the card\'s Edit draws a box for a photo link beside the picker');
  const inp = box().querySelector('input.pfp-in[type="file"]');
  if (!inp || !/image\/\*/.test(inp.getAttribute('accept') || '')) bad.push('the picker has no hidden file input taking images');
  if (!box().querySelector('[data-do="pfp-pick"]')) bad.push('the picker has no Choose photo tile');
  const rm = box().querySelector('[data-do="pfp-remove"]');
  if (!rm || !rm.disabled) bad.push('Remove is pressable with no picture to remove');
  if (!/^T$/.test(String((box().querySelector('.pfp-none') || {}).textContent || '').trim())) bad.push('with no picture the preview is not the initial');
  if (!inp) return bad;
  w.pfpPrepare_ = () => Promise.resolve('data:image/jpeg;base64,' + Buffer.from('square').toString('base64'));
  Object.defineProperty(inp, 'files', { value: [new w.File(['x'], 'me.png', { type: 'image/png' })], configurable: true });
  sent.length = 0;
  inp.dispatchEvent(new w.Event('change', { bubbles: true }));
  await wait(300);
  const post = sent.find(b => b.action === 'savePhoto');
  if (!post) bad.push('choosing a file posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no savePhoto');
  else {
    if (!/^data:image\/jpeg;base64,/.test(String(post.data || ''))) bad.push('savePhoto carried "' + String(post.data).slice(0, 30) + '", not a JPEG data: URL');
    if (post.personId !== 'P001') bad.push('savePhoto did not name the signed-in person by id');
  }
  const img = box() && box().querySelector('.pfp-face img');
  if (!img || !/lh3\.googleusercontent\.com\/d\/FILEabcdefghijklmnopqrstuv/.test(img.getAttribute('src') || '')) {
    bad.push('after the save the preview shows ' + (img ? img.getAttribute('src') : 'no picture') + ', not the kept file');
  }
  if ((t.whoami().profile || {}).photo !== URL_) bad.push('USER.profile.photo was not given the kept address, so the next Settings draw shows the old face');
  const rm2 = box() && box().querySelector('[data-do="pfp-remove"]');
  if (!rm2 || rm2.disabled) bad.push('with a picture saved, Remove cannot be pressed');
  else {
    sent.length = 0;
    t.ACTIONS['pfp-remove'](rm2);
    await wait(300);
    if (!sent.some(b => b.action === 'savePhoto' && b.remove === true)) bad.push('Remove posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no savePhoto remove');
    if (!box() || box().querySelector('.pfp-face img') || (t.whoami().profile || {}).photo !== '') bad.push('after Remove the picture is still drawn or still on USER.profile');
  }
  return bad;
});

/* ---------- YOUR PICTURE, ONE OF ELEVEN — FOR EVERY ROLE, SEEN BY YOU AND BY SOMEBODY ELSE § */
const PFP_ROLES = {
  student: { name: 'Sam Pupil', personId: 'P-S9', role: 'kid', roles: ['student'], handle: 'sam_glad09',
             avatar: 'skin:3|shirt:5|hair:curls', basic: 'fox', other: 'family' },
  parent:  { name: 'Pat Mum', personId: 'P-C9', role: 'parent', roles: ['parent'], handle: 'pat_kind09',
             avatar: 'skin:1|shirt:6|hair:long', basic: 'cat', other: 'dm' },
  tutor:   { name: 'Tia Tutor', personId: 'P-T9', role: 'tutor', roles: ['tutor'], handle: 'tia_calm09',
             avatar: 'skin:4|shirt:3|hair:crop', basic: 'robot', other: 'people' },
  admin:   { name: 'Ari Admin', personId: 'P-A9', role: 'admin', roles: ['admin'], handle: 'ari_wise09',
             avatar: 'skin:0|shirt:7|hair:fringe', basic: 'rocket', other: 'feed' },
};
const AV_SKIN_T = ['#f3c9a0', '#e0a878', '#c58a5b', '#8d5a3b', '#5f3a25', '#ffd9b3'];
const AV_SHIRT_T = ['#f4f4f2', '#2f6b3f', '#1f5f8a', '#8a3a3a', '#6b4d8a', '#c07a1f', '#3d4b57', '#2f6b6b'];
async function pfpRoleJourney(key) {
  const P = PFP_ROLES[key];
  const URL_ = 'https://drive.google.com/file/d/FILEpfp' + key + 'abcdefghijklmnopq/view';
  const staff = key === 'tutor' || key === 'admin';
  const mineRow = () => ({ title: P.name, handle: P.handle, personId: P.personId, role: key === 'admin' ? 'Admin' : 'Tutor',
                           rate: 20, teaches: [], dbs: true, listed: true, avail: {}, image: '' });
  const data = payload();
  if (staff) data.tutors = data.tutors.concat([mineRow()]);
  const { w, sent } = boot({ payload: data, reply: b => b.action === 'savePhoto'
    ? (b.remove ? { success: true, photo: '' }
      : b.choice ? Object.assign({ success: true, photo: b.choice }, b.choice === 'pfp:avatar' ? { avatar: P.avatar } : {})
      : { success: true, photo: URL_ })
    : b.action === 'saveAvatar' ? { success: true, avatar: Object.keys(b.avatar || {}).map(k => k + ':' + b.avatar[k]).join('|') }
    : { success: true } });
  for (let k = 0; k < 80 && !w.__t; k++) await wait(100);
  await wait(200);
  const t = w.__t, d = w.document;
  if (!t) return ['the app did not finish loading'];
  const first = P.name.split(' ')[0];
  t.USER({ name: P.name, personId: P.personId, role: P.role, roles: P.roles, token: 'tk', handle: P.handle,
           avatar: P.avatar, photo: '', profile: { first_name: first, last_name: P.name.split(' ')[1], photo: '', phone_cc: '+44' } });
  /* YOUR OWN CARD IS ON YOUR RANK'S PEOPLE COLUMN (453). */
  const HC = 'account', H = '#s-' + HC;  /* 469: everybody's picture is edited on Student settings */
  try { t.go(HC, false, true); w.paint(HC); w.paint('account'); } catch (e) { return ['drawing ' + HC + ' threw: ' + e.message]; }
  await wait(300);
  const bad = [];
  /* EDIT ON YOUR OWN CARD, AND THE FORM IT TURNS INTO. */
  const editing = () => d.querySelector(H + ' .card-ed[data-pid="' + P.personId + '"] .me-form');
  const openEdit = async () => {
    if (editing()) return true;
    /* DRAWN AGAIN AS YOU FIRST — `asOther` below draws the column as somebody else and puts you back without
       a paint, so the column on the page can be theirs. */
    try { w.paint(HC); } catch (e) {}
    for (let k = 0; k < 20 && !editing(); k++) await wait(50);
    return !!editing();
  };
  /* SAVE ON THE PICTURE'S CARD (468): it saved itself, so this says so and the profile column is drawn again. */
  const shut = async () => {
    const save = d.querySelector(H + ' .card-ed[data-sec="picture"][data-pid="' + P.personId + '"]');
    if (save) t.ACTIONS['card-save'](save);
    await wait(300);
    try { w.paint(t.homeCol()); } catch (e) {}
  };
  if (!(await openEdit())) return ['a ' + key + '\'s settings column draws no editing cards'];
  if ([...d.querySelectorAll('#s-account .pfp, ' + H + ' .pfp')].some(x => !x.closest('.card-ed'))) bad.push('a ' + key + '\'s Settings still draws a picture picker');
  const box = () => d.querySelector(H + ' .card-ed .pfp');
  if (!box()) return ['a ' + key + '\'s own card\'s Edit has no picture picker'];
  const opts = () => [...box().querySelectorAll('.pfp-grid button.pfp-opt[data-do="pfp-choose"]')];
  const names = opts().map(b => b.dataset.pic);
  const ten = t.pfpNames();
  if (JSON.stringify(names) !== JSON.stringify(ten) || ten.length !== 10) {
    bad.push('the grid offers ' + JSON.stringify(names) + ' — wanted the ten pictures (the figure went, 9 Nov)');
  }
  if (opts().some(b => b.classList.contains('on'))) bad.push('a ring is on a picture before any is yours');
  /* A CHILD UPLOADS NO PHOTO (413): the grid and Remove, and no Choose photo or file input. */
  const kid = key === 'student';
  if ((!kid && !box().querySelector('[data-do="pfp-pick"]')) || !box().querySelector('[data-do="pfp-remove"]')) bad.push('Choose photo or Remove has gone from the card');
  if (kid && box().querySelector('[data-do="pfp-pick"], input.pfp-in')) bad.push('a child is offered Choose photo, a file upload');
  const ground = n => (/<circle cx="24" cy="24" r="24" fill="(#[0-9a-f]{6})"/.exec(w.pfpArt_(n, 40)) || [])[1];
  /* WHAT A FACE IS, ASKED OF THE ELEMENT THE SURFACE DREW. */
  const faceIs = (el, want) => {
    if (!el) return 'no face at all';
    const html = el.outerHTML;
    if (want.kind === 'avatar') {
      const svg = el.querySelector('svg.avatar.is-bust');
      if (!svg) return 'not a figure: ' + html.slice(0, 90);
      const skin = AV_SKIN_T[Number(/skin:(\d)/.exec(want.fig)[1])], shirt = AV_SHIRT_T[Number(/shirt:(\d)/.exec(want.fig)[1])];
      return html.indexOf(skin) !== -1 && html.indexOf(shirt) !== -1 ? '' : 'a figure, but not this person\'s (' + skin + ', ' + shirt + ')';
    }
    if (want.kind === 'basic') return el.querySelector('svg.pfp-art') && html.indexOf('fill="' + ground(want.name) + '"') !== -1 ? '' : 'not the ' + want.name + ': ' + html.slice(0, 90);
    if (want.kind === 'photo') return el.tagName === 'IMG' && /lh3\.googleusercontent\.com\/d\/FILEpfp/.test(el.getAttribute('src') || '') ? '' : 'not the photograph: ' + html.slice(0, 90);
    return !el.querySelector('svg, img') && el.tagName !== 'IMG' && el.textContent.trim() === want.letter ? '' : 'not the initial ' + want.letter + ': ' + html.slice(0, 90);
  };
  /* YOUR OWN CARD, AS THE APP REPAINTED YOUR PROFILE COLUMN AFTER THE SAVE — the one place it is drawn (468). */
  const myCard = () => [...d.querySelectorAll('#s-' + t.homeCol() + ' .card.is-prof')]
    .find(c => (c.querySelector('.prof-name') || {}).textContent === P.name);
  /* AND AS SOMEBODY ELSE, FROM WHAT `doGet` SENDS THEM. Drawn, then put back. */
  const asOther = (stored, figure) => {
    const me = t.whoami(), D = t.DATA();
    const keep = { tutors: D.tutors, family: D.family, familyFor: D.familyFor, posts: D.posts };
    const face = Object.assign({ image: stored }, picFig(stored, figure));
    let el = null;
    try {
      if (P.other === 'family') {            // the student's parent, on their own column
        t.USER({ name: 'Mo Parent', personId: 'P-M9', role: 'parent', roles: ['parent'], token: 'tk2', profile: {} });
        D.family = [Object.assign({ personId: P.personId, title: P.name, relation: 'child', handle: P.handle }, face)];
        D.familyFor = 'P-M9';
        /* A PARENT'S CHILDREN ARE ON STUDENTS (453). */
        w.paint('students');
        el = [...d.querySelectorAll('#s-students .card.is-prof')].find(c => (c.querySelector('.prof-name') || {}).textContent === P.name);
        el = el && el.querySelector('.prof-pic');
      } else if (P.other === 'dm') {         // the parent's child, at the head of their conversation
        t.USER({ name: 'Kit Child', personId: 'P-K9', role: 'kid', roles: ['student'], token: 'tk2', profile: {} });
        D.family = [Object.assign({ personId: P.personId, title: P.name, relation: 'parent', handle: P.handle }, face)];
        D.familyFor = 'P-K9';
        const host = d.createElement('div');
        host.innerHTML = w.dmFace_({ name: P.name, id: P.personId });
        el = host.querySelector('.dm-av');
        el = el && (el.querySelector('img, .face-pic') || el);
      } else if (P.other === 'people') {     // a visitor's people column
        t.USER({ name: 'Vi Visitor', personId: 'P-V9', role: 'parent', roles: ['parent'], token: 'tk2', profile: {} });
        D.tutors = keep.tutors.filter(r => r.personId !== P.personId).concat([Object.assign(mineRow(), face)]);
        w.paint('tutors');
        el = [...d.querySelectorAll('#s-tutors .card.is-prof')].find(c => (c.querySelector('.prof-name') || {}).textContent === P.name);
        el = el && el.querySelector('.prof-pic');
      } else {                               // the feed, which every visitor is sent
        t.USER(null);
        D.posts = [{ id: 'PO-PFP', author: P.name, handle: P.handle, avatar: stored, figure: picFig(stored, figure).avatar,
                     image: 'data/reels/archetest.jpg', media: ['data/reels/archetest.jpg'], caption: 'A trip', body: '',
                     location: '', when: '', at: 0, pinned: false, active: true, waiting: false, refused: false,
                     approvedBy: '', poll: null, reactions: { emoji: ['👍'], counts: [0], total: 0, yours: '', by: [] },
                     comments: { total: 0, list: [] }, rowIndex: 2 }];
        w.paint('feed');
        el = d.querySelector('#s-feed article[data-post="PO-PFP"] .post-face');
      }
    } catch (e) { el = null; bad.push('drawing ' + key + ' as somebody else sees them threw: ' + e.message); }
    const out = el ? el.cloneNode(true) : null;
    t.USER(me); Object.assign(D, keep);
    return out;
  };
  /* THE ROW `doGet` SENDS: the figure only when the face is the figure (`faceFig_`, core.gs). */
  const picFig = (stored, figure) => stored === 'pfp:avatar' ? { avatar: figure } : {};
  const step = async (label, press, wantSent, want) => {
    if (!(await openEdit())) { bad.push(label + ': the editing cards are gone'); return; }
    sent.length = 0;
    await press();
    await wait(300);
    const post = sent.find(b => b.action === 'savePhoto');
    if (!post) { bad.push(label + ': posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no savePhoto'); return; }
    if (post.personId !== P.personId) bad.push(label + ': savePhoto did not name ' + P.personId);
    const miss = Object.keys(wantSent).filter(k => post[k] !== wantSent[k]);
    if (miss.length) bad.push(label + ': savePhoto carried ' + JSON.stringify(miss.map(k => [k, post[k]])) + ', wanted ' + JSON.stringify(wantSent));
    const stored = String((t.whoami().profile || {}).photo);
    if (stored !== want.stored) bad.push(label + ': USER.profile.photo is "' + stored + '", wanted "' + want.stored + '"');
    const ring = opts().filter(b => b.classList.contains('on')).map(b => b.dataset.pic);
    const ringWant = want.kind === 'avatar' ? ['avatar'] : want.kind === 'basic' ? [want.name] : [];
    if (JSON.stringify(ring) !== JSON.stringify(ringWant)) bad.push(label + ': the gold ring is on ' + JSON.stringify(ring) + ', wanted ' + JSON.stringify(ringWant));
    if (opts().some(b => (b.getAttribute('aria-pressed') === 'true') !== b.classList.contains('on'))) bad.push(label + ': aria-pressed does not follow the ring');
    const said = (box().querySelector('.pfp-said') || {}).textContent || '';
    if (!want.said.test(said)) bad.push(label + ': the line under the grid says "' + said + '"');
    const prev = faceIs(box().querySelector('.pfp-face > *'), Object.assign({ letter: first[0] }, want));
    if (prev) bad.push(label + ': the preview is ' + prev);
    /* SAVE — the picture saved itself, so Save sends nothing more — and the card read on your profile column. */
    await shut();
    const mine = myCard();
    if (!mine) bad.push(label + ': your own card is not on your profile column');
    else { const why = faceIs(mine.querySelector('.prof-pic'), Object.assign({ letter: P.name[0] }, want)); if (why) bad.push(label + ': your own card shows ' + why); }
    const other = faceIs(asOther(want.stored, P.avatar), Object.assign({ letter: P.name[0] }, want));
    if (other) bad.push(label + ': as somebody else sees you (' + P.other + '), your face is ' + other);
  };
  const choose = n => () => { const b = opts().find(x => x.dataset.pic === n); if (!b) throw new Error('no ' + n + ' in the grid'); t.ACTIONS['pfp-choose'](b); };
  try {
    /* THE FIGURE IS NO LONGER A PICTURE (owner, 9 Nov): the grid offers the ten pictures and nothing else. */
    if (opts().some(x => x.dataset.pic === 'avatar')) bad.push('the picture grid still offers your figure');
    await step('the ' + P.basic, choose(P.basic), { choice: 'pfp:' + P.basic },
      { kind: 'basic', name: P.basic, stored: 'pfp:' + P.basic, said: new RegExp('Saved\\. The ' + P.basic + ' is your picture') });
    /* A TAP ON THE ONE ALREADY IN USE SENDS NOTHING. */
    await openEdit();
    sent.length = 0;
    choose(P.basic)();
    await wait(100);
    if (sent.some(b => b.action === 'savePhoto')) bad.push('a tap on the picture already in use posted savePhoto again');
    if (!kid) await step('a photograph', async () => {
      w.pfpPrepare_ = () => Promise.resolve('data:image/jpeg;base64,' + Buffer.from('square').toString('base64'));
      const inp = box().querySelector('input.pfp-in[type="file"]');
      Object.defineProperty(inp, 'files', { value: [new w.File(['x'], 'me.png', { type: 'image/png' })], configurable: true });
      inp.dispatchEvent(new w.Event('change', { bubbles: true }));
    }, {}, { kind: 'photo', stored: URL_, said: /Saved\. Your photo is your picture/ });
    if (!kid && !(sent.find(b => b.action === 'savePhoto') || {}).data) bad.push('the photograph was not posted as data');
    await step('Remove', () => { t.ACTIONS['pfp-remove'](box().querySelector('[data-do="pfp-remove"]')); }, { remove: true },
      { kind: 'none', stored: '', said: /Removed\. No picture yet/ });
  } catch (e) { bad.push('the journey threw: ' + e.message); }
  return bad;
}
check('a student chooses the fox and Remove, and is offered no photo upload (413) — each saved, on their card and on their parent\'s', () => pfpRoleJourney('student'));
check('a parent chooses the cat, a photo and Remove — each saved, on their card and in their child\'s messages', () => pfpRoleJourney('parent'));
check('a tutor chooses the robot, a photo and Remove — each saved, on their card and on a visitor\'s people column', () => pfpRoleJourney('tutor'));
check('an admin chooses the rocket, a photo and Remove — each saved, on their card and on the feed', () => pfpRoleJourney('admin'));

/* ---------- AND UNTIL THE BACKEND IS PULLED, A TAP FAILS OUT LOUD § */
check('before the backend is pulled, tapping a picture says the server\'s refusal and keeps the old picture', async () => {
  const URL_ = 'https://drive.google.com/file/d/FILEoldabcdefghijklmnopqrs/view';
  const data = Object.assign(payload(), { version: '2026-10-10-g-schema-grid' });
  const { w, sent } = boot({ payload: data, reply: b => b.action === 'savePhoto'
    ? (b.data || b.remove ? { success: true, photo: '' } : { error: 'That is not a picture. Choose a photo from your phone.' })
    : { success: true } });
  for (let k = 0; k < 80 && !w.__t; k++) await wait(100);
  await wait(200);
  const t = w.__t, d = w.document;
  t.USER({ name: 'Pat Mum', personId: 'P-C9', role: 'parent', roles: ['parent'], token: 'tk', handle: 'pat_kind09',
           avatar: '', photo: URL_, profile: { first_name: 'Pat', last_name: 'Mum', photo: URL_, phone_cc: '+44' } });
  /* ON PAT'S OWN CARD'S EDIT, where the picker is since docs/history/339 — on Parents, a parent's column (453). */
  t.go('account', false, true); w.paint('account');
  await wait(200);
  await wait(300);
  const bad = [];
  const box = () => d.querySelector('#s-account .card-ed .pfp');
  if (!box()) return ['no picture picker on Pat\'s own card\'s Edit'];
  const fox = box().querySelector('.pfp-opt[data-pic="fox"]');
  sent.length = 0;
  t.ACTIONS['pfp-choose'](fox);
  await wait(300);
  const post = sent.find(b => b.action === 'savePhoto');
  if (!post || post.choice !== 'pfp:fox') bad.push('the tap posted ' + JSON.stringify(post) + ', wanted savePhoto choice pfp:fox');
  const said = (box().querySelector('.pfp-said') || {}).textContent || '';
  if (!/That is not a picture/.test(said)) bad.push('the line does not say the server\'s refusal: "' + said + '"');
  if (!/Your picture is unchanged/.test(said)) bad.push('the line does not say the picture is unchanged: "' + said + '"');
  if (!/server has not been updated for the pictures/.test(said)) bad.push('the line does not say the server is older than the pictures: "' + said + '"');
  if ((t.whoami().profile || {}).photo !== URL_) bad.push('USER.profile.photo became "' + (t.whoami().profile || {}).photo + '" after a refusal');
  const img = box().querySelector('.pfp-face img');
  if (!img || !/FILEold/.test(img.getAttribute('src') || '')) bad.push('the old photograph is not back in the preview');
  if (box().querySelector('.pfp-opt.on')) bad.push('a ring was left on ' + box().querySelector('.pfp-opt.on').dataset.pic + ' after the refusal');
  if (box().querySelector('.pfp-opt:disabled')) bad.push('the grid is still locked after the refusal');
  return bad;
});

