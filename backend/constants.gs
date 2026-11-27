/* @family. — 00_constants.gs (1 of 8) THE TOP-LEVEL VALUES IN THE ORIGINAL ORDER (jobs, migrations and ACTION_ACCESS follow in access.gs). § */
/* SHARED:BEGIN — data/settings/settings.json (and default-pictures.json as `pictures`), written by `node tools/build.js`; edit the json, never this. */
const SHARED_SETTINGS = {"tz":"Europe/London","days":[["m","Monday"],["tu","Tuesday"],["w","Wednesday"],["th","Thursday"],["f","Friday"],["sa","Saturday"],["su","Sunday"]],"hours":[9,10,11,12,13,14,15,16,17,18,19,20],"roles":{"ids":{"admin":{"label":"Admin","aliases":["administrator"],"rank":"admin","tier":"admin","self":false},"tutor":{"label":"Tutor","aliases":["teacher"],"rank":"staff","tier":"member","self":true,"pending":true},"client":{"label":"Client","aliases":["parent","guardian"],"app":"parent","rank":"client","tier":"member","self":true},"student":{"label":"Student","aliases":["kid","child","pupil"],"app":"kid","rank":"student","tier":"child","self":true},"contact":{"label":"Contact","aliases":[],"rank":"contact","tier":"anyone","self":false,"signIn":false}},"default":"client","guest":{"rank":"out","tier":"anyone"},"ranks":["contact","student","client","staff","admin"],"tiers":["anyone","member","child","admin"],"titles":{"head of boxing":"Head of Boxing","coach":"Coach"},"may":{"admin":{"tiers":["admin"]},"owner":{"tiers":["admin"],"owner":true},"prices":{"notTiers":["child"]},"staff":{"rank":"staff"},"signedIn":{"notTiers":["anyone"]},"grownUp":{"tiers":["member","admin"]}},"see":{"roles":["child","family","tutor","admin"],"words":{"student":"child","client":"family","member":"family","family":"family","staff":"tutor","tutor":"tutor","apprentice":"tutor","admin":"admin","business":"admin","site":"admin"}},"notify":["client","student","tutor","admin"],"form":["student","client","tutor","admin","contact"]},"limits":{"photoMax":8,"jobMax":6,"libraryCards":5,"favLinksMax":10,"favTitleMax":80,"favUrlMax":2000,"digestWordMax":300},"siteRules":{"ids":["mag-items","speed-long","hear-lang","tap-44","search-icon","whole-widgets","library-one-card","tell-admin","kjv-admin","finder-members","admin-cols","people-no-merge","items-no-move","form-save-row"],"locked":["hear-lang","admin-cols","people-no-merge","items-no-move","form-save-row"]},"submissionsPerPost":25,"answerTextMax":20000,"calendar":{"breaks":[{"name":"October half-term","sheet":"October Half Term","kind":"half","starts":"10-26"},{"name":"Christmas holidays","sheet":"Christmas Holiday","kind":"holiday","starts":"12-19"},{"name":"February half-term","sheet":"February Half Term","kind":"half","starts":"02-13"},{"name":"Easter holidays","sheet":"Easter Holiday","kind":"holiday","starts":"03-27"},{"name":"May half-term","sheet":"May Half Term","kind":"half","starts":"05-22"},{"name":"Summer holidays","sheet":"Summer Holiday","kind":"holiday","starts":"07-22"}],"kinds":{"term":{"say":"term","words":[]},"half-term":{"say":"half term","also":["half term"],"words":["half\\s*term"]},"holiday":{"say":"holiday","words":["holiday","christmas","easter","summer break","break"]}},"exams":[{"id":"sats","name":"SATs","key":"exam_sats_start","at":"05-11"},{"id":"elevenplus","name":"11+","key":"exam_11plus_start","at":"09-12"},{"id":"gcse","name":"GCSE exams","key":"exam_gcse_start","at":"05-11"},{"id":"alevel","name":"A-level exams","key":"exam_alevel_start","at":"05-11"}]},"levels":{"list":[{"level":"SATs","rung":1,"stages":["KS1","KS2"],"tiers":[],"says":["KS1","KS2","KS1 SATs","KS2 SATs"]},{"level":"11+","rung":0,"stages":["KS2"],"tiers":[],"says":[]},{"level":"KS3","rung":2,"stages":["KS3"],"tiers":[],"says":[]},{"level":"GCSE","rung":3,"stages":["KS4"],"tiers":["Foundation","Higher","Foundation Plus","Higher Plus"],"says":["KS4"]},{"level":"Functional Skills L2","rung":0,"stages":["KS4"],"tiers":[],"says":[]},{"level":"Level 2 Certificate","rung":0,"stages":["KS4"],"tiers":[],"says":["L2 Certificate"]},{"level":"A-Level","rung":4,"stages":["KS5"],"tiers":[],"says":["Alevel","A level","KS5"]},{"level":"AS","rung":0,"stages":["KS5"],"tiers":[],"says":["AS level","AS-level"]},{"level":"Theory test","rung":0,"ladder":false,"stages":[],"tiers":[],"says":[]},{"level":"ESL","rung":0,"ladder":false,"stages":[],"tiers":["A1","A2","B1","B2","C1","C2"],"says":["EFL","ESOL","CEFR"]},{"level":"University","rung":5,"stages":[],"tiers":["FHEQ 4","FHEQ 5","FHEQ 6","FHEQ 7"],"says":["Degree","Undergraduate","FHEQ","MSOR"]},{"level":"BNCC","rung":0,"ladder":false,"stages":[],"tiers":["1º ano","2º ano","3º ano","4º ano","5º ano","6º ano","7º ano","8º ano","9º ano"],"says":["Brazil","Brasil","Ensino Fundamental"]},{"level":"ENEM","rung":0,"ladder":false,"stages":[],"tiers":[],"says":[]},{"level":"Australian Curriculum","rung":0,"ladder":false,"stages":[],"tiers":["Foundation Year","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Year 7","Year 8","Year 9","Year 10"],"says":["Australia","ACARA","F-10"]}],"quals":{"list":["Doctorate","Master's degree","PGCE","Bachelor's degree","Foundation Degree","HND","HNC","Diploma","Access to HE","International Baccalaureate","A-Level","T Level","BTEC","AS","IGCSE","GCSE","Certificate","11+","SATs","Entry Level","Enhanced","Standard","Basic"],"says":{"Degree":"Bachelor's degree","BA":"Bachelor's degree","BSc":"Bachelor's degree","Undergraduate":"Bachelor's degree","University":"Bachelor's degree","Masters":"Master's degree","MA":"Master's degree","MSc":"Master's degree","PhD":"Doctorate","IB":"International Baccalaureate"}}},"library":{"show":["generated","past-papers"]},"pictures":["fox","owl","cat","dino","robot","rocket","planet","football","guitar","palette"]};
/* THE ROLE HELPERS BOTH SIDES SHARE (one role check, owner 21 Nov): copied by tools/cards-gen.js into the SHARED block of js/core.js and
   backend/constants.gs, after SHARED_SETTINGS. Edit here, never there; tools/one-role.js fails the build on a twin anywhere else. Plain ES2017. */
const ROLES_ = SHARED_SETTINGS.roles;
const ROLE_IDS = Object.keys(ROLES_.ids);
const RANKS = ROLES_.ranks;
const ROLE_ALIASES = Object.fromEntries([].concat(...ROLE_IDS.map(r => (ROLES_.ids[r].aliases || []).map(a => [a, r]))));
const SEE_ROLES = ROLES_.see.roles;
const ROLE_THREE_ = ROLES_.see.words;
/* THE PERMISSION TIER A RANK HOLDS (actions.json `roles`); no rank is a guest. */
function rankTier_(rank) {
  const id = ROLE_IDS.find(r => ROLES_.ids[r].rank === rank);
  return id ? ROLES_.ids[id].tier : ROLES_.guest.tier;
}
/* A FIXED WORD (`roles.may`) for this tier, rank and owner-ness; undefined when the word is a permissions.json row instead. */
function mayWord_(what, tier, rank, isOwner) {
  const m = Object.prototype.hasOwnProperty.call(ROLES_.may, what) ? ROLES_.may[what] : null;
  if (!m) return undefined;
  let ok = m.rank ? !!rank && RANKS.indexOf(rank) >= RANKS.indexOf(m.rank)
    : m.tiers ? m.tiers.indexOf(tier) !== -1 : (m.notTiers || []).indexOf(tier) === -1;
  if (m.owner) ok = ok && !!isOwner;
  return ok;
}
/* SHARED:END */

/* @family. — backend (hermes) Rewritten against the eleven-tab database. § */

/* BOTH OF THESE IDS POINTED AT AN .xlsx AND `SpreadsheetApp` CANNOT OPEN ONE. § */
/* THE LEDGER'S ID LIVES IN THE SCRIPT PROPERTY LEDGER_ID, not in this public repo (seeded 17 Nov by the
   interim release). Order: the property, then the bound spreadsheet, else an error naming the property. */
let LEDGER_ID_CACHE_ = '';
function ledgerId_() {
  if (LEDGER_ID_CACHE_) return LEDGER_ID_CACHE_;
  let id = PropertiesService.getScriptProperties().getProperty('LEDGER_ID') || '';
  if (!id) { try { const ss = SpreadsheetApp.getActive(); if (ss) id = ss.getId(); } catch (err) { /* standalone project */ } }
  if (!id) throw new Error('No Ledger id: set the Script Property LEDGER_ID (Project Settings > Script properties).');
  return (LEDGER_ID_CACHE_ = id);
}

/* THE OTHER TWO FILES, AND WHY THERE ARE THREE OF THEM. § */
/* ---------- `SETTINGS_ID` WAS HERE, AND THERE ARE TWO SPREADSHEETS NOW § */
/* `LIBRARY_ID` WAS HERE. § */

/* `installSheetWatch` walks this to put an edit trigger on every file, so a fourth database is one line here and nothing else. § */
const FILES = { get ledger() { return ledgerId_(); } };

/* ---------- WHICH FILE EACH TAB IS IN § */
/* MOVED TABS ARE NOT HERE (17 Nov): a kind in kinds.json ledger.moved is read and written in the items or events tab only (core.gs `read`). */
const WHERE = {
  /* THE STORE: one tab of items and one of events (kinds.json `ledger`); every moved kind lives here (core.gs `read`). */
  items:          { file: 'ledger' }, events_log: { file: 'ledger' },
  /* AN ADMIN'S NOTE FOR CLAUDE ON A WIDGET OR CARD (484) — written directly by sessions too. Admin-only to read. */
  claude_notes:   { file: 'ledger' },
  /* THE LIBRARY'S PRIVATE HALF (397): the words, answers and figures, filled by `library-to-ledger`; kept on their own tabs (kinds.json ledger.kept). */
  lib_questions:  { file: 'ledger' },
  lib_content:    { file: 'ledger' },
  lib_practicals: { file: 'ledger' },
  lib_projects:   { file: 'ledger' },
  /* THE READING SOURCES A PAPER'S INSERT PRINTS (458): copyrighted, so the extract is here and never in the repository. */
  lib_inserts:    { file: 'ledger' },
};
/* WHO GETS TOLD when something needs doing by hand. § */
const ADMIN_NAME = "@family.";

/* EVERY KIND OF EMAIL THIS SITE SENDS, AND WHICH OF THEM SOMEBODY MAY TURN OFF § */
const NOTIFY_ALL_ROLES = SHARED_SETTINGS.roles.notify;
const NOTIFY_KINDS = {
  weekly:    { col: 'weekly_email', roles: ['client'], parents: true,
               label: 'Weekly progress email', note: 'Sundays: what your child worked on' },
  bookings:  { col: 'bookings_email', roles: ['client', 'tutor', 'admin'],
               label: 'Booking updates', note: 'Notes, new terms and payments on a session' },
  /* HIDDEN: NOTHING HANDS A CODE OUT ANY MORE. § */
  referrals: { col: 'referrals_email', roles: NOTIFY_ALL_ROLES, hidden: true,
               label: 'Your code was used', note: 'When somebody joins with it' },

  access:    { always: true, roles: NOTIFY_ALL_ROLES,
               label: 'Sign-in links and new PINs', note: 'Confirming your address, a forgotten PIN, a link to sign in',
               why: 'without them nobody can get into their account, or back into it' },
  security:  { always: true, roles: NOTIFY_ALL_ROLES,
               label: 'Security warnings', note: 'Too many wrong PINs, or your PIN changed',
               why: 'the only warning an account theft ever gives' },
  family:    { always: true, roles: ['client', 'student'], parents: true,
               label: 'Family links', note: 'Somebody adding you as their child, and the answer',
               why: 'a child is never put on an account they were not told about' },
  booked:    { always: true, roles: ['client', 'tutor'],
               label: 'Bookings confirmed or cancelled', note: 'Received, accepted, paid, a tutor leaving, cancelled',
               why: 'each decides whether a session happens, and the door is too late to find out' },
  /* HIDDEN: A TUTOR'S APPLICATION — the owner's notice and the applicant's answer; nobody's card draws it. */
  applied:   { always: true, roles: NOTIFY_ALL_ROLES, hidden: true,
               label: 'Tutor applications', note: 'An application, and the answer to it',
               why: 'the business is run on it' },
};

/* Bumped on every paste that changes behaviour. § */
const BACKEND_VERSION = "2026-11-27-docket-plan";
const SITE_URL = "https://halexdias31-pixel.github.io/family/";

/* EVERY TAB NAME CODE READS BY. A kind in kinds.json ledger.moved is read through the items/events store
   (core.gs `read`), so these stay as names; only ledger.kept are real tabs (WHERE). */
const TAB = {
  people: 'people', qualifications: 'qualifications', library_cards: 'library_cards',
  venues: 'venues', jobs: 'jobs', events: 'events', terms: 'terms',
  shop: 'shop', pricing: 'pricing',
  config: 'config', options: 'options', trips: 'trips', rooms: 'rooms',
  promo_codes: 'promo_codes',
  exams: 'exams',
  /* A student's scanned pages — see SCHEMA.work_files. */
  work_files: 'work_files',
  records: 'records',
  herd: 'herd',
  facts: 'facts',
  /* The one items tab and the one events tab (kinds.json `ledger`). */
  items: 'items', events_log: 'events_log',
  /* Every receipt ever issued, kept as it was issued. See the schema below. */
  receipts: 'receipts',
  /* The calendar of festivals, as rules rather than dates — see the schema. */
  holidays: 'holidays',
  /* Who starred what — see SCHEMA.favourites. */
  favourites: 'favourites',
  /* What each learner drew on a question — see SCHEMA.answers. */
  answers: 'answers',
  /* Every answer each learner sent, and its verdict — see SCHEMA.submissions. */
  submissions: 'submissions',
  /* What the weekly parent email sent, or would have — see SCHEMA.digest_log. */
  digest_log: 'digest_log',
  /* A question somebody reported — see SCHEMA.reports. */
  reports: 'reports',
  /* An application to teach — see SCHEMA.applications. */
  applications: 'applications',
  /* A note for Claude on a widget or card — see SCHEMA.claude_notes. */
  claude_notes: 'claude_notes',
  /* What broke on a phone — see SCHEMA.client_errors. */
  client_errors: 'client_errors',
  /* How the site felt on real phones (920) — see SCHEMA.health_log. */
  health_log: 'health_log',
  /* Who changed somebody else's settings — see SCHEMA.lens_log. */
  lens_log: 'lens_log',
  /* A person's favourite links — see SCHEMA.fav_links. */
  fav_links: 'fav_links',
  /* What the BUSINESS has chosen to put in front of everybody — see SCHEMA.spotlight. */
  spotlight: 'spotlight',
  /* What the Reels column shows. One row is one slide: a subject, a heading, a line or two, and a
     few words to find a photograph by — see SCHEMA.facts. */
  films: 'films',
  /* YouTube reels and videos an admin pasted in from the phone — see SCHEMA.media (404). */
  media: 'media',
  posts: 'posts', post_votes: 'post_votes',
  post_reactions: 'post_reactions', post_comments: 'post_comments',
  /* Phone notifications (492) — see SCHEMA.push_tokens and push.gs. */
  push_tokens: 'push_tokens',
  family: 'family',
  /* THE LIBRARY'S PRIVATE HALF (397) — read a row at a time by `libContent_`, never through `read()`: see LIB_FILES. */
  libQuestions: 'lib_questions', libContent: 'lib_content', libPracticals: 'lib_practicals',
  libProjects: 'lib_projects', libInserts: 'lib_inserts', libLog: 'lib_log'
};


/* ---------- THE LIBRARY'S PRIVATE HALF, IN THE LEDGER (397) ----------
   These fields live only in the Ledger, a tab per file; `library-to-ledger` copied them from LIB_SOURCE_COMMIT. */
const LIB_SOURCE_COMMIT = 'a237c8a7e4005e72ca22419579d3ff92722921dd';
const LIB_SOURCE_RAW = 'https://raw.githubusercontent.com/halexdias31-pixel/family/' + LIB_SOURCE_COMMIT + '/';
/* `prefix` is the item's id on the wire (`q:<row_id>`); `id` the columns that make it; `skip` a column whose rows stay
   public whole (a teaching animation draws the splash for everybody). Order here is the copy's order. */
/* LIB_FILES (each library file's tab, id columns and private fields) is written into cards-gen.gs from kinds.json `sheet.lib` by tools/cards-gen.js. */
/* A CELL HOLDS 50,000 CHARACTERS; an item's JSON is cut at 40,000 into up to six cells (the largest is 87,440). */
const LIB_PARTS = 6;
const LIB_CELL = 40000;
/* AT MOST THIS MANY ITEMS IN ONE `libItems` CALL — one question with its stems and parts, and the next few. */
const LIB_PER_CALL = 50;

/* ---------- SCHEMA, AND KEEPING IT IN STEP § */
const SCHEMA = {
  /* ---------- THE PEOPLE TAB, REDESIGNED § */
  people: [
    /* who they are */
    "person_id", "role", "first_name", "last_name", "handle", "handle_changed_at", "handle_was",
    /* EVERY WHOLE NAME THEY HAVE HAD BEFORE, newest first — written by `updateProfile` when a name changes, so a child whose surname was corrected after she booked § */
    "name_was",
    /* how to reach them, and how they sign in */
    "email", "phone", "pin", "date_of_birth",
    /* A GROWN-UP'S ADDRESS, FOR A CHILD WHO HAS NONE — written by `register` when a child makes their own account with no email of their own. § */
    "parent_email",
    /* the account */
    "verified", "verify_token", "listed", "details_confirmed", "joined_on", "came_from",
    "invited_by", "referral_code",
    /* the profile a parent reads */
    "photo", "photos", "video",
    /* THE INTRO VIDEO A TUTOR UPLOADED: its Drive file id in the private tutor-videos folder (`postVideoPart_`). */
    "video_file",
    /* CURRENT AND PAST JOBS, one cell of JSON — `jobsIn`/`jobsOut` in core.gs, like the photographs. */
    "jobs", "headline", "adjective_1", "adjective_2", "adjective_3",
    "years_experience",
    /* THE AGES THEY TEACH: a whole number or the word `Adults`, out of `AGE_OPTIONS` — see
       `ageRefusal_` in people.gs. Not on the pricing page: the age range does not decide a price. */
    "age_min", "age_max", "focus", "dbs_checked",
    /* THE TUTOR'S DBS (10 Nov): when the admin last ran the online check, and the certificate it checks; admin-only (listStaff). */
    "dbs_checked_on", "dbs_number",
    /* where they are */
    "address", "town", "city", "borough", "postcode", "travel_km",
    /* what they charge, and when they can teach */
    "rate_per_hour", "extra_seat_rate",
    /* THE BUSINESS'S CUT OF AN EXTRA SEAT, PER TUTOR (docs/history/345) — a fraction of THIS tutor's rate, beside their own share. § */
    "extra_seat_cut",
    /* WHO MANAGES THIS TUTOR (13 Nov): a person id the tutor chooses (an admin may too); blank is the admin. `chainShares_` splits the extra-seat money up it. */
    "manager",
    "min_students", "max_students", "min_hours", "max_hours",
    "pricing_changed_at", "availability", "agreement_signed_at", "agreement_version",
    /* a family's and a student's own */
    "children", "favourite_colour", "exam_small_date", "exam_big_date",
    /* THE WEEKLY PARENT EMAIL, PER PARENT — see backend/digest.gs. § */
    "weekly_email",
    /* ---------- AND EVERY OTHER EMAIL SOMEBODY MAY TURN OFF, ONE COLUMN EACH — see `NOTIFY_KINDS` § */
    "bookings_email", "posts_email", "referrals_email", "approvals_email",
    /* the app's state, which nobody types into */
    "avatar", "avatar_owned", "xp", "credits", "high_score_flappy", "high_score_tables",
    "friends", "notepad", "todo",
    /* ASSIGNMENTS (owner, 18 Nov): the person's own school or uni work, JSON, as `todo` is (post-account.gs assignmentsTidy_). */
    "assignments",
    /* THE TIMETABLE WIDGET'S WEEK — what somebody writes down around their sessions. § */
    "timetable"
  ],
  /* ---------- ONE ROW PER QUALIFICATION § */
  qualifications: [
    "person_id", "subject", "level", "grade", "institution", "completed", "teach", "can_teach"
  ],
  /* ---------- ONE ROW PER LIBRARY CARD § */
  library_cards: [
    "person_id", "library", "card_number", "pin"
  ],
  /* ---------- RECEIPTS § */
  /* NAMES IN ONE PLACE (owner, 12 Nov): no tab but people stores a name or handle; an old row's `person_name`/`handle` cell is still read by header as a fallback. */
  receipts: [
    "receipt_id", "kind", "job_id", "order_id", "person_id",
    "issued_on", "total_pence", "currency", "lines", "note",
  ],

  venues: [
    "venue_id", "name", "focus", "borough", "city",
    /* WHERE IT ACTUALLY IS. § */
    "postcode", "lat", "lng",
    "town", "photo", "link", "description",
    "cost_per_hour",
    /* ---------- WHAT IT COSTS TO SEND SOMEBODY HERE § */
    "travel_cost",
    "max_students", "min_students",
    /* TRUE where a booking takes every seat the tutor holds (owner, 8 Nov: the client's house) — a field, so no code checks a name. */
    "takes_all_seats",
    "min_hours", "max_hours", "notice_days",
    "availability", "tutors_happy_here"
  ],
  jobs: [
    "job_id", "status", "subject", "level",
    "service", "weekday", "start_time", "hours_per_session",
    "venue", "client_hosts", "term_name", "session_dates",
    /* WHAT IT COST, beside what it earned. § */
    "price_total", "tutor_pay", "travel_paid", "admin_profit", "max_students",
    /* WHO THE SESSION IS FOR, by name, as the parent ticked them at booking. § */
    /* WHETHER A FAMILY THIS ONE HAS NEVER MET MAY ASK TO JOIN, answered by the client at booking. § */
    "open_to_others",
    "for_children",
    "split_emails", "stealable", "created_at",
    /* WHAT KIND OF SESSION THIS IS, and it is the one column that changes the RULES rather than the facts. § */
    "kind",
    /* WHEN THE LIST SHUTS. § */
    "closes_on",
    /* WHO MADE IT, when that is not the family it is for. § */
    "booked_by",
    /* ---------- WHAT THE BOOKING EARNS, KEPT AS IT WAS AGREED (docs/history/353) § */
    "gross", "tutor_payout", "venue_cost", "materials_charge", "materials_cost", "tickets_cost",
    "card_fees", "discount_type", "discount_value", "discount_code", "discount_absorbed_by",
    "net_profit", "priced_at", "format", "practical_id", "trip_id",
    /* EVERY BOOKED HOUR as grid codes, `m16,m17,f10` (434) — `weekday`/`start_time` kept only the first run. */
    "slot_codes",
    /* THE ROOM INSIDE THE VENUE (owner, 7 Nov): staff fill it in after booking; the family only reads it on the card. */
    "room"
  ],
  events: [
    "event_id", "at", "job_id", "actor",
    "role", "action", "target", "message",
    "request_id"
  ],
  terms: [
    "term_id", "term_name",
    /* WHAT KIND of interval it is: § */
    "kind",
    "display_name",
    "start_date", "end_date", "last_sunday"
  ],
  /* ---------- HERD MENTALITY'S QUESTIONS § */
  herd: ["question_id", "question", "sort_order", "active", "notes"],
  /* A PERSON FACT (kinds.json person.facts.row): `what` one of PERSON_FACT_KEYS (cards-gen.gs), a value may be a range "7-8". */
  facts: ["who", "what", "value", "as_of"],

  /* ---------- `resources` WAS A TAB, THEN A KIND OF ROW, AND IS NOW NEITHER § */
  /* ---------- ONE TAB FOR EVERYTHING THAT IS A THING § */
  shop: [
    "item_id", "name", "brand", "kind", "theme", "description", "photo",
    "audience", "acquire",
    "price_pence", "price_ticks", "price_coins", "value_pence",
    "stock", "max_per_person", "returnable", "contains",
    "level_required", "slot", "art_id",
    "active", "notes"
  ],
  pricing: [
    "kind", "label", "surcharge_per_hour", "note"
  ],
  config: [
    "key", "value", "what_it_does"
  ],
  options: [
    "list_name", "value", "sort_order",
    /* WHAT KIND of thing it is. § */
    "focus"
  ],
  /* ROOMS. A venue is a building; a room is what you actually hire, and Richmond has several at different prices holding different numbers. § */
  rooms: [
    "room_id", "venue", "name", "rate_per_hour",
    "concession_rate", "min_capacity", "max_capacity", "availability",
    "notes", "active"
  ],
  /* A `feed` tab lived here. § */

  /* `widgets` WAS HERE — a tab nothing read; the tools and games are `WIDGETS` in js/map.js (379). */

  /* BRANDING. Key and value, not a column each. § */

  /* ---------- THE REELS, WHICH HAD NO TAB AT ALL § */

  /* THE LAWS — how words are coloured, wherever they appear. § */

  /* POSTS. What the front of the app is: § */
  /* ---------- ONE ROW PER FILM OR SERIES, NOT PER EPISODE § */
  films: [
    "film_id", "title", "year", "kind", "audience", "director", "lead", "seasons",
    "drive_id", "drive_url", "file_kind", "size_gb", "placeholder", "notes", "active",
    "drive_name"
  ],

  /* ONE ROW PER (kind, YouTube id): `kind` reel or video; `hidden` TRUE also hides a repository item with that id (404). */
  media: [
    "media_id", "kind", "yt_id", "url", "title", "channel", "thumb", "subject", "tags",
    "vkind", "age", "notes", "hidden", "added_by", "added_on", "updated_on"
  ],

  posts: [
    /* `file_name` is what the caption was taken FROM. § */
    /* WHETHER IT MAY BE SEEN, and it is NOT the same question as `active` below. § */
    "approved", "approved_by", "approved_on",
    "post_id", "author", "image",
    /* THE FIRST PICTURE'S OWN SIZE IN PX (561, U20), so its box is final before the file arrives. */
    "image_w", "image_h",
    /* ---------- EVERY PICTURE AND CLIP AFTER THE FIRST, AS ONE LIST § */
    "media",
    "caption", "file_name", "body",
    /* Where it was taken. Free text — "Colliers Wood Library", "Wandle Park", "the Tandem Centre". § */
    "location",
    /* WHO ACTUALLY PRESSED THE BUTTON, as against whose name is on the post. A post from
       @family. was still made by a person, and on the day there is more than one admin that is
       the difference between a record and a shrug. */
    "posted_by",
    /* The emoji THIS post offers, if it should differ from the usual set. Almost always blank —
       a shared set is what makes the counts mean anything, and a post with its own five is a
       little world of its own. */
    "reactions",
    /* A POLL, as a comma-separated list of answers: § */
    "poll",
    /* WHEN, and it comes from the FILE rather than from whoever typed the row. A photograph has a
       date already; asking a person to retype it is asking them to get it wrong. */
    /* THREE DATE COLUMNS, and they are not the same fact. § */
    "creation_date", "uploaded_date", "posted_on",
    "pinned", "active",
  ],

  /* `post_likes` WAS HERE — each like became a 👍 and the tab went with `tidy-old-tabs` (379). */

  /* A REACTION is a row, like a like and a vote. Same three reasons: you can see who, nobody
     reacts twice, and somebody can change their mind. */
  post_reactions: [
    "reaction_id", "post_id", "person_id", "emoji", "reacted_on",
  ],

  /* A VOTE is a row, for the same reasons a like is: you can see who voted, one person cannot vote
     twice, and somebody can change their mind. A tally in a cell answers none of those. */
  post_votes: [
    "vote_id", "post_id", "person_id", "choice", "voted_on",
  ],

  /* A COMMENT is a row, and the shape is deliberately the reaction's and the vote's: § */
  post_comments: [
    "comment_id", "post_id", "person_id", "body", "said_on", "active",
  ],

  /* ONE ROW PER DEVICE THAT SAID YES TO NOTIFICATIONS (492). `off`: the kinds this person turned off, the same on each of their rows. */
  push_tokens: [
    "token_id", "person_id", "token", "device", "off", "added_on",
  ],

  /* BUSINESS RECORDS. The business's own paperwork — insurance, tax, registrations, policies, DBS — one row per thing that has a reference, a date it runs out or § */
  records: [
    "record_id", "category", "title", "provider", "reference", "due_on", "cost", "link", "notes",
    "active", "updated_at",
  ],

  /* FAMILY LINKS. A parent asks; the child accepts. § */
  family: [
    "link_id", "parent_id", "child_id", "child_typed", "state", "asked_on", "answered_on",
  ],

  /* `orders` WAS HERE — printing posted to a learner; nothing had made an order since `redeem` went (379). */

  /* ---------- AD CAMPAIGNS § */
  /* ---------- THE LOADING SPLASHES § */

  /* `cheatsheet` WAS HERE and is gone for the reason `questions` is gone, one file along: § */


  /* ---------- FAVOURITES § */
  /* ---------- `questions` WAS HERE, AND IT IS NOT A TAB ANY MORE § */

  /* `boxers` AND `fights` WERE HERE, and they leave together for the same reason and by the same route: § */


  favourites: [
    "fav_id", "person_id",
    /* resource · venue · tutor · shop · subject · topic · link — whatever the searcher calls it */
    "kind", "item_id",
    "at",
  ],

  /* ---------- ANSWERS: WHAT THE CHILD DREW, SO IT IS THERE ON THE NEXT DEVICE § */
  answers: [
    "person_id", "answer_key",
    "value", "edited_at", "saved_at",
  ],

  /* ---------- SUBMISSIONS: EVERY ANSWER SENT, AND WHAT IT WAS MARKED § */
  /* ---------- WORK ON FILE: one row per scan; `pages` are private Drive file ids, read back only through `workFileOpen`. */
  work_files: ["work_id", "person_id", "uploaded_by", "uploaded_at", "title", "subject", "pages", "deleted_at"],

  submissions: [
    "person_id", "key", "label", "words",
    "answer", "verdict", "submitted_at",
    "event_id", "pressed_at",
    /* PHOTOS OF THE WORKING (501): Drive links, never public, read back by `workingOf` alone. */
    "photos",
    /* THE AI'S WRITTEN FEEDBACK WITH ITS SCORE (owner, 15 Nov): read back to the same person only, like the answer. */
    "feedback",
  ],

  /* ---------- REPORTS (395, 486), HISTORY SINCE 494: read once into `claude_notes` by `reports-to-notes`, each row then `migrated`.
     Nothing writes here now. Blank `kind` is a question. */
  reports: [
    "report_id", "at", "person_id",
    "question_id", "paper_id", "part", "label",
    "reason", "note", "finder", "device",
    "status", "status_at",
    "kind", "item_id", "reporter_rank", "status_by",
  ],

  /* ---------- NOTES FOR CLAUDE (484, 494): what should change on one thing ----------
     `status`: open (or blank), done, pending (a non-admin's, 494) or dismissed; open ones are in the Drive file. */
  claude_notes: [
    "note_id", "made_at", "made_by", "column", "item_id", "item_label", "note", "status", "done_at",
  ],

  /* ---------- ERRORS FROM PHONES (O5): one row per distinct message+where+version, counted; never a name, answer or id ---------- */
  client_errors: [
    "error_id", "first_at", "last_at", "count", "devices", "message", "where", "version", "screen",
  ],

  /* ---------- HOW THE SITE FELT ON A PHONE (920): one row per sampled visit; a rank and a device class, never a name or id ---------- */
  health_log: [
    "at", "version", "rank", "device", "load_ms", "find_ms", "long_tasks", "long_ms", "heap_mb", "errors",
  ],

  /* ---------- THE ADMIN'S LENS: one row per change an admin made to somebody else's settings; `fields` names what, never the values ---------- */
  lens_log: [
    "at", "by_id", "for_id", "action", "fields",
  ],

  /* ---------- FAVOURITE LINKS (509): one row per link, in the person's order, ten at most ---------- */
  fav_links: [
    "person_id", "title", "url",
  ],

  /* ---------- APPLICATIONS TO TEACH (400) ----------
     `status` is new, interview, approved or declined, set from the Business column; Approve makes the person Staff. */
  applications: [
    "application_id", "at", "person_id", "status", "status_at",
    "subjects", "qualifications", "dbs_number", "dbs_issued", "dbs_needed", "right_to_work",
    "experience", "availability", "area", "ref1_name", "ref1_contact", "ref2_name", "ref2_contact",
    "statement", "cv_link", "consent",
    /* WHO THEY ARE, THEIR REFEREES IN FULL, THE DBS UPDATE SERVICE TICK AND THE RATE; `*_doc(s)` are links into the private APPLY_FOLDER. */
    "full_name", "phone", "email", "address", "postcode", "dob", "id_doc", "rtw_doc", "qual_docs",
    "ref1_relationship", "ref1_email", "ref1_phone", "ref2_relationship", "ref2_email", "ref2_phone",
    "dbs_update_consent", "rate",
  ],

  /* ---------- THE LIBRARY'S PRIVATE HALF (397): one row per item, its private fields as JSON § */
  lib_questions: ["id", "checksum", "parts", "content_1", "content_2", "content_3", "content_4", "content_5", "content_6"],
  lib_content: ["id", "checksum", "parts", "content_1", "content_2", "content_3", "content_4", "content_5", "content_6"],
  lib_practicals: ["id", "checksum", "parts", "content_1", "content_2", "content_3", "content_4", "content_5", "content_6"],
  lib_projects: ["id", "checksum", "parts", "content_1", "content_2", "content_3", "content_4", "content_5", "content_6"],
  lib_inserts: ["id", "checksum", "parts", "content_1", "content_2", "content_3", "content_4", "content_5", "content_6"],
  /* NOW ONLY THE LIBRARY IMPORT'S LOG LINES (person_id `library-import`); the per-person daily tally went with the cap (owner, 16 Nov). */
  lib_log: [
    "day", "person_id", "served", "ids", "refused", "last_at",
  ],

  /* ---------- THE WEEKLY PARENT EMAIL'S RECEIPTS § */
  digest_log: [
    "week_of", "learner_id", "parent_id",
    "to", "subject", "questions",
    "status", "at", "note",
  ],

  /* ---------- SPOTLIGHT: THE SAME SHAPE AS A FAVOURITE WITH THE PERSON TAKEN OUT § */
  spotlight: [
    "spot_id",
    /* The same two the tile sends: a key whole, and what kind of thing it names. */
    "kind", "item_id",
    "on", "who", "at",
  ],

  /* ---------- A CAMPAIGN IS A DESIGN AND A SCHEDULE, AND IT WAS ONLY EVER THE SCHEDULE § */

  /* ---------- THE WORDS, ONE LINE PER ROW § */

  /* ---------- WHAT THE SEARCH ASKS, AND WHAT IT CALLS IT § */

  /* ---------- AND WHAT THE FIRST TWO QUESTIONS ANSWER § */

  holidays: [
    "holiday_id", "name", "date", "year", "kind",
    /* HOW MANY DAYS BEFORE the date the event goes up, and how long it stays after. § */
    "opens_days", "trail_days",
    /* ---------- AND WHAT THE EVENT ACTUALLY IS § */
    "event_name", "venue", "price_per_child", "max_children", "hours",
    /* One line under the name — "an afternoon at the farm, hot chocolate included". */
    "blurb",
    /* Whether you run something for it. § */
    "active", "notes",
  ],

  /* EXAMS. One row per paper, because a student sits several and nobody knows how many in advance — three columns on `people` works until somebody has four, which § */
  exams: [
    "exam_id", "person_id", "subject", "label", "exam_date", "kind", "board", "notes", "active",
  ],

  /* TRIPS. Deliberately shaped like BOTH the things a trip could turn out to be, because you don't know yet and the columns are the expensive part to change later: § */
  trips: [
    "trip_id", "name", "focus", "description",
    "photo", "link", "provider", "price_per_child",
    "hours", "min_children", "max_children", "venue",
    "address", "date", "notice_days", "active",
    "notes",
    /* ---------- WHAT A TRIP COSTS TO TAKE, FOR THE BOOKING FORM (docs/history/353) § */
    "trip_id", "place", "ticket_child", "ticket_adult", "travel_per_child", "ratio"
  ],
  /* ---------- AN ADMIN'S DISCOUNT CODES (docs/history/353) § */
  promo_codes: ["code", "type", "value", "absorbed_by", "max_uses", "used", "expires", "active", "notes"],
};

/* Every tunable, with a plain-English note and a starting value. § */
/* FAVOURITE LINKS (509): how many one person keeps, and how long a title and an address may be. */
const FAV_LINKS_MAX = SHARED_SETTINGS.limits.favLinksMax, FAV_TITLE_MAX = SHARED_SETTINGS.limits.favTitleMax, FAV_URL_MAX = SHARED_SETTINGS.limits.favUrlMax;
const CONFIG_DEFAULTS = [
  // M, w and open_rate are gone: a tutor now sets one charge-out rate and the minimum wage is fixed
  // in the code. The open rate is ONE row, `open_tutor_rate` below (owner, 21 Nov), which
  // core-price.js reads for No preference bookings and waitlist seats alike.
  ['s', 0, 'each extra subject adds this FRACTION of the base rate. 0.15 = +15%'],
  ['c', 0, "each extra seat adds this fraction — the tutor's share of it. 0.15 = +15%"],
  /* B IS THE DEFAULT NOW, NOT THE CUT (docs/history/345): § */
  ['B', 0, "Not used since 13 Nov: an extra seat costs the tutor's own extra-seat rate, and half of it goes up the manager chain"],
  ['b', 0, 'bulk discount taken off per session AFTER THE FIRST. 0.01 is about 9% off a 10-session term. 0 = off'],

  ['a', 0, 'advance discount taken off per week ahead AFTER THE FIRST. 0 = off'],
  ['h', 2, 'hours per session'],
  ['max_students_per_job', 4, 'seat cap when neither the tutor nor the venue sets one'],
  /* ---------- A VISIT TO SOMEBODY'S HOUSE HAS A FLOOR, AND IT IS EDITORIAL § */
  ['max_open_requests', 2, 'how many live requests one family may hold at once'],

  /* ---------- GOOGLE SIGN-IN, WHICH HAD NO ROW TO SET IT IN § */
  ['google_client_id', '', 'Google Sign-In client ID (the PUBLIC one, ending .apps.googleusercontent.com). Blank switches Google sign-in off. Never put the client SECRET here'],
  ['pages_recheck_days', 30, 'how old a resource page count may get before the nightly job re-reads the file'],

  /* THE REELS PICTURE. Blank means Wikimedia Commons, which needs no key, allows the request from a browser, and answers a search like "octopus underwater" with a § */
  ['giphy_key', '', 'leave BLANK for Wikimedia Commons photographs (no key needed). A Giphy API key switches the reels to GIFs instead'],
  /* WHERE A PROFILE PICTURE CHOSEN IN SETTINGS IS KEPT. § */
  ['photos_folder', '', 'Drive folder id (or its URL) for profile pictures chosen in Settings. BLANK uses the posts folder'],
  /* ---------- WHERE THE FILMS COME FROM, AND IT NEVER LEAVES THE SERVER § */
  ['films_folder', '', 'Drive folder id (or its URL) the admin film search is filled from. BLANK uses the folder synced before, or the one folder named Notflix. Never sent to any phone'],

  /* PRINTING. The file is free and always will be; this is paper and toner, at cost. § */
  /* ---------- THE WAITLIST SESSION § */
  ['waitlist_seats', 4, 'how many seats a waitlist session has. The price divides by this'],
  ['open_tutor_rate', 10, "the hourly rate for a tutor nobody chose (No preference bookings and waitlist seats alike)"],
  ['waitlist_extra_seat', 3, 'added to the HOURLY total for each seat after the first. 3 = £3'],

  /* ---------- WHO CARRIES THE TRAVEL § */
  ['travel_on_client', 0, 'set to 1 to add the venue travel cost to what the client pays, as its own line on the receipt. 0 = you absorb it'],
  /* ---------- WHAT A BOOKING COSTS BEYOND THE TUTOR AND THE ROOM (docs/history/353) § */
  ['card_fee_pct', '', 'card fee as a PERCENT of what the client is charged: 1.5 means 1.5%. Blank = 0. Only the admin Money block and the frozen job row use it; nobody is charged it'],
  ['card_fee_fixed', '', 'card fee in pounds per booking, on top of card_fee_pct: 0.2 means 20p. Blank = 0'],
  ['materials_markup', '', 'a practical\'s kit is charged at cost x this: 1.25 = +25%. Blank = 1, at cost'],

  /* ---------- THE WEEKLY PARENT EMAIL — see backend/digest.gs § */
  ['weekly_digest', 'off', 'the Sunday email to parents: off (nothing), preview (written to the digest_log tab, nothing sent) or send. Anything else = off'],
  ['weekly_digest_hour', 21, 'the hour on Sunday, London time, the weekly parent email goes. 0-23, blank = 21 (9pm). A change re-books itself the next time an admin opens the site'],
  ['weekly_digest_reserve', 10, 'emails a day kept back from the weekly parent email for PIN resets and notices. Blank = 10'],
  /* `weekly_digest_marking` WAS HERE, 12–18 Oct: § */

  /* WHO HEARS ABOUT A CHILD'S FORGOTTEN PIN AND A NEW STAFF APPLICATION (400). Blank = the first admin with a proved address. Never sent to a phone (`CONFIG_PRIVATE`). */
  ['owner_email', '', "the business owner's address: a child's forgotten-PIN link and new tutor applications go here. Blank = the first admin's own email"],
  /* ---------- THE SCHOOL CALENDAR'S OVERRIDES: each blank is settings.json's `calendar` (SHARED_SETTINGS), named in the row's own words. */
  ...SHARED_SETTINGS.calendar.exams.map(e => [e.key, '', 'the start of ' + e.name + ', as MM-DD (every year) or YYYY-MM-DD (one year). Blank = ' + e.at]),
  ['holiday_starts', '', 'school holidays, overriding the calendar\'s usual starts: "MM-DD Name" separated by commas. Blank = '
    + SHARED_SETTINGS.calendar.breaks.map(h => h.starts + ' ' + h.name).join(', ')],
  ['postage_flat', 0, 'one stamp and one envelope for a whole order, not per item. 0 = you do not post, and only collection is offered'],
  // Documentation rows. Read by nobody — written so the sheet explains its own arithmetic.
  /* The formula_* rows lived here. § */
];

/* ---------- A SEED THAT MOVED: `[key, the old value, the old note]` § */
const CONFIG_RESEEDED = [
  /* 6PM ON 25 OCT 2026 (457): the sheet's row still said the old seed's 18, so the hour was kept at 18 every admin load. */
  ['weekly_digest_hour', '18', 'the hour on Sunday, London time, the weekly parent email goes. 0-23, blank = 18. Run installWeeklyDigest again after changing it'],
];

/* ---------- THE CONFIG KEYS NO PHONE IS SENT § */
const FILMS_FOLDER_KEY = 'films_folder';
const OWNER_EMAIL_KEY = 'owner_email';
const CONFIG_PRIVATE = [FILMS_FOLDER_KEY, OWNER_EMAIL_KEY];
/* THE RULES (496): config's `rules` row, `{set, hist}`; js/rules.js registers each rule. A locked one is in RULES_LOCKED and never saved universal. */
const RULES_KEY = 'rules';
/* THE IDS AND THE LOCKED ONES ARE settings.json `siteRules` (SHARED_SETTINGS); tools/shared-lists.js holds js/rules.js to them. */
const RULE_IDS = SHARED_SETTINGS.siteRules.ids;
const RULES_LOCKED = SHARED_SETTINGS.siteRules.locked;
const RULES_HIST_MAX = 20;
/* THE WEEKLY PARENT EMAIL'S WORDS (491): config rows an admin edits on the Site column's preview; blank is this default. {child} {parent} {count} {span} are filled in. */
/* THE FOUR LINES' DEFAULTS ARE data/settings/words.json `digest_*`; a config row of the same key overrides one. */
const DIGEST_WORD_KEYS = ['digest_subject', 'digest_greeting', 'digest_intro', 'digest_footer'];
const DIGEST_WORD_MAX = SHARED_SETTINGS.limits.digestWordMax;
/* The rules row's longest (it once shared the layout's cap). */
const RULES_MAX = 8000;
/* THE SITE'S OWN WORDS (497): one config row of {key: text} an admin types in place over the code's; a piece's longest, and the whole row's. */
const WORDS_KEY = 'words';
const WORDS_PIECE_MAX = 300;
const WORDS_MAX = 40000;
/* NOTES FOR CLAUDE (484): the plain-text file a session reads by exact title, in the library imports folder, and the longest note. */
const CLAUDE_NOTES_FILE = 'Notes for Claude';
/* THE IDS A SESSION HAS ADDRESSED (498), ids only, appended by Claude and read on an admin's open. */
const CLAUDE_NOTES_DONE_FILE ='data/notes-done.json';
/* VIRTUALLY UNLIMITED (562, owner note 119): a sheet cell holds 50,000 characters, so the note stops just short of it. */
const CLAUDE_NOTE_MAX = 40000;

/* ---------- THE FILMS SYNC — see `filmsSync_` in content.gs § */
const FILMS_FOLDER_NAME = 'notflix';
const FILMS_SYNC_PROP = 'FILMS_SYNC';
/* WHO A FILM IS SHARED WITH ON DRIVE, kept ten minutes: a removed share stops showing within that (450). */
const FILMS_SHARE_TTL_S = 600;
const FILMS_SHARE_PREFIX = 'fshare:';
const FILMS_SYNC_BUDGET_MS = 20000;
const FILMS_SYNC_EDITOR_MS = 270000;
const FILMS_SYNC_CEILING_MS = 330000;
/* WHAT EACH LEVEL OF THE TREE IS CALLED, as the map of the folder found it on 9 Oct: `Films` and
   `films`, `Tv shows` and `tv shows`, `s1`..`s6`. Matched, never compared — the case already differs
   between the two audiences. */
const FILMS_RE_FILMS = /^(films?|movies?)$/i;
const FILMS_RE_TV = /^(tv(\s*(shows?|series))?|series|shows?)$/i;
const FILMS_RE_DOCS = /^documentar/i;
const FILMS_RE_SEASON = /^s(?:eason)?\s*0*(\d{1,2})$/i;
/* A FOLDER INSIDE A FILM THAT IS NOT THE FILM — extras, a sample, the subtitles. */
const FILMS_RE_EXTRA = /^(extras?|samples?|featurettes?|bonus|subs?|subtitles?|trailers?)$/i;
/* A VIDEO BY ITS TYPE OR, WHEN DRIVE DID NOT KNOW THE TYPE, BY ITS NAME. § */
const FILMS_RE_VIDEO_EXT = /\.(mkv|mp4|m4v|avi|mov|webm|wmv|mpe?g|ts)$/i;
const FILMS_MIME_DOC = 'application/vnd.google-apps.document';

/* The option lists the CODE owns. § */
const OPTION_DEFAULTS = {
  participant_status: ['Waiting', 'Agreed', 'Paying', 'Booked'],
  action: ['Request', 'Accept', 'Decline', 'Withdraw', 'Pay'],
  // What a tutor teaches or a venue suits. Several may apply, stored comma-separated.
  focus: ['Academic', 'Sporty', 'Other'],
  // First wave sits in May/June, second in November for resits and absentees.
  exam_wave: ['First wave', 'Second wave'],
};

/* ---------- THE CHEAT SHEET COMPONENTS, AS ROWS § */
const CHEATSHEET_DEFAULTS = [
  ['M02', 'Number square',          'SATs, 11+, Y1 Mocks, Y2 Mocks',      '',      94,  true],
  ['M03', 'Times tables',           'SATs, 11+, Y1 Mocks, Y2 Mocks',      '',      100, true],
  ['M04', 'Number line',            'SATs, 11+, Y1 Mocks, Y2 Mocks',      '',      20,  false],
  ['M05', 'Place value',            'SATs, 11+, Y1 Mocks, Y2 Mocks',      '',      15,  true],
  ['M06', 'Measures',               'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      39,  true],
  ['M07', 'Angles named',           'SATs, 11+, Y9 Mocks, GCSE',          '',      28,  true],
  ['M08', 'Protractor',             'SATs, 11+, Y9 Mocks, GCSE',          '',      54,  true],
  ['M09', '2D shapes',              'SATs, 11+, Y2 Mocks',                '',      35,  false],
  ['M10', 'Roman numerals',         'SATs, 11+',                          '',      13,  true],
  ['M11', 'Fraction = decimal',     'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      15,  true],
  ['M12', 'Formulae not given',     'Y9 Mocks, GCSE, B-TEC',              '',      49,  true],
  ['M13', 'Exact trig values',      'GCSE, AS, Alevel',                   'Higher',33,  true],
  ['M14', 'The trig trick',         'GCSE, AS, Alevel',                   'Higher',33,  true],
  ['M15', 'Index laws',             'Y9 Mocks, GCSE, AS, Alevel, B-TEC',  '',      21,  true],
  ['M16', 'Graph shapes',           'Y9 Mocks, GCSE, AS, Alevel',         '',      40,  false],
  ['M17', 'Straight line',          'Y9 Mocks, GCSE, AS, Alevel, B-TEC',  '',      29,  true],
  ['M18', 'Averages',               'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      24,  true],
  ['M19', 'Pythagoras & trig',      'Y9 Mocks, GCSE, B-TEC',              '',      28,  true],
  ['M20', 'Angle rules',            'SATs, 11+, Y9 Mocks, GCSE',          '',      35,  true],
  ['M21', 'Area & perimeter',       'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      23,  true],
  ['M22', 'Percentages',            '11+, Y9 Mocks, GCSE, B-TEC',         '',      23,  true],
  ['M23', 'Rounding & bounds',      'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      35,  true],
  ['M24', 'Standard form',          'Y9 Mocks, GCSE, AS, Alevel, B-TEC',  '',      35,  true],
  ['M25', 'Sequences',              '11+, Y9 Mocks, GCSE',                '',      41,  true],
  ['M26', 'Quadratics',             'Y9 Mocks, GCSE, AS, Alevel',         '',      23,  false],
  ['M27', 'Probability',            'Y9 Mocks, GCSE, B-TEC',              '',      28,  true],
  ['M28', 'Primes, HCF & LCM',      'SATs, 11+, Y9 Mocks, GCSE',          '',      23,  false],
  ['M29', 'Sine & cosine rule',     'GCSE, AS, Alevel',                   'Higher',18,  false],
  ['M30', 'Circle theorems',        'GCSE',                               'Higher',28,  false],
  ['M31', 'Fractions',              'SATs, 11+, Y9 Mocks, GCSE, B-TEC',   '',      35,  true],
  ['M32', 'Differentiation',        'AS, Alevel',                         '',      40,  true],
  ['M33', 'Differentiation rules',  'Alevel',                             '',      29,  true],
  ['M34', 'Integration',            'AS, Alevel',                         '',      40,  true],
  ['M35', 'Integration methods',    'Alevel',                             '',      35,  true],
  ['M36', 'Logs & exponentials',    'AS, Alevel',                         '',      23,  true],
  ['M37', 'Binomial expansion',     'AS, Alevel',                         '',      17,  true],
  ['M38', 'Trig identities',        'AS, Alevel',                         '',      23,  true],
  ['M39', 'Double & addition',      'Alevel',                             '',      23,  false],
  ['M40', 'Radians',                'Alevel',                             '',      23,  true],
  ['M41', 'Series',                 'Alevel',                             '',      23,  false],
  ['M42', 'Circles & points',       'AS, Alevel',                         '',      23,  false],
  ['M43', 'Vectors',                'AS, Alevel',                         '',      29,  true],
  ['M44', 'SUVAT & forces',         'AS, Alevel',                         '',      29,  true],
  ['M45', 'Binomial distribution',  'AS, Alevel',                         '',      35,  true],
  ['M46', 'Normal distribution',    'Alevel',                             '',      29,  true],
  ['M47', 'Hypothesis testing',     'AS, Alevel',                         '',      23,  true],
  ['M48', 'Numerical methods',      'Alevel',                             '',      23,  false],
];

/* RENAME A VALUE EVERYWHERE IT IS USED. § */
const RENAMEABLE = [
  ['options',   ['value']],
  ['pricing',   ['label']],
  /* NOT JUST THE SUBJECT. § */
  /* ---------- A RENAME NO LONGER REACHES THE LIBRARY, AND THAT HAS TO BE SAID § */
  ['jobs',      ['subject', 'level']],
  ['qualifications', ['subject', 'level']],
  ['exams',     ['subject']],
  ['trips',     ['subject']],
];

/* ---------- TAB ACCESS § */
const _cache = {};
/* ---------- AND WHAT THE PEOPLE TAB SAYS ABOUT CHILDREN, WORKED OUT ONCE PER REQUEST § */
let KID_MEMO_ = null;
/* ---------- AND WHO THE NET IS WORKING FOR, THIS REQUEST § */
let NET_VIEWER_ = null;
/* HOW MANY EARLIER WHOLE NAMES `name_was` KEEPS. § */
const NAME_WAS_KEEP = 10;

/* ---------- A WRITE THAT GOES NOWHERE § */
let WRITE_MISSES = [];

/* ---------- THE CALLBACK, WHEN THE PAGE CANNOT MAKE AN ORDINARY REQUEST § */
let JSONP_CB = '';

/* ---------- SMALL HELPERS -------------------------------------------------------------------- */
const S = v => String(v ?? '').trim();
const N = v => { const x = parseFloat(String(v ?? '').replace(/[£$,\s]/g, '')); return isNaN(x) ? 0 : x; };
const norm = v => S(v).toLowerCase();
const key = v => S(v).toLowerCase().replace(/[^a-z0-9]/g, '');   // name match that ignores spacing
const TRUE_ = v => /^(true|yes|1|✓)$/i.test(S(v));
/* A blank flag means YES. § */
const ON_ = v => S(v) === '' || TRUE_(v);

/* ---------- AVAILABILITY ---------------------------------------------------------------------
   One cell, "m13,m14,tu09", replacing 77 TRUE/FALSE columns. */
const AVAIL_DAYS  = SHARED_SETTINGS.days.map(([code, day]) => [code, day.slice(0, 3)]);
/* ---------- THREE LIBRARY CARDS, AS NINE FORM FIELDS OVER ONE CELL § */
const LIBRARY_CARDS = SHARED_SETTINGS.limits.libraryCards;
const LIBRARY_FIELDS = (() => {
  const out = [];
  for (let i = 1; i <= LIBRARY_CARDS; i++) out.push('lib' + i + '_name', 'lib' + i + '_no', 'lib' + i + '_pin');
  return out;
})();
/* ONE TEST, EVERY READER. § */
const LIBRARY_FIELD = /^lib\d+_(name|no|pin)$/;

/* ---------- EIGHT MORE PHOTOGRAPHS, AS EIGHT FORM FIELDS OVER ONE CELL § */
const PHOTO_MAX = SHARED_SETTINGS.limits.photoMax;
const PHOTO_FIELDS = (() => {
  const out = [];
  for (let i = 1; i <= PHOTO_MAX; i++) out.push('photos_' + i);
  return out;
})();
const PHOTO_FIELD = /^photos_\d+$/;

/* ---------- YOUR PICTURE CAN BE ONE OF OURS, OR YOUR OWN FIGURE § */
/* OURS ARE data/settings/default-pictures.json, as SHARED_SETTINGS.pictures (cards-gen); js/links.js PFP_ART draws each. */
const PFP_PICTURES = SHARED_SETTINGS.pictures;
const PFP_AVATAR = 'pfp:avatar';
const PFP_CHOICES = [PFP_AVATAR].concat(PFP_PICTURES.map(p => 'pfp:' + p));

/* ---------- UP TO TEN QUALIFICATIONS, AS FORTY FORM FIELDS OVER ONE CELL § */
const QUAL_MAX = 20;
const QUAL_FIELDS = (() => {
  const out = [];
  for (let i = 1; i <= QUAL_MAX; i++) out.push('qual_' + i, 'qual_' + i + '_level', 'qual_' + i + '_board',
    'qual_' + i + '_grade', 'qual_' + i + '_received', 'qual_' + i + '_teach', 'qual_' + i + '_spec');
  return out;
})();
/* ---------- UP TO SIX JOBS, FOUR BOXES EACH OVER ONE CELL (8 Nov): role, where, from, to (or "now"). */
const JOB_MAX = SHARED_SETTINGS.limits.jobMax;
const JOB_PARTS = ['role', 'where', 'from', 'to'];
const JOB_FIELDS = (() => {
  const out = [];
  for (let i = 1; i <= JOB_MAX; i++) JOB_PARTS.forEach(k => out.push('job_' + i + '_' + k));
  return out;
})();
const JOB_FIELD = /^job_\d+_(role|where|from|to)$/;
/* THE INTRO VIDEO'S LIMITS, asked on the phone before sending and again here: about a minute, 100 MB. */
const VIDEO_MAX_BYTES = 100 * 1024 * 1024;
/* THE SCRIPT PROPERTY HOLDING THE PRIVATE FOLDER'S ID — made on the first upload, never written in the repository. */
const VIDEO_FOLDER_PROP = 'TUTOR_VIDEOS_FOLDER';
const VIDEO_FOLDER_NAME = 'Tutor videos';
/* AND THE EXTRA PHOTOS' FOLDER, the same way: a Script Property made on the first upload; 5 MB caps a 1200px JPEG generously. */
const PHOTO_FOLDER_PROP = 'TUTOR_PHOTOS_FOLDER';
const PHOTO_FOLDER_NAME = 'Tutor photos';
const PHOTO_FILE_MAX_BYTES = 5 * 1024 * 1024;
/* `_received`, `_teach` AND `_spec` ARE THE THREE THE ITEM GREW, and they replace two pages. § */
const QUAL_FIELD = /^qual_\d+(_level|_board|_grade|_received|_teach|_spec)?$/;


/* ---------- A DATE OF BIRTH IS THREE NUMBERS SOMEBODY REMEMBERS, NOT A DATE THEY PICK § */
/* THE PHONE AS A COUNTRY CODE AND A NUMBER, one cell (`phone`, "+44 7700 900123") — see
   `phoneOut`/`phoneIn` in js/form.js (cards-gen.gs). The list is the codes offered; the first is the default. */
const PHONE_FIELDS = ['phone_cc', 'phone_no'];
const PHONE_FIELD = /^phone_(cc|no)$/;
const PHONE_CODES = ['+44', '+1', '+353', '+33', '+49', '+34', '+39', '+351', '+48', '+40',
                     '+91', '+92', '+234', '+27', '+61', '+971', '+31', '+32', '+41', '+46', '+90', '+880', '+86', '+63'];
const DOB_FIELDS = ['dob_d', 'dob_m', 'dob_y'];
/* ONE TEST, EVERY READER — the `LIBRARY_FIELD` argument, and for the same three jobs: keeping these
   three out of the column check, out of `wanted`, and out of what `profileOf_` reads as a column. */
const DOB_FIELD = /^dob_[dmy]$/;

/* ---------- AND THE COLUMNS THAT ARE EDITED AS A DATE PICKER RATHER THAN AS TEXT § */
const DATE_COLS = ['exam_small_date', 'exam_big_date'];
/* ---------- NINE TILL NINE, THE SAME SPAN AS THE BOOKING GRID (owner, 11 Nov; codes extended, never renumbered) § */
const AVAIL_HOURS = SHARED_SETTINGS.hours;

/* ---------- PEOPLE --------------------------------------------------------------------------- */
/* THE ROLES ARE settings.json `roles` (owner, 17 Nov): ids in order of precedence, each its label, aliases, app word, rank and tier. */
/* ROLES_, ROLE_IDS, ROLE_ALIASES, RANKS and rankTier_ are the SHARED block's (data/settings/roles.js), the site's too. */
const ROLE_LABEL = Object.fromEntries(ROLE_IDS.map(r => [r, ROLES_.ids[r].label]));
/* ---------- A TITLE IS A ROLE THAT DECIDES NOTHING, AND SAYING SO IS THE WHOLE POINT § */
const ROLE_TITLES = ROLES_.titles;
/* ---------- THE ROLES A PERSON MAY TICK FOR THEMSELVES, AND THE ONE THEY MAY NOT § */
const SELF_ROLES = ROLE_IDS.filter(r => ROLES_.ids[r].self);
/* ONE LIST OF ROLE WORDS (ROLE_ALIASES, SHARED): sent by doGet as `roleAliases`, read by the site's `roleOf`. */
/* AN OLD WORD FOR A ROLE A PERSON MAY TICK FOR THEMSELVES, as that role; '' for any other word (admin is never ticked). */
function selfRoleAlias_(x) { const to = ROLE_ALIASES[x]; return to && SELF_ROLES.indexOf(to) !== -1 ? to : ''; }

/* ---------- AND A TICKED TUTOR IS A TUTOR THE BUSINESS HAS NOT SAID YES TO YET § */
const LISTED_PENDING = 'PENDING';

/* POSTCODES INTO COORDINATES. § */
/* THE POSTCODES I COULD VERIFY, from each council's own pages. § */
/* ---------- `KNOWN_FAMILIES` WAS HERE, AND IT WAS REAL CHILDREN'S NAMES IN A PUBLIC REPOSITORY § */

const KNOWN_POSTCODES = {
  'Colliers Wood Library': 'SW19 2HR',
  'Mitcham Library':       'CR4 2YR',
  'Morden Library':        'SM4 5DX',
  'York Gardens Library':  'SW11 2UG',
};

/* ---------- THE MAP, FROM OPENSTREETMAP § */

/* What each world covers. A box round the borough, generous enough to hold the commons that sit on
   its edge — the map is drawn to about three miles, so the data has to reach at least that far. */
const MAP_BOXES = {
  Merton:     [51.3880, -0.2560, 51.4480, -0.1420],
  Wandsworth: [51.4380, -0.2320, 51.4900, -0.1300],
  Richmond:   [51.4200, -0.3480, 51.4920, -0.2600],
  Sutton:     [51.3300, -0.2500, 51.3960, -0.1300],
};

/* The folder, written in. § */
const POSTS_FOLDER = '1piJQHYQ2h3I_f3ullEmDcNn_RGti4VVw';


/* ---------- HOW MANY SUBMISSIONS ONE `submitAnswer` MAY CARRY § */
const SUBMISSIONS_PER_POST = SHARED_SETTINGS.submissionsPerPost;
/* ---------- PHOTOS OF THE WORKING (501): three pages, each shrunk on the phone to about 500 KB (base64 is 4/3 of that, and some room) */
const WORKING_PHOTOS_MAX = 3, WORKING_PHOTO_CHARS = 760000, WORKING_ROWS_MAX = 10;
const WORKING_LINK = /^https:\/\/drive\.google\.com\/file\/d\/([\w-]{10,})\/view$/;
/* THE ANSWER A ROW HOLDS WHEN NOTHING WAS TYPED -- the column is never blank. */
const WORKING_ANSWER = '(photo of working)';
/* THE WHOLE VOCABULARY OF `submissions.verdict`: § */
/* THE AI'S FEEDBACK ON A SUBMISSION, cut to this (submit.js SUB_FEEDBACK_MAX says the same). */
const SUBMISSION_FEEDBACK_MAX = 2000;
/* A SUBMISSION'S KEY IS THE QUESTION'S (`q:<id>`), never the phone's box key: `ans:u:<person>:` stripped, as `subKeyOf_` (submit.js) does — the old photo path sent the box key, and those rows never came back to the box. */
const submissionKey_ = k => String(k == null ? '' : k).trim().replace(/^ans:(?:u:[^:]+:)?/, '');
const SUBMISSION_VERDICT = /^(right|wrong|sent|(?:ai|rule):\d{1,3}\/[1-9]\d{0,2})$/;
/* AND THE PHONE'S NAME FOR A PRESS — its clock in ms, a dash, a random tail (`subId_` in js/submit.js).
   Checked for its shape so a retried send is recognised and nothing else rides in the column. */
const SUBMISSION_ID = /^\d{10,16}-[a-z0-9]{3,16}$/;
/* ---------- AND THE NAME OF A PRESS NOBODY MADE THIS WEEK: WORK CARRIED OVER FROM BEFORE THE SWITCH § */
const SUBMISSION_CARRIED = /^\d{10,16}-m[a-z0-9]{14}$/;
/* AND HOW LONG A QUESTION'S NAME MAY BE. § */
const ATTEMPT_LABEL_MAX = 120;
/* AND A QUESTION'S WORDS — SCHEMA.submissions. § */
const ATTEMPT_WORDS_MAX = 1200;

/* ---------- A REPORTED QUESTION (395): the reasons a child can choose, by the id the phone sends; the sheet keeps the words. */
const REPORT_REASONS = {
  'answer-wrong': 'The answer is wrong',
  'marked-wrong': 'It marked me wrong but I was right',
  'unreadable': "Can't read it / picture missing",
  'broken': "Doesn't work",
  'other': 'Something else',
  /* 486: a card or widget, and a post (413's reasons). */
  'wrong': 'Something in it is wrong',
  'unkind': 'Unkind or bullying',
  'unsafe': 'It makes me feel unsafe',
  'rude': 'Rude, or a picture that should not be there',
  'stranger': "Spam, or I don't know them",
  /* 489: suggesting a change and reporting are one tile. */
  'suggest': 'Suggest a change',
};
/* AND WHAT AN ADMIN MAY CALL ONE (486); `not a problem` is kept as dismissed for an old phone. */
const REPORT_STATUSES = ['open', 'confirmed', 'dismissed', 'fixed', 'not a problem'];
/* WHAT CAN BE REPORTED: any card kind or widget — a lower-case word, as the phone's `x.kind`. */
const REPORT_KIND_RE = /^[a-z]{2,20}$/;
const REPORT_FIELD_MAX = 120;
/* THE OPEN ONES AN ADMIN IS SENT AT ONCE, newest first; the count is of all of them. */
const REPORTS_LIST_MAX = 100;

/* ---------- APPLYING TO TEACH (400) ---------- */
const APPLICATION_STATUSES = ['new', 'interview', 'approved', 'declined'];
/* THE ONES STILL WAITING ON THE ADMIN — what the Business column counts as "needs you". */
const APPLICATION_OPEN = ['new', 'interview'];
const APPLICATION_FIELD_MAX = 120;
const APPLICATION_TEXT_MAX = 1500;
/* AN APPLICATION'S DOCUMENT PHOTOS, each a data URL (8MB is far over a 1200px JPEG); at most three of qualifications. */
const APPLY_DOC_MAX = 8 * 1048576;
const APPLY_QUAL_DOCS_MAX = 3;

/* ---------- HOW MUCH OF AN ANSWER THE SHEET KEEPS — SCHEMA.answers AND SCHEMA.submissions § */
const ANSWER_TEXT_MAX = SHARED_SETTINGS.answerTextMax;
const ANSWER_PAD_MAX = 40000;
const ANSWERS_PER_POST = 25;


/* ---------- THE WEEKLY PARENT EMAIL — see backend/digest.gs § */
const DIGEST_MODES = ['off', 'preview', 'send'];
const DIGEST_TZ = 'Europe/London';
const DIGEST_RUN = 'weeklyDigestRun';
/* THE HANDLERS OF TRIGGERS NOTHING RUNS ANY MORE, BY NAME — the one place each old name is still written, because a trigger is found by that string and nothing § */
const DIGEST_RETIRED_RUNS = ['sessionRecapRun', 'digestMarkRun'];
const DIGEST_RETIRED_PROPS = ['DIGEST_MARKING', 'DIGEST_MARK_TRIED', 'DIGEST_MARK_AGAIN'];
/* `DIGEST_BOOKED`: the hour `installWeeklyDigest` booked the email at, kept in Script Properties. § */
const DIGEST_BOOKED = 'DIGEST_BOOKED_HOUR';
/* ---------- WHERE THE EMAIL FINDS EACH QUESTION: THE SITE'S OWN COPY OF THE LIBRARY § */
const DIGEST_LIBRARY_PATH = 'data/questions.json';
/* THE ENTITIES THE LIBRARY'S MARKUP USES, AS CHARACTERS — every named one in data/questions.json on 12 Oct, counted. § */
const DIGEST_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', thinsp: ' ', emsp: ' ', ensp: ' ',
  mdash: '—', ndash: '–', minus: '−', times: '×', divide: '÷', frasl: '/', deg: '°', pound: '£',
  radic: '√', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', middot: '·', bull: '•',
  sup2: '²', sup3: '³', frac12: '½', frac14: '¼', frac34: '¾', frac13: '⅓', le: '≤', ge: '≥', ne: '≠',
  asymp: '≈', equiv: '≡', prop: '∝', infin: '∞', int: '∫', plusmn: '±', rarr: '→', cap: '∩', cup: '∪',
  prime: '′', pi: 'π', theta: 'θ', alpha: 'α', beta: 'β', gamma: 'γ', lambda: 'λ', mu: 'μ', micro: 'µ',
  nu: 'ν', rho: 'ρ', sigma: 'σ', epsilon: 'ε', omega: 'ω', Omega: 'Ω', Delta: 'Δ', Sigma: 'Σ',
  Lambda: 'Λ', eacute: 'é',
};
/* HOW MANY QUESTIONS THE WEEKLY EMAIL LISTS, each with its own words (`digestQuestions_`), before "…and N more." § */
const DIGEST_WEEK_LIST_MAX = 80;
/* THE SHAPE OF A LIBRARY KEY: § */
const DIGEST_KEY_SHAPE = /^[a-z]{1,4}:[A-Za-z0-9][A-Za-z0-9()_-]{0,100}$/;

/* `digestWordsSafe_` (digest.gs): § */
const DIGEST_WORDS_REFUSE = [
  /:\/\/|\bwww\.|@/i,
  /\b[a-z0-9-]+\.[a-z]{2,}\b/i,
  /[A-Za-z0-9][\uFF0E\u3002\uFF61\u2024][A-Za-z]/,
  /(?:\+44\s?7\d{3}|\b07\d{3})\s?\d{3}\s?\d{3}\b/,
  /* A LANDLINE AS IT IS WRITTEN: `020 7946 0018`, London's 3-4-4, passed the 4-3-4 this was, and so did
     `+44 20 7946 0018`. Still not one library question refused (check-digest.js measures it). */
  /(?:\+44\s?|\b0)[12]\d{1,3}\s?\d{3,4}\s?\d{3,4}\b/,
  /\b\d{8,}\b/,
  /\b\d\d-\d\d-\d\d\b/,
];

/* THE MOST ONE SUNDAY EMAIL'S HTML WEIGHS, IN UTF-8 BYTES: Gmail clips past about 102 KB (hides the rest behind "View entire message", footer and all); 90 000 leaves room for the headers and the encoding. */
const DIGEST_CLIP_BYTES = 90000;
/* AND WHAT IT DOES BEFORE SPLITTING A WEEK INTO PARTS: each question's words to their first sentence, or this many characters, ending "…" (`digestFirst_`). */
const DIGEST_TRIM_CHARS = 160;
/* THE MOST THE SHARED <style> BLOCK MAY GROW BY (`digestSlim_`): Gmail drops a <style> past 16 KB whole, and every colour with it. */
const DIGEST_STYLE_MAX = 9000;
/* HOW MUCH OF A QUESTION'S WORDS THE WEEKLY EMAIL PRINTS — its own ask, and the stem it shares with its other parts, printed once above them (`digestQuestions_`). § */
const DIGEST_WORDS_SHOWN = 400;
const DIGEST_STEM_SHOWN = 300;
/* ---------- EACH QUESTION AS IT IS ON THE SITE, AND ITS PICTURE (18 Oct, docs/history/351) § */
const DIGEST_PNG_DIR = 'data/diagrams/';
const DIGEST_PNG_HEX = 12;
const DIGEST_PNG_WIDTH = 340;

/* ---------- WHAT THE BUSINESS IS CALLED, ON THE SERVER § */
const BRAND_NAME = '@family.';

/* ---------- THE SHEET'S WORDS AND THE APP'S WORDS § */
const ROLE_TO_APP = Object.fromEntries(ROLE_IDS.filter(r => ROLES_.ids[r].app).map(r => [r, ROLES_.ids[r].app]));
const ROLE_FROM_APP = Object.fromEntries(ROLE_IDS.filter(r => ROLES_.ids[r].app).map(r => [ROLES_.ids[r].app, r]));

/* ---------- AVATARS § */
const AVATAR_ITEMS = [
  // --- free ---
  { id: 'none',      slot: 'headwear',  name: 'Nothing',    free: true },
  { id: 'none',      slot: 'faceware',  name: 'Nothing',    free: true },
  { id: 'none',      slot: 'shoulders', name: 'Nothing',    free: true },
  { id: 'none',      slot: 'handheld',  name: 'Nothing',    free: true },
  { id: 'plain',     slot: 'legs',      name: 'Plain',      free: true },
  { id: 'crop',      slot: 'hair',      name: 'Cropped',    free: true },

  /* hairstyles. The SHAPE is the item; the colour is free and set in the profile, so four styles across eight colours is thirty-two looks from four purchases. § */
  { id: 'fringe',    slot: 'hair',      name: 'Fringe',     level: 1 },
  { id: 'long',      slot: 'hair',      name: 'Long hair',  level: 3 },
  { id: 'bunches',   slot: 'hair',      name: 'Bunches',    cost: 15 },
  { id: 'curls',     slot: 'hair',      name: 'Curls',      cost: 20 },
  { id: 'mohawk',    slot: 'hair',      name: 'Mohawk',     level: 6 },

  // --- headwear ---
  { id: 'cap',       slot: 'headwear',  name: 'Cap',        level: 2 },
  { id: 'beanie',    slot: 'headwear',  name: 'Beanie',     cost: 20 },
  { id: 'headband',  slot: 'headwear',  name: 'Headband',   level: 4 },
  { id: 'crown',     slot: 'headwear',  name: 'Crown',      level: 10 },

  // --- faceware ---
  { id: 'glasses',   slot: 'faceware',  name: 'Glasses',    level: 1 },
  { id: 'shades',    slot: 'faceware',  name: 'Shades',     cost: 15 },
  { id: 'goggles',   slot: 'faceware',  name: 'Goggles',    level: 5 },

  // --- shoulders ---
  { id: 'scarf',     slot: 'shoulders', name: 'Scarf',      level: 2 },
  { id: 'backpack',  slot: 'shoulders', name: 'Backpack',   cost: 30 },
  { id: 'cape',      slot: 'shoulders', name: 'Cape',       level: 8 },

  // --- handheld ---
  { id: 'book',      slot: 'handheld',  name: 'Book',       level: 1 },
  { id: 'racket',    slot: 'handheld',  name: 'Racket',     level: 3 },
  { id: 'ball',      slot: 'handheld',  name: 'Football',   cost: 25 },
  { id: 'wand',      slot: 'handheld',  name: 'Wand',       cost: 40 },

  // --- legs ---
  { id: 'shorts',    slot: 'legs',      name: 'Shorts',     level: 2 },
  { id: 'jeans',     slot: 'legs',      name: 'Jeans',      level: 3 },
  { id: 'skirt',     slot: 'legs',      name: 'Skirt',      level: 3 },
];

/* ---------- THE FOUR FIELDS THAT ARE THE QUOTE § */
const PRICING_FIELDS = ['rate_per_hour', 'extra_seat_rate', 'max_students', 'min_students'];
/* THE MOST AN HOUR MAY BE, so a slip of the thumb (2500 for 25.00) is refused, not published (405). The phone's `STAFF_RATE_MAX` is the same. */
const RATE_MAX = 200;
/* AN EXTRA SEAT COSTS AT MOST WHAT THE FIRST STUDENT DOES (620): the tutor's share of it, 0 to 1 of the rate. */
const SEAT_RATE_MAX = 1;

/* ---------- AND THE BUSINESS'S CUT OF AN EXTRA SEAT, WHICH IS ON THE RATE PAGE AND NOT THE FIFTH OF THEM § */
const SEAT_CUT_FIELD = 'extra_seat_cut';
/* WHO A TUTOR ANSWERS TO, a tutor's own choice (owner, 13 Nov: a manager who poaches loses tutors). `managerRefusal_` checks it. */
const MANAGER_FIELD = 'manager';

/* ---------- THE AGES A TUTOR MAY SAY THEY TEACH, AS ONE LIST THE FORM AND THE RULE BOTH READ § */
const AGE_FIELDS = ['age_min', 'age_max'];
const AGE_OPTIONS = ['4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18',
                     'Adults'];

/* ---------- HOW LONG A SESSION WITH THEM IS, SHORTEST TO LONGEST — WRITABLE SINCE docs/history/330 § */
const SESSION_FIELDS = ['min_hours', 'max_hours'];
const SESSION_OPTIONS = ['1', '2', '3', '4', '5', '6'];

/* ---------- WHAT A TUTOR/CLIENT MAY EDIT § */
const PROFILE_GROUPS = {
  /* ---------- EIGHT PAGES, NOT TWELVE § */
  /* THE AGE RANGE IS HERE, AFTER THE YEARS OF EXPERIENCE, and not on the rate page beside the group size it looks like: § */
  'About you':   ['first_name','last_name','headline','years_experience'].concat(AGE_FIELDS,
                  ['favourite_colour','adjective_1','adjective_2','adjective_3']),
  /* ---------- CONTACT IS SECOND NOW, AND THE ORDER OF THIS OBJECT IS THE ORDER OF THE COLUMN § */
  /* ---------- CONTACT SECOND, AND FOR A TUTOR IT IS ONE PAGE WITH WHERE NOW § */
  'Contact & address': ['email','phone','date_of_birth','city','town','borough','postcode','address','travel_km',
                        /* THE VENUES THEY ARE HAPPY AT — a form name over `venues.tutors_happy_here`,
                           not a column here; see `venuesWrites_` in core.gs. */
                        'venues_ok'],
  /* ---------- THE PHOTOGRAPHS, ON A PAGE OF THEIR OWN § */
  /* THE INTRO VIDEO IS UPLOADED, NOT LINKED (8 Nov): `videoPart`, so `video` is no box here. */
  'Photos': ['photo'].concat(PHOTO_FIELDS),
  /* THE QUOTE, THEN HOW LONG A SESSION IS — `SESSION_FIELDS`' note says why they share a page and not a clock. */
  /* AND THE BUSINESS'S CUT OF AN EXTRA SEAT straight after the tutor's own share, as the card reads them — an
     admin's to write, which `seatCutRefusal_` decides, not this list (`SEAT_CUT_FIELD` above says why). */
  'Your rate and group size': PRICING_FIELDS.slice()
                                .concat(SESSION_FIELDS, [MANAGER_FIELD]),
  /* WHAT YOU TEACH, WHAT YOU ARE STUDYING AND ANYTHING ELSE — one page, because they are the
     three answers to "what do you know". `Qualifications` beside it is the graded list. */
  /* ---------- WHAT YOU SPECIALISE IN, THEN WHAT ELSE YOU TEACH § */
  /* ---------- AND THEN THE PAGE WENT § */
  /* ---------- ONE PAGE FOR ALL THREE, NOT THREE PAGES WITH A SAVE EACH § */
  'Qualifications': QUAL_FIELDS,
  /* CURRENT AND PAST JOBS, added one line at a time like the qualifications (8 Nov). */
  'Jobs': JOB_FIELDS,
  'Availability': AVAIL_DAYS.reduce((a, [p]) => a.concat(AVAIL_HOURS.map(h => p + String(h).padStart(2,'0'))), []),
  /* A NOTE TO YOURSELF, not a credential this site issues or checks — see the columns in SCHEMA. § */
  'Library cards': LIBRARY_FIELDS,
};
const CLIENT_GROUPS = {
  'About you': ['first_name','last_name','photo'],
  /* The address, because a printed copy has to go somewhere. § */
  'Contact & address': ['email','phone','city','town','borough','postcode','address'],
  'Library cards': LIBRARY_FIELDS,
};
const STUDENT_GROUPS = {
  /* ---------- THE TWO EXAMS ARE ON THE FIRST PAGE NOW § */
  'About you': ['first_name','last_name','date_of_birth','photo','exam_small_date','exam_big_date'],
  'Contact & address': ['email','phone','city','town','borough','postcode','address'],
  'Library cards': LIBRARY_FIELDS,
};
/* `RESOURCE_GROUPS` WAS HERE — the seven sections of the admin form that relabelled a paper, and `RESOURCE_EDITABLE` was its flattened allow-list. § */

/* ONE map: which list in `options` fills a field's dropdown. § */
const FIELD_OPTIONS = {
  /* NOT ONE PER SHELF SLOT. § */
  qual_1: 'subject', qual_2: 'subject', qual_3: 'subject',
  qual_1_level: 'level', qual_2_level: 'level', qual_3_level: 'level',
  qual_1_grade: 'grade', qual_2_grade: 'grade', qual_3_grade: 'grade',
  /* `qual_N_board` HAS NO LIST NOW. § */
  borough: 'borough', city: 'city', town: 'town', focus: 'focus',
  // resources
  subject: 'subject', document_type: 'document_type', key_stage: 'key_stage',
  tier: 'tier', exam_board: 'exam_board', exam_wave: 'exam_wave',
  company: 'company', band_type: 'band_type',
};
/* ---------- AND THE LISTS THE CODE OWNS, sent in the same `validations` shape § */
const FIELD_FIXED = { age_min: AGE_OPTIONS, age_max: AGE_OPTIONS,
                      min_hours: SESSION_OPTIONS, max_hours: SESSION_OPTIONS };
/* `RESOURCE_OPTIONS` WAS AN ALIAS FOR `FIELD_OPTIONS`, kept because the resource form read it under that name. § */

const VENUE_GROUPS = {
  'Details':  ['name','description','photo','link'],
  /* The coordinates are not here. They are derived from the postcode and overwritten by the
     geocoder, so a hand-typed one would be silently replaced — which is worse than not offering
     the field at all. */
  'Where':    ['postcode','borough','city','town'],
  'Capacity & booking': ['max_students','min_students','notice_days'],
  /* The room, and the journey to it. Two costs of the same booking, edited together because
     that is how somebody thinks about a venue: what does this place cost me. */
  'Rate':     ['cost_per_hour', 'travel_cost'],
};
const flat = g => Object.keys(g).reduce((a, k) => a.concat(g[k]), []);
const PROFILE_EDITABLE = [...new Set([].concat(flat(PROFILE_GROUPS), flat(CLIENT_GROUPS), flat(STUDENT_GROUPS)))];
// Admin-only. `role` decides what someone can see and do, so it can't be self-served — and it's a
// comma list, because holding two roles is normal rather than an exception.
const PROFILE_READONLY = ['dbs_checked', 'role'];

/* WHAT A PERSON MAY CALL THEMSELVES `handle` IS NOT IN `PROFILE_EDITABLE` AND MUST NOT BE. § */

/* `HANDLE_COOLDOWN_DAYS` WAS HERE — a month between handle changes, because a blocklist is a floor and never a ceiling and somebody free to type variations wins § */

/* ---------- A MONTH ON WHAT A TUTOR CHARGES § */
const PRICING_COOLDOWN_DAYS = 30;

/* A HANDLE'S SHAPE (HANDLE_SHAPE) is js/form.js's, copied into cards-gen.gs. */

/* NAMES THAT WOULD SPEAK FOR THE BUSINESS. Someone called @office or @admin messaging a parent is
   not rude, it is a person with the school's voice — and the roles system cannot help, because the
   name is what the parent reads. */
const HANDLE_RESERVED = ['admin', 'administrator', 'family', 'atfamily', 'office', 'staff', 'team',
                         'support', 'help', 'helpdesk', 'moderator', 'mod', 'owner', 'root',
                         'system', 'tutor', 'tutors', 'school', 'official', 'payments', 'billing',
                         'security', 'noreply', 'no_reply', 'contact', 'info'];

/* ---------- THE WORDS, AND WHAT THIS LIST IS AND IS NOT § */
const HANDLE_BLOCKED = [
  'anal', 'anus', 'arse', 'bastard', 'bitch', 'bollock', 'boner', 'clit', 'cock', 'coon', 'cum',
  'cunt', 'dick', 'dildo', 'dyke', 'fag', 'fanny', 'fuck', 'gash', 'gook', 'incest', 'jizz',
  'kike', 'knob', 'minge', 'nigg', 'nonce', 'paedo', 'pedo', 'penis', 'piss', 'porn', 'prick',
  'pussy', 'queer', 'rape', 'retard', 'scrote', 'semen', 'sex', 'shag', 'shit', 'slag', 'slut',
  'smeg', 'spastic', 'spic', 'sperm', 'tits', 'titty', 'tosser', 'tranny', 'twat', 'vagina',
  'wank', 'whore', 'wog', 'nazi', 'hitler', 'kkk', 'isis', 'suicide', 'selfharm',
];

/* ---------- AND THE INNOCENT WORDS THOSE STRINGS ARE INSIDE § */
const HANDLE_ALLOWED = {
  analysis:   'the school subject, and the commonest false positive on any list with "anal" in it',
  analyst:    'a job',
  analytic:   'and analytical, analytically',
  canal:      'a canal',
  cocktail:   'and cockatoo, cockerel, cockney — a rooster and a bird and a Londoner',
  cockpit:    'an aeroplane',
  peacock:    'a bird',
  shitake:    'the mushroom, which people do spell without the second h',
  sextet:     'and sextant, sextile — six of something, and an instrument',
  middlesex:  'and Sussex, Essex, Wessex — English counties',
  scunthorpe: 'the town this whole problem is named after',
  penistone:  'a town in South Yorkshire',
  therapist:  'a job, and the classic worked example of why substrings are dangerous',
  assassin:   'a word, and a game children play',
  bassist:    'and bass, basset — a fish, an instrument and a dog',
  grassland:  'and grass, grasshopper',
  classic:    'and class, classical, classroom — the word this whole site is about',
  passage:    'and passenger, compass, embassy',
  titan:      'and titanium, titanic — the moon, the metal and the ship',
};
/* What an admin may change on a trip. Same one-list-drives-both rule as everywhere else. */
const TRIP_GROUPS = {
  'What it is':  ['name', 'focus', 'description', 'photo', 'link', 'provider'],
  /* THE FOUR A BOOKING PRICES FROM, beside the old per-child price (docs/history/353). */
  'Cost & size': ['price_per_child', 'hours', 'min_children', 'max_children',
                  'ticket_child', 'ticket_adult', 'travel_per_child', 'ratio'],
  'Where & when': ['place', 'venue', 'address', 'date', 'notice_days'],
  'Admin':       ['trip_id', 'active', 'notes'],
};
const TRIP_EDITABLE = flat(TRIP_GROUPS);

/* WHAT AN ADMIN MAY CHANGE ON A POST. § */
const POST_GROUPS = {
  'What it says': ['caption', 'body', 'location'],
  'Where it came from': ['author', 'image'],
  'When':         ['posted_on', 'creation_date', 'uploaded_date'],
  'Poll':         ['poll'],
  'Admin':        ['pinned', 'active'],
};
const POST_EDITABLE = flat(POST_GROUPS);

const ROOM_GROUPS = {
  'Room':     ['venue', 'name'],
  'Rates':    ['rate_per_hour', 'concession_rate'],
  'Capacity': ['min_capacity', 'max_capacity'],
  'Admin':    ['active', 'notes'],
};
const ROOM_EDITABLE = flat(ROOM_GROUPS);


/* BOOKING STATE MACHINE ==================================================== One machine, both sides. § */
/* The four words a participant's row can say, written from THEIR point of view. § */
const BM = { NONE:'', WAITING:'Waiting', AGREED:'Agreed', PAYING:'Paying', BOOKED:'Booked' };
const ACT = { REQUEST:'Request', ACCEPT:'Accept', DECLINE:'Decline', WITHDRAW:'Withdraw',
              PAY:'Pay', EDIT:'Edit', SAY:'Say' };

/* What each verb does to the mover, and who it removes. § */
const BM_EFFECT = {
  Request:  { mine: BM.WAITING, theirs: BM.NONE,   clear: ''     },
  Edit:     { mine: BM.WAITING, theirs: BM.WAITING, clear: ''    },   // un-readies everyone
  Say:      { mine: null,       theirs: null,      clear: ''     },   // a note changes no status
  Accept:   { mine: BM.AGREED,  theirs: BM.AGREED, clear: ''     },   // agreement is mutual
  Decline:  { mine: BM.NONE,    theirs: BM.NONE,   clear: 'them' },
  Withdraw: { mine: BM.NONE,    theirs: BM.NONE,   clear: 'me'   },
  Pay:      { mine: BM.PAYING,  theirs: BM.AGREED, clear: ''     }
};


/* ---------- COLUMNS (generated) ---------- */
/* ---------- END COLUMNS ---------- */
