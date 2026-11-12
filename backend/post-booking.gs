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

  const stripeKey = PropertiesService.getScriptProperties().getProperty('STRIPE_TEST_KEY');
  if (!stripeKey) return jsonOut({ error: 'Stripe key not set. Add STRIPE_TEST_KEY in Project Settings → Script Properties.' });

  const t = read(TAB.jobs);
  const j = t.rows.find(x => S(x.job_id) === S(body.jobId));
  if (!j) return jsonOut({ error: 'Job not found.' });
  const me = S(body.name);
  const mine = participantsOf(S(j.job_id)).find(p2 => key(p2.name) === key(me));
  if (!mine) return jsonOut({ error: "You're not part of this session." });
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
    'success_url': SITE_URL + '?paid=1&ref=' + ref,
    'cancel_url': SITE_URL + '?paid=0',
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
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return jsonOut({ error: 'Busy — open the site again in a moment to finish.', why: 'busy' });
  try {
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
    let paid = false;
    try {
      const res = UrlFetchApp.fetch('https://api.stripe.com/v1/checkout/sessions/' + sessionId, {
        method: 'get', headers: { Authorization: 'Bearer ' + stripeKey }, muteHttpExceptions: true
      });
      const d = JSON.parse(res.getContentText());
      paid = S(d.payment_status) === 'paid';
    } catch (err) {
      return jsonOut({ error: 'Could not confirm the payment with Stripe: ' + err });
    }
    if (!paid) return jsonOut({ error: 'Stripe says that session has not been paid.' });

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
      payer + ' has paid and is confirmed in the class.\n\n— @family.', 'bookings');
    return jsonOut({ success: true, jobId: S(jobId) });
  } finally { lock.releaseLock(); }
}

/* MARKING A SESSION PAID, BY HAND ------------------------------------------------------- PEOPLE PAY IN CASH. § */
/* THE ROOM IN THE VENUE, written by staff after booking; the family never picks it. */
function postSetRoom_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  const t = read(TAB.jobs);
  const j = t.rows.find(x => S(x.job_id) === S(body.jobId) || String(x._row) === S(body.jobId));
  if (!j) return jsonOut({ error: 'No session with that id.' });
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
    return 'Waiting for ' + target.name + ' to accept or decline.';
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
  if (!j) return jsonOut({ error: 'Job not found.' });
  const jobId = S(j.job_id) || String(j._row);
  if (body.requestId && seenRequest(body.requestId)) {
    return jsonOut({ success: true, duplicate: true });   // a double tap, already handled
  }

  const role = norm(body.role) === 'tutor' ? 'tutor' : 'client';
  const me = S(body.name), act = S(body.move), text = S(body.text);
  if (!me) return jsonOut({ error: 'No name given.' });

  const before = participantsOf(jobId);
  const mine = before.find(p2 => key(p2.name) === key(me));
  const others = before.filter(p2 => p2.role !== role);

  /* ---------- THE ADMIN MAY ANSWER ANY REQUEST § */
  const iAmAdmin = isAdminPerson(S(body.adminName) || me);
  /* AN ADMIN WHO BOOKED IT THEMSELVES still answers as the business when the Accept tile says so (`asAdmin`), or their own booking could never be accepted. */
  const asAdmin = (!mine || TRUE_(body.asAdmin)) && iAmAdmin && (act === ACT.ACCEPT || act === ACT.DECLINE);

  // Joining is a Request from someone not yet involved. Everything else needs you in already.
  if (!mine && !asAdmin && act !== ACT.REQUEST) {
    return jsonOut({ error: "You're not part of this session." });
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
    if (!meRow || !(hasRole(meRow, 'admin') || (hasRole(meRow, 'tutor') && !tutorPending_(meRow)))) {
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

/* THE NEW TERMS AN Edit OR Request CARRIES, written to the job's cells. */
function moveEdits_(t, j, act, body) {
  if ((act === ACT.EDIT || act === ACT.REQUEST) && body.edits) {
    const MAP = { subject:'subject', level:'level', day:'weekday', time:'start_time',
                  venue:'venue', price:'price_total', students:'max_students' };
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

/* --- A TUTOR ANSWERING A REQUEST (488) ----------------------------------------------------- the named tutor, or an admin, says yes or no in one press. */
function postAnswerRequest_(body, action, began) {
  const asker = findPerson('', S(body.personId));
  if (!asker) return jsonOut({ error: 'Sign in first.' });
  const yes = TRUE_(body.yes), reason = S(body.reason).slice(0, 200);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return jsonOut({ error: 'Busy — please press again in a moment.' });
  let j = null, tutorName = '', clients = [], status = '';
  try {
    clearCache();
    const t = read(TAB.jobs);
    j = t.rows.find(x => S(x.job_id) === S(body.jobId) || String(x._row) === S(body.jobId));
    if (!j) return jsonOut({ error: 'Job not found.' });
    const jobId = S(j.job_id) || String(j._row);
    const me = personDisplayName(asker), admin = rankAtLeast_(asker, 'admin');
    const pending = tutorsIn(jobId).filter(p2 => p2.status === BM.WAITING);
    const mine = pending.find(p2 => key(p2.name) === key(me));
    const who = mine || (admin ? pending[0] : null);
    if (!who) return jsonOut({ error: admin ? 'Nothing is waiting for an answer.' : 'This request is not yours to answer.' });
    if (!admin && !rankAtLeast_(asker, 'staff')) return jsonOut({ error: 'Only a tutor can answer a request.' });
    tutorName = who.name;
    clients = clientsIn(jobId);
    const by = mine ? '' : ' (answered by ' + me + ')';
    if (yes) {
      /* MUTUAL, as the lobby's Accept is: the client is Agreed too, so Pay and confirm is theirs next. */
      clients.forEach(c => logEvent({ jobId, actor: tutorName, role: 'tutor', action: ACT.ACCEPT,
        target: c.name, message: 'accepted the request' + by }));
      if (jobAgreed_(jobId)) {
        const frozen = jobMoneyFreeze_(j, config(), new Date());
        if (frozen) Object.keys(frozen).forEach(f => setCell(t, j, f, frozen[f]));
      }
    } else {
      /* THE TUTOR LEAVES, THE FAMILY STAYS: their card reads Declined, with the reason, from this event. */
      logEvent({ jobId, actor: tutorName, role: 'tutor', action: ACT.DECLINE, target: tutorName,
        message: (reason || 'declined the request') + by });
    }
    status = jobStatusOf(jobId);
    setCell(t, j, 'status', status);
  } finally {
    lock.releaseLock();
  }
  clients.forEach(c => pushTo_(c.name, 'bookings', (yes ? 'Accepted: ' : 'Declined: ') + S(j.subject),
    tutorName + (yes ? ' accepted. Open to pay and confirm.' : ' cannot take it.'), 'job:' + (S(j.job_id) || String(j._row))));
  clients.forEach(c => notify(c.name,
    (yes ? 'Accepted: ' : 'Declined: ') + S(j.subject),
    tutorName + (yes ? ' accepted your request for ' + S(j.subject) + '.\n\nLog in to @family. to pay and confirm.'
                     : ' cannot take ' + S(j.subject) + (reason ? ':\n"' + reason + '"' : '.')
                       + '\n\nYou can ask another tutor, or choose No preference.')
    + '\n\n— @family.', 'booked'));
  return jsonOut({ success: true, accepted: yes, jobStatus: status });
}

/* --- a new booking ----------------------------------------------------------------------- */
function postCreateJob_(body, action, began) {
  const cfg3 = config();
  const cap = N(cfg3.max_open_requests) || 2;
  /* Either name. The booking form sends `clientName`; everything else on the site sends
     `name`, and one handler using its own word for the same thing is how the gate above came
     to disagree with it. */
  /* ---------- `clientName` IS AN ADMIN'S TO GIVE, AND NOBODY ELSE'S § */
  const asker = findPerson('', S(body.personId));
  const me = (asker && hasRole(asker, 'admin') && S(body.clientName)) || S(body.name);
  const t = read(TAB.jobs);

  // Without a cap one family can paper every open slot and tie up every tutor's queue.
  const tooMany = createJobCapRefusal_(me, cap, t);
  if (tooMany) return jsonOut({ error: tooMany });

  /* THE ONE NUMBER THE PHONE MUST NOT CHOOSE, checked before anything is written. § */
  /* ---------- IF THE CLIENT IS PAYING THE TRAVEL, IT IS ADDED HERE AND NOWHERE ELSE § */
  /* ---------- HOW MANY TIMES SOMEBODY MAKES THE JOURNEY § */
  const sessionCount = S(body.dates).split(',').filter(Boolean).length || 1;

  const travel = travelCost(S(body.location), sessionCount);
  const chargeTravel = N(cfg3.travel_on_client) > 0 && travel > 0;
  if (chargeTravel) body.price = N(body.price) + travel;

  const wrong = priceLooksWrong({
    price: body.price, venue: body.location, hours: body.hours,
    weeks: S(body.dates).split(',').filter(Boolean).length || 1,
    seats: body.n,
  });
  if (wrong) return jsonOut({ error: wrong });

  const jobId = S(body.forceItemId) || ('J-' + Date.now());
  const named = S(body.requestedTutor) && !/^(no preference|any)$/i.test(S(body.requestedTutor));
  /* A TUTOR WHO TICKED THE BOX AND IS WAITING CANNOT BE BOOKED BY NAME. § */
  const namedRow = named ? findPerson(S(body.requestedTutor)) : null;
  if (namedRow && tutorPending_(namedRow)) {
    return jsonOut({ error: 'That tutor is not taking bookings yet.' });
  }
  /* THE SEAT CAP, ASKED HERE TOO so a hand-built request cannot book past what the place or the tutor holds. */
  const seatCap = seatCapFor_(body.location, named ? S(body.requestedTutor) : '');
  if (seatCap > 0 && (N(body.n) || 1) > seatCap) {
    return jsonOut({ error: 'That is more seats than ' + seatCap + ' — the most this place and tutor hold. Nothing has been booked.' });
  }
  /* AT HOME THE BOOKING TAKES EVERY SEAT (owner, 8 Nov): fewer than the cap is refused, so nobody pays for one seat of a private session. */
  if (takesAllSeats_(body.location) && seatCap > 0 && (N(body.n) || 1) !== seatCap) {
    return jsonOut({ error: 'A booking at home takes all ' + seatCap + ' seat' + (seatCap === 1 ? '' : 's') + ' and is priced for each. Nothing has been booked.' });
  }
  /* AN ADMIN'S DISCOUNT, AND NOBODY ELSE'S — asked before anything is written, like the refusals above (`discountRefusal_`, booking.gs). § */
  const codes = S(body.discountCode) ? read(TAB.promo_codes) : null;
  const codeRow = codes ? (codes.rows.find(r => key(r.code) === key(body.discountCode)) || null) : null;
  const noDiscount = discountRefusal_(body, !!(asker && hasRole(asker, 'admin')), codeRow, new Date());
  if (noDiscount) return jsonOut({ error: noDiscount });
  /* THE CLASH TESTS AND THE WRITE IN ONE HOLD (434): two phones pressing Book in the same second must not both pass. */
  const bookLock = LockService.getScriptLock();
  if (!bookLock.tryLock(10000)) return jsonOut({ error: 'Busy — please press Book again in a moment.' });
  try {
    /* Fresh rows under the lock: a copy read before it may lack the booking that just took the hour. */
    clearCache();
    /* A TUTOR'S WEEK NO LONGER REFUSES (488): any day and hour may be asked; the tutor answers it (`answerRequest`). */
    /* AND THE ROOM'S HOURS (434): a room taken at any booked hour in those weeks refuses, whoever teaches. */
    const roomTaken = roomClashRefusal_(body);
    if (roomTaken) return jsonOut({ error: roomTaken });
    addRow(read(TAB.jobs), createJobRow_(body, { jobId, me, asker, named, cfg3, sessionCount }));
    if (codeRow) setCell(codes, codeRow, 'used', N(codeRow.used) + 1);

    /* Who is in it comes from here, not from cells on the row above — and inside the hold, since a job with no events reads as cancelled and holds no hour. */
    logEvent({ jobId, actor: me, role: 'client', action: ACT.REQUEST,
               message: S(body.message), requestId: body.requestId });
    if (named) {
      /* PENDING, NOT ACCEPTED (488): the named tutor is asked and answers it; nobody accepts on their behalf. */
      logEvent({ jobId, actor: S(body.requestedTutor), role: 'tutor', action: ACT.REQUEST,
                 message: 'requested directly by the family' });
    }
  } finally {
    bookLock.releaseLock();
  }

  createJobNotify_(body, me, jobId, named);
  const receipt = createJobReceipt_(body, me, jobId, chargeTravel, travel);

  /* A FAILED RECEIPT DOES NOT FAIL THE BOOKING. § */
  return jsonOut({ success: true, jobId,
    receiptId: receipt.receiptId || '', receiptError: receipt.error || '' });
}

/* ONE FAMILY'S OPEN REQUESTS AGAINST THE CAP: only OPEN ones count, settled ones hold nothing. '' when under it. */
function createJobCapRefusal_(me, cap, t) {
  if (!me) return '';
  let live = 0;
  t.rows.forEach(j => clientsIn(S(j.job_id) || String(j._row)).forEach(c => {
    if (key(c.name) === key(me) && c.status && c.status !== BM.BOOKED) live++;
  }));
  return live >= cap ? 'You already have ' + live + ' requests waiting. Please resolve one first.' : '';
}

/* THE NEW JOB'S ROW, as `postCreateJob_` writes it inside its hold. */
function createJobRow_(body, ctx) {
  const jobId = ctx.jobId, me = ctx.me, asker = ctx.asker, named = ctx.named, cfg3 = ctx.cfg3, sessionCount = ctx.sessionCount;
  const cash = v => S(v) !== '' ? Math.round(N(v) * 100) / 100 : '';
  return {
    job_id: jobId, status: 'unconfirmed',
    subject: S(body.subject), level: S(body.level), service: S(body.service),
    weekday: S(body.day), start_time: fmtTime(body.time),
    /* EVERY BOOKED HOUR (434): weekday + start + length kept only the first run, so a second run was sold twice. */
    slot_codes: bookingCodes_(body).join(','),
    // Per booking now, not one global figure — a client picking a three-hour slot has to have
    // that recorded, or the price and the grid disagree the next time the job is read.
    hours_per_session: N(body.hours) || N(cfg3.h) || 2,
    venue: S(body.location),
    client_hosts: body.hosting ? 'TRUE' : 'FALSE',
    term_name: S(body.interval), session_dates: S(body.dates),
    /* NUMBERS, not strings of numbers. § */
    /* ---------- WHAT IT EARNS, WHAT IT COSTS, AND WHAT IS LEFT § */
    price_total: N(body.price),
    /* WHAT THE TUTOR EARNS, which `priceFrom` works out on the phone beside `profit` below and which was dropped here — `tutor_pay` was written as an empty string on § */
    tutor_pay: S(body.tutorPay) !== '' ? Math.round(N(body.tutorPay) * 100) / 100 : '',
    travel_paid: travelCost(S(body.location), sessionCount),
    /* THE SUBTRACTION, rather than whatever the phone worked out. § */
    admin_profit: Math.round((N(body.profit)
      - (N(cfg3.travel_on_client) ? 0 : travelCost(S(body.location), sessionCount))) * 100) / 100,
    // Who else is splitting this booking. Stored on the job because it's a fact ABOUT the
    // booking — who was invited to share it — not about any one person's account.
    split_emails: takesAllSeats_(body.location) ? '' : S(body.splitEmails),
    /* AND WHICH CHILDREN IT IS FOR. Different from the split: those are other FAMILIES sharing
       the cost, these are the people in the chairs. A tutor needs the second one and has never
       been told it. */
    /* A CHILD WHO IS ONLY WORDS IN THE BOOKER'S OWN `children` CELL GOES IN BY HER FIRST WORD, as `childNamesOf` offers her now (`kidsForJob_`) — a phone signed in § */
    for_children: kidsForJob_(S(body.kids), (asker && hasRole(asker, 'admin') && S(body.clientName))
      ? findPerson(S(body.clientName)) : asker),
    /* TRUE only where they said so. `TRUE_` reads the word; anything else — blank, absent, an
       older booking — is a no. */
    /* A HOME BOOKING IS PRIVATE AND HOLDS EXACTLY ITS SEATS (owner, 8 Nov). */
    open_to_others: (TRUE_(body.openToOthers) && !takesAllSeats_(body.location)) ? 'TRUE' : 'FALSE',
    max_students: takesAllSeats_(body.location) ? (N(body.n) || 1) : (N(cfg3.max_students_per_job) || 4),
    // "No preference" IS the consent to being matched; naming a tutor withholds it.
    stealable: named ? 'FALSE' : 'TRUE',
    created_at: new Date(),
    /* AN ADMIN BOOKING FOR A FAMILY. § */
    booked_by: key(S(body.name)) === key(me) ? '' : S(body.name),
    /* THE MONEY BLOCK, AS THE PHONE PRICED IT (docs/history/353) — blank from an older phone, never a nought, for `tutor_pay`'s reason. § */
    gross: cash(body.gross), tutor_payout: cash(body.tutorPayout), venue_cost: cash(body.venueCost),
    /* NO MATERIALS, TICKETS OR FORMAT FROM A PHONE ANY MORE (463): trips and practicals are shop items. An older phone's fields are ignored; old rows keep theirs. */
    card_fees: cash(body.cardFees), net_profit: cash(body.netProfit),
    discount_type: S(body.discountType), discount_value: cash(body.discountValue),
    discount_code: S(body.discountCode),
    discount_absorbed_by: S(body.discountType) ? (S(body.discountAbsorbedBy) || 'Shared with tutor') : '',
  };
}

/* THE CLIENT'S AND THE NAMED TUTOR'S MESSAGES for a new booking. */
function createJobNotify_(body, me, jobId, named) {
  /* THE CLIENT'S RECEIPT — `booked`, essential: it carries the total they asked to pay. */
  notify(me, 'Booking received 🎉',
    'Thanks for requesting ' + S(body.subject) + ' with @family.\n\n' +
    '• ' + S(body.subject) + ' (' + S(body.level) + ')\n' +
    '• ' + S(body.day) + ' at ' + fmtTime(body.time) + '\n' +
    '• ' + S(body.location) + '\n' +
    (S(body.dates) ? '• Dates: ' + S(body.dates) + '\n' : '') +
    '• Total: £' + S(body.price) + '\n\n— @family.', 'booked');
  /* ---------- AND THE NAMED TUTOR'S — `booked` TOO, WHICH THE SURVEY OF 9 OCT HAD AS OPTIONAL § */
  if (named) {
    pushTo_(S(body.requestedTutor), 'bookings', 'New request: ' + S(body.subject),
      me + ' · ' + S(body.day) + ' ' + fmtTime(body.time), 'job:' + jobId);
    notify(S(body.requestedTutor),
      'New request: ' + S(body.subject) + ' — ' + me,
      me + ' has requested you.\n\n' +
      '• ' + S(body.subject) + ' (' + S(body.level) + ')\n' +
      '• ' + S(body.day) + ' at ' + fmtTime(body.time) + '\n' +
      '• ' + S(body.location) + '\n' +
      (S(body.message) ? '\nTheir message:\n"' + S(body.message) + '"\n' : '') +
      '\nIt may be outside your usual hours. Log in to @family. to accept or decline.\n\n— @family.', 'booked');
  }
}

/* THE NEW BOOKING'S RECEIPT; its error is returned, never thrown. */
function createJobReceipt_(body, me, jobId, chargeTravel, travel) {
  /* THE RECEIPT, WRITTEN AT THE MOMENT OF ASKING. § */
  /* THE RECEIPT BELONGS TO THE FAMILY, NOT TO WHOEVER TYPED IT. § */
  const forWhom = findPerson(me, S(body.clientId));
  return writeReceipt_({
    kind: 'session', jobId: jobId,
    personId: S(forWhom && forWhom.person_id) || S(body.personId), personName: me,
    total: N(body.price), currency: 'GBP',
    lines: (function () {
      let ls = [];
      try { ls = JSON.parse(S(body.lines) || '[]'); } catch (e) { ls = []; }
      /* ITS OWN LINE, or not at all. § */
      if (chargeTravel) {
        ls = ls.concat([{ k: 'Travel to ' + S(body.location), v: travel }]);
      }
      return ls;
    })(),
    note: S(body.message),
  });
}

function postOpenWaitlist_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  if (!isAdminPerson(personDisplayName(me))) {
    return jsonOut({ error: 'Only an admin can open a waiting list.' });
  }
  const venue = S(body.venue);
  if (!venue) return jsonOut({ error: 'Which venue?' });

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
    return jsonOut({ error: 'That venue has no price set for a shared session yet.' });
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
  if (!me) return jsonOut({ error: 'Not signed in.' });

  const venue = S(body.venue);
  if (!venue) return jsonOut({ error: 'Which venue?' });

  const price = waitlistPrice(venue);
  /* NOT PRICED IS NOT FREE. A venue with no rate, or an open tutor rate nobody has set, means
     the seat cannot be costed — and putting somebody on a list at £0.00 is a promise. */
  if (!price) {
    return jsonOut({ error: 'That venue has no price set for a shared session yet.' });
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
  if (!j) return jsonOut({ error: 'No session with that id.' });
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
    S(j.subject) + (S(j.weekday) ? ' on ' + S(j.weekday) : '')
    + (fmtTime(j.start_time) ? ' at ' + fmtTime(j.start_time) : '')
    + ' is not going ahead.\n\nIf that is a surprise, reply to this message.\n\n— @family.', 'booked'));

  return jsonOut({ success: true, ended: before.length,
                   who: before.map(x => x.name) });
}
