/* @family. — 60_doGet.gs (7 of 8) THE PAYLOAD. § */

/* ---------- THIS FILE'S OWN STAMP § */
const DOGET_VERSION = "2026-10-29-merge-r2b";


function doGet(e) {
  try {
    WRITE_MISSES = [];
    /* NOBODY YET — the last request's viewer is not this one's (`NET_VIEWER_`, constants.gs; 342). */
    NET_VIEWER_ = null;
    /* Read once, at the top, so every exit from this function is wrapped the same way — including the early returns and the error at the bottom. § */
    JSONP_CB = String(((e && e.parameter) || {}).callback || '');
    const t0 = Date.now(), timings = {};
    const mark = n => { timings[n] = Date.now() - t0; };
    const p = (e && e.parameter) || {};

    /* WHO IS LOOKING, AND IT IS THE SESSION TOKEN THAT SAYS SO THIS FUNCTION DECIDED WHO YOU ARE FROM `?name=`. § */
    let ASKED_BY = undefined;
    const askedBy_ = function () {
      if (ASKED_BY === undefined) ASKED_BY = authWhoIs_(p.token);
      return ASKED_BY;
    };

    /* ---------- THE SHEET CATCHES UP, BUT NEVER WHILE SOMEBODY IS WAITING § */
    const behind = (function () {
      try {
        return PropertiesService.getScriptProperties()
          .getProperty('SCHEMA_VERSION') !== BACKEND_VERSION;
      } catch (err) { return false; }
    })();
    /* A maintenance URL still brings it up to date first — a job that needs a column needs the
       column to exist, and nobody is watching a spinner on one of those. */
    const migrated = (p.run || p.setup) ? autoMigrate_() : null;
    /* AND ON AN ADMIN'S PAGE LOAD (361), so "open the site once" after a deploy is the whole of setup; a visitor never waits on it. */
    if (!p.run && !p.setup && p.token) {
      try { const a = askedBy_(); if (a && hasRole(a, 'admin')) setupOnAdminLoad_(); } catch (err) {}
    }

    /* ---------- AND THE SHEET SAYS SO ITSELF, ONCE § */
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
      /* ---------- IT COMPARED THE PIN AGAINST A CELL THAT IS EMPTY ON EVERY HASHED ROW § */
      const tRun = read(TAB.people);
      const runWait = who ? authWaitMins_(who) : 0;
      if (runWait > 0) {
        return jsonOut({ error: 'Too many wrong PINs. Try again in ' + runWait
                              + (runWait === 1 ? ' minute.' : ' minutes.') });
      }
      if (!who || !hasRole(who, 'admin') || !authCheckPin_(tRun, who, S(p.pin))) {
        if (who && hasRole(who, 'admin')) authWrong_(tRun, who);
        return jsonOut({ error: 'Name or PIN not recognised, or that person is not an admin.',
                         hint: 'Add &name=Your%20Name&pin=0000 to the URL.' });
      }
      /* THE ADMIN WHO PROVED THEIR PIN IS WHO THE ANSWER IS FOR (342) — an admin sees grown-ups' whole
         names, and a job's report is read by them alone. */
      netViewerSet_(who);
      try {
        return jsonOut({ version: BACKEND_VERSION, ran: S(p.run), by: personDisplayName(who),
                         migrated: migrated, result: job(S(p.arg)) });
      } catch (err) {
        /* The message, not a stack trace, and NOT a 500 page — a job that throws should read as a
           job that threw rather than as the deployment being broken. */
        return jsonOut({ version: BACKEND_VERSION, ran: S(p.run), error: String(err && err.message || err) });
      }
    }

    /* ?setup=1 brings the sheets' tabs and columns up to date in place, so a schema change never means re-uploading a file and repointing the ids in FILES. § */
    if (p.setup) return jsonOut({ version: BACKEND_VERSION, schema: ensureSchema_(),
      alsoAvailable: 'add ?run=<job>&name=…&pin=… for the rest: ' + Object.keys(RUNNABLE).join(', ') });

    /* `?pages=1` AND `?pages=all` WERE HERE. § */

    /* SOMEBODY'S OWN RECEIPTS. Their own only — a receipt names what a family paid, and the list of
       them is the shape of a household's year. */
    if (p.receipts) {
      /* BY ID WHERE THE SITE KNOWS IT. § */
      /* AND THE TOKEN DECIDES WHOSE. § */
      const who = askedBy_();
      if (!who) return jsonOut({ error: 'Please sign in again.' });
      /* THEIR OWN, SO THEIR OWN NAME STAYS WHOLE IN THEM (342). */
      netViewerSet_(who);
      /* A RECEIPT IS NOTHING BUT MONEY, so a child is sent none (398). */
      if (netViewerIsChild_()) return jsonOut({ version: BACKEND_VERSION, receipts: [] });
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

    /* THE RACER'S MAP (426), on its own and never in the payload: half a megabyte nobody else needs. */
    if (p.race) return raceServe_();

    // ?triggers=1 installs the nightly jobs; ?triggers=list shows what's scheduled.
    if (p.triggers) return jsonOut({ version: BACKEND_VERSION,
      triggers: String(p.triggers).toLowerCase() === 'list' ? listTriggers() : installTriggers_() });

    // Confirm the tabs exist before building anything. Pointing at the wrong spreadsheet is the
    // single likeliest setup mistake, and read() returning empty rows makes it look like eleven
    // separate features broke rather than one line being wrong.
    /* Only the tabs the site genuinely can't run without. § */
    /* `resources` IS NO LONGER ON THIS LIST, because the tab is no longer in the spreadsheet. § */
    /* ---------- THE ANSWER FROM LAST TIME, IF THERE IS ONE § */
    /* THE TOKEN'S PERSON, NOT THE URL'S — see `payloadKey_`. Resolving it here costs one digest and
       one property read, before the cache is asked, which is the only order in which the answer can
       decide which copy comes back. */
    const cacheViewer = askedBy_();
    const cacheKey = payloadKey_(p, cacheViewer ? S(cacheViewer.person_id) : '');
    /* THE NET IS TOLD HERE TOO (342), because a hit returns from just below with a fresh half
       (`freshFor_`) the net has to say for this same person. */
    netViewerSet_(cacheViewer);
    /* ---------- `?warm=1` BUILDS AND STORES WITHOUT READING § */
    const warming = S(p.warm) === '1';
    if (cacheKey && !warming) {
      const kept = cacheGet_(cacheKey);
      /* ---------- A HIT SAYS SO § */
      /* AND THIS VIEWER'S SUBMISSIONS AND FILMS, FRESH — the stored body has neither (`payloadWithFresh_`). */
      if (kept) { mark('cache'); return jsonRaw_(payloadWithFresh_(kept, freshFor_(cacheViewer), true)); }
    }

    /* ---------- THE TABS WHOSE ABSENCE MEANS THE DATABASE IS NOT CONNECTED § */
    const REQUIRED_TABS = {
      people:  'nobody can sign in, and every person-keyed screen is empty for everybody',
      config:  'the switches and numbers the whole app reads through DATA.constants.vars',
      pricing: 'quotePerHour has nothing to quote from, so a booking is priced at nought',
      venues:  'the booking form has nowhere to offer, so nothing can be booked',
      jobs:    "a family's sessions come back as none, which reads as them being cancelled",
      events:  'the calendar is empty, which is not distinguishable from nothing being on',
      shop:    'every price and every wearable is gone, and the coins buy nothing',
      options: 'every dropdown on every admin form comes back blank'
    };
    const missingTabs = Object.keys(REQUIRED_TABS).filter(name => !read(name).sheet);
    if (missingTabs.length) {
      /* ---------- WHICH FILE THE TAB SHOULD HAVE BEEN IN § */
      const sawTabs = {};
      Object.keys(FILES).forEach(which => {
        const id = String(FILES[which] || '');
        if (!id) { sawTabs[which] = 'no id set'; return; }
        try {
          sawTabs[which] = SpreadsheetApp.openById(id).getSheets().map(s2 => s2.getName());
        } catch (err) {
          sawTabs[which] = 'CANNOT OPEN — ' + String(err && err.message || err) +
            ' (an .xlsx upload in Drive cannot be opened; it must be a Google Sheet)';
        }
      });
      return jsonOut({ error: 'No ' + missingTabs.map(name => name + ' (expected in ' +
          ((WHERE[name] && WHERE[name].file) || 'NO FILE — not routed in WHERE') +
          '; without it ' + REQUIRED_TABS[name] + ')').join(', ') +
        '. Either an id in hermes.gs points at the wrong file, or the tab has been renamed — ' +
        'the id is the part of the URL in docs.google.com/spreadsheets/d/<THIS PART>/edit.',
        version: BACKEND_VERSION, sawTabs: sawTabs });
    }

    /* WHO IS LOOKING, asked ONCE. § */
    /* AND ASKED OF THE TOKEN rather than of `?name=`. § */
    const meAsked = askedBy_();
    const meAskedName = meAsked ? personDisplayName(meAsked) : '';
    /* `?person=` IS NO LONGER READ FOR IDENTITY ANYWHERE IN THIS FUNCTION. § */
    const meAskedId = meAsked ? S(meAsked.person_id) : '';
    const viewerIsAdmin = !!meAsked && hasRole(meAsked, 'admin');
    /* AND THE NET IS TOLD (342): § */
    netViewerSet_(meAsked);
    /* WHO THEY MAY SEE (386, `seesWhom_`): null for nobody, a tutor or an admin; else the ids a child or parent is shown. */
    const vis = seesWhom_(meAsked);

    const cfg = config(), opts = allOptions(), sur = surcharges();
    mark('config');

    /* ---------- THE FILMS, READ ONLY IF THE PERSON LOOKING MAY SEE THEM § */
    const filmsOut = filmsFor_(meAsked);
    /* `drive_id` IS DELIBERATELY NOT SENT. § */

    const people = read(TAB.people).rows;
    const venuesTab = read(TAB.venues).rows;
    const jobsTab = read(TAB.jobs).rows;
    mark('records');

    const payload = {
      version: BACKEND_VERSION,
      /* ---------- GOOGLE SIGN-IN WAS BUILT AT BOTH ENDS AND HAD NO MIDDLE § */
      googleClientId: S(cfg.google_client_id),
      /* WHETHER "Mark with AI" IS WORTH DRAWING — true when `GEMINI_API_KEY` is in Script Properties. § */
      aiMarking: (function () {
        try { return !!PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY'); }
        catch (e) { return false; }
      })(),
      /* WHAT THE SHEET DID when this version first arrived — null on every request but the first after a deploy. § */
      migrated: migrated,
      /* WHETHER THE SHEET IS BEHIND THE CODE. Said rather than fixed: the fixing costs seconds and
         used to be taken out of this request, and this costs one property read. */
      schemaBehind: behind,
      /* THE LEDGER'S GENERATION (447): a phone keeps the library's words only for this one, so an import never shows old words. */
      libGen: (function () { try { return libGen_(); } catch (e) { return ''; } })(),
      // What this deploy can do. The frontend compares this against what it needs and warns if a
      // redeploy hasn't landed — a stale deploy is the worst kind of bug, because the action
      // succeeds and only the newer half silently doesn't happen.
      /* EVERY FILE'S STAMP, so a stale one can be named. § */
      fileVersions: {
        constants: BACKEND_VERSION,
        doPost:  typeof DOPOST_VERSION  !== 'undefined' ? DOPOST_VERSION  : 'not deployed',
        doGet:   typeof DOGET_VERSION   !== 'undefined' ? DOGET_VERSION   : 'not deployed',
        booking: typeof BOOKING_VERSION !== 'undefined' ? BOOKING_VERSION : 'not deployed',
      },
      features: [/* ---------- THE NEW ONES, DECLARED SO THE SITE CAN TELL YOU § */
                 'openWaitlist', 'claimChild', 'answerClaim', 'joinWaitlist', 'findChild',
                 'move', 'events', 'tabs', 'getProfile', 'myProfile', 'createJob',
                 'saveTodo', 'saveAvatar', 'register', 'verifyEmail',
                 /* The Timetable widget's week, kept on the account. */
                 'saveTimetable',
                 /* The admin's layout (462, 463): the order of widgets and which are deleted. */
                 'layoutSave',
                 /* The Rules card (496). */
                 'rulesSave',
                 /* Edit words in place (497). */
                 'wordsSave',
                 /* The weekly email's words (491), edited on the Site column. */
                 'digestWordsSave',
                 /* Notes for Claude (484): an admin's note on a widget or card. */
                 'claudeNoteAdd', 'claudeNoteDone',
                 /* Favourite links and the Rewrite coach (509). */
                 'favLinksSave', 'rewriteIdeas', 'rewriteCheck',
                 /* Suggest a change (494), and an old phone's report. */
                 'suggest', 'report', 'suggestUpload',
                 /* The error log (O5): phones report, the Business column lists. */
                 'clientError', 'listClientErrors',
                 'listRecords', 'saveRecordsPage',
                 /* The weekly parent email's Preview — the card asks before it posts, so a backend
                    synced before backend/digest.gs existed says so rather than "not recognised". */
                 'digestPreview',
                 /* Which emails somebody wants — the Notifications card on Settings says "sync backend/"
                    rather than drawing ticks an older backend would refuse. */
                 'setNotify',
                 /* `attemptWords` WAS HERE — the phone sent a question's words with `markDone` and backfilled them for a backend that listed it. § */
                 /* Tools → Check uploads, so a backend without it says so rather than "not recognised". */
                 'checkUploads',
                 /* The Email widget (493), so an old backend says so instead of failing. */
                 'inboxList', 'inboxRead',
                 /* The videos card's Sync from Drive, for an admin — the films from the Notflix folder. */
                 'filmsSync',
                 /* The Colliers Wood racer's Build the map tile, for an admin (426). */
                 'raceBuild',
                 /* The site checks for this to decide whether it may offer the picker. */
                 /* `likePost` is deliberately absent. The site checks this list, so a stale copy
                    of it in somebody's browser cache finds out rather than failing quietly. */
                 // Admin editing, by id rather than by row number.
                 /* `editResource`, `deleteResource` and `orderPrints` WERE HERE and are gone with the questions tab. § */
                 'editPost', 'deletePost',
                 'createCheckout', 'finalizePayment',
                 /* The site checks this before it offers the button, so an old deployment says so
                    rather than failing when it is pressed. */
                 'deleteJob', 'linkChild',
                 /* The site checks this before it offers the waitlist at all, so a phone running against an older deployment says so rather than posting an action that comes back § */
                 'joinWaitlist',
                 /* The site checks this before offering the button, so an older deployment says so
                    rather than answering "that action is not recognised" on a payment. */
                 'markPaid',
                 /* The site checks this before it draws "Mark with AI", so a phone ahead of the
                    deployment shows no button rather than one answering "not recognised". */
                 'aiMark',
                 /* And this one says `aiMark` reads the WHOLE answer, up to `AI_ANSWER_MAX` (20,000 characters), and marks an essay on its levels. § */
                 'aiMarkWhole',
                 /* The site checks this before it offers the ＋ to somebody who is not an admin —
                    so an old deployment says so rather than swallowing their photograph. */
                 'approvePost',
                 /* AN ANSWER SENT, AND ITS VERDICT (SCHEMA.submissions). § */
                 'submitAnswer',
                 /* And what a child writes, kept on their account and read back on the next device (SCHEMA.answers). § */
                 'saveAnswers', 'myAnswers',
                 /* "Send the link again", and the sign-in link in a forgotten-PIN mail — listed so a
                    phone ahead of the deployment is told which file has not been pasted in. */
                 'resendLink', 'pinLink'],
      tutors: [], students: [], venues: [], clientClasses: [], liveJobs: [],
      /* The signed-in person's own family, both directions — see "YOUR OWN FAMILY" below — and the
         id of the person it was built for, which the phone checks before drawing any of it. */
      family: [], familyFor: '',
      /* EVERYBODY WHO IS NOT ON `tutors`, for an admin's people column — see "EVERYONE" below. */
      everyone: [],
      /* ---------- `claims` WAS NEVER IN THIS LITERAL, AND `payload.claims.push` THREW § */
      claims: [],
      /* `links: []` WAS FIRST ON THIS LINE. See "`links` IS NOT SENT AT ALL NOW" below. */
      shop: [], promotions: [], intervals: [],
      campaigns: [],
      /* What the search funnel asks and what it calls it — see SCHEMA.facets. */
      facets: [],
      /* And what its first two questions answer — see SCHEMA.kinds. */
      kinds: [],
      profileFields: PROFILE_GROUPS, clientFields: CLIENT_GROUPS, phoneCodes: PHONE_CODES,
      studentFields: STUDENT_GROUPS,
      /* `resourceFields` AND `resourceOptions` WERE HERE — the admin form that relabelled a document, built from the server's own allow-list so it could not offer a § */
      /* The admin forms' field lists (venue, post, shop, trip, room, link), `options`, `availGrid`, `multiSelect`, `pricingRows` and `galleryError` went in 433: nothing read them. */
      /* `resourceInUse` WAS HERE. § */
      profileReadonly: PROFILE_READONLY,
      // field -> its option list, in the shape the edit forms already read. Built from the
      // `options` tab, so every form and every booking dropdown share one source. Editing a list
      // there takes effect on the next load: nothing to rebuild, nothing to go stale.
      validations: (function () {
        const out = {};
        Object.keys(FIELD_OPTIONS).forEach(f => {
          const list = opts[FIELD_OPTIONS[f]];
          if (list && list.length) out[f] = list;
        });
        /* THE CODE'S OWN LISTS LAST, so they win — `FIELD_FIXED` in constants.gs says why a sheet row
           must not be able to widen a list the server refuses everything outside. */
        Object.keys(FIELD_FIXED).forEach(f => { out[f] = FIELD_FIXED[f]; });
        return out;
      })(),
      dropdowns: {
        levels: opts.level || [], subjects: opts.subject || [], days: opts.weekday || [],
        // What kind each option is, so a subject can be academic or sporty the way a tutor already
        // can. Sent as a lookup rather than folded into the lists, which stay plain.
        focus: optionFocus(),
        times: (opts.start_time || []).map(fmtTime), boroughs: opts.borough || [],
        locations: venuesTab.map(v => S(v.name)).filter(Boolean),
        /* `linkCategories: []` went with the links: sent empty, and read by nothing in `js/`. */
        services: opts.service || [], topics: [], checklists: {},
      },
      /* `subjects` holds the subject surcharges, which is what its name says. § */
      multipliers: { levels: sur.level,
                     subjects: sur.subject,
                     subjectsEta: sur.subject,      // the old name, kept so nothing breaks
                     days: sur.day, times: sur.time, services: sur.service,
                     students: {}, weeks: {}, baseRate: N(cfg.M) },
      /* THE TAB LESS ITS SECRETS — `configPublic_` in core.gs. `films_folder` is the Notflix
         folder's id, and that id is the folder's only lock; this payload goes to everybody. */
      constants: { vars: configPublic_(cfg) },
      /* THE SITE'S LAYOUT (462): the admin's order of widgets over the code's, or null for the code's own. */
      layout: layoutClean_(cfg[LAYOUT_KEY]),
      /* THE RULES (496): which exceptions the admin made universal, and the last twenty changes for Undo. */
      rules: rulesClean_(cfg[RULES_KEY]),
      /* THE SITE'S OWN WORDS (497): an admin's text over the code's, `{key: text}`; {} for the code's own. */
      words: wordsClean_(cfg[WORDS_KEY]),
      /* Sent, but nothing displays them yet — the shape is settled and the presentation isn't. § */
      /* THE CLOSED DAYS INSIDE A TERM — filled below by `closures()`. */
      closures: [],
      exams: [], birthdays: [], posts: [], laws: [],
      /* AN ADMIN'S DISCOUNT CODES (docs/history/353) — filled below for an admin and nobody else. */
      promoCodes: [],
      facts: [],
      questions: [], boxers: [], fights: [], herd: [],
      /* ---------- EMPTY FOR EVERYBODY, AND FILLED FOR ONE PERSON § */
      films: filmsOut,
      /* AN ADMIN'S REELS AND VIDEOS (404), the same for everybody; the site merges them over the repository's. */
      /* PER VIEWER (406) — the kept body is per viewer too (`payloadKey_`). */
      media: mediaOut_(mediaAgeCap_(meAsked)),
      cheatsheet: [],
      /* `topicTree: []` WAS THE FOURTH OF THESE, declared so `check-payload.js` would not report a key the phone filled from `data/topics.json` as read-and-never-sent. § */
      /* AND `practicals` IS THE FIFTH, for exactly the same reason. § */
      practicals: [],
      /* AND `projects` IS THE SIXTH, for the same sentence: § */
      projects: [],
      /* AND `textbooks` IS THE SEVENTH, for the same sentence again: `data/textbooks.json` is
         filled in on the phone, and this key is here so `check-payload.js` does not report it
         read-and-never-sent. */
      textbooks: [],
      /* AND `inserts` IS THE EIGHTH (455): `data/inserts.json`, filled in on the phone, declared for the same reason. */
      inserts: [],
      /* AND THE HISTORY DATABASE'S FOUR (459, 461): `data/manuscripts|figures|writings|timeline.json`, filled in on the phone, declared for the same reason. */
      manuscripts: [], figures: [], writings: [], timeline: [],
      /* An object rather than an array — branding is looked up by name, never iterated. */
      brand: {},
      /* Missing COLUMNS, and — for an admin — what is wrong with the DATA. § */
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
        /* READ ONCE, SENT TWICE — `quals` and `qualsParts` below are one list in two spellings. */
        const qp = qualsParts_(r);
        payload.tutors.push({
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
          extraSeatCut: seatCutOut_(r.extra_seat_cut),
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
        });
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

      /* ---------- CLAIMS WAITING ON THIS PERSON § */
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

      /* ---------- EVERYONE, FOR AN ADMIN'S PEOPLE COLUMN § */
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
    });

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

    /* THE POSTS, with their likes counted and yours marked. § */
    {
      /* ---------- NOTHING HERE TOUCHES DRIVE § */
      const votes = read(TAB.post_votes).rows;
      const reacts = read(TAB.post_reactions).rows;
      /* READ ONCE, LIKE THE OTHER TWO. A `read` inside the post loop is one pass of the tab per
         post — the same argument the `faces` lookup below makes about the people tab. */
      const said = read(TAB.post_comments).rows;

      const me = meAskedId;

      /* Who posted it, and their face. Built once as a lookup rather than searched per post —
         fifteen people and ten posts is nothing, but a hundred posts against a growing people
         list is a hundred scans of it for no reason. */
      const faces = {};
      /* And the same people keyed by ID, for the likes — which know a person_id and not a name. § */
      const byId = {};
      read(TAB.people).rows.forEach(pp => {
        const nm = personDisplayName(pp);
        if (!nm) return;
        /* ---------- THE FACE IS THE `photo` CELL, AND THE FIGURE ONLY WHEN IT IS THE FACE § */
        const face = S(pp.photo);
        const kidHid = !photoChoice_(face) && hasRole(pp, 'student') && !!S(pp.avatar);
        /* KEYED BY THE WHOLE NAME, because that is what a post's `author` cell holds — and what goes
           OUT is `nameFor_`'s: "who reacted" names a child by their first name (the owner, 10 Oct). */
        faces[key(nm)] = {
          handle: S(pp.handle) || S(pp.first_name) || nameFor_(pp),
          avatar: kidHid ? '' : face,
          figure: faceFig_(pp).avatar,
          /* WHO, so the phone draws the author's picture as it is now, by id (474). */
          personId: S(pp.person_id),
        };
        /* ONLY WHOM THEY MAY SEE (386): a hidden reactor is not named, a hidden commenter is "Someone"; signed out, only staff are named. */
        if (S(pp.person_id) && seesPerson_(meAsked ? vis : {}, pp)) byId[S(pp.person_id)] = nameFor_(pp);
      });
      read(TAB.posts).rows.forEach(r => {
        if (!S(r.post_id)) return;
        /* A DELETED POST STILL GOES TO AN ADMIN, marked. § */
        const live = ON_(r.active);
        if (!live && !viewerIsAdmin) return;

        /* ---------- WHO SEES A POST THAT IS WAITING § */
        const state = norm(r.approved);
        const waiting = state === 'pending';
        const refused = state === 'refused';
        /* WHO PRESSED POST, not only the name on it — an admin's business post carries the brand's name (413). */
        const mine = !!meAskedId && postIsBy_(r, { person_id: meAskedId });
        if (refused && !viewerIsAdmin) return;
        if (waiting && !viewerIsAdmin && !mine) return;
        /* An author who is not in the people list still gets a name — the one typed in the row. § */
        const who = faces[key(S(r.author))]
          || { handle: S(r.author) || '@family.', avatar: '' };
        if (!who.avatar && !faces[key(S(r.author))]) {
          who.avatar = S(payload.brand.logo_square) || S(payload.brand.logo_circle);
        }

        payload.posts.push({
          id: S(r.post_id),
          /* THE CELL HOLDS THE WHOLE NAME (the sheet keeps it); what goes out is `nameFor_`'s, so a child's post is signed with their first name. § */
          author: (function () {
            const a = S(r.author);
            const pp = a ? findPerson(a) : null;
            return pp && key(personDisplayName(pp)) === key(a) ? nameFor_(pp) : a;
          })(),
          handle: who.handle,
          avatar: who.avatar,
          /* THE AUTHOR'S PERSON ID, blank for the business (474): "the profile picture should be in sync with my dp for my account". */
          authorId: S((faces[key(S(r.author))] || {}).personId),
          /* THE FIGURE, ONLY WHEN THE AUTHOR'S FACE IS THEIR FIGURE — set on `faces` above. § */
          figure: (faces[key(S(r.author))] || {}).figure,
          image: S(r.image),        // converted on the phone, the way the gallery already does it
          /* EVERY PICTURE AND CLIP, THE FIRST INCLUDED, so the phone reads one list rather than stitching `image` onto the front itself — which would be a second place for § */
          media: postMediaOut_(r),
          /* THE CAPTION, RESOLVED HERE AND NOWHERE ELSE. § */
          caption: S(r.caption) || captionFromName_(S(r.file_name)),
          body: S(r.body),
          location: S(r.location),
          when: fmtDate(postWhen_(r)),
          /* THE TIMESTAMP, in milliseconds. § */
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
          /* YOURS, so the phone offers Edit while it waits and Delete always — the server checks again (`editPost`, `deletePost`). */
          mine: !!mine,
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
          /* REACTIONS — and they are now the ONLY thing a person presses on a post. § */
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
              /* WHO, AND WITH WHAT. Names rather than ids — a reaction is a public thing and an id is not, and a list of P17390421 tells nobody anything. § */
              by: cast.slice(0, 40).map(x => ({
                name: byId[S(x.person_id)] || '', emoji: S(x.emoji),
              })).filter(x => x.name),
            };
          })(),
          /* ---------- WHAT PEOPLE SAID § */
          comments: (function () {
            const all = said.filter(c => S(c.post_id) === S(r.post_id) && ON_(c.active))
              .sort(function (a, b) {
                return new Date(a.said_on || 0) - new Date(b.said_on || 0);
              });
            return {
              total: all.length,
              list: all.slice(0, 60).map(function (c) {
                return {
                  id: S(c.comment_id),
                  name: byId[S(c.person_id)] || 'Someone',
                  body: S(c.body),
                  /* `fmtDateTime`, WHICH IS WHAT A MESSAGE ALREADY SENDS. § */
                  at: fmtDateTime(c.said_on),
                  mine: !!me && S(c.person_id) === me,
                  canRemove: (!!me && S(c.person_id) === me) || viewerIsAdmin,
                };
              }),
            };
          })(),
          rowIndex: r._row,
        });
      });
      /* Pinned first, then newest. § */
      payload.posts.sort((a, b) => (b.pinned - a.pinned) || (b.at - a.at));
    }


    /* EXAMS AND BIRTHDAYS — the two things a calendar has to know about a person. § */
    {
      const meId = meAskedId;
      /* Your own family, as BOTH SIDES have agreed it. A claim nobody answered is a request and
         not a relationship, so it opens nobody's diary. */
      const family = meId ? [meId]
        .concat(acceptedChildren(meId).map(x => S(x.person_id)))
        .concat(acceptedParents(meId).map(x => S(x.person_id)))
        .concat(siblingsOf(meId).map(x => S(x.person_id))) : [];
      const maySee = id => viewerIsAdmin || (S(id) && family.indexOf(S(id)) !== -1 && (!vis || !!vis[S(id)]));

      read(TAB.exams).rows.forEach(r => {
        if (!S(r.person_id) || !S(r.exam_date)) return;
        if (!ON_(r.active)) return;
        if (!maySee(r.person_id)) return;
        const who = findPerson(S(r.person_id));
        payload.exams.push({
          id: S(r.exam_id), personId: S(r.person_id),
          who: who ? nameFor_(who) : '',
          subject: S(r.subject), label: S(r.label),
          date: fmtDate(r.exam_date), kind: norm(r.kind) === 'mock' ? 'mock' : 'exam',
          board: S(r.board), rowIndex: r._row,
        });
      });

      /* ---------- AND THE TWO EXAM DATES A STUDENT KEEPS ON THEIR OWN PAGE § */
      const examOn = {};
      payload.exams.forEach(x => { examOn[S(x.personId) + '|' + S(x.date)] = true; });
      read(TAB.people).rows.forEach(r => {
        if (!maySee(r.person_id)) return;
        [['exam_small_date', 'mock', 'Small exam'], ['exam_big_date', 'exam', 'Big exam']].forEach(([col, kind, label]) => {
          const d = sheetDate(r[col]);
          if (!d) return;
          const k = S(r.person_id) + '|' + fmtDate(d);
          if (examOn[k]) return;
          examOn[k] = true;
          payload.exams.push({ id: S(r.person_id) + ':' + col, personId: S(r.person_id),
            who: nameFor_(r), subject: '', label: label, date: fmtDate(d), kind: kind,
            board: '', rowIndex: 0 });
        });
      });

      read(TAB.people).rows.forEach(r => {
        const d = sheetDate(r.date_of_birth);
        if (!d) return;
        if (!maySee(r.person_id)) return;
        payload.birthdays.push({
          name: nameFor_(r),
          day: d.getDate(), month: d.getMonth() + 1,
        });
      });
    }

    /* ---------- THE DISCOUNT CODES, TO AN ADMIN ALONE (docs/history/353) § */
    if (viewerIsAdmin) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      read(TAB.promo_codes).rows.forEach(r => {
        if (!S(r.code)) return;
        const ends = S(r.expires) ? sheetDate(r.expires) : null;
        const spent = N(r.max_uses) > 0 && N(r.used) >= N(r.max_uses);
        payload.promoCodes.push({
          code: S(r.code), type: S(r.type) === '%' ? '%' : '£', value: N(r.value),
          absorbedBy: /^shared/i.test(S(r.absorbed_by)) ? 'Shared with tutor' : 'Business',
          off: !ON_(r.active) ? 'switched off' : (ends && ends < today) ? 'expired' : spent ? 'used up' : '',
        });
      });
    }

    /* ---------- WHAT A WAITING-LIST SEAT COSTS, WORKED OUT HERE § */
    /* AND ONE PER ROOM, UNDER THE LABEL THE PHONE LOOKS IT UP BY. § */
    try {
      payload.waitlistSeat = {};
      read(TAB.venues).rows.forEach(v => {
        const at = S(v.name);
        if (!at) return;
        const labels = [at].concat(read(TAB.rooms).rows
          .filter(x => key(x.venue) === key(at) && ON_(x.active) && S(x.name))
          .map(x => at + ' \u2014 ' + S(x.name)));
        labels.forEach(label => {
          const w = waitlistPrice(label);
          if (w) payload.waitlistSeat[label] = {
            perHour: w.perSeatHour, perSession: w.perSeatSession,
            seats: w.seats, hours: w.hours,
          };
        });
      });
    } catch (err) { payload.waitlistSeat = {}; }

    /* WHAT THIS PERSON HAS STARRED. Theirs only — a favourite is a private thing and there is no
       screen anywhere that wants somebody else's. Sent as the bare keys, which is the shape the
       Find screen already holds them in. */
    /* `favouritesOf_`, so the sign-in reply sends the same list (`loginReplyFor_`). */
    try {
      payload.favourites = favouritesOf_(meAsked);
    } catch (err) { payload.favourites = []; }

    /* ---------- WHAT THIS PERSON LAST SENT FOR EACH QUESTION, AND — FOR AN ADMIN — HOW EVERYBODY IS DOING § */
    try {
      payload.submissions = submissionsFor_(meAsked, viewerIsAdmin);
    } catch (err) { payload.submissions = { for: '', mine: {} }; }

    /* ---------- THE VIEWER'S OWN FAVOURITE LINKS (509), and nobody else's: fresh every load, never kept in the cached body. */
    try { payload.favLinks = favLinksOf_(meAsked); } catch (err) { payload.favLinks = []; }

    /* ---------- WHEN THE FILMS WERE LAST FILLED FROM DRIVE, FOR THE ADMIN AND NOBODY ELSE § */
    if (viewerIsAdmin) {
      try { payload.filmsSync = filmsSyncSays_(); } catch (err) { payload.filmsSync = { at: '', more: false }; }
      /* THE SETUP CARD ON YOU (361) — versions, run-once jobs, triggers. Fresh every time, like filmsSync. */
      try { payload.setup = setupStatus_(); } catch (err) { payload.setup = { error: String(err && err.message || err) }; }
      /* THE OPEN NOTES FOR CLAUDE (484), the admin's alone. */
      try { payload.claudeNotes = claudeNotesOpen_(); } catch (err) { payload.claudeNotes = []; }
    }

    /* ---------- WHAT AN ADMIN REPORTED AND NOBODY HAS FIXED (486): `kind|id` only, so a card can say "flagged to fix" ---------- */
    try { payload.reportedItems = reportedItems_(); } catch (err) { payload.reportedItems = []; }

    /* ---------- AND THE SHOP WINDOW, WHICH IS THE SAME LIST FOR EVERYBODY § */
    /* AND A TAB WITH NO ROWS SENDS NO KEY, because the filter below cannot tell "an admin switched the last one off" from "nobody has ever spotlit anything" — both § */
    try {
      const spotRows = read(TAB.spotlight).rows;
      if (spotRows.length) {
        payload.spotlight = spotRows
          .filter(r => TRUE_(r.on))
          .map(r => S(r.item_id))
          .filter(Boolean);
      } else delete payload.spotlight;
    } catch (err) { delete payload.spotlight; }

    /* THE DAYS NOBODY IS TAUGHT — bank holidays and INSET days. § */
    try { payload.closures = closures(); }
    catch (err) { payload.closures = []; }

    /* `payload.splashOff` WAS HERE, always []: the splashes are read off the repository (data/settings) and nothing read this key (433). */

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
        description: S(r.description), image: S(r.photo),
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
        image: S(r.photo), inStock: true, fields: {}
      });
    });

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
    mark('jobs');

    if (p.debugTiming) return jsonOut({ version: BACKEND_VERSION, timings,
      counts: { people: people.length, venues: venuesTab.length, jobs: jobsTab.length,
                options: read(TAB.options).rows.length } });

    /* `payload.timings` WAS HERE on every load, read by nothing; `?debugTiming=1` above is how the timings are asked for (433). */
    /* ---------- KEPT, AND THEN SENT § */
    /* ---------- WITHOUT `submissions` OR THE FILMS, WHICH GO ON FRESH EVERY TIME § */
    /* BY NAME IN A LIST, not `payload.films` here: `check-payload.js` counts every `payload.<key>` as a
       key sent, and a line that takes a key OUT would answer for one that was never put in. */
    if (cacheKey) {
      /* THROUGH THE NET BEFORE IT IS KEPT, because the kept body goes out by `jsonRaw_` and never meets
         `jsonOut` (`kidNamesOff_`, people.gs — no child's surname leaves). The fresh half meets it in
         `freshFor_`. */
      try { kidNamesOff_(payload); } catch (err) {}
      /* AND NO PRICE TO A CHILD (398) — kept per viewer, so a child's kept body is a child's. */
      try { kidPricesOff_(payload); } catch (err) {}
      const fresh = {};
      ['submissions', 'films', 'favLinks', 'filmsSync', 'setup', 'claudeNotes'].forEach(k => { fresh[k] = payload[k]; delete payload[k]; });
      const body = JSON.stringify(payload);
      cachePut_(cacheKey, body);
      return jsonRaw_(payloadWithFresh_(body, fresh, false));
    }
    return jsonOut(payload);
  } catch (err) {
    return jsonOut({ error: err.toString() });
  }
}
/* ---------- `payload.family`, BUILT FOR ONE VIEWER — AND FOR THE SIGN-IN REPLY § */
function familyOf_(me) {
  const out = { familyFor: '', family: [] };
  if (!me || !S(me.person_id)) return out;
  const famCard_ = (r, rel) => ({
    personId: S(r.person_id), title: nameFor_(r, true), relation: rel,
    handle: S(r.handle), image: S(r.photo) || '',
    /* THE FIGURE, ONLY WHEN IT IS THE FACE (`faceFig_`). § */
    avatar: faceFig_(r).avatar,
  });
  /* Once each, and never yourself — a row linked to itself by a slip in the sheet would
     otherwise draw your own card a second time under "Your child". */
  const meId = S(me.person_id), seen = {};
  /* WHOSE FAMILY THIS IS, said in the payload. § */
  out.familyFor = meId;
  const addAll = (rows, rel) => rows.forEach(r => {
    const id = S(r.person_id);
    if (!id || id === meId || seen[rel + id]) return;
    seen[rel + id] = true;
    out.family.push(famCard_(r, rel));
  });
  /* AND ONLY WHOM THEY MAY SEE (386): a child is sent no parent, a parent no co-parent. */
  const vis = seesWhom_(me);
  const add = (rows, rel) => addAll(rows.filter(r => !vis || vis[S(r.person_id)]), rel);
  add(acceptedParents(meId), 'parent');
  add(acceptedChildren(meId), 'child');
  /* ---------- AND YOUR BROTHERS AND SISTERS § */
  add(siblingsOf(meId), 'sibling');
  return out;
}

/* ---------- `payload.favourites`, FOR ONE VIEWER — AND FOR THE SIGN-IN REPLY ------------------------------
   The bare item keys this person has starred, theirs only. A function for `familyOf_`'s reason. */
function favouritesOf_(me) {
  if (!me || !S(me.person_id)) return [];
  return read(TAB.favourites).rows
    .filter(r => key(r.person_id) === key(me.person_id))
    .map(r => S(r.item_id));
}

/* ---------- THE STORED BODY, WITH THIS VIEWER'S SUBMISSIONS (AND AN ADMIN'S FILMS) LAID ON § */
function submissionsNow_(viewer) {
  try { return submissionsFor_(viewer, !!viewer && hasRole(viewer, 'admin')); }
  catch (err) { return { for: '', mine: {} }; }
}
function freshFor_(viewer) {
  const admin = !!viewer && hasRole(viewer, 'admin');
  const out = { submissions: submissionsNow_(viewer), films: [] };
  /* EVERY VIEWER'S OWN FILMS, fresh each load: who may see one is Drive's sharing, not the kept body (450). */
  try { out.films = filmsFor_(viewer); } catch (err) { out.films = []; }
  /* AND THE VIEWER'S OWN FAVOURITE LINKS (509), fresh each load and never in the kept body, which is shared by a role. */
  try { out.favLinks = favLinksOf_(viewer); } catch (err) { out.favLinks = []; }
  if (admin) {
    try { out.filmsSync = filmsSyncSays_(); } catch (err) { out.filmsSync = { at: '', more: false }; }
    try { out.setup = setupStatus_(); } catch (err) { out.setup = { error: String(err && err.message || err) }; }
    try { out.claudeNotes = claudeNotesOpen_(); } catch (err) { out.claudeNotes = []; }
  }
  /* THE NET, for the half laid on a kept body — which goes out through `jsonRaw_`, not `jsonOut`. */
  try { kidNamesOff_(out); } catch (err) {}
  return out;
}
function payloadWithFresh_(body, fresh, cached) {
  const f = fresh || {};
  return String(body).slice(0, -1)
    + ',"submissions":' + JSON.stringify(f.submissions || { for: '', mine: {} })
    + ',"films":' + JSON.stringify(Array.isArray(f.films) ? f.films : [])
    + ',"favLinks":' + JSON.stringify(Array.isArray(f.favLinks) ? f.favLinks : [])
    + (f.filmsSync ? ',"filmsSync":' + JSON.stringify(f.filmsSync) : '')
    + (f.setup ? ',"setup":' + JSON.stringify(f.setup) : '')
    + (f.claudeNotes ? ',"claudeNotes":' + JSON.stringify(f.claudeNotes) : '')
    + (cached ? ',"cached":true' : '') + '}';
}

/* `payload.media` (404): every row, a hidden one as its id alone — it is there to hide a repository item with that id. */
/* `cap` IS THE OLDEST RATING THE VIEWER MAY SEE (`mediaAgeCap_`, 406): a row rated above it goes as its veil alone. */
function mediaOut_(cap) {
  const out = [];
  const most = typeof cap === 'number' ? cap : MEDIA_AGE_UNKNOWN;
  try {
    read(TAB.media).rows.forEach(function (r) {
      const kind = S(r.kind), id = S(r.yt_id);
      if (MEDIA_KINDS.indexOf(kind) === -1 || !mediaIdOk_(id)) return;
      if (TRUE_(r.hidden)) { out.push({ kind: kind, id: id, hidden: true }); return; }
      const age = mediaAgeOf_(r.age);
      if (age > most) { out.push({ kind: kind, veil: mediaVeil_(kind, id), hidden: true }); return; }
      out.push({ kind: kind, id: id, url: S(r.url), title: S(r.title), channel: S(r.channel),
        thumb: S(r.thumb), subject: S(r.subject), tags: S(r.tags), vkind: S(r.vkind),
        age: age ? String(age) : '', notes: S(r.notes) });
    });
  } catch (err) {}
  return out;
}

/* ---------- `payload.films`: AN ADMIN ALL, EVERYBODY ELSE WHAT THE DRIVE FILE IS SHARED WITH THEM (450) ----------
   Only a share naming the viewer's own email counts; signed out, no email or Drive unreadable = nothing. */
function filmsFor_(viewer) {
  const out = [];
  if (!viewer || typeof viewer !== 'object') return out;
  const admin = hasRole(viewer, 'admin');
  const me = S(viewer.email).trim().toLowerCase();
  if (!admin && me.indexOf('@') < 1) return out;
  const rows = read(TAB.films).rows.filter(function (r) { return ON_(r.active); });
  const shares = filmShares_(rows.filter(function (r) { return !TRUE_(r.placeholder) && S(r.drive_id); }));
  rows.forEach(function (r) {
    const who = shares[S(r.drive_id)] || null;
    if (!admin && !(who && who.indexOf(me) !== -1)) return;
    const f = {
      id: S(r.film_id), title: S(r.title), year: S(r.year), kind: S(r.kind),
      audience: S(r.audience), director: S(r.director), lead: S(r.lead),
      seasons: S(r.seasons), url: S(r.drive_url), fileKind: S(r.file_kind),
      sizeGb: S(r.size_gb), placeholder: TRUE_(r.placeholder), notes: S(r.notes)
    };
    /* THE ADMIN'S CHECK: who Drive says may open it, one line. */
    if (admin) f.sharedWith = who ? who.join(', ') : TRUE_(r.placeholder) ? '' : 'unknown: Drive could not be read';
    out.push(f);
  });
  return out;
}

/* WHO EACH FILE OR FOLDER IS SHARED WITH, by person: { drive_id: [emails] }, an unreadable one left out.
   Kept FILMS_SHARE_TTL_S so a revoked share is gone within minutes; anyone-with-link is not a person. */
function filmShares_(rows) {
  const out = {};
  if (!rows.length) return out;
  let cache = null, kept = {};
  try { cache = CacheService.getScriptCache(); kept = cache.getAll(rows.map(function (r) { return FILMS_SHARE_PREFIX + S(r.drive_id); })) || {}; }
  catch (err) { cache = null; kept = {}; }
  const put = {};
  rows.forEach(function (r) {
    const id = S(r.drive_id), k = FILMS_SHARE_PREFIX + id;
    if (kept[k] != null) { try { const v = JSON.parse(kept[k]); if (v) out[id] = v; return; } catch (err) {} }
    try {
      const x = S(r.file_kind) === 'folder' ? DriveApp.getFolderById(id) : DriveApp.getFileById(id);
      if (!x) return;
      const seen = {};
      (x.getViewers() || []).concat(x.getEditors() || []).forEach(function (u) {
        const e = S(u && u.getEmail ? u.getEmail() : '').trim().toLowerCase();
        if (e.indexOf('@') > 0) seen[e] = true;
      });
      out[id] = Object.keys(seen).sort();
      put[k] = JSON.stringify(out[id]);
    } catch (err) { put[k] = 'null'; /* NOT READABLE IS NOT SHARED, and kept so: hidden from all but the admin. */ }
  });
  try { if (cache && Object.keys(put).length) cache.putAll(put, FILMS_SHARE_TTL_S); } catch (err) {}
  return out;
}

/* ---------- WHAT THE LAST SYNC FROM DRIVE SAYS, FOR THE ADMIN'S CARD § */
function filmsSyncSays_() {
  const st = filmsState_();
  return { at: S(st.at), more: !!S(st.pass), folder: S(st.folder), found: st.found || null };
}

/* ---------- `payload.submissions`, BUILT FOR ONE VIEWER § */
function submissionsStamp_(who) {
  try { return PropertiesService.getScriptProperties().getProperty('SUBS_AT:' + S(who)) || '0'; }
  catch (err) { return '0'; }
}
function submissionsCacheKey_(who) {
  return 'subs|' + payloadGen_() + '|' + BACKEND_VERSION + '|' + S(who) + '|' + submissionsStamp_(who);
}
/* AFTER A PRESS IS ON THE SHEET: that person's copy and the admin's summary are both stale. */
function submissionsTouched_(pid) {
  try {
    const props = PropertiesService.getScriptProperties();
    const now = String(Date.now());
    props.setProperty('SUBS_AT:' + S(pid), now);
    props.setProperty('SUBS_AT:*people', now);
  } catch (err) {}
}
/* ONE READ OF THE TAB, SHAPED BOTH WAYS — this person's latest per key, and everybody's summary. § */
function submissionsBuild_(pid, people) {
  const mine = {}, sum = {};
  readCols_(TAB.submissions, ['person_id', 'key', 'answer', 'verdict', 'submitted_at', 'event_id', 'pressed_at']).rows.forEach(r => {
    const who = S(r.person_id), k = S(r.key);
    if (!who || !k) return;
    const came = answerAtMs_(r.submitted_at);
    if (people) {
      const p = sum[who] || (sum[who] = { qs: {}, at: 0 });
      p.qs[k.split('#')[0]] = 1;
      /* A ROW CARRIED OVER FROM BEFORE THE SWITCH ARRIVED THE DAY THE BACKEND LANDED and was done weeks before: § */
      const when = SUBMISSION_CARRIED.test(S(r.event_id)) ? (answerAtMs_(r.pressed_at) || came) : came;
      if (when >= p.at) p.at = when;
    }
    if (key(who) !== key(pid)) return;
    const at = answerAtMs_(r.pressed_at) || came;
    const was = mine[k];
    if (was && was.at > at) return;
    mine[k] = { answer: S(r.answer), verdict: S(r.verdict), at: at, id: S(r.event_id) };
  });
  const out = { mine: mine };
  if (people) {
    out.people = {};
    Object.keys(sum).forEach(who => {
      out.people[who] = { n: Object.keys(sum[who].qs).length,
                          last: sum[who].at ? Utilities.formatDate(new Date(sum[who].at), DIGEST_TZ, 'yyyy-MM-dd') : '' };
    });
  }
  return out;
}
function submissionsFor_(me, isAdmin) {
  const out = { for: '', mine: {} };
  if (!me || !S(me.person_id)) return out;
  const pid = S(me.person_id);
  out.for = pid;
  /* THE KEYS ONCE, BEFORE THE TAB IS READ — the stamp read after the read could be a press newer than what was read, and the copy would be filed under it. § */
  const keyMine = submissionsCacheKey_(pid), keyPeople = isAdmin ? submissionsCacheKey_('*people') : '';
  const kept = k => { try { const t = cacheGet_(k); return t ? JSON.parse(t) : null; } catch (err) { return null; } };
  let mine = kept(keyMine), people = isAdmin ? kept(keyPeople) : null;
  if (!mine || (isAdmin && !people)) {
    const built = submissionsBuild_(pid, isAdmin);
    mine = built.mine;
    try { cachePut_(keyMine, JSON.stringify(mine)); } catch (err) {}
    if (isAdmin) {
      people = built.people;
      try { cachePut_(keyPeople, JSON.stringify(people)); } catch (err) {}
    }
  }
  out.mine = mine || {};
  if (isAdmin) out.people = people || {};
  return out;
}
