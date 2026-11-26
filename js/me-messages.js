
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
          saveUser_();
          try { repaint(true); } catch (e) { oops_(e, 'me:verifyFromLink_') }
        }
        toast('Your email is ' + (d.email || 'changed') + ' now — sign in with it from here on.');
        return;
      }
      /* A GROWN-UP SAYING YES FOR A CHILD WITH NO EMAIL is told the child's handle, not "sign in
         with it" — the address is theirs, and it signs nobody in for the child. */
      const first = d && d.name ? fmtName_(d.name, 'first') : '';
      if (d && d.noEmail && d.parentPending) {
        /* ---------- `parentPending`: A SHEET THEY CLOSE, NOT A TOAST THAT CLOSES ITSELF § */
        const who = first || 'They';
        openStep_({ title: 'Confirmed — one more step', html: cardBlock_({ type: 'text', look: 'note', paras: [
          [who + ' can sign in now', d.handle ? [' as ', { b: '@' + d.handle }] : '', ' with their PIN.'],
          [{ b: 'They are not on your account yet.' }, ' The @family. account on your email has not been confirmed, so we did not put '
            + (first || 'them') + ' on it.'],
          'Open the "Confirm your @family. account" email we sent you — or sign in and press "Send the link again" — then add '
            + (first || 'them') + ' with "Add your child" on Students. They say yes, and they are on your account.',
          'Did you never make an account here? Then somebody else did, with your email. Use "Forgotten your PIN?" with your email to take it back — it signs them out.'] })
          + tile_({ form: true, label: 'Done', act: 'sheet-done', kind: 'quiet' }) });
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
          saveUser_();
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
      keep_.put('familyVerify', token);
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
    openStep_({ title: d.pinCleared ? 'Your PIN has changed' : d.childrenHeld ? 'Signed in — one thing to know'
              : d.handleMoved ? 'Your handle has changed' : 'Signed in', html: cardBlock_({ type: 'text', look: 'note', text: d.message }) + tile_({ form: true, label: 'Done', act: 'sheet-done', kind: 'quiet' }) });
  }
  let waiting = '';
  waiting = keep_.get('familyVerify') || ''; keep_.del('familyVerify');
  if (waiting) verifyFromLink_(waiting);
  /* AND A CARD PAYMENT THAT CAME BACK BEFORE ANYBODY WAS SIGNED IN — see `paidFromLink_`. */
  try { if (keep_.get(PAID_KEY_)) paidFromLink_(); } catch (e) { /* storage can be blocked; the app runs without it */ }
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
      /* THE PIN PATH'S DOOR, for its reasons — see `sign-digit` (find-account.js) and `signedIn_`. */
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
      if (paid !== '1' || !ref) { toast(text_('payment-cancelled-nothing-was-charged-your')); return; }
      keep_.put(PAID_KEY_, ref);
    }
  } catch (e) { /* no address bar to read: no payment came back */ }
  if (!ref) ref = keep_.get(PAID_KEY_) || '';
  if (!ref || PAID_ASKING_ === ref) return;
  if (!USER || !USER.token) {
    toast(text_('sign-in-to-finish-your-booking'));
    try { go('account'); } catch (e) { oops_(e, 'me:paidFromLink_') }
    return;
  }
  /* A CHILD NEVER PAYS (398), so a child's phone does not ask — the parent who paid signs in and it finishes. */
  if (!may_('prices')) { toast('A parent paid for this — they sign in to finish the booking.'); return; }
  PAID_ASKING_ = ref;
  const forget = () => { keep_.del(PAID_KEY_); };
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
/* ---------- YOUR OWN DETAILS § */
/* ---------- ADDING A CHILD, AND ANSWERING WHEN SOMEBODY ADDS YOU § */
/* ---------- THE ANSWER HALF HAD NO DOOR EITHER, UNTIL THE ACCOUNT COLUMN DREW IT § */
function claimCard_(c) {
  return card_(cardBlock_({ type: 'msgBox', parts: [cardBlock_({ type: 'msgHead', text: c.from + ' says they are your parent' }),
    tileRow_(tile_([{ form: true, label: 'Yes', act: 'claim-yes', data: { row: c.rowIndex } },
      { form: true, label: 'No', act: 'claim-no', data: { row: c.rowIndex }, kind: 'quiet' }]), 'btn-row')] }));
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
  return cardBlock_({ type: 'msgBox', look: 'kid-sec kid-add', parts: [cardBlock_({ type: 'msgHead', h: 4, look: 'kid-h', text: 'Add your child' }),
    cardBlock_({ type: 'msgText', look: 'note', text: 'Your child makes their own account (Make an account). Then search their handle at the top of '
      + tabLabel_('students', 'Student profile') + ' and tap Add as my child on their card. They say yes before anything is linked.' })] });
}

