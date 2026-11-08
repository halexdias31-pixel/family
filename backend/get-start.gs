/* @family. — doGet's routes that answer without a payload, and the payload's starting shape. Called from doGet in doget.gs (1140). */

/* A maintenance job (`?run=`): the admin proves name and PIN, then the job runs and its result is the answer. */
function getRun_(p, migrated) {
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

/* `?receipts=`: the signed-in person's own receipts, and nobody else's. */
function getReceipts_(p, askedBy_) {
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

/* A required tab is missing: say which, and which file it should be in, instead of building a payload. */
function getMissingTabs_(REQUIRED_TABS, missingTabs) {
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

/* The payload as it starts: every key the site reads, with its empty value, and the small ones filled. */
function getPayloadInit_(behind, migrated, meAsked, cfg, opts, sur, filmsOut, venuesTab) {
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
    features: payloadFeatures_(),
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
    roleAliases: ROLE_ALIASES,
    // field -> its option list, in the shape the edit forms already read. Built from the
    // `options` tab, so every form and every booking dropdown share one source. Editing a list
    // there takes effect on the next load: nothing to rebuild, nothing to go stale.
    validations: payloadValidations_(opts),
    dropdowns: payloadDropdowns_(opts, venuesTab),
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
    /* AND THE HISTORY DATABASE'S FOUR (459, 461): `data/manuscripts|figures|writings|timeline.json`, filled in on the phone, declared for the same reason; the portraits (batch D) too. */
    manuscripts: [], figures: [], writings: [], timeline: [], portraits: [], timelines: [],
    /* An object rather than an array — branding is looked up by name, never iterated. */
    brand: {},
    /* Missing COLUMNS, and — for an admin — what is wrong with the DATA. § */
    health: { ok: true, missing: [], problems: [] }
  };
  return payload;
}

/* WHAT THIS DEPLOY CAN DO, by action name: the site compares it against what it needs. */
function payloadFeatures_() {
  return [/* ---------- THE NEW ONES, DECLARED SO THE SITE CAN TELL YOU § */
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
               /* The @family share of an extra seat (8 Nov), config B, set on the Business column. */
               'familyShareSave',
               /* Notes for Claude (484): an admin's note on a widget or card. */
               'claudeNoteAdd', 'claudeNoteDone',
               /* Favourite links and the Rewrite coach (509). */
               'favLinksSave', 'rewriteIdeas', 'rewriteCheck',
               /* Suggest a change (494), and an old phone's report. */
               'suggest', 'report', 'suggestUpload',
               /* The error log (O5): phones report, the Business column lists. */
               'clientError', 'listClientErrors', 'healthLog',
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
               'inboxList',
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
               'markPaid', 'setRoom',
               /* The site checks this before it draws "Mark with AI", so a phone ahead of the
                  deployment shows no button rather than one answering "not recognised". */
               'aiMark',
               /* And this one says `aiMark` reads the WHOLE answer, up to `AI_ANSWER_MAX` (20,000 characters), and marks an essay on its levels. § */
               'aiMarkWhole',
               /* And this one says `aiMark` reads pictures too: the pen's drawing as a PNG and the photos of the working (round 3). */
               'aiMarkImages',
               /* The site checks this before it offers the ＋ to somebody who is not an admin —
                  so an old deployment says so rather than swallowing their photograph. */
               'approvePost',
               /* AN ANSWER SENT, AND ITS VERDICT (SCHEMA.submissions). § */
               'submitAnswer',
               /* And what a child writes, kept on their account and read back on the next device (SCHEMA.answers). § */
               'saveAnswers', 'myAnswers',
               /* "Send the link again", and the sign-in link in a forgotten-PIN mail — listed so a
                  phone ahead of the deployment is told which file has not been pasted in. */
               'resendLink', 'pinLink'];
}

/* field -> its option list for the edit forms, the code's fixed lists over the sheet's. */
function payloadValidations_(opts) {
  const out = {};
  Object.keys(FIELD_OPTIONS).forEach(f => {
    const list = opts[FIELD_OPTIONS[f]];
    if (list && list.length) out[f] = list;
  });
  /* THE CODE'S OWN LISTS LAST, so they win — `FIELD_FIXED` in constants.gs says why a sheet row
     must not be able to widen a list the server refuses everything outside. */
  Object.keys(FIELD_FIXED).forEach(f => { out[f] = FIELD_FIXED[f]; });
  return out;
}

/* THE BOOKING FORM'S LISTS, from the options tab and the venues. */
function payloadDropdowns_(opts, venuesTab) {
  return {
      levels: opts.level || [], subjects: opts.subject || [], days: opts.weekday || [],
      // What kind each option is, so a subject can be academic or sporty the way a tutor already
      // can. Sent as a lookup rather than folded into the lists, which stay plain.
      focus: optionFocus(),
      times: (opts.start_time || []).map(fmtTime), boroughs: opts.borough || [],
      locations: venuesTab.map(v => S(v.name)).filter(Boolean),
      /* `linkCategories: []` went with the links: sent empty, and read by nothing in `js/`. */
      services: opts.service || [], topics: [], checklists: {},
    };
}
