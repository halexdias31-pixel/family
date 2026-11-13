/* post-signin.gs: doPost's handlers for signing up and in, and PINs, cut from post-account.gs along that seam.
   Named in `postActions_()`, dopost.gs, after its gate; § notes: docs/notes/backend/dopost.gs.md. */

/* register ------------------------------------------------------------------------------ Anyone may create a STUDENT or a CLIENT (parent) account. § */
/* ---------- WHO THE ACCOUNT IS FOR IS ASKED, AND THE ANSWER IS THE ROLE § */
/* ---------- A CHILD WITH NO EMAIL OF THEIR OWN MAKES AN ACCOUNT WITH A GROWN-UP'S § */
function postRegister_(body, action, began) {
  const first = S(body.first_name), last = S(body.last_name);
  const email = S(body.email), pin = S(body.pin);
  const grownUp = email ? '' : S(body.parent_email);
  const asParent = norm(body.who) === 'parent';
  const wrong = registerWrong_(first, last, email, pin, grownUp, asParent);
  if (wrong) return jsonOut({ error: wrong });

  const full = (first + ' ' + last).trim();
  const t = read(TAB.people);
  /* ASKED BEFORE ANYTHING IS WRITTEN: an account whose grown-up's address had nowhere to go would
     be a child with nobody to confirm them and nobody to send a forgotten PIN to. */
  if (grownUp && t.headers.indexOf('parent_email') === -1) {
    return jsonOut({ error: 'The sheet has no column for: parent_email. Run ?setup=1 — nothing was saved.' });
  }
  /* ---------- THE ADDRESS FIRST, AND A NAME CLASH THAT DOES NOT SAY IT IS ONE (342, the review) § */
  if (email && t.rows.some(r => S(r.email) && norm(r.email) === norm(email))) {
    return jsonOut({ error: 'That email is already registered. Try logging in.' });
  }
  if (findPerson(full)) {
    return jsonOut({ error: 'We could not make that account. If you have one already, sign in — or ask us to help.' });
  }

  /* PENDING until they click the link. § */
  const token = 'V' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  const { arrivedWith, inviter } = registerInviter_(t, body);

  /* BEFORE THE ROW EXISTS: a draft with the id it will have, so the template (364) can use it. */
  const regId = 'P' + Date.now();
  const regHandle = handleMake_({ person_id: regId, first_name: first, last_name: last });
  /* WITH NO ADDRESS THE HANDLE IS THE ONLY WAY IN, so an account the generator could not name
     would be an account nobody can sign in to. Said now, with nothing written. */
  if (!email && !regHandle) {
    return jsonOut({ error: 'No free handle could be made just now. Nothing was saved — try again.' });
  }
  addRow(t, registerRow_(body, regId, regHandle, first, last, email, pin, grownUp, asParent, arrivedWith, inviter, token));

  /* Tell the person who sent them. It is the only thanks the mechanism can give, it costs
     nothing, and somebody who hears that their introduction landed makes another. */
  if (inviter) registerThank_(t, inviter, full);
  // Sent directly rather than through notify(): notify looks the address up on the row, and
  // the point here is to prove that THIS address reaches this person.
  /* THE HANDLE IS IN IT. It was nowhere: not in this email, not in the reply, only on the
     account's own card once signed in — which a child with no address cannot reach without it. */
  try {
    registerMail_(email, grownUp, first, regHandle, token, asParent);
  } catch (err) {
    return jsonOut({ error: 'Account created, but the confirmation email could not be sent. Please get in touch.' });
  }
  /* `role` IN THE APP'S WORD, as the sign-in reply says it, so the phone can tell a parent what
     comes next without guessing from what it posted. */
  /* THE REPLY IS THE REGISTRANT'S OWN (342): they typed the name, so a grown-up's whole name stays in
     it; a child's is still her first name, to herself as to everybody. */
  netViewerSet_({ person_id: regId });
  return jsonOut({ success: true, name: full, pending: true, handle: regHandle || '',
                   confirmBy: email ? 'self' : 'grown-up',
                   role: toAppRole(asParent ? 'client' : 'student') });
}

/* WHAT THE FORM GOT WRONG, IN THE WORDS IT SAYS BACK — or '' when nothing. */
function registerWrong_(first, last, email, pin, grownUp, asParent) {
  if (!first || !last) return 'Please give a first and last name.';
  if (asParent && !email) {
    return 'A parent\'s account needs your own email address — it is what you sign in with. Nothing was saved.';
  }
  if (!email && !grownUp) {
    return 'Please give your email address — or, with no email of your own, a grown-up\'s.';
  }
  if ((email || grownUp).indexOf('@') < 0) return 'Please give a real email address.';
  if (!/^\d{4}$/.test(pin)) return 'Choose a PIN of 4 digits.';
  /* THE SAME RULE `changePin` HAS — see `pinWeak_`. A form that let you choose 0000 and then
     refused it when you tried to change it was two rules for one PIN. */
  if (pinWeak_(pin)) return 'Pick a PIN that is harder to guess than that.';
  return '';
}

/* WHO SENT THEM, from the code they arrived with. */
function registerInviter_(t, body) {
  /* WHO SENT THEM. The referral code was generated and never recorded against anybody, so the loop was open at the far end — codes went out and nothing came back. § */
  const arrivedWith = S(body.ref).toUpperCase().replace(/[^A-Z0-9]/g, '');
  let inviter = '';
  if (arrivedWith) {
    const owner = t.rows.find(x => S(x.referral_code).toUpperCase() === arrivedWith);
    if (owner) inviter = S(owner.person_id) || personDisplayName(owner);
  }
  return { arrivedWith, inviter };
}

/* THE NEW ROW, PENDING until they click the link. */
function registerRow_(body, regId, regHandle, first, last, email, pin, grownUp, asParent, arrivedWith, inviter, token) {
  return Object.assign({
    /* THE ROLE THEY CHOSE — see the note over this action. § */
    person_id: regId, role: asParent ? 'client' : 'student',
    first_name: first, last_name: last,
    /* THE HANDLE IS THE TEMPLATE (364) — see `handleMake_`. */
    handle: regHandle || '',
    email, pin, credits: 0, xp: 0,
    /* A FLYER'S TAG WHEN NO FRIEND'S CODE CAME: `flyer-<layout>-<id>` from the QR (flyer.js), kept to its own letters. */
    came_from: arrivedWith || S(body.from).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60),
    invited_by: inviter,
    joined_on: new Date(),
    verified: 'PENDING', verify_token: token
  /* ONLY WHEN THERE IS ONE: a key the tab has no column for is a lost write, and an account made
     with an address of its own has nothing to put here. */
  }, grownUp ? { parent_email: grownUp } : {});
}

/* THE THANK-YOU TO WHOEVER SENT THEM. */
function registerThank_(t, inviter, full) {
  const owner = t.rows.find(x => S(x.person_id) === inviter || personDisplayName(x) === inviter);
  if (owner) {
    /* A THANK-YOU, and theirs to turn off (`referrals_email`) — nothing waits on it. */
    notify(personDisplayName(owner), 'Somebody joined through you',
      full + ' has just signed up using your code. Thank you — that is genuinely how this '
      + 'grows.', 'referrals');
  }
}

/* THE LINK THAT PROVES THE ADDRESS: the account's own, else the grown-up's. */
function registerMail_(email, grownUp, first, regHandle, token, asParent) {
  const said = regHandle ? '@' + regHandle : '';
  /* THE ACCOUNT'S OWN ADDRESS GETS `linkMail_`, which `resendLink` sends again word for word. */
  if (email) linkMail_({ first_name: first, email: email, handle: regHandle || '' }, token, asParent);
  else mailOut_({ to: grownUp, name: '@family.',
        subject: first + ' has made an @family. account',
        /* THE FIRST NAME, as every email names a child now (the owner, 10 Oct: *"dont show
           children's last name"*) — the grown-up knows the rest, and `mailOut_` would take it out. */
        body: 'Hello,\n\n' + first + ' has made an account on @family. and gave this address as '
            + 'their grown-up\'s, because they have no email of their own.\n\n'
            + 'Their account works already. If that is right, open this link to confirm your address'
            + ' (it also puts them on your @family. parent account if you have one and have confirmed it):\n\n'
            + SITE_URL + '?verify=' + token + '\n\n'
            + 'They sign in with their handle, ' + said + ', and the PIN they chose. '
            /* "ONCE YOU HAVE OPENED IT": § */
            + 'Once you have opened the link, "Forgotten your PIN?" sends a new one to this address '
            + 'if they forget it.\n\n'
            /* "AND HAVE CONFIRMED IT" since `verifyEmail` stopped linking a PENDING parent row. */
            + 'If you have an @family. parent account on this address and have confirmed it, opening the '
            + 'link also puts ' + first + ' on it. If you do not know who this is, ignore this email and '
            + 'nothing happens.'
            + '\n\n— @family.' });
}

/* confirming an email address --------------------------------------------------------- The token is the proof: § */
function postVerifyEmail_(body, action, began) {
  const token = S(body.token);
  if (!token) return jsonOut({ error: 'No confirmation code.' });
  /* ---------- A NEW ADDRESS FOR AN ACCOUNT THAT HAS ONE: MOVED ONLY WHERE THAT ACCOUNT IS SIGNED IN § */
  if (/^M/.test(token)) {
    const hit = authMoveFind_(token);
    if (!hit) return jsonOut({ error: 'That link has already been used, has expired, or a newer one has been sent.' });
    const tm = read(TAB.people);
    const who = authWhoIs_(body.session);
    const mover = tm.rows.find(x => S(x.person_id || personDisplayName(x)) === hit.owner);
    if (!mover) return jsonOut({ error: 'The account that link was for is not there any more.' });
    if (!who || S(who.person_id) !== S(mover.person_id)) {
      return jsonOut({ why: 'sign-in-first',
        error: 'This link changes the email address on an @family. account, so it only works where you are '
             + 'signed in to that account. Sign in, and it will finish by itself.' });
    }
    /* AN ADDRESS THAT HAS GONE TO SOMEBODY ELSE SINCE is refused rather than put on two rows —
       `verifyLogin` would then refuse both (`emailRefusal_`). */
    const clash = emailRefusal_(hit.move.to, mover);
    if (clash) { authMoveDrop_(mover); return jsonOut({ error: clash + ' Nothing was changed.' }); }
    setCell(tm, mover, 'email', S(hit.move.to));
    setCell(tm, mover, 'verified', 'TRUE');
    setCell(tm, mover, 'verify_token', '');
    authMoveDrop_(mover);
    /* A PIN MAILED TO THE OLD ADDRESS IS NOT A WAY INTO THE ACCOUNT AT THE NEW ONE — the rule
       `updateProfile` keeps for a corrected PENDING address. */
    authResetDrop_(mover);
    clearCache();
    /* THE ACCOUNT, SIGNED IN AND HOLDING THE NEW INBOX, IS WHO THIS IS FOR (342). */
    netViewerSet_(mover);
    return jsonOut({ success: true, moved: true, email: S(hit.move.to), name: nameFor_(mover),
                     handle: S(mover.handle), noEmail: false, linkedTo: '', parentPending: false });
  }
  const t = read(TAB.people);
  const r = t.rows.find(x => S(x.verify_token) === token);
  if (!r) return jsonOut({ error: 'That confirmation link has already been used, or has expired.' });
  setCell(t, r, 'verified', 'TRUE');
  setCell(t, r, 'verify_token', '');
  /* WHOEVER HOLDS THIS LINK OWNS THE INBOX IT WENT TO (342) — the account's own, or the grown-up's a no-email child named — so the reply is theirs, and the § */
  {
    const inbox = norm(S(r.email) || r.parent_email);
    const owners = inbox ? t.rows.filter(x => norm(x.email) === inbox) : [];
    netViewerSet_(owners.length === 1 ? owners[0] : null);
  }
  /* ---------- A GROWN-UP SAYING YES TO A CHILD'S ACCOUNT ALSO PUTS THE CHILD ON THEIRS § */
  let linked = '', held = false;
  const grown = norm(r.parent_email);
  if (!S(r.email) && grown && S(r.person_id)) {
    const hits = t.rows.filter(x => norm(x.email) === grown);
    const par = hits.length === 1 ? hits[0] : null;
    const parent = par && S(par.person_id) && (hasRole(par, 'client') || hasRole(par, 'admin'));
    held = !!parent && addressPending_(par);
    if (parent && !held) {
      const fam = read(TAB.family);
      const was = fam.rows.find(x => S(x.parent_id) === S(par.person_id) && S(x.child_id) === S(r.person_id));
      let ok = !!was;
      /* A LINK `authTakeBack_` HELD STAYS HELD — only an admin settles who that child belongs to, and
         a link opened from the child's mail is not that. */
      if (was && norm(was.state) === 'held') ok = false;
      else if (was && norm(was.state) !== 'accepted') {
        ok = setCell(fam, was, 'state', 'accepted'); setCell(fam, was, 'answered_on', new Date());
      } else if (!was) {
        ok = !!addRow(fam, { link_id: 'F' + Date.now(), parent_id: S(par.person_id), child_id: S(r.person_id),
                             child_typed: personDisplayName(r), state: 'accepted',
                             asked_on: new Date(), answered_on: new Date() });
      }
      if (ok) linked = nameFor_(par);
    }
  }
  clearCache();
  return jsonOut({ success: true, name: nameFor_(r), handle: S(r.handle),
                   noEmail: !S(r.email), linkedTo: linked, parentPending: held });
}

/* ---------- "SEND THE LINK AGAIN" § */
function postResendLink_(body, action, began) {
  const t = read(TAB.people);
  const me = t.rows.find(x => S(x.person_id) === S(body.personId));
  if (!me) return jsonOut({ error: 'We could not find your account.' });
  /* ---------- OR THE LINK FOR A NEW ADDRESS WAITING TO BE PROVED (`authMove*_`) § */
  const move = authMoveGet_(me);
  const own = S(me.email);
  if (!move && !own) return jsonOut({ error: 'This account has no email address of its own, so there is no link to send.' });
  if (!move && !addressPending_(me)) {
    return jsonOut({ success: true, why: 'confirmed', pendingEmail: '',
                     message: 'Your email is confirmed already — there is nothing to open.' });
  }
  const key = 'AUTH_LINK_' + S(me.person_id);
  const at = move ? S(move.to) : own;
  let last = 0;
  try { last = N(authProps_().getProperty(key)); } catch (err) { last = 0; }
  const since = Date.now() - last;
  if (last && since < AUTH.LINK_GAP_MINS * 60000) {
    const mins = Math.max(1, Math.ceil((AUTH.LINK_GAP_MINS * 60000 - since) / 60000));
    return jsonOut({ success: true, why: 'already-sent', pendingEmail: move ? pendingEmailOf_(me) : own,
      message: 'A link went to ' + at + ' a few minutes ago — look there, and in spam. You can ask again in '
             + mins + (mins === 1 ? ' minute.' : ' minutes.') });
  }
  let quota = 1;
  try { quota = MailApp.getRemainingDailyQuota(); } catch (err) { quota = 1; }
  const cannot = { why: 'no-mail', error: 'We could not send the email just now, so nothing has changed. Try again later.' };
  if (quota < 1) return jsonOut(cannot);
  if (move) {
    const fresh = 'M' + Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    try { moveMail_(move.to, fresh); } catch (err) { return jsonOut(cannot); }
    if (!authMovePut_(me, Object.assign({}, move, { key: fresh, at: Date.now() }))) {
      return jsonOut({ error: 'We sent a new link but could not save it, so it will not work. The first link we '
                            + 'sent still does — ask us if you cannot find it.' });
    }
    try { authProps_().setProperty(key, String(Date.now())); } catch (err) { Logger.log('auth props, best-effort (the next run tries again): ' + err); }
    return jsonOut({ success: true, movingEmail: S(move.to), pendingEmail: pendingEmailOf_(me),
      message: 'A new link is on its way to ' + S(move.to) + '. Open it where you are signed in and your email '
             + 'changes — any link we sent before this one no longer works.' });
  }
  const token = 'V' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  try { linkMail_(me, token, hasRole(me, 'client')); } catch (err) { return jsonOut(cannot); }
  if (!setCell(t, me, 'verify_token', token)) {
    return jsonOut({ error: 'We sent a new link but could not save it, so it will not work. The first link we sent '
                          + 'still does — ask us if you cannot find it.' });
  }
  try { authProps_().setProperty(key, String(Date.now())); } catch (err) { Logger.log('auth props, best-effort (the next run tries again): ' + err); }
  clearCache();
  return jsonOut({ success: true, pendingEmail: own,
    message: 'A new link is on its way to ' + own + '. Open it and your email is confirmed — any link we sent '
           + 'before this one no longer works.' });
}

/* SIGNING IN WITH GOOGLE WHAT THE BROWSER SENDS IS A CLAIM, NOT A FACT. § */
function postGoogleLogin_(body, action, began) {
  const clientId = S(config().google_client_id);
  /* NOT CONFIGURED IS NOT OPEN. With no client id there is nothing to check `aud` against, and
     a check that cannot run must refuse rather than wave things through. */
  if (!clientId) return jsonOut({ success: false, error: 'Google sign-in is not set up yet.' });

  const cred = S(body.credential);
  if (!cred) return jsonOut({ success: false, error: 'No Google token in that request.' });

  let info = null;
  try {
    const res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(cred),
      { muteHttpExceptions: true });
    if (res.getResponseCode() === 200) info = JSON.parse(res.getContentText());
  } catch (err) {
    return jsonOut({ success: false, error: 'Could not reach Google to check that sign-in.' });
  }
  /* A REFUSAL FROM GOOGLE IS A REFUSAL HERE. Expired, tampered with, or never signed by them —
     tokeninfo answers with a non-200 and there is nothing further to consider. */
  if (!info || !S(info.sub)) return jsonOut({ success: false, error: 'That Google sign-in was not valid.' });
  if (S(info.aud) !== clientId) return jsonOut({ success: false, error: 'That Google sign-in was for a different site.' });
  if (String(info.email_verified) !== 'true') {
    return jsonOut({ success: false, error: 'That Google address is not verified.' });
  }

  const email = S(info.email).toLowerCase();
  if (!email) return jsonOut({ success: false, error: 'That Google account has no address on it.' });

  const t = read(TAB.people);
  /* MATCHED ON THE ADDRESS AND NOTHING ELSE. Not on the name Google carries: people change
     their display name, and a name match would let a stranger called Sasha Ivanov in. */
  /* THE SAME READING OF THE ADDRESS AS `verifyLogin`, and the same refusal of two rows on one: § */
  const googleHits = t.rows.filter(x => norm(x.email) === norm(email));
  if (googleHits.length > 1) {
    return jsonOut({ success: false,
      error: 'That email address is on more than one account — ask us to sort it out.' });
  }
  const r = googleHits[0] || null;
  if (!r) {
    return jsonOut({ success: false,
      error: 'No @family. account uses that Google address. Ask an admin to add it to your profile.' });
  }
  /* ---------- SIGNING IN WITH GOOGLE IS THE CONFIRMATION, AND THE TAKING BACK § */
  const tookBack = addressPending_(r);
  let kidsHeld = 0, moveDropped = '';
  if (tookBack) {
    kidsHeld = authTakeBack_(t, r);
    authSetPin_(t, r, '');
    authClearThrottle_(t, r);
    authResetDrop_(r);
    authEndSession_(t, r);
    /* A CHANGE OF ADDRESS ONE OF THOSE SESSIONS ASKED FOR GOES WITH THEM — `authResetTake_`'s note. */
    moveDropped = S((authMoveGet_(r) || {}).to);
    authMoveDrop_(r);
  }
  logEvent({ jobId: '', actor: personDisplayName(r), role: toAppRole(mainRole(r)),
             action: ACT.SAY, message: 'signed in with Google' });
  return loginReplyFor_(r, authNewSession_(t, r), tookBack ? {
    pinCleared: true, childrenHeld: kidsHeld, moveDropped: moveDropped,
    message: 'Signed in with Google, and that has confirmed your email. The account was made with a PIN '
           + 'before anybody had confirmed the address, so that PIN no longer works and anyone else signed '
           + 'in to it has been signed out. Sign in with Google from now on — or use "Forgotten your PIN?" '
           + 'and we will email you a new PIN.'
           + (kidsHeld ? ' ' + authHeldSaid_(kidsHeld).replace(/^Your email is confirmed now\. /, '') : '')
           + (moveDropped ? ' ' + authMoveSaid_(moveDropped) : '') } : null);
}

function postSignOut_(body, action, began) {
  /* ---------- THIS SESSION, NOT EVERY ONE THE PERSON HOLDS (docs/history/317) § */
  try { if (S(body.token)) authProps_().deleteProperty(authSessionKey_(body.token)); } catch (err) { Logger.log('auth props, best-effort (the next run tries again): ' + err); }
  /* SUCCESS EITHER WAY. An expired token reaching here means the session is already over, and
     an error would say otherwise. */
  return jsonOut({ success: true });
}

function postVerifyLogin_(body, action, began) {
  const t0 = read(TAB.people);
  /* ---------- AN E-MAIL ADDRESS AND A PIN, AND NOTHING ELSE § */
  /* A LEADING `@` IS DROPPED, because every card on the site prints a handle as `@halex_kind42`
     and that is what somebody copies. No address starts with one, so nothing else changes. */
  const mail = norm(body.email || body.name).replace(/^@+/, '');
  /* ---------- A PERSON WITH NO ADDRESS SIGNS IN WITH THEIR HANDLE § */
  /* THROUGH `handleRows_`, the one reader `forgotPin` uses too — which also lets a long first
     name be spelled out where the handle keeps nine letters of it. */
  /* AND A HANDLE SOMEBODY HAD BEFORE (342), asked only when nobody has it NOW — a current handle
     always wins, so an old one can never sign in a different person who holds it today. */
  if (mail.indexOf('@') === -1) {
    let byHandle = handleRows_(t0.rows, body.email || body.name);
    const old = byHandle.length ? [] : handleWasRows_(t0.rows, body.email || body.name);
    if (old.length) byHandle = old;
    if (byHandle.length === 1) return signInRow_(t0, byHandle[0], body, 'handle',
      old.length ? handleWasEntry_(byHandle[0], body.email || body.name) : '');
    if (byHandle.length > 1) {
      return jsonOut({ success: false,
        error: 'That handle is on more than one account — ask us to sort it out.' });
    }
    return jsonOut({ success: false, why: 'not-an-email',
      /* NO EXAMPLE HANDLE (342): § */
      error: 'Sign in with the email on your account — or your handle, as it is on your card.' });
  }
  const hits = t0.rows.filter(x => norm(x.email) === mail);
  if (hits.length > 1) {
    return jsonOut({ success: false,
      error: 'That email address is on more than one account — ask us to sort it out.' });
  }
  const r = hits[0] || null;
  if (!r) return jsonOut({ success: false, why: 'no-such-email',
    error: 'No account has that email address.' });
  return signInRow_(t0, r, body);
}

/* THE EMAIL `postForgotPin_` sends: to the account's own address with a sign-in link, or to the owner to pass on. */
function forgotPinMail_(own, tos, r, byHandle, handleSaid, fresh, linkKey) {
  return own
    ? { to: own, name: BRAND_NAME,
        subject: 'Your new ' + BRAND_NAME + ' PIN',
        body: 'Somebody asked for a new PIN on your ' + BRAND_NAME + ' account'
            + (byHandle && handleSaid ? ', by your handle (' + handleSaid + ')' : '') + '.\n\n'
            + 'Your new PIN is ' + fresh + '\n\n'
            + 'Sign in with ' + (handleSaid ? 'your handle, ' + handleSaid + ', or your email' : 'your email')
            + ' and this PIN. It works for a day; your old PIN keeps working too until you use '
            + 'this one. Change it under Settings → Signing in.\n\n'
            + 'Or open this link to sign in with it straight away — it works even if wrong PINs have '
            + 'locked the account:\n\n' + SITE_URL + '?signin=' + linkKey + '\n\n'
            + 'If this was not you, do nothing — your PIN has not changed, and whoever asked '
            + 'cannot read this email.' }
    : { to: tos.join(','), name: BRAND_NAME,
        subject: 'A forgotten PIN: ' + (handleSaid || S(r.first_name) || 'a learner'),
        body: (S(r.first_name) || 'A learner') + (handleSaid ? ' (' + handleSaid + ')' : '')
            + ' has no email of their own and asked for a new PIN.\n\nThe new PIN is ' + fresh + '\n\n'
            + 'Pass it on to them. They sign in with their handle and this PIN; it works for a day, and their '
            + 'old PIN keeps working until they use this one. "New PIN" on their card in the people column '
            + 'gives a fresh one at once.\n\nOr open this link on their device to sign them in as '
            + (handleSaid || S(r.first_name) || 'them') + ' straight away:\n\n' + SITE_URL + '?signin=' + linkKey + '\n\n'
            + 'If they did not ask, do nothing — nothing has changed.' };
}

/* a forgotten PIN -------------------------------------------------------------------------- ASKED FOR AS § */
function postForgotPin_(body, action, began) {
  const asked = norm(body.who).replace(/^@+/, '');   // `@halex_kind42` as cards print it — see verifyLogin
  if (!asked) return jsonOut({ error: 'Type your email address or your handle first.' });

  const tPeople = read(TAB.people);
  /* ---------- THE SAME TWO DOORS AS SIGNING IN, READ THE SAME WAY § */
  const byHandle = asked.indexOf('@') === -1;
  let hits = byHandle ? handleRows_(tPeople.rows, body.who)
                      : tPeople.rows.filter(x => norm(x.email) === asked);
  /* AN OLD HANDLE TOO, AND ONLY WHEN NOBODY HAS IT NOW (342) — `verifyLogin`'s rule, for the child who
     typed the handle on their slip. */
  if (byHandle && !hits.length) hits = handleWasRows_(tPeople.rows, body.who);
  if (!hits.length) {
    return jsonOut(byHandle
      ? { error: 'No account has that handle. It is on your card once you are in — ask a parent or your tutor for it.', why: 'not-an-email' }
      : { error: 'No account has that email address.', why: 'no-such-email' });
  }
  if (hits.length > 1) {
    return jsonOut({ error: 'That ' + (byHandle ? 'handle' : 'email address')
                          + ' is on more than one account — ask us to sort it out.' });
  }
  const r = hits[0];

  /* ---------- WHERE IT GOES (400): THE ACCOUNT'S OWN ADDRESS, OR WITH NONE THE OWNER'S, never a parent's ----------
     The owner, 24 Oct: a child's forgotten PIN goes to the business (`owner_email`, else the first admin). */
  const own = S(r.email);
  const ownerTo = own ? '' : ownerEmail_();
  const tos = own ? [own] : ownerTo ? [ownerTo] : [];
  if (!tos.length) {
    return jsonOut({ why: 'no-inbox',
      error: 'We have no email to send a new PIN to. Ask your tutor — they can give you one straight away.' });
  }
  const where = own ? 'your inbox' : BRAND_NAME + ', who will pass it on to you';

  /* ONE A QUARTER OF AN HOUR. Eight presses were eight emails, and the daily mail quota they spend
     is the same one every booking notice is sent from. */
  const was = authResetGet_(r);
  const since = was ? Date.now() - N(was.at) : Infinity;
  if (since < AUTH.RESET_GAP_MINS * 60000) {
    const mins = Math.max(1, Math.ceil((AUTH.RESET_GAP_MINS * 60000 - since) / 60000));
    return jsonOut({ success: true, why: 'already-sent',
      message: 'A new PIN went to ' + where + ' a few minutes ago — look there, and in spam. You can '
             + 'ask again in ' + mins + (mins === 1 ? ' minute.' : ' minutes.') });
  }
  /* NO QUOTA, NO CHANGE. Asked first, so a request that cannot be sent says so rather than storing
     a PIN nobody will ever read. */
  let quota = 1;
  try { quota = MailApp.getRemainingDailyQuota(); } catch (err) { quota = 1; }
  const cannot = { why: 'no-mail', error: 'We could not send the email just now, so nothing has changed. '
                 + 'Try again later, or ask your tutor for a new PIN.' };
  if (quota < tos.length) return jsonOut(cannot);

  /* THE SAME PIN AGAIN if one is still waiting, so a grown-up holding two emails holds two copies of one PIN rather than a dead one and a live one — unless wrong § */
  const fresh = (was && !was.dead) ? S(was.pin) : authFreshPin_();
  /* ---------- AND TO THE ACCOUNT'S OWN ADDRESS, A LINK BESIDE IT THAT NO WRONG GUESS CAN USE UP § */
  /* A CHILD'S LINK TOO (owner, 12 Nov): it goes only to the business, which holds the PIN already. */
  const linkKey = (was && S(was.key)) ? S(was.key)
    : 'R' + Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  const handleSaid = S(r.handle) ? '@' + S(r.handle) : '';
  /* NOT `notify`, which looks the person up again by name — the row is already in hand, and a
     second lookup on a name is a second chance to send somebody's PIN to somebody else. */
  try {
    mailOut_(forgotPinMail_(own, tos, r, byHandle, handleSaid, fresh, linkKey));
  } catch (err) { return jsonOut(cannot); }

  /* `to` IS THE ACCOUNT'S OWN ADDRESS WHEN THAT IS WHERE IT WENT — typing this PIN back is then proof of that inbox, and a PENDING row is confirmed by it § */
  if (!authResetPut_(r, { pin: fresh, at: Date.now(), until: Date.now() + AUTH.RESET_HOURS * 36e5,
                          misses: (was && !was.dead) ? N(was.misses) : 0, to: own ? norm(own) : '',
                          key: linkKey, via: own ? '' : norm(ownerTo) })) {
    return jsonOut(cannot);
  }
  return jsonOut({ success: true,
    message: 'A new PIN is on its way to ' + where + '. Your old PIN still works until you use the new '
           + 'one. If nothing arrives, ask your tutor.' });
}

/* ---------- THE SIGN-IN LINK IN A FORGOTTEN-PIN MAIL § */
function postPinLink_(body, action, began) {
  const hit = authResetFind_(body.key);
  const gone = { success: false, why: 'expired',
    error: 'That sign-in link has been used, or has expired. Use "Forgotten your PIN?" for a new one.' };
  if (!hit) return jsonOut(gone);
  const t = read(TAB.people);
  const r = t.rows.find(x => S(x.person_id || personDisplayName(x)) === hit.owner);
  /* OWN ADDRESS STILL THE ROW'S, OR (NO EMAIL) THE BUSINESS ADDRESS IT WENT TO STILL THE BUSINESS'S. */
  const ownOk = !!r && S(hit.held.to) && norm(hit.held.to) === norm(r.email);
  const viaOk = !!r && !S(r.email) && S(hit.held.via) && norm(hit.held.via) === norm(ownerEmail_());
  if (!ownOk && !viaOk) return jsonOut(gone);
  /* TAKEN BEFORE A ROW WITH NO ID IS GIVEN ONE — `signInRow_`'s rule for a session — because the record it drops is keyed by what the row is called NOW, and after § */
  const took = authResetTake_(t, r, hit.held);
  if (!S(r.person_id)) {
    const id = 'P' + Date.now() + '-' + r._row;
    if (!setCell(t, r, 'person_id', id)) return jsonOut({ success: false, why: 'server',
      error: 'Your PIN is the one in that email now, but this account has no id and one could not be written — ask us.' });
  }
  const said = authHeldSaid_(N(took.childrenHeld));
  logEvent({ jobId: '', actor: personDisplayName(r), role: toAppRole(mainRole(r)),
             action: ACT.SAY, message: 'signed in with the link in a forgotten-PIN email' });
  try {
    return loginReplyFor_(r, authNewSession_(t, r), {
      pinLink: true, childrenHeld: N(took.childrenHeld), moveDropped: S(took.moveDropped),
      message: 'Signed in. The PIN in that email is your PIN now, and anyone else signed in to this account '
             + 'has been signed out.' + (said ? ' ' + said : '')
             + (took.moveDropped ? ' ' + authMoveSaid_(took.moveDropped) : '') });
  } catch (err) {
    return jsonOut({ success: false, why: 'server',
      error: 'That link was right, but signing in failed on our side: ' + String(err && err.message || err) });
  }
}

/* changing a PIN -------------------------------------------------------------------- Deliberately NOT a profile field. § */
/* ---------- THE TUTOR AGREEMENT: A TICK THAT STAYS TICKED § */
function postSignAgreement_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'We could not find your account.' });
  if (!hasRole(me, 'tutor') && !hasRole(me, 'admin'))
    return jsonOut({ error: 'The tutor agreement is for tutors.' });
  const version = S(body.version).slice(0, 40);
  if (!version) return jsonOut({ error: 'Which version of the agreement was this?' });
  /* ALREADY SIGNED IS AN ANSWER, NOT A FAILURE — for THIS version. New terms (405) are a new tick, the old record replaced. */
  if (S(me.agreement_signed_at) && S(me.agreement_version) === version)
    return jsonOut({ success: true, already: true,
                     signedAt: S(me.agreement_signed_at), version: S(me.agreement_version) });
  const t = read(TAB.people);
  /* BOTH COLUMNS BEFORE EITHER IS WRITTEN. § */
  const lacking = ['agreement_signed_at', 'agreement_version'].filter(c => t.headers.indexOf(c) === -1);
  if (lacking.length)
    return jsonOut({ error: 'The sheet has no column for: ' + lacking.join(', ') + '. Run ?setup=1 — nothing was saved.' });
  const row = t.rows.find(x => x._row === me._row) || me;
  const at = fmtDateTime(new Date());
  setCells(t, row, { agreement_signed_at: at, agreement_version: version });
  return jsonOut({ success: true, signedAt: at, version: version });
}

/* ---------- A NEW PIN FOR SOMEBODY ELSE: THEIR PARENT, OR AN ADMIN § */
function postResetPin_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  const t = read(TAB.people);
  const want = S(body.targetId);
  const kid = want ? t.rows.find(x => S(x.person_id) === want) : null;
  if (!kid) return jsonOut({ error: 'We could not find that account.' });
  if (want === S(me.person_id)) {
    return jsonOut({ error: 'Your own PIN is under Settings → Signing in.' });
  }
  const mine = acceptedChildren(S(me.person_id)).some(c => S(c.person_id) === want);
  if (!hasRole(me, 'admin') && !mine) {
    return jsonOut({ error: 'Only their parent or an admin can give them a new PIN.' });
  }
  /* ---------- A PARENT WHOSE OWN ADDRESS NOBODY HAS PROVED GIVES NOBODY A PIN § */
  if (!hasRole(me, 'admin') && addressPending_(me)) {
    return jsonOut(confirmFirst_(me, 'you can give ' + (S(kid.first_name) || 'them') + ' a new PIN'));
  }
  if (hasRole(kid, 'admin')) return jsonOut({ error: 'An admin changes their own PIN.' });
  if (t.headers.indexOf('pin') === -1 || t.headers.indexOf('handle') === -1) {
    return jsonOut({ error: 'The sheet has no pin or handle column. Run ?setup=1 — nothing was changed.' });
  }
  let handle = S(kid.handle);
  if (!handle) {
    handle = handleMake_(kid);
    if (!handle || !setCell(t, kid, 'handle', handle)) {
      return jsonOut({ error: 'They have no handle and one could not be made — nothing was changed.' });
    }
  }
  const fresh = authFreshPin_();
  authSetPin_(t, kid, fresh);
  /* The guesses were at the OLD PIN — a reset that left the lock on would hand a locked-out child
     a PIN they still cannot use (181). */
  authClearThrottle_(t, kid);
  authResetDrop_(kid);
  authEndSession_(t, kid);
  /* ---------- AND THE CHILD'S `verified` IS NOT TOUCHED § */
  clearCache();
  notify(personDisplayName(kid), 'Your PIN was changed',
    'The PIN on your ' + BRAND_NAME + ' account was just changed by ' + personDisplayName(me)
    + '.\n\nIf you did not ask for that, reply to this message.', 'security');
  return jsonOut({ success: true, name: nameFor_(kid), first: S(kid.first_name),
                   handle: handle, pin: fresh });
}

function postChangePin_(body, action, began) {
  const r = findPerson(S(body.name), S(body.personId));
  if (!r) return jsonOut({ error: 'Not signed in.' });

  const now = S(body.currentPin), next = S(body.newPin);

  /* ---------- YOUR OWN PIN, AND NOBODY ELSE'S § */
  const tPin = read(TAB.people);
  if (!authCheckPin_(tPin, r, now)) {
    return jsonOut({ error: 'That is not your current PIN.' });
  }
  if (!/^[0-9]{4}$/.test(next)) {
    return jsonOut({ error: 'A PIN is 4 numbers.' });
  }
  if (next === now) {
    return jsonOut({ error: 'That is the PIN you already have.' });
  }
  /* The obvious ones, refused — `pinWeak_`, the one rule `register` and `makeChild` ask too. Not
     security theatre: a PIN of 1234 on an account holding a child's address is worth one
     sentence of friction. */
  if (pinWeak_(next)) {
    return jsonOut({ error: 'Pick something less guessable than that.' });
  }

  const t = read(TAB.people);
  const row = t.rows.find(x => x._row === r._row);
  authSetPin_(t, row, next);
  /* The guesses were at the OLD PIN, so they say nothing about this one — and an admin
     resetting a locked-out family's PIN would otherwise hand them a PIN they still
     cannot use. See `authClearThrottle_`. */
  authClearThrottle_(t, row);
  /* AND A PIN STILL WAITING IN SOMEBODY'S INBOX STOPS WORKING: whoever chose this one has just
     said what the PIN is. See `authResetUse_`. */
  authResetDrop_(row);
  /* ---------- CHANGING A PIN ENDS EVERY OTHER SESSION § */
  authEndSession_(t, row);
  clearCache();

  /* Tell them it changed. If it was not them, this is how they find out — and an email nobody
     expected is the only warning an account theft ever gives. */
  notify(personDisplayName(r), 'Your PIN was changed',
    'The PIN on your @family. account was just changed.'
    + '\n\nIf that was not you, reply to this message.', 'security');

  /* ---------- AND THE PHONE THAT MADE THE CHANGE IS GIVEN A NEW SESSION § */
  const fresh = S(row.person_id) === S(body.personId) ? authNewSession_(t, row) : '';
  return jsonOut({ success: true, token: fresh });
}
