/* post-booking.gs: doPost's handlers for payments, rooms, moves, requests, jobs and the waitlist (1130).
   Named in `postActions_()`, dopost.gs, after its gate; § notes: docs/notes/backend/dopost.gs.md. */

/* `saveTopics` WAS HERE. It wrote `ticks_1…3` on a person's row and nothing on the phone has ever
   called it; the columns went with the people tab's redesign (see `SCHEMA.people`). */


/* ---------- `toggleTopicTick` WAS HERE § */

/* ---------- `toggleVenueComfort` WAS HERE § */

/* PAYMENT ------------------------------------------------------------------------------ Two halves, and they must stay apart. § */
function postCreateCheckout_(body, action, began) {
  /* THE SAME GUARD `move` HAS, on the action that matters most. § */
  if (body.requestId && seenRequest(body.requestId)) {
    return jsonOut({ error: 'That checkout was already started — check the tab it opened in.' });
  }

  /* A LESSON (owner, 27 Nov): the term's total, up front. */
  if (S(body.lessonId)) return lessonCheckout_(body);
  const stripeKey = PropertiesService.getScriptProperties().getProperty('STRIPE_TEST_KEY');
  if (!stripeKey) return refuse_('err-no-stripe-key', 'no-key');

  const t = read(TAB.jobs);
  const j = t.rows.find(x => S(x.job_id) === S(body.jobId));
  if (!j) return refuse_('err-job-not-found', 'not-found');
  const me = S(body.name);
  const mine = participantsOf(S(j.job_id)).find(p2 => key(p2.name) === key(me));
  if (!mine) return refuse_('err-not-in-session', 'not-yours');
  if (mine.status !== BM.AGREED) {
    return jsonOut({ error: 'Nothing to pay for yet — the terms have to be agreed first.' });
  }

  // What the client owes. Read from the job, never from the request: a price posted by the
  // browser is a price the client chose.
  /* ---------- CHARGE WHAT THE RECEIPT SAYS, NOT WHAT THE JOB SAYS § */
  const receipt = read(TAB.receipts).rows
    .filter(r => S(r.job_id) === S(j.job_id) && N(r.total_pence) > 0)
    .sort((a, b) => (sheetDate(b.issued_on) || 0) - (sheetDate(a.issued_on) || 0))[0];
  const pence = receipt ? Math.round(N(receipt.total_pence))
                        : Math.round(N(j.price_total) * 100);
  if (!pence) return jsonOut({ error: 'This session has no price set.' });

  const ref = 'PAY-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  // The ref remembers WHO and WHICH job, so the return leg can't be pointed at someone else's
  // session by editing the URL.
  PropertiesService.getScriptProperties()
    .setProperty(ref, JSON.stringify({ jobId: S(j.job_id), payer: me }));

  const dates = sessionDatesOf(j);
  const params = {
    'mode': 'payment',
    'success_url': siteLink_('paid', '1') + '&ref=' + ref,
    'cancel_url': siteLink_('paid', '0'),
    'client_reference_id': ref,
    'line_items[0][price_data][currency]': 'gbp',
    'line_items[0][price_data][product_data][name]':
      (S(j.level) + ' ' + S(j.subject)).trim() + ' — ' + dates.length + ' sessions',
    'line_items[0][price_data][product_data][description]':
      S(j.weekday) + ' ' + fmtTime(j.start_time) + ' · ' + S(j.venue),
    'line_items[0][price_data][unit_amount]': String(pence),
    'line_items[0][quantity]': '1'
  };
  try {
    const res = UrlFetchApp.fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'post', headers: { Authorization: 'Bearer ' + stripeKey },
      payload: params, muteHttpExceptions: true
    });
    const d = JSON.parse(res.getContentText());
    if (!d.url) return jsonOut({ error: (d.error && d.error.message) || 'Stripe refused the request.' });
    PropertiesService.getScriptProperties()
      .setProperty(ref + '_session', S(d.id));
    /* Recorded so the guard above can recognise a repeat — it reads the events tab, and a checkout that leaves no trace is a checkout that can be started twice. § */
    logEvent({ jobId: S(body.jobId), actor: S(body.name), action: 'checkout',
               message: ref, requestId: S(body.requestId) });
    return jsonOut({ success: true, url: d.url });
  } catch (err) {
    return jsonOut({ error: 'Could not reach Stripe: ' + err });
  }
}

function postFinalizePayment_(body, action, began) {
  const props = PropertiesService.getScriptProperties();
  const ref = S(body.ref);
  if (!ref) return jsonOut({ error: 'That payment link has no reference, so nothing was booked.' });
  /* ONE RETURN AT A TIME (430): a refresh and the first load racing each read the ref before either deleted it, and both wrote Confirm and mailed twice. */
  return withWriteLock_(() => {
    clearCache();
    /* ALREADY HANDLED IS THE CONFIRM EVENT THIS REF WROTE, not a missing property — so a refresh answers with the job to open (430). */
    const done = read(TAB.events).rows.find(r => S(r.request_id) === ref && S(r.action) === 'Confirm');
    const raw = props.getProperty(ref);
    if (done) {
      if (raw) { props.deleteProperty(ref); props.deleteProperty(ref + '_session'); }
      return jsonOut({ success: true, alreadyDone: true, jobId: S(done.job_id) });
    }
    if (!raw) return jsonOut({ error: 'We have no payment with that reference. If you were charged, message us and we will put it right.', why: 'unknown-ref' });
    const parsed = JSON.parse(raw);
    const jobId = parsed.jobId, payer = parsed.payer;
    const sessionId = props.getProperty(ref + '_session');
    const stripeKey = props.getProperty('STRIPE_TEST_KEY');

    // ASK STRIPE. Landing on the success URL proves only that a browser visited a URL; anyone
    // could type it. This is the check that makes the payment real.
    let paid = false, intent = '';
    try {
      const res = UrlFetchApp.fetch('https://api.stripe.com/v1/checkout/sessions/' + sessionId, {
        method: 'get', headers: { Authorization: 'Bearer ' + stripeKey }, muteHttpExceptions: true
      });
      const d = JSON.parse(res.getContentText());
      paid = S(d.payment_status) === 'paid'; intent = S(d.payment_intent);
    } catch (err) {
      return jsonOut({ error: 'Could not confirm the payment with Stripe: ' + err });
    }
    if (!paid) return jsonOut({ error: 'Stripe says that session has not been paid.' });
    if (parsed.lessonId) {
      if (!lessonPaid_(parsed.lessonId, intent)) return jsonOut({ error: 'Paid, but the lesson could not be marked: message us and we will put it right.' });
      props.deleteProperty(ref); props.deleteProperty(ref + '_session');
      return jsonOut({ success: true, lessonId: S(parsed.lessonId) });
    }

    // Confirm is the only action that reaches Booked, and only this path writes it.
    logEvent({ jobId, actor: payer, role: 'client', action: 'Confirm',
               message: 'payment confirmed by Stripe', requestId: ref });
    clearCache();
    const t = read(TAB.jobs);
    const j = t.rows.find(x => S(x.job_id) === S(jobId));
    if (j) setCell(t, j, 'status', jobStatusOf(jobId));
    props.deleteProperty(ref);
    props.deleteProperty(ref + '_session');

    /* THE PAYER'S IS THEIR RECEIPT — `booked`, essential. THE TUTOR'S IS NEWS about somebody else's
       money on a session already theirs — `bookings`, which they may turn off. */
    notify(payer, 'Payment received — you are booked in',
      'Your place is confirmed. See you there.\n\n— @family.', 'booked');
    const tutor = (tutorsIn(jobId).find(x => x.status === BM.AGREED || x.status === BM.BOOKED) || {}).name;
    if (tutor) notify(tutor, 'Paid: a place is confirmed',
      fmtName_(findPerson(payer) || payer) + ' has paid and is confirmed in the class.\n\n— @family.', 'bookings');
    return jsonOut({ success: true, jobId: S(jobId) });
  }, { wait: 10000, busy: () => jsonOut({ error: 'Busy — open the site again in a moment to finish.', why: 'busy' }) });
}

/* MARKING A SESSION PAID, BY HAND ------------------------------------------------------- PEOPLE PAY IN CASH. § */
/* THE ROOM IN THE VENUE, written by staff after booking; the family never picks it. */
function postSetRoom_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return refuse_('err-not-signed-in', 'not-signed-in');
  const t = read(TAB.jobs);
  const j = t.rows.find(x => S(x.job_id) === S(body.jobId) || String(x._row) === S(body.jobId));
  if (!j) return refuse_('err-no-session', 'not-found');
  /* A PERSON ROW HAS NO `name` CELL: who they are is `personDisplayName`, as the roster spells the tutor. */
  const teaches = participantsOf(S(j.job_id)).some(p2 => p2.role === 'tutor' && key(p2.name) === key(personDisplayName(me)));
  if (!rankAtLeast_(me, 'admin') && !teaches) return jsonOut({ error: 'Only an admin or the tutor can set the room.' });
  if (!setCell(t, j, 'room', S(body.room).slice(0, 80))) return jsonOut({ error: 'The jobs tab has no room column yet: open the /exec address with ?setup=1 once.' });
  logEvent({ jobId: S(j.job_id), actor: personDisplayName(me), action: 'room', message: S(body.room).slice(0, 80) });
  clearCache();
  return jsonOut({ success: true });
}

/* --- THE booking move ------------------------------------------------------------------- */
/* WHO A MOVE IS ABOUT: `them` named, `target` named or the one candidate. */
function moveTarget_(body, act, asAdmin, before, others) {
  // Who this move is about. Named explicitly, or the only person on the other side.
  const wanted = S(body.counterpart);
  // Only an EXPLICIT counterpart names someone. Inferring "the only other person" broke the
  // lobby: a tutor pressing ✓ to mark themselves ready was recorded as "I accept <the client>",
  // which readied her too — so one person could ready the whole room. Readying up is about
  // yourself; choosing someone is about them, and the difference is whether you said a name.
  /* AND BY THE NAME THE PHONE WAS SHOWN. § */
  const shownAs = wanted ? others.filter(p2 => key(kidNamesOff_(S(p2.name))) === key(wanted)) : [];
  const them = wanted ? (others.find(p2 => key(p2.name) === key(wanted))
                         || (shownAs.length === 1 ? shownAs[0] : null)) : null;
  // Declining still needs a target, and with exactly one candidate there's no ambiguity.
  /* AN ADMIN'S TARGET IS EVERYBODY WHO IS WAITING. § */
  const target = them || ((act === ACT.DECLINE && others.length === 1) ? others[0] : null)
    || (asAdmin && before.length === 1 ? before[0] : null);
  return { them: them, target: target };
}

/* THE MOVE'S OWN REFUSALS: no target, a named tutor still asked, the lobby rules. The words, or null. */
function moveRefusal_(j, act, role, mine, asAdmin, target, others, before) {
  if (!target && act === ACT.DECLINE) {
    return others.length ? 'Say which person you mean.'
                         : 'No one on the other side to respond to.';
  }

  /* A NAMED TUTOR ANSWERS FOR THEMSELVES (488): a family cannot accept them on their behalf while they are still asked. */
  if (!asAdmin && role === 'client' && act === ACT.ACCEPT && target && target.role === 'tutor'
      && target.status === BM.WAITING && !TRUE_(j.stealable)) {
    return text_('waiting-for') + target.name + ' to accept or decline.';
  }
  // Permission is judged against whoever is on the other side of the lobby, named or not —
  // that's what decides whether the client may pay. Only the WRITE is targeted.
  const facing = target || others[0] || before[0] || null;
  /* THE LOBBY RULES ARE ABOUT THE TWO SIDES, and an admin is not one of them. § */
  if (!asAdmin) {
    const res = bmApply(role, mine ? S(mine.status) : '', facing ? S(facing.status) : '', act);
    if (!res.ok) return res.error;
  }
  return null;
}

/* THE JOB'S STATUS FROM WHO IS LEFT, written with what it freezes or cancels; returned. */
function moveStatus_(t, j, jobId, act) {
  const status = jobStatusOf(jobId);
  setCell(t, j, 'status', status);
  /* THE MOVE THAT SETTLES THE LAST SEAT FREEZES WHAT THE BOOKING EARNS (docs/history/353) — card fees
     from today's config, the net, `priced_at`. Once stamped, `jobMoneyFreeze_` answers null for ever. */
  if (act === ACT.ACCEPT && jobAgreed_(jobId)) {
    const frozen = jobMoneyFreeze_(j, config(), new Date());
    if (frozen) Object.keys(frozen).forEach(f => setCell(t, j, f, frozen[f]));
  }
  if (status === 'cancelled') {
    setCell(t, j, 'stealable', 'FALSE');
    // Tell any tutor still attached: a cancelled job is invisible, so they'd otherwise hold a
    // place on something they can neither see nor act on.
    tutorsIn(jobId).forEach(tu => notify(tu.name, 'Cancelled: ' + S(j.subject),
      'The family has withdrawn, so ' + S(j.subject) + ' is not going ahead.\n\n— @family.', 'booked'));
  }
  return status;
}

function postMove_(body, action, began) {
  const t = read(TAB.jobs);
  const j = t.rows.find(x => S(x.job_id) === S(body.jobId) || String(x._row) === S(body.jobId));
  if (!j) return refuse_('err-job-not-found', 'not-found');
  const jobId = S(j.job_id) || String(j._row);
  if (body.requestId && seenRequest(body.requestId)) {
    return jsonOut({ success: true, duplicate: true });   // a double tap, already handled
  }

  const role = norm(body.role) === 'tutor' ? 'tutor' : 'client';
  const me = S(body.name), act = S(body.move), text = S(body.text);
  if (!me) return jsonOut({ error: 'No name given.' });
  /* NO ACCEPT/DECLINE (owner, 27 Nov): nobody answers a booking; a lesson is confirmed at once inside the tutor's availability (addLesson). */
  if (act === ACT.ACCEPT || act === ACT.DECLINE) return jsonOut({ error: 'Bookings are confirmed at once now: nothing to accept or decline.', why: 'no-answer' });

  const before = participantsOf(jobId);
  const mine = before.find(p2 => key(p2.name) === key(me));
  const others = before.filter(p2 => p2.role !== role);

  /* ---------- THE ADMIN MAY ANSWER ANY REQUEST § */
  const iAmAdmin = isAdminPerson(S(body.adminName) || me);
  /* AN ADMIN WHO BOOKED IT THEMSELVES still answers as the business when the Accept tile says so (`asAdmin`), or their own booking could never be accepted. */
  const asAdmin = (!mine || TRUE_(body.asAdmin)) && iAmAdmin && (act === ACT.ACCEPT || act === ACT.DECLINE);

  // Joining is a Request from someone not yet involved. Everything else needs you in already.
  if (!mine && !asAdmin && act !== ACT.REQUEST) {
    return refuse_('err-not-in-session', 'not-yours');
  }
  if (!mine && !asAdmin) {
    const joinNo = moveJoinRefusal_(j, jobId, role, me, before, body);
    if (joinNo) return jsonOut({ error: joinNo });
  }

  const aim = moveTarget_(body, act, asAdmin, before, others);
  const them = aim.them, target = aim.target;
  // Only moves ABOUT someone need one. Request opens a negotiation and Withdraw ends your own
  // part in it — a "No preference" job with no applicants must still be leaveable.
  const moveNo = moveRefusal_(j, act, role, mine, asAdmin, target, others, before);
  if (moveNo !== null) return jsonOut({ error: moveNo });

  // THE write. One append — no slot to find, no status cells to keep in step, nothing to
  // clear on the way out. The participant list is recomputed from this on the next read.
  /* WHO DECIDED, IN THEIR OWN NAME. § */
  /* AN ADMIN'S ACCEPT IS NOT LOGGED IN THEIR OWN NAME, and this is the one thing that has to be right about it. § */
  if (!asAdmin) {
    logEvent({ jobId, actor: me, role, action: act, target: target ? target.name : '',
               message: text, requestId: body.requestId });
  }

  moveAdminSettle_(before, act, asAdmin, me, body, jobId);

  // Edit carries the new terms. They're job-level — one weekday, one venue, one price — so
  // they're the one thing still written to a cell rather than derived.
  moveEdits_(t, j, act, body);

  // Accepting a tutor settles who teaches: the rest are declined by the same act, because two
  // tutors can't both teach it and a second step would leave a window where one thinks they
  // have it and another thinks it's open.
  if (act === ACT.ACCEPT && role === 'client' && them) moveTutorChosen_(t, j, jobId, me, role, others, target);

  // The job's status, from who is left. Written for readability in the sheet; nothing reads it.
  const status = moveStatus_(t, j, jobId, act);

  // Tell whoever didn't move. Keying this off "whose turn is next" is what previously meant
  // declines, withdrawals and payments notified nobody — those moves end the turn-taking.
  moveTell_(j, act, me, text, target, others);

  const after = participantsOf(jobId);
  const mineAfter = after.find(p2 => key(p2.name) === key(me));
  return jsonOut({ success: true, jobStatus: status,
                   mine: mineAfter ? mineAfter.status : '',
                   participants: after });
}

/* JOINING A SESSION YOU ARE NOT IN: a family needs a seat and consent, a tutor needs to be one. The words, or "". */
function moveJoinRefusal_(j, jobId, role, me, before, body) {
  if (role === 'client') {
    /* THE SAME CAP AS BOOKING (owner, 7 Nov): place and tutor via `seatCapFor_`, so a tutor holding 1 seat is not joined past it. */
    const teacher = tutorsIn(jobId).find(p2 => p2.status !== BM.NONE) || null;
    const caps = [seatCapFor_(j.venue, teacher ? teacher.name : ''), N(j.max_students)].filter(x => x > 0);
    const cap = caps.length ? Math.min.apply(null, caps) : 4;
    if (before.filter(p2 => p2.role === 'client').length >= cap) {
      return 'This session is full.';
    }
    /* AND THE FAMILY WHOSE BOOKING IT IS HAS TO HAVE SAID YES. § */
    if (!TRUE_(j.open_to_others)) {
      return 'That session is not open to other families.';
    }
  } else {
    /* TAKING A SESSION AS ITS TUTOR NEEDS A TUTOR. § */
    const meRow = findPerson(me, S(body.personId));
    if (!meRow || !(whoMay_(meRow, 'admin') || (hasRole(meRow, 'tutor') && !tutorPending_(meRow)))) {
      return (meRow && tutorPending_(meRow)
        ? 'You can take sessions once @family. has approved you as a tutor.'
        : 'Only a tutor can take a session.');
    }
    // "No preference" IS the client's consent to being matched with someone they didn't
    // pick. Without it, no.
    if (!TRUE_(j.stealable)) return 'This job is not open to other tutors.';
    if (tutorStatusOf(jobId) === 'Confirmed') return 'This job already has its tutor.';
  }
  return '';
}

/* AN ADMIN ANSWERS FOR THE WHOLE ROOM: everybody accepted, or everybody declined. */
function moveAdminSettle_(before, act, asAdmin, me, body, jobId) {
  /* AN ADMIN'S ACCEPT SETTLES THE WHOLE ROOM. § */
  if (asAdmin && act === ACT.ACCEPT) {
    before.forEach(pp => logEvent({
      jobId, actor: pp.name, role: pp.role, action: ACT.ACCEPT,
      message: 'accepted by ' + me,
      requestId: S(body.requestId) ? S(body.requestId) + '-' + key(pp.name) : '',
    }));
  }
  /* AND A DECLINE CLEARS IT. One Decline names one person; the business turning a booking down
     is turning it down for everybody in it. */
  if (asAdmin && act === ACT.DECLINE) {
    before.forEach(pp => logEvent({
      jobId, actor: me, role: 'admin', action: ACT.DECLINE, target: pp.name,
      message: 'declined by ' + me,
      requestId: S(body.requestId) ? S(body.requestId) + '-d-' + key(pp.name) : '',
    }));
  }
}

/* THE NEW TERMS AN Edit OR Request CARRIES, written to the job's cells — never a price: only `serverPrice_` makes one (owner, 17 Nov). */
function moveEdits_(t, j, act, body) {
  if ((act === ACT.EDIT || act === ACT.REQUEST) && body.edits) {
    const MAP = { subject:'subject', level:'level', day:'weekday', time:'start_time',
                  venue:'venue', students:'max_students' };
    Object.keys(body.edits).forEach(k => {
      const f = MAP[k], v = body.edits[k];
      if (f && v !== '' && v != null) setCell(t, j, f, k === 'time' ? fmtTime(v) : v);
    });
  }
}

/* A FAMILY ACCEPTED A TUTOR: the job closes to others and the rest are declined and told. */
function moveTutorChosen_(t, j, jobId, me, role, others, target) {
  setCell(t, j, 'stealable', 'FALSE');
  others.filter(p2 => key(p2.name) !== key(target.name)).forEach(o => {
    logEvent({ jobId, actor: me, role, action: ACT.DECLINE, target: o.name,
               message: 'another tutor was chosen' });
    /* `booked` both — the decision on an application, which a tutor must not learn by noticing. */
    notify(o.name, 'Not taken forward: ' + S(j.subject),
      'The family chose another tutor this time.\n\n— @family.', 'booked');
  });
  notify(target.name, "You're teaching " + S(j.subject),
    'You were picked for ' + S(j.subject) + '.\n\nLog in to @family. to agree the terms.\n\n— @family.', 'booked');
}

/* TELL WHOEVER DID NOT MOVE, with a heading by the act. */
function moveTell_(j, act, me, text, target, others) {
  const HEAD = { Edit: me + ' changed the terms for ' + S(j.subject) +
                       ' — everyone needs to agree again',
                 Say:  me + ' left a note about ' + S(j.subject),
                 Request: me + ' sent terms for ' + S(j.subject),
                 Accept: 'Accepted: ' + S(j.subject),
                 Decline: 'Not going ahead: ' + S(j.subject),
                 Withdraw: me + ' withdrew from ' + S(j.subject),
                 Pay: 'Paid: ' + S(j.subject) };
  /* ---------- WHICH OF THESE SOMEBODY MAY TURN OFF, BY THE ACT § */
  const tellThese = target ? [target.name] : others.map(p2 => p2.name);
  tellThese.forEach(n => notify(n, HEAD[act] || ('Update on ' + S(j.subject)),
    me + ' ' + act.toLowerCase() + 'ed on ' + S(j.subject) + '.' +
    (text ? '\n\nTheir message:\n"' + text + '"' : '') +
    '\n\nLog in to @family. to respond.\n\n— @family.',
    (act === ACT.ACCEPT || act === ACT.DECLINE || act === ACT.WITHDRAW) ? 'booked' : 'bookings'));
}

/* --- ADD A LESSON (owner, 27 Nov: BOOKING IS ADDING TO THE ONE LIST; NO ACCEPT/DECLINE; MONEY) ---------------------------------------
   The request/accept/decline path is gone: a lesson inside the tutor's availability is confirmed at once and the tutor is told (a push, never a
   question). It pays every lesson to the end of its term up front (pay 'owed' until the checkout's return writes 'paid'; an admin may skip:
   'skipped'). Booked by the learner (an adult), a parent of the learner, or an admin; a child never books (actions.json grownUp). Kept in the
   learner's `lessons` cell (booking.gs). tools/lesson-book.js checks it. */
const LESSON_DMY_ = iso => iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4);
const LESSON_DAYS_ = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
/* ITS PRICE BY THE RULES (serverPrice_, the site's own priceFrom): pence in all and per lesson, the tutor's pay; null when it cannot be priced. */
function lessonPrice_(b, tutor, dates, minutes) {
  const d0 = dates[0], wd = (Math.floor(lsMin_(d0) / 1440) + 3) % 7;
  let P = null;
  try {
    P = serverPrice_({ requestedTutor: personDisplayName(tutor), subject: S(b.subject), level: S(b.level), n: 1, location: S(b.venue),
      day: LESSON_DAYS_[wd], time: d0.slice(11, 16), hours: minutes / 60, slots: 'x', dates: dates.map(LESSON_DMY_).join(',') });
  } catch (e) { P = null; }
  if (!P || !(N(P.price) > 0)) return null;
  const total = Math.round(N(P.price) * 100);
  return { totalPence: total, perLessonPence: Math.round(total / dates.length), tutorPayPence: Math.round(N(P.tutorPay) * 100) };
}
/* EVERY TERM THIS YEAR AND NEXT, and the closed days as yyyy-mm-dd: the term-date rule. */
function lessonCalendar_(startIso) {
  const y = +startIso.slice(0, 4), m = +startIso.slice(5, 7), sy = m >= 8 ? y : y - 1;
  const terms = termsFor(sy).concat(termsFor(sy + 1));
  const shut = closures().map(c => { const p = S(c.date).split('/'); return p.length === 3 ? p[2] + '-' + p[1] + '-' + p[0] : ''; }).filter(Boolean);
  return { terms, shut };
}
function lessonSave_(t, row, list) {
  const cell = JSON.stringify({ v: 1, lessons: list });
  if (cell.length > LESSONS_CELL_MAX) return 'That would be more lessons than one account holds.';
  if (!setCell(t, row, 'lessons', cell)) return 'The people tab has no lessons column.';
  return '';
}
function postAddLesson_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me) return refuse_('err-sign-in-first', 'not-signed-in');
  if (isChild_(me)) return jsonOut({ error: KID_ASK_PARENT, why: 'ask-a-parent' });
  const admin = rankAtLeast_(me, 'admin');
  /* WHO IT IS FOR: an id, else a child of theirs by name (the booking form's), else themselves. */
  const byName = S(body.learner) ? acceptedChildren(S(me.person_id)).find(c => key(personDisplayName(c)) === key(body.learner) || key(c.first_name) === key(body.learner)) : null;
  const learner = S(body.learnerId) ? findPerson('', S(body.learnerId)) : (byName || me);
  if (!learner) return jsonOut({ error: 'Who is the lesson for?' });
  const mine = S(learner.person_id) === S(me.person_id) || acceptedChildren(S(me.person_id)).some(c => S(c.person_id) === S(learner.person_id));
  if (!mine && !admin) return jsonOut({ error: 'You can book only for yourself or your own children.', why: 'not-yours' });
  const tutor = findPerson(S(body.tutor), S(body.tutorId));
  if (!tutor || !(hasRole(tutor, 'tutor') || rankAtLeast_(tutor, 'admin'))) return jsonOut({ error: 'Choose a tutor.' });
  if (S(tutor.person_id) === S(learner.person_id)) return jsonOut({ error: 'A tutor cannot book a lesson with themselves.' });
  const minutes = Math.round(N(body.minutes) || 60);
  if (minutes < 15 || minutes > LESSON_MINUTES_MAX) return jsonOut({ error: 'A lesson is 15 minutes to ' + (LESSON_MINUTES_MAX / 60) + ' hours.' });
  const it = { start: S(body.start).slice(0, 16), rrule: S(body.rrule).slice(0, 120), rdate: (Array.isArray(body.rdate) ? body.rdate : []).map(S).filter(lsMin_).slice(0, 20) };
  if (lsMin_(it.start) == null) return jsonOut({ error: 'When is the first lesson?' });
  if (it.rrule && !/^(RRULE:)?FREQ=(WEEKLY|DAILY)(;[A-Z]+=[A-Z0-9,]+)*$/i.test(it.rrule)) return jsonOut({ error: 'That repeat is not one the calendar reads.' });
  const now = lsIso_(Math.floor(Date.now() / 6e4));
  const cal = lessonCalendar_(it.start), plan = lessonPlanPure_(it, cal.terms, cal.shut);
  const dates = plan.dates.filter(d => d > now);
  if (!plan.term || !dates.length) return jsonOut({ error: 'No lesson of that falls in term time.' });
  /* THE TUTOR'S YES IN ADVANCE, and nobody booked twice. */
  if (!lessonInAvailPure_(dates, minutes, availSet(tutor.availability)))
    return jsonOut({ error: personDisplayName(tutor) + ' is not free then: choose a time inside their availability.', why: 'not-free' });
  const price = lessonPrice_(body, tutor, dates, minutes), skip = admin && TRUE_(body.skipPay);
  if (!price && !skip) return jsonOut({ error: 'That lesson could not be priced.' });
  /* STARTING STRAIGHT AWAY (owner, 28 Nov; the Consumer Contracts Regulations' express request): a lesson term is paid only once the payer has
     ticked that lessons start at once, so the right to cancel ends when they begin; the tick's moment is kept on the lesson. */
  if (!skip && !TRUE_(body.earlyStart)) return refuse_('err-tick-early-start', 'no-early-start');
  let saved = null;
  const early = withWriteLock_(() => {
    clearCache();
    const all = allLessons_();
    const busy = all.filter(x => S(x.ls.tutorId) === S(tutor.person_id) || S(x.ls.learnerId) === S(learner.person_id)).map(x => x.ls);
    const clash = lessonClashPure_(dates, minutes, busy);
    if (clash) return jsonOut({ error: 'That clashes with another lesson at ' + clash.replace('T', ' ') + '.', why: 'clash' });
    const t = read(TAB.people), row = t.rows.find(r => S(r.person_id) === S(learner.person_id));
    const ls = { id: 'L-' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36), kind: 'lesson',
      title: ('Lesson ' + S(body.subject)).trim().slice(0, 120), start: dates[0], minutes, rrule: it.rrule, rdate: it.rdate,
      exdate: plan.skipped, moved: [], dates, term: S(plan.term.name),
      tutorId: S(tutor.person_id), learnerId: S(learner.person_id), payerId: S(me.person_id),
      subject: S(body.subject).slice(0, 60), level: S(body.level).slice(0, 40), venue: S(body.venue).slice(0, 80), room: S(body.room).slice(0, 60),
      totalPence: price ? price.totalPence : 0, perLessonPence: price ? price.perLessonPence : 0, tutorPayPence: price ? price.tutorPayPence : 0,
      pay: skip ? 'skipped' : 'owed', earlyStartAt: skip ? '' : new Date().toISOString(), bookedAt: now };
    const why = lessonSave_(t, row, lessonsOfRow_(row).concat([ls]));
    if (why) return jsonOut({ error: why });
    saved = ls;
  }, { wait: 10000, busy: () => refuse_('err-busy', 'busy') });
  if (early) return early;
  /* THE TUTOR IS TOLD, NOT ASKED; the payer gets the receipt (the site's booking card; a child's carries no price). */
  /* THE LESSON IS THE LETTER'S SOURCE (cardLetterRow_ picks the card's fields); only what it says another way is worked out here. */
  lessonNotify_(Object.assign({}, saved, { subject: S(saved.subject) || 'Lesson', day: saved.start.slice(0, 10), time: saved.start.slice(11, 16), location: saved.venue,
    dates: saved.dates.map(d => fmtDate_(d.slice(0, 10), 'short')).join(', '), price: saved.totalPence / 100, requestedTutor: personDisplayName(tutor) }),
    personDisplayName(me), saved.id, true);
  return jsonOut({ success: true, lesson: lessonForViewerPure_(saved, 'payer') });
}

/* --- THE LESSONS A PERSON MAY SEE: their own, their children's, the ones they teach, and every one for an admin; each as lessonForViewerPure_
   sends it (a child no money). */
function postLessons_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me) return refuse_('err-sign-in-first', 'not-signed-in');
  const out = [];
  allLessons_().forEach(x => { const as = lessonViewAs_(me, x.ls), o = as ? lessonForViewerPure_(x.ls, as) : null;
    if (o) { o.learner = fmtName_(x.row); o.tutor = fmtName_(findPerson('', S(x.ls.tutorId)) || ''); o.as = as; out.push(o); } });
  return jsonOut({ success: true, lessons: out });
}

/* --- PAYING FOR A LESSON: its payer (or a parent) checks out the term's total; the return marks it paid. */
function lessonCheckout_(body) {
  const me = findPerson('', S(body.personId));
  const hit = allLessons_().find(x => S(x.ls.id) === S(body.lessonId));
  if (!me || !hit) return refuse_('err-no-lesson', 'not-found');
  if (lessonViewAs_(me, hit.ls) !== 'payer') return jsonOut({ error: 'Only the family pays for a lesson.', why: 'not-yours' });
  if (S(hit.ls.pay) !== 'owed' || !(N(hit.ls.totalPence) > 0)) return jsonOut({ error: 'Nothing to pay for that lesson.' });
  /* THE EARLY-START TICK (owner, 28 Nov) comes before any payment: ticked at booking, or here (a lesson moved from an old booking). */
  if (!S(hit.ls.earlyStartAt)) {
    if (!TRUE_(body.earlyStart)) return refuse_('err-tick-early-start', 'no-early-start');
    const t = read(TAB.people), list = lessonsOfRow_(hit.row), ls = list.find(x => S(x.id) === S(hit.ls.id));
    ls.earlyStartAt = new Date().toISOString();
    const why = lessonSave_(t, t.rows.find(r => S(r.person_id) === S(hit.row.person_id)), list);
    if (why) return jsonOut({ error: why });
  }
  const stripeKey = PropertiesService.getScriptProperties().getProperty('STRIPE_TEST_KEY');
  if (!stripeKey) return refuse_('err-no-stripe-key', 'no-key');
  const ref = 'PAY-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  PropertiesService.getScriptProperties().setProperty(ref, JSON.stringify({ lessonId: S(hit.ls.id), payer: S(me.person_id) }));
  const params = { 'mode': 'payment', 'success_url': siteLink_('paid', '1') + '&ref=' + ref, 'cancel_url': siteLink_('paid', '0'), 'client_reference_id': ref,
    'line_items[0][price_data][currency]': 'gbp',
    'line_items[0][price_data][product_data][name]': (S(hit.ls.title) || 'Lesson') + ' — ' + hit.ls.dates.length + ' lessons, ' + S(hit.ls.term),
    'line_items[0][price_data][unit_amount]': String(Math.round(N(hit.ls.totalPence))), 'line_items[0][quantity]': '1' };
  try {
    const res = UrlFetchApp.fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'post', headers: { Authorization: 'Bearer ' + stripeKey }, payload: params, muteHttpExceptions: true });
    const d = JSON.parse(res.getContentText());
    if (!d.url) return jsonOut({ error: (d.error && d.error.message) || 'Stripe refused the request.' });
    PropertiesService.getScriptProperties().setProperty(ref + '_session', S(d.id));
    return jsonOut({ success: true, url: d.url });
  } catch (err) { return jsonOut({ error: 'Could not reach Stripe: ' + err }); }
}
/* THE RETURN: Stripe says paid, so the lesson is (its payment reference kept). No refund goes through the site (owner, 28 Nov). */
function lessonPaid_(lessonId, payIntent) {
  clearCache();
  const t = read(TAB.people), row = t.rows.find(r => lessonsOfRow_(r).some(x => S(x.id) === S(lessonId)));
  if (!row) return false;
  const list = lessonsOfRow_(row), ls = list.find(x => S(x.id) === S(lessonId));
  if (ls.pay === 'paid') return true;
  ls.pay = 'paid'; ls.payIntent = S(payIntent);
  return !lessonSave_(t, row, list);
}


/* THE PAYER'S RECEIPT AND THE TUTOR'S NOTE for a new lesson (addLesson): the tutor is told, never asked (owner, 27 Nov). */
function lessonNotify_(body, me, jobId, named) {
  /* THE CLIENT'S RECEIPT — `booked`, essential: it carries the total they asked to pay. THE ONE CARD MAKER (`renderCard`, copied
     from the site by tools/cards-gen.js) with the email's `inline: 'text'`, never lines of our own; read as its reader, so a child's carries no price. */
  /* ITS PARTS ARE THE SITE CARD'S (kinds.json booking `card.record`, said by `card.letter.words`), their fields picked from the body by `cardLetterRow_`. */
  const card = cardLetterRow_('booking', body);
  const mine = findPerson(me);
  notify(me, 'Booked 🎉',
    'Thanks for booking ' + S(body.subject) + ' with @family.\n\n' +
    renderCard({ kind: 'booking', inline: 'text', row: card, see: { kid: isChild_(mine) } }) + '\n\n— @family.', 'booked');
  /* ---------- AND THE NAMED TUTOR'S — `booked` TOO, WHICH THE SURVEY OF 9 OCT HAD AS OPTIONAL § */
  if (named) {
    /* THE BOOKER BY `fmtName_`: a child's surname never leaves the server. The tutor's card has no price — the family's money is theirs. */
    const who = fmtName_(mine || me);
    deliver_(S(body.requestedTutor), 'bookings', { push: { title: 'New lesson: ' + S(body.subject),
      body: who + ' · ' + fmtDate_(body.day, 'day') + ' ' + fmtDate_(body.time, 'time'), link: 'lesson:' + jobId } });
    notify(S(body.requestedTutor),
      'New lesson: ' + S(body.subject) + ' — ' + who,
      who + ' has booked a lesson with you.\n\n' + renderCard({ kind: 'booking', inline: 'text', row: Object.assign({}, card, { dates: '' }), see: { prices: false } }) + '\n' +
      (S(body.message) ? '\nTheir message:\n"' + S(body.message) + '"\n' : '') +
      '\nIt is inside your availability, so it is booked: nothing to answer.\n\n— @family.', 'booked');
  }
}

function postOpenWaitlist_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return refuse_('err-not-signed-in', 'not-signed-in');
  if (!isAdminPerson(personDisplayName(me))) {
    return jsonOut({ error: 'Only an admin can open a waiting list.' });
  }
  const venue = S(body.venue);
  if (!venue) return refuse_('err-which-venue', 'no-venue');

  const t = read(TAB.jobs);
  /* ONE PER VENUE AND LEVEL. Two open lists for the same class split the families between them
     and neither ever fills — the whole mechanism depends on everybody landing in one place. */
  const already = t.rows.find(r => norm(r.kind) === 'waitlist'
    && TRUE_(r.open_to_others)
    && key(r.venue) === key(venue)
    && key(r.level) === key(S(body.level)));
  if (already) {
    return jsonOut({ error: 'A waiting list for ' + venue + ' is already open.' });
  }

  /* `waitlistPrice_` WAS A FUNCTION I INVENTED. The real one is `waitlistPrice(venue)` and it
     takes the venue alone — the level does not change what a seat costs on a shared class. */
  const price = waitlistPrice(venue);
  if (!price) {
    return refuse_('err-venue-no-price', 'no-price');
  }
  const jobId = 'W-' + Date.now();
  addRow(t, {
    job_id: jobId,
    status: 'unconfirmed',
    kind: 'waitlist',
    subject: 'Maths, English Language',
    level: S(body.level),
    service: 'Group',
    venue: venue,
    weekday: '', start_time: '',
    hours_per_session: price.hours,
    price_total: price.perSeatSession,
    max_students: price.seats,
    open_to_others: 'TRUE',
    /* ---------- THE COLUMN NAMES THE SHEET ACTUALLY USES § */
    term_name: termForNow(),
    booked_by: '',
  });
  /* AN EVENT SAYING IT WAS OPENED, and deliberately not a REQUEST — `participantsOf` folds
     REQUEST into a seat, so using it here would put the admin on the list, which is the whole
     thing this exists to avoid. */
  /* `ACT.SAY`, NOT A NAME I MADE UP. § */
  logEvent({ jobId, actor: personDisplayName(me), role: 'admin', action: ACT.SAY,
             message: 'opened the waiting list', requestId: S(body.requestId) });
  clearCache();
  return jsonOut({ ok: true, jobId: jobId });
}

function postJoinWaitlist_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return refuse_('err-not-signed-in', 'not-signed-in');

  const venue = S(body.venue);
  if (!venue) return refuse_('err-which-venue', 'no-venue');

  const price = waitlistPrice(venue);
  /* NOT PRICED IS NOT FREE. A venue with no rate, or an open tutor rate nobody has set, means
     the seat cannot be costed — and putting somebody on a list at £0.00 is a promise. */
  if (!price) {
    return refuse_('err-venue-no-price', 'no-price');
  }

  const t = read(TAB.jobs);
  let j = openWaitlistAt(venue);

  if (j) {
    const jobId = S(j.job_id) || String(j._row);
    const on = clientsIn(jobId);
    /* ALREADY ON IT. Said plainly rather than adding a second row for the same family, which
       would take two of the four seats and be invisible until somebody counted. */
    if (on.some(c => key(c.name) === key(personDisplayName(me)))) {
      return jsonOut({ error: 'You are already on that list.' });
    }
    /* ---------- FULL IS THE ROOM, AND SHUT IS THE CALENDAR § */
    const st = waitStage_(j);
    if (st.left <= 0) {
      return jsonOut({ error: 'That list is full — it will run once three of them have paid.' });
    }
  } else {
    /* THE FIRST FAMILY, so the session comes into existence around them. */
    const jobId = 'W-' + Date.now();
    addRow(t, {
      job_id: jobId,
      status: 'unconfirmed',
      kind: 'waitlist',
      /* BOTH SUBJECTS, and they are not a choice. One tutor teaching Maths and English to four
         children is what this session IS, so it is written here rather than asked. */
      subject: 'Maths, English Language',
      level: S(body.level),
      service: 'Group',
      venue: venue,
      /* NO DAY AND NO TIME YET. They are settled when the list fills and you make it a session;
         a time written now would be a promise to four families about a room nobody has booked. */
      weekday: '', start_time: '',
      hours_per_session: price.hours,
      /* WHAT ONE SEAT COSTS, which is what every family on this list is charged. § */
      price_total: price.perSeatSession,
      max_students: price.seats,
      /* ONE CHILD EACH. The seats are the point of the price, and a family taking two would be
         buying half the session at a quarter of the cost. */
      for_children: '',
      /* OPEN BY DEFINITION. A waitlist is strangers agreeing to share, which is the whole
         product — there is nothing to ask. */
      open_to_others: 'TRUE',
      /* NOBODY IS PICKED. A tutor is assigned when it runs, and the rate it is priced at is the
         one for a tutor nobody chose. */
      stealable: 'TRUE',
      /* ---------- WHEN IT SHUTS, WORKED OUT RATHER THAN SENT § */
      closes_on: waitShutsOn_() || '',
      created_at: new Date(),
    });
    j = t.rows[t.rows.length - 1];
  }

  const jobId = S(j.job_id) || String(j._row);
  /* WHEN THEY COULD COME, ON THEIR OWN JOINING EVENT. § */
  const when = S(body.availability);
  logEvent({ jobId, actor: personDisplayName(me), role: 'client', action: ACT.REQUEST,
             message: 'joined the waitlist' + (when ? ' — can come: ' + when : ''),
             requestId: S(body.requestId) });
  clearCache();

  /* THEIR OWN RECEIPT, at their own seat price, written now for the same reason every other one is: § */
  const receipt = writeReceipt_({
    kind: 'waitlist', jobId: jobId,
    personId: S(me.person_id), personName: personDisplayName(me),
    total: price.perSeatSession, currency: 'GBP',
    lines: [
      { k: 'Venue', v: venue },
      { k: 'Subjects', v: 'Maths, English Language' },
      { k: 'Seat', v: '1 of ' + price.seats },
      { k: 'Per hour, whole session', v: price.hourlyWhole },
      { k: 'Per hour, your seat', v: price.perSeatHour },
    ],
    note: 'Waitlist seat — nothing is charged until the list is full.',
  });

  const now = clientsIn(jobId);
  return jsonOut({ success: true, jobId: jobId,
    /* WHERE IT HAS GOT TO, so the card can say "3 of 4" rather than "you are on a list". */
    joined: now.length, seats: price.seats,
    full: now.length >= price.seats,
    perSeat: price.perSeatSession,
    receiptId: receipt.receiptId || '', receiptError: receipt.error || '' });
}

/* AN ADMIN ENDS A SESSION --------------------------------------------------------------- DELETING A JOB IS WITHDRAWING EVERYONE FROM IT. § */
function postDeleteJob_(body, action, began) {
  const t = read(TAB.jobs);
  const j = t.rows.find(x => S(x.job_id) === S(body.jobId)
                          || String(x._row) === S(body.jobId));
  if (!j) return refuse_('err-no-session', 'not-found');
  const jobId = S(j.job_id) || String(j._row);
  const by = S(body.adminName) || S(body.name);

  const before = participantsOf(jobId);
  if (!before.length) {
    /* Already empty — the job is invisible and there is nobody to withdraw. Reported as done
       rather than as an error: pressing delete on something already deleted should not read as
       a failure. */
    setCell(t, j, 'status', 'cancelled');
    clearCache();
    return jsonOut({ success: true, alreadyEmpty: true });
  }

  /* ONE WITHDRAW EACH, in their own name, so the log says who left rather than that an admin
     did something unnamed to the roster. `message` is what makes it readable a year later. */
  before.forEach(pp => logEvent({
    jobId, actor: pp.name, role: pp.role, action: ACT.WITHDRAW,
    message: 'session ended by ' + by,
    requestId: S(body.requestId) ? S(body.requestId) + '-' + key(pp.name) : '',
  }));
  clearCache();

  setCell(t, j, 'status', jobStatusOf(jobId));
  /* Nobody may pick it up afterwards — an open job with no clients is a job a tutor could
     apply to and never hear about again. */
  setCell(t, j, 'stealable', 'FALSE');
  clearCache();

  /* TELL THEM. A session vanishing from somebody's screen with no word is the worst version of
     this: they turn up, or they do not turn up and never know why. */
  before.forEach(pp => notify(pp.name, 'Cancelled: ' + S(j.subject),
    renderCard({ kind: 'booking', inline: 'text', use: 'cancelled', row: cardLetterRow_('booking', j, 'cancelled'), see: { prices: false } })
    + '\n\nThis is not going ahead.\n\nIf that is a surprise, reply to this message.\n\n— @family.', 'booked'));

  return jsonOut({ success: true, ended: before.length,
                   who: before.map(x => x.name) });
}
