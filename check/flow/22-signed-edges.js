check('a store that refuses the write: the box keeps the visit\'s copy through a redraw, says it is not saved, and leaving asks first — a store with room says nothing', async () => {
  const { w } = boot({ before: signedInAs_(ANS_ADA) });
  await wait(300);
  const need = ansNeed_(w).concat(['ansValue_'].filter(n => typeof w[n] !== 'function'));
  if (need.length) return [need.join(', ') + ' not reachable — nothing was refused'];
  const bad = [];
  const c = ansCards_(w, 'F');
  const k = 'ans:u:P7:' + c.words.key;
  /* HUNT A3: 142 characters stored, then the store full of other things, and 252 typed. */
  ansType_(w, c.ta(), 'a'.repeat(142));
  const real = w.Storage.prototype.setItem;
  w.Storage.prototype.setItem = function (key, v) {
    if (/^(ans|pad|draft):/.test(String(key))) throw new w.DOMException('The quota has been exceeded.', 'QuotaExceededError');
    return real.call(this, key, v);
  };
  try {
    ansType_(w, c.ta(), 'a'.repeat(252));
    if (w.localStorage.getItem(k) !== 'a'.repeat(142)) bad.push('the refused write was NOT set up — the store holds ' + String(w.localStorage.getItem(k)).length);
    c.draw();
    if (c.ta().value.length !== 252) bad.push('a redraw drew the box with ' + c.ta().value.length + ' characters — the store\'s older copy over the visit\'s 252');
    if (c.saidFor(c.words) !== 'Not saved — this browser is not keeping it') bad.push('under a refused answer the line says ' + JSON.stringify(c.saidFor(c.words)));
    /* AND THE PEN'S NOTE (review of 317): a stroke the store refused is not "kept on this device". */
    ansStroke_(w, c, [[10, 10], [60, 60], [90, 20]]);
    const note = c.pad() && c.pad().querySelector('[data-kept-k]');
    if (!note || note.textContent !== 'Not saved — this browser is not keeping it.') bad.push('under a drawing the store refused, the pad says ' + JSON.stringify(note && note.textContent));
    ansType_(w, c.ta(), c.ta().value + 'b');
    if (String(w.ansValue_(k)).length !== 253) bad.push('the next key after the redraw left the visit\'s copy at ' + String(w.ansValue_(k)).length + ', wanted 253');
    const ev = new w.Event('beforeunload', { cancelable: true });
    w.dispatchEvent(ev);
    if (!ev.defaultPrevented) bad.push('leaving with 253 characters held by nothing but the page did not ask first');
  } finally { w.Storage.prototype.setItem = real; }
  /* ROOM AGAIN: the next key lands, the line goes back, and leaving does not ask. */
  ansType_(w, c.ta(), c.ta().value + 'c');
  if (String(w.localStorage.getItem(k)).length !== 254) bad.push('with room again the store holds ' + String(w.localStorage.getItem(k)).length + ', wanted 254');
  if (c.saidFor(c.words) !== 'On this device only') bad.push('with the answer stored again the line says ' + JSON.stringify(c.saidFor(c.words)));
  const ev2 = new w.Event('beforeunload', { cancelable: true });
  w.dispatchEvent(ev2);
  if (ev2.defaultPrevented) bad.push('leaving asked first with every answer stored — a prompt on every refresh');
  return bad;
});

check('a browser that keeps no site data at all: the answer lives through a redraw, the line says so, and leaving asks first', async () => {
  const { w, errs } = boot({ before: win => {
    Object.defineProperty(win, 'localStorage', { configurable: true, get() { throw new win.DOMException('The operation is insecure.', 'SecurityError'); } });
  } });
  await wait(300);
  const need = ansNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
  const bad = [];
  /* SIGNED IN FOR THE VISIT, as a sign-in leaves it when nothing can be stored — hunt A1. */
  w.__t.USER(Object.assign({}, ANS_ADA));
  /* NOTHING TYPED YET: hiding the page on Find writes where Find was, which this browser refuses — and a
     place is a convenience, so leaving must not ask (`keepPut_`'s `quiet`). */
  w.__t.go('stuff');
  w.dispatchEvent(new w.Event('pagehide'));
  const ev0 = new w.Event('beforeunload', { cancelable: true });
  w.dispatchEvent(ev0);
  if (ev0.defaultPrevented) bad.push('with nothing typed, leaving Find asked "Leave site?" — where Find was is a convenience, and a refresh would ask every time');
  const c = ansCards_(w, 'N');
  ansType_(w, c.ta(), 'x'.repeat(111));
  if (c.saidFor(c.words) !== 'Not saved — this browser is not keeping it') bad.push('with nothing stored the line says ' + JSON.stringify(c.saidFor(c.words)) + ' — it said "On this device only" over an answer on no device');
  c.draw();
  if (c.ta().value.length !== 111) bad.push('a redraw drew ' + c.ta().value.length + ' characters, wanted the visit\'s 111 (hunt A2: it drew an empty box, and the next key saved one letter)');
  const ev = new w.Event('beforeunload', { cancelable: true });
  w.dispatchEvent(ev);
  if (!ev.defaultPrevented) bad.push('leaving with 111 characters held by nothing but the page did not ask');
  if (errs && errs.length) bad.push('the app threw with storage blocked: ' + errs.slice(0, 2).join(' | '));
  return bad;
});

check('an answer written in another tab is the answer in this one — a stale box is given it before a key can write over it', async () => {
  const { w } = boot({ before: signedInAs_(ANS_ADA) });
  await wait(300);
  const need = ansNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
  const bad = [];
  const c = ansCards_(w, 'T');
  const k = 'ans:u:P7:' + c.words.key;
  if (c.ta().value) return ['the box was not empty to start with — NOT checked'];
  /* THE OTHER TAB WRITES THE ESSAY; the browser tells this one with `storage`. */
  w.localStorage.setItem(k, RELOAD_ESSAY);
  w.dispatchEvent(new w.StorageEvent('storage', { key: k, oldValue: null, newValue: RELOAD_ESSAY }));
  if (c.ta().value !== RELOAD_ESSAY) bad.push('the box in this tab still holds ' + c.ta().value.length + ' characters after the other tab wrote ' + RELOAD_ESSAY.length);
  ansType_(w, c.ta(), c.ta().value + '!');
  if (w.localStorage.getItem(k) !== RELOAD_ESSAY + '!') bad.push('one key in this tab left the store holding ' + String(w.localStorage.getItem(k)).length + ' characters (hunt 3: "H" over 1,369)');
  return bad;
});

check('a session the server ended on the reload: the box drawn signed out says the answer is still here, and signing in again brings it back', async () => {
  const one = boot({ before: signedInAs_(ANS_ADA) });
  await wait(300);
  const need = ansNeed_(one.w);
  if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
  const bad = [];
  let c = ansCards_(one.w, 'G');
  ansType_(one.w, c.ta(), RELOAD_ESSAY);
  one.w.dispatchEvent(new one.w.Event('pagehide'));
  /* THE iPAD SIGNED THE ACCOUNT OUT: every signed-in request of this computer's is refused. */
  const two = boot({ before: fromStore_(keptStore_(one.w)),
    reply: b => (b.token === 'tok-P7' ? { error: 'Please sign in again.', why: 'signed-out' } : undefined) });
  for (let i = 0; i < 40 && two.w.__t.whoami(); i++) await wait(50);
  const w = two.w;
  if (w.__t.whoami()) return ['the server refused the session and the app stayed signed in — NOT checked'];
  c = ansCards_(w, 'G');
  if (c.ta().value) bad.push('signed out by the server, the box shows ' + c.ta().value.length + ' characters — wanted the signed-out key\'s empty box');
  if (c.saidFor(c.words) !== 'Signed out — sign in again and your answer is back') bad.push('under the empty box the line says ' + JSON.stringify(c.saidFor(c.words)) + ' — an essay still on the device and nothing saying so');
  if (w.localStorage.getItem('ans:u:P7:' + c.words.key) !== RELOAD_ESSAY) bad.push('the essay under Ada\'s key is gone from the device');
  w.signedIn_(Object.assign({}, ANS_ADA));
  c.draw();
  if (c.ta().value !== RELOAD_ESSAY) bad.push('signed in again, the box holds ' + c.ta().value.length + ' characters, wanted the essay');
  if (/Signed out/.test(c.saidFor(c.words) || '')) bad.push('signed in again, the line still says ' + JSON.stringify(c.saidFor(c.words)));
  return bad;
});

check('a reload puts Find back on the question: the column, the paper\'s chip and the essay\'s page, with the box holding what was typed', async () => {
  const LIB = LIB_FULL.rows('questions');
  const ID = 'Q-R0398-5';
  const row = LIB.find(r => r.row_id === ID);
  if (!row) return [ID + ' is not in data/questions.json — nothing was reloaded'];
  const paper = LIB.filter(r => r.paper_id === row.paper_id);
  const serve = url => (/data\/questions\.json/.test(url) ? paper : undefined);
  const one = boot({ serve, before: signedInAs_(ANS_ADA) });
  const W = one.w;
  for (let i = 0; i < 100 && !(typeof W.stuffItemsAll_ === 'function' && W.stuffItemsAll_().some(x => x.row && x.row.row_id === ID)); i++) await wait(50);
  const x = W.stuffItemsAll_().find(it => it.row && it.row.row_id === ID);
  if (!x) return ['the essay did not come through the loader into Find — nothing was reloaded'];
  const bad = [];
  const S = W.__t.STUFF();
  S.filters = [{ field: 'paperId', value: row.paper_id }];
  W.paintStuff();
  W.__t.go('stuff');
  const at = W.stuffPages_().findIndex(pg => pg.x === x && !pg.part);
  const i0 = at >= 0 ? at : W.stuffPages_().findIndex(pg => pg.x === x);
  W.__t.goPage('stuff', W.stuffFirstResult_() + i0, true);
  await wait(200);
  const k = 'ans:u:P7:' + x.key;
  const box1 = W.document.querySelector('#s-stuff [data-do="qp-ans"][data-k="' + k + '"]');
  if (!box1) return ['the essay\'s box is not on Find\'s page in front — the setup did NOT reach it'];
  ansType_(W, box1, RELOAD_ESSAY);
  /* THE CHILD HAD BEEN WRITING FOR TWENTY MINUTES: the column was chosen long ago, and is left just now. */
  W.localStorage.setItem('familyTabAt', String(Date.now() - 20 * 60 * 1000));
  W.dispatchEvent(new W.Event('pagehide'));
  /* THROUGH THE GETTER (`pg_`): `__t.PAGE.stuff` was undefined on both sides, so this compared nothing. */
  const want = pg_(W.__t).stuff;
  if (!(want > 0)) bad.push('the setup: Find is on page ' + want + ' before the reload, so keeping the page was NOT checked');
  const kept = keptStore_(W);
  const two = boot({ serve, before: fromStore_(kept) });
  const w = two.w;
  for (let i = 0; i < 100 && !(w.__t.STUFF().filters || []).length; i++) await wait(50);
  await wait(200);
  if (w.__t.AT() !== 'stuff') bad.push('the reload opened on ' + w.__t.AT() + ', not Find');
  const f = JSON.stringify(w.__t.STUFF().filters);
  if (f !== JSON.stringify([{ field: 'paperId', value: row.paper_id }])) bad.push('the reload brought Find back with the chips ' + f);
  if (pg_(w.__t).stuff !== want) bad.push('the reload put Find on page ' + pg_(w.__t).stuff + ', not the essay\'s ' + want);
  const box2 = w.document.querySelector('#s-stuff [data-do="qp-ans"][data-k="' + k + '"]');
  if (!box2) bad.push('after the reload the essay\'s box is not on the page in front');
  else if (box2.value !== RELOAD_ESSAY) bad.push('after the reload the essay\'s box holds ' + box2.value.length + ' characters');
  /* AND TOMORROW IS TOMORROW: the same storage, left seven minutes ago, opens where it always did. */
  const stale = Object.assign({}, kept);
  const ago = String(Date.now() - 7 * 60 * 1000);
  stale.familyTabAt = ago;
  Object.keys(stale).filter(n => /^draft:u:P7:find:place$/.test(n)).forEach(n => {
    try { const d = JSON.parse(stale[n]); const p = JSON.parse(d.v); p.at = Number(ago); d.v = JSON.stringify(p); stale[n] = JSON.stringify(d); } catch (e) {}
  });
  const three = boot({ serve, before: fromStore_(stale) });
  await wait(1200);
  if (three.w.__t.AT() === 'stuff' && (three.w.__t.STUFF().filters || []).length) bad.push('a visit seven minutes after leaving was put back on the essay — "remembered for a reload, not for tomorrow"');
  return bad;
});

/* ---------- AND WHAT THE REVIEW OF 317 FOUND (docs/history/317, "After the review") ------------------ */
const draftBox_ = (w, html) => { const h = w.document.createElement('div'); w.document.body.appendChild(h); h.innerHTML = html; return h; };
const draftType_ = (w, el, v) => { el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); };

check('sent while the server is still answering, then reloaded: the message, the comment and the booking are not drawn back — and a refusal gives the words back', async () => {
  /* THE FIRST PAGE NEVER HEARS BACK: § */
  let one = null;
  const cut = () => new Promise((_, no) => one.w.addEventListener('pagehide', () => setTimeout(() => no(new TypeError('Failed to fetch')), 0)));
  one = boot({ before: signedInAs_(ANS_ADA), reply: b => (/^(sendMessage|addComment|createJob)$/.test(b.action) ? cut() : undefined) });
  await wait(300);
  const W = one.w;
  const fns = ['msgForm_', 'commentsHtml_', 'noteRow_', 'draftRead_', 'draftSent_'].filter(n => typeof W[n] !== 'function');
  if (fns.length) return [fns.join(', ') + ' not reachable — nothing was sent'];
  const bad = [];
  const MSG = 'Can we move Tuesday to Wednesday please', CMT = 'Lovely photo of the library', NOTE = 'Tuesdays after school';
  const form = draftBox_(W, W.msgForm_('Tom Tutor', 'P-TOM'));
  draftType_(W, form.querySelector('.msg-text'), MSG);
  W.__t.ACTIONS['msg-send'](form.querySelector('[data-do="msg-send"]'));
  const post = { id: 'POST-S', comments: { list: [], total: 0 } };
  const cf = draftBox_(W, W.commentsHtml_(post));
  draftType_(W, cf.querySelector('.cmt-text'), CMT);
  W.__t.ACTIONS['cmt-add'](cf.querySelector('[data-do="cmt-add"]'));
  draftType_(W, draftBox_(W, W.noteRow_().sel).querySelector('[data-do="book-note"]'), NOTE);
  W.__t.ACTIONS['book-send'](W.document.createElement('button'));
  await wait(50);
  const went = one.sent.map(b => b.action);
  ['sendMessage', 'addComment', 'createJob'].forEach(a => { if (went.indexOf(a) < 0) bad.push(a + ' was never sent, so it was NOT checked: ' + JSON.stringify(went)); });
  /* IN THE PAGE THAT IS SENDING: a redraw keeps the comment in its box under a slow reply, as it always did. */
  if (draftBox_(W, W.commentsHtml_(post)).querySelector('.cmt-text').value !== CMT) bad.push('in the page sending it, a redraw emptied the comment box while the server was still answering');
  W.dispatchEvent(new W.Event('pagehide'));
  await wait(30);
  /* THE RELOAD: the server has all three by now, and says so if asked again. */
  const two = boot({ before: fromStore_(keptStore_(W)), reply: b => (b.action === 'sendMessage' ? { error: 'One message every five minutes.' } : undefined) });
  await wait(300);
  const w = two.w;
  const msg2 = draftBox_(w, w.msgForm_('Tom Tutor', 'P-TOM')).querySelector('.msg-text');
  if (msg2.value) bad.push('after the reload the composer holds ' + JSON.stringify(msg2.value) + ' — sent already, and one press from going twice');
  const cmt2 = draftBox_(w, w.commentsHtml_(post)).querySelector('.cmt-text');
  if (cmt2.value) bad.push('after the reload the comment box holds ' + JSON.stringify(cmt2.value));
  if (w.__t.BOOKING.note) bad.push('after the reload the booking form came back with the note ' + JSON.stringify(w.__t.BOOKING.note) + ' — one press from a second createJob');
  /* A REFUSAL GIVES THE WORDS BACK, for this page and the next. */
  const f2 = msg2.closest('.msg-form');
  draftType_(w, msg2, 'Second try');
  w.__t.ACTIONS['msg-send'](f2.querySelector('[data-do="msg-send"]'));
  await wait(100);
  if (w.draftRead_('msg', 'P-TOM') !== 'Second try') bad.push('a message the server refused is not a draft again: ' + JSON.stringify(w.draftRead_('msg', 'P-TOM')));
  w.dispatchEvent(new w.Event('pagehide'));
  const three = boot({ before: fromStore_(keptStore_(w)) });
  await wait(300);
  const msg3 = draftBox_(three.w, three.w.msgForm_('Tom Tutor', 'P-TOM')).querySelector('.msg-text');
  if (msg3.value !== 'Second try') bad.push('after a refusal and a reload the composer holds ' + JSON.stringify(msg3.value) + ', wanted the words that did not go');
  return bad;
});

check('an unsaved settings edit is not drawn over a newer saved value, the next Save of its card does not send it, and a card holding one says so', async () => {
  let posted = null;
  const PROFILE = { phone_cc: '+44', headline: 'NEWER, saved on the iPad', favourite_colour: 'blue', first_name: 'Ada' };
  const { w } = boot({ before: signedInAs_(Object.assign({}, ANS_ADA, { profile: PROFILE })),
    reply: b => { if (b.action === 'updateProfile') { posted = b; return { success: true, profile: Object.assign({}, PROFILE, b.fields) }; } } });
  await wait(300);
  if (typeof w.fieldHtml !== 'function' || typeof w.meSave_ !== 'function') return ['fieldHtml / meSave_ not reachable — nothing was checked'];
  const bad = [];
  const card = head => draftBox_(w, '<div class="me-form">' + w.fieldHtml('headline', head, {}) + w.fieldHtml('favourite_colour', 'blue', {})
    + '<button data-do="me-save" class="sv">Save</button><p class="faint me-said"></p></div>');
  /* ON THE LAPTOP: typed over "Maths, mostly" and never saved. */
  draftType_(w, card('Maths, mostly').querySelector('[data-me="headline"]'), 'typed on the laptop, never saved');
  /* THE SAME SAVED VALUE AGAIN: drawn holding the edit, and marked as holding one. */
  const same = card('Maths, mostly').querySelector('[data-me="headline"]');
  if (same.value !== 'typed on the laptop, never saved') bad.push('over the value it was typed over, the box was drawn holding ' + JSON.stringify(same.value) + ' — the draft is lost');
  if (!same.hasAttribute('data-draft-held')) bad.push('a box drawn holding an unsaved edit is not marked as holding one');
  if (!/Not saved yet/.test(w.setHeldSay_(w.fieldHtml('headline', 'Maths, mostly', {}) + '<p class="faint me-said"></p>'))) bad.push('a card holding an unsaved edit does not say so under it');
  /* SAVED ON THE iPAD SINCE: the newer value is drawn, and Save on the card for another box sends that. */
  const f = card(PROFILE.headline);
  const hb = f.querySelector('[data-me="headline"]');
  if (hb.value !== PROFILE.headline) bad.push('drawn over a value saved elsewhere since, the box holds ' + JSON.stringify(hb.value) + ' — the older edit over the newer save');
  if (hb.hasAttribute('data-draft-held')) bad.push('a box drawn holding the saved value is marked as holding a draft');
  draftType_(w, f.querySelector('[data-me="favourite_colour"]'), 'green');
  await w.meSave_(f.querySelector('.sv'));
  await wait(100);
  const fields = (posted && posted.fields) || {};
  if (!posted) bad.push('Save sent nothing, so what it sends was NOT checked');
  else if (fields.headline !== PROFILE.headline) bad.push('Save for the colour sent the headline ' + JSON.stringify(fields.headline) + ' over the newer ' + JSON.stringify(PROFILE.headline));
  if (w.draftRead_('set', 'headline') !== null) bad.push('the stale edit is still kept after its card was saved');
  return bad;
});

check('the server ended a session: what is typed signed out afterwards is not handed to the next child who signs in, and the line is for the hour, not for ever', async () => {
  const one = boot({ before: signedInAs_(ANS_ADA) });
  await wait(300);
  const need = ansNeed_(one.w).concat(['ansMayMove_', 'answersClaim_', 'circOf_'].filter(n => typeof one.w[n] !== 'function'));
  if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
  const bad = [];
  let c = ansCards_(one.w, 'H');
  ansType_(one.w, c.ta(), RELOAD_ESSAY);
  /* AND A STROKE ON HER DRAWING, so the one she draws signed out has an answer of hers to go beside. */
  ansStroke_(one.w, c, [[20, 300], [120, 300]]);
  one.w.dispatchEvent(new one.w.Event('pagehide'));
  const two = boot({ before: fromStore_(keptStore_(one.w)),
    reply: b => (b.token === 'tok-P7' ? { error: 'Please sign in again.', why: 'signed-out' } : undefined) });
  for (let i = 0; i < 40 && two.w.__t.whoami(); i++) await wait(50);
  const w = two.w;
  if (w.__t.whoami()) return ['the server refused the session and the app stayed signed in — NOT checked'];
  c = ansCards_(w, 'H');
  const LINE = 'Signed out — sign in again and your answer is back';
  if (c.saidFor(c.words) !== LINE) bad.push('under the empty box the line says ' + JSON.stringify(c.saidFor(c.words)) + ' — NOT the setup this journey needs');
  /* AN HOUR ON, THE LINE IS NOBODY'S BUSINESS: the next visitor is not told what Ada answered. */
  const gone = JSON.parse(w.localStorage.getItem('familyGone') || '{}');
  w.localStorage.setItem('familyGone', JSON.stringify(Object.assign({}, gone, { at: Date.now() - 2 * 60 * 60 * 1000 })));
  c.draw();
  if (c.saidFor(c.words) === LINE) bad.push('two hours after the session ended, every signed-out visitor is still told "your answer is back" under what Ada answered');
  w.localStorage.setItem('familyGone', JSON.stringify(gone));
  c.draw();
  /* ADA, STILL AT THE COMPUTER, TYPES ON INTO THE EMPTY BOX — and into the maths box, which she had left empty while she was signed in — DRAWS on the pad drawn § */
  ansType_(w, c.ta(), 'More words');
  ansType_(w, c.kp(), '(5)/(6)');
  ansStroke_(w, c, [[30, 30], [200, 200]]);
  w.__t.ACTIONS['qw-tap'](c.host.querySelector('[data-circ] .qw'));
  const bare = 'ans:' + c.words.key, bareM = 'ans:' + c.maths.key, bareP = 'pad:' + c.pen.key, bareR = bareP + ':words';
  const ringX = { key: c.pen.key, surface: 'text' };
  const was = {};
  [bare, bareM, bareP, bareR].forEach(k => { was[k] = w.localStorage.getItem(k); });
  if (was[bare] !== 'More words') bad.push('the words typed signed out are not under the signed-out key: ' + JSON.stringify(was[bare]));
  if (!was[bareP] || !was[bareR]) bad.push('the stroke or the ring made signed out is not under the signed-out key (' + JSON.stringify([was[bareP], was[bareR]]) + ') — the pad and the passage were NOT checked');
  /* BEN SIGNS IN NEXT — FROM NOBODY, so `answersClaim_` runs (318), the door the merge left open — and
     opens the question: not his. */
  w.signedIn_(Object.assign({}, ANS_BEN));
  c.draw();
  const benRings = w.circOf_(ringX).on;
  if (c.ta().value) bad.push('Ben signed in and his box holds ' + JSON.stringify(c.ta().value) + ' — Ada\'s words, filed under Ben');
  if (c.kp().value) bad.push('Ben signed in and his maths box holds ' + JSON.stringify(c.kp().value) + ' — Ada\'s, filed under Ben');
  if (c.pad().querySelectorAll('.qpad-g path').length) bad.push('Ben signed in and his pad draws ' + c.pad().querySelectorAll('.qpad-g path').length + ' stroke(s) — Ada\'s, drawn signed out after her session ended (`padAdopt_`)');
  if (benRings.length) bad.push('Ben signed in and the passage rings ' + JSON.stringify(benRings) + ' for him — Ada\'s (`circOf_`)');
  [['ans:u:P8:' + c.words.key, 'words'], ['ans:u:P8:' + c.maths.key, 'maths answer'], ['pad:u:P8:' + c.pen.key, 'drawing'], ['pad:u:P8:' + c.pen.key + ':words', 'rings']].forEach(([k, what]) => {
    if (w.localStorage.getItem(k) !== null) bad.push('Ada\'s ' + what + ' were moved into Ben\'s account: ' + k);
  });
  [bare, bareM, bareP, bareR].forEach(k => { if (w.localStorage.getItem(k) !== was[k]) bad.push('Ada\'s ' + k + ' is gone from under the signed-out key after Ben signed in and opened the question: ' + JSON.stringify(w.localStorage.getItem(k))); });
  /* ADA AGAIN, AS SHE WOULD: § */
  w.signedOut_();
  w.signedIn_(Object.assign({}, ANS_ADA, { token: 'tok-P7-again' }));
  c.draw();
  const JOINED = RELOAD_ESSAY.replace(/\s+$/, '') + '\n\nMore words';
  if (c.ta().value !== JOINED) bad.push('Ada signed in again and her box holds ' + c.ta().value.length + ' characters ending ' + JSON.stringify(c.ta().value.slice(-24)) + ', wanted her essay with "More words" after it' + (c.ta().value === 'More words' ? ' — what she typed into the empty box REPLACED the essay' : c.ta().value === RELOAD_ESSAY ? ' — the words she typed beside it were left behind' : ''));
  if (w.localStorage.getItem('ans:u:P7:' + c.words.key) !== JOINED) bad.push('Ada\'s answer under her own key is ' + String(w.localStorage.getItem('ans:u:P7:' + c.words.key)).length + ' characters after she signed in again, wanted ' + JOINED.length);
  if (!(w.ansDirtySet_('u:P7').has('ans:u:P7:' + c.words.key))) bad.push('the essay with her words after it is not due to go up to Ada\'s account');
  if (c.kp().value !== '(5)/(6)') bad.push('Ada signed in again and her empty maths box holds ' + JSON.stringify(c.kp().value) + ', not what she typed into it signed out');
  if (c.pad().querySelectorAll('.qpad-g path').length !== 2) bad.push('Ada signed in again and her pad draws ' + c.pad().querySelectorAll('.qpad-g path').length + ' stroke(s), wanted the one she had and the one she drew signed out');
  if (w.circOf_(ringX).on.length !== 1) bad.push('Ada signed in again and the passage rings ' + JSON.stringify(w.circOf_(ringX).on) + ' for her, wanted the word she rang signed out');
  [bare, bareM, bareP, bareR].forEach(k => { if (w.localStorage.getItem(k) !== null) bad.push('after Ada signed in again ' + k + ' is still under the signed-out key: ' + JSON.stringify(w.localStorage.getItem(k)).slice(0, 60)); });
  if (w.localStorage.getItem('familyGoneKeys') !== null) bad.push('marks are left for answers that have gone: ' + w.localStorage.getItem('familyGoneKeys'));
  /* AND THE NEXT SIGNED-OUT VISITOR ON THAT COMPUTER IS SHOWN NOTHING OF HERS. */
  w.signedOut_();
  c.draw();
  if (c.ta().value || c.kp().value) bad.push('Ada signed out and the signed-out boxes show ' + JSON.stringify([c.ta().value, c.kp().value]) + ' to whoever sits down next');
  /* AND A SIGNED-OUT ANSWER WITH NO SESSION ENDED STILL FOLLOWS WHOEVER SIGNS IN, as it always did. */
  w.localStorage.removeItem('familyGone');
  const c2 = ansCards_(w, 'H2');
  ansType_(w, c2.ta(), 'mine, signed out');
  w.signedIn_(Object.assign({}, ANS_BEN));
  c2.draw();
  if (c2.ta().value !== 'mine, signed out') bad.push('with no session ended, a signed-out answer did not follow Ben into his account: ' + JSON.stringify(c2.ta().value));
  return bad;
});

/* ---------- AND THE RECORD OF WHOSE IT IS IS KEPT AS CAREFULLY AS THE ANSWER (review of the merge) § */
const ansEndedBoot_ = (before, server) => {
  const ENDED = new Set();
  const b = boot({ before: before, payload: Object.assign(payload(), { features: ANS_FEATURES }),
    reply: q => (ENDED.has(q.token) ? { error: 'Please sign in again.', why: 'signed-out' } : ansBackend_(server)(q)) });
  /* THE SERVER ENDS THE SESSION: the next request with her token is refused, and the app signs her out. */
  b.end = async tok => {
    ENDED.add(tok);
    await b.w.answersPush_(true);
    if (b.w.__t.whoami()) await b.w.api({ action: 'myProfile' });
    for (let i = 0; i < 40 && b.w.__t.whoami(); i++) await wait(50);
    return !b.w.__t.whoami();
  };
  return b;
};
const ansCarried_ = (sent, n0) => [].concat(...sent.slice(n0).filter(b => b.action === 'saveAnswers').map(b => b.items || []));

check('a browser that keeps nothing: what is typed signed out after the server ended a session is still that person\'s, the record of it held in the visit, and the next child is given none of it', async () => {
  const server = {};
  const deny = win => { try { Object.defineProperty(win, 'localStorage', { configurable: true, get: () => { throw new win.DOMException('The operation is insecure.', 'SecurityError'); } }); } catch (e) {} };
  const b = ansEndedBoot_(deny, server);
  const { w, sent } = b;
  await wait(300);
  const need = ansNeed_(w).concat(['ansMayMove_', 'answersClaim_', 'circOf_', 'keepAtRisk_'].filter(n => typeof w[n] !== 'function'));
  if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
  let threw = false;
  try { w.localStorage.getItem('x'); } catch (e) { threw = true; }
  if (!threw) return ['localStorage did not throw — NOT checked'];
  const bad = [];
  w.signedIn_(Object.assign({}, ANS_ADA, { answers: {} }));
  const c = ansCards_(w, 'T');
  ansType_(w, c.ta(), 'Ada, signed in');
  if (!(await b.end('tok-P7'))) return ['the server refused the session and the app stayed signed in — NOT checked'];
  c.draw();
  ansType_(w, c.kp(), '(5)/(6)');
  w.__t.ACTIONS['qw-tap'](c.host.querySelector('[data-circ] .qw'));
  const bareM = 'ans:' + c.maths.key;
  if (w.ansMayMove_(bareM, 'ans:u:P8:' + c.maths.key) !== '') bad.push('with storage throwing, nothing knows the maths answer is Ada\'s: `ansMayMove_` answers ' + JSON.stringify(w.ansMayMove_(bareM, 'ans:u:P8:' + c.maths.key)) + ' for Ben');
  /* THE RECORD IS NOBODY'S WRITING: held, it is never why the browser asks "Leave site?". */
  const risky = w.keepAtRisk_().filter(k => /^family/.test(k));
  if (risky.length) bad.push('the record of the ended session counts as work only this page holds: ' + JSON.stringify(risky));
  const n0 = sent.length;
  w.signedIn_(Object.assign({}, ANS_BEN, { answers: {} }));
  await wait(1800);
  c.draw();
  const ringX = { key: c.pen.key, surface: 'text' };
  if (c.kp().value) bad.push('Ben signed in and his maths box holds ' + JSON.stringify(c.kp().value) + ' — Ada\'s, typed signed out after the server ended her session');
  if (w.circOf_(ringX).on.length) bad.push('Ben signed in and the passage rings ' + JSON.stringify(w.circOf_(ringX).on) + ' for him — Ada\'s, from the visit\'s rings (`circOf_`)');
  const went = ansCarried_(sent, n0).filter(it => /\(5\)\/\(6\)|0\.0/.test(String(it.v)));
  if (went.length) bad.push('saveAnswers after Ben signed in carried Ada\'s ' + JSON.stringify(went));
  /* ADA BACK, FROM NOBODY: hers, from the visit. */
  w.signedOut_();
  w.signedIn_(Object.assign({}, ANS_ADA, { token: 'tok-P7-b', answers: {} }));
  c.draw();
  if (c.kp().value !== '(5)/(6)') bad.push('Ada signed in again and her maths box holds ' + JSON.stringify(c.kp().value) + ', not what she typed into it signed out');
  if (w.circOf_(ringX).on.length !== 1) bad.push('Ada signed in again and the passage rings ' + JSON.stringify(w.circOf_(ringX).on) + ' for her, wanted the word she rang');
  return bad;
});

check('a full store: the mark on an answer the visit is holding is not tidied away, and an answer whose mark the store refused is not written without it', async () => {
  const bad = [];
  /* ONE — THE STORE HAS ROOM FOR A MARK, NOT FOR THE WORDS (review of the merge, P6). § */
  {
    const server = {};
    const b = ansEndedBoot_(signedInAs_(ANS_ADA), server);
    const { w, sent } = b;
    await wait(300);
    if (typeof w.ansMayMove_ !== 'function') return ['ansMayMove_ not reachable — nothing was checked'];
    const c = ansCards_(w, 'F1');
    ansType_(w, c.ta(), 'Ada signed in');
    if (!(await b.end('tok-P7'))) return ['the server refused the session and the app stayed signed in — NOT checked'];
    c.draw();
    const bareW = 'ans:' + c.words.key, benW = 'ans:u:P8:' + c.words.key;
    const S = w.Storage.prototype, realSet = S.setItem;
    S.setItem = function (k, v) { if (k === bareW) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } return realSet.call(this, k, v); };
    try {
      ansType_(w, c.ta(), 'More words, held');
      if (w.localStorage.getItem(bareW) !== null) bad.push('setup: the store took the words it was meant to refuse — NOT checked');
      ansType_(w, c.kp(), '(5)/(6)');
      if (w.ansMayMove_(bareW, benW) !== '') bad.push('typing in the next box took the mark off the words the visit is holding: `ansMayMove_` answers ' + JSON.stringify(w.ansMayMove_(bareW, benW)) + ' for Ben');
    } finally { S.setItem = realSet; }
    w.dispatchEvent(new w.Event('pagehide'));
    if (w.localStorage.getItem(bareW) !== 'More words, held') bad.push('room came back as the page went and the held words did not land: ' + JSON.stringify(w.localStorage.getItem(bareW)));
    if (w.ansMayMove_(bareW, benW) !== '') bad.push('the held words landed without their mark — anybody\'s now');
    const n0 = sent.length;
    w.signedIn_(Object.assign({}, ANS_BEN, { answers: {} }));
    await wait(1800);
    c.draw();
    if (c.ta().value) bad.push('Ben signed in and his words box holds ' + JSON.stringify(c.ta().value));
    const went = ansCarried_(sent, n0).filter(it => /More words, held/.test(String(it.v)));
    if (went.length) bad.push('saveAnswers after Ben signed in carried Ada\'s words: ' + JSON.stringify(went));
  }
  /* TWO — THE STORE REFUSES THE MARKS THEMSELVES. § */
  {
    const server = {};
    const b = ansEndedBoot_(signedInAs_(ANS_ADA), server);
    const { w, sent } = b;
    await wait(300);
    const c = ansCards_(w, 'F2');
    ansType_(w, c.ta(), 'Ada signed in');
    if (!(await b.end('tok-P7'))) return bad.concat(['the server refused the session and the app stayed signed in — NOT checked']);
    c.draw();
    const bareM = 'ans:' + c.maths.key;
    const S = w.Storage.prototype, realSet = S.setItem;
    S.setItem = function (k, v) { if (k === 'familyGoneKeys') { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } return realSet.call(this, k, v); };
    try {
      ansType_(w, c.kp(), '(5)/(6)');
      if (w.localStorage.getItem(bareM) !== null) bad.push('the store refused the marks and the answer was written without its own: ' + JSON.stringify(w.localStorage.getItem(bareM)));
      c.draw();
      if (c.kp().value !== '(5)/(6)') bad.push('the answer waiting on its mark is not drawn from the visit: ' + JSON.stringify(c.kp().value));
      if (!/^Not saved/.test(c.saidFor(c.maths) || '')) bad.push('under an answer waiting on its mark the line says ' + JSON.stringify(c.saidFor(c.maths)) + ' — it is on no device');
      w.dispatchEvent(new w.Event('pagehide'));
      if (w.localStorage.getItem(bareM) !== null) bad.push('as the page went, the answer was written while its mark was still refused');
    } finally { S.setItem = realSet; }
    w.dispatchEvent(new w.Event('pagehide'));
    if (w.localStorage.getItem(bareM) !== '(5)/(6)') bad.push('room came back and the answer did not land: ' + JSON.stringify(w.localStorage.getItem(bareM)));
    if (!/u:P7/.test(String(w.localStorage.getItem('familyGoneKeys')))) bad.push('room came back and the mark did not land with it: ' + JSON.stringify(w.localStorage.getItem('familyGoneKeys')));
    const n0 = sent.length;
    w.signedIn_(Object.assign({}, ANS_BEN, { answers: {} }));
    await wait(1800);
    c.draw();
    if (c.kp().value) bad.push('Ben signed in and his maths box holds ' + JSON.stringify(c.kp().value));
    if (ansCarried_(sent, n0).some(it => /\(5\)\/\(6\)/.test(String(it.v)))) bad.push('saveAnswers after Ben signed in carried Ada\'s maths answer');
  }
  return bad;
});

/* SIX EDGES OF "WHOSE IS IT" (docs/history/317, "Six edges closed"). § */
const edgeBoot_ = before => {
  const servers = {};
  const ENDED = new Set();
  const of = pid => servers[pid] || (servers[pid] = {});
  const b = boot({ before: before, payload: Object.assign(payload(), { features: ANS_FEATURES }),
    reply: q => (ENDED.has(q.token) ? { error: 'Please sign in again.', why: 'signed-out' } : ansBackend_(of(String(q.personId || '')))(q)) });
  b.of = of;
  /* THE SERVER ENDS THE SESSION: the next request on that token is refused, and the app signs out. */
  b.end = async tok => {
    ENDED.add(tok);
    await b.w.answersPush_(true);
    if (b.w.__t.whoami()) await b.w.api({ action: 'myProfile' });
    for (let i = 0; i < 40 && b.w.__t.whoami(); i++) await wait(50);
    return !b.w.__t.whoami();
  };
  return b;
};
const edgeNeed_ = w => ansNeed_(w).concat(['ansMayMove_', 'answersClaim_', 'circOf_', 'ansGoneOf_', 'ansValue_', 'ansRecPut_']
  .filter(n => typeof w[n] !== 'function'));
const edgeQuota_ = () => { const e = new Error('quota'); e.name = 'QuotaExceededError'; return e; };
const EDGE_ENDED = 'the server refused the session and the app stayed signed in — NOT checked';

check('edges: a pad the store refused is still that person\'s — opening it does not move a drawing made signed out over it (P4)', async () => {
  const { w } = boot({ before: signedInAs_(ANS_ADA) });
  await wait(300);
  const need = edgeNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
  const bad = [];
  const c = ansCards_(w, 'E4');
  const k = 'pad:u:P7:' + c.pen.key, ring = k + ':words';
  const bare = 'pad:' + c.pen.key, bareR = bare + ':words';
  const S = w.Storage.prototype, realSet = S.setItem;
  /* THE STORE REFUSES ADA'S DRAWING AND HER RING, and nothing else: both are held for the visit (`keepPut_`). */
  S.setItem = function (key, v) { if (key === k || key === ring) throw edgeQuota_(); return realSet.call(this, key, v); };
  let mine = null;
  try {
    ansStroke_(w, c, [[10, 10], [80, 80]]);
    w.__t.ACTIONS['qw-tap'](c.host.querySelector('[data-circ] .qw'));
    mine = w.ansValue_(k);
    const mineR = w.ansValue_(ring);
    if (!mine || !mineR || w.localStorage.getItem(k) !== null || w.localStorage.getItem(ring) !== null) {
      return ['setup: Ada\'s stroke and ring are not held by the visit alone (' + JSON.stringify([mine, mineR, w.localStorage.getItem(k)]) + ') — NOT checked'];
    }
    /* ANOTHER TAB OF THE SITE, SIGNED OUT THERE, DRAWS AND RINGS ON THE SAME QUESTION: the shared store
       now holds a signed-out drawing with no ended session behind it — anybody's, by 318's rule. */
    [[bare, '[[200,200,300,300]]'], [bareR, '["0.3"]']].forEach(([key, v]) => {
      realSet.call(w.localStorage, key, v);
      w.dispatchEvent(new w.StorageEvent('storage', { key: key, oldValue: null, newValue: v }));
    });
    /* AND ADA'S CARD IS DRAWN AGAIN. `padWrap_` and `circOf_` open the pad, which is where `padAdopt_`
       moves a signed-out drawing into an EMPTY pad. Hers is not empty: the visit holds it. */
    c.draw();
    if (w.ansValue_(k) !== mine) bad.push('Ada\'s held stroke ' + mine + ' was replaced by the drawing made signed out in the other tab: ' + w.ansValue_(k) + ' — `padAdopt_` read the store, which had refused hers, and called her pad empty');
    const paths = c.pad().querySelectorAll('.qpad-g path').length;
    if (paths !== 1) bad.push('Ada\'s pad draws ' + paths + ' path(s), wanted her one held stroke');
    const rings = w.circOf_({ key: c.pen.key, surface: 'text' }).on;
    if (JSON.stringify(rings) !== mineR) bad.push('Ada\'s held ring ' + mineR + ' became ' + JSON.stringify(rings) + ' when the passage was opened (`circOf_` asks `padAdopt_`)');
    if (w.localStorage.getItem(bare) !== '[[200,200,300,300]]' || w.localStorage.getItem(bareR) !== '["0.3"]') {
      bad.push('the other tab\'s drawing or ring left the signed-out key: ' + JSON.stringify([w.localStorage.getItem(bare), w.localStorage.getItem(bareR)]));
    }
  } finally { S.setItem = realSet; }
  /* ROOM AGAIN, AND THE PAGE GOES: hers lands, as she drew it. */
  w.dispatchEvent(new w.Event('pagehide'));
  if (w.localStorage.getItem(k) !== mine) bad.push('room came back and Ada\'s pad landed as ' + JSON.stringify(w.localStorage.getItem(k)) + ', wanted ' + mine);
  return bad;
});

check('edges: a later visitor who writes over the whole of an answer marked as somebody else\'s takes the mark off; an edit that keeps their words keeps it (P7)', async () => {
  const b = edgeBoot_(signedInAs_(ANS_ADA));
  const { w } = b;
  await wait(300);
  const need = edgeNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
  const bad = [];
  const c = ansCards_(w, 'E7');
  ansType_(w, c.ta(), 'Ada, signed in');
  await w.answersPush_(true);
  if (!(await b.end('tok-P7'))) return [EDGE_ENDED];
  c.draw();
  /* ADA, SIGNED OUT BY THE SERVER, TYPES ON — and draws a short stroke, then a long one: all hers
     (`familyGoneKeys`). */
  ansType_(w, c.ta(), 'More words');
  ansType_(w, c.kp(), '(5)/(6)');
  ansStroke_(w, c, [[10, 10], [12, 12]]);
  ansStroke_(w, c, [[20, 20], [200, 40], [30, 60], [210, 80], [40, 100], [220, 120], [50, 140], [230, 160]]);
  const bareW = 'ans:' + c.words.key, bareM = 'ans:' + c.maths.key, bareP = 'pad:' + c.pen.key;
  const benW = 'ans:u:P8:' + c.words.key, benM = 'ans:u:P8:' + c.maths.key, benP = 'pad:u:P8:' + c.pen.key;
  if (w.ansMayMove_(bareW, benW) !== '' || w.ansMayMove_(bareM, benM) !== '' || w.ansMayMove_(bareP, benP) !== '') return ['setup: what Ada typed and drew signed out is not marked as hers — NOT checked'];
  /* ANOTHER CHILD'S SESSION ENDS ON THIS COMPUTER INSIDE THE HOUR — Cal's — and Cal, signed out, adds a
     line to Ada's words. Mostly hers is still hers: it is not handed to Cal by a mark of his. */
  w.ansRecPut_('familyGone', JSON.stringify({ who: 'u:P9', at: Date.now() }));
  ansType_(w, c.ta(), 'More words, and a line of Cal\'s');
  const mw = w.ansGoneOf_(bareW);
  if (!mw || mw.who !== 'u:P7') bad.push('Cal added a line to Ada\'s words and they are marked ' + JSON.stringify(mw) + ' — Ada\'s words handed to Cal');
  /* THE HOUR PASSES. The next visitor has no session behind them and WRITES OVER THE WHOLE of the maths answer — the box selected and typed over, as a paste does § */
  w.ansRecPut_('familyGone', JSON.stringify({ who: 'u:P7', at: Date.now() - 2 * 60 * 60 * 1000 }));
  c.draw();
  ansType_(w, c.kp(), '(1)/(9)');
  if (w.ansMayMove_(bareM, benM) !== 'later') bad.push('a visitor with no session behind them wrote over the whole of Ada\'s maths answer and it is still marked: `ansMayMove_` answers ' + JSON.stringify(w.ansMayMove_(bareM, benM)) + ' for Ben');
  /* AND ADDS TO HER WORDS: an edit that keeps her text keeps her mark. */
  ansType_(w, c.ta(), 'More words, and a line of Cal\'s. And mine.');
  if (w.ansMayMove_(bareW, benW) !== '') bad.push('a visitor added a sentence to Ada\'s words and they are no longer marked as hers: ' + JSON.stringify(w.ansGoneOf_(bareW)));
  /* AND PRESSES UNDO ON HER DRAWING: § */
  w.__t.ACTIONS['pad-undo'](padTile_(c.pad(), '.qpad-undo'));
  const leftP = w.ansValue_(bareP);
  if (!leftP || JSON.parse(leftP).length !== 1) return bad.concat(['setup: Undo left ' + JSON.stringify(leftP) + ' on the signed-out pad, wanted Ada\'s short stroke — the rest was NOT checked']);
  if (w.ansMayMove_(bareP, benP) !== '') bad.push('a visitor pressed Undo on Ada\'s drawing, all that is left is her own first stroke, and it is no longer marked as hers: ' + JSON.stringify(w.ansGoneOf_(bareP)));
  /* BEN SIGNS IN FROM NOBODY — the visitor's seat: the maths answer is his; Ada's words and stroke are not. */
  w.signedIn_(Object.assign({}, ANS_BEN, { answers: {} }));
  c.draw();
  await w.answersPush_(true);
  if (c.kp().value !== '(1)/(9)') bad.push('Ben signed in from nobody and his maths box holds ' + JSON.stringify(c.kp().value) + ', not the answer written over Ada\'s in his seat');
  if (c.ta().value) bad.push('Ben signed in and his words box holds ' + JSON.stringify(c.ta().value) + ' — Ada\'s');
  if (c.pad().querySelectorAll('.qpad-g path').length) bad.push('Ben signed in and his pad draws ' + c.pad().querySelectorAll('.qpad-g path').length + ' stroke(s) — Ada\'s');
  if (/More words/.test(JSON.stringify(b.of('P8')))) bad.push('Ada\'s words reached Ben\'s account');
  if (b.of('P8')['pad:' + c.pen.key]) bad.push('Ada\'s stroke reached Ben\'s account');
  /* ADA, FROM NOBODY: her words with the lines after them, and nothing of the visitor's maths answer. */
  w.signedOut_();
  w.signedIn_(Object.assign({}, ANS_ADA, { token: 'tok-P7-b', answers: JSON.parse(JSON.stringify(b.of('P7'))) }));
  c.draw();
  await w.answersPush_(true);
  const JOINED = 'Ada, signed in\n\nMore words, and a line of Cal\'s. And mine.';
  if (c.ta().value !== JOINED) bad.push('Ada signed in again and her words box holds ' + JSON.stringify(c.ta().value) + ', wanted ' + JSON.stringify(JOINED));
  if (c.kp().value) bad.push('Ada signed in again and her maths box holds ' + JSON.stringify(c.kp().value) + ' — the visitor\'s answer, written over hers after the hour, filed under Ada');
  if (/\(1\)\/\(9\)/.test(JSON.stringify(b.of('P7')))) bad.push('the visitor\'s maths answer reached ADA\'s account: ' + JSON.stringify(b.of('P7')['ans:' + c.maths.key]));
  if (c.pad().querySelectorAll('.qpad-g path').length !== 1) bad.push('Ada signed in again and her pad draws ' + c.pad().querySelectorAll('.qpad-g path').length + ' stroke(s), wanted her short one');
  if (!b.of('P7')['pad:' + c.pen.key]) bad.push('Ada\'s stroke, drawn signed out after her session ended, never reached her account');
  return bad;
});

check('edges: the booking form filled in signed out after the server ended a session is that person\'s — not carried into the next child\'s, and theirs when they sign in again, from nobody or over somebody (P8)', async () => {
  const bad = [];
  for (const over of [false, true]) {
    const ended = new Set(['tok-P7']);
    const { w } = boot({ before: signedInAs_(ANS_ADA), reply: q => (ended.has(q.token) ? { error: 'Please sign in again.', why: 'signed-out' } : undefined) });
    await wait(300);
    const fns = ['bookFollow_', 'signedOut_', 'signedIn_', 'noteRow_', 'draftRead_', 'ansMayMove_', 'ansGoneOf_'].filter(n => typeof w[n] !== 'function');
    if (fns.length) return [fns.join(', ') + ' not reachable — nothing was checked'];
    for (let i = 0; i < 40 && w.__t.whoami(); i++) await wait(50);
    if (w.__t.whoami()) { await w.api({ action: 'myProfile' }); for (let i = 0; i < 40 && w.__t.whoami(); i++) await wait(50); }
    if (w.__t.whoami()) return bad.concat([EDGE_ENDED]);
    const B = w.__t.BOOKING;
    const how = over ? 'over Ben' : 'from nobody';
    /* THROUGH THE REAL LISTENER, as she types the note — her address, on the family computer. */
    const h = w.document.createElement('div');
    w.document.body.appendChild(h);
    h.innerHTML = w.noteRow_().sel;
    const el = h.querySelector('[data-do="book-note"]');
    const ADDR = 'Ada, signed out: our address is 1 Example Road';
    el.value = ADDR;
    el.dispatchEvent(new w.Event('input', { bubbles: true }));
    if (!/Example Road/.test(String(w.localStorage.getItem('draft:device:book:form') || ''))) return bad.concat(['setup: the note is not the device\'s booking draft — NOT checked']);
    /* BEN SIGNS IN NEXT, FROM NOBODY. */
    w.signedIn_(Object.assign({}, ANS_BEN));
    if (/Example Road/.test(String(B.note || ''))) bad.push('Ben signed in and his booking form holds Ada\'s address, typed signed out after her session ended');
    if (/Example Road/.test(String(w.draftRead_('book', 'form') || ''))) bad.push('Ben signed in and Ada\'s address is his booking draft');
    if (!/Example Road/.test(String(w.localStorage.getItem('draft:device:book:form') || ''))) bad.push('Ben signed in and the device lost the form Ada filled in, which is hers to sign in to');
    /* ADA COMES BACK: after Ben signs out, or straight over him. */
    if (!over) w.signedOut_();
    w.signedIn_(Object.assign({}, ANS_ADA, { token: 'tok-P7-b' }));
    if (B.note !== ADDR) bad.push('Ada signed in again ' + how + ' and her booking form holds ' + JSON.stringify(B.note) + ', not the address she typed signed out');
    if (!/Example Road/.test(String(w.draftRead_('book', 'form') || ''))) bad.push('Ada signed in again ' + how + ' and the form she filled in signed out is not her draft');
    if (w.localStorage.getItem('draft:device:book:form') !== null) bad.push('Ada signed in again ' + how + ' and her form is still the device\'s draft, for the next visitor');
    if (w.ansGoneOf_('draft:device:book:form')) bad.push('Ada signed in again ' + how + ' and a mark is left for the device\'s form she took');
  }
  return bad;
});

check('edges: back on a device signed in as somebody else, what the owner typed, drew and rang after the server ended their session is all theirs again, joined to their answers (G1)', async () => {
  const b = edgeBoot_(signedInAs_(ANS_ADA));
  const { w } = b;
  await wait(300);
  const need = edgeNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
  const bad = [];
  const c = ansCards_(w, 'E1');
  const ESSAY = 'Ada\'s essay, written signed in. '.repeat(12).trim();
  ansType_(w, c.ta(), ESSAY);
  ansStroke_(w, c, [[20, 300], [120, 300]]);
  w.__t.ACTIONS['qp-choose'](c.box().querySelector('[data-n="2"]'));
  await w.answersPush_(true);
  if (!b.of('P7')['ans:' + c.words.key]) return ['setup: the essay is not on Ada\'s account — NOT checked'];
  if (!(await b.end('tok-P7'))) return [EDGE_ENDED];
  c.draw();
  /* SIGNED OUT BY THE SERVER: every kind of answer, typed, drawn and rung beside what she had. */
  ansType_(w, c.ta(), 'More words');
  ansType_(w, c.kp(), '(5)/(6)');
  ansStroke_(w, c, [[30, 30], [200, 200]]);
  w.__t.ACTIONS['qw-tap'](c.host.querySelector('[data-circ] .qw'));
  const bare = ['ans:' + c.words.key, 'ans:' + c.maths.key, 'pad:' + c.pen.key, 'pad:' + c.pen.key + ':words'];
  if (bare.some(k => w.localStorage.getItem(k) === null)) return ['setup: not everything made signed out is under the signed-out key — NOT checked'];
  /* BEN SIGNS IN NEXT, FROM NOBODY — none of it is his — and is still signed in when Ada comes back. */
  w.signedIn_(Object.assign({}, ANS_BEN, { answers: {} }));
  /* MEANWHILE ANOTHER TAB, SIGNED OUT THERE, PICKS ON THE SAME QUESTION — nobody's session behind it. */
  const bareC = 'ans:' + c.pick.key;
  w.localStorage.setItem(bareC, '3');
  w.localStorage.setItem('ansAt:' + bareC, String(Date.now()));
  w.dispatchEvent(new w.StorageEvent('storage', { key: bareC, oldValue: null, newValue: '3' }));
  /* ADA SIGNS IN OVER BEN. A switch is not a seat (318): nothing anybody else made signed out is hers.
     What SHE made is, all of it, as it is from nobody: joined to her answers, none left behind. */
  w.signedIn_(Object.assign({}, ANS_ADA, { token: 'tok-P7-b', answers: JSON.parse(JSON.stringify(b.of('P7'))) }));
  c.draw();
  await w.answersPush_(true);
  const JOINED = ESSAY + '\n\nMore words';
  if (c.ta().value !== JOINED) bad.push('Ada signed in over Ben and her words box holds ' + c.ta().value.length + ' characters ending ' + JSON.stringify(c.ta().value.slice(-20)) + ', wanted her essay with "More words" after it');
  if (c.kp().value !== '(5)/(6)') bad.push('Ada signed in over Ben and her maths box holds ' + JSON.stringify(c.kp().value));
  if (c.pad().querySelectorAll('.qpad-g path').length !== 2) bad.push('Ada signed in over Ben and her pad draws ' + c.pad().querySelectorAll('.qpad-g path').length + ' stroke(s), wanted the one she had and the one she drew signed out');
  if (w.circOf_({ key: c.pen.key, surface: 'text' }).on.length !== 1) bad.push('Ada signed in over Ben and the passage rings ' + JSON.stringify(w.circOf_({ key: c.pen.key, surface: 'text' }).on));
  bare.forEach(k => { if (w.ansValue_(k) !== null) bad.push('Ada signed in over Ben and ' + k + ' is still under the signed-out key: ' + JSON.stringify(w.ansValue_(k)).slice(0, 60)); });
  if (w.localStorage.getItem('familyGoneKeys') !== null) bad.push('marks are left for answers that have gone: ' + w.localStorage.getItem('familyGoneKeys'));
  const up = b.of('P7')['ans:' + c.words.key];
  if (!up || up.v !== JOINED) bad.push('her essay with her words after it is not on her account: ' + JSON.stringify(up && String(up.v).slice(-24)));
  if (Object.keys(b.of('P8')).length) bad.push('Ben\'s account holds ' + JSON.stringify(b.of('P8')).slice(0, 160));
  /* AND NOTHING SOMEBODY ELSE MADE SIGNED OUT: a switch is not the same seat (318). */
  if (w.localStorage.getItem('ans:u:P7:' + c.pick.key) !== '2') bad.push('Ada signed in over Ben and her pick is ' + JSON.stringify(w.localStorage.getItem('ans:u:P7:' + c.pick.key)) + ' — the other tab\'s, claimed over hers on a switch');
  if (w.localStorage.getItem(bareC) !== '3') bad.push('the other tab\'s signed-out pick was taken off the device when Ada signed in over Ben: ' + JSON.stringify(w.localStorage.getItem(bareC)));
  /* AND THE NEXT SIGNED-OUT VISITOR SEES NOTHING OF HERS. */
  w.signedOut_();
  c.draw();
  if (c.ta().value || c.kp().value) bad.push('Ada signed out and the signed-out boxes show ' + JSON.stringify([c.ta().value, c.kp().value]) + ' to whoever sits down next');
  return bad;
});

check('edges: what the store refused while signed out is claimed at sign-in like anything stored — the visit\'s copy moves, and is not left for the next visitor (G2)', async () => {
  const bad = [];
  /* ONE — NO SESSION ENDED. The store refuses the signed-out words, so the visit holds them; Ben signs in
     from nobody (318's seat) and they are his. */
  {
    const b = edgeBoot_();
    const { w } = b;
    await wait(300);
    const need = edgeNeed_(w);
    if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
    const c = ansCards_(w, 'E2A');
    const bareW = 'ans:' + c.words.key, benW = 'ans:u:P8:' + c.words.key;
    const S = w.Storage.prototype, realSet = S.setItem;
    S.setItem = function (k, v) { if (k === bareW) throw edgeQuota_(); return realSet.call(this, k, v); };
    try {
      ansType_(w, c.ta(), 'Mine, typed signed out');
      if (w.ansValue_(bareW) !== 'Mine, typed signed out' || w.localStorage.getItem(bareW) !== null) return ['setup: the signed-out words are not held by the visit alone — NOT checked'];
      w.signedIn_(Object.assign({}, ANS_BEN, { answers: {} }));
      /* CLAIMED AT SIGN-IN, BEFORE ANY CARD IS DRAWN: that is the claim's job. Drawing the card would have
         `ansRead_` move it into Ben's empty box anyway, and hide a claim that never saw the visit's copy. */
      if (w.ansValue_(benW) !== 'Mine, typed signed out' || w.ansValue_(bareW) !== null) bad.push('Ben signed in from nobody and, before any card was drawn, his key holds ' + JSON.stringify(w.ansValue_(benW)) + ' and the signed-out key ' + JSON.stringify(w.ansValue_(bareW)) + ' — the claim never saw the words the visit was holding');
      c.draw();
      if (c.ta().value !== 'Mine, typed signed out') bad.push('Ben signed in from nobody and his box holds ' + JSON.stringify(c.ta().value) + ' — what was typed in his seat, held because the store refused it, was not claimed');
      if (!w.ansDirtySet_('u:P8').has(benW)) bad.push('what was typed in Ben\'s seat is not due to go up to his account');
      if (w.ansValue_(bareW) !== null) bad.push('the visit still holds ' + JSON.stringify(w.ansValue_(bareW)) + ' under the signed-out key after Ben claimed it');
      w.signedOut_();
      c.draw();
      if (c.ta().value) bad.push('Ben signed out and the signed-out box shows ' + JSON.stringify(c.ta().value) + ' to whoever sits down next');
    } finally { S.setItem = realSet; }
    /* ROOM AGAIN AS THE PAGE GOES: what was claimed is not written back under the signed-out key. */
    w.dispatchEvent(new w.Event('pagehide'));
    if (w.localStorage.getItem(bareW) !== null) bad.push('room came back and the claimed words were written back under the signed-out key: ' + JSON.stringify(w.localStorage.getItem(bareW)));
  }
  /* TWO — THE SERVER ENDED ADA'S SESSION. The store refuses what she types signed out; she signs in again
     and it is joined to her answer, from the visit. */
  {
    const b = edgeBoot_(signedInAs_(ANS_ADA));
    const { w } = b;
    await wait(300);
    const c = ansCards_(w, 'E2B');
    ansType_(w, c.ta(), 'Ada, signed in');
    await w.answersPush_(true);
    if (!(await b.end('tok-P7'))) return bad.concat([EDGE_ENDED]);
    c.draw();
    const bareW = 'ans:' + c.words.key;
    const S = w.Storage.prototype, realSet = S.setItem;
    S.setItem = function (k, v) { if (k === bareW) throw edgeQuota_(); return realSet.call(this, k, v); };
    try {
      ansType_(w, c.ta(), 'More words, held');
      if (w.ansValue_(bareW) !== 'More words, held' || w.localStorage.getItem(bareW) !== null) return bad.concat(['setup: Ada\'s signed-out words are not held by the visit alone — NOT checked']);
      if (w.ansMayMove_(bareW, 'ans:u:P8:' + c.words.key) !== '') bad.push('setup: the held words are not marked as Ada\'s');
      w.signedIn_(Object.assign({}, ANS_ADA, { token: 'tok-P7-b', answers: JSON.parse(JSON.stringify(b.of('P7'))) }));
      c.draw();
      if (c.ta().value !== 'Ada, signed in\n\nMore words, held') bad.push('Ada signed in again and her box holds ' + JSON.stringify(c.ta().value) + ' — the words the visit held for her were not joined to her answer');
      if (w.ansValue_(bareW) !== null) bad.push('Ada signed in again and the visit still holds ' + JSON.stringify(w.ansValue_(bareW)) + ' under the signed-out key');
    } finally { S.setItem = realSet; }
    w.dispatchEvent(new w.Event('pagehide'));
    if (w.localStorage.getItem(bareW) !== null) bad.push('room came back and Ada\'s claimed words were written back under the signed-out key');
  }
  return bad;
});

/* ---------- AND THREE MORE, FOUND BY THE VERIFIER OF THE SIX (317, "Undo, the booking form, a switch") § */
const edgeKey_ = (w, el, key, o) => el.dispatchEvent(new w.KeyboardEvent('keydown', Object.assign({ key: key, bubbles: true, cancelable: true }, o || {})));

check('edges: Undo puts back whose it was — Clear then Undo on a pad, Ctrl+Z after Backspace or after one letter over all of it — and the keypad\'s history goes with the person who made it', async () => {
  const bad = [];
  const mine = (w, k) => { const m = w.ansGoneOf_(k); return m ? m.who : null; };
  /* ONE — A QUESTION'S PAD (U1). § */
  {
    const b = edgeBoot_(signedInAs_(ANS_ADA));
    const { w } = b;
    await wait(300);
    const need = edgeNeed_(w);
    if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
    const A = w.__t.ACTIONS;
    const c = ansCards_(w, 'U1');
    if (!(await b.end('tok-P7'))) return [EDGE_ENDED];
    c.draw();
    ansStroke_(w, c, [[10, 10], [80, 80], [150, 40]]);
    const bareP = 'pad:' + c.pen.key, benP = 'pad:u:P8:' + c.pen.key;
    const ada = w.ansValue_(bareP);
    if (!ada || w.ansMayMove_(bareP, benP) !== '') return ['setup: Ada\'s stroke, drawn signed out after her session ended, is not marked as hers — NOT checked'];
    w.signedIn_(Object.assign({}, ANS_BEN, { answers: {} }));
    w.signedOut_();
    c.draw();
    A['pad-clear'](padTile_(c.pad(), '.qpad-clear'));
    if (w.ansValue_(bareP) !== null) return ['setup: Clear left ' + JSON.stringify(w.ansValue_(bareP)) + ' — NOT checked'];
    A['pad-undo'](padTile_(c.pad(), '.qpad-undo'));
    if (w.ansValue_(bareP) !== ada) return ['setup: Undo after Clear put back ' + JSON.stringify(w.ansValue_(bareP)) + ', not ' + ada + ' — NOT checked'];
    if (mine(w, bareP) !== 'u:P7') bad.push('Clear then Undo put Ada\'s own stroke back marked ' + JSON.stringify(w.ansGoneOf_(bareP)) + ' — `ansMayMove_` for Ben answers ' + JSON.stringify(w.ansMayMove_(bareP, benP)));
    w.ansRecPut_('familyGone', JSON.stringify({ who: 'u:P9', at: Date.now() }));
    A['pad-clear'](padTile_(c.pad(), '.qpad-clear'));
    A['pad-undo'](padTile_(c.pad(), '.qpad-undo'));
    if (mine(w, bareP) !== 'u:P7') bad.push('Clear then Undo while Cal\'s ended session was fresh put Ada\'s stroke back marked ' + JSON.stringify(w.ansGoneOf_(bareP)) + ' — handed to Cal');
    w.ansRecPut_('familyGone', null);
    /* BEN SIGNS IN FROM NOBODY: nothing of hers. */
    w.signedIn_(Object.assign({}, ANS_BEN, { token: 'tok-P8-b', answers: {} }));
    c.draw();
    await w.answersPush_(true);
    if (w.ansValue_(benP) !== null || c.pad().querySelectorAll('.qpad-g path').length) bad.push('Ben signed in from nobody and Ada\'s stroke is on his pad: ' + JSON.stringify(w.ansValue_(benP)));
    if (b.of('P8')['pad:' + c.pen.key]) bad.push('Ada\'s stroke reached BEN\'S ACCOUNT: ' + JSON.stringify(b.of('P8')['pad:' + c.pen.key]).slice(0, 80));
    if (w.ansValue_(bareP) !== ada) bad.push('Ada\'s stroke left the signed-out key when Ben signed in: ' + JSON.stringify(w.ansValue_(bareP)));
  }
  /* TWO — WORDS, THROUGH A LAPTOP'S KEYS (U2). Ada types signed out after her session ended; Ben signs in and
     out. A visitor selects the whole answer (⇧Ctrl+Home from the end, as Ctrl+A does), presses Backspace,
     then Ctrl+Z. */
  {
    const b = edgeBoot_(signedInAs_(ANS_ADA));
    const { w } = b;
    await wait(300);
    const c = ansCards_(w, 'U2');
    ansType_(w, c.ta(), 'Ada, signed in');
    await w.answersPush_(true);
    if (!(await b.end('tok-P7'))) return bad.concat([EDGE_ENDED]);
    c.draw();
    const WORDS = 'More words Ada typed signed out';
    const bareW = 'ans:' + c.words.key, benW = 'ans:u:P8:' + c.words.key;
    ansType_(w, c.ta(), WORDS);
    if (w.ansMayMove_(bareW, benW) !== '') return bad.concat(['setup: Ada\'s signed-out words are not marked as hers — the words were NOT checked']);
    w.signedIn_(Object.assign({}, ANS_BEN, { answers: {} }));
    w.signedOut_();
    c.draw();
    const inp = c.ta();
    inp.setSelectionRange(inp.value.length, inp.value.length);
    edgeKey_(w, inp, 'Home', { shiftKey: true, ctrlKey: true });
    edgeKey_(w, inp, 'Backspace');
    if (String(w.ansValue_(bareW) || '') !== '') return bad.concat(['setup: the whole answer selected and Backspace left ' + JSON.stringify(w.ansValue_(bareW)) + ' — NOT checked']);
    edgeKey_(w, inp, 'z', { ctrlKey: true });
    if (w.ansValue_(bareW) !== WORDS) return bad.concat(['setup: Ctrl+Z put back ' + JSON.stringify(w.ansValue_(bareW)) + ' — NOT checked']);
    if (mine(w, bareW) !== 'u:P7') bad.push('Ctrl+Z after Backspace over all of it put Ada\'s own words back marked ' + JSON.stringify(w.ansGoneOf_(bareW)) + ' — `ansMayMove_` for Ben answers ' + JSON.stringify(w.ansMayMove_(bareW, benW)));
    w.signedIn_(Object.assign({}, ANS_BEN, { token: 'tok-P8-b', answers: {} }));
    c.draw();
    await w.answersPush_(true);
    if (c.ta().value === WORDS) bad.push('Ben signed in from nobody and his words box holds Ada\'s words');
    if (/More words Ada typed/.test(JSON.stringify(b.of('P8')))) bad.push('Ada\'s words reached BEN\'S ACCOUNT');
  }
  /* THREE — THE HOUR HAS PASSED (U2b, U3): § */
  {
    const b = edgeBoot_(signedInAs_(ANS_ADA));
    const { w } = b;
    await wait(300);
    const c = ansCards_(w, 'U3');
    if (!(await b.end('tok-P7'))) return bad.concat([EDGE_ENDED]);
    c.draw();
    const WORDS = 'Ada typed this signed out';
    const bareW = 'ans:' + c.words.key, benW = 'ans:u:P8:' + c.words.key;
    ansType_(w, c.ta(), WORDS);
    if (w.ansMayMove_(bareW, benW) !== '') return bad.concat(['setup: Ada\'s signed-out words are not marked as hers — the hour was NOT checked']);
    w.ansRecPut_('familyGone', JSON.stringify({ who: 'u:P7', at: Date.now() - 2 * 60 * 60 * 1000 }));
    c.draw();
    const inp = c.ta();
    inp.setSelectionRange(inp.value.length, inp.value.length);
    for (let i = 0; i < WORDS.length; i++) edgeKey_(w, inp, 'Backspace');
    if (String(w.ansValue_(bareW) || '') !== '') return bad.concat(['setup: a held Backspace left ' + JSON.stringify(w.ansValue_(bareW)) + ' — NOT checked']);
    edgeKey_(w, inp, 'z', { ctrlKey: true });
    if (w.ansValue_(bareW) !== WORDS) return bad.concat(['setup: Ctrl+Z after the held Backspace put back ' + JSON.stringify(w.ansValue_(bareW)) + ' — NOT checked']);
    if (mine(w, bareW) !== 'u:P7') bad.push('after the hour, Ctrl+Z after a held Backspace put Ada\'s words back marked ' + JSON.stringify(w.ansGoneOf_(bareW)));
    inp.setSelectionRange(inp.value.length, inp.value.length);
    edgeKey_(w, inp, 'Home', { shiftKey: true, ctrlKey: true });
    edgeKey_(w, inp, 'x');
    if (w.ansValue_(bareW) !== 'x') return bad.concat(['setup: one letter over the whole answer left ' + JSON.stringify(w.ansValue_(bareW)) + ' — NOT checked']);
    if (w.ansMayMove_(bareW, benW) !== 'later') bad.push('after the hour, one letter typed over all of Ada\'s words is still marked ' + JSON.stringify(w.ansGoneOf_(bareW)) + ' (P7)');
    edgeKey_(w, inp, 'z', { ctrlKey: true });
    if (w.ansValue_(bareW) !== WORDS) return bad.concat(['setup: Ctrl+Z after the letter put back ' + JSON.stringify(w.ansValue_(bareW)) + ' — NOT checked']);
    if (mine(w, bareW) !== 'u:P7') bad.push('a visitor\'s letter over Ada\'s words, undone at once, left her words marked ' + JSON.stringify(w.ansGoneOf_(bareW)) + ' — anybody\'s');
    edgeKey_(w, inp, 'z', { ctrlKey: true, shiftKey: true });
    if (w.ansValue_(bareW) !== 'x') return bad.concat(['setup: ⇧Ctrl+Z put back ' + JSON.stringify(w.ansValue_(bareW)) + ', not the letter — NOT checked']);
    if (w.ansMayMove_(bareW, benW) !== 'later') bad.push('⇧Ctrl+Z put the visitor\'s letter back marked ' + JSON.stringify(w.ansGoneOf_(bareW)) + ' — the visitor\'s answer filed as Ada\'s');
    edgeKey_(w, inp, 'z', { ctrlKey: true });
    w.signedIn_(Object.assign({}, ANS_BEN, { answers: {} }));
    await w.answersPush_(true);
    if (/Ada typed this/.test(JSON.stringify(b.of('P8')))) bad.push('Ada\'s words reached BEN\'S ACCOUNT after the hour');
  }
  /* FOUR — THE KEYPAD'S HISTORY OUTLIVED ITS PERSON. Sam types signed out and signs in from nobody: the words
     are his (318). He signs out, and the next visitor presses Ctrl+Z on the empty signed-out box. */
  {
    const b = edgeBoot_();
    const { w } = b;
    await wait(300);
    const c = ansCards_(w, 'U5');
    const SAM = { name: 'Sam Pupil', personId: 'P10', role: 'kid', roles: ['kid'], token: 'tok-P10', handle: 'sam_sunny10' };
    const bareW = 'ans:' + c.words.key;
    const inp = c.ta();
    inp.setSelectionRange(0, 0);
    'Sam typed these words'.split('').forEach(ch => edgeKey_(w, inp, ch));
    if (w.ansValue_(bareW) !== 'Sam typed these words') return bad.concat(['setup: the keys typed signed out stored ' + JSON.stringify(w.ansValue_(bareW)) + ' — the history was NOT checked']);
    w.signedIn_(Object.assign({}, SAM, { answers: {} }));
    if (w.ansValue_(bareW) !== null) return bad.concat(['setup: Sam signed in from nobody and his words were not claimed — the history was NOT checked']);
    w.signedOut_();
    c.draw();
    edgeKey_(w, c.ta(), 'z', { ctrlKey: true });
    if (c.ta().value || w.ansValue_(bareW)) bad.push('Sam signed in and out, and the next visitor\'s Ctrl+Z on the empty signed-out box brought back ' + JSON.stringify(w.ansValue_(bareW)) + ' — his words, nobody\'s now');
    w.signedIn_(Object.assign({}, ANS_BEN, { answers: {} }));
    await w.answersPush_(true);
    if (/Sam typed/.test(JSON.stringify(b.of('P8')))) bad.push('Sam\'s words reached BEN\'S ACCOUNT through the keypad\'s history');
  }
  return bad;
});

check('edges: signing in again, the booking form typed signed out after the session ended is joined to the person\'s own draft, not written over it — and the addresses typed on it go with it, from nobody and over somebody', async () => {
  const bad = [];
  for (const over of [false, true]) {
    const ended = new Set();
    const { w } = boot({ before: signedInAs_(ANS_ADA), reply: q => (ended.has(q.token) ? { error: 'Please sign in again.', why: 'signed-out' } : undefined) });
    await wait(300);
    const fns = ['bookFollow_', 'signedOut_', 'signedIn_', 'noteRow_', 'stepInput_', 'draftRead_', 'ansMayMove_', 'ansGoneOf_'].filter(n => typeof w[n] !== 'function');
    if (fns.length) return [fns.join(', ') + ' not reachable — nothing was checked'];
    const B = w.__t.BOOKING;
    const split = (w.__t.STEPS || []).find(s => s.emails);
    if (!split) return ['no booking step takes addresses — renamed? NOT checked'];
    const how = over ? 'over Ben' : 'from nobody';
    const h = w.document.createElement('div');
    w.document.body.appendChild(h);
    /* THROUGH THE REAL LISTENERS: the note's `input` writes the whole form (`bookKeep_`); the addresses box
       is a draft of its own until it is left (`draftFrom_`). */
    const typeNote = text => {
      h.innerHTML = w.noteRow_().sel;
      const el = h.querySelector('[data-do="book-note"]');
      el.value = text;
      el.dispatchEvent(new w.Event('input', { bubbles: true }));
    };
    /* SIGNED IN: Ada part-way through a booking — who it is for, a subject, a level and a note. */
    B.client = 'Ada';
    B.subjects = ['Maths'];
    B.level = 'GCSE';
    typeNote('Tuesdays after school');
    if (!/Tuesdays/.test(String(w.localStorage.getItem('draft:u:P7:book:form')))) return bad.concat(['setup: Ada\'s signed-in booking is not her draft — NOT checked']);
    ended.add('tok-P7');
    await w.api({ action: 'myProfile' });
    for (let i = 0; i < 40 && w.__t.whoami(); i++) await wait(50);
    if (w.__t.whoami()) return bad.concat([EDGE_ENDED]);
    if (B.note || B.client) bad.push('the server ended Ada\'s session and her booking is still on the screen: ' + JSON.stringify([B.note, B.client]));
    /* SIGNED OUT, ON THE FORM THE ENDED SESSION EMPTIED: another subject, another level, her address, and
       somebody to share with, typed into the addresses box and not yet left. */
    B.subjects = ['English'];
    B.level = 'A level';
    typeNote('Ada signed out: 1 Example Road');
    h.innerHTML = w.stepInput_(split);
    const box = h.querySelector('[data-do="book-emails"]');
    box.value = 'kit@example.com';
    box.dispatchEvent(new w.Event('input', { bubbles: true }));
    if (!/Example Road/.test(String(w.localStorage.getItem('draft:device:book:form'))) || !/kit@example/.test(String(w.localStorage.getItem('draft:device:book:emails:' + split.id)))) {
      return bad.concat(['setup: the signed-out form and its addresses are not the device\'s drafts — NOT checked']);
    }
    if (over) w.signedIn_(Object.assign({}, ANS_BEN));
    w.signedIn_(Object.assign({}, ANS_ADA, { token: 'tok-P7-b' }));
    const NOTE = 'Tuesdays after school\n\nAda signed out: 1 Example Road';
    if (B.note !== NOTE) bad.push('Ada signed in again ' + how + ' and the note is ' + JSON.stringify(B.note) + ', wanted hers, then what she typed signed out');
    if (B.client !== 'Ada') bad.push('Ada signed in again ' + how + ' and "who is this for", answered signed in, is ' + JSON.stringify(B.client) + ' — her draft was written over');
    if (JSON.stringify(B.subjects) !== '["Maths","English"]') bad.push('Ada signed in again ' + how + ' and the subjects are ' + JSON.stringify(B.subjects) + ', wanted both forms\'');
    if (B.level !== 'A level') bad.push('Ada signed in again ' + how + ' and the level is ' + JSON.stringify(B.level) + ', wanted the one chosen later, signed out');
    const draft = String(w.draftRead_('book', 'form') || '');
    if (!/Tuesdays/.test(draft) || !/Example Road/.test(draft) || !/"client":"Ada"/.test(draft)) bad.push('Ada signed in again ' + how + ' and her draft is not the two forms joined: ' + draft.slice(0, 160));
    if (w.localStorage.getItem('draft:device:book:form') !== null) bad.push('Ada signed in again ' + how + ' and the device still holds her signed-out form');
    if (w.draftRead_('book', 'emails:' + split.id) !== 'kit@example.com') bad.push('Ada signed in again ' + how + ' and the addresses she typed signed out are ' + JSON.stringify(w.draftRead_('book', 'emails:' + split.id)) + ' in her box — dropped, not carried');
    if (w.localStorage.getItem('draft:device:book:emails:' + split.id) !== null) bad.push('Ada signed in again ' + how + ' and the device still holds the addresses she typed signed out');
  }
  /* AND THE ADDRESSES ARE ASKED ON THEIR OWN. § */
  {
    const { w } = boot({
      before: win => {
        signedInAs_(ANS_ADA)(win);
        try { win.localStorage.setItem('draft:device:book:form', JSON.stringify({ v: JSON.stringify({ note: 'A visitor\'s note' }), at: Date.now() })); } catch (e) {}
      },
      reply: q => (q.token === 'tok-P7' && q.action === 'myProfile' ? { error: 'Please sign in again.', why: 'signed-out' } : undefined)
    });
    await wait(300);
    const split = (w.__t.STEPS || []).find(s => s.emails);
    if (w.__t.whoami()) await w.api({ action: 'myProfile', token: 'tok-P7' });
    for (let i = 0; i < 40 && w.__t.whoami(); i++) await wait(50);
    if (w.__t.whoami()) return bad.concat([EDGE_ENDED]);
    if (w.__t.BOOKING.note !== 'A visitor\'s note') return bad.concat(['setup: the visitor\'s form is not on the screen after the session ended (' + JSON.stringify(w.__t.BOOKING.note) + ') — the addresses were NOT checked']);
    const h = w.document.createElement('div');
    w.document.body.appendChild(h);
    h.innerHTML = w.stepInput_(split);
    const box = h.querySelector('[data-do="book-emails"]');
    box.value = 'ada@example.com';
    box.dispatchEvent(new w.Event('input', { bubbles: true }));
    w.signedIn_(Object.assign({}, ANS_BEN));
    if (w.__t.BOOKING.note !== 'A visitor\'s note') bad.push('Ben signed in from nobody and the visitor\'s form was not carried to his seat: ' + JSON.stringify(w.__t.BOOKING.note));
    if (/ada@example/.test(String(w.draftRead_('book', 'emails:' + split.id) || ''))) bad.push('Ben signed in from nobody and the address Ada typed after her session ended is in HIS addresses box');
    if (!/ada@example/.test(String(w.localStorage.getItem('draft:device:book:emails:' + split.id) || ''))) bad.push('the address Ada typed after her session ended left the device when Ben signed in — it is hers to sign in to');
  }
  return bad;
});

check('edges: signed in over somebody else, opening a card hands the arriving child nothing another visitor made signed out — after a reload too; signed in from nobody, it is theirs (318)', async () => {
  const b = edgeBoot_(signedInAs_(ANS_BEN));
  const { w } = b;
  await wait(300);
  const need = edgeNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
  const bad = [];
  const c = ansCards_(w, 'S1');
  const bareM = 'ans:' + c.maths.key, bareP = 'pad:' + c.pen.key, bareR = bareP + ':words';
  const OTHER = [[bareM, '(9)/(10)'], [bareP, '[[1,1,300,300]]'], [bareR, '["0.1"]']];
  /* BEN IS SIGNED IN. ANOTHER TAB OF THE SITE, SIGNED OUT THERE AND NEVER RELOADED, ANSWERS, DRAWS, AND RINGS:
     nobody's session ended, so all of it is 'later' — whoever signs in next from
     nobody (318). */
  OTHER.forEach(([k, v]) => {
    w.localStorage.setItem(k, v);
    w.dispatchEvent(new w.StorageEvent('storage', { key: k, oldValue: null, newValue: v }));
  });
  w.localStorage.setItem('ansAt:' + bareM, String(Date.now()));
  const left = win => OTHER.filter(([k, v]) => win.localStorage.getItem(k) !== v).map(([k]) => k);
  /* ADA SIGNS IN OVER BEN, AND HER CARD AND THE BOARD ARE DRAWN. */
  w.signedIn_(Object.assign({}, ANS_ADA, { answers: {} }));
  c.draw();
  const rings = w.circOf_({ key: c.pen.key, surface: 'text' }).on;
  await w.answersPush_(true);
  if (c.kp().value) bad.push('Ada signed in over Ben, opened the card, and her empty maths box was given the other tab\'s signed-out answer ' + JSON.stringify(c.kp().value) + ' (`ansRead_`)');
  if (c.pad().querySelectorAll('.qpad-g path').length) bad.push('Ada signed in over Ben and her pad draws the other tab\'s stroke (`padAdopt_`)');
  if (rings.length) bad.push('Ada signed in over Ben and the passage rings the other tab\'s word ' + JSON.stringify(rings) + ' (`circOf_`)');
  if (left(w).length) bad.push('Ada signed in over Ben and the other tab\'s work left the signed-out keys: ' + left(w).join(', '));
  if (Object.keys(b.of('P7')).length) bad.push('the other tab\'s work reached ADA\'S ACCOUNT: ' + JSON.stringify(b.of('P7')).slice(0, 160));
  /* A RELOAD, STILL ADA: the same arrival. */
  const store = {};
  for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); store[k] = w.localStorage.getItem(k); }
  const b2 = edgeBoot_(win => { Object.keys(store).forEach(k => { try { win.localStorage.setItem(k, store[k]); } catch (e) {} }); });
  const w2 = b2.w;
  await wait(300);
  if (!w2.__t.whoami() || String(w2.__t.whoami().personId) !== 'P7') return bad.concat(['setup: the reload is not signed in as Ada — the reload was NOT checked']);
  const c2 = ansCards_(w2, 'S1');
  w2.circOf_({ key: c2.pen.key, surface: 'text' });
  await w2.answersPush_(true);
  if (c2.kp().value || c2.pad().querySelectorAll('.qpad-g path').length) bad.push('reloaded as Ada, signed in over Ben, and the card took the other tab\'s work: ' + JSON.stringify([c2.kp().value, c2.pad().querySelectorAll('.qpad-g path').length]));
  if (left(w2).length) bad.push('reloaded as Ada and the other tab\'s work left the signed-out keys: ' + left(w2).join(', '));
  if (Object.keys(b2.of('P7')).length) bad.push('reloaded, and the other tab\'s work reached ADA\'S ACCOUNT: ' + JSON.stringify(b2.of('P7')).slice(0, 160));
  /* SHE SIGNS OUT AND IN AGAIN, FROM NOBODY: now she is the one who signs in next — 318's seat — and it is hers. */
  w2.signedOut_();
  w2.signedIn_(Object.assign({}, ANS_ADA, { token: 'tok-P7-b', answers: {} }));
  c2.draw();
  if (c2.kp().value !== '(9)/(10)') bad.push('Ada signed out and in again from nobody and her maths box holds ' + JSON.stringify(c2.kp().value) + ' — the seat\'s answer was not hers (the switch outlived the sign-out)');
  return bad;
});

