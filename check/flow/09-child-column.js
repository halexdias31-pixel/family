check('a role changed in the sheet reaches the screen on the next open, with no sign-out', async () => {
  /* THE WALK: the owner made a parent a client in the sheet; the parent reloaded; no card until they
     signed out and in. Here the phone opens holding a stale `kid` and `myProfile` says `parent`. */
  const kid = { name: 'Mo Learner', personId: 'P-MO', role: 'kid', roles: ['kid'], token: 'tk-mo',
                profile: { first_name: 'Mo', last_name: 'Learner' } };
  /* `say` IS WHAT THE SHEET HOLDS — read at each request, so a journey can change it under the phone. */
  let say = '';
  const reply = b => b.action === 'myProfile'
    ? Object.assign({ success: true, personId: b.personId || 'P-MO', profile: { first_name: 'Mo', last_name: 'Learner' } },
                    say ? { role: say, roles: [say], tutorPending: false } : {})
    : { success: true, messages: [] };
  const open = async role => {
    say = role;
    const b = boot({ reply, before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(kid)); } catch (e) {} } });
    await wait(700);
    return b;
  };
  const bad = [];
  {
    const { w, sent } = await open('parent');
    const t = w.__t, d = w.document;
    if (!sent.some(b => b.action === 'myProfile')) return ['opening the app signed in did not ask myProfile, so nothing could correct a stale role'];
    const u = t.whoami();
    if (!u || u.role !== 'parent' || (u.roles || []).join() !== 'parent') bad.push('the phone kept its stale role after myProfile said parent: ' + JSON.stringify(u && [u.role, u.roles]));
    let kept = null; try { kept = JSON.parse(w.localStorage.getItem('familyUser') || 'null'); } catch (e) {}
    if (!kept || kept.role !== 'parent') bad.push('the corrected role was not kept, so the next open starts stale again');
    try { t.go('students', false, true); } catch (e) {}
    await wait(250);
    if (!d.querySelector('#s-students .kid-manage .kid-add')) bad.push('after the role was corrected there is still no "Manage your child" — the walk\'s sign-out dance is still needed');
  }
  /* AN OLD SERVER SENDS NO ROLE: what the phone had stays. */
  {
    const { w } = await open('');
    const u = w.__t.whoami();
    if (!u || u.role !== 'kid') bad.push('a myProfile with no role in it wiped the role the phone had: ' + JSON.stringify(u && u.role));
  }
  /* AND NOT ONLY SETTINGS: § */
  {
    const { w } = await open('kid');
    const t = w.__t, d = w.document;
    t.DATA().everyone = [{ personId: 'P-EVE', title: 'Eve Everyone', handle: 'eve_kind5', role: 'Student', image: '' }];
    try { t.go('account', false, true); w.paint('account'); } catch (e) { return bad.concat(['drawing the account column threw: ' + e.message]); }
    await wait(150);
    /* YOUR ROLES SAYS "You are Admin" (since 444 the list of everyone is on Business, not drawn while the column is off-screen). */
    const eve = () => !!d.querySelector('#s-account .role-admin');
    if (eve()) return bad.concat(['a student is told they are Admin, so this cannot ask what a role change redraws']);
    say = 'admin';
    w.profileRefresh_();
    await wait(300);
    if ((t.whoami() || {}).role !== 'admin') bad.push('the role on the phone did not follow the sheet to admin');
    else if (!eve()) bad.push('the column on screen when the role changed was not drawn again — it shows the old role until something else repaints it');
  }
  return bad;
});

/* ---------- MANAGE YOUR CHILD IS ONE CARD (docs/history/339) § */
check('461: "Manage your child" lists the children and says how to add one — no form makes a child\'s account', async () => {
  const { w } = boot({ reply: () => ({ success: true }) });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER({ name: 'Pat Parent', personId: 'P-C1', role: 'parent', roles: ['parent'], token: 'tk',
           profile: { first_name: 'Pat', last_name: 'Parent' } });
  try { t.go('students', false, true); w.paint('students'); } catch (e) { return ['drawing Student profiles threw: ' + e.message]; }
  await wait(300);
  const manage = d.querySelectorAll('#s-students .kid-manage');
  if (manage.length !== 1) return ['a parent\'s Student profiles draws ' + manage.length + ' "Manage your child" cards, wanted one'];
  if (!/^Manage your child$/.test(String((manage[0].querySelector(':scope > h3') || {}).textContent || '').trim())) bad.push('the card is not titled "Manage your child"');
  const secs = [...manage[0].querySelectorAll('.kid-sec')].map(x => x.classList.contains('kid-add') ? 'add' : x.classList.contains('kid-list') ? 'list' : '?');
  if (JSON.stringify(secs) !== '["list","add"]') bad.push('"Manage your child" holds ' + JSON.stringify(secs) + ', wanted the children, then how to add one');
  if (d.querySelector('[data-kid-new], [data-do="kid-make"], .kid-make')) bad.push('a form to make a child\'s account is still drawn');
  if (typeof t.ACTIONS['kid-make'] === 'function') bad.push('the kid-make handler is still registered');
  const add = manage[0].querySelector('.kid-add');
  if (!add || !/Add your child/.test(add.textContent) || !/own account/.test(add.textContent) || !/Student profiles?/.test(add.textContent)) bad.push('the add section does not say the child makes their own account and to search on Student profiles');
  t.USER({ name: 'Sam Student', personId: 'P-S1', role: 'student', roles: ['student'], token: 'tk2' });
  try { t.repaint(true); t.go('students', false, true); w.paint('students'); } catch (e) {}
  await wait(200);
  if (d.querySelector('#s-students .kid-manage')) bad.push('a student is offered "Manage your child"');
  return bad;
});

/* ---------- FIND YOUR CHILD BY HANDLE ON THE PEOPLE COLUMN (442) ---------- */
const psBoot_ = async user => {
  const r = boot({ reply: b => b.action === 'findChild'
    ? { success: true, child: String(b.handle) === 'wren_kind43' ? { personId: 'P-K1', first: 'Wren', handle: 'wren_kind43' } : null }
    : { success: true } });
  await wait(300);
  const t = r.w.__t, d = r.w.document;
  t.USER(user);
  t.DATA().tutors = [{ personId: 'P-T1', title: 'Wendy Tutor', handle: 'wendy_bright7', role: 'Tutor' }];
  const draw = () => { t.go('students', false, true); r.w.paint('students'); };
  draw();
  await wait(150);
  const type = async q => { const box = d.querySelector('#s-students [data-psearch]'); box.value = q;
    box.dispatchEvent(new r.w.Event('input', { bubbles: true })); await wait(30); return box; };
  /* RETURN IN THE BOX (770: no Find button). */
  const find = async () => { r.w.psFind_(d.querySelector('#s-students [data-psearch]')); await wait(300); };
  return Object.assign(r, { t, d, draw, type, find, out: () => d.querySelector('#s-students .ps-out') });
};
const PS_PAT = { name: 'Pat Parent', personId: 'P-C1', role: 'client', roles: ['client'], token: 'tk', profile: { first_name: 'Pat', last_name: 'Parent' } };
check('442, 453: Students opens with Find by handle (under an admin\'s "+ Add a student"); each people column has one "+" for an admin, and Business and Student settings none', async () => {
  const { d, w, t } = await psBoot_({ name: 'Hal Admin', personId: 'P-A1', role: 'admin', roles: ['admin'], token: 'tk' });
  try { t.repaint(true); ['biz', 'tutors', 'parents', 'account'].forEach(id => w.paint(id)); } catch (e) {}
  await wait(100);
  /* STAFF HAVE NEEDS HELP ABOVE IT (455), then the "+", so Find by handle is the first page after those. */
  const first = [...d.querySelectorAll('#s-students > .page')].find(pg => !pg.querySelector('.add-card, .help-list'));
  const bad = [];
  if (!d.querySelector('#s-students .page .help-list')) bad.push('an admin\'s Student profiles has no Needs help card');
  if (!first || !first.querySelector('.ps-card')) bad.push('Students does not start with Find by handle');
  if (d.querySelector('#s-account [data-do="person-add"], #s-biz [data-do="person-add"]')) bad.push('"Add a person" is on Student settings or Business');
  ['tutors', 'students', 'parents'].forEach(c => { if (d.querySelectorAll('#s-' + c + ' [data-do="person-add"][data-col="' + c + '"]').length !== 1) bad.push(c + ' does not have one "+" of its own'); });
  return bad;
});
/* ---------- A HAND UP FROM A QUESTION (455) ---------- */
const HELP_KID_ = { name: 'Ada Pupil', personId: 'P-S1', role: 'student', roles: ['student'], rank: 'student', token: 'tk-s1', handle: 'adapupil' };
const HELP_Q_ = { kind: 'question', key: 'q-help', name: 'Q3', marks: 1, row: { row_id: 'Q-HELP-3', paper_id: 'P-HELP', subject: 'Maths', name: 'Help' },
  html: '<p>Work out 12 &divide; 4</p>', answer: '<b>3</b>' };
const helpDraw_ = w => { const d = w.document.createElement('div'); d.className = 'help-probe';
  d.innerHTML = w.questionCard_(HELP_Q_) + w.questionAnsCard_(HELP_Q_); w.document.body.appendChild(d); return d; };
check('455: Help on a question turns that page red and no other (owner, 1 Nov: "just current widget"), rings the bell, says Waiting for help, tells the tutor, and survives a reload until I\'m OK now', async () => {
  const bad = [];
  const r = boot({ before: signedInAs_(HELP_KID_), reply: b => b.action === 'hands' ? { success: true, mine: { personId: 'P-S1', q: 'q-help', at: Date.now() } } : { success: true } });
  await wait(300);
  const box = helpDraw_(r.w);
  const tile = box.querySelector('.qcard .tile[data-do="help-hand"]');
  if (!tile || !/Help/.test(tile.getAttribute('aria-label'))) { bad.push('a question card has no Help tile'); return bad; }
  if (box.querySelectorAll('.qcard .tile[data-do="help-hand"]').length < 2) bad.push('the answer page has no Help tile');
  const rung = [];
  const heldSound = r.w.markSound_;
  r.w.markSound_ = k => rung.push(k);
  r.w.__t.ACTIONS['help-hand'](tile);
  await wait(50);
  r.w.markSound_ = heldSound;
  const cards = [...box.querySelectorAll('.qcard')];
  if (!cards[0] || !cards[0].classList.contains('is-help')) bad.push('Help did not turn the page it was pressed on red');
  if (cards.slice(1).some(c => c.classList.contains('is-help'))) bad.push('Help turned another page of the same question red -- only the page pressed is the child\'s');
  if (rung.join() !== 'help') bad.push('Help rang ' + (rung.length ? JSON.stringify(rung) : 'nothing') + ' -- wanted the one bell, markSound_(\'help\')');
  if (cards.slice(1).some(c => /I’m OK now/.test((c.querySelector('.tile[data-do="help-hand"]') || {}).getAttribute ? c.querySelector('.tile[data-do="help-hand"]').getAttribute('aria-label') : ''))) bad.push('another page\'s Help tile says I’m OK now');
  if (!/Waiting for help/.test(box.textContent)) bad.push('the card does not say Waiting for help');
  const t2 = box.querySelector('.tile[data-do="help-hand"]');
  if (!t2 || !/I’m OK now/.test(t2.getAttribute('aria-label'))) bad.push('the tile did not become "I’m OK now"');
  const sent = r.sent.find(b => b.action === 'raiseHand');
  if (!sent || sent.on !== true || sent.q !== 'q-help') bad.push('the tutor was not told: ' + JSON.stringify(sent));
  let kept = null;
  try { kept = r.w.localStorage.getItem('familyHelpHand'); } catch (e) {}
  if (!kept) { bad.push('the hand was not kept on the device'); return bad; }
  /* A RELOAD: a new app on the same device keeps the card red. */
  const r2 = boot({ before: w => { signedInAs_(HELP_KID_)(w); w.localStorage.setItem('familyHelpHand', kept); },
    reply: b => b.action === 'hands' ? { success: true, mine: { personId: 'P-S1' } } : { success: true } });
  await wait(300);
  const box2 = helpDraw_(r2.w);
  if (box2.querySelectorAll('.qcard.is-help').length !== 1) bad.push('after a reload ' + box2.querySelectorAll('.qcard.is-help').length + ' pages are red, wanted the one');
  r2.w.__t.ACTIONS['help-hand'](box2.querySelector('.tile[data-do="help-hand"]'));
  await wait(50);
  if (box2.querySelector('.qcard.is-help') || /Waiting for help/.test(box2.textContent)) bad.push('I’m OK now did not clear the red');
  const down = r2.sent.filter(b => b.action === 'raiseHand').pop();
  if (!down || down.on !== false) bad.push('putting the hand down was not sent: ' + JSON.stringify(down));
  /* THIRTY MINUTES: a stale hand on the device is down by itself. */
  r2.w.localStorage.setItem('familyHelpHand', JSON.stringify({ q: 'q-help', at: Date.now() - 31 * 60 * 1000 }));
  if (r2.w.helpGet_()) bad.push('a hand 31 minutes old is still up');
  return bad;
});
check('455: Staff see Needs help at the top of the Student column, oldest first, and Done clears it — the child\'s card goes back on her next poll', async () => {
  const bad = [];
  let list = [{ personId: 'P-S2', name: 'Bo P', q: 'Q7', label: 'Q7 algebra', at: Date.now() - 300000 },
              { personId: 'P-S1', name: 'Ada P', q: 'Q3', label: 'Q3 fractions', at: Date.now() - 60000 }];
  const r = boot({ reply: b => {
    if (b.action === 'raiseHand' && b.on === false) { list = list.filter(h => h.personId !== b.for); return { success: true, hands: list }; }
    return b.action === 'hands' ? { success: true, mine: null, hands: list } : { success: true };
  } });
  await wait(300);
  const t = r.w.__t, d = r.w.document;
  t.USER({ name: 'Tia Tutor', personId: 'P-T1', role: 'tutor', roles: ['tutor'], rank: 'staff', token: 'tk-t1', handle: 'tiatutor' });
  t.go('students', false, true); r.w.paint('students');
  await wait(300);
  t.go('students', false, true); r.w.paint('students');
  await wait(50);
  const first = d.querySelector('#s-students .page');
  const card = first && first.querySelector('.help-list');
  if (!card) { bad.push('the Student column does not start with Needs help'); return bad; }
  const who = [...card.querySelectorAll('.help-who')].map(x => x.getAttribute('data-id'));
  if (who.join() !== 'P-S2,P-S1') bad.push('Needs help lists ' + who.join() + ', wanted oldest first P-S2,P-S1');
  if (!/Q7 algebra/.test(card.textContent)) bad.push('the line does not say which question');
  if (!r.sent.some(b => b.action === 'hands')) bad.push('the tutor\'s column never asked who has a hand up');
  const done = card.querySelector('.tile[data-do="help-done"][data-id="P-S2"]');
  if (!done) { bad.push('no Done tile for the first child'); return bad; }
  t.ACTIONS['help-done'](done);
  await wait(100);
  const sent = r.sent.filter(b => b.action === 'raiseHand').pop();
  if (!sent || sent.on !== false || sent.for !== 'P-S2') bad.push('Done did not lower that hand: ' + JSON.stringify(sent));
  if (d.querySelector('#s-account .help-who[data-id="P-S2"]')) bad.push('the helped child is still listed');
  /* THE CHILD'S SIDE: her next poll finds no hand, and her card goes back to normal. */
  const k = boot({ before: w => { signedInAs_(HELP_KID_)(w); w.localStorage.setItem('familyHelpHand', JSON.stringify({ q: 'q-help', at: Date.now() })); },
    reply: b => b.action === 'hands' ? { success: true, mine: null } : { success: true } });
  await wait(300);
  const box = helpDraw_(k.w);
  if (!box.querySelector('.qcard.is-help')) bad.push('the child\'s card was not red before the poll');
  await k.w.helpTick_();
  await wait(20);
  if (box.querySelector('.qcard.is-help')) bad.push('after the tutor\'s Done the child\'s card is still red on her next poll');
  return bad;
});
check('442: a parent finds their child by the exact handle — first name only, and an "Add as my child" tile', async () => {
  const { sent, type, find, out } = await psBoot_(PS_PAT), bad = [];
  await type('@wren_kind43');
  await find();
  const ask = sent.find(b => b.action === 'findChild');
  if (!ask || ask.handle !== 'wren_kind43') bad.push('Find posted ' + JSON.stringify(ask) + ', wanted findChild for wren_kind43, @ dropped');
  const hit = out() && out().querySelector('.ps-hit');
  if (!hit || !/Wren/.test(hit.textContent) || !/@wren_kind43/.test(hit.textContent)) bad.push('the found child\'s card is not drawn: ' + JSON.stringify(out() && out().textContent));
  if (hit && /Parent|Exists/.test(hit.textContent)) bad.push('the found child\'s card shows a surname');
  if (!hit || !hit.querySelector('.tile[data-do="ps-add-child"][data-handle="wren_kind43"]')) bad.push('the found child has no "Add as my child" tile');
  return bad;
});
check('442: a prefix never reveals a child — public cards only, and the server answers nobody for a part handle', async () => {
  const { sent, type, find, out } = await psBoot_(PS_PAT), bad = [];
  await type('w');
  if (!out() || !/Wendy/.test(out().textContent)) bad.push('a prefix did not find the public tutor @wendy_bright7');
  if (/Wren/.test(out().textContent)) bad.push('a prefix showed a child');
  await type('wren');
  await find();
  if (!sent.some(b => b.action === 'findChild' && b.handle === 'wren')) bad.push('Find did not ask for "wren"');
  if (/Wren/.test(out().textContent) || out().querySelector('[data-do="ps-add-child"]')) bad.push('a part handle drew a child');
  if (!/Nobody has that handle/.test(out().textContent)) bad.push('a handle nobody has is not said: ' + JSON.stringify(out().textContent));
  return bad;
});
check('442: "Add as my child" sends the family request by handle through claimChild', async () => {
  const { sent, t, d, type, find, out } = await psBoot_(PS_PAT), bad = [];
  await type('wren_kind43');
  await find();
  const tile = out().querySelector('[data-do="ps-add-child"]');
  if (!tile) return ['no tile to press'];
  sent.length = 0;
  t.ACTIONS['ps-add-child'](tile);
  await wait(300);
  const ask = sent.find(b => b.action === 'claimChild');
  if (!ask || ask.handle !== 'wren_kind43' || ask.personId !== 'P-C1' || ask.firstName) bad.push('the tile posted ' + JSON.stringify(ask) + ', wanted claimChild with the handle alone');
  if (!/Asked/.test(toastOf_(d))) bad.push('the tile said ' + JSON.stringify(toastOf_(d)));
  return bad;
});
check('442: a student sees the search but no Find and no tile, and posts no lookup', async () => {
  const { sent, t, d, w, type } = await psBoot_({ name: 'Sam Student', personId: 'P-S1', role: 'student', roles: ['student'], token: 'tk2' }), bad = [];
  if (!d.querySelector('#s-students .ps-card')) bad.push('a student has no search');
  if (d.querySelector('[data-do="ps-find"]')) bad.push('a Find button is back on the search card (770: the owner, "remove find button")');
  await type('wren_kind43');
  w.psFind_(d.querySelector('#s-students [data-psearch]'));
  await wait(200);
  if (sent.some(b => b.action === 'findChild')) bad.push('a student posted findChild');
  if (d.querySelector('#s-students [data-do="ps-add-child"]')) bad.push('a student sees "Add as my child"');
  return bad;
});

/* ---------- 770: NO FIND BUTTON, NO COLUMN NAMED, SIGN IN ONE UNIT, DELETED MOVES ---------- */
check('770: the search card has no Find button; no card is titled with a column\'s name; Sign in is acct:signed-in; Deleted moves', async () => {
  const { d, w, t } = await psBoot_({ name: 'Hal Admin', personId: 'P-A1', role: 'admin', roles: ['admin'], token: 'tk' }), bad = [];
  try { t.repaint(true); ['tutors', 'students', 'parents', 'account', 'family', 'staff', 'biz'].forEach(id => w.paint(id)); } catch (e) {}
  await wait(150);
  if (!d.querySelector('#s-students .ps-card[data-ps-col="students"]')) bad.push('Students has no search card');
  if (d.querySelector('[data-do="ps-find"]')) bad.push('a Find button is on a search card');
  if (d.querySelector('.ps-card .card-say')) bad.push('the search card carries a sentence above its bar (its placeholder is its label, 469)');
  const names = new Set((t.TABS || []).map(x => String(x.label || x.id).trim().toLowerCase()));
  /* AN EMPTY LIST'S CARD (`emptyCard_`, 414) keeps its title by its own rule. */
  d.querySelectorAll('.screen .card:not(.is-empty) > h3').forEach(h => { if (names.has(h.textContent.trim().toLowerCase())) bad.push('a card is titled with a column\'s name: ' + h.textContent.trim()); });
  if (w.cardIdOf_(w.deletedCard_()) !== 'biz:deleted') bad.push('the Deleted card is not the registered card biz:deleted');
  const row = w.cardAdminRow_('biz:deleted', 'biz', false);
  /* LAYOUT EDITING IS OFF (880): then no card, Deleted included, draws an arranging row; on, Deleted moves like any card. */
  if (!row) { if (d.querySelector('.card-admin [data-do="lay-c-move"]')) bad.push('layout editing is off and a card still draws move tiles'); }
  else if (!/lay-c-move/.test(row)) bad.push('the Deleted card has no move tiles');
  if (/lay-c-del/.test(row)) bad.push('the Deleted card can be deleted');
  t.USER(null);
  const out = w.studentSetPages_();
  if (w.cardIdOf_(out[0]) !== 'acct:signed-in') bad.push('signed out, the Sign in card is ' + JSON.stringify(w.cardIdOf_(out[0])) + ', not acct:signed-in — moved signed in, it would jump back');
  return bad;
});

/* ---------- MANAGE YOUR CHILD: THE CHILDREN ON IT, NEW PIN BESIDE EACH, LINKING ONE, AND THE HELD STATE § */
check('"Manage your child" lists the children linked to you with New PIN beside each, points a linking parent to People, says when there are none, and holds both forms while your address waits', async () => {
  const FRESH = ['5', '1', '7', '3'].join('');
  const { w, sent } = boot({ reply: b => b.action === 'resetPin' ? { success: true, first: 'Wren', handle: 'wren_kind43', pin: FRESH }
    : b.action === 'claimChild' ? { success: true } : { success: true } });
  await wait(300);
  /* `DATA` IS ASKED FOR EACH TIME — `load()` (which a link asked for calls) replaces it whole. */
  const t = w.__t, d = w.document, bad = [];
  t.USER({ name: 'Pat Parent', personId: 'P-C1', role: 'client', roles: ['client'], token: 'tk', profile: { first_name: 'Pat', last_name: 'Parent' } });
  t.DATA().familyFor = 'P-C1';
  t.DATA().family = [
    { personId: 'P-K1', title: 'Wren', relation: 'child', handle: 'wren_kind43', image: 'pfp:fox' },
    { personId: 'P-K2', title: 'Maximilian', relation: 'child', handle: 'maximilian_steady42', image: '' },
    { personId: 'P-PP', title: 'Gran Parent', relation: 'parent', handle: 'gran_kind11', image: '' },
  ];
  const draw = () => { try { t.go('students', false, true); w.paint('students'); } catch (e) { bad.push('drawing settings threw: ' + e.message); } };
  draw();
  await wait(200);
  const card = () => d.querySelector('#s-students .kid-manage');
  if (!card()) return bad.concat(['a parent\'s Settings has no "Manage your child"']);
  const rows = () => [...card().querySelectorAll('.kid-list .kid-row')];
  const names = rows().map(r => (r.querySelector('.kid-who b') || {}).textContent + ' ' + (r.querySelector('.prof-handle') || {}).textContent);
  if (JSON.stringify(names) !== JSON.stringify(['Wren @wren_kind43', 'Maximilian @maximilian_steady42'])) bad.push('"Manage your child" lists ' + JSON.stringify(names) + ', wanted the two children and not the parent\'s own parent');
  const pins = rows().map(r => r.querySelector('.tile[data-do="kid-pin"]'));
  if (pins.some(x => !x) || pins.map(x => x.dataset.id).join(',') !== 'P-K1,P-K2') bad.push('not every child on the card has a New PIN tile naming them');
  if (rows()[0] && !rows()[0].querySelector('.kid-face svg.pfp-art')) bad.push('Wren\'s face on the list is not her fox');
  /* NEW PIN, FROM THE CARD: asks first, then `resetPin` for that child, then the slip. */
  if (pins[0]) {
    sent.length = 0;
    t.ACTIONS['kid-pin'](pins[0]);
    await wait(80);
    if (sent.some(b => b.action === 'resetPin')) bad.push('New PIN on the card reset the PIN before asking');
    const yes = d.querySelector('.kid-pin-ask [data-do="kid-pin-go"]');
    if (!yes) bad.push('New PIN on the card opened nothing under the row to say yes in');
    else {
      t.ACTIONS['kid-pin-go'](yes);
      await wait(300);
      const post = sent.find(b => b.action === 'resetPin');
      if (!post || post.targetId !== 'P-K1') bad.push('saying yes posted ' + JSON.stringify(post) + ', wanted resetPin for Wren');
      if (!d.querySelector('.kid-pin-ask .pin-slip') || d.querySelector('.kid-pin-ask .pin-slip').textContent.indexOf(FRESH) === -1) bad.push('the new PIN was not shown on the slip');
    }
  }
  /* LINKING ONE WHO HAS AN ACCOUNT moved to People (442): the add section only points there, no boxes. */
  const add = card().querySelector('.kid-add');
  if (!add || card().querySelector('.kid-make')) bad.push('"Manage your child" is missing the add section, or still has a make one');
  else if (add.querySelector('input, button') || !/handle/.test(add.textContent)) bad.push('the add section still has a form, or does not say to search the handle');
  /* NONE LINKED, THE PAYLOAD IN: one line saying so, and both forms. */
  await wait(300);
  t.DATA().familyFor = 'P-C1';
  t.DATA().family = [];
  draw();
  await wait(150);
  if (!card() || !/No child linked yet/.test(card().textContent) || card().querySelectorAll('.kid-row').length) bad.push('with no child linked the card does not say so');
  if (!card() || !card().querySelector('.kid-add')) bad.push('with no child linked the card lost a section');
  /* HELD: your address waiting — the held sentence where the forms were, and Wren listed with no New PIN. */
  t.DATA().family = [{ personId: 'P-K1', title: 'Wren', relation: 'child', handle: 'wren_kind43', image: '' }];
  t.whoami().pendingEmail = 'pat@example.org';
  draw();
  await wait(150);
  if (!card() || !card().querySelector('.kid-held') || card().querySelector('[data-kid-new], [data-kid]')) bad.push('with the address waiting the card still offers a form, or does not say to open the link');
  if (!card() || card().querySelectorAll('.kid-row').length !== 1 || card().querySelector('[data-do="kid-pin"]')) bad.push('with the address waiting the card does not list Wren, or offers a New PIN the server refuses');
  if (d.querySelectorAll('#s-students .kid-manage').length !== 1) bad.push('the held state is not the same one card');
  /* A LIST STAMPED FOR SOMEBODY ELSE IS NOBODY'S. */
  t.whoami().pendingEmail = '';
  t.DATA().familyFor = 'P-OTHER';
  draw();
  await wait(150);
  if (card() && card().querySelectorAll('.kid-row').length) bad.push('a family list stamped for somebody else was drawn as Pat\'s children');
  /* A STUDENT HAS NOBODY TO MANAGE. */
  t.USER({ name: 'Sam Student', personId: 'P-S1', role: 'student', roles: ['student'], token: 'tk2' });
  try { t.repaint(true); } catch (e) {}
  draw();
  await wait(150);
  if (card()) bad.push('a student is drawn "Manage your child"');
  return bad;
});

/* ---------- SETTINGS NO LONGER DRAWS WHAT MOVED, AND A RETURNING VISITOR LANDS ON A REAL PAGE § */
check('Settings no longer draws the figure, the handle, the library cards or two child cards, and a visitor whose page was further down lands on a real page', async () => {
  const { w } = boot({ payload: Object.assign(payload(), { profileFields: { 'About you': ['first_name', 'last_name', 'headline', 'photo'],
    'Library cards': LIB_FIELDS_ } }) });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk', handle: 'testadmin',
           profile: { first_name: 'Test', last_name: 'Admin', headline: 'Runs the place', phone_cc: '+44' } });
  try { t.go('account', false, true); t.repaint(true); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(200);
  const pages = [...d.querySelectorAll('#s-account > .page')];
  /* 469: YOUR FIGURE'S OWN EDITING CARD IS HERE NOW; the old Settings page of that name is what must not come back. */
  const heads = pages.filter(p => !p.querySelector('.card-ed')).map(p => String((p.querySelector('h3') || {}).textContent || '').trim());
  try { w.paint('students'); } catch (e) {}
  const famHeads = [...d.querySelectorAll('#s-students > .page')].map(p => String((p.querySelector('h3') || {}).textContent || '').trim());
  ['Your figure', 'Library cards', 'Make your child\'s account', 'Add your child'].forEach(h => { if (heads.indexOf(h) !== -1) bad.push('Settings still has a "' + h + '" page'); });
  /* MANAGE YOUR CHILD IS ON PARENT SINCE 444, once. */
  if (heads.indexOf('Manage your child') !== -1 || famHeads.filter(h => h === 'Manage your child').length !== 1) bad.push('"Manage your child" is not on Parent once: You ' + JSON.stringify(heads) + ', Parent ' + JSON.stringify(famHeads));
  const setPg = pages.filter(p => p.querySelector('.me-form, #pin-now, .roles-card, .notify-card') && !p.querySelector('.card-ed, .is-prof'));
  if (setPg.some(p => p.querySelector('.av-card, .handle-shown, .lib-face, .pfp'))) bad.push('Settings still draws the figure, the handle, a library card or the picture');
  const n = t.pageCount('account');
  if (n !== pages.length) bad.push('the pager counts ' + n + ' Settings pages and the column draws ' + pages.length);
  /* THE OLD LAST INDEX, AND A REPAINT. `PAGE` reaches a journey as a getter (the `__t` hook). */
  const P = typeof t.PAGE === 'function' ? t.PAGE() : t.PAGE;
  P.account = 99;   /* past any last page, however many cards the column grows (562) */
  try { t.repaint(true); } catch (e) { bad.push('repainting threw: ' + e.message); }
  await wait(200);
  const at = P.account;
  const on = d.querySelector('#s-account > .page.on');
  if (!(at >= 0 && at < t.pageCount('account'))) bad.push('PAGE.account is ' + at + ' of ' + t.pageCount('account') + ' pages — a visitor would land on nothing');
  const all = [...d.querySelectorAll('#s-account > .page')];
  if (!on || on !== all[all.length - 1]) bad.push('a visitor who was on the old last page is not on the last page there is');
  return bad;
});

/* A PARENT'S NEW PIN IS ON "MANAGE YOUR CHILD" AND NOWHERE ELSE (the review of docs/history/339): § */
check('New PIN is on a parent\'s "Manage your child" and not on the child\'s card on the You column, and on an admin\'s people; it asks first and shows the slip once', async () => {
  const FRESH = ['4', '8', '2', '9'].join('');
  const { w, sent } = boot({ reply: b => b.action === 'resetPin'
    ? { success: true, name: 'Kit Parent', first: 'Kit', handle: 'kit_kind41', pin: FRESH } : { success: true } });
  await wait(400);
  if (!w.__t.accountPages) return ['accountPages_ is not exported — cannot check the account column'];
  const t = w.__t, d = w.document, D = t.DATA(), bad = [];
  const pageOf = name => t.accountPages().find(h => h.indexOf('>' + name + '<') !== -1) || '';

  t.USER({ name: 'Pat Parent', personId: 'P-P', role: 'client', roles: ['client'], token: 'tk' });
  D.family = [{ personId: 'P-K', title: 'Kit Parent', relation: 'child', handle: 'kit_kind41', image: '' }];
  D.familyFor = 'P-P';
  const kit = pageOf('Kit P.');  // a parent sees first name + initial (19b)
  if (!kit) bad.push('a parent\'s child is not on the You column');
  if (/data-do="kid-pin"/.test(kit)) bad.push('a parent\'s child card on the You column still carries New PIN — it is "Manage your child"\'s');
  try { t.go('account', false, true); w.paint('account'); } catch (e) { bad.push('drawing Settings threw: ' + e.message); }
  await wait(150);
  if (d.querySelector('#s-account [data-do="kid-pin"]')) bad.push('the You column draws a New PIN tile for a parent');
  try { t.go('students', false, true); w.paint('students'); } catch (e) {}
  await wait(100);
  const tile = d.querySelector('#s-students .kid-manage [data-do="kid-pin"][data-id="P-K"]');
  if (!tile) return bad.concat(['no New PIN tile for Kit on "Manage your child" to press']);
  if (!tile.classList.contains('tile')) bad.push('New PIN is not a tile — a THING has tiles');
  sent.length = 0;
  t.ACTIONS['kid-pin'](tile);
  await wait(80);
  if (!d.querySelector('.kid-pin-ask')) return bad.concat(['pressing New PIN opened nothing to confirm in']);
  if (sent.some(b => b.action === 'resetPin')) bad.push('pressing New PIN reset the PIN before asking');
  const go_ = d.querySelector('.kid-pin-ask [data-do="kid-pin-go"]');
  if (!go_) return bad.concat(['the New PIN ask has no button to say yes with']);
  t.ACTIONS['kid-pin-go'](go_);
  await wait(300);
  const post = sent.find(b => b.action === 'resetPin');
  if (!post || post.targetId !== 'P-K') bad.push('saying yes posted ' + JSON.stringify(post) + ' — wanted resetPin for P-K');
  const slip = d.querySelector('.kid-pin-ask .pin-slip');
  if (!slip) bad.push('after the new PIN there is no slip under the row');
  else if (!/@kit_kind41/.test(slip.textContent) || slip.textContent.indexOf(FRESH) === -1) bad.push('the slip does not show the handle and the new PIN: ' + JSON.stringify(slip.textContent.replace(/\s+/g, ' ')));
  /* A PARENT'S OWN PARENT IS NOT THEIRS TO RESET — and a student's parent card carries no tile. */
  t.USER({ name: 'Kit Parent', personId: 'P-K', role: 'student', roles: ['student'], token: 'tk3' });
  D.family = [{ personId: 'P-P', title: 'Pat Parent', relation: 'parent', handle: 'pat_kind40', image: '' }];
  D.familyFor = 'P-K';
  if (/data-do="kid-pin"/.test(pageOf('Pat P.'))) bad.push('a student\'s parent card carries a New PIN tile');
  delete D.family; delete D.familyFor;

  /* AN ADMIN: everybody who is not staff, "no handle yet" where there is none, and no tile without an id. */
  t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk2' });
  D.everyone = [
    { personId: 'P-E1', title: 'Evie Nohandle', handle: '', role: 'Student', image: '' },
    { personId: 'P-E2', title: 'Carl Handled', handle: 'carl_kind32', role: 'Client', image: '' },
    { personId: '', title: 'Noa Noid', handle: 'noa_kind64', role: 'Student', image: '' },
  ];
  // an admin sees first name + initial too (owner, 9 Nov)
  const evie = pageOf('Evie N.'), carl = pageOf('Carl H.'), noa = pageOf('Noa N.');
  if (!/no handle yet/.test(evie)) bad.push('the admin is not told a child has no handle yet');
  if (/no handle yet/.test(carl)) bad.push('a person with a handle is said to have none');
  if (!/data-do="kid-pin"/.test(evie) || !/data-do="kid-pin"/.test(carl)) bad.push('an admin\'s people card has no New PIN tile');
  if (!/data-do="msg-open"/.test(evie)) bad.push('New PIN pushed Message off the admin\'s card');
  if (/data-do="kid-pin"/.test(noa)) bad.push('a row with no id was given a New PIN tile that can name nobody to the server');
  delete D.everyone;
  t.USER(null);
  return bad;
});

check('Forgotten your PIN? says what the server said, including that nobody can be written to', async () => {
  const { w } = boot({ reply: b => b.action === 'forgotPin'
    ? (b.who === 'lee_kind42'
       ? { error: 'We have no email for this account, so we could not send a new PIN. Ask your parent or your tutor — they can give you one straight away.', why: 'no-inbox' }
       : { success: true, message: 'A new PIN is on its way to your parent\'s inbox. Your old PIN still works until you use the new one.' })
    : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null); t.go('account', false, true);
  await wait(120);
  const box = d.getElementById('in-name'), tile = d.querySelector('#s-account [data-do="forgot-pin"]');
  if (!box || !tile) return ['the sign-in card has no name box or no forgot-PIN tile'];
  box.value = 'lee_kind42';
  t.ACTIONS['forgot-pin'](tile);
  await wait(300);
  let said = String((d.getElementById('toast') || {}).textContent || '');
  if (!/no email for this account/i.test(said)) bad.push('a child nobody can be written to was told ' + JSON.stringify(said));
  box.value = '@kit_kind41';
  t.ACTIONS['forgot-pin'](d.querySelector('#s-account [data-do="forgot-pin"]') || tile);
  await wait(300);
  said = String((d.getElementById('toast') || {}).textContent || '');
  if (!/old PIN still works/i.test(said)) bad.push('the sent case toasted ' + JSON.stringify(said) + ' — not the server\'s sentence');
  return bad;
});

check('each stage tick takes the date it actually happened on', async () => {
  /* ASKED FOR AS *"The tick boxes have a date for when it got requested. When other things get ticked they should also have a date."* The dates were already on the § */
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t || typeof t.stageRows !== 'function') return ['stageRows_ is not exported, so the dates cannot be checked — not a pass'];
  /* REACHED, NOT COUNTED. § */
  if (!Array.isArray(t.JOB_STAGES) || !t.JOB_STAGES.length
      || t.JOB_STAGES.some(x => !x || !x.row || typeof x.is !== 'function')) {
    return ['JOB_STAGES is not the list of rows the receipt is built from — not a pass'];
  }
  const bad = [];
  const log = [
    { at: '22/09/2026', actor: 'A', role: 'client', action: 'Request', target: '', message: '' },
    { at: '23/09/2026', actor: 'B', role: 'client', action: 'Request', target: '', message: '' },
    { at: '24/09/2026', actor: 'A', role: 'client', action: 'Accept',  target: '', message: '' },
    { at: '25/09/2026', actor: 'B', role: 'client', action: 'Accept',  target: '', message: '' },
    { at: '26/09/2026', actor: 'A', role: 'client', action: 'Confirm', target: '', message: '' },
    { at: '28/09/2026', actor: 'B', role: 'client', action: 'Confirm', target: '', message: '' },
  ];
  /* BOTH SESSION DATES IN THE PAST, so all four tick and all four have a date to be wrong about. */
  const job = { kind: 'session', createdAt: '21/09/2026', events: log,
                startDate: '01/10/2025', endDate: '05/11/2025',
                slots: [{ n: 1, client: 'A', status: 'Booked' }, { n: 2, client: 'B', status: 'Booked' }],
                tutorSlots: [] };
  const got = t.stageRows(job);
  const by = {};
  got.forEach(r => { by[r.k] = r; });
  /* `Applied for` TAKES THE ASKING'S OWN DATE on a booking with no `Apply` event, which is every booking today — see `JOB_STAGES`. § */
  const want = { Requested: '21/09/26', 'Applied for': '21/09/26',
                 Accepted: '25/09/26', Paid: '26/09/26' };
  ['Started', 'Completed'].forEach(k => { if (by[k]) bad.push('a "' + k + '" status line is still drawn (owner, 8 Nov: four lines)'); });
  Object.keys(want).forEach(k => {
    const r = by[k];
    if (!r) { bad.push('no "' + k + '" row at all'); return; }
    if (!r.tick) { bad.push('"' + k + '" is not ticked on a job where it plainly happened'); return; }
    if (r.v !== want[k]) bad.push('"' + k + '" is dated ' + JSON.stringify(r.v) + ', not ' + JSON.stringify(want[k]));
  });

  /* THE WAITING LIST WANTS THE LAST `Confirm`, because its own predicate wants every seat. */
  const list = t.stageRows(Object.assign({}, job, { kind: 'waitlist', maxKids: 2 }));
  const paid = list.find(r => r.k === 'Paid');
  if (!paid || !paid.tick) bad.push('a full waiting list does not tick Paid');
  else if (paid.v !== '28/09/26') {
    bad.push('a full waiting list is dated Paid ' + JSON.stringify(paid.v) + ', not "28/09/26" — '
             + 'it needs every seat, so the LAST Confirm is the one that filled it');
  }

  /* AND A STAGE BELOW AN EMPTY BOX CARRIES NOTHING, tick or date. § */
  /* ---------- ASKED AS THE CHAIN RATHER THAN AS A LIST OF ROW NAMES § */
  const part = t.stageRows(Object.assign({}, job, {
    slots: [{ n: 1, client: 'A', status: 'Booked' }, { n: 2, client: 'B', status: 'Waiting' }] }));
  const broke = part.findIndex(r => !r.tick);
  if (broke === -1) bad.push('one seat is still Waiting and every stage ticks anyway');
  else part.slice(broke).forEach(r => {
    if (r.tick) bad.push('"' + r.k + '" ticks below the unticked "' + part[broke].k + '", so the chain is broken');
    if (r.v) bad.push('"' + r.k + '" carries the date ' + JSON.stringify(r.v) + ' with no tick');
  });

  /* A JOB WITH NO LOG DRAWS THE TICK AND NOTHING ELSE — never a nearby date, which on a document
     somebody keeps is the `cost: 0` shape. */
  const bare = t.stageRows(Object.assign({}, job, { events: [], createdAt: '' }));
  const acc = bare.find(r => r.k === 'Accepted');
  if (!acc || !acc.tick) bad.push('a job with no event log stops ticking Accepted');
  else if (acc.v) bad.push('a job with no event log dates Accepted ' + JSON.stringify(acc.v));
  return bad;
});

check('the week says how many boxes are ticked, once, in the column that multiplies', async () => {
  /* ---------- REPORTED AS *"4 boxes are ticked. it should say times 4 on multiplier column"* (525) § */
  /* A TERM STILL TO COME, so the card prices whatever today is: six weeks from next Monday. */
  const dmy = t => { const d = new Date(t); return String(d.getDate()).padStart(2, '0') + '/'
    + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear(); };
  const mon = new Date(); mon.setHours(0, 0, 0, 0); mon.setDate(mon.getDate() + 7 + ((8 - mon.getDay()) % 7));
  const sun = mon.getTime() + (6 * 7 - 1) * 864e5;
  const pl = payload();
  pl.intervals = [Object.assign({}, pl.intervals[0], { rel: 'Next', term: 'Ahead', label: 'Ahead', weeks: 6,
    startDate: dmy(mon), endDate: dmy(sun), opensOn: dmy(mon), closesOn: dmy(sun), lastSun: dmy(sun) })];
  const { w } = boot({ payload: pl });
  await wait(300);
  if (!w.__t.paper) return ['bookBreakdown is not exported — cannot read the card'];
  const B = w.__t.BOOKING;
  const bad = [];
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.how = 'A session of your own'; B.subjects = ['Maths']; B.level = 'GCSE'; B.n = '1';
  B.loc = 'Colliers Wood Library'; B.hosting = 'No — we book the room'; B.interval = ['Ahead'];
  const doc = h => { const d = w.document.createElement('div'); d.innerHTML = h; return d; };
  const pounds = t => parseFloat(String(t || '').replace(/[^\d.]/g, '')) || 0;
  const cell = (r, c) => ((r && r.querySelector('.' + c)) || {}).textContent || '';
  /* ONE TO FOUR BOXES, the last two on a second day — the owner's four were two days of two. */
  const ticks = ['m13', 'm14', 'w12', 'w13'];
  for (let n = 1; n <= 4; n++) {
    B.slots = ticks.slice(0, n);
    const d = doc(String(w.__t.paper() || ''));
    const days = [...d.querySelectorAll('.bk-row.bk-wk')];
    if (days.length !== 7) { bad.push(n + ' ticked: the card draws ' + days.length + ' day rows, not 7'); continue; }
    const said = days.map(r => cell(r, 'bk-m').trim());
    const want = ['', '', '', '', '', '', '× ' + n];
    if (JSON.stringify(said) !== JSON.stringify(want)) {
      bad.push(n + ' box(es) ticked reads ' + JSON.stringify(said) + ' down the week, wanted ' + JSON.stringify(want));
    }
    const spec = w.__t.spec ? w.__t.spec() : null;
    if (spec && Number(spec.hoursPerWeek) !== n) bad.push(n + ' ticked and the price is built on ' + spec.hoursPerWeek + ' hours a week');
    /* AND THE TOTAL IS THE COLUMN READ DOWN: the hourly figure above the week × N × the term's weeks. */
    const rows = [...d.querySelectorAll('.bk-row')];
    const at = rows.indexOf(days[0]);
    const hourly = rows.slice(0, at).reverse().find(r => /\d/.test(cell(r, 'bk-t')));
    const term = rows.find(r => cell(r, 'bk-k').trim() === 'Term');
    const total = d.querySelector('.rc-total:not(.rc-more) .bk-t');
    const weeks = pounds(cell(term, 'bk-m'));
    if (!hourly || !term || !total || !weeks) {
      bad.push(n + ' ticked: no hourly figure above the week, Term multiplier or total to add up ('
               + [!!hourly, !!term, !!total, weeks].join(', ') + ')');
      continue;
    }
    const sum = Math.round(pounds(cell(hourly, 'bk-t')) * n * weeks * 100) / 100;
    if (Math.abs(sum - pounds(total.textContent)) > 0.005) {
      bad.push(n + ' ticked: ' + cell(hourly, 'bk-t') + ' × ' + n + ' × ' + weeks + ' is £' + sum.toFixed(2)
               + ' and the card totals ' + total.textContent.trim());
    }
  }
  /* AND THE RECEIPT'S WEEK IS THE SAME RULE: two days of two hours is × 4 on its last row. */
  if (w.__t.jobRows) {
    const jr = w.__t.jobRows({ id: 'J1', jobId: 'J1', subject: 'Maths', weekday: 'Monday, Wednesday',
      time: '13:00', hours: 2, dates: '' }).filter(r => r.strip);
    const js = jr.map(r => r.mul || '');
    if (jr.length === 7 && JSON.stringify(js) !== JSON.stringify(['', '', '', '', '', '', '× 4'])) {
      bad.push('a saved job of two days of two hours reads ' + JSON.stringify(js) + ' down its week, wanted × 4 once');
    }
  }
  return bad;
});

check('the dates row says how many dates it lists', async () => {
  /* ---------- ASKED FOR AS A MULTIPLIER FOR THE NUMBER OF DATES § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.jobRows) return ['jobRows is not exported — cannot read the receipt'];
  const bad = [];
  const dates = of => (w.__t.jobRows({ id: 'J1', jobId: 'J1', subject: 'Maths', dates: of })
    .filter(r => r.k === 'Dates')[0] || {});

  const six = dates('06/10/26, 13/10/26, 20/10/26, 27/10/26, 03/11/26, 10/11/26');
  if (six.mul !== '\u00d7 6') {
    bad.push('six dates read ' + JSON.stringify(six.mul || '') + ' in the multiplier column');
  }
  if (String(six.v || '').split(',').length !== 6) {
    bad.push('the row lists ' + String(six.v || '').split(',').length + ' dates and counts 6');
  }
  const one = dates('06/10/26');
  if (one.mul) bad.push('one date reads ' + JSON.stringify(one.mul) + ' rather than nothing');
  const none = dates('');
  if (none.mul) bad.push('no dates reads ' + JSON.stringify(none.mul) + ' rather than nothing');
  return bad;
});

check('one ticked term prices one term', async () => {
  /* ---------- REPORTED AS *"why is it coming out to so much?"* § */
  const twice = payload();
  const one = twice.intervals[0];
  twice.intervals = [one, Object.assign({}, one, { startDate: '01/09/2027', endDate: '18/10/2027',
    lastSun: '18/10/2027', rel: 'Next year' })];
  const { w } = boot({ payload: twice });
  await wait(300);
  if (!w.__t.spec) return ['bookSpec is not exported — cannot check the term windows'];
  const bad = [];

  /* THE STEP MUST NOT OFFER THE NAME TWICE EITHER. Two identical buttons is not a choice anybody
     can make, and it is the half a person sees before the price is ever wrong. */
  const st = (w.__t.STEPS || []).filter(x => x.id === 'interval')[0];
  if (!st) bad.push('no interval step — cannot check what the term question offers');
  else {
    const offered = st.options();
    if (offered.length !== new Set(offered.map(x => String(x).toLowerCase())).size) {
      bad.push('the term question offers ' + JSON.stringify(offered)
             + ' — one name, two buttons');
    }
  }

  const B = w.__t.BOOKING;
  B.kind = 'Instant class'; B.subjects = ['Maths']; B.level = 'GCSE';
  B.interval = ['Autumn 1']; B.n = '1'; B.slots = ['m13', 'm14'];
  const spec = w.__t.spec();
  if ((spec.windows || []).length !== 1) {
    bad.push('one ticked term opened ' + (spec.windows || []).length + ' windows: '
           + JSON.stringify(spec.windows));
  }
  if (spec.interval !== 'Autumn 1') {
    bad.push('the Term row reads ' + JSON.stringify(spec.interval)
           + ' for one ticked term');
  }
  /* AND THE SESSIONS ARE INSIDE THAT ONE TERM, which is the thing the report was actually about: § */
  if (w.__t.price) {
    const L = w.__t.price() || {};
    const out = (L.sessionDates || []).filter(d => d.getFullYear() !== 2026);
    if (out.length) {
      bad.push(out.length + ' of ' + (L.sessionDates || []).length
             + ' sessions fall outside the ticked term: '
             + out.map(d => d.getFullYear()).join(', '));
    }
  }
  return bad;
});

check('booking seat cap: the smaller of tutor and place, home and online hold 4, a tutor with none set holds 1, past the cap greyed not hidden', async () => {
  /* OWNER'S RULE (7 Nov): max seats = min(tutor, place); online and the client's house hold 4. */
  const { w } = boot();
  await wait(300);
  if (!w.__t.seatLimits || !w.__t.STEPS) return ['seatLimits is not exported — cannot check the cap'];
  const bad = [];
  const B = w.__t.BOOKING, lim = w.__t.seatLimits;
  const st = w.__t.STEPS.filter(x => x.id === 'n')[0];
  if (!st) return ['the form has no seats step called `n`'];
  if (lim(null, null, 'Client House').max !== 4) bad.push('home holds ' + lim(null, null, 'Client House').max + ', not 4');
  if (lim(null, null, 'Online').max !== 4) bad.push('online holds ' + lim(null, null, 'Online').max + ', not 4');
  if (lim(null, null, 'Client House').min !== lim(null, null, 'Client House').max) bad.push('home does not take every seat: floor ' + lim(null, null, 'Client House').min);
  if (lim(null, { title: 'T', maxStudents: 2 }, 'Client House').max !== 2) bad.push('a tutor holding 2 at home is not capped at 2');
  if (lim(null, { title: 'T', maxStudents: 9 }, 'Client House').max !== 4) bad.push('a tutor holding 9 at home is not capped at the 4 the house holds');
  if (lim(null, { title: 'T' }, 'Client House').max !== 1) bad.push('a tutor with no capacity set does not hold 1');
  if (lim({ label: 'Big room', max: 10 }, { title: 'T', maxStudents: 6 }, 'Big room').max !== 6) bad.push('a venue of 10 with a tutor of 6 is not capped at 6');
  if (lim({ label: 'Small', max: 3 }, null, 'Small').max !== 3) bad.push('No preference at a room of 3 is not capped by the room');
  B.tutor = 'No preference'; B.loc = 'Client House';
  const home = st.options();
  if (home.length !== 4) bad.push('the seats list is not four choices at home: ' + JSON.stringify(home));
  if (!st.off) bad.push('the seats step cannot grey a choice');
  else {
    if (st.off('4')) bad.push('4 seats at home is greyed: ' + st.off('4'));
    const D = w.__t.DATA(); D.tutors = (D.tutors || []).concat([{ title: 'Cap Two', maxStudents: 2 }]);
    B.tutor = 'Cap Two';
    const two = st.options();
    if (two.length !== 4) bad.push('a tutor holding 2 hides choices instead of greying: ' + JSON.stringify(two));
    if (!st.off('3')) bad.push('3 seats with a tutor holding 2 is not greyed');
    if (st.off('2')) bad.push('2 seats with a tutor holding 2 is greyed');
    D.tutors.pop();
  }
  B.loc = ''; B.tutor = '';
  return bad;
});

check('a venue with rooms offers each room: the large one allows ten and a small one four, one booking still offers four seats, a blank rate is the venue\'s, the row names the room, and the card draws a line a room', async () => {
  /* ---------- *"colliers would library has 3 rooms within it. 2 are same size and one is large. And 2 § */
  const fx = JSON.parse(fs.readFileSync(path.join(dir, '..', 'check', 'fixture.json'), 'utf8'));
  const fv = (fx.venues || []).find(v => (v.rooms || []).length >= 3);
  if (!fv) return ['check/fixture.json has no venue with three rooms, so nothing here can ask about rooms'];
  const big = fv.rooms.find(r => Number(r.max) === 10), smalls = fv.rooms.filter(r => Number(r.max) === 4);
  const blank = smalls.find(r => r.fields && r.fields.rate_per_hour === '');
  if (!big || smalls.length !== 2 || !blank) {
    return ['the fixture venue\'s rooms are not two of 4 (one with no rate typed) and one of 10: '
      + JSON.stringify(fv.rooms.map(r => [r.name, r.max, r.fields && r.fields.rate_per_hour]))];
  }
  const p = payload();
  p.venues = p.venues.filter(v => v.title !== fv.title).concat([fv]);
  p.waitlistSeat = fx.waitlistSeat || {};
  p.constants = { vars: Object.assign({}, p.constants.vars, { max_students_per_job: 0 }) };
  const { w } = boot({ payload: p });
  await wait(300);
  if (!w.__t.STEPS || !w.__t.spaceFor || !w.__t.seatLimits) return ['the booking steps, spaceFor or seatLimits are not exported'];
  const bad = [];
  const B = w.__t.BOOKING;
  const step = id => w.__t.STEPS.filter(x => x.id === id)[0];
  const lab = r => fv.title + ' — ' + r.name;

  /* THE THREE SPACES, AND NOT THE BUILDING. A venue with rooms is hired by the room. */
  const offered = step('loc').options();
  fv.rooms.forEach(r => { if (offered.indexOf(lab(r)) === -1) bad.push('"Where?" does not offer ' + JSON.stringify(lab(r)) + ': ' + JSON.stringify(offered)); });
  if (offered.indexOf(fv.title) !== -1) bad.push('"Where?" still offers the bare building ' + JSON.stringify(fv.title) + ' beside its rooms');

  /* EACH ROOM'S OWN CAPACITY, from the one function that bounds a seat count. */
  const lim = r => w.__t.seatLimits(w.__t.spaceFor(lab(r)), null, lab(r));
  if (lim(big).max !== 10) bad.push(lab(big) + ' allows ' + lim(big).max + ' seats, not 10');
  smalls.forEach(r => { if (lim(r).max !== 4) bad.push(lab(r) + ' allows ' + lim(r).max + ' seats, not 4'); });
  const n = step('n');
  B.loc = lab(big);
  if (n.why('10')) bad.push('ten seats in ' + lab(big) + ' are refused: ' + n.why('10'));
  if (!n.why('11')) bad.push('eleven seats in ' + lab(big) + ', which holds ten, are not refused');
  /* ---------- AND ONE BOOKING IS STILL FOUR SEATS, IN ANY ROOM § */
  if (JSON.stringify(n.options()) !== JSON.stringify(['1', '2', '3', '4'])) {
    bad.push('the seats list in ' + lab(big) + ' offers ' + JSON.stringify(n.options())
      + ' — one booking is four options from the floor; docs/history/336 says so, and must change with it');
  }
  B.loc = lab(smalls[0]);
  if (JSON.stringify(n.options()) !== JSON.stringify(['1', '2', '3', '4'])) {
    bad.push('the seats list in ' + lab(smalls[0]) + ', which holds four, offers ' + JSON.stringify(n.options()));
  }
  B.loc = lab(big);
  B.loc = lab(blank);
  if (n.why('4')) bad.push('four seats in ' + lab(blank) + ' are refused: ' + n.why('4'));
  if (!n.why('5')) bad.push('five seats in ' + lab(blank) + ', which holds four, are not refused');
  /* AND THE ROOM SAYS SO WHEN THE SEATS WERE CHOSEN FIRST — "Where?" is asked after them. */
  B.n = '6';
  if (!/holds 4/.test(String(step('loc').why(lab(blank)) || ''))) bad.push('six seats then ' + lab(blank) + ' says ' + JSON.stringify(step('loc').why(lab(blank))) + ', not that it holds 4');
  if (step('loc').why(lab(big))) bad.push('six seats then ' + lab(big) + ' is refused: ' + step('loc').why(lab(big)));

  /* THE PRICE. A room with no rate typed costs what its venue costs — never nothing, never a house. */
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.how = 'A session of your own'; B.level = 'GCSE'; B.subjects = ['Maths']; B.n = '1';
  B.hosting = 'No — we book the room'; B.slots = ['m16']; B.interval = ['Autumn 1'];
  const rateAt = r => { B.loc = lab(r); const L = w.__t.price(); return L ? L.venueRate : null; };
  if (rateAt(blank) !== fv.bestRate) bad.push(lab(blank) + ' has no rate typed and is priced at ' + rateAt(blank) + ' an hour, not the venue\'s ' + fv.bestRate);
  if (rateAt(big) !== big.rate || big.rate === fv.bestRate) bad.push(lab(big) + ' is priced at ' + rateAt(big) + ' an hour, not its own ' + big.rate);
  if (w.isHome(lab(blank))) bad.push(lab(blank) + ' is read as somebody\'s home — a room with no rate typed was taken for a free one');
  B.loc = lab(blank);
  if (JSON.stringify(step('hosting').options()) !== JSON.stringify(['No', 'Yes'])) {
    bad.push('"Are you providing the space?" at ' + lab(blank) + ' offers ' + JSON.stringify(step('hosting').options()) + ' — locked to Yes is a free room');
  }
  /* A WAITING LIST IN A ROOM IS PRICED: the seat price doGet sends under each room's label. */
  fv.rooms.forEach(r => { B.loc = lab(r); if (!w.waitPrice_()) bad.push('a waiting list in ' + lab(r) + ' has no seat price on the phone'); });

  /* ---------- THE ROW SAYS WHICH ROOM § */
  /* SIGNED IN, because the form is drawn for somebody who can send it — the visitor `check/ui.js` and
     `check/share.js` use. */
  w.__t.USER({ name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], token: 'tk' });
  try { w.__t.repaint(true); w.__t.go('booking', false, true); } catch (e) { bad.push('opening booking threw: ' + e.message); }
  await wait(120);
  fv.rooms.forEach(r => {
    B.loc = lab(r);
    w.drawBooker();
    const sel = w.document.querySelector('#bookr select.bk-sel[data-step="loc"]');
    if (!sel) { bad.push('the booking form drew no Venue select with ' + lab(r) + ' chosen'); return; }
    const face = sel.closest('.bk-face'), said = face && face.querySelector('.bk-said');
    const o = sel.options[sel.selectedIndex];
    if (!said) bad.push('the Venue row with ' + lab(r) + ' chosen is a bare select — a select cannot wrap, so it reads "Colliers …" like the other two rooms');
    else if (said.textContent !== lab(r) || !o || o.text !== lab(r)) {
      bad.push('the Venue row with ' + lab(r) + ' chosen says ' + JSON.stringify(said.textContent) + ' over an option reading ' + JSON.stringify(o && o.text));
    }
  });

  /* THE CARD: ONE LINE A ROOM, how many fit and what an hour costs. */
  const box = w.document.createElement('div');
  box.innerHTML = String(w.findCard({ kind: 'venue', row: fv }) || '');
  const lines = [...box.querySelectorAll('.row')].map(x => [((x.querySelector('.k') || {}).textContent || '').trim(), ((x.querySelector('.v') || {}).textContent || '').trim()]);
  fv.rooms.forEach(r => {
    const line = lines.find(l => l[0] === r.name);
    const want = 'up to ' + r.max + ' · £' + Number(r.rate).toFixed(2) + '/h';
    if (!line) bad.push('the venue card has no line for ' + r.name + ': ' + JSON.stringify(lines));
    else if (line[1] !== want) bad.push('the venue card says ' + JSON.stringify(line[1]) + ' for ' + r.name + ', not ' + JSON.stringify(want));
  });
  if (/free/i.test(box.textContent)) bad.push('the venue card says "free" for a room priced at its venue\'s rate');

  /* AND WITH THE LIVE HOUSE CAP OF FOUR, THE BUSINESS'S LIMIT STILL WINS, AND SAYS WHOSE IT IS. */
  w.__t.DATA().constants.vars.max_students_per_job = 4;
  const capped = lim(big);
  if (capped.max !== 4 || capped.why.max !== 'your limit') bad.push('with max_students_per_job at 4, ' + lab(big) + ' allows ' + capped.max + ' (' + capped.why.max + ')');
  return bad;
});

check('a receipt lights every day its booking runs on', async () => {
  /* ---------- THE WEEK WAS COMPARED TO ONE DAY NAME § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.jobGrid) return ['jobWeekRows_ is not exported — cannot check the receipt week'];
  const lit = wd => (String(w.__t.jobGrid({ weekday: wd, time: '10:00', hours: 2 }))
    .match(/class="hr on/g) || []).length;
  const bad = [];
  [['Monday', 2], ['Monday, Friday', 4], ['Monday, Wednesday, Friday', 6]].forEach(([wd, want]) => {
    const got = lit(wd);
    if (got !== want) bad.push('"' + wd + '" lights ' + got + ' cells, wanted ' + want);
  });
  return bad;
});

/* ---------- PRESSING SEND USED TO EMPTY THE SCREEN § */
check('a booking you just asked for is still on the screen afterwards', async () => {
  const bad = [];
  const { w, sent } = boot({ reply: { success: true, jobId: 'J-ASK' } });
  await wait(300);
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });

  /* ---------- PAGE ZERO, WHICH IS THE FORM — NOT THE WHOLE COLUMN § */
  const pagesBefore = w.__t.blocks().length;
  const formPage = () => w.__t.blocks()[0] || '';
  const before = formPage();
  if (before.includes('J-ASK')) bad.push('a booking is shown under the form before one was asked for');
  if (w.__t.asked()) bad.push('something is remembered as asked for before any send');

  /* ---------- THE STATE ROWS ARE ON THE BLANK FORM, AND THEY ARE EMPTY § */
  const cellOf = (html, label, whole) => {
    const k = html.indexOf('<span class="bk-k">' + label + '</span>');
    if (k < 0) return null;
    const v = html.indexOf('bk-v', k);
    if (v < 0) return null;
    const cell = html.slice(v, html.indexOf('</span>', v));
    return whole ? cell : cell.replace(/^[^>]*>/, '').trim();
  };
  /* THE FIVE, READ OFF THE APP so a stage added or renamed needs nothing changed here. A list
     written out in this file would be a second copy of `JOB_STAGES` to keep in step. */
  const STAGES = (w.__t.JOB_STAGES || []).map(s => s.row);
  const dashes = (html, where) => {
    /* READ OFF THE APP, SO A STAGE ADDED NEEDS NOTHING HERE. § */
    if (!STAGES.length) bad.push('JOB_STAGES has no rows, so the stage ticks cannot be checked');
    /* NO `Status` ROW (owner, 29 Oct: "What is status for?") — the five ticks are where a booking is. */
    if (cellOf(html, 'Status') !== null) bad.push(`the ${where} booking form still has a "Status" row under the five ticks`);
    STAGES.forEach(label => {
      const cell = cellOf(html, label, true);
      if (cell === null) bad.push(`the ${where} booking form has no "${label}" row`);
      else if (cell.indexOf('bk-tick') === -1) {
        bad.push(`"${label}" on the ${where} form is not drawn as a tick box`);
      } else if (/bk-tick[^"]*\bon\b/.test(cell)) {
        bad.push(`"${label}" is ticked on the ${where} form, which nobody has sent`);
      }
    });
  };
  dashes(before, 'blank');

  /* ---------- AND ON THE PRICED FORM, WHICH IS A DIFFERENT BUILDER § */
  const P = w.__t.BOOKING;
  Object.keys(P).forEach(k => { if (Array.isArray(P[k])) P[k] = []; else P[k] = ''; });
  P.how = 'A session of your own'; P.level = 'GCSE'; P.loc = 'Colliers Wood Library';
  P.subjects = ['Maths']; P.n = '1'; P.hosting = 'No — we book the room';
  P.slots = ['m16']; P.interval = ['Autumn 1'];
  const priced = formPage();
  if (!w.__t.paper || w.__t.paper()) dashes(priced, 'priced');
  /* AND NOT ON A SAVED SESSION'S RECEIPT EITHER — one spine, one rule. */
  if (!w.__t.jobRows) bad.push('jobRows is not exported — the receipt\'s Status row was not checked');
  else if (w.__t.jobRows({ id: 'J-ST', subject: 'Maths', slots: [{ n: 1, client: 'Pat Parent', status: 'Booked' }] }).some(r => r.k === 'Status')) {
    bad.push('a session\'s receipt still has a "Status" row under the five ticks');
  }

  const B = w.__t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.how = 'A session of your own'; B.level = 'GCSE'; B.loc = 'Colliers Wood Library';
  B.subjects = ['Maths']; B.n = '1'; B.hosting = 'No — we book the room';
  B.slots = ['m16']; B.interval = ['Autumn 1'];
  try { w.__t.ACTIONS['book-send']({ disabled: false, dataset: {} }); }
  catch (e) { return bad.concat('book-send threw: ' + e.message); }
  await wait(600);

  if (!sent.map(x => x.action).includes('createJob')) {
    return bad.concat('no createJob was sent, so there is nothing to show');
  }
  /* THE ID THE BACKEND ANSWERED WITH, not one this test invented — if `createJob` stops returning
     `jobId` the widget has nothing to look up and this is where that shows. */
  if (w.__t.asked() !== 'J-ASK') {
    bad.push('the booking just made was not remembered (asked = "' + w.__t.asked() + '")');
  }
  const after = formPage();
  if (!after.includes('J-ASK')) bad.push('the booking just made is not drawn under the form');
  /* ---------- `Requested` IS TICKED THE MOMENT IT IS SENT, AND ONLY ON THE SECOND DOCUMENT § */
  const ticked = s => (s.match(/class="bk-tick on"/g) || []).length;
  if (ticked(formPage()) < 1) {
    bad.push('nothing is ticked after the booking was sent, so the receipt is not under the form');
  }
  if (ticked(before) !== 0) {
    bad.push('the blank form had a ticked stage on it before anything was sent');
  }
  /* ---------- IT MUST NOT GROW, AND IT IS ALLOWED TO SHRINK § */
  const pagesAfter = w.__t.blocks().length;
  if (pagesAfter > pagesBefore) {
    bad.push('the booking was added as a separate page (' + pagesBefore + ' -> '
      + pagesAfter + '), not below the form');
  }
  return bad;
});

check('an admin can answer a booking, and only one that is waiting', async () => {
  const { w } = boot();
  await wait(300);
  w.__t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
  const bad = [];
  /* ---------- IT LOOKED IN THE SHEET, AND THERE IS NO SHEET § */
  const buttonsOn = id => {
    try { w.openJob_(id); } catch (e) { return ['THREW: ' + e.message]; }
    const b = w.document.getElementById('s-booking');
    return b ? [...b.querySelectorAll('[data-do]')].map(x => x.dataset.do) : [];
  };
  const ask = buttonsOn('J-ASK');
  if (!ask.includes('job-answer')) bad.push('no Accept/Decline on a booking that is waiting');
  const paid = buttonsOn('J-PAID');
  if (paid.includes('job-answer')) bad.push('Accept/Decline offered on a booking already paid for');
  return bad;
});

/* ---------- PAY MOVED, AND THIS JOURNEY DID NOT § */
check('a client can pay once it is accepted, and not before', async () => {
  const { w } = boot();
  await wait(300);
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  if (typeof w.__t.jobTiles !== 'function') return ['jobTiles_ is not exported — cannot check Pay'];

  const bad = [];
  const offersPay = id => {
    const j = (w.__t.BOOKING && w.__t.BOOKING.jobs ? w.__t.BOOKING.jobs : [])
      .find(x => String(x.id || x.jobId) === id);
    if (!j) return null;                       // fixture does not carry it; nothing to say
    try { return /job-pay/.test(w.__t.jobTiles({ row: j }) || ''); }
    catch (e) { return 'THREW: ' + e.message; }
  };

  const ask = offersPay('J-ASK'), ok = offersPay('J-OK'), paid = offersPay('J-PAID');
  if (typeof ask === 'string' || typeof ok === 'string' || typeof paid === 'string') {
    return [String(ask || ok || paid)];
  }
  if (ask === true)  bad.push('a client is offered Pay before it is accepted');
  if (ok === false)  bad.push('a client cannot pay an accepted booking');
  if (paid === true) bad.push('Pay is still offered on a paid booking');
  return bad;
});

check('taking a seat on a class does not go through the ordinary join', async () => {
  const { w, sent } = boot();
  await wait(300);
  w.__t.USER({ name: 'Somebody Else', personId: 'P9', role: 'parent', roles: ['parent'] });
  try { w.openJob_('W-LIST'); }
  catch (e) { return ['opening the class threw: ' + e.message]; }
  /* `#s-booking` RATHER THAN THE SHEET — see the note on the admin journey above. § */
  const b = w.document.getElementById('s-booking');
  const dos = b ? [...b.querySelectorAll('[data-do]')].map(x => x.dataset.do) : [];
  if (dos.includes('job-join')) {
    return ['a class offers "Ask to join", which is the act for somebody else\'s booking — '
      + 'it prices nothing and records no availability'];
  }
  if (!dos.includes('job-take-seat')) return ['a class with seats left offers no way to take one'];
  try { w.__t.ACTIONS['job-take-seat']({ disabled: false, dataset: { id: 'W-LIST' } }); }
  catch (e) { return ['taking a seat threw: ' + e.message]; }
  await wait(250);

  /* ---------- IT NO LONGER SENDS, AND THAT IS THE POINT § */
  const bad = [];
  const B = w.__t.BOOKING;
  if (!/wait/i.test(String(B.how || ''))) bad.push('the kind was not set to a waiting list');
  if (!B.joining) bad.push('the class was not chosen on the form');
  if (!B.loc) bad.push('the venue the class runs at was not filled in');
  if (sent.map(x => x.action).includes('joinWaitlist')) {
    bad.push('it sent joinWaitlist without anybody pressing send');
  }
  return bad;
});

/* ---------- R1 (522): A DOOR INTO FIND FROM A CARD STARTS A NEW QUESTION — the chips pressed before go ---------- */
check('a door into Find from a card (Book this, take a seat, Practise) replaces the chips pressed there: its own chip on, the list not empty (522)', async () => {
  const b = await resBoot_();
  if (!b) return ['the app or libraryExtras_ did not load — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, bad = [];
  /* A TOPIC FIND ANSWERS, read off its own Topic question rather than named here. */
  const tf = w.facetList().find(f => f.field === 'topic');
  const topic = tf ? ((w.facetValues(w.stuffItems(), tf)[0] || {}).value || '') : '';
  /* Book this and take a seat kept the words before 522; Practise already cleared them, and is here so it cannot start keeping them. */
  const doors = [
    ['Book this', () => t.ACTIONS['book-with'](d.createElement('button')), [{ field: 'kindLabel', value: 'Booking' }]],
    ['take a seat', () => t.ACTIONS['job-take-seat']({ disabled: false, dataset: { id: 'W-LIST' } }), [{ field: 'kindLabel', value: 'Booking' }]],
    ['Practise ' + topic, () => t.ACTIONS['prog-practise']({ dataset: { topic: String(topic || ''), key: '' } }), [{ field: 'topic', value: topic }]],
  ];
  if (!topic) bad.push('Find answers no Topic, so Practise was NOT checked');
  for (const [say, press, want] of doors) {
    if (!want[0].value) continue;
    t.go('stuff', false, true); await wait(120); await woken_();
    w.finderSet_(null, { filters: [{ field: 'shelf', value: 'stale' }] });
    await wait(120);
    try { press(); } catch (e) { bad.push(say + ' threw: ' + e.message); continue; }
    await wait(LEAVE_MS); await woken_();
    if (t.AT() !== 'stuff') bad.push(say + ' left the app on ' + t.AT() + ', wanted Find');
    if (JSON.stringify(t.STUFF().filters) !== JSON.stringify(want)) bad.push(say + ' left the chips ' + JSON.stringify(t.STUFF().filters) + ', wanted ' + JSON.stringify(want));
    /* THE LIST IS WHAT FOLLOWS THE QUESTION PAGE: the booking form's pages in front, then the results. */
    const n = w.finderPageCount_('stuff') - 1;
    if (n < 1) bad.push(say + ' opened Find on nothing past its question');
  }
  t.USER(null);
  return bad;
});

/* A SWITCH FROM ONE PERSON TO ANOTHER passes `quiet`, so nothing repaints Find: the chips must be emptied by the one writer, not left as the last person's (522). */
check('signing in over somebody else empties both finders\' chips, though nothing repaints them (522)', async () => {
  const b = await resBoot_();
  if (!b) return ['the app or libraryExtras_ did not load — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, bad = [];
  if (typeof w.signedIn_ !== 'function' || typeof w.finderStates_ !== 'function') return ['signedIn_ or finderStates_ is not reachable — NOT checked'];
  const was = t.whoami() || {};
  if (!was.personId) return ['the setup: nobody is signed in, so a switch from one person to another was NOT asked'];
  for (const id of ['stuff']) { t.go(id, false, true); await wait(120); await woken_(); }
  w.finderStates_().forEach(st => { st.filters = [{ field: 'kindLabel', value: 'Library' }]; });
  try { w.signedIn_({ success: true, name: 'Sam Student', personId: was.personId + '-other', role: 'student', roles: ['student'], token: 'tk-other' }, 'sam'); }
  catch (e) { return bad.concat(['signedIn_ threw: ' + e.message]); }
  if ((t.whoami() || {}).personId !== was.personId + '-other') return bad.concat(['the second person did not sign in: ' + JSON.stringify(t.whoami())]);
  await wait(300);
  w.finderStates_().forEach((st, i) => {
    if ((st.filters || []).length) bad.push('finder ' + i + ' kept the last person\'s chips ' + JSON.stringify(st.filters));
  });
  t.USER(null);
  return bad;
});

/* ---------- THE WAY IN IS A LINE AND A TILE OF THE PAPER, NOT A BLOCK UNDER IT § */
const joinPage_ = (w, id) => {
  w.openJob_(id);
  return [...w.document.querySelectorAll('#s-booking .page')]
    .find(p => new RegExp('\\b' + id + '\\b').test((p.querySelector('.rc-ref') || {}).textContent || ''));
};
const rowSays_ = (pg, k) => {
  const r = [...pg.querySelectorAll('.rc .bk-row')]
    .find(x => ((x.querySelector('.bk-k') || {}).textContent || '').trim() === k);
  return r ? r.querySelector('.bk-v').textContent.replace(/\s+/g, ' ').trim() : null;
};
const onPaperOnly_ = (pg, bad) => {
  if (pg.querySelector('.join') || pg.ownerDocument.querySelector('#s-booking .join')) {
    bad.push('a .join block is still drawn under the paper');
  }
  const loose = [...pg.querySelectorAll('[data-do]')].filter(x => !x.closest('.rc'));
  if (loose.length) bad.push('controls float outside the paper: ' + loose.map(x => x.dataset.do).join(', '));
};

