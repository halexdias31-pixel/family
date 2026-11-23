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
/* THE OWNER'S DOCKET, TIDIED (owner, 21 Nov): rules and generic words only — the docket itself stays in the owner's cell. Pure, so
   tools/docket-tidy-21nov.js runs it as served. (1) no item keeps `time`; (2) one "Jesus prayer" opens every list; (3) the "arrived home"
   list's teeth and room items become one daily "brush teeth" and one daily "clean room"; (4) planner estimates, set only where a field is
   missing, the first rule whose words match the title winning. The order rules are the planner's (js/map.js dkPlan_), not the data's. */
const DK21_OPENER = 'jesus prayer';
const DK21_ESTIMATES = [
  [/\bjog\w*/, { minutes: 20, effort: 'hard', place: 'out' }],
  [/\b(pull ?ups?|curls?|ohp|dips?|rows?|rdls?|push ?ups?|sit ?ups?)\b/, { minutes: 10, effort: 'hard', place: 'home' }],
  [/\bshower\w*/, { minutes: 10, place: 'home' }],
  [/\blaundr\w*/, { minutes: 5, runs: 60, place: 'home' }],
  [/\brice\b/, { minutes: 2, place: 'home' }],
  [/\bmeat\b/, { minutes: 15, place: 'home' }],
  [/\b(shopping|shop)\b/, { minutes: 20, place: 'out' }],
  [/\binstruments?\b/, { minutes: 20, place: 'home' }],
  [/\bbrush teeth\b/, { minutes: 3, place: 'home' }],
  [/\bfloss\w*/, { minutes: 2, place: 'home' }],
  [/\b(clean room|tidy)\b/, { minutes: 10, place: 'home' }],
  [/\bcharge\w*/, { minutes: 1, runs: 120, place: 'home' }],
  [/\bjesus prayer\b/, { minutes: 2, place: 'anywhere' }],
  [(t, i) => /\b(prayers?|trisagion|creed|intercessions?)\b/.test(t) || String((i && i.note) || '').length > 200, { minutes: 5, place: 'anywhere' }],
];
function docketOwnerTidy21Nov_(lists) {
  const key = i => String((i && i.title) || '').trim().toLowerCase();
  return (Array.isArray(lists) ? lists : []).map(L => {
    L = Object.assign({}, L || {});
    let items = (Array.isArray(L.items) ? L.items : []).map(i => { const o = Object.assign({}, i || {}); delete o.time; return o; });
    if (String(L.name || '').trim().toLowerCase() === 'arrived home') {
      const gone = ['clean room', 'brush teeth & clean room', 'brush teeth'];
      const at = items.findIndex(i => gone.indexOf(key(i)) >= 0);
      const fresh = [{ title: 'brush teeth', repeat: 'daily' }, { title: 'clean room', repeat: 'daily' }];
      items = items.filter(i => gone.indexOf(key(i)) < 0);
      items.splice(at < 0 ? items.length : at, 0, ...fresh);
    }
    const first = items.find(i => key(i) === DK21_OPENER) || { title: 'Jesus prayer', repeat: 'daily' };
    items = [first].concat(items.filter(i => key(i) !== DK21_OPENER));
    items.forEach(i => {
      const t = key(i), hit = DK21_ESTIMATES.find(([m]) => (typeof m === 'function' ? m(t, i) : m.test(t)));
      if (hit) Object.keys(hit[1]).forEach(k => { if (i[k] === undefined || i[k] === null || i[k] === '') i[k] = hit[1][k]; });
    });
    L.items = items;
    return L;
  });
}

/* THE OWNER'S DOCKET, TIDIED IN PLACE: the owner's row's `todo` cell, written directly (no request, token or JSONP answer); thrown when it
   cannot, so autoMigrate_ records FAILED_ and asks again. */
function docketOwnerTidyRun_() {
  const t = read(TAB.people), me = t.rows.find(r => isOwner_(r));
  if (!me || !S(me.person_id)) throw new Error('no owner found (owner_email on the config tab, an admin row with that address)');
  let got = null;
  try { got = JSON.parse(S(me.todo)); } catch (e) { got = null; }
  if (!got || !Array.isArray(got.lists)) return 'the owner has no docket lists - nothing to tidy';
  /* AN EMPTY FIELD IS LEFT OUT ('' or false: every reader takes a missing field so), or ten lists of long prayers, each one more item and its
     estimates, outgrow DOCKET_CELL_MAX that the untidied docket fitted. */
  const lists = docketTidy_(docketOwnerTidy21Nov_(got.lists)).map(L => Object.assign({}, L, {
    items: L.items.map(i => { const o = {}; Object.keys(i).forEach(k => { if (i[k] !== '' && i[k] !== false && i[k] != null) o[k] = i[k]; }); return o; }) }));
  const cell = JSON.stringify({ v: 1, lists: lists });
  if (cell === S(me.todo)) return 'already tidy - nothing changed';
  if (cell.length > DOCKET_CELL_MAX) throw new Error('the tidied docket is ' + cell.length + ' characters, over ' + DOCKET_CELL_MAX + ' - nothing was saved');
  if (!setCell(t, me, 'todo', cell)) throw new Error('the people tab has no todo column - nothing was saved');
  return lists.length + ' list(s), ' + lists.reduce((n, L) => n + L.items.length, 0) + ' item(s) tidied';
}

/* NO-AI MARKS (one list kind, 22 Nov): an assignment whose own note says no generative AI gets `noAI`, so the rule names no course. */
function assignNoAiRun_() {
  const t = read(TAB.people); let n = 0;
  t.rows.forEach(r => {
    let got = null; try { got = JSON.parse(S(r.assignments)); } catch (e) { got = null; }
    if (!got || !Array.isArray(got.assignments)) return;
    let hit = false;
    got.assignments.forEach(a => { if (a && !a.noAI && /no generative ai/i.test(S(a.note))) { a.noAI = true; hit = true; n++; } });
    if (hit && !setCell(t, r, 'assignments', JSON.stringify(got))) throw new Error('the people tab has no assignments column - nothing was saved');
  });
  return n + ' assignment(s) marked noAI';
}

/* HOT BREAKFAST (owner, 23 Nov): one daily choice in the owner's breakfast list ("Out of Shower"), added once, never twice. */
function docketHotBreakfastRun_() {
  const t = read(TAB.people), me = t.rows.find(r => isOwner_(r));
  if (!me) throw new Error('no owner found');
  let got = null; try { got = JSON.parse(S(me.todo)); } catch (e) { got = null; }
  if (!got || !Array.isArray(got.lists)) throw new Error('the owner has no docket lists');
  const L = got.lists.find(l => /out of shower/i.test(S(l.name))) || got.lists[0];
  const title = 'Hot food: bacon, or a hot pasty from the corner shop';
  if (L.items.some(i => S(i.title) === title)) return 'already there';
  L.items.push({ title: title, repeat: 'daily', minutes: 10 });
  const cell = JSON.stringify(got);
  if (cell.length > DOCKET_CELL_MAX) throw new Error('the docket would be ' + cell.length + ' characters, over ' + DOCKET_CELL_MAX + ' - nothing was saved');
  if (!setCell(t, me, 'todo', cell)) throw new Error('the people tab has no todo column - nothing was saved');
  return 'added to ' + L.name;
}

/* DOCKET TIDY 2 (owner, 23 Nov: "tidy up certain tasks… without losing information… and get more prepared"): the old cell copied whole to the tab
   backup_docket_23nov first; nothing deleted: past one-offs go to "Overdue — check", ideas to "Ideas & notes", foods into two items whose notes list them;
   evening prep items added. Matched by title, so a run after the owner edits only does what still matches. */
function docketTidy23NovRun_() {
  const t = read(TAB.people), me = t.rows.find(r => isOwner_(r));
  if (!me) throw new Error('no owner found');
  const was = S(me.todo);
  let got = null; try { got = JSON.parse(was); } catch (e) { got = null; }
  if (!got || !Array.isArray(got.lists)) throw new Error('the owner has no docket lists');
  if (got.lists.some(L => L.name === 'Ideas & notes')) return 'already tidied';
  const ss = t.sheet.getParent(), bk = ss.getSheetByName('backup_docket_23nov') || ss.insertSheet('backup_docket_23nov');
  bk.appendRow([new Date(), was]);
  if (S(bk.getRange(bk.getLastRow(), 2).getValue()) !== was) throw new Error('the backup did not read back - nothing changed');
  const today = Utilities.formatDate(new Date(), 'Europe/London', 'yyyy-MM-dd');
  const list = n => got.lists.find(L => S(L.name).toLowerCase() === n.toLowerCase());
  const take = (L, title) => { if (!L) return null; const i = L.items.findIndex(x => S(x.title).trim() === title); return i < 0 ? null : L.items.splice(i, 1)[0]; };
  const overdue = { name: 'Overdue — check', items: [] }, ideas = { name: 'Ideas & notes', items: [] };
  /* every dated one-off already past, from every list, to Overdue (date kept) */
  got.lists.forEach(L => { L.items = L.items.filter(x => { if (x.date && !x.repeat && x.date < today) { overdue.items.push(x); return false; } return true; }); });
  /* eyes opened: one sentence split across two items, joined */
  const eo = list('eyes opend');
  if (eo) { const a = take(eo, 'Acknowledge that’s these schedules are the ideal thing which you need to do, but can be violated for'), b = take(eo, 'sake of circumstances.');
    if (a || b) eo.items.splice(3, 0, { title: 'Remember: these schedules are the ideal, but circumstances can break them', repeat: 'daily' }); }
  /* breakfast: the foods as one item, the shop trips as one */
  const os = list('Out of Shower'), ab = list('After brush teeth');
  if (os) {
    const foods = ['banana', 'date', 'Cereal!', 'Chia', 'Beans', 'Bread', 'Avacado', 'Strawberries', 'Nuts', 'apple', 'Egg', 'Whey!', 'Hot food: bacon, or a hot pasty from the corner shop'];
    const got1 = foods.map(f => take(os, f)).filter(Boolean).map(x => x.title);
    const yog = take(ab, 'Yoghurt!'); if (yog) got1.unshift('Yoghurt');
    if (got1.length) os.items.push({ title: 'Breakfast', repeat: 'daily', minutes: 15, note: 'Pick from: ' + got1.join(', ') });
    const lunch = ['Tuna', 'Salad'].map(f => take(os, f)).filter(Boolean).map(x => x.title);
    const pack = take(os, 'Pack food');
    if (pack || lunch.length) os.items.push({ title: 'Take your packed food to work', repeat: 'daily', minutes: 2, note: 'Packed the night before. Good fillings: ' + (lunch.concat(['egg', 'bread', 'fruit', 'nuts'])).join(', ') });
    const shops = [take(os, 'Morning shop'), take(os, 'Morning shop'), take(os, 'Shopping')].filter(Boolean);
    if (shops.length) os.items.push({ title: 'Morning shop (only if something is missing)', repeat: 'daily', minutes: 20, place: 'out' });
  }
  /* desk lists: the two certificate notices as one; ideas and long notes to Ideas & notes */
  const dk = list('@ Desk'), bd = list('back @ desk');
  const n1 = take(dk, 'Important Notice – Summer 2026 Examination Certificates'), n2 = take(dk, 'Important Notice – Summer 2026 Examination Certificates cancel wow');
  if (dk && (n1 || n2)) dk.items.push({ title: 'Summer 2026 exam certificates notice (cancel?)' });
  const toIdeas = (L, titles) => titles.forEach(ti => { const x = take(L, ti); if (x) ideas.items.push(x); });
  toIdeas(dk, ['Add read Bible and add as a project as church farthers return the computer chip from amazon late', 'Write out business plan and all things involved lego circuit. lego contraptions', '3d print tinkercad', 'Once you done everything you need to do you can do what you want. You can stay up late ect']);
  toIdeas(bd, ['Don’t react. Act. Follow you schedule', 'Use ai for organising bedroom, and organising todos', 'A system is what it does', 'Branded things', 'Akrevia oikonomia', 'Sleep warm', 'Lego mini figure trading', 'Lego trade in service', 'Mini gokd', 'Mini table football', 'here', 'You are the nightly run for the owner\'s tutoring site, repo halexdias31-pixel/family. The owner is not a programmer.']);
  /* getting ready the night before (owner: not prepared -> the car -> parking) */
  const ah = list('arrived home');
  if (ah) [{ title: 'Pack tomorrow\'s food (in the fridge, by the door)', repeat: 'daily', minutes: 10, place: 'home' },
           { title: 'Lay out clothes and bag for tomorrow', repeat: 'daily', minutes: 5, place: 'home' },
           { title: 'Plan getting to work without the car (walk or bus)', repeat: 'daily', minutes: 2 }].forEach(x => ah.items.push(x));
  if (overdue.items.length) got.lists.push(overdue);
  got.lists.push(ideas);
  const cell = JSON.stringify(got);
  if (cell.length > DOCKET_CELL_MAX) throw new Error('the tidied docket is ' + cell.length + ' characters, over ' + DOCKET_CELL_MAX + ' - nothing was saved');
  if (!setCell(t, me, 'todo', cell)) throw new Error('the people tab has no todo column - nothing was saved');
  return overdue.items.length + ' to Overdue, ' + ideas.items.length + ' to Ideas & notes; breakfast, packed food and shop trips joined; 3 evening prep items added';
}

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

  /* THE OWNER'S DOCKET, TIDIED (owner, 21 Nov; again 22 Nov). `docket-owner-tidy-21nov` WAS HERE, AND ITS ID STAYS SPENT: it was a run-once job,
     so MIGRATED_ was written before it ran and its one failure was final (and hidden from the setup card); it saved through postSavePerson_
     and JSON.parse'd the answer, which on an admin's page load is JSONP (`cb({...});`) and threw. Now: `retry`, so it is marked only when it
     worked; the owner's row (isOwner_) alone; the `todo` cell written with setCell, through docketOwnerTidy21Nov_ then docketTidy_, no request
     needed. Twice does what once did. tools/docket-tidy-21nov.js runs it through autoMigrate_. */
  { id: 'docket-owner-tidy-22nov',
    retry: true,
    what: "the owner's docket: no times, one Jesus prayer first in each list, planner estimates where missing",
    run: () => docketOwnerTidyRun_() },
  /* THE KINDS NOTHING READ (queue step 7, 22 Nov): their items rows copied whole to a backup tab, checked there, then deleted. Twice does what once did. */
  { id: 'dead-kinds-22nov',
    what: 'the items rows of six kinds nothing reads, kept in backup_dead_kinds_22nov, then deleted',
    run: () => storeDropKinds_(DEAD_KINDS_22NOV, DEAD_KINDS_BACKUP) },
  { id: 'assign-noai-22nov',
    retry: true,
    what: 'assignments whose note says no generative AI marked noAI (tracked only)',
    run: () => assignNoAiRun_() },
  { id: 'docket-hot-breakfast-23nov',
    retry: true,
    what: "the owner's breakfast list: a daily hot food choice (bacon, or a pasty from the corner shop)",
    run: () => docketHotBreakfastRun_() },
  { id: 'docket-tidy-23nov',
    retry: true,
    what: "the owner's docket tidied (backup tab first): past one-offs to Overdue, ideas to Ideas & notes, foods and shop trips joined, evening prep added",
    run: () => docketTidy23NovRun_() },
];

/* ---------- MOVING ROWS OUT OF THE ITEMS TAB, NEVER LOSING ONE (queue step 7, 22 Nov) ----------
   Every items row of `kinds` is appended, every column as it is, to the tab `backup` in the same file (one it already holds is
   not appended again); the backup is read back, and only when every row is there are they deleted, bottom up. */
const DEAD_KINDS_22NOV = ['invite', 'biz_check', 'owner_answer', 'landmark', 'landmark_part', 'map_shape'];
const DEAD_KINDS_BACKUP = 'backup_dead_kinds_22nov';
function storeDropKinds_(kinds, backup) {
  clearCache();
  const img = storeImg_(TAB.items, kinds);
  if (!img.sheet) throw new Error('no items tab');
  const H = img.headers, cells = r => H.map(h => (r[h] === undefined || r[h] === null ? '' : r[h]));
  const key = v => JSON.stringify(v.map(c => (c instanceof Date ? c.getTime() : String(c))));
  const gone = img.rows.filter(r => kinds.indexOf(S(r.kind)) !== -1).sort((a, b) => a._row - b._row);
  if (!gone.length) return 'nothing left to move';
  const ss = img.sheet.getParent(), bk = ss.getSheetByName(backup) || ss.insertSheet(backup);
  const held = () => { const n = bk.getLastRow(); return n > 1 ? bk.getRange(2, 1, n - 1, H.length).getValues().map(key) : []; };
  if (!bk.getLastRow()) bk.getRange(1, 1, 1, H.length).setValues([H]);
  const have = held(), add = gone.map(cells).filter(v => have.indexOf(key(v)) === -1);
  if (add.length) bk.getRange(bk.getLastRow() + 1, 1, add.length, H.length).setValues(add);
  const now = held();
  if (!gone.every(r => now.indexOf(key(cells(r))) !== -1)) throw new Error('the backup does not hold every row - nothing was deleted');
  const at = gone.map(r => r._row).sort((a, b) => b - a);
  for (let i = 0; i < at.length;) {
    let j = i;
    while (j + 1 < at.length && at[j + 1] === at[j] - 1) j++;
    img.sheet.deleteRows(at[j], j - i + 1);
    i = j + 1;
  }
  POST_WROTE = true;
  clearCache();
  return gone.length + ' row(s) kept in ' + backup + ' and deleted from items';
}

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
/* ---------- WHO MAY DO WHAT: PERMISSIONS and levelOf_ (booking.gs), generated from data/settings/actions.json; RUNNABLE below. */

/* ---------- ACTIONS (generated) ---------- */
/* GENERATED by tools/permissions.js from data/settings/actions.json: edit the json, never this. */
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
