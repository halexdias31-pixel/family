/* @family. — 00_constants.gs (1 of 8) EVERY TOP-LEVEL VALUE, IN ONE FILE AND IN THE ORIGINAL ORDER. § */

/* @family. — backend (hermes) Rewritten against the eleven-tab database. § */

/* BOTH OF THESE IDS POINTED AT AN .xlsx AND `SpreadsheetApp` CANNOT OPEN ONE. § */
const LEDGER_ID = "1l26ZSHC5DDvsP-tBkAhxs8blRKjAtuV5Y2g0D4s1Gbo";

/* THE OTHER TWO FILES, AND WHY THERE ARE THREE OF THEM. § */
/* ---------- `SETTINGS_ID` WAS HERE, AND THERE ARE TWO SPREADSHEETS NOW § */
/* `LIBRARY_ID` WAS HERE. § */

/* `installSheetWatch` walks this to put an edit trigger on every file, so a fourth database is one line here and nothing else. § */
const FILES = { ledger: LEDGER_ID };

/* ---------- WHICH FILE EACH TAB IS IN § */
const WHERE = {
  /* ---- the app writes these ---- */
  people:         { file: 'ledger' },
  qualifications: { file: 'ledger' },
  library_cards:  { file: 'ledger' },
  family:         { file: 'ledger' },
  jobs:           { file: 'ledger' },
  events:         { file: 'ledger' },
  receipts:       { file: 'ledger' },
  orders:         { file: 'ledger' },
  invites:        { file: 'ledger' },
  messages:       { file: 'ledger' },
  records:        { file: 'ledger' },
  exams:          { file: 'ledger' },
  posts:          { file: 'ledger' },
  post_likes:     { file: 'ledger' },
  post_votes:     { file: 'ledger' },
  post_comments:  { file: 'ledger' },
  post_reactions: { file: 'ledger' },
  favourites:     { file: 'ledger' },
  /* WHAT EACH LEARNER DREW, so it follows them to another device — see SCHEMA.answers. The Ledger
     beside `favourites` and `submissions`, for their reason: it is a record OF a learner, and the app
     writes it. */
  answers:        { file: 'ledger' },
  /* EVERY ANSWER A LEARNER SENT, AND WHAT IT WAS MARKED — one row per press, never rewritten. § */
  submissions:    { file: 'ledger' },
  /* WHAT THE WEEKLY PARENT EMAIL SENT, OR WOULD HAVE — see SCHEMA.digest_log. The Ledger beside
     `submissions`, which is what it reports on, and because the app writes it. */
  digest_log:     { file: 'ledger' },
  /* WRITTEN BY AN ADMIN FROM THE PHONE, so it is the Ledger rather than a settings file: § */
  spotlight:      { file: 'ledger' },
  /* ---------- THE FILMS, AND WHY THEY ARE IN `Ledger` RATHER THAN IN THE REPOSITORY § */
  films:          { file: 'ledger' },

  /* ---- you write these, the app reads them ---- */
  config:         { file: 'ledger' },
  options:        { file: 'ledger' },
  pricing:        { file: 'ledger' },
  shop:           { file: 'ledger', alsoTry: 'items&shop' },
  terms:          { file: 'ledger' },
  widgets:        { file: 'ledger' },
  venues:         { file: 'ledger' },
  rooms:          { file: 'ledger' },
  trips:          { file: 'ledger' },
  /* AN ADMIN'S DISCOUNT CODES (docs/history/353) — the ledger, beside `jobs`, because `used` is counted up
     by `createJob` as a code is spent and the job that spent it is in the same file. */
  promo_codes:    { file: 'ledger' },
  holidays:       { file: 'ledger' },
  landmarks:      { file: 'ledger' },
  landmark_parts: { file: 'ledger' },
  map:            { file: 'ledger' },
  herd:           { file: 'ledger' },

  /* ---- subject content, edited in bulk ---- */
  /* NOTHING IS ROUTED HERE ANY MORE, and the section is kept so that is visible rather than merely absent. § */
};
/* WHO GETS TOLD when something needs doing by hand. § */
const ADMIN_NAME = "@family.";

/* EVERY KIND OF EMAIL THIS SITE SENDS, AND WHICH OF THEM SOMEBODY MAY TURN OFF § */
const NOTIFY_ALL_ROLES = ['client', 'student', 'tutor', 'admin'];
const NOTIFY_KINDS = {
  weekly:    { col: 'weekly_email', roles: ['client'], parents: true,
               label: 'Weekly progress email', note: 'Sundays: what your child worked on' },
  messages:  { col: 'messages_email', roles: NOTIFY_ALL_ROLES,
               label: 'Messages', note: 'When somebody messages you here' },
  bookings:  { col: 'bookings_email', roles: ['client', 'tutor', 'admin'],
               label: 'Booking updates', note: 'Notes, new terms and payments on a session',
               noteFor: { admin: 'Sign-ups to a festive event' } },
  posts:     { col: 'posts_email', roles: ['client', 'student', 'tutor'],
               label: 'Your posts', note: 'When one goes up, or is not put up' },
  /* HIDDEN: NOTHING HANDS A CODE OUT ANY MORE. § */
  referrals: { col: 'referrals_email', roles: NOTIFY_ALL_ROLES, hidden: true,
               label: 'Your code was used', note: 'When somebody joins with it' },
  /* OFF MEANS A POST WAITS UNSEEN until the admin opens Posts — said on the card, because nothing else
     tells anybody a post is waiting. */
  approvals: { col: 'approvals_email', roles: ['admin'],
               label: 'Posts waiting for you', note: 'If off, a post waits until you open Posts' },

  access:    { essential: true, roles: NOTIFY_ALL_ROLES,
               label: 'Sign-in links and new PINs', note: 'Confirming your address, a forgotten PIN, a link to sign in',
               why: 'without them nobody can get into their account, or back into it' },
  security:  { essential: true, roles: NOTIFY_ALL_ROLES,
               label: 'Security warnings', note: 'Too many wrong PINs, or your PIN changed',
               why: 'the only warning an account theft ever gives' },
  family:    { essential: true, roles: ['client', 'student'], parents: true,
               label: 'Family links', note: 'Somebody adding you as their child, and the answer',
               why: 'a child is never put on an account they were not told about' },
  booked:    { essential: true, roles: ['client', 'tutor'],
               label: 'Bookings confirmed or cancelled', note: 'Received, accepted, paid, a tutor leaving, cancelled',
               why: 'each decides whether a session happens, and the door is too late to find out' },
  reported:  { essential: true, roles: ['admin'],
               label: 'Reported messages', note: 'A message somebody has reported',
               why: 'a report is a safeguarding matter and the admin is the only one told' },
};

/* Bumped on every paste that changes behaviour. § */
const BACKEND_VERSION = "2026-10-19-e-verse";
const SITE_URL = "https://halexdias31-pixel.github.io/family/";

const TAB = {
  people: 'people', qualifications: 'qualifications', library_cards: 'library_cards',
  venues: 'venues', jobs: 'jobs', events: 'events', terms: 'terms',
  /* `resources` WAS HERE, then `questions` was. Both are gone: the documents and the questions
     inside them are one table, and that table is `data/questions.json` in this repository now. */
  shop: 'shop', pricing: 'pricing',
  config: 'config', options: 'options', trips: 'trips', rooms: 'rooms', invites: 'invites',
  promo_codes: 'promo_codes',
  exams: 'exams', orders: 'orders', messages: 'messages', widgets: 'widgets',
  records: 'records',
  herd: 'herd',
  /* The map's own geometry, fetched from OpenStreetMap and kept. Not a tab anybody types into —
     see `fetchMap`. */
  map: 'map',
  /* Every receipt ever issued, kept as it was issued. See the schema below. */
  receipts: 'receipts',
  /* Buildings measured by hand off satellite imagery. See the schema below. */
  landmarks: 'landmarks',
  /* The pieces each landmark is made of — see SCHEMA.landmark_parts. */
  landmarkParts: 'landmark_parts',
  /* The calendar of festivals, as rules rather than dates — see the schema. */
  holidays: 'holidays',
  /* When a particular message is worth putting out — see SCHEMA.campaigns. */
  /* The words those campaigns say, one line per row — see SCHEMA.copy. */
  /* What the search funnel asks, in what order, and what it calls things — see SCHEMA.facets. */
  /* What the funnel's first two questions ANSWER — see SCHEMA.kinds. */
  /* Who starred what — see SCHEMA.favourites. */
  favourites: 'favourites',
  /* What each learner drew on a question — see SCHEMA.answers. */
  answers: 'answers',
  /* Every answer each learner sent, and its verdict — see SCHEMA.submissions. */
  submissions: 'submissions',
  /* What the weekly parent email sent, or would have — see SCHEMA.digest_log. */
  digest_log: 'digest_log',
  /* What the BUSINESS has chosen to put in front of everybody — see SCHEMA.spotlight. */
  spotlight: 'spotlight',
  /* `questions`, `boxers` AND `fights` WERE HERE. All three tabs are gone — see the notes where
     their SCHEMA entries used to be. */
  /* Which loading splashes are in the pool — see SCHEMA.splashes. */
  /* `cheatsheet` WAS HERE. Gone the same way — see the note where SCHEMA.cheatsheet used to be. */
  /* What the Reels column shows. One row is one slide: a subject, a heading, a line or two, and a
     few words to find a photograph by — see SCHEMA.facts. */
  films: 'films',
  posts: 'posts', post_likes: 'post_likes', post_votes: 'post_votes',
  post_reactions: 'post_reactions', post_comments: 'post_comments',
  family: 'family'
};


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
    "invited_by", "referral_code", "account_number", "sort_code",
    /* the profile a parent reads */
    "photo", "photos", "video", "headline", "adjective_1", "adjective_2", "adjective_3",
    "years_experience",
    /* THE AGES THEY TEACH: a whole number or the word `Adults`, out of `AGE_OPTIONS` — see
       `ageRefusal_` in people.gs. Not on the pricing page: the age range does not decide a price. */
    "age_min", "age_max", "focus", "dbs_checked",
    /* where they are */
    "address", "town", "city", "borough", "postcode", "travel_km",
    /* what they charge, and when they can teach */
    "rate_per_hour", "extra_seat_rate",
    /* THE BUSINESS'S CUT OF AN EXTRA SEAT, PER TUTOR (docs/history/345) — a fraction of THIS tutor's rate, beside their own share. § */
    "extra_seat_cut",
    "min_students", "max_students", "min_hours", "max_hours",
    "pricing_changed_at", "availability", "agreement_signed_at", "agreement_version",
    /* a family's and a student's own */
    "children", "favourite_colour", "exam_small_date", "exam_big_date",
    /* THE WEEKLY PARENT EMAIL, PER PARENT — see backend/digest.gs. § */
    "weekly_email",
    /* ---------- AND EVERY OTHER EMAIL SOMEBODY MAY TURN OFF, ONE COLUMN EACH — see `NOTIFY_KINDS` § */
    "messages_email", "bookings_email", "posts_email", "referrals_email", "approvals_email",
    /* the app's state, which nobody types into */
    "avatar", "avatar_owned", "xp", "credits", "high_score_flappy", "high_score_tables",
    "friends", "notepad", "todo",
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
  /* ---------- THE MAP § */
  /* ---------- LANDMARKS § */
  landmarks: [
    /* ---------- THESE ARE THE TAB'S OWN NAMES, AND THEY DID NOT USED TO BE § */
    "id", "parent", "name", "world", "kind",
    "lat", "lng",
    /* ---------- WHICH WAY ROUND IT STANDS ON THE BOARD § */
    "bearing",
    /* `x` and `z` are the board position when one is set by hand, and `active` is how a landmark
       is retired without deleting the row. All three are on the tab and none was declared. */
    "x", "z", "active",
    "w", "d", "points",
    "height", "storeys", "wall_colour", "note",
    /* ---------- WHAT THE SHEET ALREADY HAD AND THE SCHEMA DID NOT § */
    "label", "icon", "role", "marker", "roof_colour", "address",
    /* ---------- WHAT MAKES A LANDMARK RECOGNISABLE ON THE BOARD § */
    "form", "roof_shape", "feature", "plots",
    /* HOW DEEP THE PLOT IS, in tiles. Width is `plots`; this is the other side of it, and it exists
       because a retail park is wide AND deep while a house is neither. */
    "plot_depth",
  ],

  /* ---------- THE PARTS OF A LANDMARK § */
  landmark_parts: [
    "part_id", "landmark_id", "name",
    /* WHAT IT IS, and this decides everything about how it draws: § */
    "kind",
    /* ---------- THE SHAPE, TWO WAYS, AND ONE OF THEM IS BETTER § */
    "points",
    "x", "z", "w", "d",
    /* HOW TALL, in metres — 0 for anything flat. The board squashes the range so a tower and a shed
       are both readable, so this is the real height and the drawing decides what to do with it. */
    "height",
    /* THE SHAPE OF IT, for the parts that are buildings. Same vocabulary as the landmark's own
       `form` and `roof_shape`, because a part IS a building and there is no reason for a second
       set of words. */
    "form", "roof_shape",
    /* AND WHAT COLOUR. Walls and roof separately — a grey building with a blue roof is a thing you
       can only say if they are two columns. */
    "wall_colour", "roof_colour",
    /* ONE FEATURE: chimney, spire, clock, mast, sign. Per part, so the barn gets the chimney and
       the paddock does not. */
    "feature",
    "note", "active",
  ],

  /* ---------- RECEIPTS § */
  receipts: [
    "receipt_id", "kind", "job_id", "order_id", "person_id", "person_name",
    "issued_on", "total_pence", "currency", "lines", "note",
  ],

  map: [
    /* `meta` carries whatever the shape needs beyond its outline — a building's storeys, a road's classification. § */
    "world", "kind", "name", "points", "meta",
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
    "min_hours", "max_hours", "focus", "notice_days",
    "availability", "tutors_happy_here"
  ],
  /* AN INVITATION. One row is one family asked to share one booking — who asked, who was asked, which booking, and what happened. § */
  invites: [
    "invite_id", "job_id", "from_person", "to_email", "to_name",
    "sent_on", "opened_on", "accepted_on", "declined_on", "token", "notes",
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
    "net_profit", "priced_at", "format", "practical_id", "trip_id"
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
    "relative_name", "display_name",
    "start_date", "end_date", "last_sunday", "weeks_left"
  ],
  /* ---------- HERD MENTALITY'S QUESTIONS § */
  herd: ["question_id", "question", "sort_order", "active", "notes"],

  /* ---------- `resources` WAS A TAB, THEN A KIND OF ROW, AND IS NOW NEITHER § */
  /* ---------- ONE TAB FOR EVERYTHING THAT IS A THING § */
  shop: [
    "item_id", "name", "brand", "kind", "description", "photo",
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

  /* THE WIDGETS. One row per tool and per game. § */
  widgets: [
    "widget_id", "key", "name", "blurb", "section",
    "search", "sort_order", "roles", "active", "notes",
  ],

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

  posts: [
    /* `file_name` is what the caption was taken FROM. § */
    /* WHETHER IT MAY BE SEEN, and it is NOT the same question as `active` below. § */
    "approved", "approved_by", "approved_on",
    "post_id", "author", "image",
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

  /* LIKES. HISTORICAL — nothing reads this tab any more. § */
  post_likes: [
    "like_id", "post_id", "person_id", "liked_on",
  ],

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

  /* MESSAGES. One row per message — a thread is messages sharing a pair, not a thing of its own, so nothing has to be created before somebody can write. § */
  /* BUSINESS RECORDS. The business's own paperwork — insurance, tax, registrations, policies, DBS — one row per thing that has a reference, a date it runs out or § */
  records: [
    "record_id", "category", "title", "provider", "reference", "due_on", "cost", "link", "notes",
    "active", "updated_at",
  ],

  messages: [
    "message_id", "from_id", "to_id", "sent_at", "body",
    "read_at", "flagged", "flag_reason",
    /* ATTACHMENTS: pictures, clips and files, as `url#type#name` items joined by ` | `. § */
    "attachments",
  ],

  /* FAMILY LINKS. A parent asks; the child accepts. § */
  family: [
    "link_id", "parent_id", "child_id", "child_typed", "state", "asked_on", "answered_on",
  ],

  /* ORDERS. A reward that arrives in the post is not a purchase — it is a request with a state. § */
  orders: [
    "order_id", "person_id", "item", "resource", "cost_ticks",
    "pages", "cost_pence", "delivery",
    "state", "asked_on", "posted_on", "address", "notes",
  ],

  /* ---------- HOLIDAYS § */
  /* A `holidays` TAB WAS DECLARED TWICE, and this was the first of the two. § */

  /* ---------- HOLIDAYS § */
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
  submissions: [
    "person_id", "key", "label", "words",
    "answer", "verdict", "submitted_at",
    "event_id", "pressed_at",
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

/* ---------- WHICH GEMINI MARKS, AND WHAT "MARK WITH AI" DOES WHEN GOOGLE IS FULL § */
const AI_MODEL = 'gemini-3.8-flash';
const AI_MODEL_FALLBACK = 'gemini-3.5-flash-lite';
const AI_MODEL_OLD_SEED = 'gemini-flash-latest';
const AI_TRIES = 3;
const AI_WAITS = [800, 2000];
const AI_JITTER = 0.3;
const AI_BUDGET_MS = 20000;
const AI_HANDOFF_MS = 10000;
const AI_BUSY = 'Marking is busy right now — try again in a minute.';
/* THE THINKING LEVELS EACH PINNED MODEL OFFERS, LOWEST FIRST, as Google's thinking guide lists them § */
const AI_THINKING_SCALE = ['minimal', 'low', 'medium', 'high'];
const AI_THINKING_LEVELS = {
  'gemini-3.8-flash': ['low', 'medium', 'high'],
  'gemini-3.5-flash-lite': ['minimal', 'low', 'medium', 'high'],
};
/* WHAT A BLANK CELL MEANS: § */
const AI_THINKING_SHORT = 'minimal';
const AI_THINKING_ESSAY = 'low';
const AI_THINKING_DEFAULT = {
  'gemini-3.8-flash': 'medium',
  'gemini-3.5-flash-lite': 'minimal',
};
/* A DAY'S GEMINI QUOTA ENDS AT MIDNIGHT PACIFIC -- Google's rate-limits page: § */
const AI_QUOTA_TZ = 'America/Los_Angeles';
const AI_SPENT_MAX_S = 21600;

/* Every tunable, with a plain-English note and a starting value. § */
const CONFIG_DEFAULTS = [
  // M, w and open_rate are gone: a tutor now sets one charge-out rate, the minimum wage is fixed
  // in the code, and the open rate is fixed too. Leaving them here as editable numbers would have
  // meant two places claiming to decide the same price.
  ['s', 0, 'each extra subject adds this FRACTION of the base rate. 0.15 = +15%'],
  ['c', 0, "each extra seat adds this fraction — the tutor's share of it. 0.15 = +15%"],
  /* B IS THE DEFAULT NOW, NOT THE CUT (docs/history/345): § */
  ['B', 0, "each extra seat adds this fraction — your share of it, for every tutor whose own extra_seat_cut is blank. 0.25 = +25%"],
  ['b', 0, 'bulk discount taken off per session AFTER THE FIRST. 0.01 is about 9% off a 10-session term. 0 = off'],

  ['a', 0, 'advance discount taken off per week ahead AFTER THE FIRST. 0 = off'],
  ['h', 2, 'hours per session'],
  ['max_students_per_job', 4, 'seat cap when neither the tutor nor the venue sets one'],
  /* ---------- A VISIT TO SOMEBODY'S HOUSE HAS A FLOOR, AND IT IS EDITORIAL § */
  ['min_seats_at_home', 4, 'chairs a session at the client\'s own home must be booked for, yours included'],
  ['max_open_requests', 2, 'how many live requests one family may hold at once'],
  ['showcase_folder_id', '', 'Drive folder the Showcase reads'],

  /* ---------- GOOGLE SIGN-IN, WHICH HAD NO ROW TO SET IT IN § */
  /* ---------- AI MARKING § */
  ['gemini_model', AI_MODEL, 'the Gemini model that marks worded answers. Blank (or the old gemini-flash-latest) = ' + AI_MODEL + '. The API KEY never goes here: it is GEMINI_API_KEY in Script Properties'],
  ['gemini_model_fallback', AI_MODEL_FALLBACK, 'the model asked when the first one is full, out of reach or retired (Gemini 429, 5xx or 404). Blank = ' + AI_MODEL_FALLBACK + '. none = no second model'],
  ['ai_marks_per_day', 20, 'how many answers one person may have marked by AI in a day. Blank = 20. 0 switches AI marking off'],
  /* HOW HARD GEMINI THINKS BEFORE IT MARKS, ONE CELL FOR EACH KIND OF ANSWER (12 Oct) -- the note over `AI_THINKING_LEVELS` above, and docs/history/350. § */
  ['ai_thinking', '', 'how hard Gemini thinks before marking a SHORT answer: minimal, low, medium or high (each slower and deeper than the last), or none for the model\'s own default. A model that does not offer a level gets the next one up. Blank = the lowest each model offers ('
    + [AI_MODEL, AI_MODEL_FALLBACK].map(m => (AI_THINKING_LEVELS[m] || ["its own default"])[0] + ' on ' + m).join(', ') + ') -- the fastest'],
  ['ai_thinking_essay', '', 'the same for an ESSAY (six marks or more, marked on its levels). Blank = ' + AI_THINKING_ESSAY
    + '. medium = deeper and slower: how ' + AI_MODEL + ' marked essays before 12 Oct 2026'],
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
  ['open_tutor_rate', 14, "the hourly rate for a tutor nobody chose — what a waitlist seat is priced against"],
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

  ['print_rate_per_page', 0.02, 'what a printed page costs. 0.02 = 2p. Set to 0 and no paper copies are offered at all'],
  ['print_minimum', 0, 'the least a print job can cost, whatever the page count. 0 = no minimum'],
  /* LAMINATING IS OFF BY DEFAULT, and that is the honest default rather than a cautious one: § */
  ['laminate_rate_per_page', 0, 'what laminating one page costs. 0 = laminating is not offered'],
  ['laminate_minimum', 0, 'the least a laminating job can cost, whatever the page count. 0 = none'],
  ['postage_flat', 0, 'one stamp and one envelope for a whole order, not per item. 0 = you do not post, and only collection is offered'],
  // Documentation rows. Read by nobody — written so the sheet explains its own arithmetic.
  /* The formula_* rows lived here. § */
];

/* ---------- A SEED THAT MOVED: `[key, the old value, the old note]` § */
const CONFIG_RESEEDED = [
  ['gemini_model', AI_MODEL_OLD_SEED, 'the Gemini model that marks worded answers. Blank = gemini-flash-latest. The API KEY never goes here: it is GEMINI_API_KEY in Script Properties'],
];

/* ---------- THE CONFIG KEYS NO PHONE IS SENT § */
const FILMS_FOLDER_KEY = 'films_folder';
const CONFIG_PRIVATE = [FILMS_FOLDER_KEY];

/* ---------- THE FILMS SYNC — see `filmsSync_` in content.gs § */
const FILMS_FOLDER_NAME = 'notflix';
const FILMS_SYNC_PROP = 'FILMS_SYNC';
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
const AVAIL_DAYS  = [['m','Mon'], ['tu','Tue'], ['w','Wed'], ['th','Thu'], ['f','Fri'], ['sa','Sat'], ['su','Sun']];
/* ---------- THREE LIBRARY CARDS, AS NINE FORM FIELDS OVER ONE CELL § */
const LIBRARY_CARDS = 5;
const LIBRARY_FIELDS = (() => {
  const out = [];
  for (let i = 1; i <= LIBRARY_CARDS; i++) out.push('lib' + i + '_name', 'lib' + i + '_no', 'lib' + i + '_pin');
  return out;
})();
/* ONE TEST, EVERY READER. § */
const LIBRARY_FIELD = /^lib\d+_(name|no|pin)$/;

/* ---------- EIGHT MORE PHOTOGRAPHS, AS EIGHT FORM FIELDS OVER ONE CELL § */
const PHOTO_MAX = 8;
const PHOTO_FIELDS = (() => {
  const out = [];
  for (let i = 1; i <= PHOTO_MAX; i++) out.push('photos_' + i);
  return out;
})();
const PHOTO_FIELD = /^photos_\d+$/;

/* ---------- YOUR PICTURE CAN BE ONE OF OURS, OR YOUR OWN FIGURE § */
const PFP_PICTURES = ['fox', 'owl', 'cat', 'dino', 'robot', 'rocket', 'planet', 'football', 'guitar', 'palette'];
const PFP_AVATAR = 'pfp:avatar';
const PFP_CHOICES = [PFP_AVATAR].concat(PFP_PICTURES.map(p => 'pfp:' + p));

/* ---------- UP TO TEN QUALIFICATIONS, AS FORTY FORM FIELDS OVER ONE CELL § */
const QUAL_MAX = 10;
const QUAL_FIELDS = (() => {
  const out = [];
  for (let i = 1; i <= QUAL_MAX; i++) out.push('qual_' + i, 'qual_' + i + '_level', 'qual_' + i + '_board',
    'qual_' + i + '_grade', 'qual_' + i + '_received', 'qual_' + i + '_teach', 'qual_' + i + '_spec');
  return out;
})();
/* `_received`, `_teach` AND `_spec` ARE THE THREE THE ITEM GREW, and they replace two pages. § */
const QUAL_FIELD = /^qual_\d+(_level|_board|_grade|_received|_teach|_spec)?$/;


/* ---------- A DATE OF BIRTH IS THREE NUMBERS SOMEBODY REMEMBERS, NOT A DATE THEY PICK § */
/* THE PHONE AS A COUNTRY CODE AND A NUMBER, one cell (`phone`, "+44 7700 900123") — see
   `phoneOut`/`phoneIn` in core.gs. The list is the codes offered; the first is the default. */
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
/* ---------- NINE TILL SIX, THE SAME SPAN AS THE BOOKING GRID § */
const AVAIL_HOURS = [9,10,11,12,13,14,15,16,17,18];

/* ---------- PEOPLE --------------------------------------------------------------------------- */
const ROLE_LABEL = { admin: 'Admin', tutor: 'Tutor', client: 'Client', student: 'Student' };

/* ---------- A TITLE IS A ROLE THAT DECIDES NOTHING, AND SAYING SO IS THE WHOLE POINT § */
const ROLE_TITLES = {
  'head of boxing': 'Head of Boxing',
};

/* ONE READER FOR BOTH MAPS, because the roster prints a person's whole role list and the card prints one of them, and two lookups written separately are two § */
const roleLabel_ = x => ROLE_LABEL[x] || ROLE_TITLES[norm(x)] || x;

/* ---------- THE ROLES A PERSON MAY TICK FOR THEMSELVES, AND THE ONE THEY MAY NOT § */
const SELF_ROLES = ['tutor', 'client', 'student'];
const SELF_ROLE_ALIASES = { teacher: 'tutor', parent: 'client', guardian: 'client',
                            kid: 'student', child: 'student', pupil: 'student' };

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

/* ---------- THE REACTIONS EVERY POST OFFERS § */
const HOUSE_REACTIONS = ['👍', '❤️', '😂', '😮', '👏', '🎉'];

/* ---------- HOW MANY SUBMISSIONS ONE `submitAnswer` MAY CARRY § */
const SUBMISSIONS_PER_POST = 25;
/* THE WHOLE VOCABULARY OF `submissions.verdict`: § */
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

/* ---------- HOW MUCH OF AN ANSWER THE SHEET KEEPS — SCHEMA.answers AND SCHEMA.submissions § */
const ANSWER_TEXT_MAX = 20000;
const ANSWER_PAD_MAX = 40000;
const ANSWERS_PER_POST = 25;

/* ---------- WHAT "MARK WITH AI" SENDS GEMINI — `aiMark` in dopost.gs § */
const AI_ANSWER_MAX = 20000;
const AI_QUESTION_MAX = 8000;
const AI_SCHEME_MAX = 8000;

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

/* HOW MUCH OF A QUESTION'S WORDS THE WEEKLY EMAIL PRINTS — its own ask, and the stem it shares with its other parts, printed once above them (`digestQuestions_`). § */
const DIGEST_WORDS_SHOWN = 400;
const DIGEST_STEM_SHOWN = 300;
/* ---------- EACH QUESTION AS IT IS ON THE SITE, AND ITS PICTURE (18 Oct, docs/history/351) § */
const DIGEST_PNG_DIR = 'data/diagrams/';
const DIGEST_PNG_HEX = 12;
const DIGEST_PNG_WIDTH = 340;
const DIGEST_CLIP_BYTES = 95000;

/* ---------- WHAT THE BUSINESS IS CALLED, ON THE SERVER § */
const BRAND_NAME = '@family.';

/* ---------- WHO MAY MESSAGE WHOM § */
const MESSAGING = {
  admin:   { admin: true,  tutor: true,  client: true,  student: true  },
  tutor:   { admin: true,  tutor: true,  client: true,  student: false },
  client:  { admin: true,  tutor: true,  client: false, student: false },
  /* A student may reach an admin and nobody else. Not a restriction on the child so much as a
     guarantee: whoever they talk to on this site is the person responsible for it. */
  student: { admin: true,  tutor: false, client: false, student: false },
};

/* How often anybody may send. § */
const MESSAGE_GAP_MS = 5 * 60 * 1000;

/* ---------- THE SHEET'S WORDS AND THE APP'S WORDS § */
const ROLE_TO_APP = { client: 'parent', student: 'kid' };
const ROLE_FROM_APP = { parent: 'client', kid: 'student' };

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

/* ---------- AND THE BUSINESS'S CUT OF AN EXTRA SEAT, WHICH IS ON THE RATE PAGE AND NOT THE FIFTH OF THEM § */
const SEAT_CUT_FIELD = 'extra_seat_cut';

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
  'Photos': ['photo','video'].concat(PHOTO_FIELDS),
  /* THE QUOTE, THEN HOW LONG A SESSION IS — `SESSION_FIELDS`' note says why they share a page and not a clock. */
  /* AND THE BUSINESS'S CUT OF AN EXTRA SEAT straight after the tutor's own share, as the card reads them — an
     admin's to write, which `seatCutRefusal_` decides, not this list (`SEAT_CUT_FIELD` above says why). */
  'Your rate and group size': PRICING_FIELDS.reduce((a, f) => a.concat(f === 'extra_seat_rate' ? [f, SEAT_CUT_FIELD] : [f]), [])
                                .concat(SESSION_FIELDS),
  /* WHAT YOU TEACH, WHAT YOU ARE STUDYING AND ANYTHING ELSE — one page, because they are the
     three answers to "what do you know". `Qualifications` beside it is the graded list. */
  /* ---------- WHAT YOU SPECIALISE IN, THEN WHAT ELSE YOU TEACH § */
  /* ---------- AND THEN THE PAGE WENT § */
  /* ---------- ONE PAGE FOR ALL THREE, NOT THREE PAGES WITH A SAVE EACH § */
  'Qualifications': QUAL_FIELDS,
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

/* THREE TO TWENTY, LOWER CASE, LETTERS DIGITS AND UNDERSCORE, STARTING WITH A LETTER. § */
const HANDLE_SHAPE = /^[a-z][a-z0-9_]{2,19}$/;

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
/* What an admin may change on a shop item. Same pattern as everything else: one list drives the
   form AND the write allow-list, so the two can't drift apart. */
const SHOP_GROUPS = {
  'What it is': ['name', 'brand', 'kind', 'description', 'photo'],
  'Who and how': ['audience', 'acquire'],
  'Price':      ['price_pence', 'price_ticks', 'price_coins', 'level_required'],
  'Wearable':   ['slot', 'art_id'],
  'Stock':      ['stock', 'max_per_person', 'returnable', 'value_pence', 'active'],
};
const SHOP_EDITABLE = flat(SHOP_GROUPS);

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

/* The rooms every venue is described in terms of. § */
const ROOM_SLOTS = ['Small room 1', 'Small room 2', 'Medium room 1', 'Medium room 2',
                    'Large room 1', 'Large room 2'];

const ROOM_GROUPS = {
  'Room':     ['venue', 'name'],
  'Rates':    ['rate_per_hour', 'concession_rate'],
  'Capacity': ['min_capacity', 'max_capacity'],
  'Admin':    ['active', 'notes'],
};
const ROOM_EDITABLE = flat(ROOM_GROUPS);

const LINK_GROUPS = {
  'Link':  ['name', 'url'],
  'Where': ['category', 'colour'],
  'More':  ['description', 'photo'],
};
const LINK_EDITABLE = flat(LINK_GROUPS);

const VENUE_EDITABLE = [...new Set(flat(VENUE_GROUPS).concat(
  AVAIL_DAYS.reduce((a, [p]) => a.concat(AVAIL_HOURS.map(h => p + String(h).padStart(2,'0'))), [])))];

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

/* ---------- PAGE COUNTS § */
const PAGES_MAX_BYTES = 20 * 1024 * 1024;
/* A CEILING, not a target. § */
const PAGES_PER_RUN = 400;
/* Four minutes of a six-minute allowance. § */
const PAGES_TIME_BUDGET = 4 * 60 * 1000;

/* ============================== GET ========================================================== */
/* ---------- RUNNING A JOB FROM A URL § */
const RUNNABLE = {
  /* Forced, and then CHECKED — the report says what it meant to do, and this says what is
     actually on the sheet afterwards. Those had never been the same question. */
  ensureSchema:      () => ({ ran: ensureSchema_(), stillMissing: schemaGaps() }),
  schemaGaps:        () => schemaGaps(),
  makeBrandAccount:  a => makeBrandAccount(a),
  migrateLikes:      () => migrateLikes_(),
  installTriggers:   () => installTriggers_(),
  listTriggers:      () => listTriggers(),
  /* ---------- THE SPREADSHEET AS THE CONTROL PANEL § */
  installSheetWatch: () => installSheetWatch_(),
  sheetWatchStatus:  () => sheetWatchStatus(),
  clearPayloadCache: () => { clearPayloadCache(); return { cleared: true, generation: payloadGen_(),
                             means: 'the next request rebuilds from the sheet as it is now' }; },
  warmPayload:       () => warmPayload(),
  checkEverything:   () => checkEverything(),
  checkPostsFolder:  () => checkPostsFolder(),
  /* THE FILMS SYNC BY HAND, with the editor's budget rather than the phone's — the same run
     `syncFilms` is in the function dropdown. The report is counts and the folder's name, never a
     title. */
  syncFilms:         () => syncFilms(),
  /* Reachable from a URL like everything else — but note that a URL CANNOT grant a scope. This
     will report what the deployment's existing token can do; raising the consent screen has to be
     a run from the editor. */
  authoriseDrive:    () => authoriseDrive(),
  checkScopes:       () => checkScopes(),
  /* Turn postcodes into coordinates. Run it after adding a venue; it skips anything already
     placed, so running it twice costs one request and changes nothing. */
  geocode:           () => geocodeVenues(),
  /* The ground itself, from OpenStreetMap. Once per world; name one to fetch it again. */
  fetchMap:          a => fetchMap(a),
  regeocode:         () => geocodeVenues(true),
  rename:            a => renameValue_(a),
  seedOptions:       () => seedOptions(),
  /* `seedFamilies` WAS HERE, and went with the hand-written map it wrote — see where
     `KNOWN_FAMILIES` used to be. An admin links a child to a parent from the app (`linkChild`). */
  /* Fill in the wearable prices the code already holds, for a sheet that ran `seedAvatarItems` before it knew which columns the merged tab had. § */
  priceWearables:    () => repairShopPrices(),
  /* ---------- EVERY PERSON GETS A HANDLE, AND ONLY A BLANK CELL IS TOUCHED § */
  fillHandles:       () => fillHandles(),
  /* ---------- AND EVERY HANDLE THAT WAS NEVER THE GENERATED SHAPE, ONCE § */
  renameHandles:     () => renameHandles_(),
  /* ---------- AND EVERY CHILD'S HANDLE INTO INITIALS AND FOUR DIGITS, PREVIEWED FIRST (342) § */
  /* `seedPastPapers`, `seedALevelPapers`, `dropOldALevelPapers` and `ensureResourceIds` WERE HERE. § */
  /* The Colliers Wood landmarks, with their surveyed outlines. Safe to run whenever — a landmark
     already on the tab is left exactly as it is. */
  seedLandmarks:     () => seedLandmarks(),
  /* The Colliers Wood landmarks, with their real outlines. Safe to run again — anything already on
     the tab is left as it is. */
  seedLandmarks:     () => seedLandmarks(),
  /* The British holidays of a year, computed. `&arg=2027` for a different one; without an arg it
     does the year we are in. Safe to run whenever — a row already there is left alone. */
  seedHolidays:      a => seedHolidays(a),
  /* FORGET A ONE-OFF JOB, so it runs again on the next request. § */
  rerun: a => {
    const props = PropertiesService.getScriptProperties();
    const id = S(a);
    if (id === 'schema') { props.deleteProperty('SCHEMA_VERSION'); return 'the schema will rebuild'; }
    if (!MIGRATIONS.some(m => m.id === id)) {
      return { error: 'No job called "' + id + '".', jobs: MIGRATIONS.map(m => m.id) };
    }
    props.deleteProperty('MIGRATED_' + id);
    return id + ' will run again on the next request';
  },
};

/* ---------- THE SHEET CATCHES UP WITH THE CODE, BY ITSELF § */
/* ---------- THE ONE-OFF JOBS, RUN ONCE, BY THEMSELVES § */
const MIGRATIONS = [
  { id: 'likes-to-reactions',
    what: 'every old like becomes a 👍, keeping the date it was pressed',
    run: () => migrateLikes_() },

  { id: 'nightly-jobs',
    what: 'the page-count sweep and the job closer, on a daily trigger',
    run: () => installTriggers_() },

  /* The nightly list gained the geocoder, and `nightly-jobs` has already run — a migration is remembered by its id, so the only way to install a new trigger is a § */
  { id: 'nightly-jobs-with-geocode',
    what: 'the nightly list again, now including the geocoder',
    run: () => installTriggers_() },

  /* "English Lang." and "English Language" were two spellings of one subject, on 48 rows and 198 rows — and to everything downstream they are two different § */
  { id: 'english-lang-to-english-language',
    what: 'every "English Lang." becomes "English Language"',
    run: () => renameValue_('English Lang.>English Language') },

  /* THE SAME RENAME AGAIN, under a new name, because the first one ran before it knew how to merge. § */
  { id: 'english-language-merge-duplicates',
    what: 'one subject in the dropdown and one row in pricing, not two of each',
    run: () => renameValue_('English Lang.>English Language') },

  /* ONE SPELLING OF EACH EXAM BOARD. § */
  { id: 'exam-board-one-spelling',
    what: 'every spelling of Edexcel becomes "Edexcel"',
    run: () => renameValue_('edexcel>Edexcel') },

  /* PUT THE VENUES ON THE MAP, without anybody being asked to do anything. § */
  { id: 'venue-coordinates',
    /* SAFE TO REPEAT, so it is allowed to fail and try again. It writes only what is missing and
       never overwrites, so running it twice does what running it once did. */
    retry: true,
    what: 'venues get their postcodes and coordinates, so the map can place them',
    run: () => {
      const seeded = seedPostcodes();
      const out = geocodeVenues();
      /* THROWN, so the ledger does not record it. § */
      if (out.error) throw new Error(out.error);
      out.seeded = seeded;
      return out;
    } },

  /* PUT THE VENUES ON THE MAP. § */
  { id: 'place-the-venues',
    what: 'every venue with a postcode gets its coordinates',
    run: () => geocodeVenues() },

  /* ---------- `seed-the-families` WAS HERE, AND ITS ID STAYS SPENT § */

  /* ---------- THREE PAPER MIGRATIONS WERE HERE, AND THEIR IDS STAY SPENT § */

  /* THE LANDMARKS TAB HAS BEEN EMPTY SINCE IT WAS ADDED. Five real buildings with their real
     outlines — every corner as surveyed, not a rectangle drawn round them. */
  { id: 'colliers-wood-landmarks',
    retry: true,
    what: 'the Colliers Wood landmarks get their outlines',
    run: () => seedLandmarks() },

  /* A SECOND `colliers-wood-landmarks` WAS HERE, with the same id as the one above. § */

  /* EVERY WEARABLE IN THE SHOP HAS BEEN FREE SINCE THE TWO TABS WERE MERGED, and `seedAvatarItems` cannot fix it: § */
  { id: 'price-the-wearables',
    retry: true,
    what: 'the wearables get the prices they have in the code, without touching one anybody typed',
    run: () => repairShopPrices() },

  /* THE SUNDAY EMAIL BOOKS ITSELF (361): the owner forgot which functions they had run. Safe to repeat; the hour is kept right on every admin page load too. */
  { id: 'sunday-email',
    retry: true,
    what: 'the Sunday parent email is booked at weekly_digest_hour (9pm unless the config tab says otherwise)',
    run: () => digestKeepBooked_() || 'already booked at the right hour' },

  /* EVERYBODY'S HANDLE BECOMES THE TEMPLATE THEY CAN WORK OUT ALONE (364); the old one stays a sign-in alias. */
  { id: 'handles-to-template',
    retry: true,
    what: 'every handle becomes first initial, day of the month born, surname initial',
    run: () => { const r = renameHandles_(); if (r && r.error) throw new Error(r.error); return r; } },
];

/* ============================== POST ========================================================= */
/* ---------- WHO MAY DO WHAT § */
const ACTION_ACCESS = {
  // Open by necessity — you cannot be signed in to sign in.
  register: 'anyone', verifyEmail: 'anyone', verifyLogin: 'anyone',
  /* ---------- A FORGOTTEN PIN IS ASKED FOR BY SOMEBODY WHO CANNOT SIGN IN § */
  forgotPin: 'anyone',
  /* AND THE LINK IN THAT MAIL — `anyone`, for `forgotPin`'s reason: whoever opens it cannot sign in. What
     stops it being a way in is the key, two UUIDs long and mailed to the account's own address only. */
  pinLink: 'anyone',
  /* `broadcast: 'admin'` WAS HERE — one message to everybody — and went with its handler and its
     card on "remove the note to everyone button". An entry with no handler is a door onto nothing. */
  /* SIGNING IN WITH GOOGLE. § */
  googleLogin: 'anyone',
  /* `self`, so the token is resolved and the session ended belongs to whoever holds it. */
  signOut: 'self',
  /* `relogin` WAS HERE, AND IT WAS THE WAY IN. § */
  imageData: 'anyone',          // proxies a picture for the share canvas; reads nothing private

  // A person acting on their own record. Each handler still checks WHOSE row it is.
  updateProfile: 'self', saveNotepad: 'self', saveTodo: 'self', confirmDetails: 'self',
  saveTimetable: 'self',
  saveAvatar: 'self', saveFriends: 'self', saveScore: 'self', saveTtHighscore: 'self',
  /* YOUR OWN PICTURE. The handler writes `photo` on the row the token resolved to and nowhere else. */
  savePhoto: 'self',
  /* YOUR OWN ROLES — the three a person may tick, on the row the token resolved to. § */
  setMyRoles: 'self',
  myReferral: 'self',       // your own code, and who came through it
  saveExam: 'self', deleteExam: 'self', redeem: 'self',
  /* `likePost` was here. § */
  votePoll: 'self', reactPost: 'self',
  /* SAYING SOMETHING UNDER A POST, AND TAKING IT DOWN. § */
  addComment: 'self', deleteComment: 'self',
  /* Reading the folder, to choose a photograph already in it. Admin, because it lists what has not
     been posted yet — which is a view of your Drive rather than of the site. */
  folderFiles: 'admin',
  /* `orderPrints` WAS HERE and the handler priced a print from the SHEET, deliberately, because a total posted by a browser is a total the client chose. § */
  /* A parent asks; only the named child may answer. Both `self` — the handlers check WHO, which
     is the part that matters and the part a gate cannot see. */
  claimChild: 'self', answerClaim: 'self',
  /* All `self`: each handler checks the message is the asker's own, and the POLICY table decides
     who may write to whom. The gate cannot know either, so it only checks somebody is signed in. */
  listRecords: 'admin', saveRecordsPage: 'admin',
  sendMessage: 'self', messages: 'self', readMessage: 'self', flagMessage: 'self',
  /* WHETHER A PHOTOGRAPH IN A MESSAGE CAN BE KEPT — the column, the scope, the folder, a test file. § */
  checkUploads: 'admin',
  /* `self`, because it needs the current PIN — the gate cannot check that, only the handler can. § */
  changePin: 'self', signAgreement: 'self',
  /* A PARENT MAKING THEIR CHILD'S ACCOUNT, and a NEW PIN FOR SOMEBODY ELSE. § */
  makeChild: 'self', resetPin: 'self',
  /* A FRESH CONFIRMATION LINK TO YOUR OWN ADDRESS. § */
  resendLink: 'self',
  /* A NEW WORD FOR YOUR OWN HANDLE. § */
  /* The shop window is the business talking, so only the business may change it. */
  spotlight: 'admin',
  createCheckout: 'self', finalizePayment: 'self',
  move: 'self', tutorMove: 'self', createJob: 'self',
  /* JOINING THE LIST. `self` — anybody signed in may put themselves on it, and the handler checks it is their own name they are adding. § */
  joinWaitlist: 'self',
  /* ---------- OPENING A LIST IS ADMIN, AND HAD TO BE SAID HERE § */
  openWaitlist: 'admin',
  /* ANYBODY SIGNED IN, FOR THEIR OWN. `self` is the right level: the handler looks the person up
     from the signed-in name and never trusts a person_id off the body, so one person cannot star
     something as another. */
  favourite: 'self',
  /* JOINING A FESTIVE EVENT. `self` — anybody signed in may take a place, and the handler checks it
     is their own name going down. */
  joinFestive: 'self',
  /* MARKING A WORDED ANSWER WITH GEMINI. `self`, because every press costs a request and the cap is
     per person — counted against the id the token resolved to, which only a signed-in request has. */
  aiMark: 'self',
  /* WHAT A CHILD WROTE, KEPT ON THEIR ACCOUNT AND READ BACK ON ANOTHER DEVICE. § */
  saveAnswers: 'self',
  myAnswers: 'self',
  /* AN ANSWER SENT, AND ITS VERDICT (SCHEMA.submissions). § */
  submitAnswer: 'self',
  /* WHAT THE WEEKLY PARENT EMAIL WOULD SAY THIS WEEK. Admin and nobody else: the reply is every
     learner's week and every parent's address. It writes nothing and sends nothing — see
     backend/digest.gs. */
  digestPreview: 'admin',
  /* THE FILMS, FILLED FROM THE NOTFLIX FOLDER. § */
  filmsSync: 'admin',

  /* YOUR OWN SETTINGS, AS THE SHEET HOLDS THEM. `self`, and the handler reads only the row the token
     resolved to — see `myProfile` in dopost.gs for why it is a POST rather than part of the payload. */
  myProfile: 'self',
  /* WHICH EMAILS YOU WANT (`NOTIFY_KINDS`). § */
  setNotify: 'self',
  // The books, the prices, the rooms, the people list.
  diagnosePeople: 'admin', getProfile: 'admin', listPeople: 'admin',
  updateVenue: 'admin', updateConfig: 'admin', updatePricing: 'admin',
  updateShop: 'admin', deleteShopItem: 'admin',

  saveRoom: 'admin', updateTrip: 'admin', addTrip: 'admin',
  /* `updateResource`, `editResource` and `deleteResource` WERE HERE. § */
  editPost: 'admin', deletePost: 'admin',
  setListed: 'admin', scanPosts: 'admin',
  /* ANYBODY SIGNED IN MAY POST. § */
  addPost: 'self',
  /* Letting one through, or turning it down. Admin, obviously — this is the whole point of the
     waiting. */
  approvePost: 'admin',
  orderPosted: 'admin',
  /* MARKING A SESSION PAID BY HAND. Admin and nothing else, obviously — it is the one action on
     this site that says money arrived without a payment processor having said so. */
  markPaid: 'admin',
  /* ENDING A SESSION. Admin only, and deliberately: § */
  deleteJob: 'admin',
  /* LINKING A CHILD TO A PARENT WITHOUT ASKING THE CHILD. § */
  linkChild: 'admin', unlinkChild: 'admin',
  /* Reports every tab and column in the spreadsheet. It was open to anyone, which hands a
     stranger the shape of the whole database — the thing you would want before attacking it. */
  debugTabs: 'admin',
  /* Invitations. Opening one needs no account — that is the entire point, since the person being
     invited does not have one yet. */
  openInvite: 'anyone', acceptInvite: 'anyone',
  sendInvites: 'self',
};