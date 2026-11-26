/* @family. — 70_doPost.gs (8 of 8) EVERY ACTION. § */

/* ---------- THIS FILE'S OWN STAMP § */
const DOPOST_VERSION = "2026-11-26-siri";


/* The part of signing in that comes after the row has been found, shared by the address door and the
   handle door so the two cannot drift: no PIN set, the lock, the PIN, the unconfirmed address, the
   session. See `verifyLogin`. */
/* `was` IS AN OLD HANDLE THAT LET THEM IN (`handleWasRows_`, 342) — the reply then says what they are
   called now, once, in the sheet the phone already opens for a sentence it must not lose. */
function signInRow_(t0, r, body, by, was) {
  /* A PIN SENT BY "Forgotten your PIN?" IS A PIN THIS ROW HAS, for as long as it lasts — see
     `authResetUse_`. A row typed in with no PIN whose parent asked for one is exactly who it is for. */
  /* ONE WHOSE TYPED HALF HAS BEEN RETIRED BY WRONG TRIES IS NOT ONE TO TYPE — its link still works
     (`authResetKey_`), and the lock's sentence below says so. */
  const emailed = authResetGet_(r);
  if (!hasPin_(r) && !(emailed && !emailed.dead)) return jsonOut({ success: false, why: 'no-pin',
    error: emailed ? 'Too many wrong tries at the PIN we emailed — open the sign-in link in that email instead.'
                   : 'That account has no PIN set yet — ask a parent or your tutor for one.' });
  /* LOCKED IS ANSWERED BEFORE THE PIN IS LOOKED AT, so guessing costs the same whether the
     guess was right or not — a lock that only applies to wrong answers tells a guesser when
     they have found the right one. */
  /* AND IT SAYS HOW LONG. § */
  /* EXCEPT FOR THE PIN THAT WAS JUST EMAILED, which is the way out of the lock and would otherwise be refused exactly when it was asked for (181). § */
  const wait = authWaitMins_(r);
  /* `took` IS WHAT USING THE EMAILED PIN DID (`authResetTake_`), when it was the emailed PIN that let
     them in — the reply says what that changed. */
  let took = null;
  if (wait > 0) took = authResetUse_(t0, r, body.pin, true);
  if (wait > 0 && !took) {
    /* AND WHERE THE EMAILED PIN HAS BEEN USED UP BY SOMEBODY ELSE'S WRONG TRIES, the way that cannot be
       — its link. Said only then: it is the one moment the owner, typing the right PIN, is refused. */
    const now = authResetGet_(r);
    return jsonOut({ success: false,
      error: (wait === 1 ? 'Too many wrong PINs. Try again in a minute.'
                         : text_('too-many-wrong-pins-try-again-in') + wait + ' minutes.')
           + (now && now.dead ? ' If you asked for a new PIN, open the sign-in link in that email — it works now.' : '') });
  }
  /* HASHED, AND OLD ROWS MOVED ACROSS AS THEY ARRIVE — see `authCheckPin_`. The emailed PIN is
     the second thing asked, and using it makes it the PIN. */
  const pinOk = wait <= 0 && authCheckPin_(t0, r, body.pin);
  if (wait <= 0 && !pinOk) took = authResetUse_(t0, r, body.pin, false);
  if (wait <= 0 && !pinOk && !took) {
    authWrong_(t0, r);
    /* ---------- A WRONG ADDRESS AND A WRONG PIN SAY DIFFERENT THINGS NOW § */
    return jsonOut({ success: false, why: 'wrong-pin',
      /* `by` IS WHICH DOOR WAS USED, not whether the row has an address: § */
      error: (by ? by === 'handle' : !norm(r.email)) ? 'Wrong PIN for that handle.' : 'Wrong PIN for that email address.' });
  }
  /* ---------- AN UNCONFIRMED ADDRESS NO LONGER KEEPS ANYBODY OUT § */
  /* ---------- A ROW WITH NO ID IS GIVEN ONE BEFORE A SESSION IS MADE FOR IT § */
  if (!S(r.person_id)) {
    const id = 'P' + Date.now() + '-' + r._row;
    if (!setCell(t0, r, 'person_id', id)) {
      return jsonOut({ success: false, why: 'server',
        error: 'Your details are right, but this account has no id and one could not be written — ask us.' });
    }
  }
  /* ANYTHING ELSE IS SAID AS ITSELF, not folded into one of the sentences above — a sign-in
     that failed on our side must not read as a wrong PIN, or somebody retypes a right one until
     the throttle locks them out. */
  /* A PENDING ROW TAKEN BACK BY ITS EMAILED PIN HAD ITS CHILDREN HELD (`authTakeBack_`), and whoever
     has just signed in is told — in the shape Google's reply already has, so the phone reads one. */
  /* AND A CHANGE OF ADDRESS IT CANCELLED (`authResetTake_`) is said beside it — one message, one sheet. */
  const heldSaid = [authHeldSaid_(took ? N(took.childrenHeld) : 0), authMoveSaid_(took ? took.moveDropped : '')]
    .filter(Boolean).join(' ');
  const extra = heldSaid ? { childrenHeld: took ? N(took.childrenHeld) : 0,
    moveDropped: took ? S(took.moveDropped) : '', message: heldSaid } : {};
  /* ---------- SIGNED IN BY A HANDLE THAT HAS MOVED ON (342) § */
  const wasSaid = S(was) && S(r.handle) && key(was) !== key(r.handle) ? S(was) : '';
  if (wasSaid) {
    extra.handleMoved = { was: wasSaid, now: S(r.handle) };
    extra.message = [extra.message, 'Your handle is @' + S(r.handle) + ' now. @' + wasSaid
      + ' still signs you in, but use @' + S(r.handle) + ' from now on.'].filter(Boolean).join(' ');
  }
  try { return loginReplyFor_(r, authNewSession_(t0, r), Object.keys(extra).length ? extra : null); }
  catch (err) {
    return jsonOut({ success: false, why: 'server',
      error: 'Your details are right, but signing in failed on our side: '
             + String(err && err.message || err) });
  }
}

/* ---------- THE CONFIRMATION LINK, TO AN ACCOUNT'S OWN ADDRESS § */
function linkMail_(r, token, asParent) {
  const said = S(r.handle) ? '@' + S(r.handle) : '';
  /* THE WORDS ARE data/settings/words.json `mail-confirm-*`; the parent's next step is the link's second half (`confirmFirst_`). */
  accessMail_(S(r.email), 'mail-confirm', { first: S(r.first_name), link: siteLink_('verify', token),
    handleSaid: said ? text_('mail-confirm-or-handle', { handle: said }) : '' }, asParent ? text_('mail-confirm-parent-next') : '');
}

function doPost(e) {
  try { ledgerId_(); } catch (err) { /* reported where a sheet is opened */ }
  /* WHEN THIS REQUEST BEGAN, handed to every handler beside its body (docs/history/350). */
  const began = Date.now();
  try {
    /* Nothing carried over from whoever asked last. Apps Script reuses an instance between
       requests, so a miss left in the list would be reported against the next person. */
    WRITE_MISSES = [];
    /* NOT SET HERE. It used to be, on the grounds that a POST is a write — and `messages` is a POST that reads an inbox, which meant opening that widget threw the § */
    POST_WROTE = false;
    /* NOBODY YET — the last request's viewer is not this one's (`NET_VIEWER_`, constants.gs). */
    NET_VIEWER_ = null;
    const body = JSON.parse(e.postData.contents);
    let action = S(body.action);

    /* ONE GATE, before anything runs. § */
    const denied = accessDenied(action, body);
    /* A DEAD SESSION SAYS SO IN A WORD THE PHONE CAN READ. § */
    if (denied) return jsonOut(denied === text_('err-sign-in-again')
      ? { error: denied, why: 'signed-out' } : { error: denied });
    /* ---------- WHO THE REPLY IS FOR (342) § */
    {
      const need = permNeed_(action);
      netViewerSet_(need === 'self' || need === 'admin' ? findPerson('', S(body.personId)) : authWhoIs_(body.token));
    }
    /* ---------- A CHILD DOES NOT SPEND MONEY (398): she is sent no price, so a parent books and pays. */
    if (netViewerIsChild_() && (permChildDenied_(action)
        || (action === 'move' && KID_MONEY_MOVES.indexOf(norm(body.move)) !== -1))) {
      return jsonOut({ error: KID_ASK_PARENT, why: 'ask-a-parent' });
    }

    /* EVERY ACTION BY NAME (1130): the handlers live in backend/post-*.gs; one that returns nothing is an unknown action, as the old chain was. */
    const actions = postActions_();
    if (Object.prototype.hasOwnProperty.call(actions, action)) {
      const out = actions[action](body, action, began);
      /* A HANDLER MAY ANSWER WITH ITS REPLY ITSELF (step 6): sent as JSON here, as jsonOut would have. */
      if (out !== undefined) return out && typeof out.getContent === 'function' ? out : jsonOut(out);
    }

    return jsonOut({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut({ error: err.toString() });
  }
}

/* WHICH HANDLER EACH ACTION RUNS (1130). Built when asked, not a top-level value, so file load order never matters. */
/* ---------- ACTIONS (generated) ---------- */
/* GENERATED by tools/permissions.js from data/settings/actions.json: edit the json, never this. */
/* EVERY ACTION BY NAME → its handler (backend/post-*.gs). An action with no handler here answers `Unknown action`. */
function postActions_() {
  return {
    register: postRegister_,
    verifyEmail: postVerifyEmail_,
    verifyLogin: postVerifyLogin_,
    forgotPin: postForgotPin_,
    pinLink: postPinLink_,
    googleLogin: postGoogleLogin_,
    signOut: postSignOut_,
    videoPart: postVideoPart_,
    photoFile: postPhotoFile_,
    saveTimetable: (b, a, g) => postSaveTimetable_(b, 'timetable:save', g),
    savePhoto: postSavePhoto_,
    setMyRoles: postSetMyRoles_,
    votePoll: postVotePoll_,
    reactPost: postReactPost_,
    addComment: postAddComment_,
    claimChild: postClaimChild_,
    answerClaim: postAnswerClaim_,
    findChild: postFindChild_,
    raiseHand: (b, a, g) => postRaiseHand_(b, 'hand:save', g),
    hands: (b, a, g) => postRaiseHand_(b, 'hand:read', g),
    factSet: (b, a, g) => postFactSet_(b, 'fact:save', g),
    listRecords: (b, a, g) => recordsAction_(b, 'record:list', g),
    saveRecordsPage: (b, a, g) => recordsAction_(b, 'record:save', g),
    changePin: postChangePin_,
    signAgreement: postSignAgreement_,
    makeChild: postMakeChild_,
    resetPin: postResetPin_,
    resendLink: postResendLink_,
    createCheckout: postCreateCheckout_,
    finalizePayment: postFinalizePayment_,
    move: postMove_,
    createJob: postCreateJob_,
    answerRequest: postAnswerRequest_,
    joinWaitlist: postJoinWaitlist_,
    openWaitlist: postOpenWaitlist_,
    markWorking: (b, a, g) => postSaveWorking_(b, 'working:save', g),
    workingOf: (b, a, g) => postWorkingOf_(b, 'working:read', g),
    history: (b, a, g) => postHistory_(b, 'history:read', g),
    docketImport: postDocketImport_,
    docketAddress: postDocketAddress_,
    assignmentsOf: (b, a, g) => postAssignmentsOf_(b, 'assignment:read', g),
    assignmentsSave: (b, a, g) => postAssignmentsSave_(b, 'assignment:save', g),
    assignmentsImport: postAssignmentsImport_,
    workFileSave: (b, a, g) => postWorkFile_(b, 'workfile:save', g),
    workFilesOf: (b, a, g) => postWorkFile_(b, 'workfile:list', g),
    workFileOpen: (b, a, g) => postWorkFile_(b, 'workfile:read', g),
    workFileDelete: (b, a, g) => postWorkFile_(b, 'workfile:delete', g),
    submitAnswer: postSubmitAnswer_,
    reportQuestion: postReportQuestion_,
    report: postReport_,
    clientError: postClientError_,
    listClientErrors: (b, a, g) => postListClientErrors_(b, 'clienterror:list', g),
    tidyOldRows: postTidyOldRows_,
    renameAllUsernames: postRenameAllUsernames_,
    healthLog: postHealthLog_,
    suggest: postSuggest_,
    suggestUpload: postSuggestUpload_,
    listSuggestions: (b, a, g) => postListSuggestions_(b, 'suggestion:list', g),
    decideSuggestion: postDecideSuggestion_,
    applyTeach: postApplyTeach_,
    listApplications: (b, a, g) => postListApplications_(b, 'application:list', g),
    decideApplication: postDecideApplication_,
    payStatement: (b, a, g) => postPayStatement_(b, 'statement:read', g),
    listStaff: (b, a, g) => postListStaff_(b, 'staff:list', g),
    item: postItem_,
    libExport: postLibExport_,
    libImport: postLibImport_,
    libImportList: postLibImportList_,
    libImportDrive: postLibImportDrive_,
    digestPreview: postDigestPreview_,
    digestSendNow: postDigestSendNow_,
    pinShow: postPinShow_,
    claudeNoteAdd: postClaudeNoteAdd_,
    claudeNoteDone: postClaudeNoteAdd_,
    filmsSync: postFilmsSync_,
    mediaSave: (b, a, g) => mediaWrite_(b, 'media:save', g),
    mediaUpload: mediaWrite_,
    mediaHide: mediaWrite_,
    mediaDelete: (b, a, g) => mediaWrite_(b, 'media:delete', g),
    pushState: (b, a, g) => pushAction_(b, 'push:read', g),
    pushSubscribe: (b, a, g) => pushAction_(b, 'push:save', g),
    pushUnsubscribe: (b, a, g) => pushAction_(b, 'push:delete', g),
    pushSet: (b, a, g) => pushAction_(b, 'pushsetting:save', g),
    addPost: postAddPost_,
    approvePost: postApprovePost_,
    setRoom: (b, a, g) => postSetRoom_(b, 'room:save', g),
    deleteJob: (b, a, g) => postDeleteJob_(b, 'job:delete', g),
    linkChild: postLinkChild_,
    adminUnlinkFamily: postAdminUnlinkFamily_,
  };
}
/* ---------- END ACTIONS ---------- */

/* ---------- THE REPLY A SIGNED-IN PERSON GETS § */
/* EVERY BOX ON THE SETTINGS FORM OPENED EMPTY, AND SAVING ONE EMPTIED THE SHEET TO MATCH. § */
function profileOf_(r) {
  const avail = availSet(r.availability);
  /* The library cards and the qualifications are rows on tabs of their own, read once each. */
  const cards = libCardsOut(r);
  const photos = photosOut(r.photos);
  const jobs = jobsOut(r.jobs);
  const quals = qualsOut(r);
  /* ---------- AND THE DATE OF BIRTH, WHICH WAS BEING SENT AS A JAVASCRIPT DATE STRING § */
  const dob = dobOut(r.date_of_birth);
  const out = { avatar: S(r.avatar), role: S(r.role) };
  PROFILE_EDITABLE.concat(PROFILE_READONLY).forEach(f => {
    out[f] = f.match(/^(m|tu|w|th|f|sa|su)\d\d$/) ? (avail[f] ? 'TRUE' : '')
           : LIBRARY_FIELD.test(f) ? S(cards[f])
           : PHOTO_FIELD.test(f) ? S(photos[f])
           : JOB_FIELD.test(f) ? S(jobs[f])
           : QUAL_FIELD.test(f) ? S(quals[f])
           : f === 'venues_ok' ? venuesFor_(r, read(TAB.venues).rows).join(', ')
           : f === 'date_of_birth' ? S(dobIn(dob))
           /* ---------- AND AN EXAM DATE AS `yyyy-mm-dd`, WHICH IS WHAT THE PICKER CAN HOLD § */
           : DATE_COLS.indexOf(f) !== -1 ? isoDate_(r[f])
           : S(r[f]);
  });
  /* THE THREE BOXES ARE SENT AS WELL AS THE CELL. § */
  DOB_FIELDS.forEach(f => { out[f] = S(dob[f]); });
  const ph = phoneOut(r.phone);
  PHONE_FIELDS.forEach(f => { out[f] = S(ph[f]); });
  /* A NEW ADDRESS WAITING TO BE PROVED (`authMove*_`), or blank. § */
  /* THE UPLOADED INTRO VIDEO'S DRIVE ID, for the Photos card's player — written only by `videoPart`. */
  out.video_file = S(r.video_file);
  out.email_moving = S((authMoveGet_(r) || {}).to);
  /* WHICH EMAILS REACH THIS PERSON AND WHICH THEY HAVE TURNED OFF — `notifyOf_` in people.gs, the Notifications card's whole list. § */
  out.notify = notifyOf_(r);
  return out;
}

/* ---------- THE NAMES OF SOMEBODY'S OWN FAMILY, FOR THE SIGN-IN REPLY AND FOR `myProfile` § */
function familyNamesOf_(r) {
  const meId = S(r && r.person_id);
  /* A CHILD IS SENT NO PARENT'S NAME (386); a claim waiting on them still says who asked, or it cannot be answered. */
  const vis = seesWhom_(r);
  const out = {
    parents:  acceptedParents(meId).filter(x => !vis || vis[S(x.person_id)]).map(x => nameFor_(x)),
    children: acceptedChildren(meId).filter(x => !vis || vis[S(x.person_id)]).map(x => nameFor_(x)),
    siblings: siblingsOf(meId).filter(x => !vis || vis[S(x.person_id)]).map(x => nameFor_(x)),
    claims: read(TAB.family).rows
      .filter(x => S(x.child_id) === meId && norm(x.state) === 'asked')
      .map(x => {
        const pr = findPerson(S(x.parent_id));
        return { rowIndex: x._row, from: pr ? nameFor_(pr) : 'Someone' };
      }),
  };
  /* `childNamesOf`, NOT `childrenOf` — see the note on it. § */
  if (toAppRole(mainRole(r)) === 'parent') out.kids = childNamesOf(r);
  return out;
}

/* `extra` IS WHAT ONE DOOR HAS TO SAY THAT THE OTHERS DO NOT — Google taking a PENDING row back
   (`googleLogin`). Laid over the reply, so the phone reads one shape whichever door it came through. */
function loginReplyFor_(r, token, extra) {
// 'parent'/'kid' are what the frontend calls client/student.
  /* THE REPLY IS FOR THE PERSON SIGNING IN (342): § */
  netViewerSet_(r);
  const appRole = toAppRole(mainRole(r));
  const appRoles = rolesOf(r).map(toAppRole);
  /* `nameFor_`, EVEN FOR THEMSELVES — a child is called by their first name on their own screen too (the owner, 10 Oct: *"dont show children's last name"*), and it § */
  const out = { success: true, role: appRole, roles: appRoles, name: nameFor_(r),
                /* A TUTOR TICK THE BUSINESS HAS NOT SAID YES TO — see `LISTED_PENDING`. The phone
                   reads it for its staff test (`isTutorRole`) and for the line on the roles card. */
                tutorPending: tutorPending_(r),
                /* ONE RANK (400) — student, client, staff or admin — and their application to teach, if any. */
                rank: rankOf(r), application: applicationOf_(r),
                /* THE ADDRESS NOBODY HAS PROVED YET, or blank — see `pendingEmailOf_`. The phone draws
                   "we will email you once you open the link" and the held child card from it. */
                pendingEmail: pendingEmailOf_(r),
                /* THE OWNER (18 Nov, `isOwner_`): the admin whose address is the owner's — Docket and food are theirs alone. */
                owner: isOwner_(r),
                /* THEIR ASSIGNMENTS (18 Nov): the `assignments` cell, theirs alone, as `todo` is. */
                assignments: S(r.assignments),
                /* THE SESSION. Sent once, at sign-in, and never again — the phone keeps it and
                   offers it on every request, and the sheet holds only its digest. */
                token: token || '',
                // The session's real identity from here on. Names are for logging in.
                personId: S(r.person_id),
                handle: S(r.handle),
                /* BOTH of them. `saveTodo` has been writing the docket to this column since it was built and the login reply only ever sent the notepad back — so every line § */
                notepad: S(r.notepad), todo: S(r.todo),
                /* AND THE TIMETABLE, for the same reason: written by `saveTimetable` and read by
                   nothing until the sign-in reply carries it. */
                timetable: S(r.timetable),
                /* THE PHOTOGRAPH. Neither field was in this reply, so the You screen has been falling back to a letter in a circle for everybody since the rewrite — it reads § */
                photo: S(r.photo), avatar: S(r.avatar),
                /* AND WHAT THEY MAY WEAR. § */
                avatarItems: avatarUnlocks(r),
                xp: N(r.xp), credits: N(r.credits),
                /* `ticks:` WAS HERE, counted off the document rows. § */
                /* The address, as the profile keeps it. */
                address: S(r.address), postcode: S(r.postcode),
                /* THE SETTINGS FORM'S OWN VALUES — see `profileOf_` above. Without it every box on
                   that column opens blank and the first Save writes the blanks back. */
                profile: profileOf_(r),
                /* THE TUTOR AGREEMENT — so the box draws ticked and locked on every phone the
                   person signs in on, not only the one they ticked it on. */
                agreementSignedAt: S(r.agreement_signed_at), agreementVersion: S(r.agreement_version),
                highscore: N(r.high_score_flappy), ttHighscore: N(r.high_score_tables) };
  /* Their family, as agreed by both sides, and anything still waiting on them. § */
  Object.assign(out, familyNamesOf_(r));
  const meId = S(r.person_id);
  /* ---------- `out.profile = {}` WAS HERE, AND IT THREW AWAY `profileOf_` TEN LINES AFTER USING IT § */
  /* ---------- AND WHAT THE PAYLOAD WOULD HAVE BROUGHT FIFTEEN SECONDS LATER § */
  try { out.submissions = submissionsFor_(r, whoMay_(r, 'admin')); } catch (err) { /* one missing section must not lose the rest of the reply */ }
  try { out.favourites = favouritesOf_(r); } catch (err) { /* one missing section must not lose the rest of the reply */ }
  try { const fam = familyOf_(r); out.family = fam.family; out.familyFor = fam.familyFor; } catch (err) { /* one missing section must not lose the rest of the reply */ }
  try { out.answers = answersFor_(meId); } catch (err) { /* one missing section must not lose the rest of the reply */ }
  if (extra) Object.assign(out, extra);
  return jsonOut(out);
}
/* ---------- ONE ROW PER PRESS, APPENDED § */
function submissionsAppend_(pid, items, sent) {
  const t = readCols_(TAB.submissions, ['person_id', 'event_id']);
  if (!t.sheet) return { error: 'The sheet has no submissions tab. Open the site once as an admin to add it.' };
  const has = c => t.headers.indexOf(c) !== -1;
  const now = new Date(), nowMs = now.getTime();
  const sentMs = Math.floor(Number(sent));
  const skew = isFinite(sentMs) && sentMs > 0 ? nowMs - sentMs : 0;
  /* THIS PERSON'S PRESSES ALREADY ON THE SHEET, BY ID — once, not a scan of the whole tab per item. */
  const seen = {};
  t.rows.forEach(r => {
    if (key(r.person_id) === key(pid) && S(r.event_id)) seen[S(r.event_id)] = r;
  });
  /* THE WHOLE OF A ROW ALREADY WRITTEN, read only when a retry needs its verdict and its time. */
  const whole = r => {
    if (r.key !== undefined) return r;
    const v = t.sheet.getRange(r._row, 1, 1, t.headers.length).getValues()[0] || [];
    t.headers.forEach((h, i) => { if (h) r[h] = v[i]; });
    return r;
  };
  const pressedMs = r => answerAtMs_(r.pressed_at) || answerAtMs_(r.submitted_at);
  const saved = {};
  let wrote = 0;
  items.forEach(it => {
    const id = S(it && it.id);
    if (!SUBMISSION_ID.test(id)) return;
    const had = seen[id];
    if (had) { whole(had); saved[id] = { key: S(had.key), verdict: S(had.verdict), at: pressedMs(had) }; return; }
    const k = submissionKey_(S(it && it.key));
    if (!k || k.length > 120) return;
    const verdict = S(it && it.verdict);
    if (!SUBMISSION_VERDICT.test(verdict)) return;
    const answer = it && it.answer !== undefined && it.answer !== null ? String(it.answer) : '';
    if (!answer.trim() || answer.length > ANSWER_TEXT_MAX) return;
    let at = Math.floor(Number(it && it.at));
    if (isFinite(at) && at > 0) at += skew;
    if (!isFinite(at) || at <= 0 || at > nowMs) at = nowMs;
    const iso = new Date(at).toISOString();
    /* TEXT, ALWAYS — the apostrophe is the sheet's own "this is text": `3/4` is otherwise a date, and an
       ISO time would come back a Date in whichever zone the file is set to. */
    const row = { person_id: pid, key: k, answer: "'" + answer, verdict: verdict, submitted_at: now };
    if (has('label')) row.label = attemptLabel_(it && it.label);
    if (has('words')) row.words = attemptWords_(it && it.words);
    if (has('event_id')) row.event_id = id;
    if (has('pressed_at')) row.pressed_at = "'" + iso;
    /* PHOTOS OF THE WORKING (501): Drive links, space-separated; only `markWorking` sends them. */
    if (has('photos') && it && it.photos) row.photos = S(it.photos).split(' ').filter(u => WORKING_LINK.test(u)).join(' ');
    /* THE AI'S FEEDBACK (owner, 15 Nov): only beside an AI score, as text (the apostrophe: never a formula), cut to the ceiling. */
    const fb = /^ai:/.test(verdict) && it && it.feedback !== undefined && it.feedback !== null ? String(it.feedback).trim().slice(0, SUBMISSION_FEEDBACK_MAX) : '';
    if (has('feedback') && fb) row.feedback = "'" + fb;
    const made = addRow(t, row);
    if (!made) return;
    /* THE ROW IN MEMORY HOLDS WHAT WAS MEANT, not the apostrophes — and its id, so a second item with the
       same id in this request is the same press. */
    made.answer = answer;
    made.event_id = id;
    made.pressed_at = iso;
    seen[id] = made;
    saved[id] = { key: k, verdict: verdict, at: has('pressed_at') ? at : nowMs };
    wrote++;
  });
  return { saved: saved, wrote: wrote };
}

/* ---------- ONE ROW PER PERSON PER ANSWER, THE LATER EDIT WINNING § */
function answerAtMs_(v) {
  if (v instanceof Date) return isNaN(v) ? 0 : v.getTime();
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  /* A SLASHED DAY IS READ BY WHICH HALF CAN BE A MONTH, UK when either could: Date.parse reads US and NaNs "20/10/2026" (owner, 12 Nov). */
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(S(v).trim());
  if (m) {
    const a = +m[1], b = +m[2], us = a <= 12 && b > 12;
    const d = new Date(+m[3], (us ? a : b) - 1, us ? b : a, +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    return isNaN(d) ? 0 : d.getTime();
  }
  const t = Date.parse(S(v));
  return isNaN(t) ? 0 : t;
}
function answersUpsert_(pid, items) {
  const t = read(TAB.answers);
  if (!t.sheet) return { error: 'The sheet has no answers tab. Open the site once as an admin to add it.' };
  const now = Date.now();
  /* THIS PERSON'S ROWS, ONCE — not a scan of the whole tab per item. */
  const mine = {};
  t.rows.forEach(r => {
    if (key(r.person_id) !== key(pid)) return;
    const k = S(r.answer_key);
    if (k && (!mine[k] || answerAtMs_(r.edited_at) > answerAtMs_(mine[k].edited_at))) mine[k] = r;
  });
  const saved = {};
  items.forEach(it => {
    const k = S(it && it.key);
    if (!/^(ans|pad):/.test(k) || k.length > 120) return;
    const v = (it && it.v !== undefined && it.v !== null) ? String(it.v) : '';
    if (v.length > (/^pad:/.test(k) ? ANSWER_PAD_MAX : ANSWER_TEXT_MAX)) return;
    let at = Math.floor(Number(it && it.at));
    if (!isFinite(at) || at <= 0 || at > now) at = now;
    const iso = new Date(at).toISOString();
    const row = mine[k];
    if (!row) {
      const made = addRow(t, { person_id: pid, answer_key: k, value: "'" + v, edited_at: "'" + iso, saved_at: new Date(now) });
      /* THE ROW IN MEMORY HOLDS WHAT WAS MEANT, not the apostrophe — a second item for the same key in
         this request compares against it. */
      if (made) { made.value = v; made.edited_at = iso; mine[k] = made; }
      saved[k] = { v: v, at: at };
      return;
    }
    const was = answerAtMs_(row.edited_at);
    const had = S(row.value);
    if (at < was) { saved[k] = { v: had, at: was }; return; }
    if (at === was && v === had) { saved[k] = { v: v, at: at }; return; }
    setCells(t, row, { value: "'" + v, edited_at: "'" + iso, saved_at: new Date(now) });
    row.value = v; row.edited_at = iso;
    saved[k] = { v: v, at: at };
  });
  return { saved: saved };
}

/* EVERY ANSWER ONE PERSON HAS ON THE SHEET, `{ <key>: { v, at } }` — for `myAnswers` and the sign-in reply. § */
function answersFor_(pid) {
  const out = {};
  if (!S(pid)) return out;
  const t = read(TAB.answers);
  if (!t.sheet) return out;
  t.rows.forEach(r => {
    if (key(r.person_id) !== key(pid)) return;
    const k = S(r.answer_key);
    if (!k) return;
    const at = answerAtMs_(r.edited_at);
    if (out[k] && out[k].at >= at) return;
    out[k] = { v: S(r.value), at: at };
  });
  return out;
}

/* A QUESTION'S NAME AS A PARENT WILL READ IT, FROM WHATEVER THE PHONE SENT. § */
function attemptLabel_(v) {
  return S(v).replace(/<[^>]*>?/g, ' ').replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim()
    .slice(0, ATTEMPT_LABEL_MAX).trim();
}

/* A QUESTION'S WORDS AS A PARENT WILL READ THEM, FROM WHATEVER THE PHONE SENT. § */
function attemptWords_(v) {
  /* CUT FIRST, AND A TAG IS `<…>` WITH NO `<` INSIDE IT. § */
  return S(v).slice(0, ATTEMPT_WORDS_MAX * 4).replace(/\r\n?/g, '\n').replace(/<\/?[a-z][^<>]*>/gi, ' ')
    .replace(/[ \t\u00a0]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim()
    .slice(0, ATTEMPT_WORDS_MAX).trim();
}

/* `adminIds_` WAS HERE — every admin's person id, for `markDone` (the action `submitAnswer` replaced) to
   retire their payloads by key. Nothing is retired any more (see `submitAnswer`), so nothing asks. */

/* A REPORT'S FIELD AS THE SHEET KEEPS IT (395): one line, no tags, capped — whatever the phone sent. */
function reportCut_(v, max) {
  return S(v).slice(0, max * 4).replace(/<[^>]*>?/g, ' ').replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ').trim().slice(0, max).trim();
}
/* THE LONDON DAY A REPORT WAS MADE ON — one a day per person per question; a cell typed as text reads as its own date. */
function reportDay_(v) {
  if (v instanceof Date && !isNaN(v)) return todayIso_(v);
  const m = S(v).match(/^\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : '';
}


/* ---------- PHOTOS OF THE WORKING (501): a `Working` folder in the posts folder, files NOT shared by link -- personal data, read back only through `workingOf` */
function workingFolder_() {
  const posts = getPostFolder();
  if (!posts) return null;
  try {
    const it = posts.getFoldersByName('Working');
    return it.hasNext() ? it.next() : posts.createFolder('Working');
  } catch (err) { return null; }
}
function workingKeep_(folder, raw, name) {
  const v = S(raw).split(',');
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(v[1] || ''), 'image/jpeg', S(name) + '.jpg'));
  return driveFileUrl_(file.getId());
}
/* WHO MAY SEE A STUDENT'S WORKING: themselves, staff or admin (the business), and a parent they accepted. */
function workingMaySee_(me, of) {
  if (!me || !of) return false;
  if (key(me.person_id) === key(of)) return true;
  if (rankAtLeast_(me, 'admin')) return true;   /* NOT TUTORS (owner, 28 Oct: "tutors dont need to be able to see working out"): the student, their parents, the admin. */
  try { return acceptedParents(of).some(p => key(p.person_id) === key(me.person_id)); } catch (err) { return false; }
}
/* THE ROWS WITH PHOTOS, NEWEST FIRST, the pictures inlined as data so no Drive link ever leaves the script. */
function workingRowsOf_(of, onlyKey) {
  const t = readCols_(TAB.submissions, ['person_id', 'key', 'label', 'verdict', 'submitted_at', 'pressed_at', 'answer', 'photos']);
  const rows = t.rows.filter(r => key(r.person_id) === key(of) && S(r.photos) && (!onlyKey || S(r.key) === onlyKey))
    .sort((a, b) => (answerAtMs_(b.pressed_at) || answerAtMs_(b.submitted_at)) - (answerAtMs_(a.pressed_at) || answerAtMs_(a.submitted_at)))
    .slice(0, WORKING_ROWS_MAX);
  return rows.map(r => ({
    key: S(r.key), label: S(r.label), verdict: S(r.verdict), answer: S(r.answer) === WORKING_ANSWER ? '' : S(r.answer),
    at: answerAtMs_(r.pressed_at) || answerAtMs_(r.submitted_at),
    photos: S(r.photos).split(' ').map(u => {
      const m = WORKING_LINK.exec(u);
      if (!m) return '';
      try { return 'data:image/jpeg;base64,' + Utilities.base64Encode(DriveApp.getFileById(m[1]).getBlob().getBytes()); }
      catch (err) { return ''; }
    }).filter(Boolean),
  }));
}


/* ---------- FAVOURITE LINKS (509): an address is http or https with a host, nothing else ---------- */
function favUrlOk_(u) {
  const v = S(u).trim();
  if (!v || v.length > FAV_URL_MAX || /[\s\u0000-\u001f\u007f<>"`]/.test(v)) return '';
  const m = /^(https?):\/\/([^\/?#@\s]+@)?([a-z0-9.-]+|\[[0-9a-f:]+\])(:\d{1,5})?([\/?#].*)?$/i.exec(v);
  if (!m || !/[a-z0-9]/i.test(m[3]) || /^[.-]|[.-]$/.test(m[3])) return '';
  return v;
}
/* THE VIEWER'S OWN, AND ONLY THEIRS — read again when sent, so a row typed wrongly into the sheet is not passed on as a link. */
function favLinksOf_(viewer) {
  if (!viewer || !S(viewer.person_id)) return [];
  const t = read(TAB.fav_links);
  if (!t.sheet) return [];
  return t.rows.filter(r => S(r.person_id) === S(viewer.person_id))
    .map(r => ({ title: S(r.title).slice(0, FAV_TITLE_MAX), url: favUrlOk_(r.url) }))
    .filter(x => x.url).slice(0, FAV_LINKS_MAX);
}


/* ---------- THE ERROR LOG (O5) ---------- */
const CLIENT_ERROR_MAX = 300;          /* characters kept of a message or a where */
const CLIENT_ERROR_DEVICE_DAY = 20;    /* reports one device may send in a day; a loop is not a flood */
const CLIENT_ERROR_ALL_DAY = 300;      /* reports the whole site keeps in a day: the device id is the caller's word, so it cannot be the only cap */
const CLIENT_ERROR_NEW_DAY = 30;       /* new rows (and claude_notes lines) a day; past it only known errors are counted */
/* QUOTED TEXT IS WHERE USER CONTENT HIDES (a JSON.parse excerpt, a name): cut on the client and again here. */
function clientErrorUnquote_(v) {
  return S(v).replace(/\x22[^\x22]*\x22|\x60[^\x60]*\x60|(^|[^\w])\x27[^\x27]*\x27(?=[^\w]|$)/g, (m0, pre) => (pre || '') + '[quoted]');
}
/* ONLY THE FOUR FIELDS, cut and stripped of anything shaped like an address or a long number: a report must never carry learner data. */
function clientErrorClean_(v, n) {
  return clientErrorUnquote_(v).replace(/[^\s@]+@[^\s@]+/g, '[email]').replace(/\d{6,}/g, '[n]').replace(/\s+/g, ' ').trim().slice(0, n || CLIENT_ERROR_MAX);
}
function clientError_(body) {
  const message = clientErrorClean_(body.message), where = clientErrorClean_(body.where, 120);
  const version = clientErrorClean_(body.version, 60), screen = clientErrorClean_(body.screen, 40);
  if (!message) return { error: 'Nothing to report.' };
  const device = S(body.device).replace(/[^A-Za-z0-9-]/g, '').slice(0, 40) || 'unknown';
  const day = Utilities.formatDate(new Date(), 'Etc/UTC', 'yyyy-MM-dd');
  let cache = null;
  try { cache = CacheService.getScriptCache(); } catch (err) { cache = null; }
  const ck = 'cerr:' + device + ':' + day, ak = 'cerr:all:' + day, nk = 'cerr:new:' + day;
  const sent = cache ? Number(cache.get(ck) || 0) : 0, all = cache ? Number(cache.get(ak) || 0) : 0;
  if (sent >= CLIENT_ERROR_DEVICE_DAY || all >= CLIENT_ERROR_ALL_DAY) return { success: true, throttled: true };
  if (cache) { try { cache.put(ck, String(sent + 1), 86400); cache.put(ak, String(all + 1), 86400); } catch (err) { /* a full cache only loosens the throttle */ } }
  /* KEYED ON message+where ONLY: a new deploy updates the row's version, it does not file the same error again. */
  const key = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, message + '|' + where)).slice(0, 16);
  let fresh = false;
  const early = withWriteLock_(() => {
    clearCache();
    const t = read(TAB.client_errors);
    if (!t.sheet) return { error: 'No error log yet — an admin opening the site sets it up.', why: 'no-tab' };
    const had = t.rows.find(r => S(r.error_id) === key);
    if (had) {
      /* THE DEVICE COUNT RISES ONCE PER DEVICE-DAY, read off the cache, so a name never lands in the sheet. */
      const dk = 'cerrd:' + key + ':' + device + ':' + day;
      const newDevice = cache ? !cache.get(dk) : false;
      if (cache && newDevice) { try { cache.put(dk, '1', 86400); } catch (err) { /* only the device count suffers */ } }
      setCells(t, had, { last_at: new Date(), version: version, count: (Number(had.count) || 0) + 1, devices: (Number(had.devices) || 0) + (newDevice ? 1 : 0) });
    } else {
      const made = cache ? Number(cache.get(nk) || 0) : 0;
      if (made >= CLIENT_ERROR_NEW_DAY) return { success: true, throttled: true };
      if (cache) { try { cache.put(nk, String(made + 1), 86400); } catch (err) { /* only the new-row cap loosens */ } }
      addRow(t, { error_id: key, first_at: new Date(), last_at: new Date(), count: 1, devices: 1, message: message, where: where, version: version, screen: screen });
      fresh = true;
    }
    /* AND ITS FIRST SIGHTING IS ONE LINE IN claude_notes, so a session sees it without opening the sheet. */
    if (fresh) {
      const tn = read(TAB.claude_notes);
      if (tn.sheet) suggestRow_(tn, 'site', 'error', key, where + ' @ ' + version, '[error] ' + message + (screen ? ' (screen ' + screen + ')' : ''), 'open');
    }
  }, { busy: () => ({ error: 'Busy', why: 'busy' }) });
  if (early) return early;
  if (fresh) { clearCache(); try { claudeNotesWrite_(claudeNotesOpen_()); } catch (err) { /* the tab row stands; the Drive file catches up on the next add */ } }
  return { success: true, fresh: fresh };
}


/* ---------- REAL-PHONE HEALTH (920): a batch of sampled visits, numbers and a rank only, five a batch, throttled like an error ---------- */
function healthLog_(body) {
  const rows = (Array.isArray(body.rows) ? body.rows : []).slice(0, 5);
  if (!rows.length) return { error: 'Nothing to log.' };
  const device = S(body.device).replace(/[^A-Za-z0-9-]/g, '').slice(0, 40) || 'unknown';
  const day = Utilities.formatDate(new Date(), 'Etc/UTC', 'yyyy-MM-dd');
  let cache = null;
  try { cache = CacheService.getScriptCache(); } catch (err) { cache = null; }
  const ck = 'hlog:' + device + ':' + day, sent = cache ? Number(cache.get(ck) || 0) : 0;
  if (sent >= CLIENT_ERROR_DEVICE_DAY) return { success: true, throttled: true };
  if (cache) { try { cache.put(ck, String(sent + 1), 86400); } catch (err) { cache = null; } }
  const num = (v, max) => { const n = Number(v); return isFinite(n) && n >= 0 ? Math.min(max, Math.round(n * 10) / 10) : ''; };
  const t = read(TAB.health_log);
  if (!t.sheet) return { error: 'No health log yet — an admin opening the site sets it up.', why: 'no-tab' };
  rows.forEach(r => {
    const rank = S(r && r.rank).toLowerCase();
    addRow(t, { at: new Date(), version: S(r && r.version).replace(/[^\w.-]/g, '').slice(0, 60), rank: ROLES_.ranks.indexOf(rank) !== -1 ? rank : ROLES_.guest.rank,
      device: S(r && r.device).replace(/[^A-Za-z0-9-]/g, '').slice(0, 40), load_ms: num(r && r.load_ms, 600000), find_ms: num(r && r.find_ms, 600000),
      long_tasks: num(r && r.long_tasks, 100000), long_ms: num(r && r.long_ms, 6000000), heap_mb: num(r && r.heap_mb, 100000), errors: num(r && r.errors, 10000) });
  });
  return { success: true, logged: rows.length };
}
