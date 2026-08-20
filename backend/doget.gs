/* ==================================================================================================
   @family. — 60_doGet.gs   (7 of 8)

   THE PAYLOAD. One function, because it is one answer — everything the app needs to draw
   itself, in one request.

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
const DOGET_VERSION = "2026-08-15-funnel";


function doGet(e) {
  try {
    WRITE_MISSES = [];
    /* Read once, at the top, so every exit from this function is wrapped the same way — including
       the early returns and the error at the bottom. A reply that comes back as bare JSON when the
       page asked for a script is a reply the page cannot see at all. */
    JSONP_CB = String(((e && e.parameter) || {}).callback || '');
    const t0 = Date.now(), timings = {};
    const mark = n => { timings[n] = Date.now() - t0; };
    const p = (e && e.parameter) || {};

    /* ---------- THE SHEET CATCHES UP, BUT NEVER WHILE SOMEBODY IS WAITING -------------------------
       THIS RAN ON EVERY PAGE LOAD, and the note it carried said the quiet part out loud: "it must
       be fast, this runs inside somebody's page load". It is fast when there is nothing to do — one
       property read — and that is true on every request except the ones where it matters.

       ON THE FIRST REQUEST AFTER A VERSION CHANGE it walks thirty tabs, appends columns, re-reads
       every header row to check its own work, gives four hundred resources an id, rewrites the
       options tab and attempts every migration not yet recorded. That is seconds at best, and it
       lands on whoever opens the app next — who sees a loading animation and no reason for it.
       Change the version a few times in an afternoon and it lands on them again each time.

       AND IF ANYTHING IS STILL MISSING AFTERWARDS the version is not recorded, so it tries again.
       That is right — a schema that did not land must not be remembered as landed — and it means a
       fault nobody has noticed makes every load slow for as long as it goes unnoticed.

       SO IT DOES NOT RUN HERE. `?setup=1` does it and `?run=ensureSchema` does it, both of which
       are somebody asking on purpose and willing to wait. The payload SAYS when the sheet is
       behind, so it is visible rather than silently stale. */
    const behind = (function () {
      try {
        return PropertiesService.getScriptProperties()
          .getProperty('SCHEMA_VERSION') !== BACKEND_VERSION;
      } catch (err) { return false; }
    })();
    /* A maintenance URL still brings it up to date first — a job that needs a column needs the
       column to exist, and nobody is watching a spinner on one of those. */
    const migrated = (p.run || p.setup) ? autoMigrate() : null;

    /* ---------- AND THE SHEET SAYS SO ITSELF, ONCE ------------------------------------------------
       TAKING THE SCHEMA WORK OFF THE PAGE LOAD LEFT A LOOP. Nothing on an ordinary request records
       the version any more, so `SCHEMA_VERSION` stays behind for ever — and everything that asks
       "is the sheet behind?" answers yes for ever, on every request, including the check that reads
       thirty tab headers to find out how.

       So it is asked ONCE, cheaply, and the answer is remembered: if there are no gaps, the version
       is recorded and nothing asks again. Thirty header reads on one request after a deploy is a
       fair price; thirty on every request for ever is not.

       ONLY WHEN IT IS ALREADY BEHIND, and only when the columns are genuinely all there — a sheet
       that really is missing something must go on saying so. */
    if (behind && !p.run && !p.setup) {
      try {
        const gaps = schemaGaps();
        if (!Object.keys(gaps).length) {
          PropertiesService.getScriptProperties()
            .setProperty('SCHEMA_VERSION', BACKEND_VERSION);
        }
      } catch (err) { /* it stays behind and says so, which is the safe way round */ }
    }

    /* A maintenance job, before anything else — none of these want a payload built first, and
       `checkEverything` in particular is for the case where building one fails. */
    if (p.run) {
      const job = RUNNABLE[S(p.run)];
      if (!job) {
        return jsonOut({ error: 'No job called "' + S(p.run) + '".',
                         jobs: Object.keys(RUNNABLE) });
      }
      const who = findPerson(S(p.name));
      /* Both checks, and one message for both. "That name is not an admin" tells somebody trying
         addresses which half they got right. */
      if (!who || S(who.pin) !== S(p.pin) || !hasRole(who, 'admin')) {
        return jsonOut({ error: 'Name or PIN not recognised, or that person is not an admin.',
                         hint: 'Add &name=Your%20Name&pin=0000 to the URL.' });
      }
      try {
        return jsonOut({ version: BACKEND_VERSION, ran: S(p.run), by: personDisplayName(who),
                         migrated: migrated, result: job(S(p.arg)) });
      } catch (err) {
        /* The message, not a stack trace, and NOT a 500 page — a job that throws should read as a
           job that threw rather than as the deployment being broken. */
        return jsonOut({ version: BACKEND_VERSION, ran: S(p.run), error: String(err && err.message || err) });
      }
    }

    /* ?setup=1 brings the sheet's tabs and columns up to date in place, so a schema change never
       means re-uploading the file and repointing SPREADSHEET_ID.
       Left open, unlike `?run=`: it can only ADD tabs, columns and missing config rows, and it
       never touches a value anybody has set. The worst somebody can do with it is run it. */
    if (p.setup) return jsonOut({ version: BACKEND_VERSION, schema: ensureSchema(),
      alsoAvailable: 'add ?run=<job>&name=…&pin=… for the rest: ' + Object.keys(RUNNABLE).join(', ') });

    // ?pages=1 fills blank page counts, ?pages=all re-reads every one. Batched, so a big library
    // takes a few runs rather than timing out halfway and leaving no record of where it got to.
    if (p.pages) return jsonOut({ version: BACKEND_VERSION,
      pages: refreshPageCounts(String(p.pages).toLowerCase() === 'all') });

    // The showcase on its own. Listing a Drive folder is a round-trip to another Google service
    // and by far the slowest thing here — everything else is sheet reads. Fetched separately by
    // the site AFTER the page has drawn, so a slow or unauthorised Drive can no longer hold up
    // eleven sections that have nothing to do with it. That was the whole 45-second timeout: one
    // optional picture gallery blocking the entire site.
    /* ONE WORLD'S GROUND, on its own. Not in the main payload: four boroughs of geometry is
       hundreds of kilobytes and almost nobody opens the map, so putting it in every page load
       would make the whole app slower for a screen most people never see.
       Asked for when the map is opened, and once per world. */
    if (p.map) {
      const want = S(p.map);
      const shapes = read(TAB.map).rows
        .filter(r => key(S(r.world)) === key(want) && S(r.points))
        .map(r => ({ kind: S(r.kind), name: S(r.name),
          /* Parsed here rather than on the phone: a malformed cell should be one shape without a
             height, not an exception in the middle of drawing a map. */
          meta: (function () { try { return JSON.parse(S(r.meta) || '{}'); } catch (e) { return {}; } })(),
          points: S(r.points).split(',').map(q => {
            const b = q.trim().split(/\s+/);
            return [Number(b[0]), Number(b[1])];
          }).filter(q => q[0] && q[1]) }));
      return jsonOut({ version: BACKEND_VERSION, world: want, shapes: shapes,
        /* ODbL asks for this, and the map shows it. */
        attribution: 'Map data © OpenStreetMap contributors' });
    }

    /* SOMEBODY'S OWN RECEIPTS. Their own only — a receipt names what a family paid, and the list of
       them is the shape of a household's year. */
    if (p.receipts) {
      /* BY ID WHERE THE SITE KNOWS IT. This asked for the name alone, which is the same weakness the
         receipts themselves had: two people who answer to one name get one another's documents, and
         a renamed person gets nobody's. The site has held a `personId` since sign-in. */
      const who = findPerson(S(p.name), S(p.person));
      if (!who) return jsonOut({ error: 'Name not recognised.' });
      const mine = read(TAB.receipts).rows.filter(r =>
        (S(r.person_id) && S(r.person_id) === S(who.person_id))
        || key(S(r.person_name)) === key(personDisplayName(who)));
      return jsonOut({ version: BACKEND_VERSION, receipts: mine.map(r => ({
        id: S(r.receipt_id), kind: S(r.kind), jobId: S(r.job_id),
        issuedOn: S(r.issued_on), total: N(r.total_pence) / 100, currency: S(r.currency) || 'GBP',
        note: S(r.note),
        lines: (function () {
          /* A malformed cell is one receipt without its detail, not an exception that takes the
             whole list down with it. */
          try { return JSON.parse(S(r.lines) || '[]'); } catch (e) { return []; }
        })(),
      })) });
    }

    if (p.galleryOnly) {
      const gal = gallery();
      return jsonOut({ version: BACKEND_VERSION, gallery: gal.files, galleryError: gal.error });
    }

    // ?triggers=1 installs the nightly jobs; ?triggers=list shows what's scheduled.
    if (p.triggers) return jsonOut({ version: BACKEND_VERSION,
      triggers: String(p.triggers).toLowerCase() === 'list' ? listTriggers() : installTriggers() });

    // Confirm the tabs exist before building anything. Pointing at the wrong spreadsheet is the
    // single likeliest setup mistake, and read() returning empty rows makes it look like eleven
    // separate features broke rather than one line being wrong.
    /* Only the tabs the site genuinely can't run without. Anything seeded by ensureSchema stays
       off this list: a new tab must never take the whole site down in the gap between deploying
       and seeding. Add to it only if nothing at all can be shown without that tab. */
    const REQUIRED_TABS = ['people', 'venues', 'jobs', 'events', 'terms',
                           'resources', 'links', 'shop', 'pricing', 'config', 'options'];
    const missingTabs = REQUIRED_TABS.filter(name => !read(name).sheet);
    if (missingTabs.length) {
      return jsonOut({ error: 'This spreadsheet has no ' + missingTabs.join(', ') + ' tab' +
        (missingTabs.length > 1 ? 's' : '') + '. SPREADSHEET_ID in hermes.gs is probably still ' +
        'pointing at the old sheet — set it to the id in the new spreadsheet\'s URL ' +
        '(docs.google.com/spreadsheets/d/<THIS PART>/edit).',
        version: BACKEND_VERSION, sawTabs: SpreadsheetApp.openById(SPREADSHEET_ID)
          .getSheets().map(s2 => s2.getName()) });
    }

    /* WHO IS LOOKING, asked ONCE. It was asked inside the people loop, which is a full scan of the
       people tab per person — fifteen scans to answer one question — and it was not asked at all
       where posts and resources are filtered, so a switched-off post vanished from the admin who
       switched it off and could never be brought back from the phone. */
    const viewerIsAdmin = isAdminPerson(S(p.name));

    const cfg = config(), opts = allOptions(), sur = surcharges();
    mark('config');

    const people = read(TAB.people).rows;
    const venuesTab = read(TAB.venues).rows;
    const jobsTab = read(TAB.jobs).rows;
    mark('records');

    const payload = {
      version: BACKEND_VERSION,
      /* WHAT THE SHEET DID when this version first arrived — null on every request but the first
         after a deploy. Sent so it is visible rather than only in a log nobody opens: a schema
         change that failed and a schema change that was never needed look identical from here. */
      migrated: migrated,
      /* WHETHER THE SHEET IS BEHIND THE CODE. Said rather than fixed: the fixing costs seconds and
         used to be taken out of this request, and this costs one property read. */
      schemaBehind: behind,
      // What this deploy can do. The frontend compares this against what it needs and warns if a
      // redeploy hasn't landed — a stale deploy is the worst kind of bug, because the action
      // succeeds and only the newer half silently doesn't happen.
      /* EVERY FILE'S STAMP, so a stale one can be named. `typeof` guards each: if a file has not
         been pasted at all the constant does not exist, and referencing it would throw and take
         the whole payload down — which is the loudest possible way to report a missing file and
         the least useful. */
      fileVersions: {
        constants: BACKEND_VERSION,
        doPost:  typeof DOPOST_VERSION  !== 'undefined' ? DOPOST_VERSION  : 'not deployed',
        doGet:   typeof DOGET_VERSION   !== 'undefined' ? DOGET_VERSION   : 'not deployed',
        booking: typeof BOOKING_VERSION !== 'undefined' ? BOOKING_VERSION : 'not deployed',
      },
      features: [/* ---------- THE NEW ONES, DECLARED SO THE SITE CAN TELL YOU --------------------
                     A STALE DEPLOY LOOKS EXACTLY LIKE A BUG. `openWaitlist` was written, checked
                     and shipped, and the live backend did not have it — so the app said "that
                     action is not recognised", which is a sentence written for somebody who did
                     something wrong rather than for a file that has not been pasted in yet. Twenty
                     minutes went into looking for a fault that was not there.
                     Every action added from here on goes in this list, and the site now reads it. */
                 'openWaitlist', 'claimChild', 'answerClaim', 'joinWaitlist',
                 'move', 'events', 'tabs', 'getProfile', 'listPeople', 'createJob',
                 'updateConfig', 'updateResource', 'updatePricing', 'updateShop',
                 'deleteShopItem', 'updateTrip', 'addTrip', 'imageData',
                 'saveRoom',
                 'updateLink', 'addLink', 'deleteLink',
                 'saveTodo', 'saveAvatar', 'register', 'verifyEmail', 'diagnosePeople',
                 /* The site checks for this to decide whether it may offer the picker. */
                 'folderFiles',
                 /* `likePost` is deliberately absent. The site checks this list, so a stale copy
                    of it in somebody's browser cache finds out rather than failing quietly. */
                 'confirmDetails',
                 // Admin editing, by id rather than by row number, and printed copies.
                 'editResource', 'deleteResource', 'editPost', 'deletePost', 'orderPrints',
                 'createCheckout', 'finalizePayment',
                 /* The site checks this before it offers the button, so an old deployment says so
                    rather than failing when it is pressed. */
                 'deleteJob', 'linkChild', 'unlinkChild',
                 /* The site checks this before it offers the waitlist at all, so a phone running
                    against an older deployment says so rather than posting an action that comes
                    back "not recognised" — which reads as the feature being broken. */
                 'joinWaitlist',
                 /* The site checks this before offering the button, so an older deployment says so
                    rather than answering "that action is not recognised" on a payment. */
                 'markPaid', 'joinFestive',
                 /* The site checks this before it offers the ＋ to somebody who is not an admin —
                    so an old deployment says so rather than swallowing their photograph. */
                 'approvePost'],
      tutors: [], students: [], venues: [], clientClasses: [], liveJobs: [],
      links: [], shop: [], promotions: [], intervals: [], landmarks: [],
      campaigns: [],
      gallery: [], galleryError: '',
      profileFields: PROFILE_GROUPS, clientFields: CLIENT_GROUPS,
      studentFields: STUDENT_GROUPS, venueFields: VENUE_GROUPS,
      // Admin-only relabelling of checklist resources — moving something from foundation to
      // higher, fixing a wrong exam board. Groups plus which list fills each dropdown.
      resourceFields: RESOURCE_GROUPS, resourceOptions: RESOURCE_OPTIONS,
      postFields: POST_GROUPS,
      shopFields: SHOP_GROUPS, tripFields: TRIP_GROUPS, roomFields: ROOM_GROUPS,
      roomSlots: ROOM_SLOTS,
      linkFields: LINK_GROUPS,
      options: opts,
      // Every value ALREADY in use on a resource, per field. The dropdown offers these as well as
      // the options list, because the two disagree: 68 resources are labelled "Paper ?" and
      // Paper 1/2/3 are on 25 more, none of which were ever added to the list. Offering only the
      // list means you can't select a value your own data already uses, and can't relabel the
      // ones that need it. This keeps itself current with no maintenance.
      resourceInUse: (function () {
        const out = {};
        read(TAB.resources).rows.forEach(r => Object.keys(RESOURCE_OPTIONS).forEach(f => {
          const v = S(r[f]);
          if (!v) return;
          out[f] = out[f] || [];
          if (out[f].indexOf(v) === -1) out[f].push(v);
        }));
        Object.keys(out).forEach(f => out[f].sort());
        return out;
      })(),
      profileReadonly: PROFILE_READONLY,
      availGrid: { days: AVAIL_DAYS, hours: AVAIL_HOURS },
      // field -> its option list, in the shape the edit forms already read. Built from the
      // `options` tab, so every form and every booking dropdown share one source. Editing a list
      // there takes effect on the next load: nothing to rebuild, nothing to go stale.
      validations: (function () {
        const out = {};
        Object.keys(FIELD_OPTIONS).forEach(f => {
          const list = opts[FIELD_OPTIONS[f]];
          if (list && list.length) out[f] = list;
        });
        return out;
      })(),
      multiSelect: [],
      dropdowns: {
        levels: opts.level || [], subjects: opts.subject || [], days: opts.weekday || [],
        // What kind each option is, so a subject can be academic or sporty the way a tutor already
        // can. Sent as a lookup rather than folded into the lists, which stay plain.
        focus: optionFocus(),
        times: (opts.start_time || []).map(fmtTime), boroughs: opts.borough || [],
        locations: venuesTab.map(v => S(v.name)).filter(Boolean),
        services: opts.service || [], linkCategories: [], topics: [], checklists: {},
      },
      /* `subjects` holds the subject surcharges, which is what its name says.
         It used to be sent EMPTY, with the real figures under `subjectsEta` — a key meaning
         nothing beside a key named nothing. Reading the obvious one gave an empty object and every
         subject silently priced at x1, which reads as a decision rather than a bug.
         `subjectsEta` is still sent, unchanged, so anything already reading it keeps working. */
      multipliers: { levels: sur.level,
                     subjects: sur.subject,
                     subjectsEta: sur.subject,      // the old name, kept so nothing breaks
                     days: sur.day, times: sur.time, services: sur.service,
                     students: {}, weeks: {}, baseRate: N(cfg.M) },
      constants: { vars: cfg },
      // Every per-option surcharge as a flat list, so the pricing card can offer each one for
      // editing rather than saying "set this somewhere else". Venues come from their own tab, but
      // they behave identically here — a rate attached to a choice.
      pricingRows: read(TAB.pricing).rows
        .filter(r => S(r.kind) && S(r.label))
        .map(r => ({ kind: norm(r.kind), label: S(r.label), value: N(r.surcharge_per_hour) }))
        .concat(venuesTab.filter(r => S(r.name))
          .map(r => ({ kind: 'venue', label: S(r.name), value: N(r.cost_per_hour) }))),
      /* Sent, but nothing displays them yet — the shape is settled and the presentation isn't.
         Having the data flowing means whatever you decide to build reads from something real
         rather than needing a backend change first.

         `rooms` USED TO BE A PASTED SCHEMA FRAGMENT here — the ten column names of the rooms tab,
         sitting inside the payload as though they were data. Valid JavaScript, so nothing threw;
         it simply shipped a list of header strings to every phone under a key nothing read. The
         rooms that matter are on each venue, where a room belongs. */
      /* WHAT THE CALENDAR IS OFFERING TODAY. Computed from the holidays tab on every load, which is
         cheap — it is one tab of about eighteen rows and a date comparison — and it is the only way
         a thing can appear and disappear on its own without anybody remembering. */
      festive: [],
      trips: [], exams: [], birthdays: [], orders: [], widgets: [], posts: [], laws: [],
      questions: [], boxers: [], fights: [],
      /* An object rather than an array — branding is looked up by name, never iterated. */
      brand: {},
      /* Missing COLUMNS, and — for an admin — what is wrong with the DATA. The second is the one
         that matters day to day: a column can be added by a script, and a term that ends before it
         starts can only be noticed by somebody. */
      health: { ok: true, missing: [], problems: [] }
    };
    mark('payloadInit');

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
        payload.tutors.push({
          id: i, type: 'tutor', role: ROLE_LABEL[mainRole(r)] || 'Tutor',
          listed: listed,      // so the site can show which ones are hidden, and offer the switch
          title: name, handle: S(r.handle) || S(r.username) || S(r.first_name),
          subtitle: S(r.city) || 'London',
          image: S(r.photo), mediaUrl: S(r.video),
          tags: [r.adjective_1, r.adjective_2, r.adjective_3].map(S).filter(Boolean),
          description: S(r.headline) ? '"' + S(r.headline) + '"' : '',
          rate: N(r.rate_per_hour),
          dbs: TRUE_(r.dbs_checked),
          /* When they last confirmed their details are current. A profile nobody has looked at for
             a year is worse than one that's obviously incomplete, because it reads as true. Sent
             as the date; the site decides what counts as recent, so the rule lives in one place. */
          detailsConfirmed: fmtDate(r.details_confirmed),
          yrsExp: S(r.years_experience),
          // The shape of job they'll accept. Sent as numbers so the booking form can filter on
          // them; 0 means "no limit set", which is treated as no limit rather than as zero.
          // Blank means "no view", and the smallest real booking is one student for one hour.
          minStudents: N(r.min_students) || 1, maxStudents: N(r.max_students),
          minHours: N(r.min_hours) || 1, maxHours: N(r.max_hours),
          extraSeat: N(r.extra_seat_rate),
          focus: S(r.focus).split(/[,\n]/).map(x => x.trim()).filter(Boolean),
          xp: N(r.xp), credits: N(r.credits),
          highscore: N(r.high_score_flappy), ttHighscore: N(r.high_score_tables),
          avail: availGridOut(r.availability),
          /* WHAT THEY ARE ALREADY TEACHING, as the same `m16` codes — so the booking grid can show
             an hour as taken WITHOUT the tutor's own availability having been edited. The cell says
             when they CAN work; this says when they are already working, and keeping the two apart
             is what lets a cancelled session give the hour back on its own. */
          busy: busyHours(personDisplayName(r)),
          teaches: [
            S(r.teaches_1) && (S(r.teaches_1) + (S(r.teaches_1_level) ? ' (' + S(r.teaches_1_level) + ')' : '')),
            S(r.teaches_2) && (S(r.teaches_2) + (S(r.teaches_2_level) ? ' (' + S(r.teaches_2_level) + ')' : '')),
          ].filter(Boolean),
          quals: [1,2,3].map(n => {
            const subj = S(r['qual_' + n]);
            if (!subj) return null;
            const lvl = S(r['qual_' + n + '_level']), grd = S(r['qual_' + n + '_grade']);
            return [subj, lvl, grd && ('grade ' + grd)].filter(Boolean).join(' ');
          }).filter(Boolean),
          extraQuals: S(r.extra_quals),
          actionText: '▶ Watch Intro'
        });
      }
      /* ---------- CHILDREN ARE NOT SENT TO STRANGERS -------------------------------------------
         EVERY STUDENT ON THE SYSTEM WENT TO EVERY PHONE, and to anybody who loaded the site at all
         — name, handle, who their siblings are, who their friends are. A tutor is public and means
         to be; a nine-year-old is not, and this file is careful about it everywhere else: the exam
         dates and the birthdays a few hundred lines below both check `maySee` and go to family
         only. The list of the children themselves had no check whatsoever.

         WHO ACTUALLY NEEDS IT, which turns out to be a short list:
           · an ADMIN, who runs the place
           · a STUDENT, for the friend search — exact handle, and for their own scoreboard
           · a PARENT, for their own children
         A signed-out visitor needs none of it, and neither does a tutor: they see the children they
         teach on the session, by name, which is where a tutor's need actually is.

         THE HANDLE IS THE FRIEND MECHANISM and it stays for the people who use it. `friend-add`
         matches an EXACT handle deliberately — a search that guesses adds the wrong child — so a
         student has to be able to look one up. That is a real need and it is met by sending the
         list to students rather than to the internet. */
      const meRow = S(p.person) ? findPerson('', S(p.person)) : findPerson(S(p.name));
      payload.clients = payload.clients || [];
      const iAmStudent = !!meRow && hasRole(meRow, 'student');
      const iAmParent = !!meRow && hasRole(meRow, 'client');
      const maySeeChildren = viewerIsAdmin || iAmStudent || iAmParent;

      /* ---------- WHO AN ADMIN MAY BOOK ON BEHALF OF ---------------------------------------------
         ADMIN ONLY, AND ONLY A NAME. Somebody rings up and you book it for them — without this the
         receipt says the booking belongs to whoever was holding the phone, which is you.

         NOTHING BUT THE NAME GOES IN THIS LIST. It is the shortest thing that answers the question,
         and a list of every client's email and phone sent on every load is a leak waiting for the
         first person who is accidentally given the admin role. `payload.students` learned that the
         hard way — it went to every visitor until it was caught. */
      if (viewerIsAdmin && (hasRole(r, 'client') || hasRole(r, 'parent'))) {
        /* AND THEIR CHILDREN, so the booking form can ask WHICH of them once a client is chosen.
           Names only — the same rule as the list itself, and for the same reason. */
        payload.clients.push({
          name: personDisplayName(r),
          children: childrenOf(S(r.person_id)).map(personDisplayName),
        });
      }

      /* ---------- CLAIMS WAITING ON THIS PERSON ---------------------------------------------------
         THE WHOLE CLAIM FLOW EXISTED AND HAD NO DOOR. `claimChild` and `answerClaim` are both
         written, both correct, and neither was reachable: nothing in the app called them, and
         nothing sent a pending claim to the child who had to answer it. A parent could not ask and
         a child could not have been asked.

         THEIRS ONLY. A row here is somebody saying "this is my child" — it names a family, so it
         goes to the child it names and nobody else. */
      if (meRow && S(r.person_id) === S(meRow.person_id)) {
        read(TAB.family).rows.forEach(f => {
          if (norm(f.state) !== 'asked') return;
          if (S(f.child_id) !== S(r.person_id)) return;
          const parent = findPerson(S(f.parent_id));
          payload.claims.push({
            rowIndex: f._row,
            from: parent ? personDisplayName(parent) : S(f.parent_id),
            asked: S(f.asked_on),
          });
        });
      }

      if (hasRole(r, 'student') && maySeeChildren) {
        payload.students.push({
          /* From the family tab, by ID. This passed the ROW to a function that wanted an id — the
             row stringified to "[object Object]", matched nobody, and every student on the site
             has had an empty sibling list ever since, in silence. */
          siblings: siblingsOf(S(r.person_id)).map(personDisplayName),
          avatar: S(r.avatar),
          name: S(r.first_name) || name,
          handle: S(r.handle) || S(r.first_name),
          friends: S(r.friends),
          xp: N(r.xp), credits: N(r.credits),
          highscore: N(r.high_score_flappy), ttHighscore: N(r.high_score_tables)
        });
      }
    });

    // --- venues -------------------------------------------------------------------------------
    venuesTab.forEach((r, i) => {
      const title = S(r.name);
      if (!title) return;
      const rate = N(r.cost_per_hour);
      payload.venues.push({
        id: i, type: 'venue', title,
        borough: S(r.borough), city: S(r.city),
        /* WHERE IT IS, as two numbers. Sent as numbers rather than strings because everything that
           uses them does arithmetic — a map projects them, and "51.41" projected is NaN placed at
           the top left corner, which looks like a venue rather than a fault. */
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
        minHours: N(r.min_hours) || 1, maxHours: N(r.max_hours),
        minNoticeDays: N(r.notice_days),
        comfort: S(r.tutors_happy_here).split(/[,\n]/).map(x => x.trim()).filter(Boolean),
        // The rooms in this building, each with its own price and capacity. Empty for a venue
        // that's just one space, which is most of them.
        rooms: read(TAB.rooms).rows
          .filter(x => key(x.venue) === key(r.name) && ON_(x.active))
          .map(x => ({
            rowIndex: x._row, name: S(x.name),
            rate: N(x.rate_per_hour), concession: N(x.concession_rate),
            min: N(x.min_capacity) || 1, max: N(x.max_capacity), notes: S(x.notes),
            /* A room's own opening hours. The building may be open all day while the large room
               is booked out every morning — availability describes the SPACE you hire, not the
               address. Blank falls back to the venue's, so a room nobody has set hours for is as
               available as the building. */
            avail: S(x.availability) ? availGridOut(x.availability) : null,
            fields: ROOM_EDITABLE.reduce((a, f) => { a[f] = S(x[f]); return a; }, {})
          })),
        fields: flat(VENUE_GROUPS).reduce((a, f) => { a[f] = S(r[f]); return a; }, {}),
        avail: availGridOut(r.availability)
      });
      if (S(r.borough)) {
        if (payload.dropdowns.boroughs.indexOf(S(r.borough)) === -1) payload.dropdowns.boroughs.push(S(r.borough));
      }
    });

    /* Only for an admin, and only on request — walking every row costs time, and a client has no
       use for a list of what needs fixing.
       Asked for by the URL: `?health=1`. The payload is built by doGet, which has no `body` — that
       is doPost's — and reaching for one threw and took the entire payload down with it. */
    if (S(p.health) === '1' || viewerIsAdmin) {
      /* THE DRIVE PROBE ONLY WHEN THE REPORT IS ASKED FOR BY NAME. `?health=1` is somebody opening
         the health card on purpose and willing to wait; an ordinary admin load is somebody opening
         the app, and it must not go and write a file to Drive before it can draw anything. */
      try { payload.health.problems = dataProblems(S(p.health) === '1'); }
      catch (err) { payload.health.problems = [{ level: 'check failed', what: String(err), fix: '' }]; }
    }

    /* THE BRANDING, whole. Every row, whether or not the code knows the key — so something added
       to the tab is available to whatever is written next without the backend changing. */
    read(TAB.brand).rows.forEach(r => {
      const k = S(r.key).trim();
      if (k) payload.brand[k] = S(r.value);
    });

    /* ---------- THE CAMPAIGNS, AND THE WORDS THEY SAY -------------------------------------------
       The design comes off `campaigns`; the wording off `copy`, gathered under the campaign it
       belongs to so the phone never has to join two lists itself. Sent to admins only, which is
       who the flyer maker is for — there is no reason for a parent's phone to carry next term's
       advertising copy.

       ONE PASS OVER `copy`, INDEXED BY CAMPAIGN. Reading the tab once per campaign would be eleven
       passes over the same rows to save writing four lines, and this tab will be the longest of the
       two by far — four wordings for eleven campaigns is forty-four rows before anybody gets
       inventive. */
    if (viewerIsAdmin) {
      const words = {};
      read(TAB.copy).rows.forEach(r => {
        if (!ON_(r.active)) return;
        const cid = S(r.campaign_id), slot = S(r.slot).toLowerCase(), text = S(r.text);
        if (!cid || !slot || !text) return;
        (words[cid] || (words[cid] = {}));
        (words[cid][slot] || (words[cid][slot] = []))
          .push({ variant: S(r.variant) || '1', text: text, note: S(r.note) });
      });
      /* SORTED BY THE VARIANT NUMBER, numerically — so 10 comes after 9 rather than after 1, which
         is what sorting them as text would have done the moment somebody wrote a tenth. */
      Object.keys(words).forEach(cid => Object.keys(words[cid]).forEach(slot =>
        words[cid][slot].sort((a, b) => (Number(a.variant) || 0) - (Number(b.variant) || 0))));

      read(TAB.campaigns).rows.forEach(r => {
        if (!ON_(r.active)) return;
        const id = S(r.campaign_id), name = S(r.name);
        if (!id || !name) return;
        payload.campaigns.push({
          id: id, name: name, when: S(r.when), note: S(r.note),
          style: S(r.style), ink: S(r.ink), accent: S(r.accent), ground: S(r.ground),
          blocks: S(r.blocks),
          copy: words[id] || {},
        });
      });
    }

    /* THE LAWS. Sent to every phone, because every screen paints text with them — and they are
       a handful of rows, so the cost of sending them is nothing against the cost of asking. */
    read(TAB.laws).rows.forEach(r => {
      if (!S(r.match) && norm(r.kind) !== 'list') return;
      if (!ON_(r.active)) return;
      payload.laws.push({
        kind: norm(r.kind) || 'word',
        match: S(r.match),
        colour: norm(r.colour) || 'ink',
        weight: N(r.weight) || 0,
      });
    });
    /* Heaviest first, so a specific law beats a general one when both match the same word. */
    payload.laws.sort((a, b) => b.weight - a.weight);

    /* If the tab is empty — a fresh sheet, or somebody cleared it — the four laws that were asked
       for stand in. A site whose subjects stop being green because a tab is empty looks broken in
       a way nobody would connect to a missing row. */
    if (!payload.laws.length) {
      payload.laws = [
        { kind: 'prefix', match: '#', colour: 'blue',      weight: 30 },
        { kind: 'prefix', match: '@', colour: 'blue-soft', weight: 30 },
        /* THREE COLOURS, THREE QUESTIONS, and that is the whole set:
             green  WHAT   the subject
             purple WHERE  the venue
             red    WHO    the tutor
           They are the three facts a booking is assembled from and the three you scan a list for.
           A fourth would make this a legend, and a legend is what colour is meant to replace.

           RED WAS THE CLIENT'S and cannot be both — two lists in one colour is worse than neither
           being coloured, because the eye learns a rule that is false half the time. A client's
           name is a private detail inside a caption rather than a category anybody scans for, so
           it goes dim: still marked as a name, no longer competing with the three things somebody
           is actually looking for. */
        { kind: 'list',   match: 'subjects', colour: 'green',  weight: 20 },
        /* THE LEVEL, pink. The fourth fact a booking is made of and the last one still uncoloured:
           WHAT is green, WHERE is purple, WHO is red, and AT WHAT LEVEL was plain text sitting
           between them. `wearables` had pink and has moved to blue-soft — a hat is worth a colour
           on the shop screen and not one of the four things somebody scans a booking for. */
        { kind: 'list',   match: 'levels',   colour: 'pink',   weight: 20 },
        { kind: 'list',   match: 'wearables', colour: 'blue-soft', weight: 15 },
        { kind: 'list',   match: 'venues',   colour: 'purple', weight: 20 },
        { kind: 'list',   match: 'tutors',   colour: 'red',    weight: 20 },
        { kind: 'list',   match: 'clients',  colour: 'dim',    weight: 10 },
      ];
    }

    /* THE POSTS, with their likes counted and yours marked.
       Counted here rather than sent as a list of likers: the front of the app needs a number and
       one boolean, and shipping every like to every phone would be sending a hundred rows to
       answer "did I press this". */
    {
      /* ---------- NOTHING HERE TOUCHES DRIVE -------------------------------------------------
         `fillPostNames_` was called here, and it made up to six Drive calls INSIDE somebody's page
         load — the only network round trip in the whole payload, on every single visit, to look up
         filenames for posts that had none.

         It existed so a post with no caption could fall back to what its file is called. That is a
         nice thing and it is not worth a request to another Google service on every load: the
         caption is a column, the sheet is the database, and a post with no caption should simply
         have no caption until somebody types one or the scan records the name.

         The scan still records `file_name` when it runs, and the payload below still prefers a
         typed caption and falls back to that name. What is gone is the fetching — so the posts
         are now read entirely from the sheet, like everything else on this screen. */
      const votes = read(TAB.post_votes).rows;
      const reacts = read(TAB.post_reactions).rows;

      const me = S(p.person);

      /* Who posted it, and their face. Built once as a lookup rather than searched per post —
         fifteen people and ten posts is nothing, but a hundred posts against a growing people
         list is a hundred scans of it for no reason. */
      const faces = {};
      /* And the same people keyed by ID, for the likes — which know a person_id and not a name.
         Built in the same pass: a lookup inside the post loop would read the people tab once per
         like, which is two hundred reads of one table to draw one sentence. */
      const byId = {};
      read(TAB.people).rows.forEach(pp => {
        const nm = personDisplayName(pp);
        if (!nm) return;
        faces[key(nm)] = {
          handle: S(pp.handle) || S(pp.username) || S(pp.first_name) || nm,
          avatar: S(pp.avatar) || S(pp.photo),
        };
        if (S(pp.person_id)) byId[S(pp.person_id)] = nm;
      });
      read(TAB.posts).rows.forEach(r => {
        if (!S(r.post_id)) return;
        /* A DELETED POST STILL GOES TO AN ADMIN, marked. It has to: deleting is a flag, and
           something invisible cannot be switched back on from the phone — which would make the
           control worse than not having one. The same rule the tutor `listed` switch follows. */
        const live = ON_(r.active);
        if (!live && !viewerIsAdmin) return;

        /* ---------- WHO SEES A POST THAT IS WAITING ----------------------------------------------
           Three answers, and they are three different people:

             AN ADMIN sees it, marked, because approving it is the whole point and something
                      invisible cannot be approved.
             WHOEVER POSTED IT sees it, marked, because a photograph that vanishes on being posted
                      reads as the app having eaten it — and then they post it again.
             EVERYBODY ELSE does not, which is the entire mechanism.

           A REFUSED one goes to the admin only. The person who posted it has already been told by
           email; leaving it on their own feed under a red word is a telling-off they get every
           time they open the app. */
        const state = norm(r.approved);
        const waiting = state === 'pending';
        const refused = state === 'refused';
        const mine = S(p.person) && S(r.author) && findPerson(S(r.author))
          && S(findPerson(S(r.author)).person_id) === S(p.person);
        if (refused && !viewerIsAdmin) return;
        if (waiting && !viewerIsAdmin && !mine) return;
        /* An author who is not in the people list still gets a name — the one typed in the row.
           A post from somebody who has since left should not become anonymous.
           An author who is not a person is the business itself — a post with no author, or one
           signed "@family.". It gets the brand's square mark, so the feed is never a column of
           blank circles. */
        const who = faces[key(S(r.author))]
          || { handle: S(r.author) || '@family.', avatar: '' };
        if (!who.avatar && !faces[key(S(r.author))]) {
          who.avatar = S(payload.brand.logo_square) || S(payload.brand.logo_circle);
        }

        payload.posts.push({
          id: S(r.post_id),
          author: S(r.author),
          handle: who.handle,
          avatar: who.avatar,
          image: S(r.image),        // converted on the phone, the way the gallery already does it
          /* THE CAPTION, RESOLVED HERE AND NOWHERE ELSE.
             Two columns, two owners, and no rule about who may overwrite whom:
               `caption`   what a PERSON typed. Only ever written by editPost.
               `file_name` what the FILE is called. Only ever written by the scan.
             The one you see is the typed one if there is one, and the file's name otherwise.

             This replaces a comparison — take the name only if the caption still equals the name
             it was taken from last time — which needed both columns kept in step, a "recaptioned"
             count, a button to trigger it, and got the answer wrong whenever any of that drifted.
             Nothing is copied between them now, so nothing can be out of step. Rename the file and
             the caption follows because it was never a copy; type a caption and it wins because it
             is checked first. */
          caption: S(r.caption) || captionFromName_(S(r.file_name)),
          body: S(r.body),
          location: S(r.location),
          when: fmtDate(postWhen_(r)),
          /* THE TIMESTAMP, in milliseconds. `when` is a day, which is enough to print and not
             enough to sort or to say "three hours ago" with: two posts from the same afternoon
             tie on the day and fall back to sheet order, which is no order at all. */
          at: postWhen_(r) ? postWhen_(r).getTime() : 0,
          pinned: TRUE_(r.pinned),
          /* Sent so an admin can SEE which ones are switched off, and switch one back. Everyone
             else never receives an inactive post, so the flag is always true for them. */
          active: live,
          /* AND WHETHER IT IS WAITING. The phone draws the mark and the buttons from this; nobody
             who should not see it has been sent it at all, so a stale copy in a browser cannot
             leak one. */
          waiting: waiting,
          refused: refused,
          approvedBy: S(r.approved_by),
          /* THE POLL. Options split from the cell, counts from the votes tab, and which one is
             yours — everything the phone needs to draw it without a second request. */
          poll: (function () {
            const opts = S(r.poll).split(',').map(x => x.trim()).filter(Boolean);
            if (!opts.length) return null;
            const cast = votes.filter(v => S(v.post_id) === S(r.post_id));
            const tally = {};
            opts.forEach(o => { tally[o] = 0; });
            cast.forEach(v => {
              const c = S(v.choice);
              /* A vote for an option since removed is counted for nobody rather than crashing —
                 the options are a cell somebody can edit after people have voted. */
              if (tally[c] !== undefined) tally[c]++;
            });
            const mineVote = me ? cast.find(v => S(v.person_id) === me) : null;
            return {
              options: opts,
              counts: opts.map(o => tally[o]),
              total: cast.length,
              yours: mineVote ? S(mineVote.choice) : '',
            };
          })(),
          /* REACTIONS — and they are now the ONLY thing a person presses on a post.
             The heart is gone: a like is a reaction with one option, so having both meant two
             counts of the same gesture and a heart sat next to a 👍 competing with it.

             What is on offer, how many of each, which is yours, and WHO. The set comes from
             `reactionSet` — this post's own column, then the brand tab, then the six in the code
             — so there is always something to draw. */
          reactions: (function () {
            const emoji = reactionSet(r);
            if (!emoji.length) return null;
            const cast = reacts.filter(x => S(x.post_id) === S(r.post_id));
            const yours = me ? cast.find(x => S(x.person_id) === me) : null;
            return {
              emoji: emoji,
              /* Counted per emoji, because the phone needs a number under each face. */
              counts: emoji.map(x => cast.filter(c => S(c.emoji) === x).length),
              total: cast.length,
              yours: yours ? S(yours.emoji) : '',
              /* WHO, AND WITH WHAT. Names rather than ids — a reaction is a public thing and an id
                 is not, and a list of P17390421 tells nobody anything.
                 Capped at forty: the counts above are the numbers, this is the list behind them,
                 and shipping four hundred rows to answer "who reacted" would be sending a database
                 to draw a sentence. */
              by: cast.slice(0, 40).map(x => ({
                name: byId[S(x.person_id)] || '', emoji: S(x.emoji),
              })).filter(x => x.name),
            };
          })(),
          rowIndex: r._row,
        });
      });
      /* Pinned first, then newest. A feed in sheet order is a feed in whatever order somebody
         happened to type things, which is no order at all — and after a folder scan that order is
         Drive's, which put February between two days in June. */
      payload.posts.sort((a, b) => (b.pinned - a.pinned) || (b.at - a.at));
    }

    read(TAB.widgets).rows.forEach(r => {
      if (!S(r.key)) return;
      if (!ON_(r.active)) return;
      payload.widgets.push({
        key: S(r.key),
        name: S(r.name) || S(r.key),
        blurb: S(r.blurb),
        section: norm(r.section) || 'tools',
        search: S(r.search),
        order: N(r.sort_order),
        roles: S(r.roles),
        rowIndex: r._row,
      });
    });
    payload.widgets.sort((a, b) => (a.order || 99) - (b.order || 99));

    /* EXAMS AND BIRTHDAYS — the two things a calendar has to know about a person. Sent with the
       payload rather than fetched separately: a student's exam dates are the size of a sentence,
       and a second round trip for them would cost more than carrying them.

       WHOSE. This block used to send EVERY exam to EVERY phone — fifteen accounts each receiving
       a list of which child sits which paper on which morning. An exam date belongs to the
       student, to their family, and to you. Nobody else.

       A BIRTHDAY IS DAY AND MONTH ONLY. The year is on the row and is deliberately not sent: a
       full date of birth is a child's age, and a calendar needs to know when to say happy
       birthday rather than how old somebody is turning. It also has no year BY DESIGN — it
       happens every year, and a date that appears once is a date somebody misses. */
    {
      const meId = S(p.person);
      /* Your own family, as BOTH SIDES have agreed it. A claim nobody answered is a request and
         not a relationship, so it opens nobody's diary. */
      const family = meId ? [meId]
        .concat(acceptedChildren(meId).map(x => S(x.person_id)))
        .concat(acceptedParents(meId).map(x => S(x.person_id)))
        .concat(siblingsOf(meId).map(x => S(x.person_id))) : [];
      const maySee = id => viewerIsAdmin || (S(id) && family.indexOf(S(id)) !== -1);

      read(TAB.exams).rows.forEach(r => {
        if (!S(r.person_id) || !S(r.exam_date)) return;
        if (!ON_(r.active)) return;
        if (!maySee(r.person_id)) return;
        const who = findPerson(S(r.person_id));
        payload.exams.push({
          id: S(r.exam_id), personId: S(r.person_id),
          who: who ? personDisplayName(who) : '',
          subject: S(r.subject), label: S(r.label),
          date: fmtDate(r.exam_date), kind: norm(r.kind) === 'mock' ? 'mock' : 'exam',
          board: S(r.board), rowIndex: r._row,
        });
      });

      read(TAB.people).rows.forEach(r => {
        const d = sheetDate(r.date_of_birth);
        if (!d) return;
        if (!maySee(r.person_id)) return;
        payload.birthdays.push({
          name: personDisplayName(r),
          day: d.getDate(), month: d.getMonth() + 1,
        });
      });
    }

    /* ORDERS. Yours, or everybody's if you are the admin who has to print them.
       A print order is work that happens over days — printed, put in an envelope, posted — so the
       person who asked needs to see where it has got to, and you need a list of what to do. */
    {
      const meId = S(p.person);
      read(TAB.orders).rows.forEach(r => {
        if (!S(r.order_id)) return;
        if (!viewerIsAdmin && (!meId || S(r.person_id) !== meId)) return;
        const owner = findPerson(S(r.person_id));
        payload.orders.push({
          id: S(r.order_id), rowIndex: r._row,
          personId: S(r.person_id),
          who: owner ? personDisplayName(owner) : '',
          item: S(r.item), resource: S(r.resource),
          ticks: N(r.cost_ticks), pages: N(r.pages),
          cost: N(r.cost_pence) / 100,
          delivery: norm(r.delivery) || 'collect',
          state: norm(r.state) || 'asked',
          askedOn: fmtDate(r.asked_on), postedOn: fmtDate(r.posted_on),
          /* Only the admin doing the posting needs the address, and only while it is unposted.
             It is a child's home address; sending it anywhere it is not needed is the sort of
             thing that is fine until it is not. */
          address: viewerIsAdmin ? S(r.address) : '',
          notes: S(r.notes),
        });
      });
    }

    read(TAB.trips).rows.forEach(r => {
      if (!S(r.name)) return;
      // An `active` of blank counts as active: a trip nobody has marked either way is one you've
      // just added, not one you've retired.
      if (!ON_(r.active)) return;
      payload.trips.push({
        id: r._row, rowIndex: r._row,
        name: S(r.name),
        focus: S(r.focus).split(/[,\n]/).map(x => x.trim()).filter(Boolean),
        description: S(r.description), image: S(r.photo), link: S(r.link),
        provider: S(r.provider),
        pricePerChild: N(r.price_per_child), hours: N(r.hours),
        minChildren: N(r.min_children), maxChildren: N(r.max_children),
        venue: S(r.venue), address: S(r.address),
        date: fmtDate(r.date), noticeDays: N(r.notice_days),
        notes: S(r.notes),
        fields: TRIP_EDITABLE.reduce((a, f) => { a[f] = S(r[f]); return a; }, {})
      });
    });

    /* THE FESTIVE EVENTS, if the date says so. Sent to everybody: that is the point of them. */
    /* ---------- WHAT A WAITING-LIST SEAT COSTS, WORKED OUT HERE --------------------------------
       THE BROWSER CANNOT DO THIS SUM. It needs three config numbers — how many seats, the open
       tutor rate, the charge for each extra seat — and the config never went to the phone at all.
       My first attempt read `DATA.config`, which does not exist; sending the raw numbers so the
       browser can redo the arithmetic would be the same sum written twice, in two languages, free
       to drift apart.

       SO THE ANSWER TRAVELS, NOT THE INGREDIENTS. One figure per venue, from `waitlistPrice` —
       the same function `joinWaitlist` charges against, so the card and the receipt cannot
       disagree. Null where a venue has no rate set, which the card reads as "not priceable yet". */
    try {
      payload.waitlistSeat = {};
      read(TAB.venues).rows.forEach(v => {
        const w = waitlistPrice(S(v.name));
        if (w) payload.waitlistSeat[S(v.name)] = {
          perHour: w.perSeatHour, perSession: w.perSeatSession,
          seats: w.seats, hours: w.hours,
        };
      });
    } catch (err) { payload.waitlistSeat = {}; }

    /* WHAT THIS PERSON HAS STARRED. Theirs only — a favourite is a private thing and there is no
       screen anywhere that wants somebody else's. Sent as the bare keys, which is the shape the
       Find screen already holds them in. */
    try {
      const meFav = S(p.person) ? findPerson('', S(p.person))
                  : (S(p.name) ? findPerson(S(p.name)) : null);
      payload.favourites = meFav
        ? read(TAB.favourites).rows
            .filter(r => key(r.person_id) === key(meFav.person_id))
            .map(r => S(r.item_id))
        : [];
    } catch (err) { payload.favourites = []; }

    try { payload.festive = festiveOffers(); }
    catch (err) { payload.festive = []; }

    /* WHICH LOADING SPLASHES HAVE BEEN RETIRED. Sent as the ones that are OFF rather than the ones
       that are on, so a splash added in code and never entered in the sheet still appears — the
       sheet is a list of exceptions, not a whitelist somebody has to keep in step with the markup.
       Wrapped, because the tab may not exist until `?setup=1` has been run. */
    try {
      const sp = read(TAB.splashes);
      payload.splashOff = sp.sheet
        ? sp.rows.filter(r => S(r.splash_id) && !ON_(r.active))
                 .map(r => 'is-' + norm(r.splash_id))
        : [];
    } catch (err) { payload.splashOff = []; }

    /* WHATEVER CAMPAIGN IS RUNNING TODAY. Passed the viewer, because a campaign can be aimed at a
       role — a results-day message means nothing to a tutor — and filtering here rather than in the
       browser means an audience the viewer is not in never reaches them at all.

       WRAPPED, like the festive block above it. A campaigns tab that has not been created yet must
       not take the whole app down with it, and `?setup=1` may not have been run since this shipped. */
    /* --- landmarks: buildings measured by hand ------------------------------------------------
       Small enough to ride here — a name and six numbers each — where the fetched OSM geometry is
       megabytes and stays behind `?map=`. */
    payload.landmarks = landmarks();

    // --- terms -> intervals -------------------------------------------------------------------
    /* ---------- FROM THE COMPUTED YEAR, NOT STRAIGHT OFF THE TAB ---------------------------------
       THIS READ THE TERMS TAB RAW, and that tab has four rows in it, two named the same thing, one
       ending before it starts. So a waiting list opened in August 2026 was offered "Summer 2 2027"
       as the term it was for — a year out, from data I audited as broken hours ago and then never
       connected to the thing that reads it.

       `termsFor` ALREADY SOLVES THIS and nothing was calling it: the sheet's rows where somebody
       has entered them, the computed school year everywhere else. One source, and a tab with four
       bad rows in it stops being able to send a booking a year into the future. */
    const yNow = (new Date()).getMonth() >= 7
      ? (new Date()).getFullYear() : (new Date()).getFullYear() - 1;
    /* ---------- ONE OF EACH NAME, AND ONLY WHAT IS STILL TO COME -------------------------------
       SENDING TWO SCHOOL YEARS SENT EVERY NAME TWICE — "Autumn 2" appeared for 2026 and again for
       2027 — and anything looking a term up by its name found the later one. A list opened in
       August 2026 came out as Autumn 2 running November 2027, a year and a bit out.

       Two years are still needed, because a list opened in July is for the September after it. But
       a term that has already ENDED cannot be booked, and once the past ones are dropped each name
       appears once inside the next twelve months, which is the only span anybody is booking in. */
    const nowMs = Date.now();
    const yearOut = nowMs + 370 * 864e5;
    const computed = termsFor(yNow).concat(termsFor(yNow + 1))
      .filter(c => c.end.getTime() >= nowMs && c.start.getTime() <= yearOut);
    computed.forEach(c => {
      /* SHAPED LIKE A SHEET ROW, so everything below reads the same fields either way. */
      const r = { term_name: c.name, start_date: c.start, end_date: c.end,
                  kind: c.kind, _row: 0 };
      // A term is bookable if it has a name and an end date. `relative_name` only decides how it's
      // labelled — using it as the filter hid every term nobody had labelled.
      if (!S(r.term_name) || !(S(r.end_date) || S(r.last_sunday))) return;
      // An interval whose dates leave no room for a session isn't bookable — usually because its
      // start is after its end. Offering it and pricing one session hid that error completely.
      // No whole teaching week inside it means it can't be booked.
      const win = operatingWindow(r.start_date, r.end_date);
      if (!win) return;
      payload.intervals.push({
        /* WHERE IT SITS, worked out from the dates rather than typed. A term is "next" because
           it starts after the one running now — that is a fact about today, and today moves.
           Typing it into a cell meant somebody re-typing four cells every half term, and the rows
           drifted out of step with their own dates the moment nobody did. */
        rel: relativeName(r.start_date, r.end_date, read(TAB.terms).rows),
        term: S(r.term_name),
        kind: intervalKind(r.kind, r.term_name),
        /* The OPERATING window, not the interval's own dates: teaching runs in whole weeks from
           the first Monday to the last Sunday inside it. Sent computed so the site doesn't repeat
           the rule — the frontend having its own copy is why it once offered a different set of
           intervals from the backend.
           Computed ONCE now. operatingWindow was called five times per term for five fields, each
           re-deriving the same window from the same two cells. */
        weeks: win.weeks || 0,
        // Says its dates are the wrong way round, so an admin sees WHY two terms look alike.
        dateFault: !!win.dateFault,
        opensOn: fmtDate(win.first),
        closesOn: fmtDate(win.last),
        /* ONLY a display_name somebody wrote. Building one from term_name + relative_name meant
           the sheet's own bookkeeping — "Current Academic Interval - week" — went straight onto
           the booking form, and the site's tidier wording could never win because this was set. */
        label: S(r.display_name),
        /* The dates a client books between are the operating ones. The interval's own start and
           end stay in the sheet as the school's dates; nothing prices from them. */
        startDate: fmtDate(win.first) || fmtDate(r.start_date),
        endDate: fmtDate(win.last) || fmtDate(r.end_date),
        lastSun: fmtDate(r.last_sunday)
      });
    });

    // --- links --------------------------------------------------------------------------------
    read(TAB.links).rows.forEach((r, i) => {
      const title = S(r.name);
      if (!title) return;
      const category = S(r.category) || 'General';
      if (payload.dropdowns.linkCategories.indexOf(category) === -1) payload.dropdowns.linkCategories.push(category);
      payload.links.push({ id: r._row, rowIndex: r._row, title, category, url: S(r.url),
                           colour: S(r.colour),
                           description: S(r.description), image: S(r.photo),
                           fields: LINK_EDITABLE.reduce((a, f) => { a[f] = S(r[f]); return a; }, {}) });
    });

    /* The shop holds both kinds of stock, but wearables only exist as rows once they've been
       seeded — so a freshly deployed site showed one bike and nothing else, which looks exactly
       like the two kinds not sharing a nature after all.
       Seeding itself rather than waiting to be asked. Guarded on there being NO wearables at all,
       so deleting one doesn't bring it back on the next load; only an empty catalogue refills. */
    /* AND THIS ONE REBUILT THE WHOLE SCHEMA MID-PAYLOAD.
       The condition is "the shop has no wearables in it", which stays true until the seeding
       works — so on a sheet where it cannot work, every single page load walked thirty tabs,
       appended columns, re-checked every header, gave four hundred resources an id and rewrote the
       options tab, in the middle of building a payload somebody was waiting for.

       `ensureSchema` was there because `seedAvatarItems` needs a `kind` column. That is a SETUP
       problem with a setup answer — `?setup=1`, which exists and says so — and taking seconds out
       of every visitor's load to solve it is paying the wrong person.

       THE SEEDING STAYS, because it is cheap and it fixes a real thing: a fresh sheet shows one
       bike and no wearables at all. It just no longer drags the schema along behind it, and it
       only runs when the column it needs is already there. */
    const shopTab = read(TAB.shop);
    if (shopTab.sheet && shopTab.headers.indexOf('kind') >= 0
        && !shopTab.rows.some(r => norm(r.kind) === 'avatar')) {
      seedAvatarItems();
      clearCache();
    }

    // --- shop -------------------------------------------------------------------------------
    // One list, one shape. A wearable carries a slot and an art_id; a bike doesn't. Everything
    // else about them is identical, which is why they're one tab and one editor.
    read(TAB.shop).rows.forEach(r => {
      if (!S(r.name)) return;
      /* THE SAME THREE WORDS AS A RESOURCE. The sheet says `avatar`; everything downstream says
         `wearable`, because that is what it is to a person looking at one — and because a
         vocabulary that needs translating halfway along is two vocabularies.
         `kindRaw` keeps the sheet's own word, so the wardrobe code that filters on `avatar` and
         the shop editor that writes it are untouched. */
      const kind = norm(r.kind) === 'avatar' ? 'wearable' : 'thing';
      payload.shop.push({
        id: r._row, rowIndex: r._row, kind, kindRaw: norm(r.kind) || 'thing',
        /* Against the word that is now set, not the one that used to be. `kind` became `wearable`
           two lines up and this still asked for `avatar`, so every wearable would have been priced
           in pounds. Caught by grepping for the old word rather than by anything failing — which
           is the whole risk in renaming a value that is compared in six places. */
        name: S(r.name), price: S(r.price), unit: S(r.currency) || (kind === 'wearable' ? '🪙 ' : '£'),
        level: N(r.level_required) || 0,
        slot: S(r.slot), artId: S(r.art_id),
        description: S(r.description), image: S(r.photo),
        inStock: ON_(r.in_stock),
        fields: SHOP_EDITABLE.reduce((a, f) => { a[f] = S(r[f]); return a; }, {})
      });
    });

    /* --- questions --------------------------------------------------------------------------
       ONE ROW PER PART, plus a stem row per question. Sent as one flat list rather than nested
       under their papers, because the Find screen filters a flat list and nesting would mean
       flattening it again on the phone.

       ONLY IF THE TAB EXISTS. A sheet that has not had `?setup=1` run on it has no questions tab,
       and `read` on a missing tab throws — which would take the whole payload down and leave the
       app behind a splash for ever. The one thing worse than a missing feature is a missing app.

       `html` AND `lead` TRAVEL WHOLE. They are the question; there is nothing to summarise. */
    try {
      read(TAB.questions).rows.forEach(r => {
        if (!S(r.row_id) || !ON_(r.active)) return;
        payload.questions.push({
          id: S(r.row_id), paper: S(r.paper_id),
          q: S(r.question), part: S(r.part), kind: norm(r.kind) || 'part',
          section: S(r.section), marks: N(r.marks),
          figure: S(r.figure), lead: S(r.lead), html: S(r.html),
          /* BLANK ON A PART, filled on a paper row. Ten empty strings per part is the price of a
             paper that needs no resource row — and the phone throws them away in one pass. */
          name: S(r.name), subject: S(r.subject),
          resourceType: S(r.resource_type), keystage: S(r.key_stage),
          bandType: S(r.band_type), bandValue: S(r.band_value),
          tier: S(r.tier), examBoard: S(r.exam_board),
          examWave: S(r.exam_wave), year: S(r.year),
        });
      });
    } catch (err) { payload.questions = []; }

    /* --- boxers ---------------------------------------------------------------------------------
       SAME GUARD AS THE QUESTIONS TAB. A sheet that has not had `?setup=1` run on it has no boxers
       tab, and `read` on a missing tab throws — which would take the whole payload down over a
       feature nobody has switched on yet. */
    try {
      read(TAB.boxers).rows.forEach(r => {
        if (!S(r.name) || !ON_(r.active)) return;
        payload.boxers.push({
          id: S(r.boxer_id), name: S(r.name), nickname: S(r.nickname),
          sex: S(r.sex), country: S(r.country), bornIn: S(r.born_in), stance: S(r.stance),
          dob: S(r.dob), dod: S(r.dod),
          heightCm: N(r.height_cm), reachCm: N(r.reach_cm),
          divisions: S(r.divisions), bestDivision: S(r.best_division),
          activeFrom: S(r.active_from), activeTo: S(r.active_to), status: S(r.status),
          wins: N(r.wins), winsKo: N(r.wins_ko),
          losses: N(r.losses), lossesKo: N(r.losses_ko),
          draws: N(r.draws), noContests: N(r.no_contests), recordAsOf: S(r.record_as_of),
          worldTitles: S(r.world_titles), lineal: ON_(r.lineal), hallOfFame: ON_(r.hall_of_fame),
          ringRank: S(r.ring_rank),
          promoter: S(r.promoter), trainer: S(r.trainer),
          notableWins: S(r.notable_wins), notableLosses: S(r.notable_losses),
          image: S(r.image), notes: S(r.notes),
        });
      });
    } catch (err) { payload.boxers = []; }

    /* THE BOUTS. Same guard as the boxers above: a site whose sheet predates this tab has no such
       tab, and `read` on one that is not there throws — which would take the entire payload down
       over a feature nobody has switched on yet.

       SORTED OLDEST FIRST, because a rivalry only reads correctly in order — the second fight is
       an answer to the first. Sorted here rather than on the phone so every screen that shows them
       agrees without each one remembering to. */
    try {
      read(TAB.fights).rows.forEach(r => {
        if (!ON_(r.active)) return;
        const a = S(r.boxer_a), b = S(r.boxer_b);
        if (!a || !b) return;
        payload.fights.push({
          id: S(r.fight_id), rivalryId: S(r.rivalry_id),
          boutNo: N(r.bout_no), boutTotal: N(r.bout_total), series: S(r.series),
          event: S(r.event_name),
          aId: S(r.boxer_a_id), a: a, bId: S(r.boxer_b_id), b: b,
          /* THE DATE IS A DATE CELL AND ARRIVES AS A TIMESTAMP. Cut to the day here, once, rather
             than by every screen that shows it — the exam wave column taught this the hard way,
             where a cell meaning "June 2018" reached the phone as sixty characters of clock and
             timezone and got drawn on a filter button exactly as it arrived. */
          date: S(r.date).slice(0, 10),
          venue: S(r.venue), city: S(r.city), country: S(r.country),
          division: S(r.division), titles: S(r.titles), rounds: N(r.scheduled_rounds),
          result: S(r.result), winnerId: S(r.winner_id), winner: S(r.winner),
          method: S(r.method), endRound: N(r.end_round),
          scorecards: S(r.scorecards), attendance: S(r.attendance), notes: S(r.notes),
          video: S(r.video_url) || S(r.video_search_url),
          verified: ON_(r.verified),
        });
      });
      payload.fights.sort((x, y) => String(x.date).localeCompare(String(y.date)));
    } catch (err) { payload.fights = []; }

    // --- resources -> checklists --------------------------------------------------------------
    /* The nest the checklist needs: subject, then band, then topics. The SHOP screen wants them
       flat and flattens them itself on the phone — carrying the same four hundred rows twice to
       satisfy both would be a waste of every phone's morning. */
    read(TAB.resources).rows.forEach((r, i) => {
      const name = S(r.name);
      if (!name) return;
      /* A deleted resource still reaches an admin, marked, for the same reason a deleted post
         does: it is the only way to switch one back on from the phone. */
      const live = ON_(r.active);
      if (!live && !viewerIsAdmin) return;
      const subject = S(r.subject) || 'Other';
      const band = S(r.band_value);
      const d = payload.dropdowns;
      if (d.topics.indexOf(name) === -1) d.topics.push(name);
      d.checklists[subject] = d.checklists[subject] || {};
      d.checklists[subject][band] = d.checklists[subject][band] ||
        { bandField: S(r.band_type), topics: [] };
      const pages = N(r.pages);
      d.checklists[subject][band].topics.push({
        /* THE ID. Every lookup on the phone was matching on the name, and two subjects can both
           have "Quadratics" — reading the wrong one is invisible, deleting the wrong one is not. */
        id: S(r.resource_id),
        name, rowIndex: r._row, link: S(r.link),
        trackable: TRUE_(r.trackable),
        resourceType: S(r.resource_type),
        /* BOTH HALVES, as well as the split. `grade` and `stage` are the same column read two
           ways — useful for a checklist, which shows one or the other — and they threw away WHICH
           it was, so nothing downstream could filter on the distinction.
           Sent whole as well, because "band type" is a question somebody now asks directly. */
        bandType: S(r.band_type),
        bandValue: band,
        day: S(r.day), month: S(r.month), year: S(r.year),
        /* WHAT IT COSTS, if anything. Blank means free, which is what every resource is today —
           so this changes nothing until somebody prices one, and then it needs no code. */
        price: N(r.price) || 0,
        currency: S(r.currency) || 'credits',
        level: N(r.level_required) || 0,
        /* ONE WORD FOR WHAT SORT OF THING THIS IS, across both tabs:
             resource   something to read or print
             wearable   something a figure wears
             thing      an object that gets posted or collected
           `resource_type` is the sub-type — Past paper, Worksheet — and stays its own question.
           A category and a type are different, and one column answering both is the reason
           `groupOf` had to guess. */
        kind: 'resource',
        grade: S(r.band_type) === 'grade' ? band : '',
        stage: S(r.band_type) === 'stage' ? band : '',
        keystage: S(r.key_stage), examBoard: S(r.exam_board), company: S(r.company),
        tier: S(r.tier),
        paper: TRUE_(r.print_required),
        printout: TRUE_(r.print_required) ? 'Print out' : '',
        examWave: S(r.exam_wave),
        /* THE FILE IS FREE. These describe a PAPER copy, which is not the resource — it is paper,
           toner and a trip to the post office. `pages` is the cached count; `printPrice` is what
           it comes to; `printable` is whether it is offered at all, which the page count cannot
           decide on its own. A null price means nobody has counted it, and the phone says so
           rather than offering it at £0.00. */
        pages: pages,
        printable: canPrint(r),
        printPrice: printPrice(r.pages),
        active: live,
        tick1: S(r.ticks_1), tick2: S(r.ticks_2), tick3: S(r.ticks_3)
      });
    });
    mark('lists');

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

      /* ---------- WHAT A STRANGER MAY SEE OF SOMEBODY ELSE'S BOOKING ---------------------------
         EVERY SIGNED-IN PERSON HAS BEEN SENT EVERY JOB, with the roster on it — so a family could
         read who else was being taught, when, and where. That was true before anybody could join;
         adding a way in would have made it a feature rather than an oversight.

         Three cases:
           YOURS, or one you teach — everything, as before.
           OPEN, and not yours — the shape of it: subject, level, when, where, what it costs, how
                 many seats are going. Enough to decide whether to ask, and not one name.
           NOT OPEN, and not yours — not sent at all. A booking that is not on offer is nobody's
                 business but the family's and yours.

         An admin sees the lot, because somebody has to. */
      const iAmIn = viewerIsAdmin
        || cs.some(c => key(c.name) === key(S(p.name)))
        || ts.some(t2 => key(t2.name) === key(S(p.name)));
      const openToOthers = TRUE_(j.open_to_others);
      const seatsGoing = Math.max(0, maxKids - cs.length);
      if (!iAmIn && !(openToOthers && seatsGoing > 0)) return;

      payload.clientClasses.push({
        id: jobId, rowIndex: j._row, type: 'job',
        /* SAID PLAINLY so the phone does not have to work it out — and so it cannot work it out
           wrongly and offer a join on something that is not open. */
        /* WHICH KIND OF THING THIS IS, and it was not being sent at all. `kind` has been on the jobs
           tab since the waitlist was built and the payload never carried it — so every waitlist
           arrived at the phone indistinguishable from an ordinary booking. The card drew as an
           application, the join button offered to ask the family who booked it, and the seat price
           never came into it. The column existed, the handler existed, and the one line joining
           them did not.
           Blank means an ordinary session, the same way it does in the sheet. */
        kind: norm(j.kind) || '',
        /* AND WHAT A SEAT COSTS, for a class. `price_total` on a waitlist holds the PER-SEAT figure
           — see `joinWaitlist` — so somebody looking at a class they have not joined can be shown
           what joining would cost before they decide. */
        openToOthers: openToOthers,
        seatsGoing: seatsGoing,
        /* WHEN THE PEOPLE ON THE LIST CAN COME, gathered and counted — see `waitlistWhen`. Each
           family answered for THEMSELVES when they joined, and until now those answers sat in four
           separate event messages that nothing read back. The one question a tutor has to answer
           is what day suits everybody, and it could only be answered by reading the log by hand.

           ONLY FOR A WAITING LIST, and only computed for one: an ordinary session already has a
           day, so there is nothing to work out and no reason to walk its events on every load. */
        whenCould: norm(j.kind) === 'waitlist' ? waitlistWhen(jobId) : null,
        canAsk: !iAmIn && openToOthers && seatsGoing > 0,
        status: jobStatusOf(jobId),
        subject: S(j.subject), level: S(j.level), service: S(j.service),
        title: (S(j.level) + ' ' + S(j.subject)).trim(),
        subtitle: (S(j.weekday) || 'TBD') + ' @ ' + (fmtTime(j.start_time) || 'TBD'),
        day: S(j.weekday), time: fmtTime(j.start_time),
        location: S(j.venue) || 'Online',
        /* WHAT A SEAT COSTS. A class row carried no price at all — so the card read `j.price`,
           found nothing, and printed "Your seat  £0.00" on a list that is priced perfectly well in
           the sheet. `price_total` on a waitlist holds the PER-SEAT figure, deliberately, which is
           exactly what a seat costs and exactly what this row wants. */
        price: N(j.price_total),
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
        /* THE CHILDREN, as a list. The roster puts a name on a seat and says "Child" for the rest,
           so a tutor opening a session knows who to expect. */
        forChildren: iAmIn
          ? S(j.for_children).split(/[,\n]/).map(x => x.trim()).filter(Boolean) : [],
        /* The TUTOR is not private — who teaches a session is the thing somebody deciding whether
           to join most wants to know, and every tutor is already listed publicly. */
        requestedTutor: (confirmedTutor && confirmedTutor.name) || 'No preference',
        tutorStatus: tutorStatusOf(jobId),
        stealable: TRUE_(j.stealable),
        // Emitted in the shape the frontend already reads, so nothing there had to change. The
        // numbering is presentational now — there are no fixed slots behind it.
        /* NO NAMES TO SOMEBODY WHO IS NOT IN IT. The seats are still there — the point is how many
           are going — but each is a seat rather than a person. */
        slots: cs.map((c, i) => ({ n: i + 1,
                                   client: iAmIn ? c.name : '', status: c.status, chat: '' })),
        tutorSlots: ts.map((t, i) => ({ key: 'abc'[i] || String(i), name: t.name,
                                        status: t.status === BM.AGREED || t.status === BM.BOOKED
                                          ? 'Confirmed' : 'Applied', chats: {} })),
        offerTurn: '',
        events: eventsForJob(jobId),
        // Looked up now rather than copied onto the job when it was booked: a tutor who changes
        // their photo should change it on every class they teach, not just future ones.
        image: (venuesTab.find(v => key(v.name) === key(j.venue)) || {}).photo || '',
        image2: confirmedTutor ? ((findPerson(confirmedTutor.name) || {}).photo || '') : ''
      });
    });
    /* THE KEY THE SITE ACTUALLY ASKS FOR. `script.js` reads `DATA.liveJobs` and `DATA.jobs`, and
       this has only ever sent `clientClasses` — so the Book screen read a key nothing sends and
       showed "No sessions yet" whatever was in the tab. The same one-line-per-key fault as
       `resources` and `gallery`, and the same fix.
       The same array under all three names rather than a copy: they are one list, and two copies
       drifting apart is a worse problem than a long name. */
    payload.liveJobs = payload.clientClasses;
    payload.jobs = payload.clientClasses;
    mark('jobs');

    if (p.debugTiming) return jsonOut({ version: BACKEND_VERSION, timings,
      counts: { people: people.length, venues: venuesTab.length, jobs: jobsTab.length,
                resources: read(TAB.resources).rows.length, options: read(TAB.options).rows.length } });

    payload.timings = timings;
    return jsonOut(payload);
  } catch (err) {
    return jsonOut({ error: err.toString() });
  }
}