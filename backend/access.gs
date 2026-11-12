/* @family. — access.gs WHAT A URL MAY RUN, THE ONE-OFF MIGRATIONS, AND WHO MAY DO WHAT: loads right after constants.gs. */

/* ============================== GET ========================================================== */
/* ---------- RUNNING A JOB FROM A URL § */
const RUNNABLE = {
  /* Forced, and then CHECKED — the report says what it meant to do, and this says what is
     actually on the sheet afterwards. Those had never been the same question. */
  ensureSchema:      () => ({ ran: ensureSchema_(), stillMissing: schemaGaps() }),
  schemaGaps:        () => schemaGaps(),
  makeBrandAccount:  a => makeBrandAccount(a),
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
  /* THE LIBRARY'S COPY INTO THE LEDGER (397): one more step now, and where it has got to. Both safe to run whenever. */
  libraryCopyStep:   () => libraryCopyStep(),
  libraryStatus:     () => libMigState_(),
  /* LIBRARY UPDATES WAITING IN THE OWNER'S DRIVE (407), imported as the Business card's tile does. */
  libImportDrive:    () => libImportDrive_(null),
  /* Reachable from a URL like everything else — but note that a URL CANNOT grant a scope. This
     will report what the deployment's existing token can do; raising the consent screen has to be
     a run from the editor. */
  authoriseDrive:    () => authoriseDrive(),
  checkScopes:       () => checkScopes(),
  /* Turn postcodes into coordinates. Run it after adding a venue; it skips anything already
     placed, so running it twice costs one request and changes nothing. */
  geocode:           () => geocodeVenues(),
  /* THE COLLIERS WOOD RACER'S MAP (426): OSM roads and buildings plus DEM heights, into a Drive file `?race=1` serves. `&arg=s,w,n,e` for another box. */
  buildRaceMap:      a => buildRaceMap_(a),
  regeocode:         () => geocodeVenues(true),
  rename:            a => renameValue_(a),
  seedOptions:       () => seedOptions(),
  /* `seedFamilies` WAS HERE, and went with the hand-written map it wrote — see where
     `KNOWN_FAMILIES` used to be. An admin links a child to a parent from the app (`linkChild`). */
  /* Fill in the wearable prices the code already holds, for a sheet that ran `seedAvatarItems` before it knew which columns the merged tab had. § */
  priceWearables:    () => repairShopPrices(),
  /* ---------- EVERY PERSON GETS A HANDLE, AND ONLY A BLANK CELL IS TOUCHED § */
  fillHandles:       () => fillHandles(),
  /* OLD SHEET ROWS INTO TODAY'S SHAPE (owner, 8 Nov), the same job as Business › Tidy old rows. */
  tidyOldRows:       () => migrateOldRows_(),
  /* ---------- AND EVERY HANDLE THAT WAS NEVER THE GENERATED SHAPE, ONCE § */
  renameHandles:     () => renameHandles_(),
  /* ---------- AND EVERY CHILD'S HANDLE INTO INITIALS AND FOUR DIGITS, PREVIEWED FIRST (342) § */
  /* `seedPastPapers`, `seedALevelPapers`, `dropOldALevelPapers` and `ensureResourceIds` WERE HERE. § */
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
  /* EVERY PIN FOUR DIGITS (owner, 10 Nov): a longer one keeps its first four; signing in with the old one still works (authCheckPin_). */
  { id: 'pins-four',
    what: 'every PIN longer than four digits cut to its first four',
    run: () => { const t = read(TAB.people); t.rows.forEach(r => { const p = S(r.pin); if (/^\d{5,8}$/.test(p)) authSetPin_(t, r, p.slice(0, 4)); }); } },
  /* `likes-to-reactions` WAS HERE, AND ITS ID STAYS SPENT: `tidy-old-tabs` turns any like still left into a 👍 before the tab goes. */

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

  /* `colliers-wood-landmarks` WAS HERE, AND ITS ID STAYS SPENT: the landmarks went with the map that never drew (431). */

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

  /* THE OWNER (367): a handle is the first initial and the year they joined. A new id, so the move runs once more. */
  { id: 'handles-initial-year',
    retry: true,
    what: 'every handle becomes first initial and the year they joined',
    run: () => { const r = renameHandles_(); if (r && r.error) throw new Error(r.error); return r; } },

  /* THE OWNER (372): first and last letter of the first name and the year joined. A new id, so it runs once more. */
  { id: 'handles-first-last-year',
    retry: true,
    what: 'every handle becomes the first and last letter of the first name and the year they joined',
    run: () => { const r = renameHandles_(); if (r && r.error) throw new Error(r.error); return r; } },

  /* THE OWNER (20 Oct): "delete any old bullshit we don't need anymore". A whole copy of the file first, then the tabs and columns nothing reads (379). */
  { id: 'tidy-old-tabs',
    retry: true,
    what: 'a backup copy of the Ledger, then the attempts, post_likes, widgets and orders tabs and the columns nothing reads are removed',
    run: () => tidyOldTabs_() },

  /* THE OWNER (494): the old reports read, then the table retired — every row not closed becomes a note for Claude, marked `migrated`. */
  { id: 'reports-to-notes',
    retry: true,
    what: 'every open report becomes a Note for Claude, as its reporter on its date; the reports tab is history after',
    run: () => reportsMigrate_() },

  /* THE LIBRARY MOVES INTO THE LEDGER (397): copied from LIB_SOURCE_COMMIT a few minutes at a time by a trigger, then every row checked against its source. */
  { id: 'library-to-ledger',
    retry: true,
    what: 'the questions, answers, practicals and content cards are copied into the Ledger and checked row by row',
    run: () => libMigrate_(),
    progress: () => libSetupSays_() },

  /* EVERY OLD JOB GETS ITS BOOKED HOURS (434): blank `slot_codes` filled from weekday + start + length; only blanks, so safe to repeat. */
  { id: 'jobs-slot-codes',
    retry: true,
    what: 'every booking gets its booked hours in slot_codes, so busy hours read one column',
    run: () => backfillSlotCodes_() },

  /* A DONE TICKED BY MISTAKE (498): every note marked done on 2026-10-28 that data/notes-done.json does not list is open again. */
  { id: 'notes-reopen-2026-10-28',
    retry: true,
    what: 'the notes ticked done on 28 October that no session addressed are open again',
    run: () => claudeNotesReopen_('2026-10-28') },
];

/* HANDS UP (455): who wants the tutor, kept 30 minutes in one script property, pruned on every read. */
const HANDS_KEY = 'HELP_HANDS';
const HANDS_TTL_MS = 30 * 60 * 1000;
function handsRead_() {
  let all = {};
  try { all = JSON.parse(PropertiesService.getScriptProperties().getProperty(HANDS_KEY) || '{}') || {}; } catch (e) { all = {}; }
  const now = Date.now();
  Object.keys(all).forEach(k => { if (!all[k] || !(now - Number(all[k].at) < HANDS_TTL_MS)) delete all[k]; });
  return all;
}
function handsWrite_(all) {
  try { PropertiesService.getScriptProperties().setProperty(HANDS_KEY, JSON.stringify(all || {})); } catch (e) {}
}

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
  /* YOUR OWN INTRO VIDEO, in parts: the handler writes `video_file` on the row the token resolved to. */
  videoPart: 'self',
  /* AN EXTRA PHOTO, uploaded: the handler only keeps the file; the link is saved by `updateProfile`. */
  photoFile: 'self',
  updateProfile: 'self', saveNotepad: 'self', saveTodo: 'self',
  saveTimetable: 'self',
  saveAvatar: 'self', saveScore: 'self', saveTtHighscore: 'self',
  /* YOUR OWN PICTURE. The handler writes `photo` on the row the token resolved to and nowhere else. */
  savePhoto: 'self',
  /* YOUR OWN CONSOLE PROGRESS (446): one Drive file per person and game, named from the token's row, never another's. */
  consoleSave: 'self', consoleLoad: 'self',
  /* YOUR OWN ROLES — the three a person may tick, on the row the token resolved to. § */
  setMyRoles: 'self',
  /* `likePost` was here. § */
  votePoll: 'self', reactPost: 'self',
  /* SAYING SOMETHING UNDER A POST, AND TAKING IT DOWN. § */
  addComment: 'self', deleteComment: 'self',
  /* Reading the folder, to choose a photograph already in it. Admin, because it lists what has not
     been posted yet — which is a view of your Drive rather than of the site. */
  /* `orderPrints` WAS HERE and the handler priced a print from the SHEET, deliberately, because a total posted by a browser is a total the client chose. § */
  /* A parent asks; only the named child may answer. Both `self` — the handlers check WHO, which
     is the part that matters and the part a gate cannot see. */
  claimChild: 'self', answerClaim: 'self',
  /* A child's card by its exact handle (442); the handler gates Client+ and counts. */
  findChild: 'self',
  /* A HAND UP FROM A QUESTION (455): the handler checks it is your own, or that Staff+ is lowering it. */
  raiseHand: 'self', hands: 'self',
  /* All `self`: each handler checks the message is the asker's own, and the POLICY table decides
     who may write to whom. The gate cannot know either, so it only checks somebody is signed in. */
  listRecords: 'admin', saveRecordsPage: 'admin', listBizChecks: 'admin', saveBizCheck: 'admin', tutorDbsChecked: 'admin', listOwnerAnswers: 'admin', saveOwnerAnswer: 'admin',
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
  move: 'self', createJob: 'self', answerRequest: 'self',
  /* JOINING THE LIST. `self` — anybody signed in may put themselves on it, and the handler checks it is their own name they are adding. § */
  joinWaitlist: 'self',
  /* ---------- OPENING A LIST IS ADMIN, AND HAD TO BE SAID HERE § */
  openWaitlist: 'admin',
  /* ANYBODY SIGNED IN, FOR THEIR OWN. `self` is the right level: the handler looks the person up
     from the signed-in name and never trusts a person_id off the body, so one person cannot star
     something as another. */
  favourite: 'self',
  /* MARKING A WORDED ANSWER WITH GEMINI. `self`, because every press costs a request and the cap is
     per person — counted against the id the token resolved to, which only a signed-in request has. */
  aiMark: 'self',
  /* A PHOTO OF THE WORKING (501): sent as yourself; read back by yourself, a linked parent, staff or admin (the handler checks). */
  markWorking: 'self', workingOf: 'self',
  /* WORK ON FILE: as yourself; the handler decides whose file (the student, a parent, a booked tutor, the admin). */
  workFileSave: 'self', workFilesOf: 'self', workFileOpen: 'self', workFileDelete: 'self',
  /* THE ASSISTANT IN MESSAGES (449): `self`, so the day's count is the token's person's. */
  askAssistant: 'self',
  /* WHAT A CHILD WROTE, KEPT ON THEIR ACCOUNT AND READ BACK ON ANOTHER DEVICE. § */
  saveAnswers: 'self',
  myAnswers: 'self',
  /* AN ANSWER SENT, AND ITS VERDICT (SCHEMA.submissions). § */
  submitAnswer: 'self',
  /* A QUESTION REPORTED (395): anybody signed in, as the token's person. Reading and closing them is the business's alone — a report is somebody else's words. */
  reportQuestion: 'self', report: 'self',
  /* AN ERROR FROM A PHONE: `anyone`, because a screen can break before sign-in; throttled per device and day in the handler. */
  clientError: 'anyone', listClientErrors: 'admin', tidyOldRows: 'admin',
  /* A SAMPLED VISIT'S FIGURES (920): `anyone`, as an error is; throttled per device and day in the handler. */
  healthLog: 'anyone',
  suggest: 'self', suggestUpload: 'admin', listSuggestions: 'admin', decideSuggestion: 'admin',
  /* APPLYING TO TEACH (400): your own application, and the admin's list and decision. */
  applyTeach: 'self', listApplications: 'admin', decideApplication: 'admin',
  /* THE STAFF HUB (405): a statement is the asker's own unless they are an admin (the handler says so); the terms register is the admin's. */
  payStatement: 'self', listStaff: 'admin',
  /* THE LIBRARY'S WORDS AND ANSWERS (397): anybody signed in, a day's cap each; the tools' copy in and out is the admin's. */
  libItems: 'self',
  libExport: 'admin', libImport: 'admin',
  /* AND UPDATES LEFT IN THE OWNER'S DRIVE BY A SESSION (407): the count and the import, the admin's alone. */
  libImportList: 'admin', libImportDrive: 'admin',
  /* WHAT THE WEEKLY PARENT EMAIL WOULD SAY THIS WEEK. Admin and nobody else: the reply is every
     learner's week and every parent's address. It writes nothing and sends nothing — see
     backend/digest.gs. */
  digestPreview: 'admin',
  /* AN ADMIN'S "SEND LAST WEEK" ON A PARENT'S CARD (378) — it emails a parent, so nobody else. */
  digestSendNow: 'admin',
  /* ONE PERSON'S PIN, READ ON A TAP OF "SHOW PIN" ON THEIR CARD (452) — never in doGet, never logged. */
  pinShow: 'admin',
  /* THE ADMIN'S LAYOUT (462, 463): the site-wide order of widgets and which are deleted, one config row. */
  layoutSave: 'admin',
  /* THE RULES CARD (496): one rule Exception or Universal for everybody, or Undo of the last change. */
  rulesSave: 'admin',
  /* EDIT WORDS IN PLACE (497): the site's words over the code's, one config row. */
  wordsSave: 'admin',
  /* THE WEEKLY EMAIL'S WORDS (491), four config rows. */
  digestWordsSave: 'admin',
  /* THE @FAMILY SHARE (8 Nov): config B, one share for everyone. */
  businessSettingSave: 'admin',
  /* NOTES FOR CLAUDE (484): an admin's words on a widget or card, and marking one done. */
  claudeNoteAdd: 'admin', claudeNoteDone: 'admin',
  /* FAVOURITE LINKS (509): your own list, written whole. */
  favLinksSave: 'self',
  /* THE REWRITE COACH (509): admin only for now, and the handler asks the rank again. */
  rewriteIdeas: 'admin', rewriteCheck: 'admin',
  /* THE FILMS, FILLED FROM THE NOTFLIX FOLDER. § */
  filmsSync: 'admin',
  /* The racer's Build the map tile (426): minutes of fetching from three outside services, so an admin's alone. */
  raceBuild: 'admin',
  /* AN ADMIN ADDS, EDITS, HIDES OR DELETES A REEL OR A VIDEO (404). */
  mediaSave: 'admin', mediaUpload: 'admin', mediaHide: 'admin', mediaDelete: 'admin',

  /* YOUR OWN SETTINGS, AS THE SHEET HOLDS THEM. `self`, and the handler reads only the row the token
     resolved to — see `myProfile` in dopost.gs for why it is a POST rather than part of the payload. */
  myProfile: 'self',
  /* WHICH EMAILS YOU WANT (`NOTIFY_KINDS`). § */
  setNotify: 'self',
  /* PHONE NOTIFICATIONS (492), each on the caller's own devices only — push.gs. */
  pushState: 'self', pushSubscribe: 'self', pushUnsubscribe: 'self', pushSet: 'self',
  /* One person's sheet row, for an admin. The books, prices, rooms, invitations and people-list handlers went in 433: nothing called them. */
  getProfile: 'admin',
  /* THE EMAIL WIDGET (493): the owner's own Gmail, read-only — inbox.gs. */
  inboxList: 'admin',
  /* `updateResource`, `editResource` and `deleteResource` WERE HERE. § */
  /* `self` (413): an author edits their own post while it waits and deletes it any time; each handler checks whose it is. */
  editPost: 'self', deletePost: 'self',
  setListed: 'admin',
  /* ANYBODY SIGNED IN MAY POST. § */
  addPost: 'self',
  /* Letting one through, or turning it down. Admin, obviously — this is the whole point of the
     waiting. */
  approvePost: 'admin',
  /* THE ROOM IN THE VENUE: `self`, and the handler lets only an admin or the session's tutor write it. */
  setRoom: 'self',
  /* ENDING A SESSION. Admin only, and deliberately: § */
  deleteJob: 'admin',
  /* LINKING A CHILD TO A PARENT WITHOUT ASKING THE CHILD. § */
  linkChild: 'admin', adminUnlinkFamily: 'admin',
  /* PEOPLE MADE, CHANGED AND REMOVED FROM THE PEOPLE COLUMN (373). */
  personGet: 'admin', personSave: 'admin', personDelete: 'admin',
};
