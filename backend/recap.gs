/* ==================================================================================================
   @family. — recap.gs   THE EMAIL TO PARENTS AFTER EACH SESSION

   ASKED FOR AS *"i need to begin wiring up the feedback system for parents to see the questions their
   children have done. like for example i have done with [a learner]. like 2 hours after the end of
   each session is done it will send an automated email to them of the questions they got done."*

   ARRIVES OFF, like the weekly one (backend/digest.gs), and for its reason: the first real run is an
   evening with families on the other end, and every rule here fails by emailing. Three things, all
   the owner's and none in code, before one parent gets one:
     1. `session_recap` on the config tab — `off` until somebody types `preview` or `send`;
     2. `installSessionRecap` run once from the Apps Script editor, the only thing that books the
        hourly check (`check-recap.js` fails if anything else starts to);
     3. `preview` for a session or two, reading `recap_log`, before `send`.

   THE DECISIONS, IN ONE PLACE (the owner: "i dont choose what is best most simplest elegant"):

     WHAT ONE EMAIL IS   one child, one London day, one parent. It goes `session_recap_delay` hours
                         (2) after that child's LAST counted session of the day ends — two sessions in
                         a day are one email naming both; two siblings are two emails, as on Sunday.
     "THE QUESTIONS"     the child's `attempts` rows whose `first_done` or `last_done` is that day,
                         joined on the key before `#` (a practical's three boxes are one question).
                         The email says "that day", never "in the session": the sheet keeps DAYS, not
                         times, so homework done that morning is in it and nothing here can tell.
     RIGHT OR WRONG      not reported. `doneMark_` fires on the first keystroke, before Check is
                         pressed, so no verdict ever reaches the sheet; an email implying a score
                         would be inventing one.
     WHICH SESSIONS      `jobs` rows that are lessons (`kind` blank — `createJob` writes none — or
                         `session`), and only the children of BOOKED seats: paid through Stripe or
                         marked paid. Who is on a session is folded from `events`, never read off the
                         `status` cell.
     WHEN IT ENDS        nothing stores it. London day + `start_time` + `hours_per_session` — and when
                         the start is not known for THAT date, the latest a session can end (the
                         grid's last start, 18:00, plus its hours), with the time left out of the
                         email. See `recapEnd_` for why a multi-day booking's start is not trusted.
     SCHEDULE            one `everyHours(1)` trigger, booked by hand. Not one trigger per session:
                         one-off triggers are not removed when they fire and count toward the
                         project's twenty (core.gs, `warmAfterEdit`).
     NO BACKFILL         stateless. A day is acted on only while `due <= now < due + 24h`
                         (`RECAP_LATE_HOURS`), so switching it on reaches at most the last day's
                         sessions, and there is no watermark to lose.
     WHO IS TOLD         the weekly email's rule, through `digestPlan_` itself: accepted parents
                         only, never an unconfirmed address, never the learner, one email per mailbox.
                         Stopping is its own column, `people.session_email` — blank is on, and
                         `weekly_email` has nothing to do with it.
     NOTHING DONE        no email ("0 questions" is a bad email to get after paying for a lesson).
                         The log says `nothing done`, and names any questions marked that day on the
                         tutor's or the booker's own account instead — see the sign-in caveat below.
     RECEIPTS            `recap_log`. `sent` and `sending` are receipts; everything else is acted on
                         again by the next hourly check inside the 24 hours.
     NO ATTEMPTS TAB     an error, once something is due, and the trigger throws. Never a quiet day.
     THE ENGINE          `digestMail_` and `digestLocked_` in digest.gs — the same claim, send and
                         receipt as Sunday's, not a copy of it.

   THE CAVEAT THAT DECIDES WHETHER ANY OF THIS SAYS ANYTHING. A question is marked under whoever is
   SIGNED IN on the device (`markDone` is `self`; the token decides the person). A session worked
   through on the tutor's own phone, signed in as the tutor, puts every question on the tutor's row
   and none on the child's — and this email, correctly, finds nothing. The child has to be signed in
   on the device used in the session. `recapNothingWhy_` says so in the log when it sees it happen.

   LIMITS, STATED AND NOT BUILT:
     · No "working with [child]" mode on the tutor's device. The natural next build.
     · One date of a booking cannot be cancelled. Take it out of `session_dates`; otherwise a day with
       no lesson but with homework is still emailed.
     · "That day" includes homework done the same day, and two sessions' questions cannot be told
       apart.
     · A question done offline, or refused as "Busy", reaches the sheet on the next app load: inside
       24 hours of due it is still sent, after that it is in Sunday's email.
     · About 100 emails a day on a consumer account, with one reserve (`weekly_digest_reserve`)
       under both parent emails.

   FILE ORDER. Functions only, like every file but constants.gs — `RECAP_RUN`, `RECAP_LATE_HOURS`,
   `RECAP_PREVIEW_DAYS` and `RECAP_UNNAMED` live there. NOTHING HERE IS NAMED "digest", so the rules
   `check-digest.js` keeps about who may book the Sunday run are left exactly as they were.
================================================================================================== */


/* ---------- THE SWITCH AND THE DELAY ---------------------------------------------------------------
   The weekly email's three words, read off this email's own cell: anything that is not exactly
   `preview` or `send` is off. The delay is whole hours, 0 to 12, and a blank, a word or a 25 is 2 —
   the safe answer is the one the owner asked for. */
function recapMode_(cfg) {
  const m = norm(cfg && cfg.session_recap);
  return DIGEST_MODES.indexOf(m) !== -1 ? m : 'off';
}
function recapDelay_(cfg) {
  const c = S(cfg && cfg.session_recap_delay);
  return /^\d{1,2}$/.test(c) && Number(c) <= 12 ? Number(c) : 2;
}


/* ---------- LONDON'S CLOCK, READ ONCE, THEN NOTHING BUT CALENDAR ARITHMETIC ----------------------------
   `digestDay_`'s rule, to the minute. The one conversion from an instant is `Utilities.formatDate(…,
   'Europe/London', …)`, which knows when the clocks change; after that every time is a WALL-CLOCK
   STRING, `yyyy-MM-dd HH:mm`, moved with `Date.UTC` (no daylight saving) and compared as text. So
   "16:00 plus two hours plus two" is 20:00 on every day of the year — the evening the clocks go back
   included — and only something falling due between 01:00 and 02:00 on a clock-change night can be an
   hour out. Done with instants instead (`end = start + 2 * 36e5` on a Date), a run in summer computes
   in whatever zone the server is in, and `check-recap.js` asks a GMT November and a BST October. */
function recapClock_(now) {
  const d = now instanceof Date && !isNaN(now) ? now : new Date();
  return { today: Utilities.formatDate(d, DIGEST_TZ, 'yyyy-MM-dd'),
           at: Utilities.formatDate(d, DIGEST_TZ, 'yyyy-MM-dd HH:mm') };
}
function recapWall_(wall, minutes) {
  const w = S(wall);
  const t = Date.UTC(+w.slice(0, 4), +w.slice(5, 7) - 1, +w.slice(8, 10), +(w.slice(11, 13) || 0), +(w.slice(14, 16) || 0))
          + Math.round(Number(minutes) || 0) * 6e4;
  return new Date(t).toISOString().slice(0, 16).replace('T', ' ');
}
/* IN ITS WINDOW: due, and not yet a day late. Past the window nothing is written or sent — that is
   the whole of "no backfill". */
function recapDueNow_(due, at) {
  return !!due && due <= at && at < recapWall_(due, RECAP_LATE_HOURS * 60);
}


/* ---------- WHEN A SESSION ENDS, WHICH NOTHING STORES ----------------------------------------------------
   A BOOKING IS ONE ROW FOR A WHOLE RUN OF DATES: one `start_time`, one `hours_per_session`, the dates
   in a cell. The end is that day plus the start plus the hours, as `busyHours` reads it — when the
   start is known FOR THIS DATE.

   IT IS NOT, TWICE. A multi-day booking (`weekday` = `Monday, Friday`) stores only its first run's
   start — `bookSpec` on the phone names the session by the first run, and the per-hour `slots` are
   used to check the tutor's hours and never stored — so a Monday 10-12 and Friday 16-18 booking reads
   10:00 on the Friday, and an email due at 14:00 would go two hours before the lesson starts. And an
   Edit move rewrites `weekday` and `start_time` and leaves `session_dates` as they were (dopost.gs, the
   MAP under "Edit carries the new terms"), so a date can fall on a day the row no longer names. So
   the start is trusted only when the cell names no day at all, or this date falls on the FIRST day it
   names (compared on three letters, `Tue` and `Tuesday` alike). The build spec trusted any row naming
   one day; that is the second case, and it is why this is stricter.

   OTHERWISE THE LATEST IT CAN END: the grid's last start (`AVAIL_HOURS`, 18:00) plus the hours — 20:00
   for two. Never earlier than the real end, so never an email about a lesson still going; and
   `timeKnown` false takes the time out of the email, which would otherwise state one nobody knows. */
function recapEnd_(j, day, cfg) {
  const hours = Math.max(1, N(j && j.hours_per_session) || N(cfg && cfg.h) || 2);
  const start = S(fmtTime(j && j.start_time));
  const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dow = DOW[new Date(Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10))).getUTCDay()];
  const named = S(j && j.weekday).split(',').map(x => norm(x).slice(0, 3)).filter(Boolean);
  const shaped = /^\d{2}:\d{2}$/.test(start) && +start.slice(0, 2) <= 23 && +start.slice(3) <= 59;
  const known = shaped && (!named.length || named[0] === dow);
  const from = known ? (+start.slice(0, 2)) * 60 + (+start.slice(3)) : Math.max.apply(null, AVAIL_HOURS) * 60;
  const end = recapWall_(day + ' 00:00', from + Math.round(hours * 60));
  return { end: end, timeKnown: known, from: known ? start : '', to: known ? end.slice(11) : '' };
}


/* ---------- DATES AND TIMES AS A PARENT READS THEM, OFF THE STRINGS ---------------------------------------
   No `Date` in any zone: the ISO day is taken apart and the names looked up, so the email's "Tuesday
   6 October" is the day on the sheet whatever the server's clock thinks. */
function recapTime_(hhmm) {
  const m = S(hhmm).match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return '';
  const h = Number(m[1]) % 24;
  return (h % 12 === 0 ? 12 : h % 12) + (m[2] === '00' ? '' : ':' + m[2]) + (h < 12 ? 'am' : 'pm');
}
function recapLong_(iso) {
  const D = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
             'October', 'November', 'December'];
  const t = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)));
  return D[t.getUTCDay()] + ' ' + (+iso.slice(8, 10)) + ' ' + M[+iso.slice(5, 7) - 1];
}
function recapShort_(iso) {
  const D = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const t = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)));
  return D[t.getUTCDay()] + ' ' + (+iso.slice(8, 10)) + ' ' + M[+iso.slice(5, 7) - 1];
}


/* ---------- WHICH ROWS ARE LESSONS, AND ON WHICH DAYS ---------------------------------------------------
   BLANK OR `session` — SCHEMA.jobs says both are the ordinary booking, and `createJob` writes no kind
   at all. A waiting list has no dates and a festive event no start time, so neither has an end.

   THE DAYS IN A WINDOW, as London `yyyy-MM-dd`. The cell is `dd/mm/yy, dd/mm/yy` from the phone, or
   whatever was typed — or, for a single date, a Date the sheet made of it, whose `String()` is not a
   list of anything. `sheetDate` reads `dd/mm` the British way round, which `new Date` does not. */
function recapLesson_(j) {
  const k = norm(j && j.kind);
  return k === '' || k === 'session';
}
function recapDays_(j, from, to) {
  const cells = (j && j.session_dates instanceof Date) ? [j.session_dates] : sessionDatesOf(j || {});
  const seen = {}, out = [];
  cells.forEach(c => {
    const d = isoDate_(sheetDate(c));
    if (d && d >= from && d <= to && !seen[d]) { seen[d] = 1; out.push(d); }
  });
  return out.sort();
}
/* THE REAL HELPERS — what `recapSessions_` asks when nobody hands it fakes. */
function recapAsk_() {
  return { seats: clientsIn, status: jobStatusOf, tutor: confirmedTutorOf_, person: findPerson, children: childrenOf };
}


/* ---------- THE SESSIONS, AND WHO EACH ONE IS ABOUT ---------------------------------------------------------
   PURE, given `ask` — the roster, the job's state, its tutor, a person by name and a person's accepted
   children. The run and the Preview pass nothing and get the real ones; the check can pass fakes.

   STATE IS THE ROSTER'S, NEVER THE `status` CELL'S (nothing keeps that cell true but the nightly
   `closeFinishedJobs`). A Booked seat counts. No Booked seat but a tutor agreed is a lesson that
   happened and was not paid for yet — a row in the log saying "mark it paid", which the next hourly
   check then acts on. No tutor agreed is a request nobody answered, and a twelve-week one would write
   a row every week, so it is the Preview's alone. Cancelled is nothing.

   THE CHILDREN ARE RESOLVED SEAT BY SEAT, AND NEVER BY SEARCHING THE PEOPLE TAB FOR A NAME. `for_children`
   is display names, often blank, sometimes "Someone else". A name is matched only against the
   accepted children of a Booked seat's own person — the full name, or a first name that is unique
   among that family's children — so another family's child who happens to share it is never picked.
   A student who booked their own seat is their own learner. A family with exactly one child and a
   booking that names nobody is that child. Anything else is said, not guessed: which of two children,
   nobody linked, a name that is nobody's child here.

   WHY A WRONG MATCH CANNOT LEAK: whoever is picked, the email is that learner's OWN attempts, sent to
   that learner's OWN accepted parents. The session decides only whose day it is and when.

   Returns `{ sessions, problems }`:
     sessions   one per lesson per day in [from, to] with a Booked seat — when it ends, who it is about
                (`learners`, with how each was found), and `others` (the tutor and the bookers, for
                `recapNothingWhy_`'s hint, never for the email)
     problems   a job and a day nobody could be placed on, with `why`; `quiet` ones are the Preview's
                only and are never written */
function recapSessions_(jobRows, from, to, ask, cfg) {
  const A = ask || recapAsk_();
  const sessions = [], problems = [];
  (jobRows || []).forEach(j => {
    const id = S(j && j.job_id) || String(j && j._row || '');
    if (!id) return;
    const days = recapDays_(j, from, to);
    if (!days.length) return;
    const at = days.map(day => Object.assign({ day: day }, recapEnd_(j, day, cfg)));
    const base = s => ({ day: s.day, job_id: id, subject: S(j.subject), from: s.from, to: s.to,
                         timeKnown: s.timeKnown, end: s.end });
    const say = (why, quiet) => at.forEach(s => problems.push(Object.assign(base(s), { why: why, quiet: !!quiet })));

    if (!recapLesson_(j)) {
      const k = norm(j.kind);
      if (k !== 'waitlist' && k !== 'festive') say('kind ‘' + S(j.kind) + '’ is not a lesson', true);
      return;
    }

    const seats = A.seats(id) || [];
    const booked = seats.filter(c => c && c.status === BM.BOOKED);
    if (!booked.length) {
      /* NO SEAT AT ALL is a row typed into the sheet, or a request everybody left before paying —
         `jobStatusOf` calls both cancelled, and the Preview says which it can tell. */
      if (!seats.length) { say('nobody has a seat on it — cancelled, or never booked on the site', true); return; }
      if (A.status(id) === 'cancelled') { say('cancelled', true); return; }
      if (S(A.tutor(id))) { say('agreed with the tutor but nobody’s seat is Booked — mark it paid and the next hourly check sends it'); return; }
      say('not agreed — not counted', true);
      return;
    }

    let unnamedSeat = false;
    const names = S(j.for_children).split(/[,\n]/).map(x => x.trim()).filter(Boolean).filter(n => {
      if (norm(n) === RECAP_UNNAMED) { unnamedSeat = true; return false; }
      return true;
    });
    /* A FAMILY'S CHILDREN AGAINST THE NAMES ON THE BOOKING: the whole name, or a first name nobody
       else in that family has. */
    const matchKids = (kids, n) => {
      const kn = key(n);
      if (!kn) return null;
      const whole = kids.find(k => key(personDisplayName(k)) === kn);
      if (whole) return whole;
      const firsts = kids.filter(k => key(k.first_name) === kn);
      return firsts.length === 1 ? firsts[0] : null;
    };
    const learners = [], seen = {}, matched = {}, others = [], seenOther = {};
    const add = (row, how) => {
      const pid = S(row && row.person_id);
      if (pid && !seen[pid]) { seen[pid] = 1; learners.push({ id: pid, how: how }); }
    };
    const other = (row, as) => {
      const pid = S(row && row.person_id);
      if (pid && !seenOther[pid]) { seenOther[pid] = 1; others.push({ id: pid, name: personDisplayName(row), as: as }); }
    };
    try { const tn = S(A.tutor(id)); if (tn) other(A.person(tn), 'the tutor'); } catch (err) {}

    booked.forEach(c => {
      const P = A.person(c.name);
      if (!P || !S(P.person_id)) { say('booked by ‘' + S(c.name) + '’, who is not on the people tab'); return; }
      other(P, 'who booked');
      const pid = S(P.person_id);
      const kids = (A.children(pid) || []).filter(k => k && S(k.person_id) && S(k.person_id) !== pid);
      let mine = 0;
      names.forEach(n => {
        const kid = matchKids(kids, n);
        if (kid) { add(kid, 'named on the booking'); matched[key(n)] = 1; mine++; }
      });
      const selfNamed = names.some(n => key(n) === key(personDisplayName(P)));
      if (hasRole(P, 'student') && (!names.length || selfNamed)) {
        add(P, 'booked their own seat');
        if (selfNamed) matched[key(personDisplayName(P))] = 1;
        mine++;
      }
      if (!mine && !names.length && !unnamedSeat && kids.length === 1) {
        add(kids[0], 'the only child on the account');
        mine++;
      }
      if (mine) return;
      if (!names.length && !unnamedSeat) {
        say(kids.length >= 2 ? 'the booking does not say which of ' + personDisplayName(P) + '’s children'
                             : personDisplayName(P) + ' has no child linked on the site');
      } else if (!names.length) {
        say('for someone not on the site', true);
      } else {
        say(personDisplayName(P) + '’s seat: none of their children is named on the booking', true);
      }
    });

    /* A NAME NO BOOKED SEAT ANSWERED TO. If an unpaid or withdrawn seat's child has it, that family's
       seat is the reason and the Preview says so; otherwise it is a name nobody here can place, and
       the log names it. */
    names.filter(n => !matched[key(n)]).forEach(n => {
      const unpaid = seats.filter(c => c && c.status !== BM.BOOKED).find(c => {
        try {
          const P = A.person(c.name);
          return P && S(P.person_id) && !!matchKids(A.children(S(P.person_id)) || [], n);
        } catch (err) { return false; }
      });
      if (unpaid) say('‘' + n + '’ — ' + S(unpaid.name) + '’s seat is ' + (S(unpaid.status) || 'not') + ', not Booked', true);
      else say('‘' + n + '’ is not a child linked to anyone with a paid seat');
    });

    at.forEach(s => sessions.push(Object.assign(base(s), { learners: learners.slice(), others: others.slice() })));
  });
  return { sessions: sessions, problems: problems };
}


/* ---------- ONE EMAIL PER CHILD PER DAY, DUE AFTER THEIR LAST SESSION -------------------------------------
   PURE. Grouped on (day, learner): two sessions the same day are one email, due `delay` hours after
   the later one ends — never after the first, which would be an email about the morning with the
   afternoon still to come. */
function recapGroups_(sessions, delayH) {
  const by = {};
  (sessions || []).forEach(s => (s.learners || []).forEach(l => {
    const k = s.day + '\u0001' + l.id;
    const g = by[k] || (by[k] = { day: s.day, learner_id: l.id, end: '', sessions: [], ids: [], others: [], how: l.how });
    if (s.end > g.end) g.end = s.end;
    if (g.ids.indexOf(s.job_id) === -1) {
      g.ids.push(s.job_id);
      g.sessions.push({ job_id: s.job_id, subject: s.subject, from: s.from, to: s.to, timeKnown: s.timeKnown, end: s.end });
    }
    (s.others || []).forEach(o => { if (!g.others.some(x => x.id === o.id)) g.others.push(o); });
  }));
  return Object.keys(by).map(k => {
    const g = by[k];
    g.sessions.sort((a, b) => (a.end < b.end ? -1 : a.end > b.end ? 1 : 0));
    return { day: g.day, learner_id: g.learner_id, how: g.how, due: recapWall_(g.end, Math.round((Number(delayH) || 0) * 60)),
             sessions: g.sessions, job_ids: g.ids.slice().sort().join(','), others: g.others };
  }).sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.learner_id < b.learner_id ? -1 : 1));
}
/* THE JOB-LEVEL REASONS, ONE ROW PER JOB PER DAY — two names nobody can place on one booking are one
   row saying both, not two rows overwriting each other under the same key. */
function recapJobNotes_(problems, delayH) {
  const by = {};
  (problems || []).filter(p => !p.quiet).forEach(p => {
    const k = p.day + '\u0001' + p.job_id;
    const n = by[k] || (by[k] = { day: p.day, job_id: p.job_id, subject: p.subject, end: p.end, whys: [] });
    if (n.whys.indexOf(p.why) === -1) n.whys.push(p.why);
  });
  return Object.keys(by).map(k => Object.assign(by[k], {
    due: recapWall_(by[k].end, Math.round((Number(delayH) || 0) * 60)), why: by[k].whys.join('; ') }));
}


/* ---------- THE PLAN: THE WEEKLY EMAIL'S, ONE DAY LONG --------------------------------------------------
   PURE. For each day, `digestPlan_` with a "week" that starts and ends on it — the same join of a
   practical's boxes, the same text that may and may not be printed, the same parents and the same
   reasons for not telling one — handed this email's render and this email's opt-out column. Only the
   due learners' rows go in, so a child who did homework and had no session is in nobody's email.

   Returns `{ emails, unreachable, optedOut, nothing }`, each carrying its day, due and job ids. */
function recapPlan_(groups, attemptRows, peopleRows, parentsOf, look) {
  const out = { emails: [], unreachable: [], optedOut: [], nothing: [] };
  const days = [];
  (groups || []).forEach(g => { if (days.indexOf(g.day) === -1) days.push(g.day); });
  days.forEach(day => {
    const of = {};
    groups.filter(g => g.day === day).forEach(g => { of[g.learner_id] = g; });
    const sessions = {};
    Object.keys(of).forEach(id => { sessions[id] = of[id].sessions; });
    const rows = (attemptRows || []).filter(r => of[S(r && r.person_id)]);
    const plan = digestPlan_({ start: day, end: day }, rows, peopleRows, parentsOf,
      Object.assign({}, look || {}, { sessions: sessions }), { render: recapRender_, optOut: 'session_email' });
    const tag = g => ({ day: day, due: g.due, job_ids: g.job_ids });
    plan.emails.forEach(m => out.emails.push(Object.assign(m, tag(of[m.learner_id]))));
    const did = {};
    plan.learners.forEach(L => {
      did[L.id] = 1;
      const g = of[L.id];
      if (L.why) out.unreachable.push(Object.assign({ learner_id: L.id, name: L.name, count: L.count, why: L.why }, tag(g)));
      L.skipped.filter(p => p.why === 'asked not to get it').forEach(p => out.optedOut.push(Object.assign({
        learner_id: L.id, learner: L.name, parent_id: p.id, name: p.name, count: L.count }, tag(g))));
    });
    Object.keys(of).filter(id => !did[id]).forEach(id => {
      const g = of[id];
      out.nothing.push(Object.assign({ learner_id: id, why: recapNothingWhy_(g, attemptRows, peopleRows) }, tag(g)));
    });
  });
  return out;
}

/* ---------- "NOTHING DONE", AND WHERE THE QUESTIONS PROBABLY WENT ------------------------------------------
   THE MOST LIKELY REASON FOR AN EMPTY DAY IS NOT AN IDLE CHILD. It is the tutor working through
   questions on their own phone, signed in as themselves, so every question went on the tutor's row.
   So the note says what the email reports, and — when the tutor or a booker has rows on that day —
   how many and on whose account. That is the owner's cue to sign the child in next time. Names are
   fine here: this text goes to the log and the admin's Preview, NEVER into an email. */
function recapNothingWhy_(group, attemptRows, peopleRows) {
  let me = null;
  (peopleRows || []).some(p => { if (S(p && p.person_id) === S(group.learner_id)) { me = p; return true; } return false; });
  const name = me ? (personDisplayName(me) || S(group.learner_id)) : S(group.learner_id);
  const on = r => isoDate_(r.first_done) === group.day || isoDate_(r.last_done) === group.day;
  const hints = (group.others || []).filter(o => S(o.id) !== S(group.learner_id)).map(o => {
    const keys = {};
    (attemptRows || []).forEach(r => {
      if (S(r && r.person_id) === S(o.id) && on(r)) keys[S(r.question_key).split('#')[0]] = 1;
    });
    const n = Object.keys(keys).length;
    return n ? n + (n === 1 ? ' was' : ' were') + ' marked that day on ' + o.name + '’s account (' + o.as + ')' : '';
  }).filter(Boolean);
  return 'no question on the attempts tab for ' + name + ' on ' + recapShort_(group.day)
    + ' — this email reports only questions marked while signed in as ' + name
    + (hints.length ? '; ' + hints.join('; ') : '');
}


/* ---------- ONE EMAIL: WHAT THE PARENT OPENS ---------------------------------------------------------------
   PURE, and `digestRender_`'s shape: `(L, P, week, look)`, with `week.start` the day and
   `look.sessions[L.id]` that child's sessions on it. Short and plain, read on a phone between other
   things: which lesson and when, how many, the list grouped by paper, the site, how to stop.

   NO TUTOR, NO PRICE, NO VENUE, NO OTHER CHILD. The subject and the hours are all it says of the
   session, and the subject is a cell somebody typed, so it is printed only if `digestSafe_` passes it
   and it is 30 characters or fewer — otherwise "a session".

   THE LIST IS GROUPED BY WHAT COMES BEFORE THE LAST ` · `. A label is `Maths · Paper 1 (Calculator) —
   June 2024 · Q3`, so a session's twelve questions off two papers are two headings and two lines of
   question numbers, not twelve repetitions of the paper's name. Numbers sort as numbers (Q2 before
   Q10). A question first done on an earlier day says "(again)".

   A RAW KEY NEVER GOES IN THIS EMAIL. The weekly one prints a key in the library's shape when there is
   no name; a list of `q:Q-9MA031-2206-1` under "after Ada's lesson" reads as a fault, so a question with
   no printable name — no label, an unsafe one, or one that is only its own key — is counted and not
   listed, in "…and N more". If nothing at all is printable there is no list, and the last line says
   the child can see WHICH ones. */
function recapRender_(L, P, week, look) {
  const brand = S(look && look.brand) || BRAND_NAME;
  const site = S(look && look.site) || SITE_URL;
  const day = week.start;
  const kid = S(L.first) || 'Your child', kids = S(L.first) ? kid : 'your child';
  const qs = x => x + ' question' + (x === 1 ? '' : 's');
  const fresh = L.fresh || [], again = L.again || [];
  const n = fresh.length + again.length;
  const hello = S(P && P.first) ? 'Hello ' + S(P.first) + ',' : 'Hello,';

  const sessions = ((look && look.sessions) || {})[L.id] || [];
  const subject = s => { const t = attemptLabel_(s && s.subject); return digestSafe_(t) && t.length <= 30 ? t : 'a session'; };
  const span = s => (s && s.timeKnown && s.from && s.to ? recapTime_(s.from) + ' to ' + recapTime_(s.to) : '');
  const one = s => subject(s) + (span(s) ? ', ' + span(s) : '');
  const WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];
  let had;
  if (sessions.length <= 1) {
    const s = sessions[0];
    had = kid + ' had ' + (s ? subject(s) : 'a session') + ' on ' + recapLong_(day) + (span(s) ? ', ' + span(s) : '') + '.';
  } else {
    const parts = sessions.map(one);
    had = kid + ' had ' + (WORD[sessions.length] || sessions.length) + ' sessions on ' + recapLong_(day) + ': '
      + parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1] + '.';
  }
  let count = 'That day ' + kids + ' worked on ' + qs(n);
  if (fresh.length && again.length) count += ', ' + fresh.length + ' of them for the first time.';
  else if (again.length) count += n === 1 ? ', one ' + kids + ' had tried before.' : ', all of them ones ' + kids + ' had tried before.';
  else count += '.';
  const lead = had + ' ' + count;

  /* HEADINGS, EACH WITH ITS QUESTION NUMBERS. '' is a label of one segment: a heading with no line. */
  const heads = {};
  fresh.map(q => [q, false]).concat(again.map(q => [q, true])).forEach(([q, before]) => {
    const label = S(q && q.label);
    if (!label || (q && q.hidden) || label === S(q && q.key)) return;
    const bits = label.split(' · ');
    const head = bits.length > 1 ? bits.slice(0, -1).join(' · ') : label;
    const item = bits.length > 1 ? bits[bits.length - 1] + (before ? ' (again)' : '') : '';
    (heads[head] || (heads[head] = [])).push(item);
  });
  let room = DIGEST_LIST_MAX, printed = 0;
  const shown = [];
  Object.keys(heads).sort((a, b) => a.localeCompare(b)).forEach(h => {
    if (room <= 0) return;
    const list = heads[h].slice().sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const take = list.slice(0, room);
    room -= take.length; printed += take.length;
    shown.push({ head: h, items: take.filter(Boolean) });
  });
  const more = n - printed;

  const sees = kid + (printed ? ' can see them on ' : ' can see which ones on ');
  const link = sees + 'the site: ' + site;
  const foot = 'You get this because you are ' + (S(L.first) ? kid + '’s parent' : 'a parent') + ' on ' + brand
    + (/[.!?]$/.test(brand) ? '' : '.') + ' To stop the emails after sessions, reply to this one and say so.';
  const subjectLine = kid + '’s ' + (sessions.length > 1 ? 'sessions' : 'session') + ' on ' + recapShort_(day) + ': ' + qs(n);

  const lines = [hello, '', lead, ''];
  shown.forEach(h => { lines.push(h.head); if (h.items.length) lines.push(h.items.join(', ')); lines.push(''); });
  if (printed && more > 0) lines.push('…and ' + more + ' more.', '');
  lines.push(link, '', foot);
  const html = '<p>' + digestEsc_(hello) + '</p><p>' + digestEsc_(lead) + '</p>'
    + shown.map(h => '<p><b>' + digestEsc_(h.head) + '</b>' + (h.items.length ? '<br>' + digestEsc_(h.items.join(', ')) : '') + '</p>').join('')
    + (printed && more > 0 ? '<p>…and ' + more + ' more.</p>' : '')
    + '<p><a href="' + digestEsc_(site) + '">' + digestEsc_(sees + brand) + '</a></p>'
    + '<p><small>' + digestEsc_(foot) + '</small></p>';
  return { subject: subjectLine, text: lines.join('\n'), html: html };
}


/* ---------- THE HOURLY RUN -------------------------------------------------------------------------------------
   `sessionRecapRun` IS WHAT THE TRIGGER CALLS, and the only thing `installSessionRecap` books.

   CHEAP WHEN THERE IS NOTHING TO DO, because it runs 24 times a day. Off returns before anything but
   the config tab is read. Then `jobs` alone: no lesson dated in the last three days, or none whose
   email is due this hour, and it returns without opening `events`, `people`, `family` or `attempts`.

   THE TABS IT NEEDS ARE CHECKED ONLY ONCE SOMETHING IS DUE — a Ledger without `recap_log` or `attempts`
   is not a failure in an hour with no session, and it is never mistaken for a quiet day in an hour
   with one. Either missing is an `error`, and the trigger throws.

   A RUN THAT DID NOT FINISH THROWS, for `weeklyDigestRun`'s reason: Apps Script throws a trigger's
   return value away and emails the owner only on an exception. Unlike Sunday's, an email held for the
   quota is not lost by the next run — the next hourly check sends it, inside the 24 hours. */
function sessionRecapRun(e) {
  const out = recapRun_(new Date());
  if (out && (out.error || out.held || out.failed || out.busy)) {
    throw new Error('The email after sessions did not finish: '
      + (out.error ? out.error : 'sent ' + out.sent + ', held ' + out.held + ' (mail quota), failed ' + out.failed
         + ', busy ' + out.busy + ' (lock) — see the recap_log tab. The next hourly check sends what is not '
         + 'sent, while it is within ' + RECAP_LATE_HOURS + ' hours of due.'));
  }
  return out;
}

/* WHY IT NEVER SENDS TWICE: the receipt's key is (day, learner, parent) — no `due` in it, so a changed
   delay or a session moved an hour finds the same row — and `sending` is on the sheet, flushed, before
   the send; `digestMail_` is the order, and the lock is held only to claim, so `markDone`'s five-second
   wait is never starved by a mailing.

   WHY IT IS NEVER SILENT: every due learner ends the hour as an email row or a note row with the reason
   in words, and every booked job nobody could be placed on as a row of its own. A note row is written
   only when what it says has changed, so 24 hourly checks are not 24 writes. */
function recapRun_(now) {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const mode = recapMode_(cfg);
  if (mode === 'off') return { mode: 'off', did: 'nothing — session_recap on the config tab is off' };

  const clock = recapClock_(now);
  const delay = recapDelay_(cfg);
  const from = digestShift_(clock.today, -2);
  const jobs = read(TAB.jobs).rows.filter(j => recapLesson_(j) && recapDays_(j, from, clock.today).length);
  if (!jobs.length) return { mode: mode, at: clock.at, due: 0 };

  const found = recapSessions_(jobs, from, clock.today, null, cfg);
  const inWindow = due => recapDueNow_(due, clock.at);
  const groups = recapGroups_(found.sessions, delay).filter(g => inWindow(g.due));
  const jobNotes = recapJobNotes_(found.problems, delay).filter(p => inWindow(p.due));
  if (!groups.length && !jobNotes.length) return { mode: mode, at: clock.at, due: 0 };

  if (!recapLog_().sheet) return { mode: mode, error: 'The sheet has no recap_log tab. Open /exec?setup=1 to add it. Nothing was sent.' };
  const noAttempts = digestNoAttempts_();
  if (noAttempts) return { mode: mode, error: noAttempts };

  /* THE PLAN IS MADE WITHOUT THE LOCK, and checked against the log, fresh, under it, one email at a time. */
  const look = digestLook_();
  const plan = recapPlan_(groups, read(TAB.attempts).rows, read(TAB.people).rows, acceptedParents, look);
  const out = Object.assign({ mode: mode, at: clock.at, due: groups.length, emails: plan.emails.length },
    digestMail_(plan.emails, {
      mode: mode, reserve: digestReserve_(cfg), readLog: recapLog_, brand: look.brand,
      find: (log, m) => recapLogFind_(log, m.day, m.learner_id, m.parent_id),
      put: (log, row, m, v) => recapLogPut_(log, row, m, Object.assign({ due: m.due, job_ids: m.job_ids }, v)),
      heldNote: 'daily mail quota — the next hourly check sends it while it is within 24 hours of due',
    }),
    { unreachable: plan.unreachable.length, optedOut: plan.optedOut.length, nothing: plan.nothing.length,
      problems: jobNotes.length, noted: 0 });

  const noted = digestLocked_(recapLog_, log => {
    const note = (k, values) => {
      const row = recapLogFind_(log, k.day, k.learner_id, k.parent_id, k.job_ids);
      const was = norm(row && row.status);
      if (was === 'sent' || was === 'sending') return;
      if (row && was === norm(values.status) && S(row.note) === S(values.note) && S(row.questions) === S(values.questions)) return;
      recapLogPut_(log, row, k, Object.assign({ to: '', subject: '', at: new Date(), due: k.due, job_ids: k.job_ids }, values));
      out.noted++;
    };
    plan.unreachable.forEach(u => note({ day: u.day, learner_id: u.learner_id, parent_id: '', due: u.due, job_ids: u.job_ids },
      { questions: u.count, status: 'not sent', note: u.why }));
    plan.optedOut.forEach(p => note({ day: p.day, learner_id: p.learner_id, parent_id: p.parent_id, due: p.due, job_ids: p.job_ids },
      { questions: p.count, status: 'opted out', note: 'session_email on their row says no' }));
    plan.nothing.forEach(nd => note({ day: nd.day, learner_id: nd.learner_id, parent_id: '', due: nd.due, job_ids: nd.job_ids },
      { questions: 0, status: 'nothing done', note: nd.why }));
    jobNotes.forEach(p => note({ day: p.day, learner_id: '', parent_id: '', due: p.due, job_ids: p.job_id },
      { questions: '', status: 'not sent', note: (S(p.subject) ? S(p.subject) + ': ' : '') + p.why }));
    return true;
  });
  if (!noted) out.busy++;
  return out;
}


/* ---------- THE LOG ---------------------------------------------------------------------------------------------
   READ FRESH — the tab's cached copy dropped, not every tab's (`digestLog_`'s rule). FOUND BY WHAT A
   ROW IS: the day, the learner, the parent — and, for a job-level row with no learner, the job. `day`,
   `due` and `job_ids` are written as text, see SCHEMA.recap_log; a row being updated is not given a
   `due` or `job_ids` that only differs by the apostrophe the sheet never stores. */
function recapLog_() {
  try { delete _cache[TAB.recap_log]; } catch (err) {}
  return read(TAB.recap_log);
}
function recapLogFind_(log, day, learnerId, parentId, jobIds) {
  return (log.rows || []).find(r => isoDate_(r.day) === day && S(r.learner_id) === S(learnerId)
    && S(r.parent_id) === S(parentId) && (S(learnerId) !== '' || S(r.job_ids) === S(jobIds))) || null;
}
function recapLogPut_(log, row, k, values) {
  const v = Object.assign({}, values);
  ['due', 'job_ids'].forEach(c => {
    if (!(c in v)) return;
    const t = S(v[c]);
    if (row && S(row[c]) === t) delete v[c];
    else v[c] = t ? "'" + t : '';
  });
  if (row) { setCells(log, row, v); return row; }
  return addRow(log, Object.assign({ day: "'" + S(k.day), learner_id: S(k.learner_id), parent_id: S(k.parent_id) }, v));
}


/* ---------- BOOKING THE HOURLY CHECK, BY HAND ----------------------------------------------------------------
   RUN FROM THE APPS SCRIPT EDITOR'S FUNCTION LIST, ONCE, AND BY NOBODY ELSE — not `installTriggers`, not
   `?run=`, not `doGet`, not the phone. A trigger booked as a side effect is an email nobody decided to
   start; `check-recap.js` reads every file for a call to it.

   THE OLD ONE GOES FIRST, so running it twice leaves one, and only this handler's are touched.
   EVERY HOUR, not one per session: twenty-four short runs a day is well inside the daily trigger
   budget, and when it is off each one is a config read.

   INSTALLED IS NOT ON. `session_recap` decides what the hour does; this only decides that it happens.
   No new authorisation: `script.scriptapp` and `script.send_mail` are already in the manifest. */
function installSessionRecap() {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const removed = removeSessionRecap().removed;
  ScriptApp.newTrigger(RECAP_RUN).timeBased().everyHours(1).create();
  const mode = recapMode_(cfg);
  return { installed: 'every hour', replaced: removed, mode: mode,
           means: mode === 'off' ? 'it runs and does nothing until session_recap on the config tab is preview or send'
                : mode === 'preview' ? 'it writes what it would send to the recap_log tab and sends nothing'
                : 'it EMAILS PARENTS after sessions' };
}
/* THE WAY BACK: every trigger of this handler, gone. Safe with none. */
function removeSessionRecap() {
  let n = 0;
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === RECAP_RUN) { ScriptApp.deleteTrigger(t); n++; }
  });
  return { removed: n };
}
/* How many are booked, for the admin's card. Null when it cannot be asked. */
function recapScheduled_() {
  try { return ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === RECAP_RUN).length; }
  catch (err) { return null; }
}


/* ---------- WHAT THE ADMIN'S PREVIEW IS SENT — `recapPreview` in dopost.gs ---------------------------------------
   THE LAST SEVEN DAYS, WHATEVER THE WINDOW SAYS, and nothing written, sent or booked even with `send`
   on. Every booked session under its day with when its email falls due and whether that is still to
   come, in its hour, or past; every email rendered as it would read NOW, with the log's word for it;
   and everybody nobody can tell, with why — including the sessions the run never writes about (not
   agreed, cancelled, for somebody not on the site), because "why did nothing go" is the question this
   card exists to answer. And the two tabs it needs, by name, if either is missing. */
function recapPreviewOut_(now) {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const clock = recapClock_(now), delay = recapDelay_(cfg);
  const from = digestShift_(clock.today, -(RECAP_PREVIEW_DAYS - 1));
  const noAttempts = digestNoAttempts_();
  const log = recapLog_();
  const warning = noAttempts || (log.sheet ? ''
    : 'The Ledger has no recap_log tab. Open /exec?setup=1 (ensureSchema) to add it — until then the hourly check stops before it sends anything.');
  const people = read(TAB.people).rows;
  const found = recapSessions_(read(TAB.jobs).rows, from, clock.today, null, cfg);
  const groups = recapGroups_(found.sessions, delay);
  const plan = recapPlan_(groups, read(TAB.attempts).rows, people, acceptedParents, digestLook_());

  const byId = {};
  people.forEach(p => { const id = S(p && p.person_id); if (id && !byId[id]) byId[id] = p; });
  const nameOf = id => (byId[id] ? personDisplayName(byId[id]) : '') || S(id);
  const stateOf = due => (due > clock.at ? 'upcoming' : recapDueNow_(due, clock.at) ? 'due' : 'past');
  const said = (day, due) => recapTime_(S(due).slice(11)) + (S(due).slice(0, 10) !== day ? ' on ' + recapShort_(S(due).slice(0, 10)) : '');
  const span = s => (s.timeKnown && s.from && s.to ? recapTime_(s.from) + '–' + recapTime_(s.to) : '');
  const logged = (day, learner, parent, jobs) => {
    const r = log.sheet ? recapLogFind_(log, day, learner, parent, jobs) : null;
    if (!r) return { status: '—', at: '' };
    const a = r.at instanceof Date && !isNaN(r.at) ? Utilities.formatDate(r.at, DIGEST_TZ, 'yyyy-MM-dd HH:mm') : S(r.at);
    return { status: S(r.status) || '—', at: a };
  };

  const days = [];
  for (let i = 0; i < RECAP_PREVIEW_DAYS; i++) {
    const day = digestShift_(clock.today, -i);
    const sessions = found.sessions.filter(s => s.day === day).map(s => {
      const dues = groups.filter(g => g.day === day && s.learners.some(l => l.id === g.learner_id)).map(g => g.due).sort();
      const due = dues.length ? dues[dues.length - 1] : recapWall_(s.end, delay * 60);
      return { subject: s.subject, from: s.from, to: s.to, timeKnown: s.timeKnown, time: span(s),
               learners: s.learners.map(l => nameOf(l.id)), due: due, dueSaid: said(day, due), state: stateOf(due) };
    }).concat(found.problems.filter(p => p.day === day && p.quiet).map(p => ({
      subject: p.subject, from: p.from, to: p.to, timeKnown: p.timeKnown, time: span(p), learners: [],
      due: '', dueSaid: '', state: p.why })));
    const emails = plan.emails.filter(m => m.day === day).map(m => Object.assign({
      learner: m.learner, parent: m.parent, to: m.to, subject: m.subject, text: m.text, count: m.count,
      due: m.due, dueSaid: said(day, m.due) }, logged(day, m.learner_id, m.parent_id)));
    const nobody = []
      .concat(plan.unreachable.filter(u => u.day === day).map(u => Object.assign({ name: u.name || nameOf(u.learner_id), why: u.why },
        { status: logged(day, u.learner_id, '').status })))
      .concat(plan.optedOut.filter(p => p.day === day).map(p => ({ name: (p.name || p.parent_id) + ' (about ' + (p.learner || nameOf(p.learner_id)) + ')',
        why: 'session_email on their row says no', status: logged(day, p.learner_id, p.parent_id).status })))
      .concat(plan.nothing.filter(nd => nd.day === day).map(nd => ({ name: nameOf(nd.learner_id), why: nd.why,
        status: logged(day, nd.learner_id, '').status })))
      .concat(recapJobNotes_(found.problems.filter(p => p.day === day), delay).map(p => ({
        name: (S(p.subject) || 'A session') + ' (' + p.job_id + ')', why: p.why, status: logged(day, '', '', p.job_id).status })));
    days.push({ day: day, label: recapShort_(day), sessions: sessions, emails: emails, nobody: nobody });
  }
  return { success: true, mode: recapMode_(cfg), delay: delay, scheduled: recapScheduled_(),
           attempts: !noAttempts, logTab: !!log.sheet, warning: warning, from: from, to: clock.today, at: clock.at,
           days: days };
}
