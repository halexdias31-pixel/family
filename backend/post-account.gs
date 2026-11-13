/* post-account.gs: doPost's handlers for a person's own profile and small saves (1130); sign-in and PINs are post-signin.gs.
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

/* --- admin: read anyone's profile -------------------------------------------------------- */
/* ---------- YOUR OWN SETTINGS, READ FRESH § */
/* ---------- AND YOUR ROLES, WHICH WENT STALE THE SAME WAY § */
function postMyProfile_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me) return jsonOut({ error: 'We could not find your account.' });
  return jsonOut(settingsOf_(me));
}
/* ---------- THE ADMIN'S LENS: SOMEBODY ELSE'S SETTINGS, IN THE SHAPE `myProfile` SENDS YOURS ----------
   `lensOpen` is admin-only in the permissions table; the gate refuses anybody else before this runs. */
function postLensOpen_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return jsonOut({ error: 'Only an admin can open somebody else\'s settings.' });
  const r = read(TAB.people).rows.find(x => S(x.person_id) === S(body.targetId));
  if (!r) return jsonOut({ error: 'We could not find that person.' });
  /* NO SECRETS: the PIN, its hash and the session token are never in this shape (`profileOf_` sends the editable fields alone). */
  return jsonOut(settingsOf_(r));
}
/* WHO CHANGED SOMEBODY ELSE'S ROW: a lens_log row of ids and the field names, never the values. Not written for your own row. */
function lensLog_(me, r, action, fields) {
  if (!me || !r || S(me.person_id) === S(r.person_id)) return;
  try {
    addRow(read(TAB.lens_log), { at: new Date(), by_id: S(me.person_id), for_id: S(r.person_id), action: action,
      fields: (fields || []).join(', ') });
  } catch (err) { Logger.log('lens log, the change stands (?setup=1 makes the tab): ' + err); }
}
/* ONE PERSON'S SETTINGS AS THE SETTINGS CARDS READ THEM: yours by `myProfile`, somebody else's by `lensOpen`. */
function settingsOf_(me) {
  /* AND THE NAMES, said as the sign-in reply says them — `nameFor_` and `familyNamesOf_`. § */
  /* AND THE HANDLE, which the business may have moved (342). */
  return Object.assign({ success: true, personId: S(me.person_id), name: nameFor_(me),
                   handle: S(me.handle),
                   profile: profileOf_(me),
                   agreementSignedAt: S(me.agreement_signed_at),
                   agreementVersion: S(me.agreement_version),
                   role: toAppRole(mainRole(me)), roles: rolesOf(me).map(toAppRole),
                   tutorPending: tutorPending_(me), rank: rankOf(me), application: applicationOf_(me),
                   /* AND WHETHER THE ADDRESS IS PROVED YET — stale on the phone exactly as the role was: § */
                   pendingEmail: pendingEmailOf_(me) }, familyNamesOf_(me));
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
/* WHICH PACKED AND OWN-TAB GROUPS THE FORM SENT, each only when this editor may write it. */
function profileSent_(fields, allowed, sent, HOUR) {
  const availSent = sent(HOUR);
  const libSent   = sent(LIBRARY_FIELD) && LIBRARY_FIELDS.some(f => allowed.indexOf(f) !== -1);
  const qualsSent = sent(QUAL_FIELD) && QUAL_FIELDS.some(f => allowed.indexOf(f) !== -1);
  const phoneSent = sent(PHONE_FIELD) && allowed.indexOf('phone') !== -1;
  const dobSent   = sent(DOB_FIELD) && allowed.indexOf('date_of_birth') !== -1;
  const photosSent = sent(PHOTO_FIELD) && PHOTO_FIELDS.some(f => allowed.indexOf(f) !== -1);
  const jobsSent = sent(JOB_FIELD) && JOB_FIELDS.some(f => allowed.indexOf(f) !== -1);
  /* THE VENUES ARE ON ANOTHER TAB — `venuesWrites_` in core.gs says why there is no column here. */
  const venuesSent = fields.venues_ok !== undefined && allowed.indexOf('venues_ok') !== -1;
  return { availSent, libSent, qualsSent, phoneSent, dobSent, photosSent, jobsSent, venuesSent };
}

/* THE ROW AND WHO IS EDITING IT, or `fail` in words. */
function profileWho_(body, target) {
  const t = read(TAB.people);
  const r = findPerson(target);
  if (!r) return { fail: 'Profile not found.' };
  /* ---------- WHO IS EDITING WHOM IS A QUESTION ABOUT TWO ROWS, ANSWERED BY THEIR IDS § */
  const me = findPerson('', S(body.personId));
  const iAmAdmin = !!me && rankAtLeast_(me, 'admin');
  const adminEditing = !me || S(r.person_id) !== S(me.person_id);
  if (adminEditing && !iAmAdmin) {
    return { fail: 'Not authorised to edit that profile.' };
  }
  return { t: t, r: r, me: me, iAmAdmin: iAmAdmin, adminEditing: adminEditing };
}

/* A PACKED COLUMN OR AN OWN TAB THE SENT FIELDS NEED AND THE SHEET LACKS, in words, or "". */
function profileColumnsNo_(has, venueTab, availSent, phoneSent, dobSent, photosSent, jobsSent, qualsSent, libSent) {
  if (venueTab && venueTab.headers.indexOf('tutors_happy_here') === -1) {
    return ('The venues tab has no column for: tutors_happy_here. '
      + 'Open the site once as an admin to add it — nothing was saved.');
  }
  const packedMissing = [availSent && 'availability', phoneSent && 'phone',
                         dobSent && 'date_of_birth', photosSent && 'photos', jobsSent && 'jobs']
    .filter(c => c && !has(c));
  if (packedMissing.length) {
    return ('The sheet has no column for: ' + packedMissing.join(', ')
      + '. Open the site once as an admin to add it — nothing was saved.');
  }
  /* QUALIFICATIONS AND LIBRARY CARDS ARE ROWS ON TABS OF THEIR OWN now (see `SCHEMA.people`), so the question is whether the TAB is there — a tab `ensureSchema` § */
  const tabMissing = [qualsSent && !read(TAB.qualifications).sheet && 'qualifications',
                      libSent && !read(TAB.library_cards).sheet && 'library_cards'].filter(Boolean);
  if (tabMissing.length) {
    return ('The spreadsheet has no tab called: ' + tabMissing.join(', ')
      + '. Open the site once as an admin to make it — nothing was saved.');
  }
  return '';
}

/* THE WANTED-ONLY VALUES AND THE REFUSED GROUPS; a refused group is spliced out of `wanted`. */
function profileRefused_(r, wanted, fields, iAmAdmin) {
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
  const bossNo = managerRefusal_(r, priceAsked);
  if (bossNo) leaveOut([MANAGER_FIELD], bossNo);
  return { priceAsked: priceAsked, refused: refused };
}

/* THE REFUSALS THAT READ THE ROW AS IT STANDS: the stamp column, ages, hours, the address. Words, or "". */
function profileRowNo_(r, has, wanted, fields, priceAsked) {
  const priceMoved = pricingMoved_(r, priceAsked).length > 0;
  /* THE STAMP'S COLUMN IS CHECKED HERE NOW. § */
  if (priceMoved && !has('pricing_changed_at')) {
    return ('The sheet has no column for: pricing_changed_at. '
      + 'Open the site once as an admin to add it — nothing was saved.');
  }
  /* ---------- AND THE AGE RANGE, WHICH IS NOT THE QUOTE AND HAS NO CLOCK § */
  const ageNo = ageRefusal_(r, priceAsked);
  if (ageNo) return (ageNo);
  /* AND HOW LONG A SESSION IS — writable since docs/history/330, under the same two rules as the ages
     (`hoursRefusal_` in people.gs), asked of the same wanted-only object before anything is written. */
  const hoursNo = hoursRefusal_(r, priceAsked);
  if (hoursNo) return (hoursNo);
  /* ---------- AN ADDRESS IS WHAT SIGNS IN TO THIS ACCOUNT § */
  if (wanted.indexOf('email') !== -1 && fields.email !== undefined) {
    if (!norm(fields.email) && norm(r.email)) {
      return ('Your email address is what you sign in with, so it cannot be left empty.');
    }
    const mailNo = emailRefusal_(fields.email, r);
    if (mailNo) return (mailNo);
  }
  return '';
}

/* EVERY CELL THE ROW TAKES, and the full name when it was renamed. */
function profilePut_(r, t, fields, wanted, priceAsked, mailPlan, mailKey, availSent, photosSent, jobsSent, phoneSent, dobSent) {
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
    /* AND THE HANDLE FOLLOWS THE FIRST NAME (`handleFollow_`). */
    if (fields.first_name !== undefined) Object.assign(put, handleFollow_(t, r, S(fields.first_name)));
  }
  return { put: put, renamed: renamed, full: full };
}

/* THE OWN-TAB ROWS AND THE VENUE CELLS; venue cells go onto `wrote`, own rows are counted. */
function profileBeside_(r, fields, wrote, venueTab, qualsSent, libSent) {
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
  return rowsMoved;
}

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
  const who = profileWho_(body, target);
  if (who.fail) return jsonOut({ error: who.fail });
  const t = who.t, r = who.r, iAmAdmin = who.iAmAdmin, adminEditing = who.adminEditing;
  const fields = body.fields || {};
  // An admin may additionally set the admin-only flags — that's what makes them admin-only
  // rather than merely hidden.
  const allowed = adminEditing ? PROFILE_EDITABLE.concat(PROFILE_READONLY) : PROFILE_EDITABLE;
  const has = f => t.headers.indexOf(f) !== -1;
  const sent = re => Object.keys(fields).some(f => re.test(f));
  const HOUR = /^(m|tu|w|th|f|sa|su)\d\d$/;

  /* 1. EVERY REFUSAL, BEFORE A SINGLE CELL IS TOUCHED. § */
  /* THE FORM NAMES ARE NOT THE CELLS. § */
  const { availSent, libSent, qualsSent, phoneSent, dobSent, photosSent, jobsSent, venuesSent } = profileSent_(fields, allowed, sent, HOUR);
  const venueTab = venuesSent ? read(TAB.venues) : null;
  const columnsNo = profileColumnsNo_(has, venueTab, availSent, phoneSent, dobSent, photosSent, jobsSent, qualsSent, libSent);
  if (columnsNo) return jsonOut({ error: columnsNo });
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
  const asked = profileRefused_(r, wanted, fields, iAmAdmin);
  const priceAsked = asked.priceAsked, refused = asked.refused;
  const elseSent = availSent || photosSent || jobsSent || phoneSent || dobSent || qualsSent || libSent || !!venueTab;
  if (refused.length && !wanted.length && !elseSent) {
    return jsonOut({ error: refused.map(p => p[1]).join(' ') + ' Nothing was saved.' });
  }
  const rowNo = profileRowNo_(r, has, wanted, fields, priceAsked);
  if (rowNo) return jsonOut({ error: rowNo });
  /* ---------- AND A NEW ADDRESS IS PROVED BEFORE IT IS TRUSTED § */
  const mail = profileMailPlan_(r, wanted, fields);
  if (mail.fail) return mail.fail;
  const mailPlan = mail.plan, mailKey = mail.key;

  /* 2. EVERY WRITE, COLLECTED INTO ONE OBJECT, THEN ONE CALL. § */
  const cells = profilePut_(r, t, fields, wanted, priceAsked, mailPlan, mailKey, availSent, photosSent, jobsSent, phoneSent, dobSent);
  const put = cells.put, renamed = cells.renamed, full = cells.full;

  /* 3. ONE WRITE. `setCells` is `setCell` for a whole row: § */
  const wrote = setCells(t, r, put);
  if (adminEditing) lensLog_(who.me, r, 'updateProfile', Object.keys(fields));
  /* AND WHAT WAITS BESIDE THE ROW. § */
  profileMailAfter_(r, mail);
  const rowsMoved = profileBeside_(r, fields, wrote, venueTab, qualsSent, libSent);
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
    try { authProps_().setProperty('AUTH_LINK_' + S(r.person_id), String(Date.now())); } catch (err) { /* script properties are best-effort here; the next run tries again */ }
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
  const changed = notifyCellOn_(r, K) !== on;
  if (changed && !setCell(t, r, K.col, on ? 'yes' : 'no')) {
    return jsonOut({ error: 'That could not be written to the sheet — nothing was saved.' });
  }
  if (changed) { clearCache(); lensLog_(me, r, 'setNotify', [K.col]); }
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
    const rest = rolesOf(r).filter(x => SELF_ROLES.indexOf(roleWord_(x)) === -1);
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
