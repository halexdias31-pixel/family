/* @family. — doGet's payload: people, family, venues, campaigns and laws. Called from doGet in doget.gs (1140). */

/* People into tutors and students. */
/* ONE TUTOR CARD, AS SENT. */
function tutorOut_(r, i, name, listed, qp, venuesTab) {
  return {
    id: i, type: 'tutor', role: ROLE_LABEL[mainRole(r)] || 'Tutor',
    /* A TITLE IS A SEPARATE FIELD RATHER THAN A LONGER `role` STRING, because `role` is one word: § */
    titles: titlesOf(r),
    /* ---------- WHO THEY ARE, NOT WHAT THEY ARE CALLED § */
    personId: S(r.person_id),
    listed: listed,      // so the site can show which ones are hidden, and offer the switch
    /* AND WHICH OF THE HIDDEN ONES ASKED — a Tutor box ticked in Settings (`LISTED_PENDING`). § */
    pending: tutorPending_(r),
    /* THE HANDLE OR NOTHING — never the first name in its place. § */
    title: name, handle: S(r.handle),
    subtitle: S(r.city) || 'London',
    image: S(r.photo), mediaUrl: S(r.video),
    /* THE UPLOADED INTRO VIDEO'S DRIVE ID (shared view-by-link), played on the card; and the jobs as a list. */
    videoFile: S(r.video_file), jobs: jobsList_(r),
    /* THE FIGURE, ONLY WHEN THE FACE IS THE FIGURE (`pfp:avatar`) — `faceFig_` in core.gs. § */
    avatar: faceFig_(r).avatar,
    /* THE OTHER PHOTOGRAPHS, AS A LIST, without the face — `photosList_`. § */
    photos: photosList_(r),
    tags: [r.adjective_1, r.adjective_2, r.adjective_3].map(S).filter(Boolean),
    description: S(r.headline) ? '"' + S(r.headline) + '"' : '',
    rate: N(r.rate_per_hour),
    dbs: TRUE_(r.dbs_checked),
    /* When they last confirmed their details are current. § */
    detailsConfirmed: fmtDate(r.details_confirmed),
    yrsExp: S(r.years_experience),
    // The shape of job they'll accept. Sent as numbers so the booking form can filter on
    // them; 0 means "no limit set", which is treated as no limit rather than as zero.
    // Blank means "no view", and the smallest real booking is one student for one hour.
    minStudents: N(r.min_students) || 1, maxStudents: N(r.max_students),
    minHours: N(r.min_hours) || 1, maxHours: N(r.max_hours),
    /* THE AGES THEY TEACH, public like the rate — it is what a parent checks before anything else. § */
    ageMin: ageOut_(r.age_min), ageMax: ageOut_(r.age_max),
    extraSeat: N(r.extra_seat_rate),
    /* AND THE BUSINESS'S CUT OF THAT SEAT, THIS TUTOR'S OWN (docs/history/345) — '' for a blank cell, which is the config tab's `B`, and nought for nought, which is § */
    /* A TUTOR'S OWN CUT IS IGNORED SINCE 8 NOV: config B is the one share, so none is sent. */
    extraSeatCut: '',
    /* WHO MANAGES THEM, a person id ('' is the admin) — the site's `chainShares_` walks it to split the extra-seat money. */
    manager: S(r.manager),
    /* THE VENUES THEY ARE HAPPY AT, off `venues.tutors_happy_here` — `venuesFor_` is the one
       reader, and the Settings page is the one writer. Names, in the tab's order. */
    venues: venuesFor_(r, venuesTab),
    focus: S(r.focus).split(/[,\n]/).map(x => x.trim()).filter(Boolean),
    xp: N(r.xp), credits: N(r.credits),
    highscore: N(r.high_score_flappy), ttHighscore: N(r.high_score_tables),
    avail: availGridOut(r.availability),
    /* WHAT THEY ARE ALREADY TEACHING, as the same `m16` codes — so the booking grid can show an hour as taken WITHOUT the tutor's own availability having been edited. § */
    busy: busyHours(personDisplayName(r)),
    /* ---------- THE SAME SUBJECT TWICE IS ONE SUBJECT § */
    /* WHAT THEY TEACH, THE SPECIALISM FIRST — derived from the two ticks on their rows of the `qualifications` tab by `teachesOf_`, which dedupes, so a sheet typed § */
    teaches: teachesOf_(r).all,
    teachesMain: teachesOf_(r).first,
    teachesSpec: teachesOf_(r).main,
    /* UP TO TEN, OFF THEIR ROWS OF THE `qualifications` TAB — `qualsList_` in core.gs. § */
    quals: qp.map(qualSentence_),
    qualsParts: qp,
    actionText: '▶ Watch Intro'
  };
}

function peopleClient_(r, viewerIsAdmin, payload) {
  if (viewerIsAdmin && (hasRole(r, 'client') || hasRole(r, 'parent'))) {
    /* AND THEIR CHILDREN, so the booking form can ask WHICH of them once a client is chosen.
       Names only — the same rule as the list itself, and for the same reason. */
    payload.clients.push({
      name: nameFor_(r),
      /* BY FIRST NAME — the owner, 10 Oct: *"dont show children's last name"* (`nameFor_`, people.gs).
         The ticklist these fill is what goes into `for_children`, so the booking keeps the name
         the admin saw. */
      children: childrenOf(S(r.person_id)).map(c => nameFor_(c)),
    });
  }
}

function peopleClaims_(r, meRow, payload) {
  if (meRow && S(r.person_id) === S(meRow.person_id)) {
    read(TAB.family).rows.forEach(f => {
      if (norm(f.state) !== 'asked') return;
      if (S(f.child_id) !== S(r.person_id)) return;
      const parent = findPerson(S(f.parent_id));
      payload.claims.push({
        rowIndex: f._row,
        from: parent ? nameFor_(parent) : S(f.parent_id),
        asked: S(f.asked_on),
      });
    });
  }
}

function peopleEveryone_(r, viewerIsAdmin, payload) {
  if (viewerIsAdmin && !hasRole(r, 'tutor') && !hasRole(r, 'admin')) {
    payload.everyone.push({
      /* THE HANDLE OR NOTHING, as on `tutors` — and an admin's card says "no handle yet" for a
         blank one, so a hand-typed child is seen to need one ("New PIN" gives it them). */
      /* A CHILD BY FIRST NAME (`nameFor_`) — the admin included, who reads the surname in the sheet.
         The card prints the handle, so two children called Sam are told apart by it. */
      personId: S(r.person_id), title: nameFor_(r, true), handle: S(r.handle),
      role: ROLE_LABEL[mainRole(r)] || 'Client', image: S(r.photo),
      /* AND THE FIGURE WHEN IT IS THEIR PICTURE — an admin is already sent this person's face, so
         the face drawn as the figure tells them nothing they could not already see. `faceFig_`. */
      avatar: faceFig_(r).avatar,
    });
  }
}

function peopleStudent_(r, maySeeChildren, vis, payload) {
  if (hasRole(r, 'student') && maySeeChildren && (!vis || vis[S(r.person_id)])) {
    payload.students.push({
      /* ---------- `siblings` AND `friends` WERE HERE, AND THEY WENT TO EVERY STUDENT § */
      avatar: S(r.avatar),
      /* THE FIRST NAME, AS IT ALWAYS WAS — for everybody on the board, child or not: § */
      name: kidFirst_(r) || nameFor_(r, true),
      handle: S(r.handle),
      xp: N(r.xp), credits: N(r.credits),
      highscore: N(r.high_score_flappy), ttHighscore: N(r.high_score_tables)
    });
  }
}

function getPeople_(meAsked, viewerIsAdmin, vis, people, venuesTab, payload) {
  // --- people -> tutors + students ---------------------------------------------------------
  people.forEach((r, i) => {
    const name = personDisplayName(r);
    if (!name) return;
    /* `listed` decides whether a profile is PUBLIC. Blank counts as listed: every existing row
       predates the column, and hiding fifteen people the moment this deployed would be the worst
       possible reading of an empty cell. */
    const listed = ON_(r.listed);
    /* An admin sees the unlisted ones too, marked. Without that a tutor switched off vanishes
       from the site and can only be switched back on in the spreadsheet — which would make the
       control worse than not having one. */
    if ((listed || viewerIsAdmin) && (hasRole(r, 'tutor') || hasRole(r, 'admin'))) {
      /* READ ONCE, SENT TWICE — `quals` and `qualsParts` below are one list in two spellings. */
      const qp = qualsParts_(r);
      payload.tutors.push(tutorOut_(r, i, name, listed, qp, venuesTab));
    }
    /* ---------- CHILDREN ARE NOT SENT TO STRANGERS § */
    /* THE TOKEN, NOT THE QUERY STRING. `?person=<any id>` or `?name=<any name>` made somebody a
       student or a parent for the length of one request, and `maySeeChildren` is what sends every
       child's row to the phone. */
    const meRow = meAsked;
    payload.clients = payload.clients || [];
    const iAmStudent = !!meRow && hasRole(meRow, 'student');
    const iAmParent = !!meRow && hasRole(meRow, 'client');
    const maySeeChildren = viewerIsAdmin || iAmStudent || iAmParent;

    /* ---------- WHO AN ADMIN MAY BOOK ON BEHALF OF § */
    peopleClient_(r, viewerIsAdmin, payload);

    /* ---------- CLAIMS WAITING ON THIS PERSON § */
    peopleClaims_(r, meRow, payload);

    /* ---------- EVERYONE, FOR AN ADMIN'S PEOPLE COLUMN § */
    peopleEveryone_(r, viewerIsAdmin, payload);

    peopleStudent_(r, maySeeChildren, vis, payload);
  });
}

/* Your family, the venues, the health report, the campaigns and the laws. */
function getFamilyVenues_(p, meAsked, viewerIsAdmin, venuesTab, payload) {
  /* ---------- YOUR OWN FAMILY, AND NOBODY ELSE'S § */
  /* BUILT BY `familyOf_` BELOW, so the sign-in reply (`loginReplyFor_`) sends exactly this list in
     exactly this shape — two copies of who counts as your family would be the `childrenOf` fault. */
  try {
    const fam = familyOf_(meAsked);
    payload.familyFor = fam.familyFor;
    payload.family = fam.family;
  } catch (err) { payload.familyFor = ''; payload.family = []; }

  // --- venues -------------------------------------------------------------------------------
  venuesTab.forEach((r, i) => {
    const title = S(r.name);
    if (!title) return;
    const rate = N(r.cost_per_hour);
    payload.venues.push({
      id: i, type: 'venue', title,
      borough: S(r.borough), city: S(r.city),
      /* WHERE IT IS, as two numbers. § */
      postcode: S(r.postcode), lat: N(r.lat) || 0, lng: N(r.lng) || 0,
      focus: S(r.focus).split(/[,\n]/).map(x => x.trim()).filter(Boolean),
      subtitle: S(r.borough) || S(r.city) || 'London',
      image: S(r.photo), link: S(r.link), description: S(r.description),
      bestRate: rate, actionText: 'Book Session',
      tags: [S(r.town), rate > 0 ? '+£' + rate + '/h' : ''].filter(Boolean),
      /* One is the floor everywhere. A blank minimum used to mean zero, so a venue nobody had
         filled in offered "0 students" and a tutor with no limits offered a session of no hours
         — neither is a thing you can book. */
      maxCapacity: N(r.max_students), minCapacity: N(r.min_students) || 1,
      takesAllSeats: TRUE_(r.takes_all_seats),
      minHours: N(r.min_hours) || 1, maxHours: N(r.max_hours),
      minNoticeDays: N(r.notice_days),
      comfort: S(r.tutors_happy_here).split(/[,\n]/).map(x => x.trim()).filter(Boolean),
      // The rooms in this building, each with its own price and capacity. Empty for a venue
      // that's just one space, which is most of them.
      /* EACH BLANK CELL IS THE VENUE'S, decided in `roomTerms_` (booking.gs) — the same call `capacityFor`, `priceLooksWrong` and `waitlistPrice` make, so the room the § */
      rooms: read(TAB.rooms).rows
        .filter(x => key(x.venue) === key(r.name) && ON_(x.active))
        .map(x => {
          const t = roomTerms_(x, r);
          return {
            rowIndex: x._row, name: S(x.name),
            rate: t.rate, concession: t.concession,
            min: t.min, max: t.max, notes: S(x.notes),
            /* A room's own opening hours. § */
            avail: availGridOut(t.availability),
            /* WHAT IS ALREADY BOOKED IN IT (434), as `m16` codes, so the grid greys a taken room the way it greys a busy tutor. */
            busy: spaceBusy(S(r.name) + ' \u2014 ' + S(x.name)),
            fields: ROOM_EDITABLE.reduce((a, f) => { a[f] = S(x[f]); return a; }, {})
          };
        }),
      fields: flat(VENUE_GROUPS).reduce((a, f) => { a[f] = S(r[f]); return a; }, {}),
      avail: availGridOut(r.availability)
    });
    if (S(r.borough)) {
      if (payload.dropdowns.boroughs.indexOf(S(r.borough)) === -1) payload.dropdowns.boroughs.push(S(r.borough));
    }
  });

  /* Only for an admin, and only on request — walking every row costs time, and a client has no use for a list of what needs fixing. § */
  if (S(p.health) === '1' || viewerIsAdmin) {
    /* THE DRIVE PROBE ONLY WHEN THE REPORT IS ASKED FOR BY NAME. § */
    try { payload.health.problems = dataProblems(S(p.health) === '1'); }
    catch (err) { payload.health.problems = [{ level: 'check failed', what: String(err), fix: '' }]; }
  }

  /* THE BRANDING, whole. Every row, whether or not the code knows the key — so something added
     to the tab is available to whatever is written next without the backend changing. */
  /* ---------- `brand` IS READ OFF THE REPOSITORY NOW § */

  /* ---------- THE LIBRARY SPREADSHEET IS NOT READ HERE ANY MORE § */

  /* THE FUNNEL'S QUESTIONS. § */
  /* ---------- `facets` IS READ OFF THE REPOSITORY NOW § */

  /* THE FUNNEL'S ANSWERS. § */
  /* ---------- `kinds` IS READ OFF THE REPOSITORY NOW § */

  /* ---------- THE CAMPAIGNS, AND THE WORDS THEY SAY § */
  if (viewerIsAdmin) {
    const words = {};
  /* ---------- `copy` IS READ OFF THE REPOSITORY NOW § */
    /* SORTED BY THE VARIANT NUMBER, numerically — so 10 comes after 9 rather than after 1, which
       is what sorting them as text would have done the moment somebody wrote a tenth. */
    Object.keys(words).forEach(cid => Object.keys(words[cid]).forEach(slot =>
      words[cid][slot].sort((a, b) => (Number(a.variant) || 0) - (Number(b.variant) || 0))));

  /* ---------- `campaigns` IS READ OFF THE REPOSITORY NOW § */
  }

  /* THE LAWS. Sent to every phone, because every screen paints text with them — and they are
     a handful of rows, so the cost of sending them is nothing against the cost of asking. */
  /* ---------- THE REELS § */
  /* ---------- `facts` IS READ OFF THE REPOSITORY NOW § */

  /* ---------- `laws` IS READ OFF THE REPOSITORY NOW § */

  /* If the tab is empty — a fresh sheet, or somebody cleared it — the four laws that were asked for stand in. § */
  if (!payload.laws.length) {
    payload.laws = [
      { kind: 'prefix', match: '#', colour: 'blue',      weight: 30 },
      { kind: 'prefix', match: '@', colour: 'blue-soft', weight: 30 },
      /* THREE COLOURS, THREE QUESTIONS, and that is the whole set: § */
      { kind: 'list',   match: 'subjects', colour: 'green',  weight: 20 },
      /* THE LEVEL, pink. The fourth fact a booking is made of and the last one still uncoloured: § */
      { kind: 'list',   match: 'levels',   colour: 'pink',   weight: 20 },
      { kind: 'list',   match: 'wearables', colour: 'blue-soft', weight: 15 },
      { kind: 'list',   match: 'venues',   colour: 'purple', weight: 20 },
      { kind: 'list',   match: 'tutors',   colour: 'red',    weight: 20 },
      { kind: 'list',   match: 'clients',  colour: 'dim',    weight: 10 },
    ];
  }
}
