/* ---------- A REFUSED SAVE PUTS THE CHOICE BACK; A LOST REPLY LEAVES IT ---------- */
check('a refused role save puts the choice back to Client; a lost reply keeps it', async () => {
  const NO = 'You are in 1 session as a client that has not finished. Leave it, or ask @family. to hand it over, first. Nothing was changed.';
  const { w, sent } = boot({ reply: b => b.action === 'setMyRoles' ? { error: NO } : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document;
  t.USER({ name: 'Pat Parent', personId: 'P-C1', role: 'parent', roles: ['parent'], token: 'tk', tutorPending: false,
           profile: { first_name: 'Pat', last_name: 'Parent' } });
  try { t.go('account', false, true); w.paint('account'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const bad = [];
  const card = () => d.querySelector('#s-account .roles-card');
  if (!card()) return ['Settings has no Your role card'];
  const pick = r => card().querySelector(`[data-role-pick="${r}"]`);
  const chosen = () => ['client', 'student'].filter(r => pick(r) && pick(r).selected).join(',');
  const line = () => (card().querySelector('.roles-said') || {}).textContent || '';
  if (chosen() !== 'client') return ['a parent signed in sees "' + chosen() + '" chosen, wanted client'];
  pick('student').selected = true;
  sent.length = 0;
  t.ACTIONS['roles-save'](card().querySelector('[data-do="roles-save"]'));
  await wait(400);
  if (!sent.some(b => b.action === 'setMyRoles')) return ['Save with Student chosen posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no setMyRoles'];
  if (line().indexOf('Nothing was changed') === -1) bad.push('the line under the tile does not carry the server\'s refusal — "' + line() + '"');
  if (chosen() !== 'client') bad.push('after "Nothing was changed" the card shows "' + chosen() + '" chosen, wanted what the parent holds: client');
  if (JSON.stringify(t.whoami().roles) !== '["parent"]') bad.push('a refusal changed USER.roles to ' + JSON.stringify(t.whoami().roles));
  /* LOST: nothing was decided, so the choice is left for the second Save. */
  w.fetch = () => Promise.reject(new w.TypeError('Failed to fetch'));
  pick('student').selected = true;
  t.ACTIONS['roles-save'](card().querySelector('[data-do="roles-save"]'));
  await wait(400);
  if (!/did not answer|offline/.test(line())) bad.push('a lost reply did not say so on the card — "' + line() + '"');
  if (chosen() !== 'student') bad.push('a reply that never came took the choice back to "' + chosen() + '" — a second Save would send what the person did not choose');
  return bad;
});

/* ---------- NOTIFICATIONS: WHICH EMAILS YOU WANT, ON SETTINGS § */
const notifyWorld_ = () => {
  const real = require('./check-gas-load.js').backend();
  const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London' };
  const P = (id, first, last, role, email) => Object.assign({ person_id: id, first_name: first, last_name: last,
    handle: (first + last).toLowerCase(), email: email, role: role }, base);
  real.seed('people', [
    P('P-C1', 'Pat', 'Parent', 'client', 'parent@example.org'),
    P('P-S1', 'Sam', 'Student', 'student', 'student@example.org'),
    P('P-S2', 'Nell', 'Nomail', 'student', ''),
    P('P-T1', 'Ada', 'Tutor', 'tutor', 'tutor@example.org'),
  ]);
  const user = (who) => {
    const d = real.post({ action: 'verifyLogin', email: who, name: who, pin: '0000' });
    return d && d.success ? { name: d.name, personId: d.personId, role: d.role, roles: d.roles, token: d.token,
      handle: d.handle, profile: d.profile } : null;
  };
  /* THE TWO ACTIONS THIS CARD IS ABOUT GO TO THE REAL `doPost`; the app's other polls are answered plainly. */
  const reply = b => (b.action === 'setNotify' || b.action === 'myProfile') ? real.post(b) : { success: true, messages: [] };
  return { real, user, reply };
};
const notifyCardOf_ = async (o) => {
  const { w, sent } = boot({ payload: o.payload, reply: o.reply, before: o.before });
  await wait(o.before ? 700 : 300);
  const t = w.__t, d = w.document;
  if (o.as) t.USER(o.as);
  try { t.go('account', false, true); w.paint('account'); } catch (e) { return { err: 'drawing settings threw: ' + e.message }; }
  await wait(300);
  const card = () => d.querySelector('#s-account .notify-card');
  return { w, t, d, sent, card };
};
check('the Notifications card shows a parent, a kid and a tutor only the emails that reach them, from the real backend', async () => {
  const { user, reply } = notifyWorld_();
  const payload_ = Object.assign(payload(), { features: ['setNotify'] });
  /* THE OWNER'S ASK, WRITTEN OUT: each role's switches, and what is always sent. No `referrals` for anybody
     — it is `hidden` (constants.gs): nothing hands a code out any more, so it was a tick about a code
     nobody had seen. */
  const WANT = {
    'parent@example.org':  { opt: ['weekly', 'messages', 'bookings', 'posts'], must: 4 },
    'student@example.org': { opt: ['messages', 'posts'], must: 3 },
    'tutor@example.org':   { opt: ['messages', 'bookings', 'posts'], must: 3 },
  };
  const ALL = ['weekly', 'messages', 'bookings', 'posts', 'referrals', 'approvals'];
  const bad = [];
  for (const who of Object.keys(WANT)) {
    const u = user(who);
    if (!u) { bad.push(who + ' could not sign in to the real backend'); continue; }
    const v = await notifyCardOf_({ payload: payload_, reply, as: u });
    if (v.err) { bad.push(who + ': ' + v.err); continue; }
    const c = v.card();
    if (!c) { bad.push(who + ': Settings has no Notifications card'); continue; }
    const ticks = [...c.querySelectorAll('[data-do="notify-pick"]')];
    const kinds = ticks.map(b => b.dataset.kind);
    if (JSON.stringify(kinds) !== JSON.stringify(WANT[who].opt)) bad.push(who + ' is offered ' + JSON.stringify(kinds) + ', wanted ' + JSON.stringify(WANT[who].opt));
    const others = ALL.filter(k => WANT[who].opt.indexOf(k) === -1 && kinds.indexOf(k) !== -1);
    if (others.length) bad.push(who + ' is offered somebody else\'s emails: ' + others.join(', '));
    if (!ticks.every(b => b.checked && b.type === 'checkbox' && b.closest('label.check'))) bad.push(who + ': not every switch is a ticked `.check` box — ' + ticks.map(b => b.dataset.kind + '=' + b.checked).join(' '));
    const must = c.querySelectorAll('.notify-always li');
    if (must.length !== WANT[who].must) bad.push(who + ' is told ' + must.length + ' kinds are always sent, wanted ' + WANT[who].must);
    if (c.querySelector('.notify-always input')) bad.push(who + ': what is always sent is drawn with a box — it is words, not a greyed control');
    if (!/Sign-in links and new PINs/.test(c.textContent)) bad.push(who + ': sign-in links and new PINs are not listed as always sent');
    if (who === 'parent@example.org' && !/not being sent yet/i.test(c.textContent)) bad.push('the parent\'s weekly line does not say it is not being sent yet (weekly_digest is off)');
    const pages = [...v.d.querySelectorAll('#s-account .page')];
    /* LAST OF THE SETTINGS ON STUDENT (444) — only the tutors' cards come after it. */
    const nAt = pages.findIndex(p => p.querySelector('.notify-card'));
    if (pages.length && (nAt < 0 || pages.slice(nAt + 1).some(p => p.querySelector('.me-form, .roles-card, #pin-now')))) bad.push(who + ': the Notifications card is not the last page — a card in front moves every page a returning visitor remembers');
  }
  /* A CHILD WITH NO EMAIL OF THEIR OWN: one sentence, nothing to tick. */
  const nell = user('nellnomail');
  if (!nell) bad.push('the child with no email could not sign in by handle');
  else {
    const v = await notifyCardOf_({ payload: payload_, reply, as: nell });
    const c = v.card && v.card();
    if (!c) bad.push('the child with no email has no Notifications card');
    else {
      if (c.querySelector('[data-do="notify-pick"]')) bad.push('a child with no email is offered switches for mail that never comes');
      if (!/no email address/i.test(c.textContent) || !/grown-up/.test(c.textContent)) bad.push('a child with no email is not told so: ' + JSON.stringify(c.textContent.replace(/\s+/g, ' ').trim()));
    }
  }
  return bad;
});

check('a Notifications tick saves to the real sheet, survives a reload, and a refusal puts it back', async () => {
  const { real, user, reply } = notifyWorld_();
  const payload_ = Object.assign(payload(), { features: ['setNotify'] });
  const pat = user('parent@example.org');
  if (!pat) return ['the parent could not sign in to the real backend'];
  const v = await notifyCardOf_({ payload: payload_, reply, as: pat });
  if (v.err) return [v.err];
  const bad = [];
  const box = () => v.card() && v.card().querySelector('[data-kind="messages"]');
  if (!box() || !box().checked) return ['the parent\'s Messages switch is missing or not ticked'];
  v.sent.length = 0;
  box().click();
  await wait(400);
  const post = v.sent.find(b => b.action === 'setNotify');
  if (!post) bad.push('unticking Messages posted ' + JSON.stringify(v.sent.map(b => b.action)) + ' and no setNotify');
  else if (post.kind !== 'messages' || post.on !== false || post.personId !== 'P-C1' || !post.token) bad.push('setNotify carried ' + JSON.stringify(post) + ' — wanted kind messages, on false, the parent\'s id and token');
  if (String(real.row('P-C1').messages_email) !== 'no') bad.push('the sheet\'s messages_email is "' + real.row('P-C1').messages_email + '" after unticking, wanted no');
  if (!box() || box().checked) bad.push('after the save the box is ticked again');
  if (!/off/.test((v.card().querySelector('.notify-said') || {}).textContent || '')) bad.push('the line under the ticks does not say Messages is off');
  if ((((v.t.whoami().profile || {}).notify || {}).kinds || []).find(k => k.kind === 'messages').on !== false) bad.push('USER.profile.notify was not given the server\'s list');
  /* A RELOAD WHOSE SAVED COPY HAS NO LIST: only the server's myProfile can put the tick where it was. */
  const kept = JSON.parse(JSON.stringify(v.t.whoami()));
  delete kept.profile.notify;
  const r = await notifyCardOf_({ payload: payload_, reply, before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(kept)); } catch (e) {} } });
  if (r.err) return bad.concat([r.err]);
  await wait(400);
  const again = r.card() && r.card().querySelector('[data-kind="messages"]');
  if (!r.sent.some(b => b.action === 'myProfile')) bad.push('the reloaded phone never asked myProfile');
  if (!again) bad.push('after a reload the parent\'s card has no Messages switch — ' + JSON.stringify(((r.card() || {}).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160)));
  else if (again.checked) bad.push('after a reload Messages is ticked again — the choice did not survive');
  /* A REFUSAL — the sheet without the column — PUTS THE TICK BACK and says why. */
  const no = await notifyCardOf_({ payload: payload_, as: pat,
    reply: b => b.action === 'setNotify' ? { error: 'The sheet has no `posts_email` column. Run ensureSchema_() — nothing was saved.' } : reply(b) });
  const pb = no.card() && no.card().querySelector('[data-kind="posts"]');
  if (!pb) return bad.concat(['the refusal journey has no Posts switch']);
  pb.click();
  await wait(400);
  const pb2 = no.card().querySelector('[data-kind="posts"]');
  if (!pb2.checked) bad.push('a refused save left Posts unticked — a box showing a choice the server never kept');
  if (!/ensureSchema_/.test((no.card().querySelector('.notify-said') || {}).textContent || '')) bad.push('a refused save did not say why under the ticks');
  return bad;
});

/* ---------- TWO TICKS IN A ROW ARE TWO SAVES, WHICHEVER ANSWERS FIRST § */
check('two Notifications ticks in a row are two saves, and the replies cannot undo each other', async () => {
  const { real, user, reply } = notifyWorld_();
  real.seed('family', [{ link_id: 'L1', parent_id: 'P-C1', child_id: 'P-S1', state: 'accepted' }]);
  const payload_ = Object.assign(payload(), { features: ['setNotify'] });
  const pat = user('parent@example.org');
  if (!pat) return ['the parent could not sign in to the real backend'];
  const held = [];
  /* ANSWERED BY THE REAL SERVER THE MOMENT IT ARRIVES, DELIVERED WHEN THE JOURNEY SAYS. */
  const v = await notifyCardOf_({ payload: payload_, as: pat,
    reply: b => { if (b.action !== 'setNotify') return reply(b); const ans = real.post(b); return new Promise(ok => held.push(() => ok(ans))); } });
  if (v.err) return [v.err];
  const bad = [];
  const box = k => v.card() && v.card().querySelector('[data-kind="' + k + '"]');
  if (!box('bookings') || !box('weekly')) return ['the parent has no Booking updates or no Weekly switch'];
  v.sent.length = 0;
  box('bookings').click();
  await wait(50);
  if (!box('bookings').disabled) bad.push('the box being saved is not locked while it saves — it could be sent twice at once');
  if (box('weekly').disabled) bad.push('a tick being saved locked the OTHER boxes on the card — a second tick lands on a dead box');
  box('weekly').click();
  await wait(50);
  const posts = v.sent.filter(b => b.action === 'setNotify').map(b => b.kind + '=' + b.on);
  if (JSON.stringify(posts) !== JSON.stringify(['bookings=false', 'weekly=false'])) bad.push('two ticks in a row posted ' + JSON.stringify(posts) + ' — wanted bookings off, then weekly off');
  /* THE LATER REPLY FIRST, then the earlier one. */
  if (held[1]) held[1]();
  await wait(100);
  if (held[0]) held[0]();
  await wait(300);
  if (String(real.row('P-C1').bookings_email) !== 'no' || String(real.row('P-C1').weekly_email) !== 'no')
    bad.push('the sheet has bookings_email "' + real.row('P-C1').bookings_email + '" and weekly_email "' + real.row('P-C1').weekly_email + '" — wanted both no');
  const kinds = (((v.t.whoami().profile || {}).notify || {}).kinds || []);
  const onOf = k => (kinds.find(x => x.kind === k) || {}).on;
  if (onOf('bookings') !== false || onOf('weekly') !== false) bad.push('after both replies the phone holds bookings ' + onOf('bookings') + ', weekly ' + onOf('weekly') + ' — an older reply\'s list painted over a newer tick');
  try { v.w.paint('account'); } catch (e) { bad.push('repainting settings threw: ' + e.message); }
  await wait(100);
  if (!box('bookings') || box('bookings').checked || !box('weekly') || box('weekly').checked)
    bad.push('after a repaint the card shows bookings ' + (box('bookings') && box('bookings').checked) + ', weekly ' + (box('weekly') && box('weekly').checked) + ' — wanted both unticked, as the sheet has them');
  if (box('bookings').disabled || box('weekly').disabled) bad.push('a box is still locked after its save answered');
  return bad;
});

/* ---------- A LIST WITH NOTHING IN IT IS ONE SENTENCE § */
check('a Notifications list with no kinds says so instead of "saved as you tick" over nothing', async () => {
  const { user, reply } = notifyWorld_();
  const pat = user('parent@example.org');
  if (!pat) return ['the parent could not sign in to the real backend'];
  pat.profile.notify = Object.assign({}, pat.profile.notify, { kinds: [] });
  const v = await notifyCardOf_({ payload: Object.assign(payload(), { features: ['setNotify'] }), as: pat,
    reply: b => b.action === 'myProfile' ? { success: true, personId: 'P-C1', profile: pat.profile } : reply(b) });
  if (v.err) return [v.err];
  const c = v.card();
  if (!c) return ['Settings has no Notifications card'];
  const bad = [];
  const words = c.textContent.replace(/\s+/g, ' ').trim();
  if (/saved as you tick/.test(words)) bad.push('an empty list still says "saved as you tick" over no ticks — ' + JSON.stringify(words));
  if (!/sent as before/.test(words)) bad.push('an empty list does not say everything is still sent — ' + JSON.stringify(words));
  return bad;
});

check('an old backend leaves the Notifications card saying so, with nothing to tick', async () => {
  const { user, reply } = notifyWorld_();
  const pat = user('parent@example.org');
  if (!pat) return ['the parent could not sign in to the real backend'];
  /* THE PAYLOAD OF A BACKEND FROM BEFORE `setNotify`: features that do not name it, and a profile with no list. */
  delete pat.profile.notify;
  const v = await notifyCardOf_({ payload: Object.assign(payload(), { features: ['openWaitlist', 'myProfile'] }),
    reply: b => b.action === 'myProfile' ? { error: 'That action is not recognised.' } : reply(b), as: pat });
  if (v.err) return [v.err];
  const bad = [];
  const c = v.card();
  if (!c) return ['an old backend took the Notifications card away — Settings should still draw it and say why'];
  if (c.querySelector('[data-do="notify-pick"]')) bad.push('an old backend is offered ticks it would refuse');
  if (!/does not have notification choices yet/.test(c.textContent) || !/sent as before/.test(c.textContent)) bad.push('the card does not say the backend is older than the site, and that everything is still sent: ' + JSON.stringify(c.textContent.replace(/\s+/g, ' ').trim()));
  /* THE INSTRUCTION IS THE ADMIN'S: a parent cannot sync anything. */
  if (/sync backend/i.test(c.textContent)) bad.push('a parent is told to sync the backend — an instruction only the admin can follow');
  v.t.USER(Object.assign({}, pat, { role: 'admin', roles: ['admin'] }));
  try { v.w.paint('account'); } catch (e) { bad.push('drawing settings for the admin threw: ' + e.message); }
  const ca = v.card();
  if (!ca || !/Sync backend\//.test(ca.textContent)) bad.push('the admin is not told to sync backend/: ' + JSON.stringify(ca && ca.textContent.replace(/\s+/g, ' ').trim()));
  if (!v.d.querySelector('#s-account .roles-card')) bad.push('an old backend broke the rest of Settings');
  return bad;
});

/* ---------- THE SHOP IS A COLUMN, AND FIND IS LEARNING § */
const shopRow_ = (n, name, kindRaw, audience, inStock, extra) => Object.assign({
  id: n, rowIndex: n, kind: 'thing', kindRaw: kindRaw, name: name, price: '', unit: '£',
  acquire: 'buy', audience: audience, level: 0, slot: '', artId: '', description: name + ', for sale.',
  image: '', inStock: inStock, fields: {} }, extra || {});
/* ---------- A CHOSEN ANSWER IS ONLY ITS VALUE, AND CLEAR IS A TILE BESIDE THE BOX § */
check('a chosen answer is only its value, and Clear is a tile beside the search box that keeps its focus', async () => {
  const { w } = boot({ member: true, payload: payload() });
  await wait(300);
  const t = w.__t, d = w.document;
  if (!t.STUFF || typeof w.filterChips !== 'function') return ['Find\'s state is not exported to the journey'];
  const bad = [];
  t.go('stuff');
  await wait(60);
  t.STUFF().q = '';
  t.STUFF().filters.length = 0;
  w.paintStuff();
  await wait(30);
  const box = d.getElementById('stuff-q');
  if (!box) return ['the Find screen has no search box to keep'];
  const slot = () => d.getElementById('stuff-clear');
  if (!slot()) return ['there is no #stuff-clear beside the search box — Clear has nowhere of its own to be'];
  if (slot().innerHTML.trim()) bad.push('with nothing chosen, the Clear slot holds ' + slot().innerHTML.trim().slice(0, 80) + ' — it is shown from the first answer');
  if (slot().parentElement !== box.parentElement) bad.push('Clear is not beside the search box — its slot and the box have different parents');

  /* THE FIRST ANSWER, PRESSED WITH THE BOX FOCUSED. */
  box.focus();
  if (d.activeElement !== box) return bad.concat(['the search box would not take the focus, so keeping it was NOT checked']);
  t.ACTIONS['facet-pick']({ dataset: { field: 'forLabel', value: 'Learning' } });
  await wait(80);
  if (d.getElementById('stuff-q') !== box) bad.push('pressing an answer replaced the search box — a new element, so the focus and the caret are gone');
  else if (d.activeElement !== box) bad.push('pressing an answer took the focus off the search box (it is on ' + (d.activeElement ? d.activeElement.tagName + '#' + d.activeElement.id : 'nothing') + ')');
  const tiles = () => [...slot().querySelectorAll('.tile[data-do="filter-clear"]')];
  if (tiles().length !== 1) bad.push('one answer in, the Clear slot holds ' + tiles().length + ' Clear tile(s) — one, from the first answer');

  /* THE CHIPS: a value, a skip, a bare number, and the tag that colours a kind. */
  t.STUFF().filters.splice(0, t.STUFF().filters.length,
    { field: 'forLabel', value: 'Learning' }, { field: 'subject', value: 'Maths' },
    { field: 'yearGroup', any: true }, { field: 'wChapter', value: '119' });
  w.paintStuff();
  await wait(30);
  const chips = [...d.querySelectorAll('#stuff-chips .chip')];
  const text = el => el.textContent.replace(/\s+/g, ' ').trim();
  const said = chips.map(text);
  if (chips.length !== 4) bad.push('four answers drew ' + chips.length + ' chip(s): ' + said.join(' | '));
  if (d.querySelector('#stuff-chips .chip-k')) bad.push('a chip still carries its field name in a .chip-k: ' + said.join(' | '));
  const labels = ['What for', 'Subject', 'School year'];
  said.forEach(s => labels.forEach(l => { if (s.indexOf(l + ' ') === 0) bad.push('the chip "' + s + '" starts with its field\'s name, ' + l); }));
  const maths = chips.find(c => text(c) === 'Maths✕');
  if (!maths) bad.push('no chip reads exactly "Maths✕" — they read ' + said.join(' | '));
  /* ONE COLOUR PER MENU (1030): the chip wears its facet's hue, h<N> from TAG_OF. */
  else {
    const hue = /^const TAG_OF = \{.*\bsubject: (\d+)/m.exec(require('../tools/find-src.js').findSrc()), want = 'h' + (hue ? hue[1] : '?');
    if (maths.getAttribute('data-tag') !== want) bad.push('the Maths chip lost its colour: data-tag is ' + JSON.stringify(maths.getAttribute('data-tag')) + ', not the subject menu\'s ' + want);
  }
  if (said.indexOf('Learning✕') < 0) bad.push('the What for chip does not read "Learning✕" — ' + said.join(' | '));
  if (said.indexOf('Any school year✕') < 0) bad.push('the skipped School year does not read "Any school year✕" — ' + said.join(' | '));
  if (said.indexOf('Chapter 119✕') < 0) bad.push('a bare 119 does not keep its field as "Chapter 119✕" — ' + said.join(' | '));
  if (d.querySelector('#stuff-chips [data-do="filter-clear"]')) bad.push('Clear is still drawn in the row of chips, where it looks like a tag');
  if (tiles().length !== 1) bad.push('four answers in, the Clear slot holds ' + tiles().length + ' Clear tile(s)');
  else {
    const tile = tiles()[0];
    if (!/Clear/.test(tile.getAttribute('aria-label') || '')) bad.push('the Clear tile is named ' + JSON.stringify(tile.getAttribute('aria-label')) + ' — it should say Clear');
    if (!tile.querySelector('svg')) bad.push('the Clear tile has no mark on it — the bin');
    /* AND IT STILL CLEARS, and goes with what it cleared. */
    t.ACTIONS['filter-clear'](tile);
    await wait(30);
    if (t.STUFF().filters.length) bad.push('pressing Clear left ' + t.STUFF().filters.length + ' answer(s) chosen');
    if (slot().innerHTML.trim()) bad.push('with everything cleared, the Clear tile is still beside the box');
  }
  return bad;
});

check('the shop is its own column with the basket on top, and Find no longer has a Shop door', async () => {
  const p = payload();
  p.shop = [shopRow_(2, 'Gooey Louie (board game)', 'game', 'all', true),
            shopRow_(3, 'Safety goggles', 'equipment', 'all', true),
            shopRow_(4, 'Pencil (HB)', 'consumable', 'student', true, { price: '30', unit: 'p' }),
            shopRow_(5, 'Measuring wheel', 'equipment', 'tutor', true, { acquire: 'loan' }),
            shopRow_(6, 'Toner cartridge', 'consumable', 'admin', true, { acquire: 'issued' }),
            shopRow_(7, 'DYU Bike', 'equipment', 'admin', false),
            shopRow_(8, 'Beanie', 'avatar', 'student', true, { kind: 'wearable', slot: 'hat' })];
  const { w } = boot({ payload: p });
  await wait(300);
  const t = w.__t;
  if (!t.shopCards || !t.shopFunnel || !t.shopAll || !t.shopSaved || !t.shopDoors || !t.widgetsOf) {
    return ['the shop column and the funnel\'s lists are not exported, so the shop was NOT checked — not a pass'];
  }
  const bad = [];
  const ids = t.TABS.map(x => x.id);
  if (ids.indexOf('shop') < 0) return ['there is no `shop` tab at all'];
  if (ids.indexOf('shop') !== ids.indexOf('booking') + 1) {
    bad.push('the Shop column is not right of Booking — the order reads ' + ids.join(', '));
  }
  if (!t.shopAll().some(x => x.kind === 'shop' && x.name === 'Safety goggles')) {
    return ['the payload\'s shop rows are not items at all, so nothing here measures anything'];
  }

  /* FIND: no shop thing in the list it draws, and no `Shop` door on its first question. */
  const leaked = t.shopFunnel().filter(x => x.kind === 'shop').map(x => x.name);
  if (leaked.length) bad.push('Find still offers ' + leaked.length + ' shop thing(s): ' + leaked.join(', '));
  if (t.shopDoors().some(d => /\bShop\b/.test(d))) bad.push('Find\'s first question still has a Shop door: ' + t.shopDoors().join(' | '));

  /* THE COLUMN, SIGNED OUT: the basket first, then the things for everybody, under their group. */
  const drawn = () => t.shopCards().join('\n');
  const first = t.shopCards()[0] || '';
  if (!/cart-box/.test(first)) bad.push('page 0 of the Shop column is not the basket');
  if (!t.widgetsOf('shop').some(x => String(x.id) === 'cart')) bad.push('the basket is not a widget of the shop');
  if (t.widgetsOf('tool').some(x => String(x.id) === 'cart')) bad.push('the basket is still on the Tools column as well — two `#cart-box`es on one page');
  let html = drawn();
  ['Gooey Louie', 'Safety goggles', 'Pencil (HB)'].forEach(n => {
    if (html.indexOf(n) < 0) bad.push('signed out, the shop does not draw "' + n + '", which is for everybody');
  });
  ['Measuring wheel', 'Toner cartridge', 'DYU Bike', 'Beanie'].forEach(n => {
    if (html.indexOf(n) >= 0) bad.push('signed out, the shop draws "' + n + '" — a tutor\'s, an admin\'s, a withdrawn row or a wearable');
  });
  const games = t.shopCards().find(c => /<h2><span>Games<\/span>/.test(c)) || '';
  if (games.indexOf('Gooey Louie') < 0) bad.push('Gooey Louie is not under a Games heading — the things are not grouped by their kind');
  if (!/data-do="cart-add"/.test(html)) bad.push('no thing on the shop has a trolley');

  /* AN ADMIN sees the business's own kit and the admin's rows; nobody sees a withdrawn one. */
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk', credits: 0 });
  html = drawn();
  ['Measuring wheel', 'Toner cartridge'].forEach(n => {
    if (html.indexOf(n) < 0) bad.push('an admin is not shown "' + n + '" on the shop');
  });
  if (html.indexOf('DYU Bike') >= 0) bad.push('the shop draws a row whose `active` is FALSE');

  /* A STARRED SHOP THING IS STILL ON SAVED, which reads every item and not the funnel's list. */
  t.star('Safety goggles');
  if (!t.shopSaved().join('').includes('Safety goggles')) bad.push('a starred shop thing is not on Saved now that Find does not offer it');

  /* AND THE WAY TO IT FROM A BUNDLE: `cart-open` lands on the Shop column, on the basket. */
  t.ACTIONS['cart-open']();
  await wait(50);
  if (t.AT() !== 'shop') bad.push('"see your basket" went to ' + t.AT() + ', not the Shop column');
  else if (t.PAGE().shop !== t.widgetsOf('shop').findIndex(x => String(x.id) === 'cart')) {
    bad.push('"see your basket" landed on page ' + t.PAGE().shop + ' of the shop, not on the basket');
  }
  return bad;
});

/* ---------- PROJECTS, A KIND OF ITS OWN BESIDE THE PRACTICALS § */
check('Projects is a kind in Find beside Practicals: card, materials, steps, and a share page to Messages', async () => {
  const rows = LIB_FULL.rows('projects');
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the projects were NOT checked — not a pass'];
  /* THE PRACTICALS TOO, so `What kind` has both siblings to name — the fixture has no library. */
  const prac = LIB_FULL.rows('practicals');
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, { projects: rows, practicals: prac })));
  const mapped = made.projects || [];
  if (!mapped.length) return ['the mapper made nothing of ' + rows.length + ' rows in data/projects.json'];
  const p = payload();
  p.projects = mapped;
  p.practicals = made.practicals || [];
  const { w } = boot({ payload: p });
  await wait(300);
  const t = w.__t;
  const bad = [];
  const found = w.stuffItems().filter(x => x.kind === 'project');
  if (found.length !== mapped.length) bad.push('Find offers ' + found.length + ' of ' + mapped.length + ' projects');
  if (!found.length) return bad;

  /* THE TAG. Projects is a kind under Practice (610), so it is a Which answer, beside the practicals. */
  const kindFacet = w.facetList().find(f => f.field === 'kindOwn');
  const shown = items => w.facetValues(items, kindFacet).map(v => String(v.show || v.value));
  const learning = w.stuffItems().filter(x => w.kindOf_(x).group === 'Learning');
  /* BESIDE THE PRACTICALS, in the kinds tab's order (`answerCmp_`, 396) — where the owner will look. */
  const inner = shown(learning);
  if (Math.abs(inner.indexOf('Projects') - inner.indexOf('Practicals')) !== 1) bad.push('`What kind` does not put Projects next to Practicals — it reads ' + inner.join(' | '));
  if (inner.indexOf('Projects') < 0 || inner.indexOf('Practicals') < 0) bad.push('`What kind` does not offer Projects beside Practicals — it reads ' + inner.join(' | '));

  const x = found[0];
  const parts = w.pageParts_(x);
  if (JSON.stringify(parts) !== JSON.stringify([null, 'kit', 'steps', 'share'])) {
    bad.push('a project is pages ' + JSON.stringify(parts) + ', not card, materials, steps, share');
  }
  const box = html => { const d = w.document.createElement('div'); d.innerHTML = html; return d; };
  const card = box(w.stuffCard(x));
  if (!card.querySelector('.card.proj')) bad.push('the project card is not drawn as a project');
  else {
    /* ITS TYPE IS THE Project or coursework ANSWER, a tag in the card's one row (355) -- not a pill. */
    if (tagF(card, 'projectType') !== 'Project') bad.push('the card has no [Project] tag: ' + tagF(card, 'projectType'));
    if (card.textContent.indexOf(x.row.sessions + ' sessions') < 0) bad.push('the card does not say how many sessions');
    if (card.querySelector('.gd-box, .prac-kit, .prac-steps')) bad.push('the card carries its materials or steps — they are pages of their own');
  }
  const kit = box(w.stuffPart_(x, 'kit'));
  if (kit.querySelectorAll('.prac-kit li').length !== x.row.materials.length) bad.push('the materials page does not list every item');
  const steps = box(w.stuffPart_(x, 'steps'));
  if (steps.querySelectorAll('.prac-steps ol > li').length !== x.row.steps.length) bad.push('the steps page does not number every step');
  const share = box(w.stuffPart_(x, 'share'));
  if (!/Messages/.test(share.textContent)) bad.push('the share page does not tell them to send it in Messages');
  if (x.row.share && share.textContent.indexOf(x.row.share.slice(0, 40)) < 0) bad.push('the share page does not carry the row\'s own share note');
  const tile = share.querySelector('.tile-row [data-do="proj-share"]');
  if (!tile) bad.push('the share page has no Messages tile');
  if (typeof t.ACTIONS['proj-share'] !== 'function') bad.push('`proj-share` has no handler');
  else {
    t.ACTIONS['proj-share'](tile);
    await wait(50);
    if (t.AT() !== 'dm') bad.push('the Messages tile went to ' + t.AT() + ', not Messages');
  }
  return bad;
});

/* ---------- COURSEWORK, A TYPE OF PROJECT § */
check('Coursework is a type of project: Projects asks Project or coursework, which narrows to it; tagged, its board, Stages, found by name', async () => {
  const rows = LIB_FULL.rows('projects');
  const sheet = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'settings', 'facets.json'), 'utf8'));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the coursework was NOT checked — not a pass'];
  const prac = LIB_FULL.rows('practicals');
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, { projects: rows, practicals: prac })));
  const mapped = made.projects || [];
  const cws = mapped.filter(p => p.projectType === 'coursework');
  if (!cws.length) return ['the mapper made no coursework of the ' + rows.length + ' rows in data/projects.json — NOT checked'];
  const p = payload();
  p.projects = mapped;
  p.practicals = made.practicals || [];
  const { w } = boot({ member: true, payload: p, serve: u => (/(^|\/)data\/settings\/facets\.json(\?|$)/.test(u) ? sheet : undefined) });
  const t = w.__t;
  const hasRow = () => ((t.DATA() || {}).facets || []).some(f => f.field === 'projectType');
  for (let i = 0; i < 120 && !hasRow(); i++) await wait(25);
  if (!hasRow()) return ['data/settings/facets.json was served and DATA.facets has no projectType row — the question was NOT checked'];
  const bad = [];
  const cwItems = w.stuffItems().filter(x => x.kind === 'project' && x.row.projectType === 'coursework');
  if (cwItems.length !== cws.length) bad.push('Find offers ' + cwItems.length + ' of ' + cws.length + ' coursework(s)');
  if (!cwItems.length) return bad;

  /* THE ROUTE. A rung the fixture answers one way is skipped by the one-answer rule — `What for` is
     only Learning here — and a grouped rung draws its bucket first, which is pressed on the way. */
  t.go('stuff');
  t.STUFF().filters.length = 0; t.STUFF().q = '';
  w.paintStuff();
  const btns = () => [...w.document.querySelectorAll('#s-stuff [data-do="facet-pick"]')];
  const pressed = [];
  const press = async (field, value) => {
    for (let guard = 0; guard < 4; guard++) {
      const here = btns();
      let el = here.find(b => b.dataset.field === field && b.dataset.value === value);
      if (!el) {
        const f = w.facetList().find(x => x.field === field);
        const only = f ? w.facetValues(w.stuffFiltered(), f).map(v => String(v.value)) : [];
        if (only.length === 1 && only[0] === value) { pressed.push('(' + value + ')'); return true; }
        const grp = (() => { try { return f.bucketOf(value); } catch (e) { return ''; } })();
        el = grp && here.find(b => b.dataset.value === grp && b.dataset.bucket);
        if (!el) {
          bad.push('after ' + (pressed.join(' → ') || 'nothing') + ' the funnel did not offer ' + field + ' "' + value
            + '" — it offered ' + (here.map(b => b.dataset.field + ':' + b.dataset.value).join(' | ') || 'no answers'));
          return false;
        }
      }
      pressed.push(el.dataset.value);
      t.ACTIONS['facet-pick'](el);
      await wait(20);
      if (!el.dataset.bucket) return true;
    }
    return false;
  };
  /* WHAT FOR IS NOT ASKED WHEN WHAT KIND ANSWERS IT (790: Tools and Games are kinds too), so Practice comes first. */
  if (!(await press('kindLabel', 'Library')) || !(await press('kindOwn', 'Projects'))) return bad;

  /* THE NEXT QUESTION IS PROJECT OR COURSEWORK, AND ITS TWO ANSWERS ARE THE TWO WORDS. Asked of the
     buttons drawn, not of `nextFacet`, because the claim is what a person sees after pressing
     Projects. */
  const asked = btns();
  const fields = [...new Set(asked.map(b => b.dataset.field))];
  const answers = asked.filter(b => b.dataset.field === 'projectType').map(b => b.dataset.value).sort();
  if (fields.join() !== 'projectType') bad.push('after ' + pressed.join(' → ') + ' the funnel asks ' + (fields.join(', ') || 'nothing') + ', not Project or coursework');
  if (answers.join('|') !== 'Coursework|Project') bad.push('Project or coursework offers ' + (answers.join(' | ') || 'nothing') + ', not Project and Coursework');
  const typeFacet = w.facetList().find(f => f.field === 'projectType');
  if (!typeFacet) bad.push('no facet reads `projectType` — the facets file was not applied');
  else if (typeFacet.label !== 'Project or coursework') bad.push('the question is labelled "' + typeFacet.label + '"');
  /* THE TYPE COLOUR, the one Experiment or build wears — read off the answer as drawn, since
     `TAG_OF` is a `const` and not on the window. */
  const cwBtn = asked.find(b => b.dataset.field === 'projectType' && b.dataset.value === 'Coursework');
  if (!cwBtn) return bad;
  if (cwBtn.dataset.tag !== 'type') bad.push('the Coursework answer is drawn with tag "' + (cwBtn.dataset.tag || '') + '", not the type colour');
  if (!(await press('projectType', 'Coursework'))) return bad;
  const left = w.stuffFiltered();
  if (left.length !== cwItems.length || left.some(x => x.kind !== 'project' || x.row.projectType !== 'coursework')) {
    bad.push('Coursework leaves ' + left.length + ' item(s) — ' + left.slice(0, 4).map(x => x.kind + ' ' + x.name).join(', ')
      + ' — not the ' + cwItems.length + ' coursework(s)');
  }

  /* ---------- AND OF A MIXED LIST BY THE ONE BAR EVERY FACET HAS (396): asked once half the list is projects, not before § */
  const projs = w.stuffItems().filter(i => i.kind === 'project');
  const others = [];
  w.stuffItems().forEach(i => { if (i.kind !== 'project' && others.length < 2 && !others.some(o => o.kind === i.kind)) others.push(i); });
  if (others.length < 1) bad.push('Find holds nothing but projects, so a mixed list could NOT be built — the leak was NOT checked');
  else {
    const held = t.STUFF().filters.slice();
    t.STUFF().filters.length = 0;
    t.STUFF().filters.push({ field: 'forLabel', any: true }, { field: 'kindLabel', any: true }, { field: 'kindOwn', any: true });
    const few = w.stuffItems().filter(i => i.kind !== 'project').slice(0, projs.length * 2);
    const thin = projs.concat(few);
    const nfThin = w.nextFacet(thin);
    if (few.length >= projs.length && nfThin && nfThin.field === 'projectType') {
      bad.push('Project or coursework is asked of ' + projs.length + ' projects among ' + thin.length + ' things — under half the list, which the one coverage bar refuses');
    }
    const mixed = projs.concat(others);
    const nfMixed = w.nextFacet(mixed);
    /* ANY WHICH IS NEVER ASKED FINER (660): with Which skipped and other kinds left, Project or coursework would re-ask it. */
    if (nfMixed && nfMixed.field === 'projectType') {
      bad.push('Project or coursework is asked of ' + projs.length + ' projects with ' + others.map(o => 'a ' + o.kind).join(' and ')
        + ' after Any which — every answer sits inside Projects, so it is Which asked finer (660)');
    }
    const nfAlone = w.nextFacet(projs);
    if (!nfAlone || nfAlone.field !== 'projectType') bad.push('with the doors skipped, the projects alone ask ' + (nfAlone ? nfAlone.field : 'nothing') + ', not Project or coursework — so the mixed list above proves nothing');
    t.STUFF().filters.length = 0;
    held.forEach(f => t.STUFF().filters.push(f));
  }

  /* THE CARD: FLAGGED, AND ITS BOARD ON THE SUBJECT'S LINE — AGAINST THE FILE. § */
  const x = cwItems[0];
  const raw = rows.find(r => r && String(r.project_id || '').trim() === x.row.id);
  if (!raw) return bad.concat(['no row in data/projects.json has id ' + x.row.id + ' — the card was NOT checked against its file']);
  const box = html => { const d = w.document.createElement('div'); d.innerHTML = html; return d; };
  const card = box(w.stuffCard(x));
  if (tagF(card, 'projectType') !== 'Coursework') bad.push('the coursework card is tagged "' + tagF(card, 'projectType') + '", not [Coursework]');
  const sub = (card.querySelector('.sub') || {}).textContent || '';
  const wantBoard = typeof raw.exam_board === 'string' ? raw.exam_board.trim() : '';
  const wantSpec = typeof raw.spec_ref === 'string' ? raw.spec_ref.trim() : '';
  if (!wantBoard) bad.push(x.row.id + ' names no exam_board in data/projects.json, so the strip was NOT checked — check-projects requires one on a coursework');
  else {
    if (sub.indexOf(wantBoard) < 0) bad.push('the card\'s strip reads "' + sub + '" — no ' + wantBoard + ', which the row names');
    if (x.examBoard !== wantBoard) bad.push('the item answers Exam board with "' + (x.examBoard || '') + '", not the row\'s ' + wantBoard);
  }
  if (wantSpec && sub.indexOf(wantSpec) < 0) bad.push('the card\'s strip reads "' + sub + '" — no spec ' + wantSpec + ', which the row names');
  /* AND AS ONE PAIR: at 320px ` · ` between them let `8552` wrap onto a line of its own. */
  if (wantBoard && wantSpec && sub.indexOf(wantBoard + '\u00a0' + wantSpec) < 0) bad.push('the strip does not hold "' + wantBoard + ' ' + wantSpec + '" joined by a no-break space — the spec can wrap away from its board');
  /* STAGES ON A COURSEWORK, STEPS ON A PROJECT — one word, the same page. */
  const parts = w.pageParts_(x);
  if (JSON.stringify(parts) !== JSON.stringify([null, 'kit', 'steps', 'share'])) bad.push('a coursework is pages ' + JSON.stringify(parts) + ', not a project\'s four');
  const stages = box(w.stuffPart_(x, 'steps'));
  const h = (stages.querySelector('h3') || {}).textContent || '';
  if (h !== 'Stages') bad.push('the coursework\'s ordered page is titled "' + h + '", not Stages');
  if (stages.querySelectorAll('.prac-steps ol > li').length !== x.row.steps.length) bad.push('the Stages page does not number every stage');
  const proj = w.stuffItems().find(i => i.kind === 'project' && i.row.projectType !== 'coursework');
  if (proj && ((box(w.stuffPart_(proj, 'steps')).querySelector('h3') || {}).textContent || '') !== 'Steps') bad.push('a project\'s ordered page is no longer titled Steps');
  if (proj && tagF(box(w.stuffCard(proj)), 'projectType') !== 'Project') bad.push('a project card is no longer tagged [Project]');

  /* THE SHARE PAGE SAYS WHOSE WORK A COURSEWORK IS — the page that sends work to a tutor says where
     a tutor's help stops — and a project's share page does not carry it. */
  const ownNote = [...box(w.stuffPart_(x, 'share')).querySelectorAll('.fc-note')].map(n => n.textContent.replace(/\s+/g, ' ')).join(' ');
  if (!/your own work/.test(ownNote) || !/teacher/.test(ownNote)) bad.push('the coursework\'s share page does not say the work handed in must be the pupil\'s own, and to tell their teacher about outside help');
  if (proj && box(w.stuffPart_(proj, 'share')).querySelector('.fc-note')) bad.push('a project\'s share page carries the coursework\'s own-work note');

  /* FOUND BY WHAT IT IS CALLED, with nothing chosen. § */
  const said = w.stuffHay_(Object.assign({}, x, { _hay: undefined, text: Object.values(raw).join(' ') }));
  const ADDED = ['non-exam', 'dt', 'd&t', 'cutout'];
  ADDED.forEach(q => {
    if (said.indexOf(q) >= 0) bad.push('the row itself says "' + q + '", so searching for it cannot prove `projectText_` adds it — pick a word the row does not say');
  });
  ['coursework', 'graphics', 'movie', 'cut-out', 'cut out', 'nea coursework'].concat(ADDED).forEach(q => {
    t.STUFF().filters.length = 0; t.STUFF().q = q;
    if (!w.stuffFiltered().some(i => i.key === x.key)) bad.push('typing "' + q + '" does not find ' + x.name);
  });
  t.STUFF().q = '';
  return bad;
});

/* ---------- A CONTENT CARD, REACHED THE WAY A QUESTION IS § */
/* ON FIND 2, WHICH CARRIES WHAT FIND CARRIES (docs/history/347): the route is Find's own, run in the
   second column. */
check('a content card, on Find 2 and on Find: What kind · Content, Statistics — the card whole, its animations, its tags, search, star, and a book\'s old star dropped', async () => {
  const read = n => (LIB_FULL.isLib(n) ? LIB_FULL.rows(n) : JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the content cards were NOT checked — not a pass'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
    { textbooks: read('textbooks'), boxers: read('boxers'), fights: read('fights'), projects: read('projects') })));
  const books = made.textbooks || [];
  if (!books.length) return ['the mapper made nothing of data/textbooks.json'];
  if (!(made.boxers || []).length) return ['the mapper made no boxers, so the cards were not found among anything — NOT a pass'];
  const p = payload();
  Object.assign(p, { textbooks: books, boxers: made.boxers, fights: made.fights || [], projects: made.projects || [] });
  const { w } = boot({ member: true, payload: p });
  await wait(300);
  const t = w.__t;
  if (!t.RES || !t.RES()) return ['Find 2\'s state is not exported to the journey'];
  const R = resView_(w);
  const bad = [];
  const stats = books.find(b => b.id === 'TB-GCSE-STATS');
  if (!stats) return ['data/textbooks.json has no TB-GCSE-STATS — ids: ' + books.map(b => b.id).join(', ')];

  t.go('res');
  t.RES().filters.length = 0; t.RES().q = '';
  w.paintFinder_('res');
  /* AND FIND HOLDS THEM TOO — the same list in both columns, one card a chapter. */
  const chapters = books.reduce((n, b) => n + b.chapters.length, 0);
  const cards = w.stuffItems().filter(i => i.kind === 'content');
  if (cards.length !== chapters) bad.push('Find holds ' + cards.length + ' content cards for ' + chapters + ' chapters — one card a chapter');
  if (w.stuffItems().some(i => i.kind === 'textbook')) bad.push('a textbook is still an item on Find');
  /* THE BOOK QUESTION IS RETIRED, and is not in the code's own order any more. */
  if (w.facetList().some(f => f.field === 'book')) bad.push('`book` is still a question in facetList() — nothing answers it');
  const route = ['Learning', 'Library', 'Statistics'];
  const rungs = ['forLabel', 'kindLabel', 'subject'];
  const pressed = [], offered = [];
  for (let guard = 0; route.length && guard < 10; guard++) {
    const btns = [...w.document.querySelectorAll('#s-res [data-do="facet-pick"]')];
    btns.forEach(b => offered.push(b.dataset.field + ':' + b.dataset.value));
    let el = btns.find(b => b.dataset.value === route[0]);
    const rung = w.facetList().find(f => f.field === rungs[rungs.length - route.length]);
    const only = rung ? R.facetValues(R.stuffFiltered(), rung).map(v => String(v.value)) : [];
    if (!el && only.length === 1 && only[0] === route[0]) { pressed.push('(' + route.shift() + ')'); continue; }
    /* A RUNG THE ONE RULE HOLDS BACK HERE (445: without the questions, Content outweighs the rest of What kind) is passed, not failed. */
    if (!el && rung && only.indexOf(route[0]) !== -1 && /lopsided/.test(w.facetWhy_(R.stuffFiltered(), rung))) { pressed.push('~' + route.shift()); continue; }
    if (!el) {
      const grp = (() => { try { return rung.bucketOf(route[0]); } catch (e) { return ''; } })();
      el = grp && btns.find(b => b.dataset.value === grp && b.dataset.bucket);
      if (!el) {
        bad.push('the funnel did not offer "' + route[0] + '" after ' + (pressed.join(' → ') || 'nothing') + ' — it offered '
          + (btns.map(b => b.dataset.field + ':' + b.dataset.value).join(' | ') || 'no answers'));
        break;
      }
    } else route.shift();
    pressed.push(el.dataset.value);
    t.ACTIONS['facet-pick'](el);
    await wait(20);
  }
  if (route.length) return bad;
  /* `Content` IS ITS OWN ANSWER UNDER WHAT KIND, pressed — not a shelf of Resources. */
  if (pressed.indexOf('Library') < 0 && pressed.indexOf('~Library') < 0) bad.push('What kind did not offer Library on Find 2: ' + pressed.join(' → '));
  if (offered.some(o => /^shelf:@family\. textbooks$/.test(o))) bad.push('the @family. textbooks shelf was offered — it went with the books');
  const left = R.stuffFiltered();
  if (left.length !== stats.chapters.length || left.some(i => i.kind !== 'content' || i.subject !== 'Statistics')) {
    bad.push('after ' + pressed.join(' → ') + ' the list is ' + left.length + ' item(s): '
      + left.slice(0, 4).map(x => x.kind + ' ' + x.name).join(', ') + ' — not the ' + stats.chapters.length + ' Statistics cards');
  }
  /* AND NOTHING THAT WAS IN RESOURCES FELL OFF THE SHELVES (445 moved it to Content): the boxing and the Bible keep their door. */
  const shelfFacet = w.facetList().find(f => f.field === 'shelf');
  const resources = R.stuffItems().filter(i => i.kind === 'people' || i.kind === 'fight' || i.kind === 'bible');
  const unshelved = resources.filter(i => !R.facetValues([i], shelfFacet).length);
  if (unshelved.length) bad.push(unshelved.length + ' of ' + resources.length + ' boxing / Bible items are on no shelf — pressing a shelf hides them');
  if (R.stuffItems().some(i => w.kindOf_(i).label === 'Resources')) bad.push('an item is still labelled Resources — it went into Content (445)');
  if (cards.some(i => R.facetValues([i], shelfFacet).length)) bad.push('a content card is on a shelf — the textbooks\' shelf went');

  /* THE CARD, THEN A PAGE PER ANIMATION, in the file's order. "Averages" has none since the mean went to KS2 (436); "Probability" has Bayes. */
  const x = left.find(i => i.name === 'Averages') || cards.find(i => i.key === 'ct:TB-GCSE-STATS-8');
  if (!x) return bad.concat(['no Averages card among the Statistics cards']);
  const parts = w.pageParts_(x);
  /* AND THEN ITS FORMULAS AND ITS WORKED LINES, A TITLED PAGE EACH (408). */
  const want = [null].concat((x.row.animations || []).map(a => 'an' + x.row.n + '-' + a.id), ['formulas', 'worked']);
  if (JSON.stringify(parts) !== JSON.stringify(want)) bad.push('the Averages card is pages ' + JSON.stringify(parts) + ', not the card, its animations, Formulas and Worked examples');
  const xp = left.find(i => i.key === 'ct:TB-GCSE-STATS-15');
  if (!xp || w.pageParts_(xp).indexOf('an15-bayes') < 0) bad.push('the Probability card has no page for Bayes\'s animation: ' + (xp ? JSON.stringify(w.pageParts_(xp)) : 'no card'));
  const box = html => { const d = w.document.createElement('div'); d.innerHTML = html; return d; };
  const card = box(w.stuffCard(x));
  if (!card.querySelector('.card.ct')) bad.push('the card is not drawn as a content card');
  if (card.querySelector('.tb-an-stage')) bad.push('a drawing is on the card itself — each has a page of its own');
  if (xp && !box(w.stuffPart_(xp, 'an15-bayes')).querySelector('.tb-an-stage')) bad.push('Bayes\'s animation has no stage on its page');
  /* WHAT IT IS, FIRST IN THE ONE ROW EVERY CARD WEARS: § */
  /* EVERY FACET A TAG SINCE 396, in the tab's order: What for, then What kind. */
  const lead = [...card.querySelectorAll('.qtags .qtag')].slice(0, 2).map(e => e.getAttribute('data-f') + ':' + e.textContent.trim());
  if (lead.join(' ') !== 'forLabel:Learning kindLabel:Library') bad.push('the card\'s row does not open on [Learning] [Library]: ' + (lead.join(' ') || 'no tag'));
  if (card.querySelector('.fc-flag')) bad.push('the card still wears a head pill of its own');
  const tags = [...card.querySelectorAll('.qtags .qtag')].map(e => e.textContent.trim());
  ['GCSE', 'Statistics', 'Mean', 'Median'].forEach(v => { if (tags.indexOf(v) < 0) bad.push('the Averages card has no "' + v + '" tag: ' + tags.join(' | ')); });
  if (tags.some(v => /^(Edexcel|AQA|OCR)$/.test(v))) bad.push('the Averages card names a board — its words are every board\'s: ' + tags.join(' | '));
  /* A SET TEXT IS ONE BOARD'S, and says so. */
  const mac = cards.find(i => i.name === 'Macbeth: the play at a glance');
  if (!mac || [...box(w.stuffCard(mac)).querySelectorAll('.qtag')].map(e => e.textContent).indexOf('AQA') < 0) bad.push('the Macbeth card does not say AQA — a set text is the board\'s');
  /* A CARD WITH FORMULAS, WHOLE, AND THE ONE THAT IS HIGHER ALL THROUGH. */
  const withMath = cards.find(i => i.row.formulas.some(f => /\//.test(f.text)));
  /* ITS EVERY PAGE TOGETHER: the key words on the card, Formulas and Worked examples a page each (408). */
  const pg = box(w.stuffCard(withMath) + w.stuffPart_(withMath, 'formulas') + w.stuffPart_(withMath, 'worked'));
  const c = withMath.row;
  if (pg.querySelectorAll('.tb-words li').length !== c.words.length) bad.push(withMath.name + ' does not list every key word');
  if (pg.querySelectorAll('.tb-math li').length !== c.formulas.length) bad.push(withMath.name + ' does not list every formula');
  if (!pg.querySelector('.tb-math .frac .frac-n') || !pg.querySelector('.tb-math .frac .frac-d')) bad.push(withMath.name + '\'s fractions are not stacked — typeset_ was not run over the formulas');
  if (pg.querySelectorAll('.tb-points li').length !== c.points.length) bad.push(withMath.name + ' does not list every worked line');
  const hItems = c.words.concat(c.formulas, c.points).filter(i => i.higher).length;
  if (pg.querySelectorAll('li .tb-h').length !== hItems) bad.push(withMath.name + ' marks ' + pg.querySelectorAll('li .tb-h').length + ' lines Higher, the file says ' + hItems);
  const hc = cards.find(i => i.row.higher);
  if (hc) {
    const hb = box(w.stuffCard(hc));
    /* SAID ONCE, AS THE TIER TAG: the heading's own `H` said it a second time (355). */
    if (hb.querySelector('h3 .tb-h')) bad.push(hc.name + '\'s heading still marks it H beside its [Higher] tag');
    if ([...hb.querySelectorAll('.qtag')].map(e => e.textContent).indexOf('Higher') < 0) bad.push(hc.name + ' is Higher all through and has no Higher tag');
  }
  /* NOTHING THE APP SAYS IS TEXTBOOK OR CHAPTER — every card and every animation page, all of them. § */
  const said = [];
  cards.forEach(i => w.pageParts_(i).forEach(part => {
    const d = box(part ? w.stuffPart_(i, part) : w.stuffCard(i));
    d.querySelectorAll('.fc-sec').forEach(n => n.remove());
    const txt = d.textContent;
    if (/text ?book|\bchapter\b/i.test(txt)) said.push(i.name + (part ? ' #' + part : ''));
  }));
  if (said.length) bad.push(said.length + ' content page(s) say textbook or chapter: ' + said.slice(0, 4).join(', '));

  /* SEARCHABLE BY ITS WORDS — one that is only inside a card, never in its title — ON BOTH FINDERS. */
  t.RES().filters.length = 0; t.RES().q = 'frequency density';
  if (!R.stuffFiltered().some(i => i.kind === 'content')) bad.push('typing "frequency density" on Find 2 does not find a content card — the words are not in its haystack');
  t.RES().q = '';
  t.STUFF().filters.length = 0; t.STUFF().q = 'frequency density';
  if (!w.stuffFiltered().some(i => i.kind === 'content')) bad.push('typing "frequency density" on Find does not find a content card — both finders carry them');
  t.STUFF().q = '';

  /* STARRABLE, by the card's own Save tile, and kept on Saved. */
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const fav = box(w.stuffCard(x)).querySelector('[data-do="fav"]');
  if (!fav) bad.push('the content card has no Save tile');
  else {
    t.ACTIONS.fav(fav);
    const kept = t.savedPages().join('');
    if (!/class="card fc prac tb ct/.test(kept)) bad.push('the card was starred and is not on the Saved column');
    /* A BOOK STARRED BEFORE THIS (`tb:<id>`) NAMES NO ITEM NOW: Saved draws nothing for it — no card,
       no blank, no "undefined" — and the content card beside it is drawn exactly as before. */
    w.toggleFav('tb:TB-GCSE-STATS', 'textbook');
    const after = t.savedPages().join('');
    if (after !== kept) bad.push('a star on a book from before drew something on Saved — it names no item and must be dropped quietly');
    if (/undefined|GCSE Statistics/.test(after)) bad.push('Saved draws the old book (or an undefined) for a star that names nothing');
  }
  return bad;
});

/* FIND 2: ONE FINDER, TWICE, IMMEDIATELY RIGHT OF FIND (docs/history/329, reversed in 347) THE OWNER, 10 Oct, built a second column for the resources § */
const RES_MADE_ = { v: null };
const resPayload_ = async () => {
  if (!RES_MADE_.v) {
    const one = boot();
    for (let i = 0; i < 80 && typeof one.w.libraryExtras_ !== 'function'; i++) await wait(25);
    if (typeof one.w.libraryExtras_ !== 'function') return null;
    const read = n => (LIB_FULL.isLib(n) ? LIB_FULL.rows(n) : JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')));
    RES_MADE_.v = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
      { textbooks: read('textbooks'), boxers: read('boxers'), fights: read('fights'), projects: read('projects') })));
  }
  const m = RES_MADE_.v;
  /* THE PROJECTS TOO, so Find has a `What kind` of its own to ask while the resources are away. */
  return Object.assign(payload(), { textbooks: m.textbooks || [], boxers: m.boxers || [], fights: m.fights || [], projects: m.projects || [] });
};
/* A call made as Find 2: `inFinder_` is the app's own binding (find.js). */
const inRes_ = (w, fn) => w.inFinder_(w.finderOf_('res'), fn);
/* THE APP'S OWN FUNCTIONS, EACH CALLED AS FIND 2 — `R.stuffFiltered()` is Find 2's list, `R.nextFacet(l)` its next question, `R.paintStuff()` its repaint. § */
const resView_ = w => new Proxy({}, { get: (_, k) => (...a) => inRes_(w, () => w[k](...a)) });
const resBoot_ = async (opts) => {
  const p = await resPayload_();
  if (!p) return null;
  const b = boot(Object.assign({ payload: p, member: true }, opts || {}));
  for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
  await wait(250);
  return b.w.__t ? b : null;
};
/* THE PAGE TABLE ITSELF. § */
const pg_ = t => (typeof t.PAGE === 'function' ? t.PAGE() : t.PAGE) || {};
/* THE ANSWERS A COLUMN'S QUESTION PAGE DRAWS, as `field:value`, in the order drawn. */
const resAnswers_ = (w, id) => [...w.document.querySelectorAll('#s-' + id + ' #' + id + '-groups [data-do="facet-pick"]')]
  .map(el => el.dataset.field + ':' + el.dataset.value);
const resType_ = (w, id, v) => {
  const el = w.document.getElementById(id + '-q');
  if (!el) return false;
  el.value = v;
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
  return true;
};

/* ---------- ONE WIDGET PER THING (408) ----------
   "If a thing needs more than one widget (page), each must have a title that distinguishes it, so it earns its place." */
check('one widget per thing: every page of every content card, practical and project is titled, no title twice in one card, one drawing a page, and a waiting card is one titled page', async () => {
  const read = n => (LIB_FULL.isLib(n) ? LIB_FULL.rows(n) : JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the pages were NOT checked — not a pass'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
    { practicals: read('practicals'), projects: read('projects'), textbooks: read('textbooks') })));
  const p = payload();
  Object.assign(p, { practicals: made.practicals || [], projects: made.projects || [], textbooks: made.textbooks || [] });
  const { w } = boot({ member: true, payload: p });
  await wait(300);
  const need = ['pageParts_', 'stuffPart_', 'stuffCard', 'contentPageTitle_', 'libWaitHtml_', 'stuffItemsAll_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The titles were NOT checked'];
  const bad = [];
  const KINDS = ['content', 'practical', 'project'];
  const items = w.stuffItemsAll_().filter(x => x && KINDS.indexOf(x.kind) !== -1);
  KINDS.forEach(k => { if (!items.some(x => x.kind === k)) bad.push('no ' + k + ' reached the finder, so its pages were NOT checked'); });
  const box = html => { const d = w.document.createElement('div'); d.innerHTML = html; return d; };
  const kids = (el, tag) => [...el.children].filter(e => e.tagName === tag);
  /* THE PAGE'S TITLE: the card's own name on its first page, the `h3` straight under the card on every other. */
  const titleOf = (el, part) => {
    const card = el.querySelector('.card');
    if (!card) return '';
    const h = part ? kids(card, 'H3')[0] : card.querySelector('.fc-head h3');
    /* THE TAGS ARE THE TITLE (499): a card whose name its tags already say has no heading, and its name is its aria-label. */
    if (!h && !part && card.getAttribute('aria-label') && card.querySelector('.qtags')) return card.getAttribute('aria-label').trim();
    return h ? h.textContent.trim() : '';
  };
  let pages = 0, anims = 0;
  items.forEach(x => {
    if (w.libSlim_(x)) { bad.push(x.key + ' is still waiting for its words with the whole library loaded'); return; }
    const seen = {};
    w.pageParts_(x).forEach(part => {
      pages++;
      const el = box(part ? w.stuffPart_(x, part) : w.stuffCard(x));
      const name = x.name + ' (' + x.kind + ') page ' + (part || 'card');
      const t = titleOf(el, part);
      if (!t) { bad.push(name + ' has no title'); return; }
      if (seen[t]) bad.push(x.name + ' (' + x.kind + '): pages ' + seen[t] + ' and ' + (part || 'card') + ' are both titled "' + t + '"');
      seen[t] = part || 'card';
      const stages = el.querySelectorAll('.tb-an-stage').length;
      const isAn = /^an\d+-/.test(String(part || ''));
      if (isAn) anims++;
      if (stages !== (isAn ? 1 : 0)) bad.push(name + ' holds ' + stages + ' drawing(s) — one on its own page, none anywhere else');
      if (x.kind !== 'content') return;
      if (part && t !== w.contentPageTitle_(x, part)) bad.push(name + ' is titled "' + t + '", not "' + w.contentPageTitle_(x, part) + '"');
      if (isAn && !/^Watch: \S/.test(t)) bad.push(name + ' is titled "' + t + '" — a drawing\'s page says Watch and its name');
      /* NO SECOND WIDGET INSIDE A PAGE: the card holds its key words only; a page past it has no heading of its own inside. */
      if (!part && el.querySelector('.tb-math, .tb-points')) bad.push(name + ' still carries its formulas or worked lines — each is a page of its own');
      if (part && el.querySelector('h4')) bad.push(name + ' has a heading inside it, "' + el.querySelector('h4').textContent + '" — a second widget on one page');
      /* A DRAWING'S PAGE IS NOT EMPTY: its caption may be absent (a `lib_pending` chapter, 411); check-textbooks holds `about`. */
      if (part && !isAn && !el.querySelector('li')) bad.push(name + ' is titled and empty');
    });
    if (x.kind === 'content') {
      const c = x.row, parts = w.pageParts_(x);
      if ((c.formulas || []).length && parts.indexOf('formulas') < 0) bad.push(x.name + ' has formulas and no Formulas page');
      if ((c.points || []).length && parts.indexOf('worked') < 0) bad.push(x.name + ' has worked lines and no Worked examples page');
      if (!(c.formulas || []).length && parts.indexOf('formulas') >= 0) bad.push(x.name + ' has a Formulas page and no formulas');
    }
  });
  if (!anims) bad.push('no drawing\'s page was met among ' + pages + ' pages — the one-drawing rule was NOT exercised');
  /* AND WAITING (397): before its words come a card is ONE page, its title over the loader's dots. */
  const ct = items.find(x => x.kind === 'content');
  if (ct) {
    const slim = Object.assign({}, ct, { row: Object.assign({}, ct.row, { lib_has: 'words points formulas' }) });
    const el = box(w.libWaitHtml_(slim));
    if (titleOf(el, null) !== ct.name) bad.push('a waiting content card is titled "' + titleOf(el, null) + '", not its name');
    const say = el.querySelector('.lib-say');
    if (!say || say.innerHTML.trim() !== w.loading_().trim()) bad.push('a waiting content card does not show loading_()\'s dots, signed in: ' + (say ? say.textContent.trim().slice(0, 120) : 'no .lib-say'));
    if (el.querySelectorAll('.card').length !== 1) bad.push('a waiting content card is ' + el.querySelectorAll('.card').length + ' cards — one page until its words come');
  }
  return bad;
});

check('Find 2: a column immediately right of Find, called Find 2 with Find\'s icon — the tab row, data/settings/columns.json, one swipe from Find, its own search box, and Find\'s first question', async () => {
  const file = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'settings', 'columns.json'), 'utf8'));
  /* THE REAL FILE, SERVED, so the order a phone is given is the one checked — `applyColumns_` keeps only
     the columns it names, in its order. */
  const b = await resBoot_({ serve: url => (/data\/settings\/columns\.json/.test(url) ? file : undefined) });
  if (!b) return ['the app or libraryExtras_ did not load — the second finder was NOT checked'];
  const { w } = b, t = w.__t, d = w.document, bad = [];
  for (let i = 0; i < 80 && !(t.DATA().columns || []).length; i++) await wait(25);
  if (!(t.DATA().columns || []).length) bad.push('data/settings/columns.json never reached DATA.columns — the file\'s order was NOT checked');
  const ids = t.TABS.map(x => x.id);
  const i = ids.indexOf('stuff'), j = ids.indexOf('res');
  /* ONLY ONE FINDER FOR NOW (owner, 880): while columns.json has Find 2 off, the phone must not offer it */
  const resRow = file.find(r => r && r.screen === 'res');
  if (resRow && String(resRow.active).toUpperCase() === 'FALSE') return j < 0 ? bad : bad.concat(['Find 2 is off in columns.json (880) and still a column: ' + ids.join(' ')]);
  if (j < 0) return bad.concat(['there is no `res` column on the phone: ' + ids.join(' ')]);
  if (j !== i + 1) bad.push('Find 2 is column ' + j + ' and Find ' + i + ' — wanted immediately right of Find: ' + ids.join(' '));
  /* CALLED WHAT IT IS — "finder 2", "an identical second finder" — WITH FIND'S OWN ICON, on the phone
     (the file served, `applyColumns_` over it) and in the file itself. */
  if (t.TABS[j].label !== 'Find 2') bad.push('the column is labelled ' + JSON.stringify(t.TABS[j].label) + ', not Find 2');
  if (t.TABS[j].icon !== t.TABS[i].icon) bad.push('the column\'s icon is ' + JSON.stringify(t.TABS[j].icon) + ', not Find\'s ' + JSON.stringify(t.TABS[i].icon));
  const row = file.find(r => r.screen === 'res');
  if (!row) bad.push('data/settings/columns.json has no `res` row, so the column is on no phone');
  else if (row.label !== 'Find 2' || row.icon !== (file.find(r => r.screen === 'stuff') || {}).icon) bad.push('data/settings/columns.json calls the column ' + JSON.stringify(row.label) + ' ' + JSON.stringify(row.icon) + ' — wanted Find 2 with Find\'s icon');
  /* AND IN THE CODE'S OWN ORDER, which is the order whenever the file is not read (`TAB_ORDER`). */
  const bare = boot();
  for (let k = 0; k < 80 && !bare.w.__t; k++) await wait(25);
  if (bare.w.__t) {
    const T0 = bare.w.__t.TABS, ids0 = T0.map(x => x.id);
    if (ids0.indexOf('res') !== ids0.indexOf('stuff') + 1) bad.push('without the file, TAB_ORDER puts Find 2 at ' + ids0.indexOf('res') + ' and Find at ' + ids0.indexOf('stuff') + ': ' + ids0.join(' '));
    /* AND THE SAME ROW THE FILE GIVES (392): the code's order is what shows until the file lands, so a difference moves columns under a thumb. */
    if (ids0.join(' ') !== ids.join(' ')) bad.push('without the file the row is ' + ids0.join(' ') + ', with it ' + ids.join(' ') + ' — TAB_ORDER and columns.json disagree');
    /* AND THE CODE'S OWN NAME, which is the name whenever the file is not read. */
    const r0 = T0.find(x => x.id === 'res') || {}, f0 = T0.find(x => x.id === 'stuff') || {};
    if (r0.label !== 'Find 2' || r0.icon !== f0.icon) bad.push('without the file the column is ' + JSON.stringify(r0.label) + ' ' + JSON.stringify(r0.icon) + ' — wanted Find 2 with Find\'s icon ' + JSON.stringify(f0.icon));
  } else bad.push('the second boot did not load, so TAB_ORDER was NOT checked');
  /* ONE SWIPE FROM FIND, AND ITS OWN PAGE: a search box, chips and the question, under its own ids. */
  t.go('stuff', false, true);
  await wait(60);
  const next = t.TABS[t.TABS.findIndex(x => x.id === t.AT()) + 1];
  if (!next || next.id !== 'res') bad.push('the column one swipe right of Find is ' + (next ? next.id : 'nothing'));
  t.go('res', false, true);
  await wait(120); await woken_();
  const host = d.getElementById('s-res');
  if (!host) return bad.concat(['index.html has no <section id="s-res">']);
  if (!host.querySelector('#res-q.search')) bad.push('Find 2 has no search box of its own (#res-q)');
  if (!host.querySelector('#res-chips') || !host.querySelector('#res-groups')) bad.push('Find 2 has no chips row or question (#res-chips, #res-groups)');
  if (host.querySelector('#stuff-q') || d.getElementById('s-stuff').querySelector('#res-q')) bad.push('a finder drew the other finder\'s search box');
  /* ITS FIRST QUESTION IS FIND'S, BY THE FUNNEL'S OWN RULES — the same list asks the same question.
     It was Shelf while the column held the resources alone (329). */
  t.go('stuff', false, true);
  await wait(120); await woken_();
  const find = resAnswers_(w, 'stuff');
  t.go('res', false, true);
  await wait(120); await woken_();
  const answers = resAnswers_(w, 'res');
  if (!answers.length) bad.push('Find 2 draws no first question');
  if (answers.join(' | ') !== find.join(' | ')) bad.push('Find 2 asks ' + (answers.join(' | ') || 'nothing') + ' first, Find asks ' + (find.join(' | ') || 'nothing') + ' — wanted the same question');
  if (answers.some(a => /^shelf:/.test(a))) bad.push('Find 2 asks Shelf first, which is the split\'s question (329): ' + answers.join(' | '));
  return bad;
});

check('both finders carry the same items — the same keys, the same count, every kind the whole list offers — and ask the same What kind; a kind relabelled in the sheet moves nothing between them', async () => {
  const b = await resBoot_();
  if (!b) return ['the app or libraryExtras_ did not load — NOT checked'];
  const { w } = b, t = w.__t, bad = [];
  const find = w.stuffItems();
  const res = inRes_(w, () => w.stuffItems());
  const kinds = l => [...new Set(l.map(x => x.kind))].sort().join(', ') || 'nothing';
  const keys = l => l.map(x => String(x.key || x.kind + ':' + x.name)).sort();
  if (!find.length) return ['Find holds nothing — NOT checked'];
  /* THE SAME LIST, BOTH WAYS: every key on one is on the other, and as many of them. */
  const fk = keys(find), rk = keys(res);
  if (fk.length !== rk.length) bad.push('Find holds ' + fk.length + ' items and Find 2 ' + rk.length + ' — the same finder twice holds the same list');
  const rs = new Set(rk), fs_ = new Set(fk);
  const onlyF = fk.filter(k => !rs.has(k)), onlyR = rk.filter(k => !fs_.has(k));
  if (onlyF.length) bad.push(onlyF.length + ' item(s) on Find and not on Find 2, first ' + onlyF.slice(0, 3).join(', '));
  if (onlyR.length) bad.push(onlyR.length + ' item(s) on Find 2 and not on Find, first ' + onlyR.slice(0, 3).join(', '));
  /* EVERYTHING THE WHOLE LIST OFFERS, on each — the content cards, the boxers, the fights AND the
     projects — less only what the funnel offers nobody (`FUNNEL_NOT_FOR`: Booking and Shop). */
  ['content', 'people', 'fight', 'project'].forEach(k => {
    if (!find.some(x => x.kind === k)) bad.push('Find holds no ' + k);
    if (!res.some(x => x.kind === k)) bad.push('Find 2 holds no ' + k);
  });
  const offered = w.stuffItemsAll_().filter(x => {
    const g = [].concat(x.groups || w.kindOf_(x).group || []).filter(Boolean);
    return !(g.length && g.every(k => ['Booking', 'Shop'].indexOf(k) >= 0));
  });
  if (keys(offered).join('|') !== fk.join('|')) bad.push('Find\'s list is not the whole list less Booking and Shop: whole ' + offered.length + ' (' + kinds(offered) + '), Find ' + find.length);
  /* WHAT KIND, ASKED OF EACH: the same answers, Content among them and Resources not (445). */
  const kl = w.facetList().find(f => f.field === 'kindLabel');
  const said = l => w.facetValues(l, kl).map(v => String(v.value) + ' ' + v.n).join(', ');
  const fSaid = said(find), rSaid = inRes_(w, () => said(res));
  if (fSaid !== rSaid) bad.push('What kind on Find offers ' + fSaid + ' and on Find 2 ' + rSaid);
  if (!/\bLibrary\b/.test(fSaid) || !/\bPractice\b/.test(fSaid)) bad.push('What kind does not offer both Practice and Library: ' + fSaid);
  if (/\bResources\b/.test(fSaid)) bad.push('What kind still offers Resources — it went into Content (445): ' + fSaid);
  /* SEARCH: a word that is only inside a content card's words finds the card on both. */
  t.STUFF().filters.length = 0; t.STUFF().q = 'frequency density';
  const fHits = w.stuffFiltered();
  t.STUFF().q = '';
  t.RES().filters.length = 0; t.RES().q = 'frequency density';
  const rHits = inRes_(w, () => w.stuffFiltered());
  t.RES().q = '';
  if (!fHits.some(x => x.kind === 'content')) bad.push('typing "frequency density" on Find does not find the content card');
  if (!rHits.some(x => x.kind === 'content')) bad.push('typing "frequency density" on Find 2 does not find the content card');
  if (keys(fHits).join('|') !== keys(rHits).join('|')) bad.push('"frequency density" finds ' + fHits.length + ' on Find and ' + rHits.length + ' on Find 2');
  /* ONE LIST, COUNTED ONCE: § */
  const fBare = w.stuffFiltered(), rBare = inRes_(w, () => w.stuffFiltered());
  if (fBare !== rBare) bad.push('Find and Find 2 ask their first question of two copies of the same list — every tally of it is counted twice');
  /* A KIND RELABELLED IN THE LIVE SHEET MOVES NOTHING BETWEEN THEM: § */
  const was = t.DATA().kinds;
  t.DATA().kinds = [{ kind: 'people', group: 'Learning', label: 'Fighters', active: true }];
  w.stuffForget_();
  const f2 = w.stuffItems(), r2 = inRes_(w, () => w.stuffItems());
  const fB = f2.filter(x => x.kind === 'people').length, rB = r2.filter(x => x.kind === 'people').length;
  if (!fB || fB !== rB) bad.push('the kinds tab relabelled the boxers and the finders hold ' + fB + ' and ' + rB + ' of them — wanted all of them on both');
  const fS2 = said(f2), rS2 = inRes_(w, () => said(r2));
  if (!/\bFighters\b/.test(fS2) || fS2 !== rS2) bad.push('after the relabel What kind says ' + fS2 + ' on Find and ' + rS2 + ' on Find 2 — wanted Fighters on both, the same');
  t.DATA().kinds = was;
  w.stuffForget_();
  return bad;
});

check('two finders, no shared state: a chip, a search word or a page turned in one never reaches the other — whichever column a press comes from', async () => {
  const b = await resBoot_();
  if (!b) return ['the app or libraryExtras_ did not load — NOT checked'];
  const { w } = b, t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  const F = () => JSON.stringify([t.STUFF().filters, t.STUFF().q]);
  const R = () => JSON.stringify([t.RES().filters, t.RES().q]);
  t.go('stuff', false, true); await wait(60);
  t.go('res', false, true); await wait(120); await woken_();
  /* A CHIP PRESSED ON FIND 2 IS FIND 2'S ALONE — the answer its question draws for the resources,
     since both columns ask the same first question now (347) and `Resources` keeps the boxers for
     the word below. */
  /* ITS FIRST ANSWER, whatever the one rule asks first — Resources went into Content in 445, so no answer is named here. */
  const shelf = [...d.querySelectorAll('#s-res #res-groups [data-do="facet-pick"]')].find(b => b.dataset.value && !b.dataset.bucket);
  if (!shelf) return ['Find 2 offers no answer to press — NOT checked: ' + resAnswers_(w, 'res').join(' | ')];
  const rPick = { field: shelf.dataset.field, value: shelf.dataset.value };
  const f0 = F();
  A['facet-pick'](shelf);
  if (JSON.stringify(t.RES().filters) !== JSON.stringify([rPick])) bad.push('pressing ' + rPick.value + ' on Find 2 left its chips ' + JSON.stringify(t.RES().filters));
  if (F() !== f0) bad.push('a chip pressed on Find 2 reached Find: ' + F());
  if (d.getElementById('res-chips').textContent.indexOf(rPick.value) < 0) bad.push('Find 2\'s chips row does not show ' + rPick.value);
  if (((d.getElementById('stuff-chips') || {}).textContent || '').indexOf(rPick.value) >= 0) bad.push('Find\'s chips row shows ' + rPick.value);
  /* A WORD TYPED IN FIND 2'S BOX IS FIND 2'S ALONE. */
  resType_(w, 'res', 'ali');
  await wait(260);
  if (t.RES().q !== 'ali') bad.push('typing in #res-q left Find 2\'s words ' + JSON.stringify(t.RES().q));
  if (t.STUFF().q) bad.push('typing in #res-q put ' + JSON.stringify(t.STUFF().q) + ' into Find\'s words');
  /* A PAGE TURNED IN FIND 2 IS FIND 2'S ALONE. */
  const p0 = pg_(t).stuff;
  const first = inRes_(w, () => w.stuffFirstResult_());
  const n = inRes_(w, () => w.stuffPages_().length);
  if (!n) bad.push(rPick.value + ' and "ali" left nothing to turn to on Find 2 — the page rule was NOT checked');
  else {
    t.goPage('res', first + Math.min(1, n - 1), true);
    await wait(80);
    if (pg_(t).res !== first + Math.min(1, n - 1)) bad.push('Find 2 did not turn to page ' + (first + 1) + ' (it is on ' + pg_(t).res + ')');
    if (pg_(t).stuff !== p0) bad.push('turning a page on Find 2 moved Find from page ' + p0 + ' to ' + pg_(t).stuff);
  }
  /* AND BACK ON FIND, EVERYTHING THE OTHER WAY ROUND. */
  t.go('stuff', false, true); await wait(120); await woken_();
  const r0 = R(), pr = pg_(t).res;
  const pick = d.querySelector('#s-stuff #stuff-groups [data-do="facet-pick"]');
  if (!pick) bad.push('Find drew no answer to press — the reverse was NOT checked');
  else {
    A['facet-pick'](pick);
    if (!t.STUFF().filters.length) bad.push('pressing an answer on Find left no chip on Find');
    if (R() !== r0) bad.push('a chip pressed on Find changed Find 2: ' + R());
  }
  resType_(w, 'stuff', 'fractions');
  await wait(260);
  if (t.STUFF().q !== 'fractions') bad.push('typing in #stuff-q left Find\'s words ' + JSON.stringify(t.STUFF().q));
  if (t.RES().q !== 'ali') bad.push('typing in #stuff-q changed Find 2\'s words to ' + JSON.stringify(t.RES().q));
  t.goPage('stuff', 0, true);
  if (pg_(t).res !== pr) bad.push('turning a page on Find moved Find 2 from ' + pr + ' to ' + pg_(t).res);
  /* A PRESS FROM NOWHERE — a detached button, as the checks press — acts on the column in front. */
  A['filter-clear'](d.createElement('button'));
  if (t.STUFF().filters.length) bad.push('Clear pressed with Find in front left Find\'s chips');
  if (R() !== r0) bad.push('Clear pressed with Find in front cleared Find 2 too: ' + R());
  /* AND FIND 2'S OWN CLEAR TILE CLEARS FIND 2 ONLY. */
  t.go('res', false, true); await wait(120);
  const clear = d.querySelector('#res-clear [data-do="filter-clear"]');
  if (!clear) bad.push('Find 2 has no Clear tile beside its box while it holds a chip');
  else {
    t.STUFF().filters.push({ field: 'kindLabel', value: 'Library' }, { field: 'kindOwn', value: 'Projects' });
    A['filter-clear'](clear);
    if (t.RES().filters.length) bad.push('Find 2\'s Clear left ' + JSON.stringify(t.RES().filters));
    if (JSON.stringify(t.STUFF().filters) !== JSON.stringify([{ field: 'kindLabel', value: 'Library' }, { field: 'kindOwn', value: 'Projects' }])) bad.push('Find 2\'s Clear reached Find: ' + JSON.stringify(t.STUFF().filters));
  }
  return bad;
});

check('Find 2 keeps its own place across a reload — the column, its chips and the animation in front — and Find keeps its own; a kept chip nothing will answer comes back dropped, one nothing answers yet comes back kept', async () => {
  const ADA = ANS_ADA;
  const one = await resBoot_({ before: signedInAs_(ADA) });
  if (!one) return ['the app or libraryExtras_ did not load — NOT checked'];
  const W = one.w, T = W.__t, bad = [];
  /* REMEMBERED, as a finger's swipe is (`familyTab`): the column is half of where you were. */
  T.go('res');
  await wait(80);
  /* A CONTENT CARD'S ANIMATION, a page past its card: Bayes's, under Probability. */
  const chips = [{ field: 'kindLabel', value: 'Library' }, { field: 'subject', value: 'Statistics' }];
  T.RES().filters = chips.map(f => Object.assign({}, f));
  W.paintFinder_('res');
  const pages = inRes_(W, () => W.stuffPages_());
  const at = pages.findIndex(pg => pg.x && pg.x.kind === 'content' && pg.part === 'an15-bayes');
  if (at < 0) return ['What kind · Content, Subject · Statistics has no page for Bayes\'s animation — nothing was reloaded'];
  T.goPage('res', inRes_(W, () => W.stuffFirstResult_()) + at, true);
  await wait(150);
  const want = pg_(T).res;
  /* FIND HAS A PLACE OF ITS OWN, which is not in front and so is not the one a reload comes back to. */
  T.STUFF().filters = [{ field: 'kindLabel', value: 'Library' }, { field: 'kindOwn', value: 'Projects' }];
  W.paintStuff();
  W.localStorage.setItem('familyTabAt', String(Date.now() - 20 * 60 * 1000));
  W.dispatchEvent(new W.Event('pagehide'));
  const kept = keptStore_(W);
  const resKey = Object.keys(kept).find(k => /^draft:u:P7:res:place$/.test(k));
  if (!resKey) return bad.concat(['nothing was kept under draft:u:P7:res:place: ' + Object.keys(kept).filter(k => /place/.test(k)).join(', ')]);
  if (Object.keys(kept).some(k => /:find:place$/.test(k) && /Statistics/.test(kept[k]))) bad.push('Find 2\'s chips were kept under Find\'s place');
  const two = await resBoot_({ before: fromStore_(kept) });
  if (!two) return bad.concat(['the reload did not load — NOT checked']);
  const w = two.w, t = w.__t;
  for (let i = 0; i < 100 && !(t.RES().filters || []).length; i++) await wait(50);
  await wait(200);
  if (t.AT() !== 'res') bad.push('the reload opened on ' + t.AT() + ', not Find 2');
  if (JSON.stringify(t.RES().filters) !== JSON.stringify(chips)) bad.push('the reload brought Find 2 back with the chips ' + JSON.stringify(t.RES().filters));
  if (pg_(t).res !== want) bad.push('the reload put Find 2 on page ' + pg_(t).res + ', not Bayes\'s animation\'s ' + want);
  const shown = w.document.querySelector('#s-res .card.is-an15-bayes');
  if (!shown) bad.push('after the reload Bayes\'s animation is not drawn on Find 2');
  if ((t.STUFF().filters || []).length) bad.push('the reload put Find 2\'s place on Find: ' + JSON.stringify(t.STUFF().filters));
  /* AND FIND'S OWN, FROM FIND: kept under its own name and brought back to Find, Find 2 untouched. */
  const t2 = two.w;
  t.go('stuff');
  await wait(60);
  t.STUFF().filters = [{ field: 'kindLabel', value: 'Library' }, { field: 'kindOwn', value: 'Projects' }];
  t2.paintStuff();
  t2.localStorage.setItem('familyTabAt', String(Date.now() - 20 * 60 * 1000));
  t2.dispatchEvent(new t2.Event('pagehide'));
  const kept2 = keptStore_(t2);
  const three = await resBoot_({ before: fromStore_(kept2) });
  if (!three) return bad.concat(['the second reload did not load — NOT checked']);
  const t3 = three.w.__t;
  for (let i = 0; i < 100 && !(t3.STUFF().filters || []).length; i++) await wait(50);
  if (t3.AT() !== 'stuff') bad.push('the reload from Find opened on ' + t3.AT());
  if (JSON.stringify(t3.STUFF().filters) !== JSON.stringify([{ field: 'kindLabel', value: 'Library' }, { field: 'kindOwn', value: 'Projects' }])) bad.push('the reload from Find brought Find back with ' + JSON.stringify(t3.STUFF().filters));
  if ((t3.RES().filters || []).length) bad.push('the reload from Find put chips on Find 2: ' + JSON.stringify(t3.RES().filters));
  /* A PLACE KEPT BEFORE THIS CHANGE, AND CHIPS NOTHING WILL ANSWER (`placeChipDead_`). § */
  const stale = Object.assign({}, kept2);
  const early = { field: 'paperId', value: 'P-NOT-HERE-YET' };
  Object.keys(stale).filter(k => /^draft:u:P7:find:place$/.test(k)).forEach(k => {
    const dd = JSON.parse(stale[k]); const p = JSON.parse(dd.v);
    p.f = [{ field: 'kindLabel', value: 'Library' }, { field: 'kindOwn', value: 'Projects' }, { field: 'shelf', value: 'Boxing' }, { field: 'shelf', value: 'Writings' },
           { field: 'bibleTranslation', value: 'KJV' }, { field: 'bibleBook', value: 'Genesis' },
           { field: 'examWave', value: 'Summer 2018' }, { field: 'shelf', value: '@family. textbooks' },
           { field: 'book', value: 'GCSE Statistics' }, early];
    dd.v = JSON.stringify(p); stale[k] = JSON.stringify(dd);
  });
  const four = await resBoot_({ before: fromStore_(stale) });
  if (!four) return bad.concat(['the stale reload did not load — the dead-chip rule was NOT checked']);
  const t4 = four.w.__t;
  for (let i = 0; i < 100 && !(t4.STUFF().filters || []).length; i++) await wait(50);
  const want4 = [{ field: 'kindLabel', value: 'Library' }, { field: 'kindOwn', value: 'Projects' }, { field: 'shelf', value: 'Boxing' }, early];
  if (JSON.stringify(t4.STUFF().filters) !== JSON.stringify(want4)) bad.push('a kept place holding Shelf · Boxing, the Books shelf, Bible chips, a retired question and a paper not here yet came back to Find as ' + JSON.stringify(t4.STUFF().filters) + ' (the textbooks\' shelf and a Book chip among them)' + ' — wanted ' + JSON.stringify(want4));
  /* AND A CHIP ON A FIELD NO FACET ASKS, once the facets have arrived — it is a chip that does nothing (`filterHit` reads a facetless chip as matching everything). § */
  const w4 = four.w, D = t4.DATA();
  const ghost = { field: 'noSuchQuestion', value: 'x' };
  const wasF = D.facets;
  D.facets = [];
  const earlyF = [w4.placeChipDead_(ghost), inRes_(w4, () => w4.placeChipDead_(ghost))];
  D.facets = [{ field: 'subject', label: 'Subject', order: 30, minCoverage: null, active: true }];
  const lateF = [w4.placeChipDead_(ghost), inRes_(w4, () => w4.placeChipDead_(ghost))];
  D.facets = wasF;
  if (earlyF.some(Boolean)) bad.push('a chip on a field no facet asks was dropped before the facets arrived — it may be a sheet-only question not here yet');
  if (!lateF.every(Boolean)) bad.push('a chip on a field no facet asks was kept once the facets arrived (Find ' + !lateF[0] + ', Find 2 ' + !lateF[1] + ') — it would hang on as a chip that does nothing');
  return bad;
});

