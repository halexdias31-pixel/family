/* THE TWO "NOT DONE"s OF NOTE 317, CLOSED AT THE MERGE. § */
check('edges: a visitor trimming the owner\'s answer one key at a time leaves it hers to the last character (317)', async () => {
  const bad = [];
  {
    const b = edgeBoot_(signedInAs_(ANS_ADA));
    const { w } = b;
    await wait(300);
    const c = ansCards_(w, 'T1');
    if (!(await b.end('tok-P7'))) return [EDGE_ENDED];
    c.draw();
    const bareM = 'ans:' + c.maths.key, benM = 'ans:u:P8:' + c.maths.key;
    ansType_(w, c.kp(), '80');
    if (w.ansMayMove_(bareM, benM) !== '') return ['setup: "80" typed signed out was not marked Ada\'s'];
    /* The hour passes: nobody's session is fresh, so only the mark keeps it hers. */
    w.ansRecPut_('familyGone', JSON.stringify({ who: 'u:P7', at: Date.now() - 2 * 60 * 60 * 1000 }));
    c.draw();
    const inp = c.kp();
    inp.setSelectionRange(2, 2);
    w.kpEdit_(inp, '!back');
    if (w.ansValue_(bareM) !== '8') return ['setup: one Backspace on "80" gave ' + JSON.stringify(w.ansValue_(bareM))];
    const m = w.ansMayMove_(bareM, benM);
    if (m !== '') bad.push('one Backspace on Ada\'s "80" left "8" — her own digit — and it is ' + JSON.stringify(m) + ' for Ben, not hers');
    w.signedIn_(Object.assign({}, ANS_BEN, { answers: {} }));
    await w.answersPush_(true);
    if (b.of('P8')['ans:' + c.maths.key]) bad.push('the "8" left of Ada\'s "80" reached BEN\'S ACCOUNT');
  }
  return bad;
});

check('signing out sends the notepad typed a moment before — what waits for its moment goes before the session it needs is ended', async () => {
  const { w, sent } = boot({ before: signedInAs_(Object.assign({}, ANS_ADA, { notepad: 'saved earlier' })) });
  await wait(300);
  if (typeof w.keepFlush_ !== 'function') return ['keepFlush_ not reachable — nothing was checked'];
  const bad = [];
  const pad = draftBox_(w, '<textarea id="notepad"></textarea>').querySelector('#notepad');
  draftType_(w, pad, 'Revise circles before Thursday');
  w.__t.ACTIONS.signout(w.document.createElement('button'));
  await wait(100);
  const order = sent.map(b => b.action);
  const save = sent.find(b => b.action === 'saveNotepad');
  if (!save) bad.push('signing out 100 ms after typing in the notepad sent ' + JSON.stringify(order) + ' — the words never reach the account');
  else if (save.notepad !== 'Revise circles before Thursday' || save.token !== 'tok-P7') bad.push('the notepad went up as ' + JSON.stringify({ notepad: save.notepad, token: save.token }));
  if (save && order.indexOf('signOut') >= 0 && order.indexOf('signOut') < order.indexOf('saveNotepad')) bad.push('the session was ended before the notepad went: ' + JSON.stringify(order));
  return bad;
});

/* THE NAME IS FIND'S FIRST CHIP (owner, 13 Nov), no longer the top bar's: removing it is signing out, and it goes as a removed chip does. */
check('Find\'s first chip is the name as a removable tag, the top bar holds none; removing it signs out and the tag is gone', async () => {
  const { w, sent } = boot({ before: signedInAs_(ANS_ADA) });
  await wait(300);
  const d = w.document, bad = [];
  if (typeof w.topbarPaint_ === 'function') w.topbarPaint_();
  const bar = d.getElementById('topbar-who');
  if (bar && bar.querySelector('.chip')) bad.push('the top bar still holds a name tag');
  w.__t.go('stuff', false, true); w.paintFinder_('stuff');
  const tag = d.querySelector('#stuff-chips .chip');
  if (!tag || tag.dataset.do !== 'signout') return bad.concat(['signed in, Find\'s first chip is not a name tag that signs out: ' + String(tag && tag.outerHTML).slice(0, 200)]);
  if (!/Ada/.test(tag.textContent)) bad.push('the name tag reads ' + JSON.stringify(tag.textContent));
  if (!/^Sign out /.test(tag.getAttribute('aria-label') || '')) bad.push('the name tag is labelled ' + JSON.stringify(tag.getAttribute('aria-label')));
  if (!tag.querySelector('.chip-x')) bad.push('the name tag has no ×, so it does not look removable like Find\'s chips');
  if (d.querySelectorAll('#stuff-chips [data-do="signout"]:not(.chip):not(.chip-x)').length) bad.push('a separate Sign out button is still beside the name');
  tag.click();
  await wait(200);
  if (w.__t.whoami()) bad.push('removing the name tag left somebody signed in');
  if (!sent.some(b => b.action === 'signOut')) bad.push('removing the name tag never ended the session on the server');
  w.paintFinder_('stuff');
  if (d.querySelector('#stuff-chips [data-do="signout"]')) bad.push('the name tag is still on Find after signing out');
  return bad;
});

check('drafts across tabs, the booking\'s addresses, and nothing kept for ever', async () => {
  const OLD = Date.now() - 31 * 24 * 60 * 60 * 1000;
  const seed = win => {
    signedInAs_(ANS_ADA)(win);
    const put = (k, d) => win.localStorage.setItem(k, JSON.stringify(d));
    put('draft:u:P7:cmt:GONE', { v: 'on a post deleted last month', at: OLD });
    put('draft:device:reg:first', { v: 'Ivy', at: Date.now() - 7 * 60 * 60 * 1000 });
    put('draft:u:P7:msg:LONG', { v: 'sent, and never heard back', at: Date.now() - 20 * 60 * 1000, sent: Date.now() - 11 * 60 * 1000 });
    put('draft:u:P7:msg:OUT', { v: 'on its way in another tab', at: Date.now() - 60 * 1000, sent: Date.now() - 60 * 1000 });
    put('draft:u:P7:msg:KEEP', { v: 'half a sentence', at: Date.now() - 60 * 1000 });
  };
  const { w } = boot({ before: seed });
  await wait(300);
  const bad = [];
  const has = k => w.localStorage.getItem(k) !== null;
  if (has('draft:u:P7:cmt:GONE')) bad.push('a draft a month old was not swept');
  if (has('draft:device:reg:first')) bad.push('a signed-out device\'s draft from seven hours ago was not swept');
  if (has('draft:u:P7:msg:LONG')) bad.push('a draft sent eleven minutes ago and never answered was not swept');
  if (!has('draft:u:P7:msg:OUT')) bad.push('a draft another tab sent a minute ago was swept from under it');
  if (w.draftRead_('msg', 'OUT') !== null) bad.push('a draft on its way from another tab is drawn here as a draft');
  if (w.draftRead_('msg', 'KEEP') !== 'half a sentence') bad.push('a fresh draft was swept');
  /* ANOTHER TAB WRITES THE COMPOSER'S DRAFT, then sends it. */
  const box = draftBox_(w, w.msgForm_('Tom Tutor', 'P-TOM')).querySelector('.msg-text');
  const k = 'draft:u:P7:msg:P-TOM', v1 = JSON.stringify({ v: 'Dear Tom, I could not do question five because', at: Date.now(), from: '' });
  w.localStorage.setItem(k, v1);
  w.dispatchEvent(new w.StorageEvent('storage', { key: k, oldValue: null, newValue: v1 }));
  if (box.value !== 'Dear Tom, I could not do question five because') bad.push('the other tab\'s draft did not reach this tab\'s composer: ' + JSON.stringify(box.value));
  draftType_(w, box, box.value + '?');
  if (w.draftRead_('msg', 'P-TOM') !== 'Dear Tom, I could not do question five because?') bad.push('one key here wrote ' + JSON.stringify(w.draftRead_('msg', 'P-TOM')) + ' over the other tab\'s draft');
  const v1b = w.localStorage.getItem(k), v2 = JSON.stringify({ v: box.value, at: Date.now(), from: '', sent: Date.now() });
  w.localStorage.setItem(k, v2);
  w.dispatchEvent(new w.StorageEvent('storage', { key: k, oldValue: v1b, newValue: v2 }));
  if (box.value) bad.push('the other tab sent the message and this composer still holds it, for a second Send: ' + JSON.stringify(box.value));
  return bad;
});

/* ---------- SIGNING IN ON A SHARED iPAD ------------------------------------------------------------- */
check('sign out, then the next child signs in: none of the last child’s messages, stars or submissions are on the screen', async () => {
  /* BEN'S INBOX DOES NOT ARRIVE — the server is slow, then refuses. § */
  let asked = 0;
  const reply = b => b.action === 'verifyLogin'
    ? Object.assign({ success: true }, ANS_BEN)
    : b.action === 'messages' ? (b.personId === 'P8' ? (asked++, { error: 'The server did not answer.' }) : { success: true, messages: [] })
    : { success: true };
  const { w, sent } = boot({ reply });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (typeof w.signedIn_ !== 'function' || typeof w.signedOut_ !== 'function') return ['signedIn_ / signedOut_ are not reachable — the hand-over was NOT checked'];
  t.USER(Object.assign({}, ANS_ADA));
  t.dmSeed([{ id: 'M1', mine: false, read: false, body: 'Ada — a private note from your tutor', at: '2026-10-08 09:10',
              withId: 'P2', withName: 'Sasha Matola', fromName: 'Sasha Matola' }]);
  t.star('q:Q-ADA-STAR');
  /* ADA'S LATEST SUBMISSION, AS THE PAYLOAD BROUGHT IT, AND ONE SHE MADE HERE. */
  t.DATA().submissions = { for: 'P7', mine: { 'q:Q-ADA': { answer: '15', verdict: 'right', at: Date.now() - 1000, id: '1760000000001-ad0001' } } };
  if (typeof w.subAdopt_ === 'function') w.subAdopt_();
  if (typeof w.subRecord_ === 'function') w.subRecord_('ans:u:P7:q:Q-ADA-2', '16', 'wrong');
  const QADA = { kind: 'question', key: 'q:Q-ADA', name: 'Q1', marks: 1, row: { row_id: 'Q-ADA', paper_id: 'P-ADA', subject: 'Maths', name: 'Ada' }, html: '<p>Work out 3 × 5.</p>', accept: '15' };
  const slotFor = x => { const h = d.createElement('div'); h.innerHTML = w.findCard(x, 0); return ((latestOf_(w, cardKey_(h)) || {}).textContent) || ''; };
  if (slotFor(QADA) !== 'Correct') bad.push('Ada’s latest submission was not on her card to begin with (' + JSON.stringify(slotFor(QADA)) + '), so its absence below proves nothing');
  try { w.localStorage.setItem('favs', JSON.stringify(['q:Q-ADA-STAR'])); } catch (e) {}
  t.go('dm', false, true); w.paint('dm');
  if (!/private note/.test(d.getElementById('s-dm').textContent)) bad.push('the seeded message was not drawn for Ada, so its absence below proves nothing');
  t.go('account', false, true);
  t.ACTIONS.signout(d.createElement('button'));
  /* AT ONCE, before any payload lands: the payload's per-person keys are nobody's. */
  if ((t.DATA().submissions || {}).for === 'P7' || Object.keys((t.DATA().submissions || {}).mine || {}).length) bad.push('signing out left Ada’s submissions on the device’s payload: ' + JSON.stringify(t.DATA().submissions).slice(0, 120));
  if (slotFor(QADA)) bad.push('signed out, a card still says Ada’s verdict: ' + JSON.stringify(slotFor(QADA)));
  const so = sent.filter(b => b.action === 'signOut');
  await wait(50);
  if (!sent.some(b => b.action === 'signOut' && b.token === 'tok-P7')) bad.push('sign-out did not end Ada’s session on the server: ' + JSON.stringify(so));
  t.go('account', false, true);
  await wait(50);
  const fill = (id, v) => { const el = d.getElementById(id); if (el) el.value = v; return !!el; };
  { const no = await findSign_(w, 'ben_bold8', ['5', '1', '7', '3'].join('')); if (no) return bad.concat([no + ' after signing out']); }
  await wait(400);
  if ((t.whoami() || {}).personId !== 'P8') return bad.concat(['Ben did not sign in: ' + JSON.stringify(t.whoami())]);
  t.go('dm', false, true); w.paint('dm');
  await wait(300);
  w.paint('dm');
  if (/private note/.test(d.getElementById('s-dm').textContent)) bad.push('ADA’S PRIVATE MESSAGE IS ON BEN’S MESSAGES COLUMN, drawn in place of his own inbox that did not arrive');
  if (/Saved/.test(w.tile_(w.favOpts_({ key: 'q:Q-ADA-STAR', kind: 'question' })))) bad.push('Ada’s star is lit for Ben');
  const S = t.DATA().submissions || {};
  if (S.for === 'P7' || Object.keys(S.mine || {}).length) bad.push('Ada’s submissions are still in the payload Ben is drawn from: ' + JSON.stringify(S));
  if (slotFor(QADA) || slotFor(Object.assign({}, QADA, { key: 'q:Q-ADA-2' }))) bad.push('ADA’S VERDICT IS ON BEN’S CARD: ' + JSON.stringify([slotFor(QADA), slotFor(Object.assign({}, QADA, { key: 'q:Q-ADA-2' }))]));
  /* AND WHAT ADA SENT FROM HERE, NOT YET ON THE ACCOUNT, IS STILL WAITING UNDER HER OWN KEY — for the next time
     she signs in here — and not under Ben's. */
  if (!/Q-ADA-2/.test(String(w.localStorage.getItem('subQ:u:P7') || ''))) bad.push('Ada’s press still to go up was lost at sign-out — it must wait under her key');
  if (/Q-ADA/.test(String(w.localStorage.getItem('subQ:u:P8') || '') + String(w.localStorage.getItem('subLast:u:P8') || ''))) bad.push('Ada’s press was moved into Ben’s drawer');
  if (/Q-ADA-STAR/.test(String(w.localStorage.getItem('favs') || ''))) bad.push('Ada’s stars are still in the device’s copy');
  if (!asked) bad.push('Ben’s inbox was never asked for, so the column was never drawn without it — NOT checked');
  return bad;
});

check('a wrong PIN clears the ● chips and asks the digits again under the same name, with one toast and the banner unchanged', async () => {
  const { w } = boot({ reply: b => (b.action === 'verifyLogin'
    ? (/^@?nobody/.test(String(b.email)) ? { success: false, why: 'not-an-email', error: 'Sign in with the email on your account — or your handle, as it is on your card.' }
                                        : { success: false, why: 'wrong-pin', error: 'Wrong PIN for that handle.' })
    : { success: true }) });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  const bannerWas = (() => { const b = d.getElementById('banner'); return b && !b.classList.contains('hidden') ? String(b.textContent || '') : ''; })();
  const no = await findSign_(w, 'ada_kind7', '1239');
  if (no) return [no];
  await wait(300);
  const dots = () => d.querySelectorAll('#stuff-chips .sign-dot').length;
  /* THE PIN BOX WAS EMPTIED, FOCUSED AND MARKED; ITS DIGITS ARE ● CHIPS NOW, cleared, and the digit menu is asked again under the same name. */
  if (dots()) bad.push('after a wrong PIN ' + dots() + ' ● chips are still there — the child has to take them off before retyping');
  if (!d.querySelector('#stuff-groups [data-do="sign-digit"]')) bad.push('after a wrong PIN the digit menu is not asked again');
  if (!/ada_kind7/.test((d.querySelector('#stuff-chips .chip') || {}).textContent || '')) bad.push('after a wrong PIN the name is not still the first chip');
  if (!/Wrong PIN/.test(toastOf_(d))) bad.push('the toast says ' + JSON.stringify(toastOf_(d)) + ' — the owner’s choice is a toast');
  const ban = d.getElementById('banner');
  if ((ban && !ban.classList.contains('hidden') ? String(ban.textContent || '') : '') !== bannerWas) bad.push('a wrong PIN changed the banner');
  if (d.getElementById('in-name')) bad.push('a wrong PIN sent the child back to the name, which was not what was wrong');
  /* THE NEXT DIGIT IS ONE ● AGAIN, the red edge of the old box. */
  t.ACTIONS['sign-digit'](d.querySelector('#stuff-groups [data-do="sign-digit"][data-d="4"]'));
  if (dots() !== 1) bad.push('the next digit after a wrong PIN made ' + dots() + ' ● chips');
  /* A HANDLE NOBODY HAS MARKS THE NAME TAG, still holding what was typed to correct. */
  t.ACTIONS['sign-restart'](d.createElement('button'));
  const no2 = await findSign_(w, 'nobody_here', '1234');
  if (no2) return bad.concat([no2]);
  await wait(300);
  const nm = d.getElementById('in-name');
  if (!nm || nm.getAttribute('aria-invalid') !== 'true' || d.activeElement !== nm) bad.push('a handle nobody has did not mark and focus the name tag');
  if (nm && nm.value !== 'nobody_here') bad.push('a wrong handle emptied the name tag, so it cannot be corrected: ' + JSON.stringify(nm.value));
  if (nm) { nm.value = 'nobody_her'; nm.dispatchEvent(new w.Event('input', { bubbles: true })); if (nm.hasAttribute('aria-invalid')) bad.push('the red edge stayed after the next keystroke'); }
  return bad;
});

check('the PIN is no box the iPad keeps, and nothing about who signed in is kept or offered on the device (383)', async () => {
  const reply = b => b.action === 'verifyLogin' ? Object.assign({ success: true }, ANS_ADA) : { success: true, messages: [] };
  const bad = [];
  const { w, sent } = boot({ reply });
  await wait(300);
  const t = w.__t, d = w.document;
  t.USER(null);
  const no = await findSign_(w, 'ada_kind7', '');
  if (no) return [no];
  /* THE PIN IS FOUR DIGIT TAGS (owner, 13 Nov): no field at all, so no password for Safari to offer the iCloud Keychain, and no phone keyboard. */
  const boxes = [...d.querySelectorAll('#stuff-groups input, #stuff-chips input, #s-stuff input[type="password"], #in-pin')];
  if (boxes.length) bad.push('the PIN step draws ' + boxes.length + ' box(es) — the PIN is tags, never a field a browser can keep');
  const digits = [...d.querySelectorAll('#stuff-groups [data-do="sign-digit"]')];
  if (digits.map(x => x.textContent.trim()).join('') !== '0123456789') bad.push('the PIN menu is ' + JSON.stringify(digits.map(x => x.textContent.trim()).join('')) + ', wanted the tags 0 to 9');
  /* SIGNED IN BY HANDLE AND PIN: neither is remembered, anywhere (383). */
  ['4', '8', '2', '6'].forEach(c => t.ACTIONS['sign-digit'](d.querySelector('#stuff-groups [data-do="sign-digit"][data-d="' + c + '"]')));
  await wait(300);
  if (!sent.some(b => b.action === 'verifyLogin')) return bad.concat(['signing in posted nothing']);
  const all = []; for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); all.push(k + '=' + w.localStorage.getItem(k)); }
  if (all.some(x => /4826/.test(x))) bad.push('THE PIN IS WRITTEN ON THE DEVICE: ' + all.filter(x => /4826/.test(x)).join(' | '));
  if (all.some(x => /ada_kind7/.test(x) && !/^familyUser=/.test(x))) bad.push('the handle is kept on the device for next time: ' + all.filter(x => /ada_kind7/.test(x) && !/^familyUser=/.test(x)).join(' | '));
  if (/"answers"|"submissions"|"favourites"/.test(String(w.localStorage.getItem('familyUser')))) bad.push('the sign-in reply’s per-person extras were kept in familyUser for thirty days');
  /* SIGNED OUT, THE NAME TAG IS EMPTY AND NO NAME IS OFFERED. */
  t.ACTIONS.signout(d.createElement('button'));
  const no2 = await findSign_(w, null);
  if (no2) return bad.concat([no2]);
  if (d.querySelector('#stuff-groups .hchips, #stuff-groups [data-do="handle-pick"]')) bad.push('signed out, Find offers handles that signed in here');
  const nm = d.getElementById('in-name');
  if (!nm || nm.value || nm.hasAttribute('placeholder')) bad.push('signed out, the name tag is not empty: ' + JSON.stringify(nm && (nm.value || nm.getAttribute('placeholder'))));
  return bad;
});

/* ---------- THE SIGN-IN BOX STAYS BLANK, EVEN AFTER AN ADMIN (383): no example, no remembered name. */
check('the sign-in box has no example and no remembered name, even on a device an admin signed in on', async () => {
  const ADMIN = { name: 'Test Admin', personId: 'P1', role: 'admin', roles: ['admin'], token: 'tok-P1', handle: 'test_admin1' };
  const reply = b => b.action === 'verifyLogin' ? Object.assign({ success: true }, ADMIN) : { success: true, messages: [] };
  const { w } = boot({ reply, before: win => { win.localStorage.setItem('familyHandles', '["old_one1"]'); win.localStorage.setItem('familyAdminHint', '{"s":"old@example.com","h":"old_one1"}'); } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (w.localStorage.getItem('familyHandles') || w.localStorage.getItem('familyAdminHint')) bad.push('the old remembered names were not wiped from the device');
  const box = () => { t.go('stuff', false, true); w.paintFinder_('stuff'); return d.getElementById('in-name'); };
  t.USER(null);
  if (!box()) return ['no name tag on Find'];
  const blank = when => { if (box().hasAttribute('placeholder') || box().value) bad.push(when + ' the sign-in box shows ' + JSON.stringify(box().getAttribute('placeholder') || box().value)); };
  blank('on a fresh device');
  if (/old_one1|old@example/.test(d.getElementById('s-stuff').innerHTML)) bad.push('an old remembered name is on Find');
  { const no = await findSign_(w, 'admin@example.com', '4826'); if (no) return bad.concat([no]); }
  await wait(300);
  t.ACTIONS.signout(d.createElement('button'));
  blank('after an admin signed in and out,');
  if (/test_admin1|admin@example/.test(d.getElementById('s-stuff').innerHTML)) bad.push('the admin\'s name is offered on Find');
  return bad;
});

/* ---------- NO FIELD ANYWHERE SUGGESTS (383): every box drawn on every screen is quiet. */
check('every input and textarea on every screen asks the browser and password managers not to suggest', async () => {
  const { w } = boot({});
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  const look = where => [].forEach.call(d.querySelectorAll('input,textarea'), el => {
    const ac = el.getAttribute('autocomplete');
    const why = [];
    if (ac !== 'off' && ac !== 'one-time-code') why.push('autocomplete=' + ac);
    if (el.getAttribute('autocorrect') !== 'off') why.push('autocorrect');
    if (el.getAttribute('data-lpignore') !== 'true' || !el.hasAttribute('data-1p-ignore')) why.push('password-manager ignore');
    if (el.hasAttribute('list')) why.push('list=' + el.getAttribute('list'));
    if (why.length) bad.push(where + ': ' + (el.id || el.className || el.tagName) + ' — ' + why.join(', '));
  });
  const tabs = ['feed', 'booking', 'shop', 'stuff', 'account', 'tools', 'family'];
  t.USER(null);
  for (const id of tabs) { try { t.go(id, false, true); w.paint(id); } catch (e) {} await wait(20); look(id); }
  if (d.querySelectorAll('datalist').length) bad.push(d.querySelectorAll('datalist').length + ' datalist(s) drawn');
  return bad.slice(0, 20);
});

check('signing in brings the submissions, stars, family and answers with the reply, before the payload', async () => {
  let hold = false;
  const reply = b => b.action === 'verifyLogin'
    ? Object.assign({ success: true }, ANS_ADA, {
        submissions: { for: 'P7', mine: { 'q:Q-SIGN': { answer: '3/4', verdict: 'wrong', at: Date.now() - 1000, id: '1760000000002-sg0001' } } },
        favourites: ['q:Q-SIGN-STAR'],
        family: [{ personId: 'P9', title: 'Mo Parent', relation: 'parent', handle: 'mo_kind9', image: '' }], familyFor: 'P7',
        answers: { 'ans:q:Q-ANS-W-J': { v: 'from the account', at: Date.now() - 1000 } } })
    : { success: true, messages: [] };
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }), reply,
    /* THE PAYLOAD AFTER SIGNING IN NEVER ARRIVES — so what is on the screen is the reply's alone. */
    serve: () => (hold ? new Promise(() => {}) : undefined) });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (typeof w.signedIn_ !== 'function') return ['signedIn_ not reachable'];
  t.USER(null); t.go('account', false, true); w.paint('account');
  hold = true;
  { const no = await findSign_(w, 'ada_kind7', '4826'); if (no) return bad.concat([no]); }
  await wait(300);
  if (!/Signed in as Ada/.test(toastOf_(d))) bad.push('the toast says ' + JSON.stringify(toastOf_(d)) + ' — on an iPad passed between children it has to say whose account');
  /* THE LATEST SUBMISSION, on the card and in the box, with "Signed in" — the payload never arrives here. */
  const late = typeof w.subLatest_ === 'function' ? w.subLatest_('ans:u:P7:q:Q-SIGN') : null;
  if (!late || late.a !== '3/4' || late.v !== 'wrong') bad.push('the submissions did not come with the reply: ' + JSON.stringify(late));
  if (w.localStorage.getItem('ans:u:P7:q:Q-SIGN') !== '3/4') bad.push('the box was not filled with the latest answer sent: ' + JSON.stringify(w.localStorage.getItem('ans:u:P7:q:Q-SIGN')));
  if (!/Saved/.test(w.tile_(w.favOpts_({ key: 'q:Q-SIGN-STAR', kind: 'question' })))) bad.push('the stars did not come with the reply');
  const D = t.DATA();
  if (D.familyFor !== 'P7' || !(D.family || []).some(f => f.personId === 'P9')) bad.push('the family did not come with the reply: ' + JSON.stringify({ familyFor: D.familyFor, family: D.family }));
  if (w.localStorage.getItem('ans:u:P7:q:Q-ANS-W-J') !== 'from the account') bad.push('the answers did not come with the reply');
  /* AND THE ACCOUNT IS READ AT ONCE, not when the payload lands — `signedIn_` calls `answersPull_`. */
  if (!sent.some(b => b.action === 'myAnswers' && b.personId === 'P7')) bad.push('signing in did not read the account’s answers at once — they would wait for a payload that takes fifteen seconds');
  const u = t.whoami() || {};
  if ('answers' in u || 'submissions' in u || 'favourites' in u || 'family' in u) bad.push('the per-person extras were put on USER: ' + Object.keys(u).join(', '));
  return bad;
});

check('signing in on Find (owner, 13 Nov) leaves the child on Find — after Tools, with Games in front, and opened on the account column', async () => {
  const reply = b => b.action === 'verifyLogin' ? Object.assign({ success: true }, ANS_ADA) : { success: true, messages: [] };
  const { w } = boot({ reply });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  const signIn = async () => {
    { const no = await findSign_(w, 'ada_kind7', '4826'); if (no) bad.push(no); }
    await wait(300);
  };
  /* FIND STANDS A MEMBER IN TO LOOK (790), and the child signs in after: signed out again first. */
  t.findGroup('Tools'); t.USER(null); t.go('account', false, true); w.paint('account');
  await signIn();
  if (t.AT() !== 'stuff') bad.push('signed in on Find after Tools, the child is on ' + t.AT() + ' — wanted Find');
  /* SIGNED IN WHILE ANOTHER COLUMN IS IN FRONT — the emailed link at start-up, Google's own button — the
     child is left where they are: only a sign-in made ON the account column goes back. */
  t.ACTIONS.signout(d.createElement('button'));
  t.findGroup('Games'); t.USER(null); w.paint('account');
  { const no = await findSign_(w, 'ada_kind7', '4826'); if (no) return bad.concat([no]); }
  await wait(300);
  if (t.AT() !== 'stuff') bad.push('signed in with Games in front, the child was moved to ' + t.AT());
  /* OPENED ON THE ACCOUNT COLUMN, NOTHING BEFORE IT: a child goes to Find. */
  const b2 = boot({ reply, before: win => { win.localStorage.setItem('familyTab', 'account'); win.localStorage.setItem('familyTabAt', String(Date.now())); } });
  await wait(300);
  if (b2.w.__t.AT() !== 'account') return bad.concat(['the app did not open on the account column, so "nowhere to go back to" was NOT checked']);
  b2.w.__t.USER(null); b2.w.paint('account');
  const d2 = b2.w.document;
  { const no = await findSign_(b2.w, 'ada_kind7', '4826'); if (no) return bad.concat([no]); }
  await wait(300);
  if (b2.w.__t.AT() !== 'stuff') bad.push('a child signing in with nowhere to go back to is on ' + b2.w.__t.AT() + ' — wanted Find');
  return bad;
});

/* ---------- SIGNING IN FROM SIGNED OUT IS THE SAME SEAT, SO FIND KEEPS ITS PLACE § */
const KEEP_SOL_ = { name: 'Sol Pupil', personId: 'P12', role: 'student', roles: ['student'], token: 'tok-P12', handle: 'sol_calm12' };
const keepRows_ = () => LIB_FULL.rows('questions')
  .filter(r => /^P-1MA1-2306-[123]H$/.test(r.paper_id) || r.paper_id === 'W-CBM-addition');
/* PRESS THE CHIPS A CHILD WOULD, to the row's card: at each question the first answer that keeps the
   card of `id` on the strip, through the app's own click dispatcher. Returns the answers pressed. */
/* A QUESTION IS ONE PAGE (960): its card is the `q` page whose parts hold the row, or a bare card page. */
const keepCard_ = (pg, id) => !!(pg && pg.x && (!pg.part || pg.part === 'q') && (pg.parts || [pg.x]).some(p => p && p.row && p.row.row_id === id));
const keepWalk_ = async (w, id) => {
  const d = w.document, S = w.__t.STUFF(), said = [];
  /* BY THE LIST, NOT THE PAGES: no page is built while the funnel still asks (`findDone_`). */
  const cardOn = () => w.stuffFiltered().some(x => x && x.row && x.row.row_id === id);
  for (let step = 0; step < 16; step++) {
    /* THE QUESTION BEING ASKED, and a child walking the funnel answers what it asks. */
    const picks = [...d.querySelectorAll('#s-stuff #stuff-groups .answers [data-do="facet-pick"]')];
    if (!picks.length) break;
    const keeps = picks.find(b => {
      S.filters.push({ field: b.dataset.field, value: b.dataset.value });
      try { return cardOn(); } finally { S.filters.pop(); }
    });
    if (!keeps) break;
    said.push(keeps.dataset.field + '=' + keeps.dataset.value);
    keeps.click();
    await wait(20);
    /* THE PAPER CHOSEN, A CHILD SWIPES UP THROUGH IT: the funnel would go on to ask Question (396), and the card is found by its page. */
    if (keeps.dataset.field === 'paperId') break;
  }
  /* THE FUNNEL STILL ASKS Question: the child answers "Doesn't matter" until the cards come (the peek arrow is gone, 9 Nov); that row is a `facet-skip`, not an answer. */
  for (let i = 0; i < 6; i++) {
    const any = [...d.querySelectorAll('#stuff-groups [data-do="facet-skip"], #stuff-groups [data-do="facet-pick"]')].find(b => /doesn.t matter|^any\b/i.test(b.textContent.trim()));
    if (!any) break;
    any.click(); await wait(20);
  }
  return said;
};
/* ---------- THE FINDER IS FOR MEMBERS (400); SIGNED OUT, ITS FIRST MENU IS WHO YOU ARE (owner, 13 Nov) ---------- */
check('signed out, Find is the one front door: its first menu is Guest, the name tag, Make an account and Forgot PIN; Guest\'s only answer is Settings, holding Make an account, which asks Student or Client; signed in, Find answers more (C+, 1040)', async () => {
  const { w } = boot({ payload: payload() });
  for (let i = 0; i < 80 && !w.__t; i++) await wait(25);
  await wait(300);
  const t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  if (t.whoami()) return ['the app opened signed in — signed OUT was NOT checked'];
  t.go('stuff', false, true); w.paint('stuff'); await wait(100);
  if (d.querySelector('#s-stuff .members-only')) bad.push('signed out, Find still draws the old Members only card');
  if (!d.getElementById('stuff-chips')) bad.push('signed out, Find draws no chips row (one front door: the same shape for everyone)');
  if (!d.querySelector('#stuff-groups [data-do="sign-guest"]') || !d.getElementById('in-name') || !d.querySelector('#stuff-groups [data-do="sign-join"]')) bad.push('signed out, Find\'s first menu is not Guest, the name tag and Make an account');
  const items = w.stuffItemsBuild_();
  const own = (items || []).filter(Boolean);
  if (own.some(x => x.kind !== 'setting')) bad.push('signed out, Find holds more than Settings: ' + JSON.stringify([...new Set(own.map(x => x.kind))]));
  if (own.some(x => x.signIn)) bad.push('signed out, Settings still holds a separate Sign in card');
  const joinItem = own.find(x => x.join);
  if (!joinItem) return bad.concat(['signed out, Settings holds no Make an account item']);
  const host = d.createElement('div'); host.innerHTML = w.settingDoorCard_(joinItem); d.body.appendChild(host);
  if (host.querySelector('[data-do="do-signin"], #in-pin')) bad.push('the Settings card still draws the old sign-in form');
  const who = [...host.querySelectorAll('.reg-card #reg-who-in option')].map(b => b.textContent.trim());
  if (!who.some(x => /Student/.test(x)) || !who.some(x => /Client/.test(x))) bad.push('Make an account did not open the sign-up asking Student or Client: ' + JSON.stringify(who));
  host.remove();
  /* AND FIND'S OWN Make an account TAG draws the same form in place of the menu. */
  A['sign-join'](d.querySelector('#stuff-groups [data-do="sign-join"]'));
  if (!d.querySelector('#stuff-groups .reg-card #reg-who-in')) bad.push('Find\'s Make an account tag drew no sign-up');
  A['sign-restart'](d.createElement('button'));
  w.signedIn_(Object.assign({ success: true }, MEMBER_), 'momember');
  await wait(80);
  t.go('stuff', false, true); w.paint('stuff'); await wait(150);
  const after = w.stuffItemsBuild_();
  if (!d.getElementById('stuff-chips') || d.querySelector('#s-stuff .members-only')) bad.push('signed in, Find is not the finder');
  if (after.some(x => x && (x.signIn || x.join))) bad.push('signed in, Settings still offers Sign in or Make an account');
  if (!after.some(x => x && x.kind !== 'setting')) bad.push('signed in, Find still answers only Settings');
  return bad;
});

/* ---------- AND THE TWO WAYS THAT STILL START FIND AGAIN § */
check('both finders are started again when an admin signs out from the admin-only shelf, and when another child signs in over the last', async () => {
  const bad = [];
  /* ---- AN ADMIN, ON THE BOOKS SHELF, SIGNS OUT ---- */
  {
    const { w } = boot({ before: win => { win.localStorage.setItem('familyUser', JSON.stringify({ name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk-a' })); } });
    await wait(300);
    const t = w.__t, d = w.document;
    /* THE BOOKS SHELF ON THE ONE FIND (10a): the admin's chips and words there go at sign-out. */
    t.go('stuff', false, true);
    t.STUFF().filters = [{ field: 'shelf', value: 'Writings' }];
    w.paintFinder_('stuff');
    if (!/\bWritings\b/.test((d.getElementById('stuff-chips') || {}).textContent || '')) bad.push('the setup: the admin’s Find chips do not name the Writings shelf, so its going was NOT checked');
    t.ACTIONS.signout(d.createElement('button'));
    await wait(50);
    t.go('stuff', false, true);
    await wait(30);
    if (t.whoami()) bad.push('Sign out left somebody signed in');
    if (t.STUFF().filters.length) bad.push('an admin signed out from the Books shelf left Find holding ' + JSON.stringify(t.STUFF().filters));
    if (t.STUFF().filters.length) bad.push('an admin signed out left Find holding ' + JSON.stringify(t.STUFF().filters));
    if (/\bWritings\b/.test((d.getElementById('res-chips') || {}).textContent || '')) bad.push('signed out, Find’s chips still name the Writings shelf');
    /* AND THE NEXT CHILD SIGNING IN FROM THERE IS SIGNED IN FROM NOBODY — kept, and holding nothing of the admin's. */
    w.signedIn_(Object.assign({ success: true }, KEEP_SOL_), 'sol');
    if (t.STUFF().filters.length) bad.push('a child signing in after the admin signed out is handed the admin’s Find: ' + JSON.stringify(t.STUFF().filters));
  }
  /* ---- ONE CHILD SIGNED IN, ANOTHER SIGNS IN OVER THEM ---- */
  {
    const { w } = boot({ before: win => { win.localStorage.setItem('familyUser', JSON.stringify(ANS_ADA)); } });
    await wait(300);
    const t = w.__t;
    t.go('stuff', false, true);
    t.STUFF().filters = [{ field: 'forLabel', value: 'Learning' }, { field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Questions' }];
    w.paintStuff();
    t.STUFF().filters = [{ field: 'shelf', value: 'Boxing' }];
    if (typeof w.signedIn_ !== 'function') return bad.concat(['signedIn_ is not reachable — the switch was NOT checked']);
    w.signedIn_(Object.assign({ success: true }, KEEP_SOL_), 'sol');
    if ((t.whoami() || {}).personId !== 'P12') return bad.concat(['the second child did not sign in: ' + JSON.stringify(t.whoami())]);
    if (t.STUFF().filters.length) bad.push('a child signing in over Ada is handed Ada’s Find: ' + JSON.stringify(t.STUFF().filters));
    /* THE SAME CHILD SIGNING IN AGAIN IS NOT A SWITCH: their Find stays. */
    t.STUFF().filters = [{ field: 'forLabel', value: 'Learning' }];
    w.signedIn_(Object.assign({ success: true }, KEEP_SOL_), 'sol');
    if (t.STUFF().filters.length !== 1) bad.push('the same child signing in again lost their chips');
  }
  return bad;
});

/* ---------- A SESSION THAT ENDS UNDER THE CHILD IS THE OWNER'S COMPLAINT BY ANOTHER DOOR § */
const KEEP_KIT_ = { name: 'Kit Pupil', personId: 'P13', role: 'student', roles: ['student'], token: 'tok-P13', handle: 'kit_bold13' };
const keepAt_ = (w, id) => {
  const pg = w.stuffPages_()[w.__t.PAGE().stuff - w.stuffFirstResult_()];
  const ids = pg && (pg.parts || [pg.x]).map(p => p && p.row && p.row.row_id).filter(Boolean);
  return ids && ids.length ? (keepCard_(pg, id) ? id : ids[0] + (pg.part ? ':' + pg.part : '')) : '(page ' + w.__t.PAGE().stuff + ', no result)';
};
/* A CHILD SIGNED IN, ON Q13'S CARD WITH "80" TYPED AND THE BOX LEFT, ON A TOKEN THE SERVER HAS ENDED. */
const keepDead_ = async (more) => {
  const ID = 'Q-1MA1-2306-1H-13';
  const rows = keepRows_();
  const server = {};
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }),
    before: win => { win.localStorage.setItem('familyUser', JSON.stringify(KEEP_SOL_)); },
    reply: ansBackend_(server, b => {
      if (b.token === 'tok-P12') return b.action === 'saveAnswers' ? { error: 'Please sign in again.', why: 'signed-out' } : { success: true, messages: [] };
      return more ? more(b) : undefined;
    }),
    serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  for (let i = 0; i < 80 && !(typeof w.stuffItemsAll_ === 'function' && w.stuffItemsAll_().some(x => x.row && x.row.row_id === ID)); i++) await wait(50);
  const t = w.__t, d = w.document;
  if (!w.stuffItemsAll_().some(x => x.row && x.row.row_id === ID)) return { fail: 'the library did not bring ' + ID + ' into Find — nothing was walked' };
  if ((t.whoami() || {}).personId !== 'P12') return { fail: 'the app did not open signed in as the child: ' + JSON.stringify(t.whoami()) };
  t.go('stuff', false, true);
  await wait(50);
  const walked = await keepWalk_(w, ID);
  const idx = w.stuffPages_().findIndex(pg => keepCard_(pg, ID));
  if (walked.length < 2 || idx < 0) return { fail: 'the funnel walk pressed ' + JSON.stringify(walked) + ' and did not reach ' + ID + ' — nothing was checked' };
  const x = w.stuffPages_()[idx].x;
  const page = w.stuffFirstResult_() + idx;
  t.goPage('stuff', page, true);
  await wait(400);
  const box = who => d.querySelector('#s-stuff .qp-ans-in[data-k="ans:' + (who ? 'u:' + who + ':' : '') + x.key + '"]');
  if (!box('P12')) return { fail: 'no keypad box under the child’s key on ' + ID + '’s page — nothing was typed' };
  box('P12').focus();
  const pad = d.getElementById('kp');
  ['8', '0'].forEach(v => { const k = pad && pad.querySelector('.kp-key[data-v="' + v + '"]'); if (k) t.ACTIONS['kp-key'](k); });
  if (w.localStorage.getItem('ans:u:P12:' + x.key) !== '80') return { fail: '"80" was not stored under the child: ' + JSON.stringify(w.localStorage.getItem('ans:u:P12:' + x.key)) };
  const chips = JSON.stringify(t.STUFF().filters);
  /* LEAVING THE BOX SENDS IT NOW — and the refusal signs the phone out. */
  box('P12').blur();
  for (let i = 0; i < 40 && t.whoami(); i++) await wait(25);
  await wait(600);
  return { w, t, d, sent, x, ID, page, chips, box };
};
check('a session that ends while a child types keeps Find for them to sign in again to, and not for the next child or an admin', async () => {
  const bad = [];
  /* ---- THE SAME CHILD, SIGNING IN AGAIN THROUGH THE REAL CARD ---- */
  {
    const s = await keepDead_(b => (b.action === 'verifyLogin' ? Object.assign({ success: true }, KEEP_SOL_, { token: 'tok-P12-again' }) : undefined));
    if (s.fail) return [s.fail];
    const { w, t, d, sent, x, ID, page, chips, box } = s;
    if (!sent.some(b => b.action === 'saveAnswers' && b.token === 'tok-P12')) return ['the answer never went up on the ended token, so the refusal was NOT checked'];
    if (t.whoami()) return ['the refused save did not sign the phone out: ' + JSON.stringify(t.whoami()) + ' — the dead session was NOT checked'];
    const said = (d.getElementById('toast') || {}).textContent || '';
    if (!/Signed out/.test(said)) bad.push('the phone signed out without saying so: the toast reads ' + JSON.stringify(said));
    /* SIGNED OUT, FIND IS THE FRONT DOOR (1040, C+) and lists no questions, so the page and the card are asked once signed in again. */
    const look = (when, out) => {
      if (JSON.stringify(t.STUFF().filters) !== chips) bad.push(when + ': Find’s chips are ' + JSON.stringify(t.STUFF().filters) + ', were ' + chips + ' — the funnel was thrown away');
      if (out) return;
      if (t.PAGE().stuff !== page) bad.push(when + ': Find is on page ' + t.PAGE().stuff + ', was ' + page);
      if (keepAt_(w, ID) !== ID) bad.push(when + ': Find is on ' + keepAt_(w, ID) + ', not ' + ID + '’s card');
    };
    look('the session ended under the child', true);
    if (t.STUFF().whose !== 'P12') bad.push('the kept Find does not say whose it is: STUFF.whose = ' + JSON.stringify(t.STUFF().whose));
    if (w.localStorage.getItem('ans:u:P12:' + x.key) !== '80') bad.push('the session ending took the child’s answer off the device: ' + JSON.stringify(w.localStorage.getItem('ans:u:P12:' + x.key)));
    { const no = await findSign_(w, KEEP_SOL_.handle, '0000'); if (no) return bad.concat([no + ' after the session ended']); }
    for (let i = 0; i < 40 && !t.whoami(); i++) await wait(25);
    await wait(300);
    if ((t.whoami() || {}).personId !== 'P12') return bad.concat(['the child did not sign in again: ' + JSON.stringify(t.whoami())]);
    if (t.AT() !== 'stuff') bad.push('signed in again, the child is on ' + t.AT() + ', not back on Find');
    look('signed in again');
    const b = box('P12');
    if (!b) bad.push('signed in again, no box under the child’s key on Find');
    else if (b.value !== '80') bad.push('signed in again, the box holds ' + JSON.stringify(b.value) + ', not the "80" typed before the session ended');
    if (t.STUFF().whose) bad.push('signed in, STUFF.whose still names ' + JSON.stringify(t.STUFF().whose));
    await wait(1700);
    if (!sent.some(b2 => b2.action === 'saveAnswers' && b2.token === 'tok-P12-again' && (b2.items || []).some(it => it.key === 'ans:' + x.key && it.v === '80'))) bad.push('the answer typed as the session ended never went up on the new session');
  }
  /* ---- THE NEXT CHILD SIGNS IN OVER THE DEAD SESSION: a switch, so Find starts again ---- */
  {
    const s = await keepDead_();
    if (s.fail) return bad.concat([s.fail]);
    const { w, t } = s;
    if (t.whoami()) return bad.concat(['the refused save did not sign the phone out — the next child was NOT checked']);
    w.signedIn_(Object.assign({ success: true }, KEEP_KIT_), 'kit');
    if ((t.whoami() || {}).personId !== 'P13') return bad.concat(['the next child did not sign in: ' + JSON.stringify(t.whoami())]);
    if (t.STUFF().filters.length) bad.push('the next child signing in over a dead session is handed the last child’s Find: ' + JSON.stringify(t.STUFF().filters));
    if (t.STUFF().whose) bad.push('the next child signed in, STUFF.whose still names ' + JSON.stringify(t.STUFF().whose));
  }
  /* ---- AN ADMIN'S SESSION ENDS ON THE BOOKS SHELF: cleared, as Sign out clears it ---- */
  {
    const { w } = boot({ before: win => { win.localStorage.setItem('familyUser', JSON.stringify({ name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk-a' })); },
      /* ANY REQUEST ON THE ENDED TOKEN — one only this journey sends, so the boot's own requests do not end it first. */
      reply: b => (b.action === 'sessionProbe' ? { error: 'Please sign in again.', why: 'signed-out' } : undefined) });
    await wait(300);
    const t = w.__t;
    /* ON THE RESOURCES COLUMN, where the Books shelf is now (docs/history/329). */
    t.go('stuff', false, true);
    t.STUFF().filters = [{ field: 'shelf', value: 'Writings' }];
    w.paintFinder_('stuff');
    await w.api({ action: 'sessionProbe', personId: 'P001' });
    await wait(30);
    if (t.whoami()) return bad.concat(['the admin’s refused request did not sign the phone out — the admin case was NOT checked']);
    if (t.STUFF().filters.length) bad.push('an admin’s session ending on the Books shelf left Find holding ' + JSON.stringify(t.STUFF().filters));
    if (t.STUFF().whose || t.STUFF().whose) bad.push('an admin’s dead session left whose = ' + JSON.stringify([t.STUFF().whose, t.STUFF().whose]));
  }
  return bad;
});

/* ---------- WHAT WAS TYPED SIGNED OUT IS DECIDED AT SIGN-IN, AND NONE OF IT IS LEFT FOR THE NEXT CHILD § */
check('an answer typed signed out beats an older one on the account at sign-in, and none is left for the next child', async () => {
  const acct = {
    P7: { 'ans:q:Q-ANS-W-K': { v: 'the account’s, three days old', at: Date.now() - 3 * 864e5 },
          'ans:q:Q-ANS-M-K': { v: '(1)/(2)', at: Date.now() + 60000 } },
    P8: {},
  };
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }),
    reply: b => ansBackend_(acct[b.personId] || (acct[b.personId] = {}))(b) });
  await wait(300);
  const need = ansNeed_(w).concat(typeof w.signedIn_ === 'function' ? [] : ['signedIn_']);
  if (need.length) return [need.join(', ') + ' not reachable — the claim was NOT checked'];
  const bad = [], t = w.__t;
  if (t.whoami()) return ['the app opened signed in — signing in from signed OUT was NOT checked'];
  const c = ansCards_(w, 'K');
  ansType_(w, c.ta(), 'typed a minute ago');
  ansType_(w, c.kp(), '(3)/(4)');
  /* A DRAWING FROM BEFORE SIGNED-OUT ANSWERS WERE DATED: on the device, with no time. */
  const penBare = w.__t.padKey(c.pen);
  w.localStorage.setItem(penBare, JSON.stringify([[10, 10, 20, 20, 30, 30]]));
  const bare = [ 'ans:' + c.words.key, 'ans:' + c.maths.key, penBare ];
  if (w.localStorage.getItem(bare[0]) !== 'typed a minute ago' || !Number(w.localStorage.getItem('ansAt:' + bare[0])))
    bad.push('signed out, the answer was not kept with its time: ' + JSON.stringify([w.localStorage.getItem(bare[0]), w.localStorage.getItem('ansAt:' + bare[0])]));
  const typedAt = Number(w.localStorage.getItem('ansAt:' + bare[0]));
  /* ---- ADA SIGNS IN, AND THE REPLY CARRIES HER ACCOUNT'S ANSWERS, as `loginReplyFor_` sends them ---- */
  w.signedIn_(Object.assign({ success: true }, ANS_ADA, { answers: JSON.parse(JSON.stringify(acct.P7)) }), 'ada');
  await wait(300);
  c.draw();
  if (c.ta().value !== 'typed a minute ago') bad.push('the words box reads ' + JSON.stringify(c.ta().value) + ' — the account’s older answer beat the one typed signed out');
  if (c.kp().value !== '(1)/(2)') bad.push('the keypad box reads ' + JSON.stringify(c.kp().value) + ' — the signed-out answer beat a LATER one on the account');
  const penMine = 'pad:u:P7:' + penBare.slice('pad:'.length);
  if (!w.localStorage.getItem(penMine)) bad.push('the undated drawing did not move into Ada’s empty pad');
  bare.forEach(k => { if (w.localStorage.getItem(k) !== null) bad.push('still under the signed-out key after Ada signed in, for the next child: ' + k + ' = ' + JSON.stringify(w.localStorage.getItem(k))); });
  await wait(1700);
  const toAda = sent.filter(b => b.action === 'saveAnswers' && b.personId === 'P7').flatMap(b => b.items || []);
  const words = toAda.find(it => it.key === 'ans:' + c.words.key);
  if (!words || words.v !== 'typed a minute ago') bad.push('the signed-out answer did not go up to Ada’s account: ' + JSON.stringify(toAda.map(it => it.key + '=' + it.v)));
  else if (words.at !== typedAt) bad.push('it went up stamped ' + words.at + ', not when it was typed (' + typedAt + ') — "later" would mean when Ada signed in');
  if ((acct.P7['ans:q:Q-ANS-W-K'] || {}).v !== 'typed a minute ago') bad.push('Ada’s account still holds ' + JSON.stringify(acct.P7['ans:q:Q-ANS-W-K']));
  if ((acct.P7['ans:q:Q-ANS-M-K'] || {}).v !== '(1)/(2)') bad.push('Ada’s later answer on the account was replaced: ' + JSON.stringify(acct.P7['ans:q:Q-ANS-M-K']));
  /* ---- ADA SIGNS OUT, BEN SIGNS IN ON THE SAME iPAD ---- */
  t.ACTIONS.signout(w.document.createElement('button'));
  await wait(50);
  w.signedIn_(Object.assign({ success: true }, ANS_BEN, { answers: {} }), 'ben');
  await wait(300);
  c.draw();
  if (c.ta().value || c.kp().value) bad.push('BEN’S BOXES HOLD ADA’S ANSWERS: ' + JSON.stringify([c.ta().value, c.kp().value]));
  await wait(1700);
  const toBen = sent.filter(b => b.action === 'saveAnswers' && b.personId === 'P8').flatMap(b => b.items || []);
  if (toBen.length) bad.push('Ben’s account was sent ' + JSON.stringify(toBen.map(it => it.key + '=' + it.v)));
  return bad;
});

/* ---------- A PAYLOAD ASKED FOR BY SOMEBODY WHO HAS SINCE SIGNED OUT DOES NOT LAND § */
check('an admin’s payload that lands after Sign out is not adopted, and the signed-out phone asks for its own', async () => {
  let hold = false, release = null;
  const adminPayload = () => Object.assign(payload(), { films: FILMS_ });
  const { w, gets } = boot({ payload: adminPayload(),
    before: win => { win.localStorage.setItem('familyUser', JSON.stringify(vidAdmin_)); },
    /* THE SERVER'S GATE, PLAYED: a GET with the admin's token is sent the films, one with none is not. */
    serve: url => {
      if (/data\/videos\.json/.test(url)) return [];
      if (url.indexOf('script.google.com') === -1) return undefined;
      if (hold) return new Promise(r => { release = () => r(adminPayload()); });
      return /[?&]token=/.test(url) ? undefined : Object.assign(payload(), { films: [] });
    } });
  await wait(400);
  const t = w.__t, bad = [];
  const films = () => { try { return w.stuffItemsAll_().filter(x => x.kind === 'film').length; } catch (e) { return -1; } };
  if ((t.DATA().films || []).length !== FILMS_.length) return ['the setup: the admin’s DATA holds ' + (t.DATA().films || []).length + ' of ' + FILMS_.length + ' films, so their going was NOT checked'];
  if (films() !== 0) bad.push('the admin’s Find has ' + films() + ' film(s) — films are not in Find for anybody');
  if (typeof w.load !== 'function') return ['load is not reachable — nothing was checked'];
  hold = true;
  w.load();
  await wait(20);
  t.ACTIONS.signout(w.document.createElement('button'));
  await wait(50);
  if (t.whoami()) return ['Sign out left somebody signed in — nothing was checked'];
  hold = false;
  const before = gets.length;
  if (!release) return ['the admin’s second payload was never asked for, so its landing was NOT checked'];
  release();
  await wait(400);
  if ((t.DATA().films || []).length) bad.push('the admin’s payload landed after Sign out: DATA.films holds ' + t.DATA().films.length + ' films on a signed-out phone');
  if (films() !== 0) bad.push('signed out, Find has ' + films() + ' of the admin’s films');
  t.go('stuff', false, true);
  await wait(30);
  const offers = [...w.document.querySelectorAll('#s-stuff #stuff-groups [data-do="facet-pick"]')].map(b => b.dataset.value);
  if (offers.indexOf('Films') !== -1) bad.push('the signed-out funnel offers "Films": ' + JSON.stringify(offers));
  const asked = gets.slice(before).filter(u => u.indexOf('script.google.com') !== -1);
  if (!asked.length) bad.push('nothing was asked for the signed-out phone after the admin’s payload was dropped');
  else if (asked.some(u => /[?&]token=/.test(u))) bad.push('the payload asked after Sign out carries a token: ' + asked.join(' '));
  return bad;
});

check('the payload landing does not rebuild Find under a keypad box with the focus, and does rebuild it once the box is left', async () => {
  const { w } = boot();
  await wait(400);
  const t = w.__t, d = w.document, bad = [];
  if (typeof w.findKeep_ !== 'function' || typeof w.kpField_ !== 'function') return ['findKeep_ or kpField_ not reachable — the keep was NOT checked'];
  t.USER(Object.assign({}, ANS_ADA));
  t.go('stuff', false, true);
  const host = d.getElementById('s-stuff');
  const page = d.createElement('div');
  page.className = 'qcard';
  page.innerHTML = w.kpField_('ans:u:P7:q:Q-KEEP', '7');
  host.appendChild(page);
  const inp = page.querySelector('.kp-in');
  inp.focus();
  if (d.activeElement !== inp) return ['the keypad box could not take the focus, so nothing was checked'];
  const padUp = () => d.documentElement.classList.contains('kp-up');
  await w.load();
  await wait(50);
  if (!d.contains(inp)) bad.push('the payload landing rebuilt Find and threw away the box the child was typing in');
  if (d.activeElement !== inp) bad.push('after the payload the focus is on ' + (d.activeElement && d.activeElement.tagName) + ', not the box');
  if (padUp() !== true && d.getElementById('kp')) bad.push('the payload landing put the keypad away');
  inp.blur();
  await wait(500);
  if (d.contains(inp)) bad.push('half a second after the box was left, Find was still the stale copy — it is never redrawn');
  return bad;
});

/* ---------- AND FIND 2 THE SAME, NOW THAT IT HOLDS THE QUESTIONS (docs/history/347) § */
check('the payload landing does not rebuild Find under a keypad box with the focus, and does rebuild it once the box is left', async () => {
  const { w } = boot();
  await wait(400);
  const t = w.__t, d = w.document, bad = [];
  if (typeof w.findKeep_ !== 'function' || typeof w.kpField_ !== 'function') return ['findKeep_ or kpField_ not reachable — the keep was NOT checked'];
  t.USER(Object.assign({}, ANS_ADA));
  t.go('stuff', false, true);
  await wait(60);
  const host = d.getElementById('s-stuff');
  if (!host || !host.firstElementChild) return ['Find is not drawn — the keep was NOT checked'];
  const page = d.createElement('div');
  page.className = 'qcard';
  page.innerHTML = w.kpField_('ans:u:P7:q:Q-KEEP-2', '7');
  host.appendChild(page);
  const inp = page.querySelector('.kp-in');
  inp.focus();
  if (d.activeElement !== inp) return ['the keypad box could not take the focus, so nothing was checked'];
  if (!w.findKeep_('stuff')) bad.push('findKeep_ does not hold Find while a box in it has the focus');
  await w.load();
  await wait(50);
  if (!d.contains(inp)) bad.push('the payload landing rebuilt Find and threw away the box the child was typing in');
  if (d.activeElement !== inp) bad.push('after the payload the focus is on ' + (d.activeElement && d.activeElement.tagName) + ', not the box in Find');
  inp.blur();
  await wait(500);
  if (d.contains(inp)) bad.push('half a second after the box was left, Find was still the stale copy — it is never redrawn');
  return bad;
});

check('a second payload repaints the column in front and leaves the others for when they are visited, and asks for messages once', async () => {
  const { w, sent } = boot({ before: win => { win.localStorage.setItem('familyUser', JSON.stringify(ANS_ADA)); },
    reply: b => (b.action === 'messages' ? { success: true, messages: [] } : { success: true }) });
  await wait(600);
  const t = w.__t, d = w.document, bad = [];
  const firstAsks = sent.filter(b => b.action === 'messages').length;
  if (firstAsks !== 1) bad.push('the first load asked for messages ' + firstAsks + ' times — the widgets and the Messages column share one request');
  const ids = (t.TABS || []).map(x => x.id);
  ids.forEach(id => { const el = d.getElementById('s-' + id); if (el && el.firstElementChild) el.firstElementChild.setAttribute('data-was', '1'); });
  await w.load();
  await wait(100);
  const redrawn = ids.filter(id => { const el = d.getElementById('s-' + id); return el && !(el.firstElementChild && el.firstElementChild.hasAttribute('data-was')); });
  if (redrawn.filter(id => id !== t.AT()).length) bad.push('a second payload rebuilt ' + redrawn.length + ' columns (' + redrawn.join(', ') + ') — wanted only the one in front, ' + t.AT() + '; the rest are drawn when visited');
  return bad;
});

/* ---------- AN ORDERING IS TAPPED IN ORDER, ON THE REAL CARD § */
check('an ordering: the real 1F Q4 is typed as letters in order, marked by its order, kept on the account and drawn back (owner, 9 Nov)', async () => {
  const ID = 'Q-1MA1-2406-1F-4';
  const LIB = LIB_FULL.rows('questions');
  const row = LIB.find(r => r.row_id === ID);
  if (!row) return [ID + ' is not in data/questions.json — nothing was typed'];
  const TIE = 'Q-1MA1-2406-1F-4-TIE';
  const paper = LIB.filter(r => r.paper_id === row.paper_id).concat([Object.assign({}, row, {
    row_id: TIE, question: '4x', html: '<p>Write these in order of size. Start with the smallest.</p>',
    choices: '0.5 | <sup>1</sup>&frasl;<sub>2</sub> | 0.7', choice_right: '2,1,3 | 1,2,3', answer: '<b>0.5, &frac12;, 0.7</b>' })]);
  const server = {};
  const { w } = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }),
    reply: ansBackend_(server), serve: url => (/data\/questions\.json/.test(url) ? paper : undefined) });
  await wait(300);
  const need = ansNeed_(w).concat(['markPart_', 'markOrder_', 'stuffItemsAll_'].filter(n => typeof w[n] !== 'function'));
  if (need.length) return [need.join(', ') + ' not reachable — renamed? No ordering was checked'];
  const d = w.document, bad = [];
  w.__t.USER(Object.assign({}, ANS_ADA));
  const x = w.stuffItemsAll_().find(it => it.row && it.row.row_id === ID);
  const tie = w.stuffItemsAll_().find(it => it.row && it.row.row_id === TIE);
  if (!x || !tie) return ['the real ' + ID + ' or its tie did not come through the loader into Find — nothing was typed'];
  const said = JSON.stringify({ t: x.answerType, c: x.choices, w: x.choiceWays, e: x.orderEnds });
  if (said !== JSON.stringify({ t: 'order', c: ['0.21', '0.2', '0.03', '0.1', '0.16'], w: [[3, 4, 5, 2, 1]], e: ['smallest', 'largest'] })) bad.push('the loader made the row into ' + said);
  const host = d.createElement('div');
  d.body.appendChild(host);
  host.innerHTML = w.findCard(x, 0);
  if (!host.querySelector('.qp-optlist') || host.querySelectorAll('.qp-ans-in').length !== 1) bad.push('the ordering does not list its options over one typed box');
  if (host.querySelector('.qp-order, .qp-item')) bad.push('the ordering still draws tap-to-place items');
  const r1 = typeChoice_(w, host, x, 'C, D, E');
  if (r1.said === 'Correct') bad.push('three of five places was marked Correct');
  const r2 = typeChoice_(w, host, x, 'C, D, E, B, A');
  if (r2.said !== 'Correct') bad.push('the right order typed as letters says ' + JSON.stringify(r2.said));
  const r3 = typeChoice_(w, host, x, '0.03, 0.1, 0.16, 0.2, 0.21');
  if (r3.said !== 'Correct') bad.push('the right order typed as the values says ' + JSON.stringify(r3.said));
  host.innerHTML = w.findCard(tie, 0);
  ['B, A, C', 'A, B, C'].forEach(v => { const r = typeChoice_(w, host, tie, v); if (r.said !== 'Correct') bad.push('the tie typed ' + v + ' says ' + JSON.stringify(r.said)); });
  /* TYPED AS A CHILD TYPES: the keypad's input event is what keeps a box's words (`ansStore_`); typeChoice_ only sets the value. */
  const typed = host.querySelector('.qp-ans-in');
  if (typed) typed.dispatchEvent(new w.Event('input', { bubbles: true }));
  await w.answersPush_(true);
  const kept = server['P7'] || server;
  if (!JSON.stringify(kept).includes('A, B, C')) bad.push('the typed order did not reach the account');
  host.remove();
  return bad;
});

/* ---------- A CHILD IS HER FIRST NAME ON EVERY SCREEN, FOR EVERYBODY § */
const SUR_ = 'Quorrington';
const SURS_ = [SUR_, 'Vandersloot'];
function surnameWorld_() {
  const { backend } = require('./check-gas-load.js');
  const b = backend({ MailApp: { sendEmail() {}, getRemainingDailyQuota: () => 100 } });
  const day = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  const dmy = d => d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London', xp: 0, credits: 0 };
  const P = (id, role, first, last, email, handle, extra) => Object.assign({ person_id: id, role, first_name: first,
    last_name: last, email, handle }, base, extra || {});
  b.seed('people', [
    P('P-ADM', 'admin', 'Hal', 'Admin', 'admin@example.org', 'hal_kind40'),
    P('P-TUT', 'tutor', 'Tam', 'Tutor', 'tutor@example.org', 'tam_kind41', { availability: 'm16,m17,sa10,sa11,sa12',
      rate_per_hour: 20, max_students: 4, min_students: 1, age_min: 8, age_max: 16, dbs_checked: true }),
    P('P-PAR', 'client', 'Pip', 'Ashdown', 'pip@example.org', 'pip_kind42'),
    P('P-KID', 'student', 'Wren', SUR_, '', 'wren_kind43', { date_of_birth: '14/03/2014', high_score_flappy: 31 }),
    /* A SECOND WREN, so the server's name for her is `Wren (@wren_kind43)` — and the phone must take that
       from `myProfile` rather than stop at the first name it can work out for itself. */
    P('P-KD2', 'student', 'Wren', 'Ollerby', '', 'wren_bold44'),
    P('P-STU', 'student', 'Ned', 'Pell', 'ned@example.org', 'ned_kind45'),
    P('P-OTH', 'client', 'Ola', 'Brisk', 'ola@example.org', 'ola_kind46'),
    /* A TUTOR TICK STILL WAITING FROM BEFORE 400 — the tick is no longer a way in, so her row is seeded already waiting. */
    P('P-PEN', 'student, tutor', 'Juno', 'Vandersloot', 'juno@example.org', 'juno_kind47', { high_score_flappy: 12, listed: 'PENDING' }),
  ]);
  b.seed('family', [{ link_id: 'L1', parent_id: 'P-PAR', child_id: 'P-KID', child_typed: 'Wren ' + SUR_, state: 'accepted' }]);
  b.seed('config', [{ key: 'max_open_requests', value: 20 }]);
  b.seed('posts', [{ post_id: 'PO-1', author: 'Wren ' + SUR_, posted_by: 'Wren ' + SUR_, image: 'https://example.org/w.jpg',
    caption: 'Wren ' + SUR_ + ' and the volcano', approved: 'TRUE', active: 'TRUE', posted_on: dmy(day(-1)) }]);
  b.seed('post_reactions', [{ reaction_id: 'R1', post_id: 'PO-1', person_id: 'P-KID', emoji: '👍', reacted_on: dmy(day(-1)) }]);
  b.seed('post_comments', [{ comment_id: 'C1', post_id: 'PO-1', person_id: 'P-KID', body: 'thank you', said_on: dmy(day(-1)), active: 'TRUE' }]);
  const tk = {};
  [['admin@example.org', 'P-ADM'], ['tutor@example.org', 'P-TUT'], ['pip@example.org', 'P-PAR'], ['wren_kind43', 'P-KID'],
   ['ned@example.org', 'P-STU'], ['ola@example.org', 'P-OTH'], ['juno@example.org', 'P-PEN']].forEach(([who, id]) => {
    const d = b.post({ action: 'verifyLogin', email: who, name: who, pin: '0000' });
    if (d && d.success) tk[id] = d;
  });
  const as = (pid, body) => b.post(Object.assign({ token: tk[pid].token, name: tk[pid].name, personId: pid }, body));
  /* HER SEAT, BOOKED BY HER PARENT FOR HER AS AN OLD PHONE DID (her whole name ticked), AND HER OWN. */
  if (tk['P-PAR']) as('P-PAR', { action: 'createJob', requestedTutor: 'Tam Tutor', subject: 'English', level: 'GCSE', day: 'Saturday',
    time: '11:00', slots: 'sa11', location: 'Online', dates: dmy(day(41)), hours: 1, price: 30, kids: 'Wren ' + SUR_ });
  /* AND ONE THE ADMIN BOOKED FOR HER under her whole name — a child does not book herself since 398. */
  if (tk['P-ADM']) as('P-ADM', { action: 'createJob', clientName: 'Wren ' + SUR_, requestedTutor: 'Tam Tutor', subject: 'Maths', level: 'GCSE', day: 'Saturday',
    time: '10:00', slots: 'sa10', location: 'Online', dates: dmy(day(40)), hours: 1, price: 30 });
  if (tk['P-KID']) as('P-KID', { action: 'sendMessage', to: 'Hal Admin', toId: 'P-ADM', body: 'Can we do fractions?' });
  /* JUNO IS A TUTOR LEFT WAITING — then the admin books her a session (398) and she says a word on Wren's post. */
  if (tk['P-PEN']) {
    const t1 = as('P-PEN', { action: 'myProfile' });
    const t2 = as('P-ADM', { action: 'createJob', clientName: 'Juno Vandersloot', requestedTutor: 'Tam Tutor', subject: 'Maths', level: 'GCSE', day: 'Saturday',
      time: '12:00', slots: 'sa12', location: 'Online', dates: dmy(day(42)), hours: 1, price: 30 });
    const t3 = as('P-PEN', { action: 'addComment', postId: 'PO-1', body: 'great volcano' });
    if (!(t1 && t1.tutorPending) || !(t2 && t2.success) || !(t3 && t3.success)) tk.junoFailed = JSON.stringify([t1, t2, t3]).slice(0, 300);
  }
  /* AND OLA, ANOTHER PARENT, SAYS A WORD UNDER IT (docs/history/342) — so a grown-up's whole name is in a
     comment every visitor's feed draws, beside Pip's in the events of the session she booked for Wren. */
  if (tk['P-OTH']) {
    const o1 = as('P-OTH', { action: 'addComment', postId: 'PO-1', body: 'lovely' });
    if (!(o1 && o1.success)) tk.olaFailed = JSON.stringify(o1).slice(0, 300);
  }
  return { b, tk };
}
/* AND A PARENT'S SURNAME, SINCE 11 OCT (docs/history/342): § */
const GROWN_ = { 'P-PAR': 'Ashdown', 'P-OTH': 'Brisk' };
const KIN_ = { 'P-KID': ['P-PAR'] };
check('a child is her first name on every screen, and a parent is hers to everybody but herself, an admin and her own child: no surname drawn for a visitor, her tutor, another parent, her parent, an admin, or herself outside her own boxes on Settings and her own card\'s Edit', async () => {
  let world;
  try { world = surnameWorld_(); } catch (e) { return ['the real backend could not be built, so NOTHING was drawn — ' + e.message]; }
  const { b, tk } = world;
  if (tk.junoFailed) return ['Juno could not tick Tutor, book and comment, so a pending tick was NOT asked — ' + tk.junoFailed];
  if (tk.olaFailed) return ['Ola could not comment, so a grown-up\'s name under a post was NOT asked — ' + tk.olaFailed];
  if (Object.keys(tk).length < 7) return ['only ' + Object.keys(tk).join(', ') + ' could sign in, so most screens were NOT drawn — not a pass'];
  const VIEW = [['a visitor', null], ['her tutor', 'P-TUT'], ['another parent', 'P-OTH'], ['an admin', 'P-ADM'], ['herself', 'P-KID'],
                ['her parent', 'P-PAR']];
  const bad = [];
  for (const [who, pid] of VIEW) {
    /* WHAT `familyUser` HOLDS: the real sign-in reply — and for her, that reply as a phone signed in
       before 10 Oct kept it, her whole name in it. */
    const user = pid ? JSON.parse(JSON.stringify(tk[pid])) : null;
    if (pid === 'P-KID') user.name = 'Wren ' + SUR_;
    const pay = b.get(pid ? { token: tk[pid].token } : {});
    const { w, errs } = boot({ payload: pay, reply: body => b.post(body),
      before: win => { if (user) win.localStorage.setItem('familyUser', JSON.stringify(user)); } });
    for (let k = 0; k < 80 && !w.__t; k++) await wait(100);
    const t = w.__t;
    if (!t) { bad.push(who + ': the app did not finish loading'); continue; }
    await wait(600); await woken_();
    if (!!pid !== !!t.whoami()) { bad.push(who + ': the app reads this visitor as signed ' + (t.whoami() ? 'in' : 'out') + ' — NOT asked about'); continue; }
    const seen = [];
    let sawJuno = false, sawWhole = false;
    /* A GROWN-UP'S SURNAME IS HUNTED FOR EVERYBODY BUT THEMSELVES AND THE ADMIN; A CHILD'S FOR EVERYBODY. */
    const hunt = SURS_.concat(pid === 'P-ADM' ? [] : Object.keys(GROWN_).filter(g => g !== pid && (KIN_[pid] || []).indexOf(g) === -1).map(g => GROWN_[g]));
    const look = (where) => {
      const root = w.document.documentElement.cloneNode(true);
      /* HER OWN BOXES, AND NOTHING ELSE, are where her surname belongs — on Settings, and on her own card's Edit, where her name is edited since docs/history/339 § */
      if (pid === 'P-KID') root.querySelectorAll('#s-account input, #s-account textarea, #s-students .card-ed[data-pid="P-KID"] input').forEach(el => el.remove());
      const html = root.outerHTML;
      const m = html.match(new RegExp('.{0,70}(?:' + hunt.join('|') + ').{0,40}', 'i'));
      if (/Juno/.test(html)) sawJuno = true;
      if (/Pip Ashdown/.test(html)) sawWhole = true;
      if (m) seen.push(where + ': …' + m[0].replace(/\s+/g, ' ') + '…');
    };
    let pages = 0;
    for (const id of t.TABS.map(x => x.id)) {
      try { t.go(id, false, true); } catch (e) { bad.push(who + ': ' + id + ' threw on go(): ' + e.message); continue; }
      await wait(120); await woken_();
      look(id);
      /* HER OWN CARD'S EDITING CARDS (468) — the one screen where her surname is in a box of her own, and so the one where
         it could leak just beside the box. Always open there, so looked at as drawn. */
      if (pid === 'P-KID' && id === 'account') {
        for (let k = 0; k < 40 && !w.document.querySelector('#s-account .card-ed .me-form'); k++) await wait(100);
        const box = w.document.querySelector('#s-account .card-ed [data-me="last_name"]');
        if (!box) bad.push('herself: her Name card drew no surname box, so the walk past it was NOT a test');
        look('students, her own card being edited');
      }
      /* A WINDOWED SCREEN HOLDS A FEW PAGES AT A TIME, so it is walked page by page. */
      let n = 0;
      try { n = t.pageCount(id) || 0; } catch (e) { n = 0; }
      pages += Math.max(1, n);
      if ((t.PAGE_KEEP || {})[id]) {
        for (let p = 1; p < Math.min(n, 40); p++) { try { t.goPage(id, p, true); } catch (e) {} await wait(30); look(id + ' page ' + (p + 1)); }
      }
    }
    if (pages < 12) bad.push(who + ': only ' + pages + ' pages were drawn — the walk did not reach the screens');
    [...new Set(seen)].slice(0, 4).forEach(x => bad.push(who + ' is shown a surname that is not theirs to see on ' + x));
    /* AND THE ADMIN IS SHOWN PIP'S WHOLE NAME — the rule is "to everybody but herself and an admin", not "to nobody". */
    if (pid === 'P-ADM' && !sawWhole) bad.push('an admin: "Pip Ashdown" is nowhere on any screen, so the admin\'s exemption was NOT seen — or the net took her surname from the admin too');
    /* (386) A CHILD SEES NO PARENT, her own included — the owner, 20 Oct. */
    if (pid === 'P-KID' && sawWhole) bad.push('herself: her own parent "Pip Ashdown" is drawn on a screen — a child sees no parent (386)');
    /* AND HER FIRST NAME IS THERE, where a screen names her — a rule that drew nobody would pass the above. */
    const all = w.document.documentElement.outerHTML;
    if (pid !== 'P-TUT' && !/Wren/.test(all)) bad.push(who + ': "Wren" is nowhere on any screen, so the screens that name her were NOT drawn — not a pass');
    /* JUNO IS NOBODY'S FAMILY OR FRIEND, so only staff are sent her (386); everybody else must not be. */
    const staffSees = pid === 'P-TUT' || pid === 'P-ADM';
    if (staffSees && !sawJuno) bad.push(who + ': "Juno" is nowhere on any screen, so the screens that name the child who ticked Tutor were NOT drawn — not a pass');
    if (!staffSees && sawJuno) bad.push(who + ': "Juno" is drawn on a screen — she is not their child, sibling or friend (386)');
    if (pid === 'P-KID' && String((t.whoami() || {}).name) !== String(tk['P-KID'].name)) {
      bad.push('herself: the phone calls her ' + JSON.stringify((t.whoami() || {}).name) + ' after `myProfile`, and the server calls her '
        + JSON.stringify(tk['P-KID'].name) + ' — a session from before 10 Oct keeps the name it was signed in with for thirty days');
    }
    if (errs.length) bad.push(who + ': errors: ' + errs.slice(0, 3).join(' | '));
  }
  return bad;
});

/* ---------- A CHILD WHOSE HANDLE WAS MOVED STILL GETS IN, AND IS TOLD WHAT IT IS NOW (docs/history/342) § */
function movedWorld_() {
  const { backend } = require('./check-gas-load.js');
  const b = backend({ MailApp: { sendEmail() {}, getRemainingDailyQuota: () => 100 } });
  const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London', xp: 0, credits: 0, email: '' };
  b.seed('people', [
    Object.assign({ person_id: 'P-EJ', role: 'student', first_name: 'Ella', last_name: 'Jones', handle: 'ej2345',
                    handle_was: 'ella_kind42', friends: 'ab3456' }, base),
    Object.assign({ person_id: 'P-AB', role: 'student', first_name: 'Abe', last_name: 'Bell', handle: 'ab3456' }, base),
  ]);
  return b;
}
check('a child whose handle was moved signs in with the old one on her slip, and a sheet she closes says the new one', async () => {
  let b;
  try { b = movedWorld_(); } catch (e) { return ['the real backend could not be built, so NOTHING was signed into — ' + e.message]; }
  const { w } = boot({ payload: b.get({}), reply: body => b.post(body) });
  for (let k = 0; k < 80 && !w.__t; k++) await wait(100);
  const t = w.__t, d = w.document, bad = [];
  if (!t) return ['the app did not finish loading'];
  await wait(300);
  t.go('account', false, true);
  await wait(120);
  { const no = await findSign_(w, 'ella_kind42', '0000'); if (no) return [no + ', so the old handle was NOT typed']; }
  for (let k = 0; k < 40 && !t.whoami(); k++) await wait(100);
  await wait(200);
  const u = t.whoami();
  if (!u || u.personId !== 'P-EJ') return ['the old handle on her slip did not sign her in — ' + JSON.stringify(u && u.personId)];
  if (u.handle !== 'ej2345') bad.push('the phone calls her @' + u.handle + ' after signing in, not @ej2345');
  const title = String((d.getElementById('sheet-title') || {}).textContent || '');
  const body = String((d.getElementById('sheet-body') || {}).textContent || '');
  const open = !d.getElementById('sheet').classList.contains('hidden');
  if (!open || title !== 'Your handle has changed' || body.indexOf('@ej2345') === -1)
    bad.push('no sheet she has to close said her new handle — ' + JSON.stringify({ open, title, body: body.slice(0, 160) }));
  /* AND HER NEW ONE SAYS NOTHING — the sheet is for the old one, every time it is used, and only then. */
  const again = b.post({ action: 'verifyLogin', email: 'ej2345', name: 'ej2345', pin: '0000' });
  if (!again.success || again.handleMoved) bad.push('signing in with her new handle says something moved — ' + JSON.stringify(again).slice(0, 200));
  return bad;
});

