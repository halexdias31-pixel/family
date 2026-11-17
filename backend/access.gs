/* @family. — access.gs WHAT A URL MAY RUN, THE ONE-OFF MIGRATIONS, AND WHO MAY DO WHAT: loads right after constants.gs. */

/* ============================== GET ========================================================== */
/* ---------- RUNNING A JOB FROM A URL § */
/* RUNNABLE is generated below from data/settings/actions.json (`run: true`); these are the jobs that are more than one call. */
/* Forced, and then CHECKED — the report says what it meant to do, and this says what is actually on the sheet afterwards. */
function runEnsureSchema_() { return { ran: ensureSchema_(), stillMissing: schemaGaps() }; }
function runClearPayloadCache_() {
  clearPayloadCache();
  return { cleared: true, generation: payloadGen_(), means: 'the next request rebuilds from the sheet as it is now' };
}
function runRegeocode_() { return geocodeVenues(true); }
/* LIBRARY UPDATES WAITING IN THE OWNER'S DRIVE (407), imported as the Business card's tile does. */
function runLibImportDrive_() { return libImportDrive_(null); }
/* FORGET A ONE-OFF JOB, so it runs again on the next request. § */
function runRerun_(a) {
  const props = PropertiesService.getScriptProperties();
  const id = S(a);
  if (id === 'schema') { props.deleteProperty('SCHEMA_VERSION'); return 'the schema will rebuild'; }
  if (!MIGRATIONS.some(m => m.id === id)) {
    return { error: 'No job called "' + id + '".', jobs: MIGRATIONS.map(m => m.id) };
  }
  props.deleteProperty('MIGRATED_' + id);
  return id + ' will run again on the next request';
}

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

  /* THE HANDLE FOLLOWS THE FIRST NAME (owner, 13 Nov): first two + last two letters + year; every handle that does not fit moves, the old one still signs in. */
  { id: 'handles-follow-first-name',
    retry: true,
    what: 'every handle that does not fit its first name is made again from it',
    run: () => { const r = renameHandles_(); if (r && r.error) throw new Error(r.error); return r; } },

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
  try { PropertiesService.getScriptProperties().setProperty(HANDS_KEY, JSON.stringify(all || {})); } catch (e) { /* script properties are best-effort here; the next run tries again */ }
}

/* ============================== POST ========================================================= */
/* ---------- WHO MAY DO WHAT: ACTION_ACCESS, generated below from data/settings/actions.json. */

/* ---------- ACTIONS (generated) ---------- */
/* GENERATED by tools/permissions.js from data/settings/actions.json: edit the json, never this. */
/* WHO MAY POST EACH ACTION: anyone, self (signed in; the handler checks whose row) or admin. */
const ACTION_ACCESS = {
  register: 'anyone',
  verifyEmail: 'anyone',
  verifyLogin: 'anyone',
  forgotPin: 'anyone',
  pinLink: 'anyone',
  googleLogin: 'anyone',
  signOut: 'self',
  videoPart: 'self',
  photoFile: 'self',
  updateProfile: 'self',
  saveNotepad: 'self',
  saveTodo: 'self',
  saveTimetable: 'self',
  savePhoto: 'self',
  setMyRoles: 'self',
  votePoll: 'self',
  reactPost: 'self',
  addComment: 'self',
  claimChild: 'self',
  answerClaim: 'self',
  findChild: 'self',
  raiseHand: 'self',
  hands: 'self',
  factSet: 'admin',
  listRecords: 'admin',
  saveRecordsPage: 'admin',
  listOwnerAnswers: 'admin',
  saveOwnerAnswer: 'admin',
  sendMessage: 'self',
  messages: 'self',
  readMessage: 'self',
  flagMessage: 'self',
  checkUploads: 'admin',
  changePin: 'self',
  signAgreement: 'self',
  makeChild: 'self',
  resetPin: 'self',
  resendLink: 'self',
  spotlight: 'admin',
  createCheckout: 'self',
  finalizePayment: 'self',
  move: 'self',
  createJob: 'self',
  answerRequest: 'self',
  joinWaitlist: 'self',
  openWaitlist: 'admin',
  favourite: 'self',
  markWorking: 'self',
  workingOf: 'self',
  workFileSave: 'self',
  workFilesOf: 'self',
  workFileOpen: 'self',
  workFileDelete: 'self',
  askAssistant: 'self',
  saveAnswers: 'self',
  myAnswers: 'self',
  submitAnswer: 'self',
  reportQuestion: 'self',
  report: 'self',
  clientError: 'anyone',
  listClientErrors: 'admin',
  tidyOldRows: 'admin',
  renameAllUsernames: 'admin',
  healthLog: 'anyone',
  suggest: 'self',
  suggestUpload: 'admin',
  listSuggestions: 'admin',
  decideSuggestion: 'admin',
  applyTeach: 'self',
  listApplications: 'admin',
  decideApplication: 'admin',
  payStatement: 'self',
  listStaff: 'admin',
  libItems: 'self',
  item: 'anyone',
  saveItem: 'self',
  libExport: 'admin',
  libImport: 'admin',
  libImportList: 'admin',
  libImportDrive: 'admin',
  digestPreview: 'admin',
  digestSendNow: 'admin',
  pinShow: 'admin',
  layoutSave: 'admin',
  wordsSave: 'admin',
  claudeNoteAdd: 'admin',
  claudeNoteDone: 'admin',
  filmsSync: 'admin',
  mediaSave: 'admin',
  mediaUpload: 'admin',
  mediaHide: 'admin',
  mediaDelete: 'admin',
  myProfile: 'self',
  setNotify: 'self',
  pushState: 'self',
  pushSubscribe: 'self',
  pushUnsubscribe: 'self',
  pushSet: 'self',
  getProfile: 'admin',
  editPost: 'self',
  deletePost: 'self',
  setListed: 'admin',
  addPost: 'self',
  approvePost: 'admin',
  setRoom: 'self',
  deleteJob: 'admin',
  linkChild: 'admin',
  adminUnlinkFamily: 'admin',
  personGet: 'admin',
  personSave: 'admin',
  personDelete: 'admin',
  lensOpen: 'admin',
};

/* A JOB FROM A URL (`?run=<job>&arg=…`), for an admin who proves name and PIN (getRun_). */
const RUNNABLE = {
  ensureSchema: () => runEnsureSchema_(),
  schemaGaps: () => schemaGaps(),
  makeBrandAccount: a => makeBrandAccount(a),
  installTriggers: () => installTriggers_(),
  listTriggers: () => listTriggers(),
  installSheetWatch: () => installSheetWatch_(),
  sheetWatchStatus: () => sheetWatchStatus(),
  clearPayloadCache: () => runClearPayloadCache_(),
  warmPayload: () => warmPayload(),
  checkEverything: () => checkEverything(),
  checkPostsFolder: () => checkPostsFolder(),
  syncFilms: () => syncFilms(),
  libraryCopyStep: () => libraryCopyStep(),
  libraryStatus: () => libMigState_(),
  libImportDrive: () => runLibImportDrive_(),
  authoriseDrive: () => authoriseDrive(),
  checkScopes: () => checkScopes(),
  geocode: () => geocodeVenues(),
  buildRaceMap: a => buildRaceMap_(a),
  regeocode: () => runRegeocode_(),
  rename: a => renameValue_(a),
  seedOptions: () => seedOptions(),
  priceWearables: () => repairShopPrices(),
  fillHandles: () => fillHandles(),
  tidyOldRows: () => migrateOldRows_(),
  renameHandles: () => renameHandles_(),
  seedHolidays: a => seedHolidays(a),
  rerun: a => runRerun_(a),
};
/* ---------- END ACTIONS ---------- */
