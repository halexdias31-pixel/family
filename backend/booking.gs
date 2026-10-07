/* ==================================================================================================
   @family. — 30_booking.gs   (4 of 8)

   THE BOOKING MACHINE, and everything that decides who is in a session.

   Statuses are FOLDED from the events tab, never stored. Nothing here reads a status column,
   because there is not one — which is why a stale cell cannot keep a dead job on the page.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */

/* ---------- THIS FILE'S OWN STAMP ---------------------------------------------------------------
   ONE VERSION STRING IN `constants.gs` DESCRIBED SIX FILES, and Apps Script is pasted a file at
   a time — so pasting constants.gs alone moved the number the You screen shows while every
   handler stayed where it was. The screen said `2026-08-14-features` and the backend did not
   have `openWaitlist`, which is the version indicator actively lying: worse than none, because
   it is the thing you check to rule the deploy out.
   Each file that can go stale on its own now says so on its own. */
const BOOKING_VERSION = "2026-10-06-f-authfix2";


/**
 * WHEN THE BUSINESS ACTUALLY OPERATES within an interval.
 *
 * An interval's own dates are the school's; teaching runs in whole weeks inside them. So the
 * window starts on the first Monday ON OR AFTER the interval's start — the same day if it already
 * starts on a Monday — and ends on the last Sunday ON OR BEFORE its end, likewise.
 *
 * Derived, never stored. The interval's dates are already in the sheet, and a stored window would
 * be a second copy that has to be kept in step — which is exactly how `weeks_left` came to be
 * blank on every row and quietly break the session count.
 */
function operatingWindow(startCell, endCell) {
  const rawStart = sheetDate(startCell), rawEnd = sheetDate(endCell);
  if (!rawEnd) return null;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  /* THE LATER of the interval's start and today. One rule covering both cases rather than two:
     a future interval starts when it starts, and one already underway starts now — because a week
     that has been and gone can't be booked, and counting from the interval's own start sold it
     anyway. A start after the end is a typo in one cell, so today is used there too. */
  const useStart = rawStart && rawStart <= rawEnd && rawStart > today;
  const from = useStart ? rawStart : today;
  /* A start AFTER the end is a typo, and rescuing it silently is worse than it looks: the term
     falls back to today and becomes identical to whichever term is running now — two different
     names offering the same weeks. Flagged so it can be fixed at source. */
  const dateFault = !!(rawStart && rawStart > rawEnd);

  // getDay(): 0 = Sunday, 1 = Monday. Days forward to the next Monday — 0 if it's already Monday,
  // which is what makes an interval beginning on a Monday begin that same day.
  const first = new Date(from);
  first.setDate(first.getDate() + ((8 - first.getDay()) % 7));

  // And back to the last Sunday. 0 if the end already IS a Sunday.
  const last = new Date(rawEnd);
  last.setDate(last.getDate() - (last.getDay() % 7));

  if (last < first) return null;              // no whole week fits
  return { first, last, weeks: Math.round((last - first) / (7 * 864e5)) + 1, dateFault };
}

/**
 * WHERE A TERM SITS RELATIVE TO TODAY — current, next, the one after, or past.
 *
 * Derived, never typed. The sheet had a `relative_name` column doing this by hand, which meant
 * four cells to re-type every half term and rows that disagreed with their own dates whenever
 * nobody did. Today moves on its own; this should too.
 */
function relativeName(startCell, endCell, allRows) {
  const start = sheetDate(startCell), end = sheetDate(endCell);
  if (!start || !end) return '';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (end < today) return 'Past';
  if (start <= today) return 'Current Academic Interval';

  // How many terms begin between now and this one? None means next; one means the one after.
  const ahead = (allRows || []).filter(r => {
    const s = sheetDate(r.start_date), e = sheetDate(r.end_date);
    return s && e && e >= today && s > today && s < start;
  }).length;
  return ahead === 0 ? 'Next Academic Interval'
       : ahead === 1 ? 'Next Next Academic Interval'
       : 'Later Academic Interval';
}

/**
 * TERM, HOLIDAY, or HALF-TERM.
 *
 * Read from the `kind` cell if somebody filled it in, and worked out from the name if not — so it
 * is right on day one across every existing row, and can be overridden on the one row where the
 * name lies.
 */
function intervalKind(kindCell, nameCell) {
  const said = norm(kindCell);
  if (said === 'term' || said === 'holiday' || said === 'half-term' || said === 'half term') {
    return said === 'half term' ? 'half-term' : said;
  }
  const n = norm(nameCell);
  if (/half\s*term/.test(n)) return 'half-term';
  if (/holiday|christmas|easter|summer break|break/.test(n)) return 'holiday';
  return 'term';
}

/**
 * WRITE A RECEIPT, and never fail the thing it is recording.
 *
 * Called after a job is created. If it throws — a missing tab on an older deployment, a locked
 * sheet — the BOOKING must still stand: a client who has asked for a session and been told the
 * request failed, because the paperwork failed, has been told a lie about the important half.
 * So it reports rather than throws, and the caller carries on.
 */
function writeReceipt_(o) {
  try {
    const t = read(TAB.receipts);
    if (!t.sheet) return { error: 'no receipts tab — load ?setup=1' };
    /* THE NUMBER, AND WHY IT IS NOT A COUNT OF THE ROWS.
       This was `rows.length + 1`, which is the next number only while nothing is ever deleted.
       Remove one row — a test booking, a mistake — and the count goes back, so the next receipt
       reuses a number that has already been issued to somebody. Two documents with one reference,
       and nothing anywhere would say so: `addRow` appends happily and both sit in the tab looking
       correct.

       The highest number ACTUALLY USED, plus one. It reads the same on a clean sheet and it cannot
       go backwards, which is the only property a reference number really has to have. */
    const highest = t.rows.reduce((n, r) => {
      const seen = parseInt(String(S(r.receipt_id)).replace(/\D/g, ''), 10);
      return (seen > n) ? seen : n;
    }, 0);
    const id = 'R' + String(highest + 1).padStart(5, '0');
    const row = {
      receipt_id: id,
      kind: S(o.kind) || 'session',
      job_id: S(o.jobId), order_id: S(o.orderId),
      person_id: S(o.personId), person_name: S(o.personName),
      issued_on: new Date(),
      /* Rounded to whole pence at the moment of writing, so the stored figure is the one anybody
         will ever be asked to pay. */
      total_pence: Math.round(N(o.total) * 100),
      currency: S(o.currency) || 'GBP',
      lines: JSON.stringify(o.lines || []),
      note: S(o.note),
    };
    addRow(t, row);
    clearCache();
    return { receiptId: id };
  } catch (err) {
    return { error: String((err && err.message) || err) };
  }
}

/* `weeksBetween` was here — whole weeks from today to an end date. Superseded by `operatingWindow`,
   which answers the same question and the harder one beside it: teaching runs in whole weeks from
   the first Monday to the last Sunday, and this counted from today whatever day that was. Two
   answers to one question, and only one of them was right. */


/**
 * A GAME LOBBY. Everyone in the session readies up; changing the settings un-readies everybody.
 *
 *   Waiting  in the session, not ready
 *   Agreed   ready — you've accepted the terms as they currently stand
 *   Paying   payment sent
 *   Booked   confirmed
 *
 * Editing the terms writes an Edit event, which resets EVERY participant to Waiting. Nobody can
 * be dragged along by a change they didn't see: if the client switches from one seat to two, the
 * tutor's ready state drops and they have to look again before it can go anywhere.
 * The client may only pay once both sides are Agreed, which is the lobby's "start" button.
 */
function bmActionsFor(role, mine, theirs) {
  mine = mine || ''; theirs = theirs || '';
  // Leaving is ALWAYS available, at every stage, to everyone. Blocking it while a payment was in
  // flight was meant to stop a withdrawal racing the charge and leaving an unrecorded refund — but
  // the event log records both, in order, which is exactly the evidence a refund needs. Trapping
  // someone in a session to protect a bookkeeping detail was the wrong trade.
  if (mine === BM.PAYING || mine === BM.BOOKED) return [ACT.WITHDRAW];

  const out = [ACT.REQUEST, ACT.WITHDRAW, ACT.SAY, ACT.EDIT];
  // Ready up. Only meaningful while you're not already ready.
  if (mine !== BM.AGREED) out.push(ACT.ACCEPT);
  // Turn someone down — only while they're still un-ready, i.e. still a proposition.
  if (theirs === BM.WAITING) out.push(ACT.DECLINE);
  // The lobby's start button: both sides ready, and only the client pays.
  if (role === 'client' && mine === BM.AGREED && theirs === BM.AGREED) out.push(ACT.PAY);
  return out;
}

function bmApply(role, mine, theirs, action) {
  mine = mine || ''; theirs = theirs || '';
  if (bmActionsFor(role, mine, theirs).indexOf(action) === -1) {
    return { ok: false, mine, theirs, clear: '',
             error: role + ' cannot ' + action + ' from (' + (mine || '–') + ', ' + (theirs || '–') + ')' };
  }
  const e = BM_EFFECT[action];
  return { ok: true, mine: e.mine, theirs: e.theirs, clear: e.clear };
}

/* `bmConfirmPayment` was here. THE RULE IT STATED STILL HOLDS — only the payment processor's return
   leg may reach Booked, never a button press — and it is enforced where it actually happens:
   `finalizePayment` asks Stripe whether the session was paid and writes the Confirm event itself.
   This was a second statement of the same rule that nothing consulted, which is worse than none: it
   reads as the thing doing the enforcing. */


/* `bmPossession` was here — whose move it is, worked out from the two statuses. The note at the top
   of this file says possession is never STORED precisely because it is derivable; then the app
   stopped asking, because the lobby shows every participant's own status and there is no single
   "whose turn" left to report. Derived and unused is still a thing to maintain. */


/* ---------- EVENTS ---------------------------------------------------------------------------
   Append-only. The current state is these folded together, which is what bmApply does. Nothing
   is lost, appending can't go stale, and two people acting at once are two appends. */
function logEvent(ev) {
  try {
    // Self-heal a sheet that predates a column. Without `target`, an Accept loses WHO it was
    // aimed at — so a tutor chosen at booking stays "Applied" and the card offers to pick a
    // tutor who has already been picked. Depending on someone remembering to run ensureSchema is
    // not a safeguard.
    if (read(TAB.events).headers.indexOf('target') < 0) { ensureSchema(); clearCache(); }
    addRow(read(TAB.events), {
      event_id: 'e-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      at: new Date(), job_id: S(ev.jobId), actor: S(ev.actor), role: S(ev.role),
      action: S(ev.action), target: S(ev.target), message: S(ev.message),
      request_id: S(ev.requestId)
    });
    return true;
  } catch (err) {
    return false;
  }
}

/** A double-tapped Submit sends the same id twice. On a Pay that's two charges. */
function seenRequest(requestId) {
  if (!requestId) return false;
  return read(TAB.events).rows.some(r => S(r.request_id) === S(requestId));
}

function eventsForJob(jobId) {
  return read(TAB.events).rows
    .filter(r => S(r.job_id) === S(jobId))
    .map(r => ({ at: fmtDate(r.at), actor: S(r.actor), role: S(r.role),
                 action: S(r.action), target: S(r.target), message: S(r.message) }));
}

/* ---------- WHO IS IN A JOB -------------------------------------------------------------------
   Derived from the events, not stored in slot columns. That removes 21 columns from `jobs`
   (client_1..4, tutor_a..c and a status each) along with everything that maintained them:
   find-the-first-free-slot, wipe-on-withdraw, the roster recount, and the "job with nobody in
   it is still visible" bug that came from a status cell outliving its roster.

   It rests on one observation: the TERMS are job-level. There is one weekday, one start_time,
   one venue, one price. So four families and three tutors were never negotiating twelve
   different things — each participant simply has a position on the single set of terms. Once
   that's true, a participant is just an actor with a folded status, and the number of them stops
   being a design decision. Four clients or forty, same code.

   Withdraw and Decline remove someone by ending their run of events, so the absence is still the
   record — but now the history that led to it survives in the log instead of being erased.
--------------------------------------------------------------------------------------------- */
function participantsOf(jobId) {
  const state = {};        // name -> { name, role, status }
  eventsForJob(jobId).forEach(e => {
    const who = S(e.actor), target = S(e.target), act = S(e.action);
    if (!who) return;
    /* ---------- LEAVING, AND THE ONE CASE THAT MUST NOT VANISH ------------------------------
       `delete` is right for somebody who never paid: they asked, they changed their mind, and the
       events tab holds the history while the roster holds only who is in it.

       IT IS WRONG FOR SOMEBODY WHO PAID. A client who has been charged and then withdraws was
       removed entirely — no seat, no status, and `jobStatusOf` reads a job with no clients as
       CANCELLED. So a paid booking that somebody left showed as a dead session with nobody in it,
       and the only trace that money had changed hands was a Confirm buried in the event log that
       nothing reads. A refund is owed at that moment and nothing anywhere says so.

       THEY STAY, MARKED. `Withdrawn` is not a state the lobby can act from — `bmActionsFor` does
       not recognise it, so no move is offered and none is accepted — but it keeps the seat on the
       roster, keeps `jobStatusOf` honest about the session being alive, and makes the one thing
       that needs a human decision visible on the card. */
    if (act === ACT.WITHDRAW) {
      if (state[who] && state[who].status === BM.BOOKED) {
        state[who].status = 'Withdrawn';
        state[who].refundDue = true;
      } else {
        delete state[who];
      }
      return;
    }
    if (act === ACT.DECLINE)  { if (target) delete state[target]; return; }  // removes THEM
    const cur = state[who] || { name: who, role: norm(e.role) === 'tutor' ? 'tutor' : 'client' };

    /* ---------- A REFUND OWED CANNOT BE ERASED BY A LATER EVENT ---------------------------------
       `Withdrawn` was written above and then overwritten by whatever came next — a Request from
       them, an Accept, or even an EDIT BY SOMEBODY ELSE, which resets every unbooked seat and so
       reset theirs. The refund flag went with it, and the money owed went quiet again. My own fix
       for the vanishing paid client had a hole the same shape as the bug it replaced.

       WHOEVER PAID AND LEFT STAYS THAT WAY until somebody has actually refunded them, which is not
       a thing this system can observe — so the only safe rule is that nothing here clears it. They
       may rejoin: a Request from them is a NEW seat and gets its status as normal, and the flag
       rides alongside rather than in the status, so it survives that too.

       `refundDue` IS THE RECORD AND `Withdrawn` IS THE DISPLAY. Keeping them apart is what lets
       somebody come back without the money owed being forgotten. */
    /* A LINE STOOD HERE returning early on an Edit for anybody owed a refund, and it never once
       ran to any effect: the Edit branch below already skips a `Withdrawn` seat, so this was a
       second guard on the same door. Proved by removing it and watching every test still pass —
       which is the only way to tell a guard from a comfort blanket.
       Removed rather than kept "just in case": two things protecting one rule is two things to
       keep in step, and the one that never fires is the one nobody notices going stale. */
    if (act === ACT.REQUEST) cur.status = BM.WAITING;
    if (act === ACT.ACCEPT)  cur.status = BM.AGREED;
    if (act === ACT.PAY)     cur.status = BM.PAYING;
    // Terms changed: everyone drops to un-ready, the person who changed them included. This is the
    // whole point of the lobby — a change nobody re-approves cannot proceed to payment.
    if (act === ACT.EDIT) {
      /* NOT THE BOOKED, AND NOT THE WITHDRAWN EITHER. The first are done and the second are gone —
         both are outside the negotiation, and moving a person who has LEFT back to Waiting puts an
         empty seat on the roster that reads as somebody about to attend. */
      Object.keys(state).forEach(k => {
        if (state[k].status !== BM.BOOKED && state[k].status !== 'Withdrawn') {
          state[k].status = BM.WAITING;
        }
      });
      /* THE LINE ABOVE PROTECTS EVERY BOOKED PERSON AND THE MOVER WAS NOT ONE OF THEM.
         `cur.status = BM.WAITING` ran unconditionally, so a client who had PAID and then edited
         anything about the session wiped their own payment: Booked became Waiting, the job went
         from active back to unconfirmed, and `createCheckout` would happily sell them the same
         session again. Nothing threw and the events tab still held the Confirm — the money was
         real and the roster had forgotten it.

         It is the same rule as everyone else's, applied to the one person the loop above had
         already excluded by name. Somebody who has paid is done: changing the terms afterwards is
         a conversation, not a reason to un-buy their seat. */
      if (cur.status !== BM.BOOKED) cur.status = BM.WAITING;
    }
    // A note is just a note.
    if (act === ACT.SAY && !cur.status) cur.status = BM.WAITING;
    if (act === 'Confirm')   cur.status = BM.BOOKED;   // written by the payment return leg only
    state[who] = cur;
    // Accepting someone puts THEM at Accepted too — the agreement is mutual by definition.
    if (act === ACT.ACCEPT && target && state[target]) state[target].status = BM.AGREED;
  });
  return Object.keys(state).map(k => state[k]);
}

function clientsIn(jobId) { return participantsOf(jobId).filter(p => p.role === 'client'); }
function tutorsIn(jobId)  { return participantsOf(jobId).filter(p => p.role === 'tutor'); }

/** Derived. A tutor is Confirmed once a client has accepted them. */
function tutorStatusOf(jobId) {
  const ts = tutorsIn(jobId);
  if (ts.some(t => t.status === BM.AGREED || t.status === BM.BOOKED)) return 'Confirmed';
  return ts.length ? 'Applied' : 'Open';
}

/** The four words in the job_status list, and only those. */
function jobStatusOf(jobId) {
  const cs = clientsIn(jobId);
  if (!cs.length) return 'cancelled';                       // nobody left — it's over
  if (cs.some(c => c.status === BM.BOOKED)) return 'active';
  /* A WITHDRAWN SEAT IS A RECORD, NOT A PERSON COMING. Somebody who paid and then left stays on
     the roster so the refund is visible — but they are not attending, so a session whose only
     client is Withdrawn is over, and calling it `unconfirmed` would put a dead booking back on the
     list of things waiting to be agreed. Everybody gone one way or another is cancelled. */
  if (cs.every(c => c.status === 'Withdrawn')) return 'cancelled';
  return 'unconfirmed';
}

/** The seat cap for a job: the lowest of the tutor's, the venue's and the job's own. */
function capacityFor(kind, name) {
  if (!name) return 0;
  if (kind === 'venue') {
    // "Richmond Library — Small room 1" narrows to that room's own capacity; a bare venue name
    // falls back to the building's.
    const parts = String(name).split('—').map(x => x.trim());
    if (parts.length > 1) {
      const room = read(TAB.rooms).rows.find(x =>
        key(x.venue) === key(parts[0]) && key(x.name) === key(parts[1]));
      if (room && N(room.max_capacity)) return N(room.max_capacity);
    }
    const v = read(TAB.venues).rows.find(x => key(x.name) === key(parts[0]));
    return v ? N(v.max_students) : 0;
  }
  const p = findPerson(name);
  return p ? N(p.max_students) : 0;
}

function sessionDatesOf(j) {
  return S(j.session_dates).split(',').map(x => x.trim()).filter(Boolean);
}

/** Refuse anything this person may not do — once, before any handler runs. */
function accessDenied(action, body) {
  const need = ACTION_ACCESS[action];
  // An action nobody has classified is refused. A new handler should be unreachable until
  // somebody has decided who it is for, rather than open until somebody notices.
  if (!need) return 'That action is not recognised.';
  if (need === 'anyone') return '';
  /* THE OLD ADMIN CHECK READ A NAME OFF THE REQUEST and is left to the token branch below, which
     resolves the person before asking whether they are an admin. */
  /* `clientName` counts as being signed in. `createJob` names the person that way and nothing
     else does — so the gate asked for a field the one handler behind it never sends, and every
     booking would have been refused with "You need to be signed in for that" by somebody who
     plainly was. It has never fired because the booking form is not wired yet; it would have
     fired on the first booking ever made. */
  /* ---------- BEING SIGNED IN IS A TOKEN, NOT A NAME ---------------------------------------------
     THIS ASKED WHETHER A NAME HAD BEEN SENT. Any name — the field simply had to be non-empty — so
     the whole of what stood between a stranger and somebody's profile was knowing how they are
     spelled, and the app puts names on screen. Every `self` action behind this gate was open.

     THE TOKEN DECIDES WHO, AND THE HANDLER IS TOLD. `body.name` is overwritten with the name the
     token resolves to, so a request claiming to be somebody else acts as whoever it really is
     rather than being refused — the handlers all read `body.name` and now cannot be lied to.

     ADMIN IS CHECKED AGAINST THE SAME TOKEN, for the same reason: `adminName` was a claim too. */
  if (need === 'self' || need === 'admin') {
    const who = authWhoIs_(body.token);
    if (!who) return 'Please sign in again.';
    body.name = personDisplayName(who);
    body.personId = S(who.person_id);
    /* ADMIN IS ASKED OF THE ROW THE TOKEN RESOLVED TO, not of its display name looked up again.
       `isAdminPerson(name)` goes back through `findPerson`, which returns the FIRST row answering to
       that name — so two people sharing a display name could each be judged by the other's role. */
    if (need === 'admin' && !hasRole(who, 'admin')) return 'Not authorised.';
    /* NAMING SOMEBODY ELSE AS THE ADMIN IS OVER. Anything reading `adminName` gets the signed-in
       person, so the two can no longer disagree. */
    if (S(body.adminName)) body.adminName = body.name;
  }
  return '';
}

/* ---------- FINDING ONE ROW BY ITS OWN NAME ---------------------------------------------------
   Not the row NUMBER. Rows shift the moment one is deleted, so an index read when the payload
   loaded points at a different thing by the time a button is pressed — and the thing it points at
   is whatever sat immediately below the one that was meant.
   Falls back to the row number for a sheet that has not been given ids yet, so nothing breaks in
   the gap between deploying and running ensureSchema.
--------------------------------------------------------------------------------------------- */
function rowById_(t, idColumn, id, fallbackRow) {
  const want = S(id);
  if (want && t.headers.indexOf(idColumn) >= 0) {
    const hit = t.rows.find(r => S(r[idColumn]) === want);
    if (hit) return hit;
  }
  if (fallbackRow) return t.rows.find(r => r._row === Number(fallbackRow)) || null;
  return null;
}

/* ---------- INVITATIONS ----------------------------------------------------------------------
   A parent who already trusts you handing you to a parent who doesn't yet. That is where almost
   every local tutoring client comes from, and it is the only outreach channel nobody can take
   away from you — no feed, no ads, no platform in the middle.
   The mechanism was already half-built: splitting a booking asks for the other family's email.
   Until now that email was stored and nothing happened to it.
--------------------------------------------------------------------------------------------- */

/** WHO IS ACTUALLY TEACHING A SESSION, by name, or '' if nobody has been settled on yet.
    Folded from the events like every other status. Two places wanted this and both reached for a
    `job.tutor` column that does not exist, so both got nothing. */
function confirmedTutorOf_(jobId) {
  const t = tutorsIn(jobId).find(x => x.status === BM.AGREED || x.status === BM.BOOKED);
  return t ? t.name : '';
}

/** Send one invitation. Returns the token, which is the link. */
function sendInvite(jobId, fromName, toEmail, toName) {
  const t = read(TAB.invites);
  const token = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
  addRow(t, {
    invite_id: 'I' + Date.now() + Math.floor(Math.random() * 99),
    job_id: S(jobId), from_person: S(fromName), to_email: S(toEmail), to_name: S(toName),
    sent_on: new Date(), token,
  });

  /* `cfg` is not a function — `config()` is. This line threw a ReferenceError the moment anybody
     sent an invitation, which is why the whole mechanism has never once run to completion. */
  const site = S(config().site_url) || SITE_URL;
  const link = site + (site.indexOf('?') === -1 ? '?' : '&') + 'invite=' + token;
  const job = read(TAB.jobs).rows.find(j => S(j.job_id) === S(jobId)) || {};

  /* Written as the INVITING PARENT, because that is who it is from. An email that reads like a
     company mailshot gets the response a company mailshot gets; one that reads like a message from
     somebody you know at the school gate gets read. */
  try {
    MailApp.sendEmail({
      to: S(toEmail),
      subject: S(fromName) + ' would like to share a tutoring session with you',
      htmlBody:
        '<p>Hello' + (S(toName) ? ' ' + S(toName) : '') + ',</p>'
        + '<p>' + S(fromName) + ' has booked tutoring through @family. and asked whether you would '
        + 'like to share the sessions — which brings the cost down for both of you.</p>'
        + '<p><b>' + S(job.subject || 'Tuition') + '</b>'
        + (S(job.venue) ? ' at ' + S(job.venue) : '')
        /* THE TUTOR IS NOT A COLUMN. `jobs` has no `tutor` field — who teaches a session is folded
           from the events tab, which is the whole point of `tutorsIn`. So `job.tutor` was always
           undefined, and every invitation ever sent has quietly omitted the tutor's name. */
        + (confirmedTutorOf_(jobId) ? ', with ' + confirmedTutorOf_(jobId) : '') + '</p>'
        + '<p><a href="' + link + '">See the details and decide</a></p>'
        + '<p style="color:#666;font-size:13px">You were sent this because '
        + S(fromName) + ' entered your address. If that is a mistake, ignore this and '
        + 'nothing further will be sent.</p>',
    });
  } catch (err) { /* no mail quota, or a bad address — the row is still written */ }
  return token;
}

/* ---------- THE HOURS SOMEBODY IS ALREADY TEACHING ------------------------------------------------
 * WHY THIS IS DERIVED AND NOT UNTICKED.
 *
 * The obvious move is to clear the tickbox: a client books Tuesday 3–5, so untick Tuesday 3–5 on
 * the tutor's row. It is wrong, and it is wrong in the way that costs a business real money.
 *
 * AVAILABILITY AND BUSY-NESS ARE DIFFERENT FACTS. "I can work Tuesday afternoons" is a statement
 * about somebody's life — their other job, their childcare, the day they visit their mother. "I am
 * teaching at three this Tuesday" is a statement about one booking. Writing the second into the
 * cell that holds the first DESTROYS the first: the session ends, the client withdraws, the term
 * finishes — and the tutor is now unavailable on Tuesday afternoons for ever, with nothing
 * anywhere recording that they ever were. A tutor who took six bookings over a year would end up
 * with an empty grid and no way back except remembering what it used to say.
 *
 * AND IT CANNOT BE UNDONE RELIABLY. Un-ticking on booking means re-ticking on cancellation, on
 * withdrawal, on decline, on a term ending, on an admin deleting the job — six paths, each of
 * which has to know to put back exactly what it took, and any one of them missed leaves a
 * permanent hole nobody can see the cause of.
 *
 * SO THE CELL IS LEFT ALONE AND THE ANSWER IS COMPUTED. Availability minus what is booked is a
 * subtraction, done fresh every time it is asked, and it is right by construction: cancel the
 * session and the hour comes back on its own because nothing was ever taken away.
 *
 * WEEKLY, because that is how these sessions run — repeating at the same hours each week. An hour
 * is busy for the tutor's week if any live session of theirs sits on it.
 *
 * A SESSION MAY RUN ON SEVERAL DAYS. `weekday` holds every day the booking runs, joined with
 * commas, and each of them is busy for the span the job states — see the note inside, and the
 * double booking that reading the cell as one day name allowed.
 */
/* ---------- AND ONLY WHILE THE SESSION IS RUNNING -----------------------------------------------
   IT HAD NO DATES AT ALL, so a tutor who taught Mondays at ten last spring was busy on Mondays at
   ten for ever — the grey cell on the booking grid outlived the booking by years — and a tutor
   booked for next term was busy today. A job counts while its dates are live: from its first
   session date to its last.

   `from` / `to` IS THE WINDOW BEING ASKED ABOUT, and it defaults to today. `doGet` asks about today,
   which is what the grid and the card draw. `createJob` asks about the booking's OWN dates, because
   a booking for next term that clashes with a session starting next term is a double booking even
   though neither is running yet — and that is the question the grey cells cannot answer and the
   server can.

   A JOB WITH NO DATES COUNTS, whatever the window. It is a request nobody has put in the diary, and
   of the two ways to be wrong — offering an hour that is taken, or holding one that is free — only
   the first sells the same hour twice. */
function busyHours(tutorName, from, to) {
  const out = {};
  if (!S(tutorName)) return out;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const lo = from || today, hi = to || lo;
  const DAY = { monday: 'm', mon: 'm', tuesday: 'tu', tue: 'tu', wednesday: 'w', wed: 'w',
                thursday: 'th', thu: 'th', friday: 'f', fri: 'f',
                saturday: 'sa', sat: 'sa', sunday: 'su', sun: 'su' };
  read(TAB.jobs).rows.forEach(j => {
    const id = S(j.job_id) || String(j._row);
    if (!id) return;
    /* A JOB NOBODY IS IN IS NOT BUSY TIME. `jobStatusOf` reads a cancelled session from the roster,
       so an hour is released the moment the last person leaves — no cleanup, no second path. */
    if (jobStatusOf(id) === 'cancelled') return;
    /* And only where THIS tutor is actually the one teaching it. Somebody who applied and was not
       chosen is not busy. */
    if (key(confirmedTutorOf_(id)) !== key(tutorName)) return;

    /* ---------- A SESSION MAY RUN ON MORE THAN ONE DAY, AND THIS MISSED ALL OF THEM ------------
       THIS LOOKED THE WHOLE CELL UP IN `DAY`. The booking form has let somebody tick hours across
       several days for a long time, and `bookSpec` joins them — so `weekday` reads `Monday, Friday`
       and `DAY['monday, friday']` is undefined. The `if (!d) return` then dropped the job entirely.

       WHICH MEANS A TUTOR ALREADY TEACHING THOSE HOURS READ AS FREE. This is what greys an hour on
       the booking grid; a job it cannot see contributes nothing, so both of its days stay open and
       the next family books the same tutor at the same time. A double booking, silently, and the
       only jobs it happens to are the multi-day ones.

       ONE SPAN ON EACH NAMED DAY, because the job row holds one `start_time` and one
       `hours_per_session`. That is already a simplification of a booking whose runs differ — see
       `bookSpec`, where the first run of the week names the session — and marking the stated span
       busy on each of its own days is the safe reading of it. Marking none was not: of the two ways
       to be wrong here, one offers an hour that is taken and the other holds an hour that is free,
       and only the first sells the same hour twice.

       The note above this function said "one weekday and one time, repeating". That was true when
       it was written and stopped being true when the grid grew days. */
    const when = sessionDatesOf(j).map(sheetDate).filter(Boolean).sort((a, b) => a - b);
    if (when.length && (when[when.length - 1] < lo || when[0] > hi)) return;

    const days = String(S(j.weekday)).split(',').map(x => DAY[norm(x)]).filter(Boolean);
    if (!days.length) return;
    const from = Number(String(fmtTime(j.start_time)).split(':')[0]);
    if (!from && from !== 0) return;
    const hours = Math.max(1, N(j.hours_per_session) || N(config().h) || 2);
    days.forEach(d => {
      for (let h = from; h < from + hours; h++) {
        out[d + String(h).padStart(2, '0')] = S(j.subject) || 'Booked';
      }
    });
  });
  return out;
}

/* ---------- THE HOURS A BOOKING ASKS FOR, AS THE GRID'S OWN CODES -------------------------------------
   `slots` is what the phone sends now — every hour ticked, `m16,m17,f10`. An older phone sends only
   the job row's three cells (`day` joined with commas, `time`, `hours`), which is the first run on
   every named day: the same reading `busyHours` makes of a saved job, and the safe one. */
const DAY_CODE_ = { monday: 'm', mon: 'm', tuesday: 'tu', tue: 'tu', wednesday: 'w', wed: 'w',
                    thursday: 'th', thu: 'th', friday: 'f', fri: 'f',
                    saturday: 'sa', sat: 'sa', sunday: 'su', sun: 'su' };
function bookingCodes_(body) {
  const sent = S(body.slots).split(',').map(x => norm(x)).filter(x => /^(m|tu|w|th|f|sa|su)\d{2}$/.test(x));
  if (sent.length) return sent;
  const from = Number(String(fmtTime(body.time)).split(':')[0]);
  if (!S(body.time) || !isFinite(from)) return [];
  const hours = Math.max(1, N(body.hours) || 1);
  const out = [];
  S(body.day).split(',').map(x => DAY_CODE_[norm(x)]).filter(Boolean).forEach(d => {
    for (let h = from; h < from + hours; h++) out.push(d + String(h).padStart(2, '0'));
  });
  return out;
}

/* A CODE AS A PERSON SAYS IT — `m16` is `Monday 16:00`. */
function codeSaid_(c) {
  const p = String(c).replace(/\d+$/, ''), h = String(c).slice(p.length);
  const day = Object.keys(DAY_CODE_).find(k => DAY_CODE_[k] === p && k.length > 3) || p;
  return day.charAt(0).toUpperCase() + day.slice(1) + ' ' + h + ':00';
}

/* ---------- A BOOKING BY NAME MUST FIT THE TUTOR'S WEEK, AND NOT LAND ON ANOTHER SESSION -------------
   ASKED FOR AS *"tutor with no hours wont be bookable"*, and the grey cells on the booking grid were
   the only thing standing between a family and a tutor's Sunday: `createJob` wrote whatever hours it
   was sent. The grid is drawn from a payload that can be an hour old and a request can be built by
   hand, so the rule is asked again here, of the row itself:

     · NO HOURS AT ALL — the tutor has not said when they teach, so nobody can book them by name.
     · AN HOUR THEY HAVE NOT TICKED — outside their week.
     · AN HOUR THEY ARE ALREADY TEACHING — `busyHours` over THIS booking's own dates, so a session
       next term clashes with one that starts next term even though neither is running today.

   Answers the sentence to send back, or '' to go on. A booking with no tutor named never comes
   here: the business matches it, which is what `No preference` has always meant. */
function tutorHoursRefusal_(row, body) {
  const who = personDisplayName(row);
  const have = availSet(row.availability);
  if (!Object.keys(have).length) {
    return who + ' hasn\u2019t set their hours yet, so they cannot be booked by name. '
      + 'Choose No preference, or another tutor.';
  }
  const codes = bookingCodes_(body);
  const off = codes.filter(c => !have[c]);
  if (off.length) {
    return who + ' does not teach at ' + off.slice(0, 3).map(codeSaid_).join(', ')
      + (off.length > 3 ? ' and ' + (off.length - 3) + ' more' : '') + '. Pick hours from their week.';
  }
  const dates = S(body.dates).split(',').map(sheetDate).filter(Boolean).sort((a, b) => a - b);
  const busy = busyHours(who, dates[0], dates[dates.length - 1]);
  const taken = codes.filter(c => busy[c]);
  if (taken.length) {
    return who + ' is already teaching at ' + taken.slice(0, 3).map(codeSaid_).join(', ')
      + ' in those weeks. Pick other hours, or No preference.';
  }
  return '';
}

/* ==================================================================================================
   THE SCHOOL YEAR, WORKED OUT RATHER THAN TYPED.

   A TABLE OF DATES IS WRONG FROM THE DAY THE YEAR TURNS, and the failure is silent: bookings go on
   pricing against a term that ended months ago, and nothing says so. The terms tab held four rows
   for 2026-27, two of them named the same thing, one ending before it started.

   ALMOST ALL OF IT IS DERIVABLE. The English school year hangs off four anchors —

     EASTER                        computed, and the reason spring moves so much year to year
     THE LAST MONDAY IN MAY        the spring bank holiday, and so the May half term
     THE LAST FULL WEEK OF OCTOBER the October half term
     THE FIRST WEEK OF SEPTEMBER   the start of the year

   — and everything else is "the Monday after" or "the Friday before" one of those. Checked across
   ten years, 2024-25 to 2033-34: no gaps, no overlaps, every term ending on a Friday.

   WHAT THIS CANNOT DO. Term dates are SET BY THE BOROUGH, not by a formula. Merton publishes them
   and they occasionally differ by a day — an extra INSET, a bank holiday moved for a jubilee. So a
   row in the terms tab always wins: this fills in a year nobody has entered, and never overrides a
   year somebody has. Computed is better than stale and worse than published.
================================================================================================== */
function easter(y) {
  /* Meeus/Butcher. Valid for any Gregorian year, and worth using rather than a lookup table for
     the same reason as everything else here: a table runs out. */
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mo = Math.floor((h + l - 7 * m + 114) / 31);
  const da = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(y, mo - 1, da));
}
/* ONE DAY IN MILLISECONDS, and it has to live out here.

   `day` WAS DECLARED INSIDE `festiveOffers` AND USED BY `add` AT THE TOP LEVEL — a ReferenceError
   the first time anything asked for a term date, which is to say every load. My transplanting
   script stripped the declaration on the way in and neither `check-columns` nor `check-dead` looks
   at variable scope, so it shipped clean through all eight checks.

   Named `DAY_MS` rather than `day`, because there is already a `day` inside `festiveOffers` and two
   things one word apart in the same file is how this happened. */
const DAY_MS = 864e5;
const add = (d, n) => new Date(d.getTime() + n * DAY_MS);
/* The nth given weekday of a month; n = -1 means the last one. */
function nth(y, mo, wd, n) {
  if (n > 0) {
    const first = new Date(Date.UTC(y, mo, 1));
    return add(first, ((wd - first.getUTCDay() + 7) % 7) + (n - 1) * 7);
  }
  const last = new Date(Date.UTC(y, mo + 1, 0));
  return add(last, -((last.getUTCDay() - wd + 7) % 7));
}
const MON = 1, FRI = 5;

function schoolYear(y) {
  /* `y` is the September the year STARTS in, so schoolYear(2026) is 2026-27. */
  const out = [];
  const push = (name, kind, s, e) => out.push({ name, kind, start: s, end: e });

  /* AUTUMN starts the first week of September. Most of Merton goes back on the Thursday of the
     first week when the 1st falls early, so the rule is: the first Monday, unless that is the 1st
     or 2nd, in which case the Thursday after — which is what the published calendars show. */
  let autumnStart = nth(y, 8, MON, 1);
  if (autumnStart.getUTCDate() <= 2) autumnStart = add(autumnStart, 3);

  /* THE OCTOBER HALF TERM is the last full Monday-to-Friday week of October. */
  const octMon = nth(y, 9, MON, -1);
  const octHalf = octMon.getUTCDate() + 4 > 31 ? add(octMon, -7) : octMon;

  /* CHRISTMAS begins after the last full week before the 25th. */
  const decFri = nth(y, 11, FRI, -1);
  const termEnd = decFri.getUTCDate() > 22 ? add(decFri, -7) : decFri;

  /* SPRING starts the first weekday of January after the 2nd. */
  let jan = new Date(Date.UTC(y + 1, 0, 2));
  while (jan.getUTCDay() === 0 || jan.getUTCDay() === 6) jan = add(jan, 1);

  /* THE FEBRUARY HALF TERM is the week of the third Monday. */
  const febHalf = nth(y + 1, 1, MON, 3);

  /* EASTER decides the whole of spring. The holiday is the two weeks bracketing Good Friday. */
  const eas = easter(y + 1);
  const goodFri = add(eas, -2);
  const easStart = add(goodFri, -4);                 /* the Monday of Good Friday's week */
  const easEnd = add(easStart, 11);                  /* two weeks, ending on a Friday */

  /* THE MAY HALF TERM is the week of the spring bank holiday: the last Monday in May. */
  const mayHalf = nth(y + 1, 4, MON, -1);

  /* AND SUMMER begins after the third full week of July. */
  const julFri = nth(y + 1, 6, FRI, 3);

  /* ---------- A HOLIDAY COVERS THE WEEKEND EITHER SIDE OF IT --------------------------------
     WRITTEN THE OBVIOUS WAY, EVERY YEAR HAD NINE GAPS: a term ends on the Friday, the half term
     begins on the Monday, and the Saturday and Sunday between them belonged to nothing. Nine
     weekends a year where a booking has no term to sit in, and it cannot be priced by the week
     or shown on a timetable — a fault that looks like nothing on a calendar and breaks a booking.

     So a holiday runs from the day after term ends to the day before the next begins. The teaching
     dates are unchanged; the holiday simply owns the weekend, which is what a family means by it
     anyway. */
  const terms = [
    ['Autumn 1',  autumnStart,     add(octHalf, -3)],
    ['Autumn 2',  add(octHalf, 7), termEnd],
    ['Spring 1',  jan,             add(febHalf, -3)],
    ['Spring 2',  add(febHalf, 7), add(easStart, -3)],
    ['Summer 1',  add(easEnd, 3),  add(mayHalf, -3)],
    ['Summer 2',  add(mayHalf, 7), julFri],
  ];
  const hols = ['October Half Term', 'Christmas Holiday', 'February Half Term',
                'Easter Holiday', 'May Half Term'];

  push('Summer Holiday', 'holiday', add(nth(y, 6, FRI, 3), 1), add(terms[0][1], -1));
  terms.forEach((t, i) => {
    push(t[0], 'term', t[1], t[2]);
    if (i < hols.length) push(hols[i], 'holiday', add(t[2], 1), add(terms[i + 1][1], -1));
  });
  return out;
}

/* ---------- WHICH TERM A WAITING LIST IS FOR ------------------------------------------------------
 * A LIST WITH NO TERM SAYS NOTHING ABOUT WHEN. `openWaitlist` recorded the venue, the level and the
 * price and never a term, so the card had nothing to show and a family looking at it could not tell
 * whether this was for September or for the summer.
 *
 * IT IS NOT A QUESTION WORTH ASKING. A list opened in late August is for the autumn term; one
 * opened in November is for after Christmas. The answer is a date lookup, and asking somebody to
 * pick from a dropdown they will pick wrong is worse than working it out.
 *
 * THE TERM THAT CONTAINS TODAY, or the next one to start if today is a holiday — because nobody
 * opens a list for a term that has already begun to fill, and a list opened during half term is
 * plainly for the weeks after it.
 */
function termForNow(when) {
  const today = when || new Date();
  today.setHours(0, 0, 0, 0);
  const y = today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
  /* THIS YEAR AND THE NEXT, because a list opened in July is for the September after it and that
     term belongs to the following school year. */
  const all = termsFor(y).concat(termsFor(y + 1));
  const terms = all.filter(t => t.kind === 'term');
  const inside = terms.find(t => today >= t.start && today <= t.end);
  if (inside) return inside.name;
  const next = terms.filter(t => t.start > today).sort((a, b) => a.start - b.start)[0];
  return next ? next.name : '';
}

/* THE TERMS FOR A YEAR, from the sheet where somebody has entered them and computed where not.
   `y` is the September the year starts in, so 2026 means 2026-27. */
function termsFor(y) {
  const t = read(TAB.terms);
  const have = {};
  if (t.sheet) {
    t.rows.forEach(r => {
      const s = sheetDate(r.start_date), e = sheetDate(r.end_date);
      if (!s || !e) return;
      /* WHICH SCHOOL YEAR A ROW BELONGS TO: the one starting in the September before it. */
      const yr = s.getMonth() >= 7 ? s.getFullYear() : s.getFullYear() - 1;
      if (yr !== y) return;
      have[norm(r.term_name)] = { name: S(r.term_name), kind: norm(r.kind), start: s, end: e,
                                  fromSheet: true };
    });
  }
  return schoolYear(y).map(c => have[norm(c.name)] || c);
}

/* ---------- WHEN THE PEOPLE ON A WAITING LIST CAN COME ---------------------------------------------
 * AVAILABILITY BELONGS TO THE FAMILY, NOT TO THE CLASS. Somebody joining a list is saying when THEY
 * could come — the class has no day yet, and will not have one until enough people have said. The
 * booking code had this right: it logs each answer as a message on that family's join event rather
 * than writing a day onto the job, because a day on the job would be a promise to four families
 * about a room nobody has booked.
 *
 * WHAT WAS MISSING IS READING IT BACK. Four families each said when they could come, into four
 * separate event messages, and nothing anywhere gathered them up — so the one question the tutor
 * has to answer, "what day suits everybody", could only be answered by reading the log by hand.
 *
 * THIS GATHERS THEM AND COUNTS. Every slot somebody offered, with how many of them offered it, so
 * the day to run the class on is the row at the top rather than a judgement.
 */
function waitlistWhen(jobId) {
  const evs = eventsForJob(jobId) || [];
  const per = {};                       /* who said what, so nobody is counted twice */
  evs.forEach(e => {
    if (norm(e.action) !== norm(ACT.REQUEST)) return;
    const m = /can come:\s*(.+)$/i.exec(S(e.message));
    if (!m) return;
    per[key(e.actor)] = m[1].split(',').map(x => S(x)).filter(Boolean);
  });

  const count = {}, who = {};
  Object.keys(per).forEach(k => {
    /* ONE PERSON'S DUPLICATE ANSWERS COUNT ONCE. Somebody who ticked "Weekday evenings" twice by
       rejoining should not outvote a family who ticked it once. */
    const seen = {};
    per[k].forEach(slot => {
      const s = S(slot);
      if (seen[norm(s)]) return;
      seen[norm(s)] = 1;
      count[s] = (count[s] || 0) + 1;
      (who[s] = who[s] || []).push(k);
    });
  });

  const people = Object.keys(per).length;
  return {
    people,
    slots: Object.keys(count)
      .map(s => ({ slot: s, n: count[s], all: count[s] === people && people > 0 }))
      /* MOST POPULAR FIRST, and alphabetically within a tie so the order does not wander between
         loads for no reason. */
      .sort((a, b) => b.n - a.n || (a.slot < b.slot ? -1 : 1)),
  };
}

/* ---------- WHAT THE JOURNEY TO A VENUE COSTS -----------------------------------------------------
 * READ FROM THE VENUE, never from the request — the same rule as every other price on this site,
 * and for the same reason: a figure the browser sends is a figure the browser chose.
 *
 * PER SESSION. A journey does not get longer because the lesson does, so this is not multiplied by
 * hours. It IS multiplied by the number of sessions, because each one is another trip.
 *
 * ONLINE IS THE CASE THIS EXISTS FOR. There is no journey, so there is no cost, and it needs no
 * special rule: the venue row simply has nothing in the column and nothing is added. A venue
 * nobody has filled in behaves the same way, which is the safe direction — travel that is not
 * charged is a margin question, and travel invented out of a blank cell is a wrong invoice.
 */
function travelCost(venueName, sessions) {
  if (!S(venueName)) return 0;
  /* ONLINE, BY NAME. The venue row for it has no travel cost and never will, so this changes
     nothing today — it is here because "Online" is the one venue whose zero is a FACT rather than
     a cell somebody has not filled in yet, and it should stay zero even if somebody types a number
     into that row by mistake. */
  if (/^online$/i.test(S(venueName))) return 0;
  const v = read(TAB.venues).rows.find(x => key(x.name) === key(venueName));
  if (!v) return 0;
  const each = N(v.travel_cost);
  if (each <= 0) return 0;
  return Math.round(each * Math.max(1, N(sessions) || 1) * 100) / 100;
}

/* ---------- IS THAT PRICE PLAUSIBLE? ---------------------------------------------------------------
 * THE BROWSER SETS THE PRICE OF A SESSION, and this file says twice that it must not: "read from the
 * job, never from the request — a price posted by the browser is a price the client chose". That
 * rule is enforced on PAYING, where `createCheckout` charges from the receipt rather than the job.
 * It is not enforced on BOOKING, where `createJob` writes `N(body.price)` straight into the row the
 * receipt is then written from. So the one number nobody may choose is chosen by the phone.
 *
 * WHY THIS DOES NOT RECOMPUTE IT. The formula lives in the frontend — rate, level, subject, day,
 * time, seats, hours, weeks, discounts, venue — and a second implementation here would be a second
 * thing to keep in step, silently disagreeing the first time either changed. That is the fault this
 * codebase keeps producing and it would be a bad way to fix a smaller one.
 *
 * SO IT CHECKS THE SHAPE RATHER THAN THE SUM. The floor is what the session cannot cost less than
 * and still be worth running: the venue's room hire plus the minimum a tutor is paid, for the hours
 * actually booked. Anything at or above that is accepted and written down. Anything BELOW it is
 * refused — that is not a rounding disagreement, it is a number nobody could have arrived at
 * honestly, and it is the only case where refusing is certainly right.
 *
 * A CEILING TOO, because a price ten times the floor is a typo or a tampered payload and either way
 * somebody is about to be charged it.
 */
function priceLooksWrong(o) {
  const hours = N(o.hours) || N(config().h) || 2;
  const weeks = Math.max(1, N(o.weeks) || 1);
  const seats = Math.max(1, N(o.seats) || 1);

  /* THE ROOM. Free is a legitimate answer — Online costs nothing and a client's own house nearly
     nothing — so a venue that is not found contributes zero rather than blocking the booking. */
  const v = read(TAB.venues).rows.find(x => key(x.name) === key(o.venue));
  const room = v ? N(v.cost_per_hour) : 0;

  /* AND THE TEACHING. The cheapest listed tutor is the floor: nobody on this site works for less,
     so a total that does not cover it is a total that cannot pay for the session it describes. */
  const rates = read(TAB.people).rows
    /* NOT A PENDING ONE: a rate typed by somebody who ticked Tutor an hour ago is not a rate this
       business charges, and the cheapest one here is the floor every booking is judged against. */
    .filter(r => hasRole(r, 'tutor') && !tutorPending_(r) && N(r.rate_per_hour) > 0)
    .map(r => N(r.rate_per_hour));
  const cheapest = rates.length ? Math.min.apply(null, rates) : 0;

  const floor = (room + cheapest) * hours * weeks;
  const asked = N(o.price);

  /* HALF THE FLOOR, not ninety per cent of it — and the difference matters more than it looks.
     Ten per cent refused a twenty-five per cent discount, which is a thing a business genuinely
     offers: a family taking six sessions, a second child, a quiet Tuesday. A check that refuses an
     honest booking is worse than one that lets a dishonest one through, because the honest one
     happens weekly and the dishonest one has never happened at all.

     WHAT IS BEING CAUGHT is a price that could not have come from the formula on any settings:
     nought, a pound, a payload somebody edited. Those are not near the floor, they are near zero,
     and half of it separates them from every real discount with room to spare. */
  if (floor > 0 && asked < floor * 0.5) {
    return 'That price (' + asked + ') is below what the room and the teaching cost for '
      + weeks + ' session(s) of ' + hours + ' hours — about ' + Math.round(floor) + '. '
      + 'Nothing has been booked. Reload and try again; if it keeps happening, tell us.';
  }
  if (floor > 0 && asked > floor * 12) {
    return 'That price (' + asked + ') is far above what this session could cost. Nothing has been '
      + 'booked, so nobody is charged it.';
  }
  return '';
}

/* ---------- WHAT A WAITLIST SEAT COSTS ------------------------------------------------------------
 * PRICED HERE AND NOWHERE ELSE. Four families join the same session on four phones, and every one
 * of them has to be shown the same number and charged the same number. A price computed in a
 * browser is a price that phone chose — which is already the one thing this backend refuses to take
 * on trust for an ordinary booking, and it matters more here because the four are buying the SAME
 * seat and can compare.
 *
 * The venue's own rate, plus a tutor nobody picked, plus a few pounds for each seat after the
 * first — then split. Everything comes from the sheet: the venue row, and three config keys.
 *
 * NULL WHEN IT CANNOT BE PRICED, never zero. A venue with no rate is one nobody has filled in, and
 * £0.00 a seat is the site answering a question it has not asked anybody — the same rule
 * `printPrice` follows for a resource nobody has counted.
 */
function waitlistPrice(venueName) {
  const v = read(TAB.venues).rows.find(x => key(x.name) === key(venueName));
  if (!v) return null;

  const cfg = config();
  /* ---------- HOW MANY SEATS, AND WHERE THAT NUMBER COMES FROM -------------------------------------
     IT WAS ONE GLOBAL FIGURE — `waitlist_seats` on the config tab — so every waiting list divided by
     four whatever room it was in. The room is the thing with a capacity, and the arithmetic already
     rewards a bigger one: the room and the tutor divide further, so eight seats at a £15 room is
     £6.25 a seat against £9.50 at four. That was unreachable while the divisor was a constant.

     THE ROOM FIRST, THEN THE VENUE, THEN THE CONFIG. `capacityFor` already resolves
     "Richmond Library — Small room 1" to that room's own `max_capacity` and falls back to the
     building's `max_students`, which is the same order every other capacity question in this file
     uses. The config figure is the floor for a venue that has never been measured, not the answer.

     AND IT IS CAPPED BY THE CONFIG, not merely defaulted to it. `waitlist_seats` is a business
     decision about how big a class you are willing to run; a hall that holds thirty does not mean
     you want thirty children in one session. The room can only ever make a list SMALLER than the
     number you set. */
  const room_cap = capacityFor('venue', venueName);
  const want = N(cfg.waitlist_seats) || 4;
  const seats = room_cap > 0 ? Math.min(room_cap, want) : want;
  if (seats < 1) return null;

  const room = N(v.cost_per_hour);
  const tutor = N(cfg.open_tutor_rate);
  /* THE TUTOR IS THE PART THAT MUST BE SET. A room can honestly be free — Online is, and a client's
     own house nearly is — but a session with no teaching rate is not a cheap session, it is an
     unpriced one. */
  if (tutor <= 0) return null;

  const extra = N(cfg.waitlist_extra_seat) * (seats - 1);
  const hourly = room + tutor + extra;
  const hours = N(cfg.h) || 2;

  /* Rounded to the penny at the seat, not at the total — the seat is what somebody is charged, and
     rounding the total first leaves four seats that do not add up to it. */
  const perSeatHour = Math.round((hourly / seats) * 100) / 100;
  return {
    seats: seats,
    hours: hours,
    hourlyWhole: Math.round(hourly * 100) / 100,
    perSeatHour: perSeatHour,
    /* WHAT ONE FAMILY PAYS for one session of it. How many sessions a term holds is not decided
       here — the dates do not exist until the list fills and you make it a job. */
    perSeatSession: Math.round(perSeatHour * hours * 100) / 100,
  };
}

/* ==================================================================================================
   THE LIFE OF A WAITLIST
   --------------------------------------------------------------------------------------------------
   THE NUMBERS ARE HERE AND NOWHERE ELSE. Three is how many people it takes to be worth asking anyone
   for money, three is how many paying makes it run, and four is the room. They are business rules,
   they will be argued about, and every one of them was previously either a literal in the middle of
   a function or not written down at all.

   INTEREST IS NOT PAYMENT, and that is the whole shape of this. A family says they want it — that
   is `Waiting`, and it costs them nothing and promises them nothing. When three have said so there
   is something worth paying for, and only then is anybody asked. Asking one family to pay for a
   class that may never have anybody else in it is asking them to carry the risk of it not filling.

   AND THE THIRD PAYMENT IS WHAT STARTS IT, not the fourth. A class of three runs; the fourth seat
   is a seat, not a condition. If only two pay it stays open — the two who paid keep their seats and
   the list goes on gathering people, rather than the whole thing hanging on whichever of the
   original three went quiet. */
const WAIT = {
  /* ENOUGH TO ASK. Below this nobody is prompted for money. */
  ASK_AT: 3,
  /* ENOUGH TO RUN. Once this many have paid it is a session. */
  RUNS_AT: 3,
  /* HOW LONG BEFORE THE START IT SHUTS. Three weeks: a room has to be booked, a tutor found and
     four families told, and a list still taking names inside that is a list making promises the
     calendar cannot keep. */
  SHUTS_DAYS_BEFORE: 21
};

/* WHERE A LIST HAS GOT TO, counted from the roster rather than stored. A stage held in a column is
   a second copy of something the statuses already say, and the two come apart the first time
   somebody edits a row by hand — which on a spreadsheet backend is a Tuesday. */
function waitStage_(job) {
  const cs = clientsIn(S(job.job_id) || String(job._row));
  const paid   = cs.filter(c => c.status === BM.BOOKED).length;
  const asked  = cs.filter(c => c.status === BM.PAYING).length;
  const keen   = cs.length;                       // everybody on it, however far along
  const seats  = N(job.max_students) || 4;

  /* SHUT IS A DATE, NOT A DECISION. Read before anything else, because a list past its closing date
     is not gathering interest whatever its roster says. */
  const shutsOn = sheetDate(job.closes_on);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const shut = !!(shutsOn && today > shutsOn);

  const stage = paid >= WAIT.RUNS_AT ? 'running'
              : shut                 ? 'shut'
              : keen >= WAIT.ASK_AT  ? 'paying'
              :                        'interest';

  return { stage: stage, keen: keen, asked: asked, paid: paid, seats: seats,
           /* SEATS LEFT IS OFF THE ROOM, not off the three that make it run: once it is running the
              fourth seat is still for sale. */
           left: Math.max(0, seats - keen),
           shutsOn: shutsOn || null };
}

/* WHEN A LIST OPENED TODAY WOULD SHUT. The start it is counting back from is the beginning of the
   next term — a shared class is a term thing, and the next one to start is the only date the list
   has to aim at before a day and a room are settled.
   NULL IF THERE IS NO NEXT TERM in the sheet, and null means no closing date rather than a guessed
   one: a list that quietly shuts on a date nobody entered is worse than one that waits. */
function waitShutsOn_() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const y = today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
  const terms = termsFor(y).concat(termsFor(y + 1))
    .filter(t => t.kind !== 'holiday' && t.start && t.start > today)
    .sort((a, b) => a.start - b.start);
  if (!terms.length) return null;
  const shut = new Date(terms[0].start.getTime() - WAIT.SHUTS_DAYS_BEFORE * 864e5);
  shut.setHours(0, 0, 0, 0);
  return shut;
}

/* THE ONE WAITLIST A VENUE MAY HAVE OPEN. Two lists on one room is two sets of families waiting for
   the same four seats, and the second one cannot ever be filled without the first being abandoned.

   OPEN USED TO MEAN "NOBODY HAS PAID YET", AND THAT WAS THE BUG. The moment one family paid, the
   list stopped counting and the very next family at that library started a SECOND one — so a
   library could hold a part-paid list and a brand new list at the same time, which is the thing
   this function exists to prevent. It let go exactly one payment too early.

   OPEN NOW MEANS "HAS NOT RUN AND HAS NOT SHUT". A list that is running is a session and the room
   is free to gather the next one; a list that has shut is over. Everything between — nobody paid,
   one paid, two paid — is still the venue's one list, which is what makes the second and third
   payment go to the same place as the first. */
function openWaitlistAt(venueName) {
  return read(TAB.jobs).rows.find(j => {
    if (norm(j.kind) !== 'waitlist') return false;
    if (key(j.venue) !== key(venueName)) return false;
    const cs = clientsIn(S(j.job_id) || String(j._row));
    if (!cs.length) return false;                        // nobody on it — it is not a live list
    const st = waitStage_(j).stage;
    return st !== 'running' && st !== 'shut';
  }) || null;
}

/* ---------- WHAT IS ON OFFER TODAY, DECIDED BY THE CALENDAR ---------------------------------------
 * NOBODY PUTS THESE UP. That is the whole idea: a holiday has a date, the row says how many days
 * before it should appear and how long it stays afterwards, and the arithmetic does the rest. Six
 * weeks before Christmas a card appears on every client's screen; the week after, it goes.
 *
 * WHY IT IS COMPUTED RATHER THAN A FLAG SOMEBODY SETS. A flag is a thing to remember, twice — once
 * to turn on and once to turn off — and the second one never happens. An event still advertising
 * itself in February is worse than no event, because it is the business visibly not paying
 * attention. A date cannot forget.
 *
 * `opens_days` IS PER HOLIDAY because the answer is. Christmas needs six weeks to fill a hall;
 * Pancake Day needs one, and six weeks of Pancake Day is a card people learn to ignore.
 *
 * AND IT IS NOT OFFERED UNLESS IT IS READY. `active` is you saying you will run it; a venue and a
 * price are what make it a thing somebody can join. Missing either and it stays off — a card
 * inviting somebody to a place that has not been decided is worse than silence.
 */
function festiveOffers() {
  const t = read(TAB.holidays);
  if (!t.sheet) return [];

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day = 864e5;

  return t.rows.filter(r => {
    if (!festiveReady_(r)) return false;
    const when = sheetDate(r.date);

    const opens = N(r.opens_days) || 21;
    /* A DEFAULT OF ZERO WOULD BE A TRAP: a row where nobody filled the trailing days in would
       vanish at midnight on the day itself, during the week the family is actually free. Three days
       is the shortest honest answer. */
    const trails = N(r.trail_days) || 3;

    const from = new Date(when.getTime() - opens * day);
    const until = new Date(when.getTime() + trails * day);
    return today >= from && today <= until;
  }).map(r => {
    const when = sheetDate(r.date);
    const seats = N(r.max_children) || 12;
    /* HOW MANY HAVE JOINED, folded from the job if one exists yet. The first family to join creates
       it — the same rule as a waitlist — so until then there is nothing to count and the answer is
       none. */
    const jobs = read(TAB.jobs).rows.filter(j => norm(j.kind) === 'festive'
      && key(j.term_name) === key(S(r.holiday_id)));
    const taken = jobs.length ? clientsIn(S(jobs[0].job_id) || String(jobs[0]._row)).length : 0;
    return {
      id: S(r.holiday_id),
      holiday: S(r.name),
      name: S(r.event_name) || S(r.name),
      blurb: S(r.blurb),
      venue: S(r.venue),
      date: fmtDate(when),
      hours: N(r.hours) || 2,
      price: N(r.price_per_child),
      seats: seats,
      taken: taken,
      left: Math.max(0, seats - taken),
      jobId: jobs.length ? S(jobs[0].job_id) : '',
    };
  });
}

/* READY, or not offered — and, since the calendar learned to close on one, not a closure either.
   Said as separate conditions rather than one, because the health report should eventually be able
   to say WHICH of them is missing. Lifted out of `festiveOffers` so `closures` asks the same
   question: an event the business is actually running, on a date, at a place, for a price. */
function festiveReady_(r) {
  if (!ON_(r.active)) return false;
  if (!sheetDate(r.date)) return false;
  if (!S(r.venue)) return false;
  if (!(N(r.price_per_child) > 0)) return false;
  return true;
}

/* ==================================================================================================
   THE DAYS NOBODY IS TAUGHT, INSIDE A TERM.

   ASKED FOR as part of *"calander and time table and availability ... it seems they clash"*. The
   booking walked every week from the first Monday of a term to the last and charged for each one —
   so the Early May bank holiday, which always falls inside Summer 1, was a session on the receipt and
   a session nobody turned up to. The term windows already leave out the half terms; nothing left out
   the single days.

   THREE KINDS OF DAY, ONE LIST:
     · ENGLAND AND WALES BANK HOLIDAYS, worked out rather than typed — Easter is computed already for
       the school year, and the rest are "the first Monday in May" and its kind. Substitute days
       follow the gov.uk rule: a New Year's Day at the weekend moves to the Monday; Christmas and
       Boxing Day at the weekend move to the next weekdays not already taken.
     · INSET AND CLOSED DAYS, which no formula can know: a row on the holidays tab with `kind` set to
       `inset` or `closed`. The same tab carries a one-off bank holiday — a coronation, a jubilee — as
       a `bank` row, which is how a year the formula gets wrong is put right without a deploy.
     · A FESTIVE EVENT THE BUSINESS IS RUNNING (`festiveReady_`), because the tutors and the room are
       at the party that day.

   SENT AS `DATA.closures`, ONE ROW PER DATE, and `computeSessionDates` on the phone steps over every
   one of them — so the dates on a receipt, the number of sessions and the price are all the real
   count, and the Calendar marks the same days from the same list.
================================================================================================== */
function bankHolidays(y) {
  const out = [];
  const at = (m, d) => new Date(y, m, d);
  const e = easter(y);
  const eas = new Date(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
  const shift = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const weekday = d => d.getDay() !== 0 && d.getDay() !== 6;
  /* The nth Monday of a month (n = -1 for the last), in local time — `nth` above answers in UTC for
     the school year, and a bank holiday is a local date. */
  const monday = (m, n) => {
    if (n > 0) { const f = at(m, 1); return shift(f, ((8 - f.getDay()) % 7) + (n - 1) * 7); }
    const l = new Date(y, m + 1, 0); return shift(l, -((l.getDay() + 6) % 7));
  };
  let ny = at(0, 1);
  while (!weekday(ny)) ny = shift(ny, 1);
  out.push({ date: ny, name: "New Year's Day" });
  out.push({ date: shift(eas, -2), name: 'Good Friday' });
  out.push({ date: shift(eas, 1), name: 'Easter Monday' });
  out.push({ date: monday(4, 1), name: 'Early May bank holiday' });
  out.push({ date: monday(4, -1), name: 'Spring bank holiday' });
  out.push({ date: monday(7, -1), name: 'Summer bank holiday' });
  /* CHRISTMAS AND BOXING DAY TAKE THE NEXT TWO WEEKDAYS FROM THE 25TH that the other has not, in
     order — which is the whole of the substitute rule: on a Saturday Christmas, Monday the 27th and
     Tuesday the 28th; on a Sunday one, Boxing Day keeps Monday the 26th and Christmas takes Tuesday. */
  let c = at(11, 25), b = at(11, 26);
  if (!weekday(c) && !weekday(b)) { c = at(11, 27); b = at(11, 28); }
  else if (!weekday(c)) { c = at(11, 27); }
  else if (!weekday(b)) { b = at(11, 28); }
  out.push({ date: c, name: 'Christmas Day' }, { date: b, name: 'Boxing Day' });
  return out;
}

/* EVERY CLOSED DAY FROM LAST YEAR TO NEXT, as `{ date: 'dd/mm/yyyy', name, kind }`. Three calendar
   years covers any term `doGet` sends (it sends the next twelve months) and every session date a
   live job can still have. The tab wins a date over the formula, so a moved bank holiday is named
   the way somebody typed it. */
function closures() {
  const byDate = {};
  const put = (d, name, kind) => { const k = fmtDate(d); if (k) byDate[k] = { date: k, name: S(name), kind: kind }; };
  const y = new Date().getFullYear();
  [y - 1, y, y + 1].forEach(yr => bankHolidays(yr).forEach(h => put(h.date, h.name, 'bank')));
  try {
    const t = read(TAB.holidays);
    (t.sheet ? t.rows : []).forEach(r => {
      const when = sheetDate(r.date);
      if (!when) return;
      const k = norm(r.kind);
      if (k === 'inset' || k === 'closed' || k === 'bank') put(when, r.name || k, k === 'bank' ? 'bank' : 'inset');
      else if (festiveReady_(r)) put(when, S(r.event_name) || S(r.name), 'festive');
    });
  } catch (err) { /* no tab yet: the computed bank holidays are still right */ }
  return Object.keys(byDate).map(k => byDate[k]);
}

/* ---------- daily trigger --------------------------------------------------------------------
   Nothing to do for lifecycle — it's derived from the dates on read. This exists only to close
   jobs whose last session has passed, so they stop appearing as live. */
function closeFinishedJobs() {
  const t = read(TAB.jobs);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  t.rows.forEach(j => {
    const dates = sessionDatesOf(j).map(parseDate).filter(Boolean).sort((a, b) => a - b);
    if (!dates.length) return;
    if (dates[dates.length - 1] < today && norm(j.status) !== 'ended') {
      setCell(t, j, 'status', 'ended');
    }
  });
}
/* ==================================================================================================
   SIGNING IN: HASHING, SESSIONS, AND NOT LETTING SOMEBODY GUESS
   --------------------------------------------------------------------------------------------------
   THREE THINGS WERE WRONG AND THEY ARE THE THREE THINGS EVERY LOGIN GETS WRONG.

   THE PIN WAS STORED AS TYPED. A digest is one-way: it can confirm a PIN somebody offers and cannot
   be turned back into the PIN itself, so a copy of the sheet is no longer a list of everyone's
   four digits.

   THE PIN WAS CHECKED ONCE AND NEVER AGAIN. After sign-in the phone sent a NAME, and the gate
   accepted a name as proof — so knowing how somebody is spelled was the whole of what it took to
   edit their profile. A session token replaces it: random, issued at sign-in, kept here only as a
   digest, and expiring.

   AND NOTHING COUNTED WRONG ANSWERS. Four digits is ten thousand possibilities; at a few requests a
   second that is an afternoon. Five wrong in a row now stops the account answering for fifteen
   minutes, which is the difference between an afternoon and a couple of centuries.

   WHY NOT bcrypt: Apps Script has no such library and no way to load one. SHA-256 run many times
   over is the honest approximation available here — slower than a bare digest by the number of
   rounds, which is what makes guessing expensive. The pepper lives in Script Properties rather than
   the sheet, so the spreadsheet alone is not enough to test guesses against.
================================================================================================== */
/* ---------- THE SIMPLE VERSION: ONE `pin` CELL, AND NOTHING ELSE ON THE ROW -------------------------
   ASKED FOR AS *"just pin and login no other username stuff"*, after `pin_hash`, `pin_salt`,
   `session_hash`, `session_until` and `tries` had been deleted from `people` by hand. So the PIN is
   the `pin` cell, read and written as typed, and signing in is an e-mail address and that PIN.

   WHAT THAT COSTS, SAID RATHER THAN BURIED: anybody who can open the spreadsheet can read every
   PIN. That was the reason for the hash, and the owner has chosen to give it up.

   THE SIGNED-IN STATE AND THE THROTTLE STILL EXIST, AND LIVE IN SCRIPT PROPERTIES. Without a
   session nothing a signed-in person does can be checked — every action after sign-in would be
   refused — and without a throttle four digits is ten thousand guesses over an anonymous URL. So
   both are kept, and moved OFF the sheet, which is what "no other columns" asks: Script Properties
   belong to the project, so nobody sees them and nobody can delete them by accident.

   A TOKEN IS KEPT AS ONE SHA-256 OF ITSELF. It is 72 random characters, so a single digest is as
   good as four thousand rounds — the rounds were only ever for a four-digit PIN. */
const AUTH = {
  SESSION_DAYS: 30,      // signed in for a month, then the PIN again
  FREE_TRIES: 10,        // nothing happens at all until the eleventh wrong answer
  WAITS: [1, 2, 5, 15, 60],  // minutes: one rung per wrong answer after that, then the last for ever
  /* A DAY WITH NO WRONG ANSWER STARTS THE COUNT AGAIN. See `authWrong_`: a classmate who typed
     somebody's public handle eleven times on Monday left that child one typo from an hour's wait on
     every day after it, because nothing but a successful sign-in ever set the count back. */
  QUIET_HOURS: 24,
  /* A PIN SENT BY "Forgotten your PIN?" — see `authResetUse_`. It works beside the old one for a day
     and becomes the PIN when it is first used; one is sent per quarter of an hour at most; and five
     wrong tries at it while the account is locked retire it — the typed PIN only, when the mail went to
     the account's own address and carries a sign-in link beside it (`authResetKey_`). */
  RESET_HOURS: 24,
  RESET_GAP_MINS: 15,
  RESET_MISSES: 5,
  /* "SEND THE LINK AGAIN" — see `resendLink` in dopost.gs. A fresh confirmation link to the row's own
     address at most once a quarter of an hour, the forgotten PIN's gap and for its reason: every press
     is an email out of the same daily quota the booking notices are sent from. */
  LINK_GAP_MINS: 15,
  /* A NEW ADDRESS WAITING TO BE PROVED — see `authMove*_`. The link that moves it works for a week, and
     only where the account is signed in; after that the change is forgotten and the old address stays. */
  MOVE_DAYS: 7
};

function authProps_() { return PropertiesService.getScriptProperties(); }

function authDigest_(s) {
  return Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8));
}

/* CONSTANT TIME, which costs three lines. */
function authSame_(a, b) {
  const x = String(a), y = String(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

/* CAN THIS PERSON SIGN IN AT ALL: is there a PIN in the cell. */
function hasPin_(r) { return !!(r && S(r.pin)); }

/* SET OR CHANGE A PIN: the cell, as typed. A PIN that starts with 0 goes in as TEXT — `setCell`
   writes through `cellSafe_`, which gives a string of digits with a leading 0 the sheet's own
   apostrophe — so the cell holds the digits that were chosen and not a number one shorter. */
function authSetPin_(t, r, pin) { setCell(t, r, 'pin', String(pin)); }

/* ---------- A PIN CELL THE SHEET HAS TURNED INTO A NUMBER ----------------------------------------
   `setValue` PARSES A STRING THE WAY TYPING IT WOULD, and so does a person typing into the sheet:
   four noughts go in and `0` comes back; a PIN of 0 then three digits comes back three digits long.
   `read()` hands that number over, `S()` makes it a shorter string, and the child typing the four
   digits they chose is told "Wrong PIN" until the ladder locks them out. Every PIN typed into the
   sheet by hand that starts with 0 is in this state, and so was every reset PIN that happened to
   start with one (about one in ten — see `authFreshPin_`).

   SO A NUMBER CELL ANSWERS TO THE DIGITS IT WAS MADE FROM: 4 to 8 digits typed, the cell is a
   number, and they are the same number. It is not a second PIN — the only strings it adds are the
   chosen PIN with more noughts in front. And it is put right on the way through: the cell is written
   back as the text that was typed, so the row holds a plain text PIN after its first sign-in. A
   number cell is the only thing this tolerates; a text cell is compared exactly. */
function authPinLost_(r, given) {
  const have = r ? r.pin : '';
  return typeof have === 'number' && /^\d{4,8}$/.test(given) && Number(given) === have;
}

function authCheckPin_(t, r, pin) {
  const given = S(pin), have = S(r && r.pin);
  if (!given || !have) return false;
  if (authSame_(have, given)) return true;
  if (!authPinLost_(r, given)) return false;
  /* THE MIGRATION, NOT A CHANGE: the secret is the same one, so nothing about the throttle or the
     sessions moves — see `PIN_OK` in check-backend.js. */
  try { authSetPin_(t, r, given); } catch (err) {}
  return true;
}

/* ---------- ONE RULE FOR A PIN NOBODY SHOULD HAVE -------------------------------------------------
   `changePin` REFUSED A RUN OF ONE DIGIT AND THREE COUNTING ONES; `register` REFUSED NOTHING, so a
   child making an account could choose the four digits every guesser tries first, and the form that
   changes it would then not let them choose them again. One reader now, for every door that sets a
   PIN somebody chose — `register`, a parent making a child's account, `changePin`, `makeBrandAccount`
   — and the PINs this backend draws itself (`authFreshPin_`) are drawn until it says no.
   The phone checks 4 to 8 digits and nothing else; this sentence is the server's to say. */
function pinWeak_(pin) {
  const p = S(pin);
  const obvious = ['1234', '12345', '123456', '1234567', '12345678', '123123', '4321', '654321'];
  return /^(\d)\1+$/.test(p) || obvious.indexOf(p) !== -1;
}

/* ---------- A PIN THIS BACKEND MAKES UP ------------------------------------------------------------
   SIX DIGITS, NEVER A LEADING 0, NEVER ONE `pinWeak_` REFUSES. The 0 is the half that mattered: the
   draw was `padStart(6, '0')`, so one reset in ten began with a 0 the sheet then dropped — see
   `authPinLost_`. Starting the range at 100000 leaves no 0 to drop. */
function authFreshPin_() {
  let made = '';
  for (let tries = 0; tries < 20; tries++) {
    made = String(100000 + Math.floor(Math.random() * 900000));
    if (!pinWeak_(made)) break;
  }
  return made;
}

/* ---------- THE THROTTLE, KEPT OFF THE SHEET ---------------------------------------------------
   Ten wrong answers cost nothing, then one minute, two, five, fifteen, and an hour for ever — a
   guesser gets about thirty-eight tries on the first day and twenty-four a day after that, so ten
   thousand PINs is over a year. Keyed by `person_id`, one small property per person who has got it
   wrong, cleared the moment they get in. */
function authThrottleKey_(r) { return 'AUTH_TRIES_' + S(r.person_id || personDisplayName(r)); }

function authThrottle_(r) {
  try { return JSON.parse(authProps_().getProperty(authThrottleKey_(r)) || '{}'); }
  catch (err) { return {}; }
}

function authWaitMins_(r) {
  const until = N(authThrottle_(r).until);
  const left = until - Date.now();
  return left > 0 ? Math.ceil(left / 60000) : 0;
}

function authLocked_(r) { return authWaitMins_(r) > 0; }

function authWrong_(t, r) {
  const was = authThrottle_(r);
  /* ---------- A QUIET DAY WIPES THE SLATE ----------------------------------------------------------
     `n` WAS WRONG ANSWERS SINCE YOU LAST GOT IN, FOR EVER. Handles are on every card, so anybody who
     knows a child's handle can type eleven wrong PINs at it — and with nothing setting the count
     back but a successful sign-in, that child was then one typo of their own from an hour's wait,
     every day, until they happened to get in first time. `at` is when the last wrong answer was; a
     day with none starts again from nothing. A guesser gains nothing by it: to be let off the ladder
     they have to stop for a whole day, which is fewer guesses than the hour-a-time rung allows. */
  const quiet = N(was.at) > 0 && Date.now() - N(was.at) > AUTH.QUIET_HOURS * 36e5;
  const n = (quiet ? 0 : N(was.n)) + 1;
  let until = 0, step = -1;
  if (n > AUTH.FREE_TRIES) {
    step = Math.min(n - AUTH.FREE_TRIES - 1, AUTH.WAITS.length - 1);
    until = Date.now() + AUTH.WAITS[step] * 60000;
  }
  try {
    authProps_().setProperty(authThrottleKey_(r), JSON.stringify({ n: n, until: until, at: Date.now() }));
  } catch (err) {}
  /* Told on the FIRST rung only — an email per guess is a mailbox nobody reads. */
  if (step !== 0) return;
  const said = 'Somebody has tried the @family. PIN for '
    + (S(r.handle) ? '@' + S(r.handle) : personDisplayName(r)) + ' ' + n + ' times and got it wrong.\n\n'
    + 'Signing in is held up for a minute, and for longer on each wrong answer after that.\n';
  try { notify(personDisplayName(r), 'Too many sign-in attempts', said + 'If that was not you, reply here.'); }
  catch (err) {}
  /* ---------- AND A CHILD WITH NO ADDRESS HAS A GROWN-UP WHO IS TOLD ------------------------------
     `notify` READS THE ROW'S OWN ADDRESS, so for a child with none the warning went nowhere — the
     account most likely to be guessed at by a classmate was the one nobody heard about. The same
     grown-ups "Forgotten your PIN?" writes to (`authGrownUps_`). */
  if (S(r.email)) return;
  /* CONFIRMED GROWN-UPS ONLY — the rule `notify` keeps (`addressPending_`), read in `authGrownUps_`.
     This mail names the child's handle, and an accepted parent whose own address was never proved can
     be a typo, so the handle went to a stranger, who then had the one thing "Forgotten your PIN?" asks
     for. The address a PENDING child typed as their grown-up's is the same kind of unproved. */
  const tos = authGrownUps_(r);
  if (!tos.length) return;
  try {
    MailApp.sendEmail({ to: tos.join(','), name: BRAND_NAME, subject: 'Too many sign-in attempts',
      body: said + 'If that was ' + (S(r.first_name) || 'them') + ', "New PIN" on their card on your '
          + 'account gives them a new one at once. If it was not, tell us.' });
  } catch (err) {}
}

/* ---------- WHO IS WRITTEN TO FOR A CHILD WITH NO ADDRESS OF THEIR OWN -------------------------------
   Every parent who has ACCEPTED the link (an `asked` row is a claim, not a family), and the address a
   child gave as a grown-up's when they made their own account (`parent_email`). Read in one place,
   because the forgotten-PIN mail and the too-many-guesses warning both ask it.

   ---------- AND ONLY THE ONES WHOSE ADDRESS SOMEBODY HAS PROVED -------------------------------------
   A PARENT WHOSE OWN ROW IS PENDING IS LEFT OUT (`addressPending_`), and so is the typed grown-up's
   address while the CHILD's row is PENDING — that row is PENDING precisely because nobody has opened
   the link sent there, so the address is as unproved as a parent's. Both are the same stranger when
   they are typos: a parent who mistyped jsmith@ as jsmith1@ made a child, and "Forgotten your PIN?"
   on the child's handle (printed on every card, and in the make-child mail) sent that child's PIN to
   jsmith1@'s owner, who signed in as the child (PR #130 review, variant C; a child who mistyped
   their grown-up's address was variant B, the same mail by the typed half).

   THIS USED TO TAKE `confirmedOnly`, AND ONLY THE WARNING PASSED IT. Round one of that review kept
   the forgotten-PIN mail going to an unproved parent on purpose, as the way an address's owner proves
   it — which is true of an account's OWN address (`forgotPin` sends there whatever its state) and is
   not true of a child's PIN sent to somebody else's. With every caller asking for the same answer the
   flag was a second rule waiting for a third caller to forget it, so it went: this is the rule. */
function authGrownUps_(r) {
  const tos = acceptedParents(S(r && r.person_id))
    .filter(p => !addressPending_(p)).map(p => S(p.email)).filter(Boolean);
  const typed = S(r && r.parent_email);
  if (typed && !addressPending_(r) && tos.map(norm).indexOf(norm(typed)) === -1) tos.push(typed);
  return tos;
}

/* A successful sign-in, a PIN reset by e-mail and a PIN change all clear it: the count is about
   guesses against a PIN, and those three each establish the PIN afresh. (The old `locked_until`
   column went with the people tab's redesign; a lock lives in Script Properties only.) */
function authClearThrottle_(t, r) {
  try { authProps_().deleteProperty(authThrottleKey_(r)); } catch (err) {}
}

/* ==================================================================================================
   A FORGOTTEN PIN IS SENT BESIDE THE OLD ONE, AND REPLACES IT ONLY WHEN IT IS USED
   --------------------------------------------------------------------------------------------------
   "FORGOTTEN YOUR PIN?" OVERWROTE THE PIN THE MOMENT ANYBODY ASKED. It is open to anybody (you cannot
   be signed in to have forgotten), handles are printed on every card, and the tile sits a fingertip
   from Sign in — so a classmate typing `@kit_kind42` and pressing it, or Kit missing Sign in by four
   pixels, stopped Kit's PIN working at once while the new one sat in a parent's inbox. Eight presses
   were eight new PINs and eight emails; once the day's mail quota was spent each press still changed
   the PIN and sent it to nobody.

   NOW THE REQUEST CHANGES NOTHING ON THE ROW. The new PIN is kept here, in Script Properties beside
   the throttle — `AUTH_RESET_<person_id>` → `{ pin, until, at, misses, to, key, dead }` (`to` and `key`
   for a mail to the account's own address, see below) — and works BESIDE the old one
   for `AUTH.RESET_HOURS`. Whichever is typed signs you in; the new one, once used, becomes the PIN.
   A stranger's press costs the child nothing but an email to a grown-up.

   ONE EMAIL PER QUARTER OF AN HOUR (`RESET_GAP_MINS`), and a second request inside the day sends the
   SAME PIN again rather than a new one, so a parent holding two emails never holds a dead one. It is
   stored only once the mail has gone (`forgotPin`): a mail that cannot go changes nothing at all.

   AND IT IS STILL THE WAY OUT OF A LOCKOUT (181). The lock is answered before the PIN is looked at,
   which would refuse the emailed PIN exactly when it was asked for — so while locked, the emailed PIN
   alone is still compared, and five wrong tries at it retire it (`RESET_MISSES`): a lock that let a
   guesser try a six-digit code all day without moving the ladder would be no lock.

   ---------- AND THE MAIL TO AN ACCOUNT'S OWN ADDRESS CARRIES A LINK, WHICH NO GUESS CAN USE UP ----------
   FOUND BY ROUND THREE OF THE PR #130 REVIEW: those five misses are anybody's to spend. A squatter on
   Vic's address keeps their 30-day session and types fifteen wrong PINs at it — ten lock it, five more
   retire the PIN Vic was just mailed — and does it again for every new one, so the takeover the whole
   design rests on (`authResetUse_` below) never happens. Not counting misses would hand a guesser the
   six digits for a day; counting them per requester needs an identity Apps Script does not give.
   SO THE PROOF THAT CANNOT BE GUESSED GOES IN THE SAME MAIL. `key` is two UUIDs long, so it needs no
   budget: `?signin=<key>` (`pinLink` in dopost.gs) does exactly what typing the PIN back does, lock or
   no lock, misses or none. The misses now retire the TYPED PIN only (`dead`) and leave the link
   working until the day is out. Only the account's OWN address is sent one: a link that signed the
   reader in would sign a grown-up's phone in as the child, and a parent has "New PIN" on the child's
   card for a PIN somebody has used up. */
function authResetKey_(r) { return 'AUTH_RESET_' + S(r.person_id || personDisplayName(r)); }

function authResetGet_(r) {
  let held = null;
  try { held = JSON.parse(authProps_().getProperty(authResetKey_(r)) || 'null'); } catch (err) {}
  if (!held || !S(held.pin) || N(held.until) < Date.now()) return null;
  return held;
}

function authResetPut_(r, held) {
  try { authProps_().setProperty(authResetKey_(r), JSON.stringify(held)); return true; }
  catch (err) { return false; }
}

function authResetDrop_(r) {
  try { authProps_().deleteProperty(authResetKey_(r)); } catch (err) {}
}

/* THE ROW A SIGN-IN LINK BELONGS TO, by its key and nothing else: `{ owner, held }`, `owner` being the
   suffix of the property (a person_id, or a display name for a row from before ids). A scan, because
   there is one property per person who asked in the last day and keying them by link as well would be
   two records to keep in step. */
function authResetFind_(key) {
  const want = S(key);
  if (!want) return null;
  try {
    const all = authProps_().getProperties();
    const hit = Object.keys(all).filter(k => k.indexOf('AUTH_RESET_') === 0).map(k => {
      let held = null;
      try { held = JSON.parse(all[k]); } catch (err) {}
      return { owner: k.slice('AUTH_RESET_'.length), held: held };
    }).find(x => x.held && S(x.held.key) && authSame_(S(x.held.key), want));
    if (!hit || !S(hit.held.pin) || N(hit.held.until) < Date.now()) return null;
    return hit;
  } catch (err) { return null; }
}

/* DOES `given` MATCH THE EMAILED PIN — and if it does, it becomes the PIN (`authResetTake_`). `locked`
   says the lock is on, in which case a miss is counted against the emailed PIN rather than the ladder.
   False, or what `authResetTake_` answers, which is truthy. */
function authResetUse_(t, r, given, locked) {
  const held = authResetGet_(r);
  if (!held || held.dead) return false;
  if (S(given) && authSame_(S(held.pin), S(given))) return authResetTake_(t, r, held);
  if (locked) {
    held.misses = N(held.misses) + 1;
    /* RETIRED, NOT THROWN AWAY, WHEN THERE IS A LINK BESIDE IT — see the note over `authResetKey_`. */
    if (held.misses >= AUTH.RESET_MISSES) {
      if (S(held.key)) { held.dead = true; authResetPut_(r, held); } else authResetDrop_(r);
    } else authResetPut_(r, held);
  }
  return false;
}

/* THE EMAILED PIN, USED — typed back (`authResetUse_`) or by its link (`pinLink`). One body, so the two
   cannot drift: the link is the same proof, only one nobody can guess. Answers `{ childrenHeld }`. */
function authResetTake_(t, r, held) {
  authSetPin_(t, r, S(held.pin));
  /* THE OLD PIN'S GUESSES SAY NOTHING ABOUT THIS ONE — `authClearThrottle_`'s own argument. */
  authClearThrottle_(t, r);
  authResetDrop_(r);
  /* ---------- EVERY OTHER SESSION ENDS, WHATEVER STATE THE ROW IS IN --------------------------------
     THE ADDRESS'S OWNER CAN ALWAYS TAKE IT BACK, and this is the act that does it. Somebody who
     registered Vic's address signs in at once (no gate since the owner's 6 Oct ask) and keeps a
     30-day token; Vic, told "already registered", uses "Forgotten your PIN?", and the emailed PIN
     replaces theirs — and round one of the PR #130 review ended their session only while the row
     was still PENDING. So the squatter's route was to wait for Vic to open the "Confirm your
     account" mail she was sent: the row went TRUE, the emailed PIN later ended nothing, and their
     token read her profile and reset the PIN of the child she then made (round two, B5/B6).
     An emailed PIN becoming the PIN IS a PIN changed — `authEndSession_`'s own rule and `changePin`'s
     argument, that the act which removes an intruder must not leave them signed in — so it ends
     every session here, PENDING or not. The caller makes the new one straight after, so the person
     using it stays in. The REQUEST still ends nothing: anybody may make it (`forgotPin`). */
  authEndSession_(t, r);
  /* ---------- AND USING IT PROVES THE ADDRESS IT WENT TO ---------------------------------------------
     ONLY THE ACCOUNT'S OWN ADDRESS, and only the one it was sent to (`held.to`, written by
     `forgotPin`): a no-email child's PIN went to their grown-ups, which says nothing about the child's
     row — and confirming it would put the address the child TYPED for a grown-up, which nobody has
     opened, into every mail `authGrownUps_` sends. An address changed since the mail went is not the
     one that was proved. A PENDING row proved this way is TAKEN BACK (`authTakeBack_`), which is
     more than confirmed. */
  const kept = (S(held.to) && norm(held.to) === norm(r.email) && addressPending_(r)) ? authTakeBack_(t, r) : 0;
  return { childrenHeld: kept };
}

/* ---------- SESSIONS, KEPT OFF THE SHEET -------------------------------------------------------
   `AUTH_S_<digest of the token>` → `{ id, until }`. The token itself is returned once and never
   stored. Expired ones are swept whenever a new one is made, so the store does not grow. */
function authSessionKey_(token) { return 'AUTH_S_' + authDigest_(token); }

function authNewSession_(t, r) {
  const token = Utilities.getUuid() + Utilities.getUuid();
  const props = authProps_();
  try {
    const all = props.getProperties(), now = Date.now();
    Object.keys(all).forEach(k => {
      if (k.indexOf('AUTH_S_') !== 0) return;
      try { if (N(JSON.parse(all[k]).until) < now) props.deleteProperty(k); } catch (err) { props.deleteProperty(k); }
    });
  } catch (err) {}
  props.setProperty(authSessionKey_(token),
    JSON.stringify({ id: S(r.person_id), until: Date.now() + AUTH.SESSION_DAYS * 864e5 }));
  authClearThrottle_(t, r);
  return token;
}

/* WHO IS CALLING, decided by the token and by nothing else. */
function authWhoIs_(token) {
  const given = S(token);
  if (!given) return null;
  let s = null;
  try { s = JSON.parse(authProps_().getProperty(authSessionKey_(given)) || 'null'); } catch (err) {}
  if (!s || !s.id || N(s.until) < Date.now()) return null;
  return read(TAB.people).rows.find(x => S(x.person_id) === S(s.id)) || null;
}

/* ---------- A PENDING ADDRESS PROVED BY ITS OWNER: CONFIRMED, AND THE LINK RETIRED ----------------------
   ONCE SIGNING IN STOPPED WAITING ON THE LINK (the owner, 6 Oct), A PENDING ROW COULD HOLD A SESSION —
   and the PIN on a self-made row proves only who REGISTERED, not who owns the address. The emailed PIN
   used (`authResetTake_`) and Google vouching for the inbox (`googleLogin`) are the two proofs that come
   from the address and not from the registrant, so both TAKE THE ROW BACK (`authTakeBack_`), of which
   this is the first half. Neither caller stops at this: each ends every session the row holds before
   the caller's new one is made, and Google also takes away the PIN the registrant chose — see each for
   why. NOT `verifyEmail`, which writes the same two cells itself and ends no session: opening your own
   link is the registrant confirming their own account, and it must not sign them out of the phone they
   made it on. (It was `authAddressProven_` and ended the sessions too, which tied the ending to the row
   being PENDING — the squatter's way through, by waiting for the link to be opened.) */
function authConfirmed_(t, r) {
  setCell(t, r, 'verified', 'TRUE');
  setCell(t, r, 'verify_token', '');
  clearCache();
}

/* ---------- AND THE CHILDREN THE REGISTRANT PUT ON IT ARE HELD, NOT HANDED OVER ------------------------
   FOUND BY ROUND THREE OF THE PR #130 REVIEW: `confirmFirst_` stops a PENDING parent row being GIVEN a
   child, and that is only the links made after it. A link made before — the window between the owner's
   6 Oct change and this, an admin's `linkChild`, a claim answered then — sits `accepted` on a PENDING row,
   and `resetPin`'s refusal of it lasted exactly until somebody proved the address. Jo's typo jsmith1@
   with Ned on it: the stranger who owns jsmith1@ pressed "Forgotten your PIN?", typed the PIN back, the
   row went TRUE, and `resetPin` gave them Ned's PIN (measured: strangerIn, resetChild, signedInAsChild).
   SO WHEN AN ADDRESS'S OWNER TAKES A PENDING ROW BACK, the links the registrant made go to `held`. Not
   `asked`, which the review suggested and which is a trap: the claim would reach Ned from "Jo Smith" —
   the name on the row the stranger now holds — and a child says yes to their mum's name. `held` is read
   by nothing as a link or as a request; only an admin's `linkChild` settles it, because only a person
   can tell which of the two people who touched this account the child belongs to. The same for an
   unanswered `asked`: a yes to it later would be the same hand-over.
   ONLY HERE, ON THE TAKING BACK. `verifyEmail` holds nothing: it is the registrant opening their own
   link, the ordinary way a parent's account is confirmed, and a parent must not lose their children for
   doing what the mail asked. Answers how many links were held, for the reply to say so. */
function authTakeBack_(t, r) {
  authConfirmed_(t, r);
  return authHoldChildren_(r);
}

function authHoldChildren_(r) {
  const id = S(r && r.person_id);
  if (!id) return 0;
  const fam = read(TAB.family);
  let held = 0;
  fam.rows.forEach(x => {
    if (S(x.parent_id) !== id) return;
    const st = norm(x.state);
    if (st !== 'accepted' && st !== 'asked') return;
    if (setCell(fam, x, 'state', 'held')) held++;
    setCell(fam, x, 'answered_on', new Date());
  });
  if (held) clearCache();
  return held;
}

/* WHAT THE PERSON WHO HAS JUST TAKEN A ROW BACK IS TOLD ABOUT ITS CHILDREN — laid over the sign-in reply
   by each door that can take one back. It reads to either of the two people it can be: the address's
   real owner, who never made those links, or the registrant who forgot their PIN, who did and needs
   to know where they went. */
function authHeldSaid_(n) {
  if (!n) return '';
  return 'Your email is confirmed now. The account was in use before anybody had confirmed it, so the '
       + (n === 1 ? 'child' : n + ' children') + ' on it ' + (n === 1 ? 'has' : 'have')
       + ' been taken off until we have checked who they belong to. Get in touch with us and we will put '
       + 'them back.';
}

/* SIGNING OUT, or a PIN changed: every session that person holds ends here, not only on the phone. */
function authEndSession_(t, r) {
  const id = S(r && r.person_id);
  if (!id) return;
  try {
    const props = authProps_(), all = props.getProperties();
    Object.keys(all).forEach(k => {
      if (k.indexOf('AUTH_S_') !== 0) return;
      try { if (S(JSON.parse(all[k]).id) === id) props.deleteProperty(k); } catch (err) {}
    });
  } catch (err) {}
}

/* ==================================================================================================
   A NEW EMAIL ADDRESS WAITS BESIDE THE OLD ONE UNTIL IT IS PROVED — BY THE ACCOUNT, SIGNED IN
   --------------------------------------------------------------------------------------------------
   FOUND BY ROUND THREE OF THE PR #130 REVIEW, AND OLDER THAN IT: Settings → Contact → email wrote the
   new address straight into `email` and left `verified` as it was. Jo, confirmed on jsmith@, typed
   jsmith1@: the row stayed TRUE, so every booking notice went to jsmith1@'s owner (`notify`), who
   pressed "Forgotten your PIN?", signed in as Jo and reset the PIN of Jo's child — every rule of
   `confirmFirst_` and `addressPending_` stepped round by one Save. And a PENDING row edited kept its old
   `verify_token`, so the link mailed to the OLD address confirmed the row while it held the NEW one.

   WHY NOT SET IT BACK TO PENDING, which the review offered first: on a confirmed row that would hand
   the row to whoever proves the new address, and the new address is exactly the one nobody has proved.
   The typo's owner would take Jo's account — her address, her phone, her bookings — by the same
   "Forgotten your PIN?" that is right for a squatted sign-up; and Google signing in on it would take
   her PIN and her children. A confirmed row has an owner already, proved; the new address has to be
   proved to BE theirs, not merely to be somebody's.

   SO THE NEW ADDRESS IS KEPT ASIDE (`AUTH_MOVE_<person_id>` → `{ to, key, at, until }`), the row keeps
   the address it has, and a link goes to the new one. Opening it moves the address — but only where the
   ACCOUNT is signed in (`verifyEmail`), because the proof wanted is both halves at once: this inbox, and
   this account. The typo's owner holds the first and never the second, so they cannot finish it; and
   until it is finished nothing about the new address reaches anything — no door signs in by it, no
   "Forgotten your PIN?" goes to it, no mail is sent to it but the link. A row that is PENDING on an
   address of its own has nothing proved to keep, so its address is simply corrected there (`updateProfile`).
================================================================================================== */
function authMoveKey_(r) { return 'AUTH_MOVE_' + S(r && (r.person_id || personDisplayName(r))); }

function authMoveGet_(r) {
  let m = null;
  try { m = JSON.parse(authProps_().getProperty(authMoveKey_(r)) || 'null'); } catch (err) {}
  if (!m || !S(m.to) || !S(m.key) || N(m.until) < Date.now()) return null;
  return m;
}

function authMovePut_(r, m) {
  try { authProps_().setProperty(authMoveKey_(r), JSON.stringify(m)); return true; }
  catch (err) { return false; }
}

function authMoveDrop_(r) {
  try { authProps_().deleteProperty(authMoveKey_(r)); } catch (err) {}
}

/* THE MOVE A LINK BELONGS TO, by its key: `{ owner, move }` — `authResetFind_`'s shape and reason. */
function authMoveFind_(key) {
  const want = S(key);
  if (!want) return null;
  try {
    const all = authProps_().getProperties();
    const hit = Object.keys(all).filter(k => k.indexOf('AUTH_MOVE_') === 0).map(k => {
      let move = null;
      try { move = JSON.parse(all[k]); } catch (err) {}
      return { owner: k.slice('AUTH_MOVE_'.length), move: move };
    }).find(x => x.move && S(x.move.key) && authSame_(S(x.move.key), want));
    if (!hit || !S(hit.move.to) || N(hit.move.until) < Date.now()) return null;
    return hit;
  } catch (err) { return null; }
}

/* THE LINK TO THE NEW ADDRESS. It names nobody: the reader may be a stranger whose address was typed by
   mistake, and the account's name and handle are not theirs to be told. Throws as `MailApp` does. */
function moveMail_(to, key) {
  MailApp.sendEmail({ to: S(to), name: '@family.',
    subject: 'Confirm your new @family. email address',
    body: 'Hello,\n\nSomebody signed in to an @family. account has asked to use this email address for it.'
        + '\n\nIf that was you, open this link on a phone or computer where you are signed in to that account:'
        + '\n\n' + SITE_URL + '?verify=' + key
        + '\n\nUntil it is opened, the account keeps its old address — sign in with that, or with your handle.'
        + ' The link works for ' + AUTH.MOVE_DAYS + ' days.'
        + '\n\nIf it was not you, ignore this email. Nothing changes, and the link does nothing for anybody '
        + 'who is not signed in to that account.'
        + '\n\n— @family.' });
}
