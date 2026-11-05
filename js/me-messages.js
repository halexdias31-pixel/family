
/* ---------- AND THE LINK IN THAT EMAIL § */
function verifyFromLink_(again) {
  let token = again || '';
  if (!token) try {
    const q = new URLSearchParams(location.search);
    token = (q.get('verify') || '').trim();
    if (!token) return;
    q.delete('verify');
    const rest = q.toString();
    history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
  } catch (e) { if (!token) return; }
  /* ---------- `session`: WHO THIS PHONE IS SIGNED IN AS, beside the link's own token § */
  send_({ action: 'verifyEmail', token, session: (USER && USER.token) || '' })
    .then(d => {
      /* ---------- A NEW ADDRESS, MOVED § */
      if (d && d.moved) {
        accountChanged_();
        if (USER) {
          USER.profile = Object.assign({}, USER.profile || {}, { email: String(d.email || ''), email_moving: '' });
          try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch { /* storage blocked: the sign-in still holds for this visit */ }
          try { repaint(true); } catch (e) { oops_(e, 'me:verifyFromLink_') }
        }
        toast('Your email is ' + (d.email || 'changed') + ' now — sign in with it from here on.');
        return;
      }
      /* A GROWN-UP SAYING YES FOR A CHILD WITH NO EMAIL is told the child's handle, not "sign in
         with it" — the address is theirs, and it signs nobody in for the child. */
      const first = d && d.name ? String(d.name).split(' ')[0] : '';
      if (d && d.noEmail && d.parentPending) {
        /* ---------- `parentPending`: A SHEET THEY CLOSE, NOT A TOAST THAT CLOSES ITSELF § */
        const who = first || 'They';
        openSheet('Confirmed — one more step', `
          <p class="sub">${esc(who)} can sign in now${d.handle ? ` as <b>@${esc(d.handle)}</b>` : ''} with
            their PIN.</p>
          <p class="sub"><b>They are not on your account yet.</b> The @family. account on your email has not
            been confirmed, so we did not put ${esc(first || 'them')} on it.</p>
          <p class="sub">Open the "Confirm your @family. account" email we sent you — or sign in and press
            "Send the link again" — then add ${esc(first || 'them')} with "Add your child" on Students.
            They say yes, and they are on your account.</p>
          <p class="faint">Did you never make an account here? Then somebody else did, with your email. Use
            "Forgotten your PIN?" with your email to take it back — it signs them out.</p>
          ${tile_({ form: true, label: 'Done', act: 'sheet-done', kind: 'quiet' })}`);
        try { if (USER) load(); } catch (e) { oops_(e, 'me:verifyFromLink_') }
      } else if (d && d.noEmail) {
        toast('Confirmed — ' + (first || 'they') + ' can sign in now'
              + (d.handle ? ' as @' + d.handle : '') + ' with their PIN'
              + (d.linkedTo ? ', and is on your account.' : '.'));
        try { if (USER) load(); } catch (e) { oops_(e, 'me:verifyFromLink_') }
      } else {
        /* ---------- AND YOUR OWN, OPENED ON THE PHONE YOU ARE SIGNED IN ON § */
        const me = !!(USER && d && ((d.handle && d.handle === USER.handle) || (d.name && d.name === USER.name)));
        if (me) {
          /* AND A `myProfile` ASKED BEFORE THIS IS NOT ALLOWED TO PUT IT BACK (`ACCOUNT_AT_`) — measured by round three of the review: § */
          accountChanged_();
          USER.pendingEmail = '';
          try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch { /* storage blocked: the sign-in still holds for this visit */ }
          try { repaint(true); } catch (e) { oops_(e, 'me:verifyFromLink_') }
        }
        toast('Email confirmed' + (first ? ', ' + first : '')
              + (!me ? ' — now sign in with it and your PIN.'
                 : mayAddChild_() ? ' — you can add your child on Student profiles now.' : '.'));
      }
      /* TO THE SIGN-IN CARD, which is where the next step is. */
      try { if (!USER) go('account'); } catch (e) { oops_(e, 'me:verifyFromLink_') }
    })
    /* ---------- "SIGN IN, AND IT WILL FINISH BY ITSELF" § */
    .catch(err => {
      const d = err && err.reply;
      if (!d || d.why !== 'sign-in-first') return;    // `send_` has already toasted the server's sentence
      try { sessionStorage.setItem('familyVerify', token); } catch (e) { /* storage can be blocked; the app runs without it */ }
      try { go('account'); } catch (e) { oops_(e, 'me:verifyFromLink_') }
    });
}

/* THE MOMENT SINCE WHICH THE PHONE KNOWS SOMETHING NEWER ABOUT THIS ACCOUNT'S ADDRESS than a `myProfile`
   asked before it — see `profileRefresh_`, which asks again rather than paint an answer older than this. */
let ACCOUNT_AT_ = 0;
function accountChanged_() { ACCOUNT_AT_ = Date.now(); }

/* ---------- WHAT EVERY DOOR IN DOES ONCE IT IS IN § */
function afterSignIn_(d) {
  if (d && (d.childrenHeld || d.pinCleared || d.pinLink || d.moveDropped || d.handleMoved) && d.message) {
    openSheet(d.pinCleared ? 'Your PIN has changed' : d.childrenHeld ? 'Signed in — one thing to know'
              : d.handleMoved ? 'Your handle has changed' : 'Signed in',
      `<p class="sub">${esc(d.message)}</p>
       ${tile_({ form: true, label: 'Done', act: 'sheet-done', kind: 'quiet' })}`);
  }
  let waiting = '';
  try { waiting = sessionStorage.getItem('familyVerify') || ''; sessionStorage.removeItem('familyVerify'); } catch (e) { /* storage can be blocked; the app runs without it */ }
  if (waiting) verifyFromLink_(waiting);
  /* AND A CARD PAYMENT THAT CAME BACK BEFORE ANYBODY WAS SIGNED IN — see `paidFromLink_`. */
  try { if (sessionStorage.getItem(PAID_KEY_)) paidFromLink_(); } catch (e) { /* storage can be blocked; the app runs without it */ }
}

/* ---------- AND THE SIGN-IN LINK IN A FORGOTTEN-PIN MAIL § */
function pinFromLink_() {
  let key = '';
  try {
    const q = new URLSearchParams(location.search);
    key = (q.get('signin') || '').trim();
    if (!key) return;
    q.delete('signin');
    const rest = q.toString();
    history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
  } catch (e) { if (!key) return; }
  send_({ action: 'pinLink', key })
    .then(d => {
      if (!d || !d.success) { toast((d && d.error) || 'That link did not work.'); return; }
      /* THE PIN PATH'S DOOR, for its reasons — see `do-signin` and `signedIn_`. */
      signedIn_(d);
    })
    .catch(() => {});      // `send_` has already toasted the server's sentence
}

/* ---------- AND THE WAY BACK FROM STRIPE (430) ----------------------------------------------------
   `createCheckout` sends a card payment back to `?paid=1&ref=…`; `finalizePayment` asks Stripe and writes the Confirm that books it. */
/* KEPT FOR THE VISIT until the server has answered, so a sign-in, a reload or a dropped connection still finishes it. */
const PAID_KEY_ = 'familyPaid';
/* THE REF IN THE AIR — boot and a sign-in landing together ask once. The server's own guard is the Confirm event for the ref. */
let PAID_ASKING_ = '';
function paidFromLink_() {
  let ref = '';
  try {
    const q = new URLSearchParams(location.search);
    const paid = q.get('paid');
    ref = (q.get('ref') || '').trim();
    if (paid !== null || ref) {
      q.delete('paid'); q.delete('ref');
      const rest = q.toString();
      history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
      if (paid !== '1' || !ref) { toast('Payment cancelled — nothing was charged. Your booking is still waiting.'); return; }
      try { sessionStorage.setItem(PAID_KEY_, ref); } catch (e) { /* storage can be blocked; the app runs without it */ }
    }
  } catch (e) { /* no address bar to read: no payment came back */ }
  if (!ref) try { ref = sessionStorage.getItem(PAID_KEY_) || ''; } catch (e) { /* storage can be blocked; the app runs without it */ }
  if (!ref || PAID_ASKING_ === ref) return;
  if (!USER || !USER.token) {
    toast('Sign in to finish your booking — your payment is safe.');
    try { go('account'); } catch (e) { oops_(e, 'me:paidFromLink_') }
    return;
  }
  /* A CHILD NEVER PAYS (398), so a child's phone does not ask — the parent who paid signs in and it finishes. */
  if (childView_()) { toast('A parent paid for this — they sign in to finish the booking.'); return; }
  PAID_ASKING_ = ref;
  const forget = () => { try { sessionStorage.removeItem(PAID_KEY_); } catch (e) { /* storage can be blocked; the app runs without it */ } };
  api({ action: 'finalizePayment', ref })
    .then(d => {
      PAID_ASKING_ = '';
      /* KEPT: the next sign-in or visit asks again. `api` has already said signed out. */
      if (d && d.why === 'signed-out') return;
      if (d && d.why === 'busy') { toast(d.error || 'Busy — open the site again in a moment to finish.'); return; }
      if (!d || !d.success) {
        forget();
        toast('Payment not confirmed — ' + ((d && d.error) || 'the server did not say why') + ' Nothing was booked.');
        return;
      }
      forget();
      toast(d.alreadyDone ? 'Payment already received — you\'re booked' : 'Payment received — you\'re booked');
      const open = () => { if (!(d.jobId && openJob_(d.jobId, true))) go('booking'); };
      load().then(open, open);
    })
    .catch(err => { PAID_ASKING_ = ''; toast(why_(err) + ' Your payment is safe — open the site again to finish booking.'); });
}

/* ---------- FRIENDS § */
const friendHandles = () =>
  String((USER && USER.friends) || '').split(',').map(x => x.trim()).filter(Boolean);

/* ADDING ONE. The LIST is on Find with everything else; this is only the asking — a short question with an end, which is what a sheet is for. § */
function friendsSheet() {
  openSheet('Add a friend', `
    <label class="field"><span>their handle</span>
      <input id="fr-add" placeholder="as it is on their card" autocomplete="off"></label>
    ${tile_({ form: true, label: 'Add', act: 'friend-add' })}
    <p class="faint" id="fr-said" style="margin:.6rem 0 0">
      Exactly as they have it. A search that guesses adds the wrong person, and the wrong person is
      harder to notice than nobody — they simply appear on a list you scroll past.</p>`);
}

on('friend-add', () => {
  const box = $('fr-add'), said = $('fr-said');
  const want = ((box && box.value) || '').trim();
  if (!want) { box && box.focus(); return; }
  /* EXACT, and it has to be. A search that guesses adds the wrong person, and the wrong person is
     harder to notice than nobody — they simply appear on a list somebody scrolls past. */
  /* NOT ON THE PHONE IS NOT NOBODY (386): a child is sent only siblings and friends, so the server says whether the handle is a child's. */
  const found = (DATA.students || []).find(s2 => norm(s2.handle) === norm(want)) || { handle: want.replace(/^@/, '') };
  if (norm(found.handle) === norm(USER.handle)) {
    if (said) said.textContent = 'That is you.'; return;
  }
  const list = friendHandles();
  if (list.some(h => norm(h) === norm(found.handle))) {
    if (said) said.textContent = found.handle + ' is already on your list.'; return;
  }
  friendsSave(list.concat([found.handle]), said);
  closeSheet();
  toast('Added ' + found.handle);
});

on('friend-drop', el => friendsSave(
  friendHandles().filter(h => norm(h) !== norm(el.dataset.handle)), $('fr-said')));

/* Adding one from the Find browse page, where the list is. */
on('friend-add-open', () => friendsSheet());

/* EVERY FINDER'S FOUND LIST FORGOTTEN, AND THE FINDER IN FRONT DRAWN — `typeof`, because find.js loads
   after this file. */
function friendsForget_() {
  if (typeof finderForgetFound_ === 'function') finderForgetFound_(); else FIND_MEMO.key = null;
  if (typeof finderOf_ === 'function' ? finderOf_(AT) : AT === 'stuff') {
    if (typeof paintFinder_ === 'function') paintFinder_(AT); else paintStuff();
  }
}
/* Written on the phone first, then sent — and the sheet redrawn either way, so removing somebody
   is visible before the round trip and put back if it fails. */
function friendsSave(list, said) {
  const before = USER.friends;
  /* A `myProfile` ASKED BEFORE THIS IS ABOUT THE LIST BEFORE IT (342) — it carries `friends` now, and landing after this it would put the old list back § */
  accountChanged_();
  USER.friends = list.join(', ');
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch { /* storage blocked: the sign-in still holds for this visit */ }
  /* The list lives on Find now, so that is what has to be redrawn — and the memo has to be told, or it serves the list from before the change. § */
  friendsForget_();
  api({ action: 'saveFriends', name: USER.name, personId: USER.personId, friends: USER.friends })
    .then(d => { if (d && d.error) throw new Error(d.error); accountChanged_(); })
    .catch(err => {
      USER.friends = before;
      friendsForget_();
      const el = $('fr-said');
      if (el) el.textContent = why_(err);
      else toast(why_(err));
    });
}

/* ---------- MESSAGES § */
/* THE LIST, drawn into the widget's own space. The same markup the sheet used, so a message looks
   the same whichever way somebody reached it. */
/* WHERE MESSAGES COME FROM. § */
let MESSAGES = null;
/* ---------- WHETHER THE LAST ANSWER WAS ONE § */
let MSG_FAILED = false;

/* ---------- ONE REQUEST AT A TIME, AND ONLY FOR WHOEVER ASKED § */
let MSG_ASKING = null;
function loadMessages() {
  if (!USER) return Promise.resolve([]);
  const who = String(USER.personId || USER.name || '');
  if (MSG_ASKING && MSG_ASKING.who === who) return MSG_ASKING.p;
  const still = () => !!USER && String(USER.personId || USER.name || '') === who;
  /* `send` FOR THE SAME REASON, and the comment below was written as though it already did. § */
  const asking = { who: who, p: null };
  asking.p = send({ action: 'messages', name: USER.name, personId: USER.personId })
    .then(d => {
      if (!still()) return [];
      MSG_FAILED = false;
      return (MESSAGES = (d && d.messages) || []);
    })
    /* A failure leaves whatever was already there rather than emptying the list — an unreachable backend is not the same fact as an empty inbox, and showing the § */
    .catch(() => { if (!still()) return []; MSG_FAILED = true; return MESSAGES || []; })
    .then(v => { if (MSG_ASKING === asking) MSG_ASKING = null; return v; });
  MSG_ASKING = asking;
  return asking.p;
}

/* WRITING ONE — THE HALF THAT HAS NEVER EXISTED. § */
/* THE SHEET IS THE SAME FORM IN A SHEET. § */
function messageSheet(to, toId) {
  openSheet('Message ' + to, msgForm_(to, toId,
    'One message every five minutes. It goes to their e-mail and appears in Messages for both '
  + 'of you.', 5));
}

on('msg-open', el => messageSheet(el.dataset.to, el.dataset.id));

/* ---------- SENDING, OPTIMISTICALLY § */
let MSG_PENDING = [];
let MSG_SEQ = 0;
/* What is queued to go with the next message, per conversation. Held here rather than in the DOM so a
   repaint — the poll, a sign-in — does not drop somebody's chosen photographs. */
const MSG_QUEUE = {};

/* THE CAPS, IN BYTES, AND THE SERVER HOLDS THE SAME ONES (`MSG_FILE_MAX`, `MSG_FILES_MAX` and `MSG_FILES_COUNT` in content.gs). § */
const MSG_CAP_ = { file: 20 * 1048576, total: 32 * 1048576, count: 6 };

const msgKey_ = (to, toId) => String(toId || to || '');
const msgMB_ = n => (n / 1048576).toFixed(n < 10 * 1048576 ? 1 : 0) + 'MB';

/* A photograph over a couple of megabytes is redrawn through `camItemOf_` — the same 1600px the camera uses — because a camera roll's original is four megabytes § */
function msgRead_(q) {
  const f = q.file;
  const asIs = () => new Promise(done => {
    const r = new FileReader();
    r.onload = () => done({ name: f.name || 'file', type: f.type || 'application/octet-stream',
                            data: String(r.result || '') });
    r.onerror = () => done(null);
    try { r.readAsDataURL(f); } catch (e) { done(null); }
  });
  /* EVERY PHOTOGRAPH, NOT ONLY ONE OVER 2MB (413): a message's picture is drawn inline at phone width, and 1600px is plenty. */
  if (/^image\/(jpeg|png|webp|heic|heif)$/i.test(f.type) && typeof camItemOf_ === 'function') {
    return camItemOf_(f).then(it => it && it.data
      ? { name: String(f.name || 'photo').replace(/\.\w+$/, '') + '.jpg', type: 'image/jpeg', data: it.data }
      : asIs(), asIs);
  }
  return asIs();
}

function msgQueueHtml_(key) {
  const q = MSG_QUEUE[key] || [];
  return q.map((a, i) => `<span class="msg-chip">${
      /^image\//.test(a.type) ? `<img src="${esc(a.url)}" alt="" decoding="async">` : `<b>${esc(msgFileMark_(a))}</b>`}
    <span class="msg-chip-name">${esc(a.name)}</span>
    <button class="msg-chip-x" data-do="msg-unqueue" data-k="${esc(key)}" data-i="${i}"
      aria-label="Remove ${esc(a.name)}">×</button></span>`).join('');
}
function msgQueueDraw_(form) {
  const key = form && form.dataset.k;
  const box = form && form.querySelector('.msg-queue');
  if (box) box.innerHTML = msgQueueHtml_(key);
}

/* The file picker answers with `change`, which the `data-do` dispatcher does not listen for. */
document.addEventListener('change', e => {
  const inp = e.target;
  if (!inp || !inp.matches || !inp.matches('.msg-file-in')) return;
  const form = inp.closest('.msg-form');
  const key = form && form.dataset.k;
  if (!key) return;
  const q = MSG_QUEUE[key] = MSG_QUEUE[key] || [];
  [].slice.call(inp.files || []).forEach(f => {
    const total = q.reduce((n, a) => n + a.size, 0);
    if (q.length >= MSG_CAP_.count) { toast('Up to ' + MSG_CAP_.count + ' files in one message.'); return; }
    /* A CLIP IS TOLD HOW TO FIT. § */
    if (f.size > MSG_CAP_.file) {
      toast(f.name + ' is ' + msgMB_(f.size) + ' — over the 20MB a file can be.'
        + (msgKind_(f) === 'video' ? ' Trim the clip to about 20 seconds and choose it again.' : ''));
      return;
    }
    if (total + f.size > MSG_CAP_.total) { toast('That would be over 32MB in one message — send it on its own.'); return; }
    q.push({ file: f, name: f.name || 'file', type: f.type || '', size: f.size,
             url: URL.createObjectURL(f) });
  });
  inp.value = '';
  msgQueueDraw_(form);
});

on('msg-attach', el => {
  const inp = el.closest('.msg-form') && el.closest('.msg-form').querySelector('.msg-file-in');
  if (inp) inp.click();
});
on('msg-unqueue', el => {
  const q = MSG_QUEUE[el.dataset.k] || [];
  const gone = q.splice(+el.dataset.i, 1)[0];
  if (gone) { try { URL.revokeObjectURL(gone.url); } catch (e) { /* already stopped is fine */ } }
  msgQueueDraw_(el.closest('.msg-form'));
});

/* THE COMPOSER GROWS WITH WHAT IS TYPED. `field-sizing: content` does this in Chromium and nowhere
   else, and Safari is where most of these messages are written. Capped by the stylesheet's own
   `max-height`, after which it scrolls. */
document.addEventListener('input', e => {
  const b = e.target;
  if (!b || !b.matches || !b.matches('.msg-text')) return;
  b.style.height = 'auto';
  b.style.height = b.scrollHeight + 2 + 'px';
});
/* ENTER SENDS ON A KEYBOARD AND NEVER ON A PHONE. § */
document.addEventListener('keydown', e => {
  const b = e.target;
  if (e.key !== 'Enter' || e.shiftKey || e.isComposing || !b || !b.matches || !b.matches('.msg-text')) return;
  if (!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
  const go = b.closest('.msg-form') && b.closest('.msg-form').querySelector('.msg-go');
  if (go) { e.preventDefault(); go.click(); }
});

function msgPost_(p) {
  p.state = 'sending'; p.err = ''; p.why = '';
  /* SENT, SO NOT A DRAFT ON ANY OTHER PAGE — a reload while the server is still answering drew these
     words back in the composer, after the server had them, for a second Send (`draftSent_`, data.js). */
  try { if (typeof draftSent_ === 'function') draftSent_('msg', p.withId, p.body); } catch (e) { oops_(e, 'me:msgPost_') }
  const files = p.queue.length ? Promise.all(p.queue.map(msgRead_)) : Promise.resolve([]);
  return files.then(read => {
    /* ---------- A FILE THAT COULD NOT BE READ IS NEVER LEFT OUT IN SILENCE § */
    const lost = p.queue.filter((q, i) => !read[i]);
    const list = read.filter(Boolean);
    if (lost.length) {
      const names = lost.map(q => q.name).join(', ');
      if (!list.length && !p.body) throw new Error(names + ' could not be read on this phone.');
      p.queue = p.queue.filter((q, i) => read[i]);
      p.attachments = (p.attachments || []).filter((a, i) => read[i]);
      MSG_QUEUE[p.withId] = (MSG_QUEUE[p.withId] || []).concat(lost);
      toast(names + ' could not be read, so ' + (lost.length === 1 ? 'it is' : 'they are')
        + ' back in the box — the rest is going.');
    }
    return send({ action: 'sendMessage', name: USER.name, personId: USER.personId,
                  to: p.withName, toId: p.withId, body: p.body, files: list });
  }).then(d => {
    p.state = 'sent'; p.id = (d && d.id) || '';
    /* THE SERVER HAS IT, SO THE DRAFT GOES — unless the box has been written in again since Send. */
    try { if (typeof draftSentDone_ === 'function') draftSentDone_('msg', p.withId, p.body); } catch (e) { oops_(e, 'me:msgPost_') }
    toast(p.inSheet ? 'Sent to ' + p.withName : 'Sent');
    return loadMessages().then(() => {
      if (!MSG_FAILED) {
        MSG_PENDING = MSG_PENDING.filter(x => x !== p);
        p.queue.forEach(a => { try { URL.revokeObjectURL(a.url); } catch (e) { /* already stopped is fine */ } });
      }
    });
  }).catch(err => {
    p.state = 'failed';
    /* NOT SENT, SO A DRAFT AGAIN — kept for a reload, as the bubble keeps it for this page. */
    try { if (typeof draftSentBack_ === 'function') draftSentBack_('msg', p.withId, p.body); } catch (e) { oops_(e, 'me:msgPost_') }
    /* The server's sentence says what to do — "one message every five minutes — 3 to go" — so it is
       what is shown, rather than a "Not sent" that throws that away. */
    p.err = why_(err);
    /* `why: 'files'` — the server refused the PHOTOGRAPHS, not the message, so the bubble can offer
       the words on their own. Read off the reply `send()` hangs on the error, never off the wording. */
    p.why = String((err && err.reply && err.reply.why) || '');
    if (p.inSheet) toast(p.err);
  }).then(() => dmRedraw_(p.withId || p.withName));
}

/* Repaint the column and stay on the conversation somebody is in. § */
function dmRedraw_(key) {
  if (typeof paint !== 'function' || !$('s-dm')) return;
  paint('dm');
  const at = messageThreads_().findIndex(t => t.id === key);
  /* ONE MORE THAN THE THREAD: Daive is page 0 (449). */
  if (at >= 0 && typeof goPage === 'function' && AT === 'dm') { try { goPage('dm', at + 1, true); } catch (e) { oops_(e, 'me:dmRedraw_') } }
  setTimeout(() => { if (typeof dmFoot_ === 'function') dmFoot_(); }, 0);
}

on('msg-send', el => {
  /* THE NEAREST FORM, not an id: the Messages column draws one composer per conversation, and an id
     would hand every Send button the first box on the page — a reply posted to somebody else. */
  const form = el.closest ? el.closest('.msg-form') : null;
  const box  = form ? form.querySelector('.msg-text') : null;
  const said = form ? form.querySelector('.msg-said') : null;
  const text = ((box && box.value) || '').trim();
  const key  = msgKey_(el.dataset.to, el.dataset.id);
  const queue = (MSG_QUEUE[key] || []).slice();
  if (!text && !queue.length) { box && box.focus(); return; }
  if (!USER) { if (said) said.textContent = 'Sign in first.'; return; }
  if (text.length > 2000) { toast('That is longer than a message should be — 2,000 characters.'); return; }

  const p = {
    tmp: 'tmp' + (++MSG_SEQ), mine: true, read: true, state: 'sending',
    withId: el.dataset.id || el.dataset.to, withName: el.dataset.to,
    fromName: USER.name, body: text, atMs: Date.now(), at: '',
    attachments: queue.map(a => ({ url: a.url, type: a.type, name: a.name })),
    queue: queue, inSheet: !!(form && form.closest('#sheet')),
  };
  MSG_PENDING.push(p);
  delete MSG_QUEUE[key];
  if (box) { box.value = ''; box.style.height = ''; }
  if (p.inSheet) { closeSheet(); toast('Sending to ' + p.withName + '…'); }
  dmRedraw_(p.withId);
  msgPost_(p);
});

on('msg-retry', el => {
  const p = MSG_PENDING.find(x => x.tmp === el.dataset.k);
  if (!p) return;
  p.state = 'sending'; p.err = '';
  dmRedraw_(p.withId);
  msgPost_(p);
});
/* ---------- THE WORDS WITHOUT THE PHOTOGRAPHS § */
on('msg-words', el => {
  const p = MSG_PENDING.find(x => x.tmp === el.dataset.k);
  if (!p || !p.body) return;
  if (p.queue.length) MSG_QUEUE[p.withId] = (MSG_QUEUE[p.withId] || []).concat(p.queue);
  p.queue = []; p.attachments = [];
  p.state = 'sending'; p.err = ''; p.why = '';
  dmRedraw_(p.withId);
  msgPost_(p);
});
on('msg-drop', el => {
  const p = MSG_PENDING.find(x => x.tmp === el.dataset.k);
  if (!p) return;
  MSG_PENDING = MSG_PENDING.filter(x => x !== p);
  /* What was typed and chosen goes back in the composer rather than being thrown away with the
     bubble — Remove is "I will write it differently", not "I did not mean any of it". */
  const key = p.withId;
  if (p.queue.length) MSG_QUEUE[key] = (MSG_QUEUE[key] || []).concat(p.queue);
  dmRedraw_(key);
  if (p.body) setTimeout(() => {
    const host = $('s-dm');
    const box = host && [].slice.call(host.querySelectorAll('.msg-form'))
      .filter(f => f.dataset.k === key).map(f => f.querySelector('.msg-text'))[0];
    if (box && !box.value) box.value = p.body;
  }, 0);
});

/* REPORTING A MESSAGE (413) is `suggestTile_` and its box in submit.js since 486; the email to the admin is the backend's. */

/* ---------- AND MARKING THEM READ, WHICH NOTHING HAS EVER DONE § */
function markRead_(msgs) {
  if (!USER) return;
  (msgs || []).filter(m => m && !m.mine && !m.read && m.id).forEach(m => {
    m.read = true;                                   /* so a redraw before the reply does not re-ask */
    /* ---------- AND WHICH ONES THEY WERE STAYS ON THE SCREEN § */
    m.fresh = true;
    api({ action: 'readMessage', name: USER.name, personId: USER.personId, messageId: m.id })
      .catch(() => { m.read = false; });
  });
}

/* THE EMPTY INBOX SAYS HOW TO START ONE. § */
const emptyMessages_ = `<p class="empty">Nothing yet.<br><span class="faint">To write to a tutor,
     open their card and press Message.</span></p>`;

/* ---------- ONE THREAD PER PERSON § */
/* When a message was sent, as a number: § */
function msgTime_(m) {
  if (m && m.atMs) return m.atMs;
  const d = typeof parseWhen === 'function' ? parseWhen(m && m.at) : null;
  return d && !isNaN(d) ? d.getTime() : 0;
}
function messageThreads_() {
  const by = {};
  (MESSAGES || []).concat(MSG_PENDING).forEach(m => {
    const k = m.withId || m.withName || '?';
    (by[k] = by[k] || { id: k, name: m.withName || 'Someone', msgs: [] }).msgs.push(m);
  });
  const out = Object.keys(by).map(k => by[k]);
  out.forEach(t => {
    /* STABLE BY TIME, and a pending bubble always last — it is the newest thing in the thread even
       when the server's clock and this phone's disagree by a minute. */
    t.msgs.sort((a, b) => (!!a.tmp - !!b.tmp) || (msgTime_(a) - msgTime_(b)));
    t.unread = t.msgs.filter(m => !m.mine && !m.read).length;
    t.last = t.msgs[t.msgs.length - 1];
  });
  return out.sort((a, b) => msgTime_(b.last) - msgTime_(a.last));
}


/* `fillMessages` WAS HERE — it filled the single `#msg-body` on `You` with every message at once.
   `fillThread_` above replaces it, one conversation at a time, into the widget that asked. */

/* ---------- ONE RENDERER, AND IT DREW A LOG RATHER THAN A CONVERSATION § */
/* ---------- A DAY, AND A TIME § */
function msgDay_(ms) {
  if (!ms) return '';
  const d = new Date(ms), now = new Date();
  const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const gap = Math.round((day(now) - day(d)) / 864e5);
  if (gap === 0) return 'Today';
  if (gap === 1) return 'Yesterday';
  const opt = { weekday: 'short', day: 'numeric', month: 'short' };
  if (d.getFullYear() !== now.getFullYear()) opt.year = 'numeric';
  try { return d.toLocaleDateString('en-GB', opt); } catch (e) { return d.toDateString(); }
}
function msgClock_(ms, raw) {
  if (!ms) return String(raw || '');
  const d = new Date(ms);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

/* ---------- PICTURE, CLIP OR FILE: THE TYPE, AND THE NAME WHEN THERE IS NO TYPE § */
function msgKind_(a) {
  const t = String((a && a.type) || '').toLowerCase();
  if (/^image\//.test(t)) return 'image';
  if (/^video\//.test(t)) return 'video';
  if (t && t !== 'application/octet-stream') return 'file';
  const ext = (String((a && a.name) || '').toLowerCase().match(/\.([a-z0-9]{2,5})$/) || [])[1] || '';
  if (/^(jpe?g|png|gif|webp|heic|heif)$/.test(ext)) return 'image';
  if (/^(mov|mp4|m4v|webm|3gp)$/.test(ext)) return 'video';
  return 'file';
}

/* A FILE'S MARK — its extension, because "PDF" and "DOCX" say more than any one icon would. */
function msgFileMark_(a) {
  const ext = (String(a.name || '').match(/\.(\w{1,5})$/) || [])[1];
  return ext ? ext.toUpperCase() : (String(a.type || '').split('/')[1] || 'FILE').slice(0, 4).toUpperCase();
}

/* ---------- WHAT WAS SENT WITH IT § */
function msgAttachHtml_(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<div class="msg-att">${list.map(a => {
    const url = String(a.url || '');
    const kind = msgKind_(a);
    if (kind === 'image') {
      return `<a class="msg-pic" href="${esc(url)}" target="_blank" rel="noopener"
        aria-label="Open ${esc(a.name || 'the photo')}">
        <img src="${esc(pic(url))}" alt="${esc(a.name || 'photo')}" loading="lazy" decoding="async"></a>`;
    }
    if (kind === 'video') {
      return `<video class="msg-vid post-vid" src="${esc(/^blob:/.test(url) ? url : postVidSrc_(url))}"
        data-open="${esc(url)}" controls playsinline preload="metadata"></video>`;
    }
    return `<a class="msg-file" href="${esc(url)}" target="_blank" rel="noopener">
      <b>${esc(msgFileMark_(a))}</b><span>${esc(a.name || 'a file')}</span></a>`;
  }).join('')}</div>`;
}

/* ---------- AN ADMIN'S REFUSAL CARRIES THE FIX, AND THE FIX IS AN ADDRESS § */
function msgFixUrls_(text) {
  return (String(text || '').match(/https?:\/\/[^\s<>]+/g) || [])
    .map(u => u.replace(/[.,;:)]+$/, ''))
    /* A SCOPE IS NAMED BY WHERE IT STARTS, not by containing the words: the consent screen's own
       address carries `scope=https://www.googleapis.com/auth/drive` in its query. */
    .filter(u => /^https:\/\//.test(u) && !/^https:\/\/www\.googleapis\.com\/auth\//.test(u))
    .slice(0, 2);
}
function msgFixLinks_(text) {
  return msgFixUrls_(text).map(u => `<a class="msg-act" href="${esc(u)}" target="_blank" rel="noopener">${
    /\?setup=1/.test(u) ? 'Open ?setup=1' : /accounts\.google\.com/.test(u) ? 'Allow it' : 'Open the link'}</a>`)
    .join('');
}
/* AND THE SENTENCE WITHOUT THEM. § */
function msgFailSaid_(text) {
  let t = String(text || '');
  msgFixUrls_(t).forEach(u => {
    t = t.split('\n').filter(line => {
      const at = line.indexOf(u);
      return !(at > 0 && /^[^:]{1,40}:\s*$/.test(line.slice(0, at)) && !line.slice(at + u.length).trim());
    }).join('\n').split(u).join('the button below');
  });
  return t.trim();
}

/* ---------- THE THREAD § */
const messagesHtml_ = ms => {
  let lastDay = '';
  return (ms || []).map((m, i, all) => {
    const mine = !!m.mine;
    const t = msgTime_(m);
    const dayWord = msgDay_(t);
    const newDay = dayWord && dayWord !== lastDay;
    if (dayWord) lastDay = dayWord;
    const prev = all[i - 1], next = all[i + 1];
    const nextDay = next ? msgDay_(msgTime_(next)) : '';
    const runTop = newDay || !prev || !!prev.mine !== mine;
    const runEnd = !next || !!next.mine !== mine || (nextDay && nextDay !== dayWord)
                || !!m.tmp !== !!next.tmp;
    const words = String(m.body || '').trim();
    const state = m.state === 'failed'
      ? `<p class="msg-when msg-fail"><span class="msg-fail-why">Not sent — ${esc(msgFailSaid_(m.err) || 'try again')}</span>
           <button class="msg-act" data-do="msg-retry" data-k="${esc(m.tmp)}">Retry</button>${
           m.why === 'files' && words && (m.queue || []).length
             ? `<button class="msg-act" data-do="msg-words" data-k="${esc(m.tmp)}">Words only</button>` : ''}
           <button class="msg-act" data-do="msg-drop" data-k="${esc(m.tmp)}">Remove</button>${
           msgFixLinks_(m.err)}</p>`
      : m.state === 'sending' ? `<p class="faint msg-when">sending…</p>`
      : m.tmp ? `<p class="faint msg-when">sent</p>` : '';
    return `${newDay ? `<p class="msg-day"><span>${esc(dayWord)}</span></p>` : ''}
      <div class="msg${mine ? ' mine' : ''}${runTop ? ' run-top' : ''}${
        runEnd ? ' run-end' : ''}${!mine && (!m.read || m.fresh) ? ' unread' : ''}${
        m.state ? ' is-' + m.state : ''}">
      ${/* A MESSAGE YOU WERE SENT CAN BE REPORTED (413) — beside its bubble, for a child as much as anybody (`suggestTile_`, 486). */''}
      ${!mine && m.id && !m.tmp ? '<div class="msg-line">' : ''}<div class="msg-bub${words ? '' : ' is-bare'}">${msgAttachHtml_(m.attachments)}${
        words ? `<p class="msg-body-text">${mark(words)}</p>` : ''}</div>${!mine && m.id && !m.tmp
        ? suggestTile_('message', m.id, 'Message from ' + (m.fromName || m.withName || 'someone'), 'msg-flag') + '</div>' : ''}
      ${state || (runEnd ? `<p class="faint msg-when">${esc(mine ? 'you' : (m.fromName || 'them'))} · ${
        esc(msgClock_(t, m.at))}</p>` : '')}
    </div>`;
  }).join('');
};

/* ---------- THE COMPOSER, ONCE, WHEREVER IT IS WANTED § */
/* ---------- WHAT IS HALF WRITTEN SURVIVES A RELOAD (docs/history/317) § */
function msgDraft_(k) {
  if (typeof draftVal_ !== 'function') return '';
  const d = draftVal_('msg', k, '');
  return d && MSG_PENDING.some(p => p.withId === k && p.body === d.trim()) ? '' : d;
}
function msgForm_(to, toId, note, rows) {
  const k = msgKey_(to, toId);
  return `<div class="msg-form" data-k="${esc(k)}">
    <div class="msg-queue">${msgQueueHtml_(k)}</div>
    ${/* A CHILD SENDS WORDS ONLY (413) — no picker, and `sendMessage` refuses their files too. */
      rankAtLeast_('client') ? `<button class="btn quiet msg-clip" data-do="msg-attach"
      aria-label="Attach a photo, video or file">＋</button>
    <input type="file" class="msg-file-in" multiple hidden aria-label="Choose files to send">` : ''}
    <textarea class="msg-text" rows="${rows || 1}" maxlength="2000"
      placeholder="Message…" aria-label="Message ${esc(to)}"${draftAttr_('msg', k)}>${esc(msgDraft_(k))}</textarea>
    <button class="btn msg-go" data-do="msg-send"
      data-to="${esc(to)}" data-id="${esc(toId || '')}">Send</button>
    <p class="faint msg-said">${esc(note || '')}</p>
  </div>`;
}

/* ---------- CHECK UPLOADS: THE ADMIN'S ANSWER TO "CAN A PHOTO BE SENT YET" § */
let UPLOADS_SAID = null;

function uploadsHtml_(d) {
  const tile = `<div class="tile-row">${tile_({ icon: 'tick', label: 'Check uploads', note: 'nothing kept',
    act: 'uploads-check', tone: 'admin' })}</div>`;
  if (!d) {
    return tile + `<p class="faint up-said">Whether a photo or a clip sent in a message can be kept:
      the Ledger's column, the Drive folder and what this deployment may do. One test file is made,
      shared and binned.</p>`;
  }
  if (d.error) return tile + `<p class="up-said up-bad">${esc(d.error)}</p>`;
  const rows = (d.checks || []).map(c => `<li class="up-row ${c.ok ? 'is-ok' : 'is-bad'}">
      <b class="up-mark" role="img" aria-label="${c.ok ? 'yes' : 'no'}">${c.ok ? '✓' : '✗'}</b>
      <span><span class="up-k">${esc(c.label)}</span>
      <span class="up-v">${esc(c.said)}</span></span></li>`).join('');
  const steps = (d.steps || []).map(st => `<li>${esc(st.text)}</li>`).join('');
  /* THE ADDRESSES A STEP NEEDS ARE TILES UNDER THE LIST, not links in its sentence — a link in a line of 0.78rem type is a 14px target, and a tile is 44px from the § */
  const go = (d.steps || []).map(st => {
    const href = String(st.href || (st.setup && typeof API === 'string' ? API + '?setup=1' : ''));
    return href ? tile_({ icon: 'open', href: href,
      label: st.setup ? 'Open ?setup=1' : 'Allow it', note: st.setup ? 'adds the column' : 'consent' }) : '';
  }).filter(Boolean).join('');
  return tile + `<ul class="up-list">${rows}</ul>
    <p class="up-said ${d.ok ? 'up-good' : 'up-bad'}">${d.ok
      ? 'Ready — photos, videos and files can be sent in messages.'
      : 'Not yet. In this order:'}</p>
    ${steps ? `<ol class="up-steps">${steps}</ol>` : ''}
    ${go ? `<div class="tile-row">${go}</div>` : ''}
    <p class="faint up-ver">backend ${esc(d.version || '—')}</p>`;
}

/* EVERY `.up-box` ON THE PAGE — a class rather than the id alone, for the reason `cart-box` gives:
   two copies of one widget under one id is the `$('msg-text')` fault. */
function uploadsPaint_() {
  document.querySelectorAll('.up-box').forEach(b => { b.innerHTML = uploadsHtml_(UPLOADS_SAID); });
  /* A CARD THAT GREW IS PLACED AGAIN — "every grower in the app already calls this", in the note over `paneWatch_`. § */
  if (typeof placeCells === 'function' && (AT === 'stuff' || AT === 'res' || AT === 'saved')) {
    try { placeCells('y', true, 0, AT); } catch (e) { oops_(e, 'me:uploadsPaint_') }
  }
}

on('uploads-check', el => {
  if (!isAdmin()) return;
  /* NOT DEPLOYED YET IS THE FIRST ANSWER, and the commonest one on the day this ships: § */
  const f = (DATA && DATA.features) || [];
  if (f.length && f.indexOf('checkUploads') < 0) {
    UPLOADS_SAID = { error: 'The live backend is ' + (DATA.version || 'an older version') + ' and has no '
      + 'Check uploads yet. Sync backend/ from GitHub, then Deploy → Manage deployments → New version.' };
    uploadsPaint_();
    return;
  }
  const box = el.closest('.up-box');
  send_({ action: 'checkUploads', name: USER.name, personId: USER.personId },
        { button: el, where: box && box.querySelector('.up-said') })
    .then(d => { UPLOADS_SAID = d; uploadsPaint_(); })
    .catch(err => { UPLOADS_SAID = { error: why_(err) }; uploadsPaint_(); });
});



/* ---------- YOUR OWN DETAILS § */
/* ---------- ADDING A CHILD, AND ANSWERING WHEN SOMEBODY ADDS YOU § */
/* ---------- THE ANSWER HALF HAD NO DOOR EITHER, UNTIL THE ACCOUNT COLUMN DREW IT § */
function claimCard_(c) {
  return `<div class="card">
    <h3>${esc(c.from)} says they are your parent</h3>
    <p class="sub">Say yes and they will be able to book sessions for you and see how you are
      getting on. Say no and nothing happens.</p>
    <div class="btn-row">
      ${tile_({ form: true, label: 'Yes', act: 'claim-yes', data: { row: c.rowIndex } })}
      ${tile_({ form: true, label: 'No', act: 'claim-no', data: { row: c.rowIndex }, kind: 'quiet' })}
    </div>
  </div>`;
}

/* WHO MAY ASK — the same test the tile carried, kept in one place so the card and its handler
   cannot disagree about it. */
function mayAddChild_() {
  const held = typeof heldRoles === 'function' ? heldRoles() : [];
  return held.indexOf('client') !== -1 || held.indexOf('parent') !== -1 || held.indexOf('admin') !== -1;
}

/* LINKING A CHILD WHO HAS AN ACCOUNT moved to the People column (442): search their handle, then the
   card's "Add as my child" tile. This section only points there. */
function kidAddSec_() {
  return `<div class="kid-sec kid-add">
    <h4 class="kid-h">Add your child</h4>
    <p class="sub">Your child makes their own account (Make an account). Then search their handle at the top of
      ${esc(tabLabel_('students', 'Student profile'))} and tap Add as my child on their card. They say yes before anything is linked.</p>
  </div>`;
}
