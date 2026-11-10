/* post-family.gs: doPost's handlers for parents and children: claiming, linking, and the admin's person editor (1130).
   Named in `postActions_()`, dopost.gs, after its gate; § notes: docs/notes/backend/dopost.gs.md. */

/* claiming a child ------------------------------------------------------------------ A parent types a first and last name. § */
function postClaimChild_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  /* HELD, NOT MAIN. The card is drawn for anybody who HOLDS client or admin (`mayAddChild_` reads `heldRoles`), and this asked for the MAIN role — so a person who § */
  if (!hasRole(me, 'client') && !hasRole(me, 'admin')) {
    return jsonOut({ error: 'Only a parent can add a child.' });
  }
  /* NOT FROM AN ADDRESS NOBODY HAS PROVED — see `addressPending_`. § */
  if (addressPending_(me)) return jsonOut(confirmFirst_(me, 'you can add your child'));

  /* BY HANDLE (442): the found child's "Add as my child" tile sends the exact handle; names stay for old phones. */
  const byHandle = S(body.handle).replace(/^@/, '').trim();
  const typed = byHandle ? '@' + byHandle : (S(body.firstName) + ' ' + S(body.lastName)).trim();
  if (!byHandle && (!S(body.firstName) || !S(body.lastName))) {
    return jsonOut({ error: 'Both a first name and a last name, please.' });
  }

  /* Matched on both names together, or the whole handle. Matching loosely is how a parent ends up
     claiming a child who is not theirs. */
  const people = read(TAB.people);
  const hits = people.rows.filter(r =>
    norm(mainRole(r)) === 'student' &&
    (byHandle ? key(r.handle) === key(byHandle)
              : key(S(r.first_name) + ' ' + S(r.last_name)) === key(typed)));

  if (!hits.length) {
    return jsonOut({ error: 'No student called "' + typed + '". Check the spelling — it has '
      + 'to match how they signed up.' });
  }
  if (hits.length > 1) {
    return jsonOut({ error: 'More than one student is called that. Ask us to link them.' });
  }
  const child = hits[0];

  const t = read(TAB.family);
  const already = t.rows.find(r => S(r.parent_id) === S(me.person_id)
                                && S(r.child_id) === S(child.person_id));
  if (already) {
    const st = norm(already.state);
    /* `held` IS NOT ASKED AGAIN FROM HERE: asking would put a yes back in the child's hands for an
       account whose address changed owner (`authTakeBack_`). A person settles it. */
    return jsonOut({ error: st === 'accepted' ? 'They are already on your account.'
                          : st === 'refused'  ? 'They declined that request.'
                          : st === 'held'     ? 'They were taken off this account when its email was confirmed — '
                                                + 'get in touch with us and we will put them back.'
                          : 'They have a request from you waiting.' });
  }

  /* `addRow` ANSWERS null WHEN THE TAB CANNOT BE OPENED, and this said success over nothing. */
  const linked = addRow(t, {
    link_id: 'F' + Date.now(),
    parent_id: S(me.person_id),
    child_id: S(child.person_id),
    child_typed: typed,
    state: 'asked',
    asked_on: new Date(),
  });
  if (!linked) return jsonOut({ error: 'The family tab could not be opened — nothing was saved.' });
  clearCache();

  /* `family` — ESSENTIAL: somebody claiming to be a child's parent is never a thing the child could
     have switched off hearing about. */
  notify(personDisplayName(child), 'Someone has added you to their account',
    personDisplayName(me) + ' says they are your parent or guardian.\n\n'
    + 'Open @family. and accept or decline it — nothing changes until you do.', 'family');

  return jsonOut({ success: true });
}

/* FINDING YOUR CHILD BY HANDLE (442) -------------------------------------------------- A child is never listed; one exact handle, one card. */
function postFindChild_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  if (!rankAtLeast_(me, 'client')) return jsonOut({ error: 'Only a parent can look up a child.' });
  /* TWENTY LOOKUPS IN TEN MINUTES per account, so the handle space cannot be walked. */
  try {
    const c = CacheService.getScriptCache(), ck = 'FINDCHILD:' + S(me.person_id);
    const n = Number(c.get(ck) || 0);
    if (n >= 20) return jsonOut({ error: 'That is a lot of looking — try again in a few minutes.' });
    c.put(ck, String(n + 1), 600);
  } catch (e) {}
  const want = S(body.handle).replace(/^@/, '').trim();
  if (!want) return jsonOut({ success: true, child: null });
  const r = read(TAB.people).rows.find(x => norm(mainRole(x)) === 'student' && S(x.handle) && key(x.handle) === key(want));
  if (!r || S(r.person_id) === S(me.person_id)) return jsonOut({ success: true, child: null });
  /* THE FIRST NAME AND THE FIGURE ONLY — no surname, no photograph (`faceFig_`). */
  return jsonOut({ success: true, child: Object.assign({ personId: S(r.person_id), first: S(r.first_name),
    handle: S(r.handle) }, faceFig_(r)) });
}

/* ---------- A HAND UP (455): "help me" from a question, for the tutor in the room. Script properties, 30 minutes; no sheet tab. */
function postRaiseHand_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  const staff = rankAtLeast_(me, 'staff');
  const lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch (e) {}
  try {
    const all = handsRead_();
    if (action === 'raiseHand') {
      /* YOUR OWN HAND ONLY; staff may lower anybody's (the tutor's Done), never raise one for them. */
      const who = S(body.for) || S(me.person_id);
      if (who !== S(me.person_id) && !(staff && !body.on)) return jsonOut({ error: 'Only your own hand.' });
      if (body.on) {
        all[who] = { personId: who, name: (S(me.first_name) + ' ' + S(me.last_name).slice(0, 1)).trim(),
          handle: S(me.handle), q: S(body.q).slice(0, 120), label: S(body.label).slice(0, 120), at: Date.now() };
      } else delete all[who];
      handsWrite_(all);
    }
    const mine = all[S(me.person_id)] || null;
    const out = { success: true, mine: mine };
    /* A TUTOR SEES ONLY THEIR OWN STUDENTS' HANDS (10 Nov, `seesWhom_`); an admin every one. */
    const vis = staff ? seesWhom_(me) : null;
    if (staff) out.hands = Object.keys(all).map(k => all[k]).filter(h => !vis || vis[S(h.personId)]).sort((a, b) => a.at - b.at);
    return jsonOut(out);
  } finally { try { lock.releaseLock(); } catch (e) {} }
}

/* The child answering. Only the child named in the row, and only once. */
function postAnswerClaim_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });

  const t = read(TAB.family);
  const r = t.rows.find(x => x._row === Number(body.rowIndex));
  if (!r) return jsonOut({ error: 'Not found.' });
  /* THE CHILD, and nobody else — not the parent who asked, not another student, not an admin.
     A consent somebody else can give on your behalf is not a consent. */
  if (S(r.child_id) !== S(me.person_id)) {
    return jsonOut({ error: 'That request is not yours to answer.' });
  }
  if (norm(r.state) !== 'asked') return jsonOut({ error: 'That was already answered.' });

  const yes = TRUE_(body.accept);
  /* ---------- A YES TO AN ACCOUNT WHOSE ADDRESS NOBODY HAS PROVED WAITS § */
  const asker = yes ? findPerson(S(r.parent_id)) : null;
  if (asker && addressPending_(asker)) {
    return jsonOut({ why: 'unconfirmed',
      error: personDisplayName(asker) + ' has not confirmed their email yet, so they cannot be linked to '
           + 'you. Ask them to open the link we emailed them, then say yes — or say no.' });
  }
  setCell(t, r, 'state', yes ? 'accepted' : 'refused');
  setCell(t, r, 'answered_on', new Date());
  clearCache();

  const parent = findPerson(S(r.parent_id));
  if (parent) {
    /* `family` — ESSENTIAL: the answer to a request the parent made, which decides whether they can
       see and help their child at all. */
    notify(personDisplayName(parent),
      yes ? 'They accepted' : 'They declined',
      personDisplayName(me) + (yes ? ' is now on your account.' : ' declined the request.'), 'family');
  }
  return jsonOut({ success: true });
}

/* ---------- MAKING A CHILD'S ACCOUNT IS GONE (461): an account is made by its owner, then claimed. An old page gets this. */
function postMakeChild_(body, action, began) {
  return jsonOut({ error: 'A child makes their own account now (Make an account). Then find their handle and tap '
                        + 'Add as my child, and they say yes. Nothing was made.' });
}

/* AN ADMIN LINKS A CHILD TO A PARENT ---------------------------------------------------- NOT `claimChild`, AND THE DIFFERENCE IS THE POINT. § */
function postLinkChild_(body, action, began) {
  const parent = findPerson(S(body.parent), S(body.parentId));
  const child  = findPerson(S(body.child),  S(body.childId));
  if (!parent) return jsonOut({ error: 'No parent by that name.' });
  if (!child)  return jsonOut({ error: 'No child by that name.' });
  if (S(parent.person_id) === S(child.person_id)) {
    return jsonOut({ error: 'That is the same person.' });
  }
  /* ---------- NOT ONTO AN ACCOUNT WHOSE ADDRESS NOBODY HAS PROVED, EVEN BY AN ADMIN § */
  if (addressPending_(parent)) {
    return jsonOut({ why: 'unconfirmed',
      error: personDisplayName(parent) + '\'s email (' + (S(parent.email) || 'none') + ') has not been confirmed, so no '
           + 'child can be put on their account yet. Ask them to open the link we sent, or correct the address '
           + 'in the sheet first. Nothing was linked.' });
  }

  const t = read(TAB.family);
  const row = t.rows.find(r => S(r.parent_id) === S(parent.person_id)
                            && S(r.child_id) === S(child.person_id));

  if (row) {
    if (norm(row.state) === 'accepted') {
      return jsonOut({ success: true, alreadyLinked: true });
    }
    /* A row that was asked and never answered, or refused, becomes accepted — an admin saying
       so settles a question the child never got round to. */
    setCell(t, row, 'state', 'accepted');
    setCell(t, row, 'answered_on', new Date());
    clearCache();
    return jsonOut({ success: true, settled: true });
  }

  addRow(t, {
    link_id: 'F' + Date.now(),
    parent_id: S(parent.person_id),
    child_id: S(child.person_id),
    child_typed: personDisplayName(child),
    state: 'accepted',
    asked_on: new Date(),
    answered_on: new Date(),
  });
  clearCache();
  return jsonOut({ success: true,
                   parent: nameFor_(parent), child: nameFor_(child) });
}

/* A FAMILY LINK TAKEN OFF BY AN ADMIN (the Edit form on a card): every row between the two, whatever its state; `linkChild` makes one. */
function postAdminUnlinkFamily_(body, action, began) {
  const t = read(TAB.family);
  if (!t.sheet) return jsonOut({ error: 'The family tab could not be opened — nothing was changed.' });
  const pid = S(body.parentId), cid = S(body.childId);
  if (!pid || !cid) return jsonOut({ error: 'Which parent and which child?' });
  const gone = t.rows.filter(f => S(f.parent_id) === pid && S(f.child_id) === cid).sort((a, b) => b._row - a._row);
  gone.forEach(f => delRow(t, f));
  clearCache();
  return jsonOut({ success: true, removed: gone.length });
}

/* PEOPLE, BY AN ADMIN (373) ------------------------------------------------------------------- */
/* THE FORM'S FILLING: the person by id (none for a new one) and the parents a child can go on. */
function postPersonGet_(body, action, began) {
  const want = S(body.targetId);
  const r = want ? read(TAB.people).rows.find(x => S(x.person_id) === want) : null;
  if (want && !r) return jsonOut({ error: 'We could not find that person.' });
  return jsonOut({ success: true, person: r ? adminPersonOut_(r) : null, parents: adminParentChoices_() });
}

/* MADE OR CHANGED. No `targetId` is a new person: a fresh PIN shown once, a handle by the template, joined today. */
function postPersonSave_(body, action, began) {
  const t = read(TAB.people);
  const want = S(body.targetId);
  const r = want ? t.rows.find(x => S(x.person_id) === want) : null;
  if (want && !r) return jsonOut({ error: 'We could not find that person — nothing was saved.' });
  if (r && S(r.person_id) === S(body.personId)) return jsonOut({ error: 'Your own card is changed with Edit on it.' });
  const lacking = ['handle', 'pin', 'date_of_birth'].filter(c => t.headers.indexOf(c) === -1);
  if (lacking.length) return jsonOut({ error: 'The sheet has no column for: ' + lacking.join(', ') + '. Run ?setup=1 — nothing was saved.' });
  const said = adminPersonRefusal_(t, body, r);
  if (said) return jsonOut({ error: said + ' Nothing was saved.' });
  const first = S(body.firstName), last = S(body.lastName), email = S(body.email);
  const put = { first_name: first, last_name: last, role: adminRolesIn_(body.roles).join(', '),
                email: email, date_of_birth: dobIn(adminDobFields_(body.dob)) };
  let row = r, pin = '';
  if (r) {
    /* THE HANDLE STAYS — a name corrected is not a new person, and a handle is how they sign in. */
    const before = personDisplayName(r);
    if (t.headers.indexOf('name_was') !== -1 && key(before) && key(before) !== key(first + ' ' + last)) {
      put.name_was = nameWasWith_(r.name_was, before);
    }
    /* AN ADDRESS THE ADMIN TYPED IS VOUCHED FOR — no link to open, and any move waiting on one is dropped. */
    if (norm(email) !== norm(r.email)) { put.verified = 'TRUE'; put.verify_token = ''; authMoveDrop_(r); }
    setCells(t, r, put);
  } else {
    const id = 'P' + Date.now() + '-a';
    const draft = Object.assign({ person_id: id, joined_on: new Date() }, put);
    const handle = handleMake_(draft);
    if (!handle) return jsonOut({ error: 'No free handle could be made just now. Nothing was saved — try again.' });
    pin = authFreshPin_();
    row = addRow(t, Object.assign(draft, { handle: handle, pin: pin, credits: 0, xp: 0,
      came_from: 'admin', invited_by: S(body.personId), verified: 'TRUE' }));
    if (!row) return jsonOut({ error: 'The people tab could not be opened — nothing was saved.' });
  }
  if (Array.isArray(body.parentIds) && !adminParentsSet_(row, body.parentIds.map(S).filter(Boolean))) {
    clearCache();
    return jsonOut({ error: 'Saved, but the family tab could not be opened, so their parents were not changed.' });
  }
  clearCache();
  const invited = !r && !!email && !!body.invite && adminInvite_(row, pin);
  return jsonOut({ success: true, made: !r, person: adminPersonCard_(row), first: first,
                   handle: S(row.handle), pin: invited ? '' : pin, invited: invited });
}

/* THE NEW ACCOUNT'S HANDLE AND PIN MAILED TO THEIR OWN ADDRESS (`invite`): false when it could not go, so the admin is shown the PIN instead. */
function adminInvite_(r, pin) {
  try {
    mailOut_({ to: S(r.email), name: BRAND_NAME, subject: 'Your ' + BRAND_NAME + ' account',
      body: 'Hello ' + S(r.first_name) + ',\n\nAn account has been made for you on ' + BRAND_NAME + '.\n\n'
          + 'Sign in at ' + SITE_URL + ' with your email (or your handle, @' + S(r.handle) + ') and the PIN ' + pin
          + '\n\nChange the PIN under Settings → Signing in.\n\n— ' + BRAND_NAME });
    return true;
  } catch (err) { return false; }
}

/* REMOVED, with their family links. Never yourself, and never the last admin. */
function postPersonDelete_(body, action, began) {
  const t = read(TAB.people);
  const r = t.rows.find(x => S(x.person_id) === S(body.targetId));
  if (!r) return jsonOut({ error: 'We could not find that person — nothing was deleted.' });
  if (S(r.person_id) === S(body.personId)) return jsonOut({ error: 'You cannot delete yourself.' });
  if (hasRole(r, 'admin') && adminCount_(t) <= 1) return jsonOut({ error: 'That is the last admin — nothing was deleted.' });
  if (!adminPersonDelete_(t, r)) return jsonOut({ error: 'The people tab could not be changed — nothing was deleted.' });
  clearCache();
  return jsonOut({ success: true, deleted: S(body.targetId) });
}
