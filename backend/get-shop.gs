/* @family. — doGet's payload: terms, questions and jobs. Called from doGet in doget.gs (1140). */

/* The terms still to come, from the computed year. */
function getTerms_(payload) {
  /* WHATEVER CAMPAIGN IS RUNNING TODAY. § */
  // --- terms -> intervals -------------------------------------------------------------------
  /* ---------- FROM THE COMPUTED YEAR, NOT STRAIGHT OFF THE TAB § */
  const yNow = (new Date()).getMonth() >= 7
    ? (new Date()).getFullYear() : (new Date()).getFullYear() - 1;
  /* ---------- ONE OF EACH NAME, AND ONLY WHAT IS STILL TO COME § */
  const nowMs = Date.now();
  const yearOut = nowMs + 370 * 864e5;
  const onceOnly = {};
  const computed = termsFor(yNow).concat(termsFor(yNow + 1))
    .filter(c => c.end.getTime() >= nowMs && c.start.getTime() <= yearOut)
    .filter(c => {
      const k = norm(c.name);
      if (!k || onceOnly[k]) return false;
      onceOnly[k] = 1;
      return true;
    });
  computed.forEach(c => {
    /* SHAPED LIKE A SHEET ROW, so everything below reads the same fields either way. */
    const r = { term_name: c.name, start_date: c.start, end_date: c.end,
                kind: c.kind, _row: 0 };
    // A term is bookable if it has a name and an end date. Where it sits is worked out (`relativeName`);
    // a typed label once filtered here and hid every term nobody had labelled.
    if (!S(r.term_name) || !(S(r.end_date) || S(r.last_sunday))) return;
    // An interval whose dates leave no room for a session isn't bookable — usually because its
    // start is after its end. Offering it and pricing one session hid that error completely.
    // No whole teaching week inside it means it can't be booked.
    const win = operatingWindow(r.start_date, r.end_date);
    if (!win) return;
    payload.intervals.push({
      /* WHERE IT SITS, worked out from the dates rather than typed. § */
      rel: relativeName(r.start_date, r.end_date, read(TAB.terms).rows),
      term: S(r.term_name),
      kind: intervalKind(r.kind, r.term_name),
      /* The OPERATING window, not the interval's own dates: § */
      weeks: win.weeks || 0,
      // Says its dates are the wrong way round, so an admin sees WHY two terms look alike.
      dateFault: !!win.dateFault,
      opensOn: fmtDate(win.first),
      closesOn: fmtDate(win.last),
      /* ONLY a display_name somebody wrote. § */
      label: S(r.display_name),
      /* The dates a client books between are the operating ones. The interval's own start and
         end stay in the sheet as the school's dates; nothing prices from them. */
      startDate: fmtDate(win.first) || fmtDate(r.start_date),
      endDate: fmtDate(win.last) || fmtDate(r.end_date),
      lastSun: fmtDate(r.last_sunday)
    });
  });
}

function getQuestions_(payload) {
  /* questions -------------------------------------------------------------------------- ONE ROW PER PART, plus a stem row per question. § */
  try {
    /* ---------- THE QUESTIONS COME FROM THE REPOSITORY NOW § */
  } catch (err) { payload.questions = []; }


  // --- resources -> checklists --------------------------------------------------------------
  /* The nest the checklist needs: § */
  /* THE CHECKLISTS MOVED WITH THEM — see the note above and `libraryInto_` in js/library.js. § */
}

/* The jobs into classes, under the keys the site asks for. */
function getJobs_(meAskedName, viewerIsAdmin, vis, cfg, venuesTab, jobsTab, payload) {
  // --- jobs ---------------------------------------------------------------------------------
  const meRow = meAskedName ? findPerson(meAskedName) : null;
  const viewerTutor = !!meRow && (whoMay_(meRow, 'admin') || (hasRole(meRow, 'tutor') && !tutorPending_(meRow)));
  jobsTab.forEach(j => {
    const jobId = S(j.job_id) || String(j._row);
    const cs = clientsIn(jobId), ts = tutorsIn(jobId);
    // A job nobody is in is cancelled and invisible. Derived from the participants, so a stale
    // status cell can't keep a dead job on the page.
    if (!cs.length) return;

    const confirmedTutor = ts.find(t => t.status === BM.AGREED || t.status === BM.BOOKED);
    const caps = [capacityFor('person', confirmedTutor && confirmedTutor.name),
                  capacityFor('venue', j.venue), N(j.max_students)].filter(x => x > 0);
    const maxKids = caps.length ? Math.min.apply(null, caps) : 4;
    const dates = sessionDatesOf(j);

    /* ---------- WHAT A STRANGER MAY SEE OF SOMEBODY ELSE'S BOOKING § */
    /* AGAINST THE NAME THE TOKEN RESOLVED TO. `?name=` here bought the whole of a booking — every
       family on it by name, and the addresses below — to anybody who could spell one seat. */
    const iAmIn = viewerIsAdmin
      || (!!meAskedName && cs.some(c => key(c.name) === key(meAskedName)))
      || (!!meAskedName && ts.some(t2 => key(t2.name) === key(meAskedName)));
    const openToOthers = TRUE_(j.open_to_others);
    const seatsGoing = Math.max(0, maxKids - cs.length);
    /* NO PREFERENCE IS OPEN TO EVERY APPROVED TUTOR until one is chosen: tutors apply, the client picks. */
    const canApply = viewerTutor && TRUE_(j.stealable) && !confirmedTutor && !ts.some(t2 => key(t2.name) === key(meAskedName));
    if (!iAmIn && !canApply && !(openToOthers && seatsGoing > 0)) return;

    /* ---------- WHO MAY SEE WHICH FIGURE, DECIDED HERE AND NOWHERE ELSE § */
    const iTeach = !!meAskedName && ts.some(t2 => key(t2.name) === key(meAskedName));
    const iPay = !!meAskedName && cs.some(c => key(c.name) === key(meAskedName));
    const tutorOnly = iTeach && !iPay && !viewerIsAdmin;
    /* A CHILD OR PARENT SEES THEIR OWN SEAT'S NAMES ONLY (386) — another family on a shared class is a seat. */
    const iBooked = !!meAskedName && cs[0] && key(cs[0].name) === key(meAskedName);
    const namesOk = !vis || iTeach || iBooked;
    const seatName = n => (!vis || iTeach || key(n) === key(meAskedName)) ? n : '';

    const x = { jobId, cs, ts, confirmedTutor, maxKids, dates, iAmIn, openToOthers, seatsGoing, canApply, iTeach, tutorOnly, namesOk, seatName };
    payload.clientClasses.push(Object.assign(jobCardWhat_(j, x, viewerIsAdmin, cfg), jobCardWho_(j, x, meAskedName, viewerIsAdmin, vis, venuesTab)));
  });
  /* THE KEY THE SITE ACTUALLY ASKS FOR. § */
  payload.liveJobs = payload.clientClasses;
  payload.jobs = payload.clientClasses;
}

/* One job's card, what and when and what it costs (who sees which figure is decided in `getJobs_`). */
function jobCardWhat_(j, x, viewerIsAdmin, cfg) {
  const { jobId, cs, maxKids, dates, iAmIn, openToOthers, seatsGoing, canApply, iTeach, tutorOnly } = x;
  return {
    id: jobId, rowIndex: j._row, type: 'job',
    /* SAID PLAINLY so the phone does not have to work it out — and so it cannot work it out
       wrongly and offer a join on something that is not open. */
    /* WHICH KIND OF THING THIS IS, and it was not being sent at all. § */
    kind: norm(j.kind) || '',
    /* AND WHAT A SEAT COSTS, for a class. § */
    openToOthers: openToOthers,
    seatsGoing: seatsGoing,
    /* WHEN THE PEOPLE ON THE LIST CAN COME, gathered and counted — see `waitlistWhen`. § */
    whenCould: norm(j.kind) === 'waitlist' ? waitlistWhen(jobId) : null,
    canAsk: !iAmIn && openToOthers && seatsGoing > 0,
    canApply: canApply,
    status: jobStatusOf(jobId),
    subject: S(j.subject), level: S(j.level), service: S(j.service),
    title: (S(j.level) + ' ' + S(j.subject)).trim(),
    subtitle: (S(j.weekday) || 'TBD') + ' @ ' + (fmtTime(j.start_time) || 'TBD'),
    day: S(j.weekday), time: fmtTime(j.start_time),
    /* EVERY BOOKED HOUR, so the saved card's week shows the ticks the client chose (434). */
    slotCodes: typeof jobCodes_ === 'function' ? jobCodes_(j).join(',') : '',
    location: S(j.venue) || 'Online',
    room: S(j.room),
    /* WHAT A SEAT COSTS. A class row carried no price at all — so the card read `j.price`, found nothing, and printed "Your seat £0.00" on a list that is priced § */
    price: tutorOnly ? '' : N(j.price_total),
    tutorPay: (viewerIsAdmin || iTeach) && S(j.tutor_pay) !== '' ? N(j.tutor_pay) : '',
    adminKeeps: viewerIsAdmin && S(j.admin_profit) !== '' ? N(j.admin_profit) : '',
    /* THE ROOM AND CARD FEES, so the admin's card adds up: client pays = tutor + this + admin. */
    feesKept: viewerIsAdmin ? Math.round((N(j.venue_cost) + N(j.card_fees)) * 100) / 100 : '',
    /* AND WHICH TERM, so the card can say when. `term_name` is the column; `term` is what I
       called it and it does not exist. */
    term: S(j.term_name),
    tags: [S(j.venue) || 'Online', S(j.service) || 'Group'].filter(Boolean),
    capacity: cs.length + '/' + maxKids + ' in',
    currentKids: cs.length, maxKids, spotsLeft: Math.max(0, maxKids - cs.length),
    isFull: cs.length >= maxKids,
    weeks: dates.length, dates: dates.join(', '),
    hours: N(j.hours_per_session) || N(cfg.h) || 2,
    startDate: dates[0] || '', endDate: dates[dates.length - 1] || '',
    /* ---------- WHEN IT WAS ASKED FOR, WHICH HAS BEEN WRITTEN AND NEVER SENT § */
    createdAt: fmtDate(j.created_at)
  };
}

/* One job's card, who is on it and what each viewer may see of them. */
function jobCardWho_(j, x, meAskedName, viewerIsAdmin, vis, venuesTab) {
  const { jobId, cs, ts, confirmedTutor, iAmIn, iTeach, namesOk, seatName } = x;
  return {
    /* THE CHILDREN, as a list. The roster puts a name on a seat and says "Child" for the rest,
       so a tutor opening a session knows who to expect. */
    forChildren: iAmIn && namesOk
      ? S(j.for_children).split(/[,\n]/).map(x => x.trim()).filter(Boolean) : [],
    /* The TUTOR is not private — who teaches a session is the thing somebody deciding whether
       to join most wants to know, and every tutor is already listed publicly. */
    /* ---------- WHOSE BOOKING IT IS, SAID PLAINLY § */
    client: iAmIn && namesOk ? ((cs[0] && cs[0].name) || '') : '',
    tutor:  iAmIn ? ((confirmedTutor && confirmedTutor.name)
                     || (ts[0] && ts[0].name) || '') : '',
    requestedTutor: (confirmedTutor && confirmedTutor.name) || text_('no-preference'),
    tutorStatus: tutorStatusOf(jobId),
    /* ---------- WHO BOOKS THE ROOM, WHICH THE RECEIPT HAS BEEN ANSWERING FOR ITSELF § */
    clientHosts: TRUE_(j.client_hosts),
    /* ---------- AND WHO THE BOOKING IS SPLIT WITH, TO THE PERSON WHO CHOSE THEM § */
    splitEmails: (viewerIsAdmin
                  || (!!meAskedName && cs[0] && key(cs[0].name) === key(meAskedName)))
      ? S(j.split_emails) : '',
    stealable: TRUE_(j.stealable),
    // Emitted in the shape the frontend already reads, so nothing there had to change. The
    // numbering is presentational now — there are no fixed slots behind it.
    /* NO NAMES TO SOMEBODY WHO IS NOT IN IT. The seats are still there — the point is how many
       are going — but each is a seat rather than a person. */
    slots: cs.map((c, i) => ({ n: i + 1,
                               client: iAmIn ? seatName(c.name) : '', status: c.status, chat: '' })),
    tutorSlots: ts.map((t, i) => ({ key: 'abc'[i] || String(i), name: t.name,
                                    status: t.status === BM.AGREED || t.status === BM.BOOKED
                                      ? 'Confirmed' : 'Applied', chats: {} })),
    offerTurn: '',
    /* ---------- THE LOG, TO THE PEOPLE ON IT (342, the review) § */
    events: iAmIn ? eventsForJob(jobId).filter(e => !vis || iTeach || seesPerson_(vis, findPerson(e.actor)) || rankAtLeast_(findPerson(e.actor), 'staff')) : [],
    // Looked up now rather than copied onto the job when it was booked: a tutor who changes
    // their photo should change it on every class they teach, not just future ones.
    image: (venuesTab.find(v => key(v.name) === key(j.venue)) || {}).photo || '',
    image2: confirmedTutor ? ((findPerson(confirmedTutor.name) || {}).photo || '') : ''
  };
}
