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
const BOOKING_VERSION = "2026-08-15-funnel";


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
  if (need === 'admin' && !isAdminPerson(S(body.adminName) || S(body.name))) {
    return 'Not authorised.';
  }
  /* `clientName` counts as being signed in. `createJob` names the person that way and nothing
     else does — so the gate asked for a field the one handler behind it never sends, and every
     booking would have been refused with "You need to be signed in for that" by somebody who
     plainly was. It has never fired because the booking form is not wired yet; it would have
     fired on the first booking ever made. */
  if (need === 'self' && !S(body.name) && !S(body.adminName) && !S(body.clientName)) {
    return 'You need to be signed in for that.';
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
 * WEEKLY, because that is how these sessions run — one weekday and one time, repeating. An hour is
 * busy for the tutor's week if any live session of theirs sits on it.
 */
function busyHours(tutorName) {
  const out = {};
  if (!S(tutorName)) return out;
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

    const d = DAY[norm(j.weekday)];
    if (!d) return;
    const from = Number(String(fmtTime(j.start_time)).split(':')[0]);
    if (!from && from !== 0) return;
    const hours = Math.max(1, N(j.hours_per_session) || N(config().h) || 2);
    for (let h = from; h < from + hours; h++) {
      out[d + String(h).padStart(2, '0')] = S(j.subject) || 'Booked';
    }
  });
  return out;
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
    .filter(r => hasRole(r, 'tutor') && N(r.rate_per_hour) > 0)
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
  const seats = N(cfg.waitlist_seats) || 4;
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

/* THE ONE WAITLIST A VENUE MAY HAVE OPEN. Two lists on one room is two sets of families waiting for
   the same four seats, and the second one cannot ever be filled without the first being abandoned.
   OPEN means nobody has paid yet: a waitlist whose families are Booked has become a session and is
   no longer a list, so the room is free to start another. */
function openWaitlistAt(venueName) {
  return read(TAB.jobs).rows.find(j => {
    if (norm(j.kind) !== 'waitlist') return false;
    if (key(j.venue) !== key(venueName)) return false;
    const cs = clientsIn(S(j.job_id) || String(j._row));
    if (!cs.length) return false;                        // nobody on it — it is not a live list
    return !cs.some(c => c.status === BM.BOOKED);        // once anybody is Booked it is a session
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
    if (!ON_(r.active)) return false;
    const when = sheetDate(r.date);
    if (!when) return false;
    /* READY, or not offered. Said as three separate conditions rather than one, because the health
       report should eventually be able to say WHICH of them is missing. */
    if (!S(r.venue)) return false;
    if (!(N(r.price_per_child) > 0)) return false;

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