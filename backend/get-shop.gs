/* @family. — doGet's payload: terms, the shop, questions and jobs. Called from doGet in doget.gs (1140). */

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

/* The shop list: bikes, wearables and trips. */
function getShop_(payload) {
  // --- links --------------------------------------------------------------------------------
  /* ---------- `links` IS READ OFF THE REPOSITORY NOW § */

  /* The shop holds both kinds of stock, but wearables only exist as rows once they've been seeded — so a freshly deployed site showed one bike and nothing else § */
  /* AND THIS ONE REBUILT THE WHOLE SCHEMA MID-PAYLOAD. § */
  const shopTab = read(TAB.shop);
  if (shopTab.sheet && shopTab.headers.indexOf('kind') >= 0
      && !shopTab.rows.some(r => norm(r.kind) === 'avatar')) {
    seedAvatarItems_();
    clearCache();
  }

  // --- shop -------------------------------------------------------------------------------
  // One list, one shape. A wearable carries a slot and an art_id; a bike doesn't. Everything
  // else about them is identical, which is why they're one tab and one editor.
  read(TAB.shop).rows.forEach(r => {
    if (!S(r.name)) return;
    /* THE SAME THREE WORDS AS A RESOURCE. § */
    const kind = norm(r.kind) === 'avatar' ? 'wearable' : 'thing';
    payload.shop.push({
      id: r._row, rowIndex: r._row, kind, kindRaw: norm(r.kind) || 'thing',
      /* Against the word that is now set, not the one that used to be. § */
      /* ---------- THE PAYLOAD SHAPE HAS NOT MOVED § */
      name: S(r.name),
      price: (function () {
        const how = norm(r.acquire);
        if (how === 'level' || how === 'issued' || how === 'loan') return '';
        if (how === 'ticks') return S(r.price_ticks);
        return S(r.price_coins) || S(r.price_pence);
      })(),
      unit: (function () {
        const how = norm(r.acquire);
        if (how === 'ticks') return '✓ ';
        if (S(r.price_coins)) return '🪙 ';
        if (S(r.price_pence)) return 'p';
        return kind === 'wearable' ? '🪙 ' : '£';
      })(),
      /* HOW YOU GET IT, SENT AS ITSELF TOO. § */
      acquire: norm(r.acquire) || 'buy',
      audience: norm(r.audience) || 'all',
      level: N(r.level_required) || 0,
      slot: S(r.slot), artId: S(r.art_id),
      /* A THEME IS A TAG (740): history, space…; an empty cell is no tag. */
      description: S(r.description), image: S(r.photo), theme: S(r.theme),
      inStock: ON_(r.active),
      fields: SHOP_EDITABLE.reduce((a, f) => { a[f] = S(r[f]); return a; }, {})
    });
  });

  /* A TRIP IS A SHOP ITEM (463): the `trips` tab's active rows join the shop list, priced per child in pence, bought through the basket like any other thing. */
  read(TAB.trips).rows.forEach(r => {
    if (!S(r.name) || !ON_(r.active)) return;
    const pence = N(r.price_per_child) > 0 ? String(Math.round(N(r.price_per_child) * 100)) : '';
    const when = fmtDate(r.date);
    const cap = N(r.max_children);
    payload.shop.push({
      id: 'trip' + r._row, rowIndex: 0, kind: 'thing', kindRaw: 'thing',
      name: S(r.name) + (when ? ' · ' + when : ''),
      price: pence, unit: pence ? 'p' : '£',
      acquire: 'buy', audience: 'all', level: 0, slot: '', artId: '',
      description: [S(r.description), S(r.place) || S(r.venue), cap ? 'up to ' + cap + ' children' : '']
        .filter(Boolean).join(' · '),
      image: S(r.photo), theme: '', inStock: true, fields: {}
    });
  });
}

/* Herd Mentality's questions. */
function getQuestions_(payload) {
  /* questions -------------------------------------------------------------------------- ONE ROW PER PART, plus a stem row per question. § */
  try {
    /* ---------- THE QUESTIONS COME FROM THE REPOSITORY NOW § */
  } catch (err) { payload.questions = []; }

  /* herd ------------------------------------------------------------------------------------ HERD MENTALITY'S QUESTIONS. § */
  try {
    read(TAB.herd).rows.forEach(r => {
      if (!S(r.question) || !ON_(r.active)) return;
      payload.herd.push({ id: S(r.question_id), question: S(r.question),
                          sort: N(r.sort_order) });
    });
    payload.herd.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  } catch (err) { payload.herd = []; }


  // --- resources -> checklists --------------------------------------------------------------
  /* The nest the checklist needs: § */
  /* THE CHECKLISTS MOVED WITH THEM — see the note above and `libraryInto_` in js/library.js. § */
}

/* The jobs into classes, under the keys the site asks for. */
function getJobs_(meAskedName, viewerIsAdmin, vis, cfg, venuesTab, jobsTab, payload) {
  // --- jobs ---------------------------------------------------------------------------------
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
    if (!iAmIn && !(openToOthers && seatsGoing > 0)) return;

    /* ---------- WHO MAY SEE WHICH FIGURE, DECIDED HERE AND NOWHERE ELSE § */
    const iTeach = !!meAskedName && ts.some(t2 => key(t2.name) === key(meAskedName));
    const iPay = !!meAskedName && cs.some(c => key(c.name) === key(meAskedName));
    const tutorOnly = iTeach && !iPay && !viewerIsAdmin;
    /* A CHILD OR PARENT SEES THEIR OWN SEAT'S NAMES ONLY (386) — another family on a shared class is a seat. */
    const iBooked = !!meAskedName && cs[0] && key(cs[0].name) === key(meAskedName);
    const namesOk = !vis || iTeach || iBooked;
    const seatName = n => (!vis || iTeach || key(n) === key(meAskedName)) ? n : '';

    payload.clientClasses.push({
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
      status: jobStatusOf(jobId),
      subject: S(j.subject), level: S(j.level), service: S(j.service),
      title: (S(j.level) + ' ' + S(j.subject)).trim(),
      subtitle: (S(j.weekday) || 'TBD') + ' @ ' + (fmtTime(j.start_time) || 'TBD'),
      day: S(j.weekday), time: fmtTime(j.start_time),
      location: S(j.venue) || 'Online',
      room: S(j.room),
      /* WHAT A SEAT COSTS. A class row carried no price at all — so the card read `j.price`, found nothing, and printed "Your seat £0.00" on a list that is priced § */
      price: tutorOnly ? '' : N(j.price_total),
      tutorPay: (viewerIsAdmin || iTeach) && S(j.tutor_pay) !== '' ? N(j.tutor_pay) : '',
      adminKeeps: viewerIsAdmin && S(j.admin_profit) !== '' ? N(j.admin_profit) : '',
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
      createdAt: fmtDate(j.created_at),
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
      requestedTutor: (confirmedTutor && confirmedTutor.name) || 'No preference',
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
      events: iAmIn ? eventsForJob(jobId) : [],
      // Looked up now rather than copied onto the job when it was booked: a tutor who changes
      // their photo should change it on every class they teach, not just future ones.
      image: (venuesTab.find(v => key(v.name) === key(j.venue)) || {}).photo || '',
      image2: confirmedTutor ? ((findPerson(confirmedTutor.name) || {}).photo || '') : ''
    });
  });
  /* THE KEY THE SITE ACTUALLY ASKS FOR. § */
  payload.liveJobs = payload.clientClasses;
  payload.jobs = payload.clientClasses;
}
