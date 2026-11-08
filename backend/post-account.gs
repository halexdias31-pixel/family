/* post-account.gs: doPost's handlers for signing up and in, PINs, and a person's own profile and small saves (1130).
   Named in `postActions_()`, dopost.gs, after its gate; § notes: docs/notes/backend/dopost.gs.md. */

/* ---------- `orderPrints` WAS HERE, AND NOTHING EVER KNOCKED ON IT § */

/* --- small per-person saves -------------------------------------------------------------- */
function postSavePerson_(body, field, value) {
  const t = read(TAB.people);
  const r = findPerson(S(body.name), S(body.personId));
  if (!r) return jsonOut({ error: 'Person not found.' });
  if (t.headers.indexOf(field) < 0) {
    /* setCell returns false for a column that does not exist and says nothing. § */
    return jsonOut({ error: 'The sheet has no `' + field + '` column. Open the site once as an admin — '
      + 'nothing was saved.' });
  }
  setCell(t, r, field, value);
  return jsonOut({ success: true });
}

/* register ------------------------------------------------------------------------------ Anyone may create a STUDENT or a CLIENT (parent) account. § */
/* ---------- WHO THE ACCOUNT IS FOR IS ASKED, AND THE ANSWER IS THE ROLE § */
/* ---------- A CHILD WITH NO EMAIL OF THEIR OWN MAKES AN ACCOUNT WITH A GROWN-UP'S § */
function postRegister_(body, action, began) {
  const first = S(body.first_name), last = S(body.last_name);
  const email = S(body.email), pin = S(body.pin);
  const grownUp = email ? '' : S(body.parent_email);
  const asParent = norm(body.who) === 'parent';
  if (!first || !last) return jsonOut({ error: 'Please give a first and last name.' });
  if (asParent && !email) {
    return jsonOut({ error: 'A parent\'s account needs your own email address — it is what you sign in with. Nothing was saved.' });
  }
  if (!email && !grownUp) {
    return jsonOut({ error: 'Please give your email address — or, with no email of your own, a grown-up\'s.' });
  }
  if ((email || grownUp).indexOf('@') < 0) return jsonOut({ error: 'Please give a real email address.' });
  if (!/^\d{4,8}$/.test(pin)) return jsonOut({ error: 'Choose a PIN of 4 to 8 digits.' });
  /* THE SAME RULE `changePin` HAS — see `pinWeak_`. A form that let you choose 0000 and then
     refused it when you tried to change it was two rules for one PIN. */
  if (pinWeak_(pin)) return jsonOut({ error: 'Pick a PIN that is harder to guess than that.' });

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
  /* WHO SENT THEM. The referral code was generated and never recorded against anybody, so the loop was open at the far end — codes went out and nothing came back. § */
  const arrivedWith = S(body.ref).toUpperCase().replace(/[^A-Z0-9]/g, '');
  let inviter = '';
  if (arrivedWith) {
    const owner = t.rows.find(x => S(x.referral_code).toUpperCase() === arrivedWith);
    if (owner) inviter = S(owner.person_id) || personDisplayName(owner);
  }

  /* BEFORE THE ROW EXISTS: a draft with the id it will have, so the template (364) can use it. */
  const regId = 'P' + Date.now();
  const regHandle = handleMake_({ person_id: regId, first_name: first, last_name: last });
  /* WITH NO ADDRESS THE HANDLE IS THE ONLY WAY IN, so an account the generator could not name
     would be an account nobody can sign in to. Said now, with nothing written. */
  if (!email && !regHandle) {
    return jsonOut({ error: 'No free handle could be made just now. Nothing was saved — try again.' });
  }
  addRow(t, Object.assign({
    /* THE ROLE THEY CHOSE — see the note over this action. § */
    person_id: regId, role: asParent ? 'client' : 'student',
    first_name: first, last_name: last,
    /* THE HANDLE IS THE TEMPLATE (364) — see `handleMake_`. */
    handle: regHandle || '',
    email, pin, credits: 0, xp: 0,
    came_from: arrivedWith,
    invited_by: inviter,
    joined_on: new Date(),
    verified: 'PENDING', verify_token: token
  /* ONLY WHEN THERE IS ONE: a key the tab has no column for is a lost write, and an account made
     with an address of its own has nothing to put here. */
  }, grownUp ? { parent_email: grownUp } : {}));

  /* Tell the person who sent them. It is the only thanks the mechanism can give, it costs
     nothing, and somebody who hears that their introduction landed makes another. */
  if (inviter) {
    const owner = t.rows.find(x => S(x.person_id) === inviter || personDisplayName(x) === inviter);
    if (owner) {
      /* A THANK-YOU, and theirs to turn off (`referrals_email`) — nothing waits on it. */
      notify(personDisplayName(owner), 'Somebody joined through you',
        full + ' has just signed up using your code. Thank you — that is genuinely how this '
        + 'grows.', 'referrals');
    }
  }
  // Sent directly rather than through notify(): notify looks the address up on the row, and
  // the point here is to prove that THIS address reaches this person.
  /* THE HANDLE IS IN IT. It was nowhere: not in this email, not in the reply, only on the
     account's own card once signed in — which a child with no address cannot reach without it. */
  const said = regHandle ? '@' + regHandle : '';
  try {
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
    try { authProps_().setProperty(key, String(Date.now())); } catch (err) {}
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
  try { authProps_().setProperty(key, String(Date.now())); } catch (err) {}
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
  try { if (S(body.token)) authProps_().deleteProperty(authSessionKey_(body.token)); } catch (err) {}
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

/* --- admin: read anyone's profile -------------------------------------------------------- */
/* ---------- YOUR OWN SETTINGS, READ FRESH § */
/* ---------- AND YOUR ROLES, WHICH WENT STALE THE SAME WAY § */
function postMyProfile_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me) return jsonOut({ error: 'We could not find your account.' });
  /* AND THE NAMES, said as the sign-in reply says them — `nameFor_` and `familyNamesOf_`. § */
  /* AND THE HANDLE, AND THE FRIENDS LIST THAT NAMES OTHERS BY THEIRS (342). § */
  return jsonOut(Object.assign({ success: true, personId: S(me.person_id), name: nameFor_(me),
                   handle: S(me.handle), friends: S(me.friends),
                   profile: profileOf_(me),
                   agreementSignedAt: S(me.agreement_signed_at),
                   agreementVersion: S(me.agreement_version),
                   role: toAppRole(mainRole(me)), roles: rolesOf(me).map(toAppRole),
                   tutorPending: tutorPending_(me), rank: rankOf(me), application: applicationOf_(me),
                   /* AND WHETHER THE ADDRESS IS PROVED YET — stale on the phone exactly as the role was: § */
                   pendingEmail: pendingEmailOf_(me) }, familyNamesOf_(me)));
}

function postGetProfile_(body, action, began) {
  const r = findPerson(body.target);
  if (!r) return jsonOut({ error: 'Person not found.' });
  const appRole = toAppRole(mainRole(r));
  const out = profileOf_(r);
  return jsonOut({ success: true, profile: out, role: appRole, name: personDisplayName(r),
                   personId: S(r.person_id),
                   // So the editor can draw the figure and say what it's wearing.
                   avatarItems: appRole === 'kid' ? avatarUnlocks(r) : [] });
}

/* --- profile writes ---------------------------------------------------------------------- */
function postUpdateProfile_(body, action, began) {
  const asker = S(body.name);
  /* The target must be stated. § */
  const target = S(body.targetId) || S(body.target);
  if (!target) return jsonOut({ error: 'No profile named for that change.' });
  // If a NAME was used and more than one row answers to it, refuse rather than guess.
  if (!S(body.targetId) && peopleNamed(target).length > 1) {
    return jsonOut({ error: 'More than one account answers to "' + target +
      '". Nothing was changed — give them different names, or reload so the site can use ids.' });
  }
  const t = read(TAB.people);
  const r = findPerson(target);
  if (!r) return jsonOut({ error: 'Profile not found.' });
  /* ---------- WHO IS EDITING WHOM IS A QUESTION ABOUT TWO ROWS, ANSWERED BY THEIR IDS § */
  const me = findPerson('', S(body.personId));
  const iAmAdmin = !!me && rankAtLeast_(me, 'admin');
  const adminEditing = !me || S(r.person_id) !== S(me.person_id);
  if (adminEditing && !iAmAdmin) {
    return jsonOut({ error: 'Not authorised to edit that profile.' });
  }
  const fields = body.fields || {};
  // An admin may additionally set the admin-only flags — that's what makes them admin-only
  // rather than merely hidden.
  const allowed = adminEditing ? PROFILE_EDITABLE.concat(PROFILE_READONLY) : PROFILE_EDITABLE;
  const has = f => t.headers.indexOf(f) !== -1;
  const sent = re => Object.keys(fields).some(f => re.test(f));
  const HOUR = /^(m|tu|w|th|f|sa|su)\d\d$/;

  /* 1. EVERY REFUSAL, BEFORE A SINGLE CELL IS TOUCHED. § */
  /* THE FORM NAMES ARE NOT THE CELLS. § */
  const availSent = sent(HOUR);
  const libSent   = sent(LIBRARY_FIELD) && LIBRARY_FIELDS.some(f => allowed.indexOf(f) !== -1);
  const qualsSent = sent(QUAL_FIELD) && QUAL_FIELDS.some(f => allowed.indexOf(f) !== -1);
  const phoneSent = sent(PHONE_FIELD) && allowed.indexOf('phone') !== -1;
  const dobSent   = sent(DOB_FIELD) && allowed.indexOf('date_of_birth') !== -1;
  const photosSent = sent(PHOTO_FIELD) && PHOTO_FIELDS.some(f => allowed.indexOf(f) !== -1);
  const jobsSent = sent(JOB_FIELD) && JOB_FIELDS.some(f => allowed.indexOf(f) !== -1);
  /* THE VENUES ARE ON ANOTHER TAB — `venuesWrites_` in core.gs says why there is no column here. */
  const venuesSent = fields.venues_ok !== undefined && allowed.indexOf('venues_ok') !== -1;
  const venueTab = venuesSent ? read(TAB.venues) : null;
  if (venueTab && venueTab.headers.indexOf('tutors_happy_here') === -1) {
    return jsonOut({ error: 'The venues tab has no column for: tutors_happy_here. '
      + 'Open the site once as an admin to add it — nothing was saved.' });
  }
  const packedMissing = [availSent && 'availability', phoneSent && 'phone',
                         dobSent && 'date_of_birth', photosSent && 'photos', jobsSent && 'jobs']
    .filter(c => c && !has(c));
  if (packedMissing.length) {
    return jsonOut({ error: 'The sheet has no column for: ' + packedMissing.join(', ')
      + '. Open the site once as an admin to add it — nothing was saved.' });
  }
  /* QUALIFICATIONS AND LIBRARY CARDS ARE ROWS ON TABS OF THEIR OWN now (see `SCHEMA.people`), so the question is whether the TAB is there — a tab `ensureSchema` § */
  const tabMissing = [qualsSent && !read(TAB.qualifications).sheet && 'qualifications',
                      libSent && !read(TAB.library_cards).sheet && 'library_cards'].filter(Boolean);
  if (tabMissing.length) {
    return jsonOut({ error: 'The spreadsheet has no tab called: ' + tabMissing.join(', ')
      + '. Open the site once as an admin to make it — nothing was saved.' });
  }
  const valueNo = profileValueRefusal_(fields, allowed, dobSent, photosSent);
  if (valueNo) return jsonOut({ error: valueNo });
  const wanted = Object.keys(fields)
    .filter(f => !HOUR.test(f) && !LIBRARY_FIELD.test(f) && !QUAL_FIELD.test(f)
              && !PHONE_FIELD.test(f) && !DOB_FIELD.test(f) && !PHOTO_FIELD.test(f) && !JOB_FIELD.test(f)
              && f !== 'venues_ok' && allowed.indexOf(f) !== -1);
  /* A field with no column vanishes silently: § */
  const noColumn = wanted.filter(f => !has(f));
  if (noColumn.length) {
    return jsonOut({ error: 'The sheet has no column for: ' + noColumn.join(', ')
      + '. Open the site once as an admin to add it — nothing was saved.' });
  }
  /* ---------- WHAT A TUTOR CHARGES MOVES ONCE A MONTH, ALL FOUR FIELDS TOGETHER § */
  const priceAsked = {};
  wanted.forEach(f => { priceAsked[f] = fields[f]; });
  /* A REFUSED GROUP IS LEFT OUT AND NAMED, AND THE REST IS SAVED (620): the business's cut once kept a tutor's class size off the sheet. */
  const refused = [];
  const leaveOut = (list, why) => {
    list.forEach(f => { const i = wanted.indexOf(f); if (i !== -1) wanted.splice(i, 1); delete priceAsked[f]; });
    refused.push([list, S(why).replace(/\s*Nothing was saved\.$/, '')]);
  };
  const priceNo = pricingRefusal_(r, priceAsked, iAmAdmin);
  if (priceNo) leaveOut(PRICING_FIELDS.filter(f => wanted.indexOf(f) !== -1), priceNo);
  /* ---------- AND THE BUSINESS'S CUT OF AN EXTRA SEAT, WHICH IS AN ADMIN'S (docs/history/345) § */
  const cutNo = seatCutRefusal_(r, priceAsked, iAmAdmin);
  if (cutNo) leaveOut([SEAT_CUT_FIELD], cutNo);
  const elseSent = availSent || photosSent || jobsSent || phoneSent || dobSent || qualsSent || libSent || !!venueTab;
  if (refused.length && !wanted.length && !elseSent) {
    return jsonOut({ error: refused.map(p => p[1]).join(' ') + ' Nothing was saved.' });
  }
  const priceMoved = pricingMoved_(r, priceAsked).length > 0;
  /* THE STAMP'S COLUMN IS CHECKED HERE NOW. § */
  if (priceMoved && !has('pricing_changed_at')) {
    return jsonOut({ error: 'The sheet has no column for: pricing_changed_at. '
      + 'Open the site once as an admin to add it — nothing was saved.' });
  }
  /* ---------- AND THE AGE RANGE, WHICH IS NOT THE QUOTE AND HAS NO CLOCK § */
  const ageNo = ageRefusal_(r, priceAsked);
  if (ageNo) return jsonOut({ error: ageNo });
  /* AND HOW LONG A SESSION IS — writable since docs/history/330, under the same two rules as the ages
     (`hoursRefusal_` in people.gs), asked of the same wanted-only object before anything is written. */
  const hoursNo = hoursRefusal_(r, priceAsked);
  if (hoursNo) return jsonOut({ error: hoursNo });
  /* ---------- AN ADDRESS IS WHAT SIGNS IN TO THIS ACCOUNT § */
  if (wanted.indexOf('email') !== -1 && fields.email !== undefined) {
    if (!norm(fields.email) && norm(r.email)) {
      return jsonOut({ error: 'Your email address is what you sign in with, so it cannot be left empty.' });
    }
    const mailNo = emailRefusal_(fields.email, r);
    if (mailNo) return jsonOut({ error: mailNo });
  }
  /* ---------- AND A NEW ADDRESS IS PROVED BEFORE IT IS TRUSTED § */
  const mail = profileMailPlan_(r, wanted, fields);
  if (mail.fail) return mail.fail;
  const mailPlan = mail.plan, mailKey = mail.key;

  /* 2. EVERY WRITE, COLLECTED INTO ONE OBJECT, THEN ONE CALL. § */
  const put = {};
  if (availSent) put.availability = availGridIn(fields);
  if (photosSent) put.photos = photosIn(fields);
  if (jobsSent) put.jobs = jobsIn(fields);
  if (phoneSent) put.phone = phoneIn(fields);
  if (dobSent) put.date_of_birth = dobIn(fields);
  wanted.forEach(f => { put[f] = fields[f]; });
  /* THE ADDRESS, BY THE PLAN ABOVE: written only when it is the same one or a PENDING row's correction. */
  if (mailPlan === 'keep' || mailPlan === 'waiting' || mailPlan === 'move') delete put.email;
  if (mailPlan === 'correct') put.verify_token = mailKey;
  /* THE STAMP GOES ON WITH THE WRITE, NOT BEFORE IT: § */
  if (pricingChanged_(r, priceAsked).length) put.pricing_changed_at = new Date();
  const renamed = fields.first_name !== undefined || fields.last_name !== undefined;
  let full = '';
  if (renamed) {
    full = (S(fields.first_name !== undefined ? fields.first_name : r.first_name) + ' ' +
            S(fields.last_name  !== undefined ? fields.last_name  : r.last_name)).trim();
    /* ---------- AND THE NAME THEY HAD GOES ONTO `name_was` § */
    const before = personDisplayName(r);
    if (t.headers.indexOf('name_was') !== -1 && key(before) && key(before) !== key(full)) {
      put.name_was = nameWasWith_(r.name_was, before);
    }
  }

  /* 3. ONE WRITE. `setCells` is `setCell` for a whole row: § */
  const wrote = setCells(t, r, put);
  /* AND WHAT WAITS BESIDE THE ROW. § */
  profileMailAfter_(r, mail);
  let rowsMoved = 0;
  if (qualsSent) rowsMoved += writeOwnRows_(TAB.qualifications, S(r.person_id), qualsIn(fields), QUAL_COLS).changed;
  if (libSent) rowsMoved += writeOwnRows_(TAB.library_cards, S(r.person_id), libCardsIn(fields), LIB_COLS).changed;
  /* AND THE VENUES, AFTER THE ROW, so a refusal above has already stopped both. Only the venue
     cells that actually change are written. */
  if (venueTab) {
    venuesWrites_(r, fields.venues_ok, venueTab.rows).forEach(w => {
      wrote.push.apply(wrote, setCells(venueTab, w.row, { tutors_happy_here: w.cell }));
    });
  }
  /* ---------- AND THE FORM'S OWN VALUES COME BACK WITH THE ANSWER § */
  /* `changed` IS HOW MANY CELLS MOVED, so the phone can skip fetching a payload nothing altered. */
  const out = { success: true, changed: wrote.length + rowsMoved, profile: adminEditing ? null : profileOf_(r) };
  /* WHAT HAPPENED TO THE ADDRESS, IN WORDS — "Saved" over an address that has not changed yet would be
     read as the change being done. `pendingEmail` for the phone's held cards, as the sign-in reply. */
  profileMailSaid_(out, mail, r, adminEditing);
  // Only the person themselves needs their session renamed; an admin must not inherit it.
  /* AS `nameFor_` SAYS IT, of the row as it now stands — a child renaming herself is still her first
     name on her own screen (the owner, 10 Oct: *"dont show children's last name"*). */
  if (renamed) out.name = adminEditing ? '' : (nameFor_(r) || full);
  /* WHAT WAS LEFT OUT, IN WORDS, beside what was saved (620). */
  if (refused.length) {
    out.refused = refused.map(p => ({ fields: p[0], said: p[1] }));
    out.said = (out.said || 'Saved') + ' — the rest. Not saved: ' + refused.map(p => p[1]).join(' ');
  }
  return jsonOut(out);
}

/* THE VALUES THAT CAN BE WRONG IN THEMSELVES: a birthday, photographs, a face, exam dates. The words, or "". */
function profileValueRefusal_(fields, allowed, dobSent, photosSent) {
  /* A PARTIAL BIRTHDAY is `null` to `sheetDate`, so it would go off the calendar under a toast
     saying Saved. `dobRefusal_` is in `core.gs` beside `sheetDate` so something can run it. */
  if (dobSent) {
    const dobNo = dobRefusal_(fields);
    if (dobNo) return dobNo;
  }
  /* A PHOTOGRAPH THAT IS NOT A LINK is refused rather than kept or dropped — `photosRefusal_`. */
  if (photosSent) {
    const photoNo = photosRefusal_(fields);
    if (photoNo) return photoNo;
  }
  /* AND THE FACE ITSELF: § */
  if (fields.photo !== undefined && allowed.indexOf('photo') !== -1) {
    const faceNo = photoRefusal_(fields.photo);
    if (faceNo) return faceNo;
  }
  /* AN EXAM DATE IS A COLUMN, so `wanted` finds it; what a column check cannot say is whether the VALUE is a date. § */
  const badDate = DATE_COLS.map(f => fields[f] === undefined ? ''
                    : isoRefusal_(fields[f], f.replace(/_/g, ' '))).filter(Boolean)[0];
  if (badDate) return badDate;
  return '';
}

/* WHAT HAPPENS TO THE ADDRESS, and its link sent first — `{ fail }` when the mail could not go. */
function profileMailPlan_(r, wanted, fields) {
  const mailWant = (wanted.indexOf('email') !== -1 && fields.email !== undefined) ? S(fields.email) : '';
  const moving = authMoveGet_(r);
  const mailPlan = !mailWant ? ''
    : norm(mailWant) === norm(r.email) ? (moving ? 'keep' : 'same')
    : moving && norm(moving.to) === norm(mailWant) ? 'waiting'
    : (S(r.email) && addressPending_(r)) ? 'correct' : 'move';
  let mailKey = '';
  if (mailPlan === 'correct' || mailPlan === 'move') {
    let quota = 1;
    try { quota = MailApp.getRemainingDailyQuota(); } catch (err) { quota = 1; }
    const cannot = 'We could not email ' + mailWant + ' just now, so nothing was saved. Try again later.';
    if (quota < 1) return { fail: jsonOut({ why: 'no-mail', error: cannot }) };
    try {
      if (mailPlan === 'correct') {
        mailKey = 'V' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
        linkMail_({ first_name: r.first_name, email: mailWant, handle: r.handle }, mailKey, hasRole(r, 'client'));
      } else {
        mailKey = 'M' + Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
        moveMail_(mailWant, mailKey);
      }
    } catch (err) { return { fail: jsonOut({ why: 'no-mail', error: cannot }) }; }
  }
  return { want: mailWant, moving: moving, plan: mailPlan, key: mailKey };
}

/* AFTER THE ROW IS WRITTEN: the pending move and the resend clock, by the plan. */
function profileMailAfter_(r, mail) {
  const mailPlan = mail.plan, mailWant = mail.want, mailKey = mail.key;
  if (mailPlan === 'correct' || mailPlan === 'keep') authMoveDrop_(r);
  if (mailPlan === 'correct') authResetDrop_(r);
  if (mailPlan === 'move') {
    authMovePut_(r, { to: mailWant, key: mailKey, at: Date.now(), until: Date.now() + AUTH.MOVE_DAYS * 864e5 });
  }
  /* A LINK HAS JUST GONE, so "Send the link again" counts its quarter hour from now (`resendLink`). */
  if (mailPlan === 'correct' || mailPlan === 'move') {
    try { authProps_().setProperty('AUTH_LINK_' + S(r.person_id), String(Date.now())); } catch (err) {}
  }
}

/* WHAT HAPPENED TO THE ADDRESS, in words on the answer. */
function profileMailSaid_(out, mail, r, adminEditing) {
  const mailPlan = mail.plan, mailWant = mail.want, moving = mail.moving;
  if (mailPlan === 'move') {
    out.movingEmail = mailWant;
    out.said = adminEditing
      ? 'Saved. Their email changes once they open the link we sent to ' + mailWant + ', signed in as '
        + 'themselves. Until then it stays ' + (S(r.email) || 'as it was') + '.'
      : 'Saved. To finish changing your email, open the link we sent to ' + mailWant
        + ' on a phone where you are signed in. Until then it stays ' + (S(r.email) || 'as it was')
        + (S(r.email) ? ' — sign in with that, or your handle.' : '.');
  } else if (mailPlan === 'correct') {
    out.pendingEmail = pendingEmailOf_(r);
    out.said = 'Saved. We have sent a new link to ' + mailWant + ' — open it to confirm '
             + (adminEditing ? 'the address.' : 'your email.');
  } else if (mailPlan === 'keep') {
    out.said = 'Saved. Your email stays ' + S(r.email) + ', and the link we sent to ' + S(moving.to)
             + ' no longer does anything.';
  }
}

function postSaveNotepad_(body, action, began) {
  return postSavePerson_(body, 'notepad', S(body.notepad));
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
  const linkKey = !own ? '' : (was && S(was.key)) ? S(was.key)
    : 'R' + Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  const handleSaid = S(r.handle) ? '@' + S(r.handle) : '';
  /* NOT `notify`, which looks the person up again by name — the row is already in hand, and a
     second lookup on a name is a second chance to send somebody's PIN to somebody else. */
  try {
    mailOut_(own
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
              + 'gives a fresh one at once.\n\nIf they did not ask, do nothing — nothing has changed.' });
  } catch (err) { return jsonOut(cannot); }

  /* `to` IS THE ACCOUNT'S OWN ADDRESS WHEN THAT IS WHERE IT WENT — typing this PIN back is then proof of that inbox, and a PENDING row is confirmed by it § */
  if (!authResetPut_(r, { pin: fresh, at: Date.now(), until: Date.now() + AUTH.RESET_HOURS * 36e5,
                          misses: (was && !was.dead) ? N(was.misses) : 0, to: own ? norm(own) : '',
                          key: linkKey })) {
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
  if (!r || !S(hit.held.to) || norm(hit.held.to) !== norm(r.email)) return jsonOut(gone);
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
  if (!/^[0-9]{4,8}$/.test(next)) {
    return jsonOut({ error: 'A PIN is 4 to 8 numbers.' });
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

/* ---------- `redeem` WAS HERE — A PRINTED PAPER FOR A THOUSAND TICKS § */

/* `saveExam` AND `deleteExam` WERE HERE — no screen posted either; exam dates live on the profile (Settings) (431). */
function postSaveTodo_(body, action, began) {
  return postSavePerson_(body, 'todo', S(body.todo));
}

/* ---------- THE TIMETABLE, KEPT ON THE ACCOUNT § */
function postSaveTimetable_(body, action, began) {
  const raw = S(body.timetable);
  let t = null;
  try { t = JSON.parse(raw); } catch (e) { t = null; }
  if (!t || !Array.isArray(t.days) || t.days.length !== 7 || !t.days.every(Array.isArray)) {
    return jsonOut({ error: 'That is not a timetable — nothing was saved.' });
  }
  if (raw.length > 40000) return jsonOut({ error: 'That timetable is too long to keep — nothing was saved.' });
  return postSavePerson_(body, 'timetable', raw);
}

/* ---------- WHICH EMAILS YOU WANT: ONE TICK ON THE NOTIFICATIONS CARD § */
function postSetNotify_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  const kind = S(body.kind);
  const K = Object.prototype.hasOwnProperty.call(NOTIFY_KINDS, kind) ? NOTIFY_KINDS[kind] : null;
  if (!K) return jsonOut({ error: 'There is no email called "' + kind + '" to turn on or off. Nothing was changed.' });
  if (K.essential) {
    return jsonOut({ error: '"' + K.label + '" is always sent — ' + K.why + '. Nothing was changed.' });
  }
  const t = read(TAB.people);
  const want = S(body.targetId);
  let r = t.rows.find(x => S(x.person_id) === S(me.person_id)) || me;
  if (want && want !== S(me.person_id)) {
    const kid = t.rows.find(x => S(x.person_id) === want);
    if (!kid) return jsonOut({ error: 'We could not find that account.' });
    const mine = acceptedChildren(S(me.person_id)).some(c => S(c.person_id) === want);
    if (!hasRole(me, 'admin') && !mine) {
      return jsonOut({ error: 'Only their parent or an admin can choose what they are emailed. Nothing was changed.' });
    }
    if (!hasRole(me, 'admin') && addressPending_(me)) {
      return jsonOut(confirmFirst_(me, 'you can choose what ' + (S(kid.first_name) || 'they') + ' is emailed'));
    }
    if (hasRole(kid, 'admin')) return jsonOut({ error: 'An admin chooses their own emails. Nothing was changed.' });
    r = kid;
  }
  /* `notifyHow_`, THE CARD'S OWN QUESTION, so the two cannot disagree. § */
  if (!notifyHow_(r, K).length) {
    return jsonOut({ error: '"' + K.label + '" is not an email that reaches ' + (r === me || S(r.person_id) === S(me.person_id) ? 'you' : 'them')
                          + '. Nothing was changed.' });
  }
  if (t.headers.indexOf(K.col) === -1) {
    return jsonOut({ error: 'The sheet has no `' + K.col + '` column. Open the site once as an admin — nothing was saved.' });
  }
  const on = TRUE_(body.on);
  /* WRITTEN ONLY WHEN IT CHANGES WHAT THE CELL MEANS: a `yes` typed by hand is already on, and turning
     it on again is not a reason to rewrite somebody's cell or throw the payload cache away. */
  const changed = ON_(r[K.col]) !== on;
  if (changed && !setCell(t, r, K.col, on ? '' : 'no')) {
    return jsonOut({ error: 'That could not be written to the sheet — nothing was saved.' });
  }
  if (changed) clearCache();
  return jsonOut({ success: true, kind: kind, on: on, changed: changed ? 1 : 0,
                   personId: S(r.person_id), notify: notifyOf_(r) });
}

/* a student changes their avatar ------------------------------------------------------- Every equipped item is re-checked here. § */
/* a person changes their own profile picture -------------------------------------------- ASKED FOR AS § */
function postSavePhoto_(body, action, began) {
  const t = read(TAB.people);
  const r = findPerson(S(body.name), S(body.personId));
  if (!r) return jsonOut({ error: 'Person not found.' });
  if (t.headers.indexOf('photo') < 0) {
    return jsonOut({ error: 'The people tab has no `photo` column. Open the site once as an admin — nothing was saved.' });
  }
  if (body.remove === true || norm(body.remove) === 'true') {
    setCell(t, r, 'photo', '');
    return jsonOut({ success: true, photo: '' });
  }
  /* ---------- OR ONE OF THE ELEVEN, CHOSEN IN THE GRID UNDER THE TILES § */
  if (body.choice !== undefined && S(body.choice).trim() !== '') {
    const choice = photoChoice_(body.choice);
    if (!choice) return jsonOut({ error: 'That is not one of the pictures. Choose one from the grid, or a photo from your phone.' });
    setCell(t, r, 'photo', choice);
    return jsonOut(Object.assign({ success: true, photo: choice }, faceFig_(r)));
  }
  const raw = S(body.data).trim();
  if (!rankAtLeast_(r, 'client')) return jsonOut({ error: CHILD_NO_UPLOAD + ' Choose one of the pictures instead.' });
  if (!/^data:image\/[\w.+-]+;base64,/i.test(raw)) {
    return jsonOut({ error: 'That is not a picture. Choose a photo from your phone.' });
  }
  /* A CAP, IN DECODED BYTES, for a body the phone has already redrawn at 600px — about 60KB. § */
  const bytes = Math.floor(raw.split(',')[1].length * 3 / 4);
  if (bytes > 5 * 1048576) return jsonOut({ error: 'That picture is too big. Try a smaller one.' });
  const folder = getPhotoFolder_();
  if (!folder) {
    return jsonOut({ error: 'No folder for pictures. Add a row to the config tab: key '
      + '`photos_folder` (or `posts_folder`), value the id from the folder URL.' });
  }
  let url = '';
  try {
    url = driveKeep_(folder, raw, 'photo-' + (S(r.person_id) || 'person') + '-' + new Date().getTime());
  } catch (err) {
    return jsonOut({ error: 'Could not save the picture. ' + driveTrouble_(err, hasRole(r, 'admin')) });
  }
  setCell(t, r, 'photo', url);
  return jsonOut({ success: true, photo: url });
}

/* ---------- A TUTOR'S INTRO VIDEO, IN 4 MB PARTS (8 Nov): Apps Script cannot hold 100 MB, so each part goes on to a Drive resumable upload. */
/* The last part shares the file view-by-link and writes its id on the row; 4 MB is a multiple of Drive's 256 KB step. */
function videoFolder_() { return propFolder_(VIDEO_FOLDER_PROP, VIDEO_FOLDER_NAME); }
function propFolder_(prop, name) {
  const props = PropertiesService.getScriptProperties();
  const id = S(props.getProperty(prop));
  if (id) { try { const f = DriveApp.getFolderById(id); if (f && !(f.isTrashed && f.isTrashed())) return f; } catch (err) { /* made again below */ } }
  const f = DriveApp.createFolder(name);
  props.setProperty(prop, f.getId());
  return f;
}
/* A TUTOR'S EXTRA PHOTO, UPLOADED (8 Nov): one JPEG the phone has redrawn at 1200px; the link goes back to the box and Save keeps it. */
function postPhotoFile_(body, action, began) {
  const r = findPerson(S(body.name), S(body.personId));
  if (!r) return jsonOut({ error: 'Person not found.' });
  if (!(hasRole(r, 'tutor') || hasRole(r, 'admin'))) return jsonOut({ error: 'Only a tutor has extra photos.' });
  const raw = S(body.data).trim();
  if (!/^data:image\/[\w.+-]+;base64,/i.test(raw)) return jsonOut({ error: 'That is not a picture. Choose a photo from your phone.' });
  if (Math.floor(raw.split(',')[1].length * 3 / 4) > PHOTO_FILE_MAX_BYTES) return jsonOut({ error: 'That picture is too big. Try a smaller one.' });
  try {
    const url = driveKeep_(propFolder_(PHOTO_FOLDER_PROP, PHOTO_FOLDER_NAME), raw, 'photo-' + (S(r.person_id) || 'tutor') + '-' + Date.now());
    return jsonOut({ success: true, url });
  } catch (err) {
    return jsonOut({ error: 'Could not save the photo. ' + driveTrouble_(err, hasRole(r, 'admin')) });
  }
}
function postVideoPart_(body, action, began) {
  const t = read(TAB.people);
  const r = findPerson(S(body.name), S(body.personId));
  if (!r) return jsonOut({ error: 'Person not found.' });
  if (t.headers.indexOf('video_file') < 0) {
    return jsonOut({ error: 'The people tab has no `video_file` column. Open the site once as an admin — nothing was saved.' });
  }
  if (!(hasRole(r, 'tutor') || hasRole(r, 'admin'))) return jsonOut({ error: 'Only a tutor has an intro video.' });
  const old = S(r.video_file);
  const drop = () => { if (old) { try { DriveApp.getFileById(old).setTrashed(true); } catch (err) { /* already gone */ } } };
  if (body.remove === true || norm(body.remove) === 'true') { drop(); setCell(t, r, 'video_file', ''); return jsonOut({ success: true, videoFile: '' }); }
  const size = Math.floor(N(body.size)), part = Math.floor(N(body.part)), parts = Math.floor(N(body.parts));
  const mime = S(body.mime) || 'video/mp4';
  if (!/^video\//i.test(mime)) return jsonOut({ error: 'That is not a video. Choose a video from your phone.' });
  if (!(size > 0) || size > VIDEO_MAX_BYTES) return jsonOut({ error: 'A video can be 100 MB at most — trim it to about a minute.' });
  const cache = CacheService.getScriptCache(), ck = 'vid:' + S(r.person_id) + ':' + S(body.upload).slice(0, 40);
  const token = ScriptApp.getOAuthToken();
  let st = null;
  try { st = JSON.parse(cache.get(ck) || 'null'); } catch (err) { st = null; }
  try {
    if (part === 0) {
      const res = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
        method: 'post', contentType: 'application/json; charset=UTF-8', muteHttpExceptions: true,
        headers: { Authorization: 'Bearer ' + token, 'X-Upload-Content-Type': mime, 'X-Upload-Content-Length': String(size) },
        payload: JSON.stringify({ name: 'intro-' + (S(r.person_id) || 'tutor') + '-' + Date.now(), parents: [videoFolder_().getId()] }) });
      const loc = (res.getAllHeaders() || {}).Location || (res.getAllHeaders() || {}).location;
      if (!loc) return jsonOut({ error: 'Drive would not start the upload (' + res.getResponseCode() + '). Try again.' });
      st = { url: String(loc), at: 0 };
    }
    if (!st || !st.url) return jsonOut({ error: 'That upload was lost — choose the video again.' });
    const bytes = Utilities.base64Decode(S(body.data));
    const end = st.at + bytes.length - 1;
    const res = UrlFetchApp.fetch(st.url, { method: 'put', muteHttpExceptions: true, payload: bytes,
      contentType: mime, headers: { 'Content-Range': 'bytes ' + st.at + '-' + end + '/' + size } });
    const code = res.getResponseCode();
    if (code === 308) { st.at = end + 1; cache.put(ck, JSON.stringify(st), 21600); return jsonOut({ success: true, part, parts, at: st.at }); }
    if (code !== 200 && code !== 201) return jsonOut({ error: 'Drive refused part ' + (part + 1) + ' of ' + parts + ' (' + code + '). Try again.' });
    cache.remove(ck);
    const id = S(JSON.parse(res.getContentText() || '{}').id);
    if (!id) return jsonOut({ error: 'Drive kept the video but sent no id back. Try again.' });
    DriveApp.getFileById(id).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    drop();
    setCell(t, r, 'video_file', id);
    return jsonOut({ success: true, done: true, videoFile: id });
  } catch (err) {
    return jsonOut({ error: 'Could not save the video. ' + driveTrouble_(err, hasRole(r, 'admin')) });
  }
}

/* a person says which of the three they are ------------------------------------------------- ASKED FOR AS § */
function postSetMyRoles_(body, action, began) {
  const t = read(TAB.people);
  const r = findPerson('', S(body.personId));
  if (!r) return jsonOut({ error: 'Person not found.' });
  if (t.headers.indexOf('role') < 0) {
    return jsonOut({ error: 'The people tab has no `role` column. Open the site once as an admin — nothing was saved.' });
  }
  const asked = (Array.isArray(body.roles) ? body.roles : S(body.roles).split(','))
    .map(x => norm(x)).filter(Boolean).map(x => SELF_ROLE_ALIASES[x] || ROLE_FROM_APP[x] || x);
  const stray = asked.filter(x => SELF_ROLES.indexOf(x) === -1);
  if (stray.indexOf('admin') !== -1) {
    return jsonOut({ error: 'Admin is given by @family., not chosen here. Nothing was changed.' });
  }
  if (stray.length) {
    return jsonOut({ error: 'Only Tutor, Client and Student can be chosen here — not "'
      + stray.join('", "') + '". Nothing was changed.' });
  }
  const want = SELF_ROLES.filter(x => asked.indexOf(x) !== -1);
  if (!want.length) return jsonOut({ error: 'Keep at least one ticked.' });

  const had = selfRolesOf_(r);
  const adding = want.filter(x => had.indexOf(x) === -1);
  const dropping = had.filter(x => want.indexOf(x) === -1);
  const iAmAdmin = hasRole(r, 'admin');

  /* THE CHILD'S ACCOUNT. Read as `actingRole_`, so a pending Tutor tick does not count as the
     adult role that would let Client through. */
  if (adding.indexOf('client') !== -1 && !iAmAdmin && actingRole_(r) === 'student') {
    return jsonOut({ error: 'A student account cannot make itself a client (a parent or payer). '
      + 'Ask @family. to change it. Nothing was changed.' });
  }
  const stuck = dropping.filter(x => x === 'tutor' || x === 'client')
    .map(x => ({ role: x, n: liveSeatsAs_(r, x).length })).filter(x => x.n);
  if (stuck.length) {
    const s = stuck[0];
    return jsonOut({ error: 'You are in ' + s.n + (s.n === 1 ? ' session' : ' sessions') + ' as a '
      + ROLE_LABEL[s.role].toLowerCase() + ' that ' + (s.n === 1 ? 'has' : 'have')
      + ' not finished. Leave ' + (s.n === 1 ? 'it' : 'them') + ', or ask @family. to hand '
      + (s.n === 1 ? 'it' : 'them') + ' over, first. Nothing was changed.' });
  }
  /* STAFF ONLY BY APPLICATION (400): the Tutor tick is no longer a way in — "Apply to teach" on You is. */
  if (adding.indexOf('tutor') !== -1 && !iAmAdmin) {
    return jsonOut({ error: 'Teaching here starts with an application — "Apply to teach" on You. Nothing was changed.', why: 'apply' });
  }

  if (adding.length || dropping.length) {
    /* EVERYTHING THAT IS NOT ONE OF THE THREE, KEPT, with admin first so the cell reads the way
       `mainRole` ranks it — `admin, tutor, head of boxing`, never the title alone. */
    const rest = rolesOf(r).filter(x => SELF_ROLES.indexOf(SELF_ROLE_ALIASES[x] || x) === -1);
    const admin = rest.filter(x => x === 'admin'), other = rest.filter(x => x !== 'admin');
    setCell(t, r, 'role', admin.concat(want, other).join(', '));
    /* THE TUTOR LIST IS IN THE STORED PAYLOAD — the same reason `setListed` clears it. */
    clearCache();
  }
  /* `notify` RIDES WITH THE ROLES: § */
  return jsonOut({ success: true, role: toAppRole(mainRole(r)), roles: rolesOf(r).map(toAppRole),
                   tutorPending: tutorPending_(r), rank: rankOf(r), changed: !!(adding.length || dropping.length),
                   notify: notifyOf_(r) });
}

function postSaveAvatar_(body, action, began) {
  const t = read(TAB.people);
  const r = findPerson(S(body.name), S(body.personId));
  if (!r) return jsonOut({ error: 'Person not found.' });
  /* Both columns were missing from the schema, so both writes below returned false and every
     wardrobe change was discarded in silence. Said out loud rather than pretended. */
  if (t.headers.indexOf('avatar') < 0 || t.headers.indexOf('avatar_owned') < 0) {
    return jsonOut({ error: 'The people tab has no `avatar` or `avatar_owned` column. Run '
      + 'open the site once as an admin — nothing was saved.' });
  }

  const wanted = body.avatar || {};
  const unlocks = avatarUnlocks(r);
  let credits = N(r.credits);
  const owned = S(r.avatar_owned).split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  const bought = [];

  const SLOTS = ['hair', 'headwear', 'faceware', 'shoulders', 'handheld', 'legs'];
  const equipped = {};
  for (let i = 0; i < SLOTS.length; i++) {
    const DEFAULT = { legs: 'plain', hair: 'crop' };
    const slot = SLOTS[i], want = S(wanted[slot]) || DEFAULT[slot] || 'none';
    const item = unlocks.find(x => x.slot === slot && x.id === want);
    if (!item) return jsonOut({ error: 'No such item: ' + slot + '/' + want });
    if (!item.unlocked) {
      // Buyable and affordable? Then buying it IS equipping it.
      if (item.cost && credits >= item.cost) {
        credits -= item.cost;
        owned.push(slot + ':' + item.id);
        bought.push(item.name);
      } else if (item.cost) {
        return jsonOut({ error: item.name + ' costs ' + item.cost + ' credits and you have ' + credits + '.' });
      } else {
        return jsonOut({ error: item.name + ' unlocks at level ' + item.level + '.' });
      }
    }
    equipped[slot] = item.id;
  }

  // Colours are free: skin, hair colour, shirt colour. They're how you look rather than
  // something you own, and a shop full of colour swatches is a shop selling the same object
  // eight times.
  ['skin', 'hairColour', 'shirt'].forEach(f => {
    if (wanted[f] !== undefined) equipped[f] = String(wanted[f]).slice(0, 12);
  });

  const packed = Object.keys(equipped).map(k => k + ':' + equipped[k]).join('|');
  setCell(t, r, 'avatar', packed);
  if (bought.length) {
    setCell(t, r, 'avatar_owned', owned.join(', '));
    setCell(t, r, 'credits', credits);
  }
  // Send the refreshed unlock list back: the shop decides Buy vs Equip from it, and without
  // it a just-bought item would still offer to sell itself until the next page load.
  clearCache();
  const after = findPerson(S(body.name), S(body.personId));
  return jsonOut({ success: true, avatar: packed, credits, bought,
                   owned: after ? avatarUnlocks(after) : [] });
}

/* A NEW FRIEND MUST BE A CHILD'S HANDLE (386) — the phone no longer holds every child to look it up in. */
function postSaveFriends_(body, action, began) {
  const list = S(body.friends).split(',').map(x => x.trim()).filter(Boolean);
  let rows = [];
  try { rows = read(TAB.people).rows; } catch (err) { rows = []; }
  const meF = findPerson(S(body.name), S(body.personId));
  const had = S(meF && meF.friends).split(',').map(x => norm(x.trim()));
  const wrong = list.filter(h => had.indexOf(norm(h)) === -1
    && !rows.some(r => norm(r.handle) === norm(h.replace(/^@/, '')) && isChild_(r)));
  if (wrong.length) return jsonOut({ error: 'Nobody has the handle "' + wrong[0] + '".' });
  const saved = postSavePerson_(body, 'friends', list.join(', '));
  clearCache();
  return saved;
}

function postSaveScore_(body, action, began) {
  const field = action === 'saveScore' ? 'high_score_flappy' : 'high_score_tables';
  const t = read(TAB.people);
  const r = findPerson(S(body.name), S(body.personId));
  if (!r) return jsonOut({ error: 'Person not found.' });
  const best = N(r[field]), incoming = N(body.score);
  if (incoming > best) setCell(t, r, field, incoming);
  return jsonOut({ success: true, highscore: Math.max(best, incoming), best: Math.max(best, incoming),
                   beat: incoming > best });
}
