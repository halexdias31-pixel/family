/* @family. — 30_booking.gs (4 of 8) THE BOOKING MACHINE, and everything that decides who is in a session. § */

/* ---------- THIS FILE'S OWN STAMP § */
const BOOKING_VERSION = "2026-10-25-z-history-db";


/* WHEN THE BUSINESS ACTUALLY OPERATES within an interval. § */
function operatingWindow(startCell, endCell) {
  const rawStart = sheetDate(startCell), rawEnd = sheetDate(endCell);
  if (!rawEnd) return null;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  /* THE LATER of the interval's start and today. § */
  const useStart = rawStart && rawStart <= rawEnd && rawStart > today;
  const from = useStart ? rawStart : today;
  /* A start AFTER the end is a typo, and rescuing it silently is worse than it looks: § */
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

/* WHERE A TERM SITS RELATIVE TO TODAY — current, next, the one after, or past. § */
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

/* TERM, HOLIDAY, or HALF-TERM. § */
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

/* WRITE A RECEIPT, and never fail the thing it is recording. § */
function writeReceipt_(o) {
  try {
    const t = read(TAB.receipts);
    if (!t.sheet) return { error: 'no receipts tab — load ?setup=1' };
    /* THE NUMBER, AND WHY IT IS NOT A COUNT OF THE ROWS. § */
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

/* `weeksBetween` was here — whole weeks from today to an end date. § */


/* A GAME LOBBY. Everyone in the session readies up; changing the settings un-readies everybody. § */
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

/* `bmConfirmPayment` was here. § */


/* `bmPossession` was here — whose move it is, worked out from the two statuses. § */


/* ---------- EVENTS § */
function logEvent(ev) {
  try {
    // Self-heal a sheet that predates a column. Without `target`, an Accept loses WHO it was
    // aimed at — so a tutor chosen at booking stays "Applied" and the card offers to pick a
    // tutor who has already been picked. Depending on someone remembering to run ensureSchema_ is
    // not a safeguard.
    if (read(TAB.events).headers.indexOf('target') < 0) { ensureSchema_(); clearCache(); }
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

/* ---------- WHO IS IN A JOB § */
function participantsOf(jobId) {
  const state = {};        // name -> { name, role, status }
  eventsForJob(jobId).forEach(e => {
    const who = S(e.actor), target = S(e.target), act = S(e.action);
    if (!who) return;
    /* ---------- LEAVING, AND THE ONE CASE THAT MUST NOT VANISH § */
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

    /* ---------- A REFUND OWED CANNOT BE ERASED BY A LATER EVENT § */
    /* A LINE STOOD HERE returning early on an Edit for anybody owed a refund, and it never once ran to any effect: § */
    if (act === ACT.REQUEST) cur.status = BM.WAITING;
    if (act === ACT.ACCEPT)  cur.status = BM.AGREED;
    if (act === ACT.PAY)     cur.status = BM.PAYING;
    // Terms changed: everyone drops to un-ready, the person who changed them included. This is the
    // whole point of the lobby — a change nobody re-approves cannot proceed to payment.
    if (act === ACT.EDIT) {
      /* NOT THE BOOKED, AND NOT THE WITHDRAWN EITHER. § */
      Object.keys(state).forEach(k => {
        if (state[k].status !== BM.BOOKED && state[k].status !== 'Withdrawn') {
          state[k].status = BM.WAITING;
        }
      });
      /* THE LINE ABOVE PROTECTS EVERY BOOKED PERSON AND THE MOVER WAS NOT ONE OF THEM. § */
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

/* WHAT A BOOKING EARNS, FROZEN WHEN IT IS AGREED (docs/history/353) § */
function jobMoneyFreeze_(row, cfg, now) {
  if (!row || S(row.priced_at) !== '' || S(row.gross) === '') return null;
  const r2 = x => Math.round(x * 100) / 100;
  const gross = N(row.gross);
  const pct = Math.max(0, N((cfg || {}).card_fee_pct)), fixed = Math.max(0, N((cfg || {}).card_fee_fixed));
  const fees = gross > 0 ? r2(gross * pct / 100 + fixed) : 0;
  const net = r2(gross - N(row.tutor_payout) - N(row.venue_cost) - N(row.materials_cost)
                 - N(row.tickets_cost) - fees);
  return { card_fees: fees, net_profit: net, priced_at: now || new Date() };
}
/* AGREED IS EVERYBODY AT AGREED OR PAST IT, AND AT LEAST ONE FAMILY. § */
function jobAgreed_(jobId) {
  const ps = participantsOf(jobId);
  const ok = [BM.AGREED, BM.PAYING, BM.BOOKED];
  return ps.some(p => p.role === 'client') && ps.every(p => ok.indexOf(p.status) !== -1);
}
/* ---------- A DISCOUNT IS AN ADMIN'S, AND A CODE IS ITS OWN ROW'S § */
function discountRefusal_(body, isAdmin, codeRow, today) {
  const f = ['discountType', 'discountValue', 'discountCode', 'discountAbsorbedBy'];
  if (!f.some(k => S((body || {})[k]) !== '')) return '';
  if (!isAdmin) return 'Only @family. gives a discount. Nothing was sent.';
  const type = S(body.discountType);
  if (type !== '%' && type !== '£') return 'A discount is a % or £. Nothing was sent.';
  const value = N(body.discountValue);
  if (!(value > 0) || (type === '%' && value > 100)) return 'That discount is not a number this can take. Nothing was sent.';
  const by = S(body.discountAbsorbedBy);
  if (by && by !== 'Business' && by !== 'Shared with tutor') return 'A discount is absorbed by the business or shared with the tutor. Nothing was sent.';
  const code = S(body.discountCode);
  if (!code || !codeRow) return '';
  if (!ON_(codeRow.active)) return 'The code ' + code + ' is switched off. Nothing was sent.';
  const ends = S(codeRow.expires) ? sheetDate(codeRow.expires) : null;
  if (ends && today && ends.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
    return 'The code ' + code + ' has expired. Nothing was sent.';
  }
  if (N(codeRow.max_uses) > 0 && N(codeRow.used) >= N(codeRow.max_uses)) {
    return 'The code ' + code + ' has been used all ' + N(codeRow.max_uses) + ' times. Nothing was sent.';
  }
  if (S(codeRow.type) && (S(codeRow.type) !== type || N(codeRow.value) !== value)) {
    return 'The code ' + code + ' is ' + (S(codeRow.type) === '%' ? N(codeRow.value) + '%' : '£' + N(codeRow.value))
         + ', not what was sent. Nothing was sent.';
  }
  return '';
}

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
  /* A WITHDRAWN SEAT IS A RECORD, NOT A PERSON COMING. § */
  if (cs.every(c => c.status === 'Withdrawn')) return 'cancelled';
  return 'unconfirmed';
}

/* ---------- A ROOM'S BLANK CELL IS ITS VENUE'S § */
function roomTerms_(room, venue) {
  const v = venue || {};
  return {
    rate: S(room.rate_per_hour) === '' ? N(v.cost_per_hour) : N(room.rate_per_hour),
    /* NOT THE VENUE'S. A concession is a second price on this one room, and a venue has no column
       for one — blank is "no concession rate", which is what it already meant. */
    concession: N(room.concession_rate),
    min: N(room.min_capacity) || N(v.min_students) || 1,
    max: N(room.max_capacity) || N(v.max_students),
    availability: S(room.availability) || S(v.availability),
  };
}

/* "Colliers Wood Library — Small room 1" → the venue's row, the room's row, and the room's terms. § */
function spaceOf_(label) {
  const parts = S(label).split('—').map(x => x.trim());
  const at = parts[0], roomName = parts.slice(1).join('—').trim();
  const venue = read(TAB.venues).rows.find(x => key(x.name) === key(at)) || null;
  const room = roomName
    ? (read(TAB.rooms).rows.find(x => key(x.venue) === key(at) && key(x.name) === key(roomName)) || null)
    : null;
  return { venue, room, terms: room ? roomTerms_(room, venue) : null };
}

/** The seat cap for a job: the lowest of the tutor's, the venue's and the job's own. */
function capacityFor(kind, name) {
  if (!name) return 0;
  if (kind === 'venue') {
    // "Richmond Library — Small room 1" narrows to that room's own capacity; a bare venue name, or a
    // room with no capacity typed, falls back to the building's — `roomTerms_` does the falling back.
    const sp = spaceOf_(name);
    if (sp.terms && sp.terms.max) return sp.terms.max;
    return sp.venue ? N(sp.venue.max_students) : 0;
  }
  const p = findPerson(name);
  return p ? N(p.max_students) : 0;
}

/* ---------- A TUTOR'S MONTH, SESSION BY SESSION (405) ----------
   Paid bookings (`active`) this tutor is confirmed on; each booking's money shared evenly over its dates, as `profitActual_` does on the phone. */
function payStatement_(tutor, ym) {
  const m = /^(\d{4})-(\d{2})$/.exec(S(ym));
  if (!tutor || !m) return null;
  const y = Number(m[1]), mo = Number(m[2]) - 1, me = key(personDisplayName(tutor));
  const cfg = config();
  const r2 = x => Math.round(x * 100) / 100;
  /* THE FIRST FIGURE WRITTEN WINS: the booking's own price, else the money frozen when it was agreed (353). */
  const cash = (j, a, b) => S(j[a]) !== '' ? N(j[a]) : N(j[b]);
  const rows = [];
  read(TAB.jobs).rows.forEach(j => {
    const jobId = S(j.job_id) || String(j._row);
    if (norm(j.kind) === 'waitlist' || jobStatusOf(jobId) !== 'active') return;
    const t = tutorsIn(jobId).find(p => p.status === BM.AGREED || p.status === BM.BOOKED);
    if (!t || key(t.name) !== me) return;
    const all = sessionDatesOf(j).map(sheetDate).filter(Boolean);
    const here = all.filter(d => d.getFullYear() === y && d.getMonth() === mo);
    if (!here.length) return;
    const kids = S(j.for_children).split(/[,\n]/).map(x => x.trim()).filter(Boolean).length;
    const students = kids || clientsIn(jobId).filter(c => c.status !== 'Withdrawn').length || 1;
    const paid = cash(j, 'price_total', 'gross'), pay = cash(j, 'tutor_pay', 'tutor_payout'), kept = cash(j, 'admin_profit', 'net_profit');
    here.forEach(d => rows.push({
      date: d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2), job: jobId,
      what: (S(j.level) + ' ' + S(j.subject)).trim() || 'Session',
      hours: N(j.hours_per_session) || N(cfg.h) || 2, students,
      paid: r2(paid / all.length), business: r2(kept / all.length), tutor: r2(pay / all.length) }));
  });
  rows.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
  const sum = k => r2(rows.reduce((t, r) => t + r[k], 0));
  return { month: S(ym), tutor: personDisplayName(tutor), tutorId: S(tutor.person_id), sessions: rows,
           totals: { sessions: rows.length, hours: sum('hours'), paid: sum('paid'), business: sum('business'), tutor: sum('tutor') } };
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
  /* `clientName` counts as being signed in. § */
  /* ---------- BEING SIGNED IN IS A TOKEN, NOT A NAME § */
  if (need === 'self' || need === 'admin') {
    const who = authWhoIs_(body.token);
    if (!who) return 'Please sign in again.';
    body.name = personDisplayName(who);
    body.personId = S(who.person_id);
    /* ADMIN IS ASKED OF THE ROW THE TOKEN RESOLVED TO, not of its display name looked up again. § */
    if (need === 'admin' && !hasRole(who, 'admin')) return 'Not authorised.';
    /* NAMING SOMEBODY ELSE AS THE ADMIN IS OVER. Anything reading `adminName` gets the signed-in
       person, so the two can no longer disagree. */
    if (S(body.adminName)) body.adminName = body.name;
  }
  return '';
}

/* ---------- FINDING ONE ROW BY ITS OWN NAME § */
function rowById_(t, idColumn, id, fallbackRow) {
  const want = S(id);
  if (want && t.headers.indexOf(idColumn) >= 0) {
    const hit = t.rows.find(r => S(r[idColumn]) === want);
    if (hit) return hit;
  }
  if (fallbackRow) return t.rows.find(r => r._row === Number(fallbackRow)) || null;
  return null;
}

/* ---------- INVITATIONS § */

/* WHO IS ACTUALLY TEACHING A SESSION, by name, or '' if nobody has been settled on yet. § */
function confirmedTutorOf_(jobId) {
  const t = tutorsIn(jobId).find(x => x.status === BM.AGREED || x.status === BM.BOOKED);
  return t ? t.name : '';
}

/* ---------- THE HOURS SOMEBODY IS ALREADY TEACHING § */
/* ---------- AND ONLY WHILE THE SESSION IS RUNNING § */
function busyHours(tutorName, from, to) {
  const out = {};
  if (!S(tutorName)) return out;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const lo = from || today, hi = to || lo;
  read(TAB.jobs).rows.forEach(j => {
    const id = S(j.job_id) || String(j._row);
    if (!id) return;
    /* A JOB NOBODY IS IN IS NOT BUSY TIME. `jobStatusOf` reads a cancelled session from the roster,
       so an hour is released the moment the last person leaves — no cleanup, no second path. */
    if (jobStatusOf(id) === 'cancelled') return;
    /* And only where THIS tutor is actually the one teaching it. Somebody who applied and was not
       chosen is not busy. */
    if (key(confirmedTutorOf_(id)) !== key(tutorName)) return;

    /* ---------- A SESSION MAY RUN ON MORE THAN ONE DAY, AND THIS MISSED ALL OF THEM § */
    const when = sessionDatesOf(j).map(sheetDate).filter(Boolean).sort((a, b) => a - b);
    if (when.length && (when[when.length - 1] < lo || when[0] > hi)) return;

    /* EVERY BOOKED HOUR, off `slot_codes` (434) — the old weekday + start + length read Mon 10–12 + Fri 16–18 as Fri 10–12. */
    jobCodes_(j).forEach(c => { out[c] = S(j.subject) || 'Booked'; });
  });
  return out;
}

/* ---------- THE HOURS A BOOKING ASKS FOR, AS THE GRID'S OWN CODES § */
const DAY_CODE_ = { monday: 'm', mon: 'm', tuesday: 'tu', tue: 'tu', wednesday: 'w', wed: 'w',
                    thursday: 'th', thu: 'th', friday: 'f', fri: 'f',
                    saturday: 'sa', sat: 'sa', sunday: 'su', sun: 'su' };
function bookingCodes_(body) {
  const sent = slotCodes_(body.slots);
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

/* ---------- THE CODES A REQUEST SENDS, READ STRICTLY § */
function slotCodes_(v) {
  const seen = {};
  return S(v).split(',').map(x => norm(x)).filter(x => {
    if (!/^(m|tu|w|th|f|sa|su)\d{2}$/.test(x) || Number(x.slice(-2)) > 23 || seen[x]) return false;
    seen[x] = 1;
    return true;
  });
}

/* ---------- A JOB'S BOOKED HOURS, AS CODES (434) ---------- */
/* `slot_codes` when the row has it; an older row's weekday + start + length otherwise — what the backfill writes, so both read alike. */
function jobCodes_(j) {
  const kept = slotCodes_(j && j.slot_codes);
  if (kept.length) return kept;
  const days = String(S(j && j.weekday)).split(',').map(x => DAY_CODE_[norm(x)]).filter(Boolean);
  const raw = S(j && j.start_time);
  const from = Number(String(fmtTime(j && j.start_time)).split(':')[0]);
  if (!days.length || !raw || !isFinite(from)) return [];
  const hours = Math.max(1, N(j.hours_per_session) || N(config().h) || 2);
  const out = [];
  days.forEach(d => { for (let h = from; h < from + hours && h <= 23; h++) out.push(d + String(h).padStart(2, '0')); });
  return out;
}

/* ---------- THE HOURS A ROOM IS ALREADY TAKEN (434) ---------- */
/* Derived from `jobs`, never stored (time-design 1). Only a real room row counts: a bare venue, a home or Online is not one space. */
function spaceBusy(label, from, to) {
  const out = {};
  const sp = spaceOf_(label);
  if (!sp.room) return out;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const lo = from || today, hi = to || lo;
  read(TAB.jobs).rows.forEach(j => {
    if (key(j.venue) !== key(label)) return;
    const id = S(j.job_id) || String(j._row);
    if (!id || jobStatusOf(id) === 'cancelled') return;
    const when = sessionDatesOf(j).map(sheetDate).filter(Boolean).sort((a, b) => a - b);
    if (when.length && (when[when.length - 1] < lo || when[0] > hi)) return;
    jobCodes_(j).forEach(c => { out[c] = S(j.subject) || 'Booked'; });
  });
  return out;
}

/* A BOOKING MUST NOT LAND ON A ROOM ALREADY TAKEN (434): two families were both accepted for one room at one hour. */
function roomClashRefusal_(body) {
  const label = S(body.location);
  const dates = S(body.dates).split(',').map(sheetDate).filter(Boolean).sort((a, b) => a - b);
  const busy = spaceBusy(label, dates[0], dates[dates.length - 1]);
  const taken = bookingCodes_(body).filter(c => busy[c]);
  if (!taken.length) return '';
  return label + ' is already booked at ' + taken.slice(0, 3).map(codeSaid_).join(', ')
    + (taken.length > 3 ? ' and ' + (taken.length - 3) + ' more' : '') + ' in those weeks. Pick other hours, or another room.';
}

/* ---------- THE BACKFILL: EVERY OLD JOB GETS ITS slot_codes (434) ---------- */
/* Only a blank cell is written, so running it twice does what once did. Run by MIGRATIONS (361). */
function backfillSlotCodes_() {
  const t = read(TAB.jobs);
  if (t.headers.indexOf('slot_codes') < 0) throw new Error('the jobs tab has no slot_codes column yet');
  let wrote = 0, left = 0;
  t.rows.forEach(j => {
    if (slotCodes_(j.slot_codes).length) return;
    const codes = jobCodes_(j);
    if (!codes.length) { left++; return; }
    if (setCell(t, j, 'slot_codes', codes.join(','))) wrote++;
  });
  return { wrote: wrote, noHours: left };
}

/* A CODE AS A PERSON SAYS IT — `m16` is `Monday 16:00`. */
function codeSaid_(c) {
  const p = String(c).replace(/\d+$/, ''), h = String(c).slice(p.length);
  const day = Object.keys(DAY_CODE_).find(k => DAY_CODE_[k] === p && k.length > 3) || p;
  return day.charAt(0).toUpperCase() + day.slice(1) + ' ' + h + ':00';
}

/* ---------- A BOOKING BY NAME MUST FIT THE TUTOR'S WEEK, AND NOT LAND ON ANOTHER SESSION § */
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

/* THE SCHOOL YEAR, WORKED OUT RATHER THAN TYPED. § */
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
/* ONE DAY IN MILLISECONDS, and it has to live out here. § */
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

  /* AUTUMN starts the first week of September. § */
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

  /* ---------- A HOLIDAY COVERS THE WEEKEND EITHER SIDE OF IT § */
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

/* ---------- WHICH TERM A WAITING LIST IS FOR § */
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

/* ---------- WHEN THE PEOPLE ON A WAITING LIST CAN COME § */
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

/* ---------- WHAT THE JOURNEY TO A VENUE COSTS § */
function travelCost(venueName, sessions) {
  if (!S(venueName)) return 0;
  /* ONLINE, BY NAME. The venue row for it has no travel cost and never will, so this changes nothing today — it is here because "Online" is the one venue whose § */
  if (/^online$/i.test(S(venueName))) return 0;
  /* THE BUILDING, WHICHEVER ROOM. § */
  const v = spaceOf_(venueName).venue;
  if (!v) return 0;
  const each = N(v.travel_cost);
  if (each <= 0) return 0;
  return Math.round(each * Math.max(1, N(sessions) || 1) * 100) / 100;
}

/* ---------- IS THAT PRICE PLAUSIBLE? § */
function priceLooksWrong(o) {
  const hours = N(o.hours) || N(config().h) || 2;
  const weeks = Math.max(1, N(o.weeks) || 1);
  const seats = Math.max(1, N(o.seats) || 1);

  /* THE ROOM. Free is a legitimate answer — Online costs nothing and a client's own house nearly nothing — so a venue that is not found contributes zero rather § */
  const sp = spaceOf_(o.venue);
  const room = sp.terms ? sp.terms.rate : (sp.venue ? N(sp.venue.cost_per_hour) : 0);

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

  /* HALF THE FLOOR, not ninety per cent of it — and the difference matters more than it looks. § */
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

/* ---------- WHAT A WAITLIST SEAT COSTS § */
function waitlistPrice(venueName) {
  /* A ROOM'S LIST IS PRICED AS THAT ROOM. § */
  const sp = spaceOf_(venueName);
  const v = sp.venue;
  if (!v) return null;

  const cfg = config();
  /* ---------- HOW MANY SEATS, AND WHERE THAT NUMBER COMES FROM § */
  const room_cap = capacityFor('venue', venueName);
  const want = N(cfg.waitlist_seats) || 4;
  const seats = room_cap > 0 ? Math.min(room_cap, want) : want;
  if (seats < 1) return null;

  const room = sp.terms ? sp.terms.rate : N(v.cost_per_hour);
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

/* THE LIFE OF A WAITLIST THE NUMBERS ARE HERE AND NOWHERE ELSE. § */
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

/* WHERE A LIST HAS GOT TO, counted from the roster rather than stored. § */
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

/* WHEN A LIST OPENED TODAY WOULD SHUT. § */
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

/* THE ONE WAITLIST A VENUE MAY HAVE OPEN. § */
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

/* ---------- WHAT IS ON OFFER TODAY, DECIDED BY THE CALENDAR § */
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

/* READY, or not offered — and, since the calendar learned to close on one, not a closure either. § */
function festiveReady_(r) {
  if (!ON_(r.active)) return false;
  if (!sheetDate(r.date)) return false;
  if (!S(r.venue)) return false;
  if (!(N(r.price_per_child) > 0)) return false;
  return true;
}

/* THE DAYS NOBODY IS TAUGHT, INSIDE A TERM. § */
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
  /* CHRISTMAS AND BOXING DAY TAKE THE NEXT TWO WEEKDAYS FROM THE 25TH that the other has not, in order — which is the whole of the substitute rule: § */
  let c = at(11, 25), b = at(11, 26);
  if (!weekday(c) && !weekday(b)) { c = at(11, 27); b = at(11, 28); }
  else if (!weekday(c)) { c = at(11, 27); }
  else if (!weekday(b)) { b = at(11, 28); }
  out.push({ date: c, name: 'Christmas Day' }, { date: b, name: 'Boxing Day' });
  return out;
}

/* EVERY CLOSED DAY FROM LAST YEAR TO NEXT, as `{ date: 'dd/mm/yyyy', name, kind }`. § */
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

/* ---------- daily trigger § */
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
/* SIGNING IN: HASHING, SESSIONS, AND NOT LETTING SOMEBODY GUESS THREE THINGS WERE WRONG AND THEY ARE THE THREE THINGS EVERY LOGIN GETS WRONG. § */
/* ---------- THE SIMPLE VERSION: ONE `pin` CELL, AND NOTHING ELSE ON THE ROW § */
const AUTH = {
  SESSION_DAYS: 30,      // signed in for a month, then the PIN again
  FREE_TRIES: 10,        // nothing happens at all until the eleventh wrong answer
  WAITS: [1, 2, 5, 15, 60],  // minutes: one rung per wrong answer after that, then the last for ever
  /* A DAY WITH NO WRONG ANSWER STARTS THE COUNT AGAIN. § */
  QUIET_HOURS: 24,
  /* A PIN SENT BY "Forgotten your PIN?" § */
  RESET_HOURS: 24,
  RESET_GAP_MINS: 15,
  RESET_MISSES: 5,
  /* "SEND THE LINK AGAIN" — see `resendLink` in dopost.gs. § */
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

/* SET OR CHANGE A PIN: § */
function authSetPin_(t, r, pin) { setCell(t, r, 'pin', String(pin)); }

/* ---------- A PIN CELL THE SHEET HAS TURNED INTO A NUMBER § */
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

/* ---------- ONE RULE FOR A PIN NOBODY SHOULD HAVE § */
function pinWeak_(pin) {
  const p = S(pin);
  const obvious = ['1234', '12345', '123456', '1234567', '12345678', '123123', '4321', '654321'];
  return /^(\d)\1+$/.test(p) || obvious.indexOf(p) !== -1;
}

/* ---------- A PIN THIS BACKEND MAKES UP § */
function authFreshPin_() {
  let made = '';
  for (let tries = 0; tries < 20; tries++) {
    made = String(100000 + Math.floor(Math.random() * 900000));
    if (!pinWeak_(made)) break;
  }
  return made;
}

/* ---------- THE THROTTLE, KEPT OFF THE SHEET § */
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


function authWrong_(t, r) {
  const was = authThrottle_(r);
  /* ---------- A QUIET DAY WIPES THE SLATE § */
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
  try { notify(personDisplayName(r), 'Too many sign-in attempts', said + 'If that was not you, reply here.', 'security'); }
  catch (err) {}
  /* ---------- AND A CHILD WITH NO ADDRESS HAS A GROWN-UP WHO IS TOLD § */
  if (S(r.email)) return;
  /* CONFIRMED GROWN-UPS ONLY — the rule `notify` keeps (`addressPending_`), read in `authGrownUps_`. § */
  const tos = authGrownUps_(r);
  if (!tos.length) return;
  try {
    mailOut_({ to: tos.join(','), name: BRAND_NAME, subject: 'Too many sign-in attempts',
      body: said + 'If that was ' + (S(r.first_name) || 'them') + ', "New PIN" on their card on your '
          + 'account gives them a new one at once. If it was not, tell us.' });
  } catch (err) {}
}

/* ---------- WHO IS WRITTEN TO FOR A CHILD WITH NO ADDRESS OF THEIR OWN § */
function authGrownUps_(r) {
  const tos = acceptedParents(S(r && r.person_id))
    .filter(p => !addressPending_(p)).map(p => S(p.email)).filter(Boolean);
  const typed = S(r && r.parent_email);
  if (typed && !addressPending_(r) && tos.map(norm).indexOf(norm(typed)) === -1) tos.push(typed);
  return tos;
}

/* A successful sign-in, a PIN reset by e-mail and a PIN change all clear it: § */
function authClearThrottle_(t, r) {
  try { authProps_().deleteProperty(authThrottleKey_(r)); } catch (err) {}
}

/* A FORGOTTEN PIN IS SENT BESIDE THE OLD ONE, AND REPLACES IT ONLY WHEN IT IS USED "FORGOTTEN YOUR PIN?" § */
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

/* THE ROW A SIGN-IN LINK BELONGS TO, by its key and nothing else: § */
function authResetFind_(key) {
  const want = S(key);
  if (!want) return null;
  try {
    const all = authProps_().getProperties();
    const hit = Object.keys(all).filter(k => k.indexOf('AUTH_RESET_') === 0).map(k => {
      let held = null;
      try { held = JSON.parse(all[k]); } catch (err) {}
      return { owner: k.slice('AUTH_RESET_'.length), held: held };
    /* `e`, NOT `x`: `check-columns` reads `x.<word>` as a sheet row's column, and `held` is not one. */
    }).find(e => e.held && S(e.held.key) && authSame_(S(e.held.key), want));
    if (!hit || !S(hit.held.pin) || N(hit.held.until) < Date.now()) return null;
    return hit;
  } catch (err) { return null; }
}

/* DOES `given` MATCH THE EMAILED PIN — and if it does, it becomes the PIN (`authResetTake_`). § */
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
  /* ---------- EVERY OTHER SESSION ENDS, WHATEVER STATE THE ROW IS IN § */
  authEndSession_(t, r);
  /* ---------- AND A CHANGE OF ADDRESS LEFT WAITING IS CANCELLED § */
  const moving = S((authMoveGet_(r) || {}).to);
  authMoveDrop_(r);
  /* ---------- AND USING IT PROVES THE ADDRESS IT WENT TO § */
  const kept = (S(held.to) && norm(held.to) === norm(r.email) && addressPending_(r)) ? authTakeBack_(t, r) : 0;
  return { childrenHeld: kept, moveDropped: moving };
}

/* WHAT THE PERSON TAKING A ROW BACK IS TOLD ABOUT A CHANGE OF ADDRESS THAT WAS WAITING — `authResetTake_` cancels it. § */
function authMoveSaid_(to) {
  if (!S(to)) return '';
  return 'A change of this account\'s email to ' + S(to) + ' was waiting to be confirmed, and it has been '
       + 'cancelled. If you asked for it, type the new address again in Settings.';
}

/* ---------- SESSIONS, KEPT OFF THE SHEET § */
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

/* ---------- A PENDING ADDRESS PROVED BY ITS OWNER: CONFIRMED, AND THE LINK RETIRED § */
function authConfirmed_(t, r) {
  setCell(t, r, 'verified', 'TRUE');
  setCell(t, r, 'verify_token', '');
  clearCache();
}

/* ---------- AND THE CHILDREN THE REGISTRANT PUT ON IT ARE HELD, NOT HANDED OVER § */
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

/* WHAT THE PERSON WHO HAS JUST TAKEN A ROW BACK IS TOLD ABOUT ITS CHILDREN — laid over the sign-in reply by each door that can take one back. § */
function authHeldSaid_(n) {
  if (!n) return '';
  return 'Your email is confirmed now. The account was in use before anybody had confirmed it, so the '
       + (n === 1 ? 'child' : n + ' children') + ' on it ' + (n === 1 ? 'has' : 'have')
       + ' been taken off until we have checked who they belong to. Get in touch with us and we will put '
       + 'them back.';
}

/* A PIN CHANGED, A PIN RESET, A ROW TAKEN BACK: § */
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

/* A NEW EMAIL ADDRESS WAITS BESIDE THE OLD ONE UNTIL IT IS PROVED — BY THE ACCOUNT, SIGNED IN FOUND BY ROUND THREE OF THE PR #130 REVIEW, AND OLDER THAN IT: § */
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
    /* `e`, not `x` — the reason is over `authResetFind_`'s. */
    }).find(e => e.move && S(e.move.key) && authSame_(S(e.move.key), want));
    if (!hit || !S(hit.move.to) || N(hit.move.until) < Date.now()) return null;
    return hit;
  } catch (err) { return null; }
}

/* THE LINK TO THE NEW ADDRESS. It names nobody: the reader may be a stranger whose address was typed by
   mistake, and the account's name and handle are not theirs to be told. Throws as `MailApp` does. */
function moveMail_(to, key) {
  mailOut_({ to: S(to), name: '@family.',
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
