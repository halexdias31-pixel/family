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


/* THE OWNER'S DOCKET JOBS OF 21-25 NOV WERE HERE (the tidies, hot breakfast, food slots, the same slots at every meal, the two lists): each one
   reshaped the lists the one list below replaces, so they went with it (owner, 25 Nov night); their ids stay spent (MIGRATIONS). */
/* THE DOCKET IS ONE LIST, NAMES ONLY (owner, 25 Nov night: "simplest, most stable"): "Every 8 hours" and "@ Desk" (and any other list, after them, in
   order) become the one list "Docket". Each item keeps only its title, its repeat ('8h'; a 'daily' one becomes '8h'), its date (a one-off's), its done
   state and `runs` (owner, 25 Nov night: the one hidden number), and a slot item its slot's option names as `options` (the plan, owner 27 Nov: "Prayer ·
   <option>"); its note, minutes, place, effort, slot, covers and the rest go, and so do the cell's `slots` (their notes with them): all of it stays in the backup row. "10-minute
   tidy" is renamed "Tidy room"; the food, Prayer and Exercise slot items are plain items. Only a cell the two-list job left ("Every 8 hours" among its
   lists) is changed; the backup tab first, read back; the size cap; the cell read back; a re-run finds nothing to do. tools/docket-onelist.js checks it. */
const DK_ONE_LIST = 'Docket', DK_ONE_BACKUP = 'backup_docket_onelist_25nov', DK_ONE_FIRST = ['every 8 hours', '@ desk'];
const DK_ONE_RENAME = [[/^10[- ]?minute tidy$/i, 'Tidy room']];
/* ONE ITEM, NAMES ONLY: title, repeat, date, done, doneOn and the one hidden number `runs` (minutes it runs by itself; the Now order), each only when it says something. Pure. */
function docketOneItem_(it, slots) {
  const title = DK_ONE_RENAME.reduce((t, r) => (r[0].test(t) ? r[1] : t), S(it && it.title)), o = { title: title };
  /* A re-run (the cell's `slots` gone) keeps the options the first run gave. */
  const opts = (slots && it.slot && slots[S(it.slot).toLowerCase()]) || (Array.isArray(it.options) ? it.options.map(o => S(o)).filter(Boolean) : []);
  if (opts.length) o.options = opts;
  if (it.repeat === '8h' || it.repeat === 'daily') { o.repeat = '8h'; if (/^\d{4}-\d{2}-\d{2}\/[123]$/.test(S(it.doneOn))) o.doneOn = S(it.doneOn); if (+it.runs > 0) o.runs = Math.round(+it.runs); return o; }
  if (/^\d{4}-\d{2}-\d{2}$/.test(S(it.date))) o.date = S(it.date);
  if (+it.runs > 0) o.runs = Math.round(+it.runs);
  if (it.done === true) { o.done = true; if (/^\d{4}-\d{2}-\d{2}$/.test(S(it.doneOn))) o.doneOn = S(it.doneOn); }
  return o;
}
function docketOneList25NovRun_() {
  const t = read(TAB.people), me = t.rows.find(r => isOwner_(r));
  if (!me) throw new Error('no owner found');
  const was = S(me.todo);
  let got = null; try { got = JSON.parse(was); } catch (e) { got = null; }
  if (!got || !Array.isArray(got.lists)) throw new Error('the owner has no docket lists');
  const lists = got.lists.filter(Boolean), key = L => S(L.name).trim().toLowerCase();
  /* ALREADY THE ONE LIST: left whole, so a late re-run never strips what came after it (the plan's numbers, docket-plan-27nov). */
  if (lists.length === 1 && S(lists[0].name) === DK_ONE_LIST) return 'nothing to do';
  if (!lists.some(L => key(L) === DK_ONE_FIRST[0]))
    throw new Error('the docket is not the two lists (Every 8 hours, @ Desk) - nothing changed');
  const rank = L => { const k = DK_ONE_FIRST.indexOf(key(L)); return k < 0 ? DK_ONE_FIRST.length : k; };
  const order = lists.map((L, n) => [L, n]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(x => x[0]);
  /* EACH SLOT'S OPTION NAMES, by the slot's name (any case); no notes. */
  const slots = {};
  (Array.isArray(got.slots) ? got.slots : []).forEach(x => { if (x && S(x.name)) slots[S(x.name).toLowerCase()] = (Array.isArray(x.options) ? x.options : [])
    .map(o => S(o && typeof o === 'object' ? o.name : o).slice(0, 100)).filter(Boolean).slice(0, 50); });
  const items = [].concat(...order.map(L => (Array.isArray(L.items) ? L.items : []).filter(it => it && S(it.title)).map(it => docketOneItem_(it, slots))));
  const cell = todoTidy_(JSON.stringify({ v: got.v || 1, lists: [{ name: DK_ONE_LIST, items: items }] }));
  if (cell === was) return 'nothing to do';
  const said = 'one list "' + DK_ONE_LIST + '" of ' + JSON.parse(cell).lists[0].items.length + ' item(s), from ' + order.map(L => S(L.name)).join(' + ');
  const ss = t.sheet.getParent(), bk = ss.getSheetByName(DK_ONE_BACKUP) || ss.insertSheet(DK_ONE_BACKUP);
  bk.appendRow([new Date(), was, said]);
  if (S(bk.getRange(bk.getLastRow(), 2).getValue()) !== was) throw new Error('the backup did not read back - nothing changed');
  if (cell.length > DOCKET_CELL_MAX) throw new Error('the docket would be ' + cell.length + ' characters, over ' + DOCKET_CELL_MAX + ' - nothing was saved');
  if (!setCell(t, me, 'todo', cell)) throw new Error('the people tab has no todo column - nothing was saved');
  clearCache();
  const back = read(TAB.people).rows.find(r => isOwner_(r));
  if (!back || S(back.todo) !== cell) throw new Error('the docket did not read back');
  return said + ' (the old cell in ' + DK_ONE_BACKUP + ')';
}

/* THE PLAN'S NUMBERS (owner, 27 Nov): the owner's own values for the planner (js/map.js dkSort_) written onto their items. An item is matched by the
   todoBase_ (post-account.gs) of its title's first four words, lowercased, letters and digits only, so no task text is in this public file. Only the
   fields named are set, none other touched; an item already holding them is left; nothing matched or nothing to change is "nothing to do". It runs on
   the one list alone (one list "Docket": after docket-onelist-25nov, which would drop these fields), else it throws and is retried. The backup tab first
   (the whole old cell), read back; the size cap; the cell read back. tools/docket-plan.js checks it. */
const DK_PLAN_BACKUP = 'backup_docket_plan_27nov';
const DK_PLAN_27NOV = [
  [['6.1wmszhm'], { anchor: 'wake', minutes: 5 }],
  [['e.15yual7'], { minutes: 1 }],
  [['7.ijpvy8', '5.xtvjpa', 'd.8zitoe', '5.1u6o5y4', '3.uumrh5', 'a.5hsxk1', '5.1nrqe8h'], { minutes: 5, anchor: 'meal' }],
  [['8.19r3b3x'], { minutes: 20, place: 'out', from: '07:00', until: '22:00' }],
  [['7.th2ynb'], { minutes: 10, place: 'home', anchor: 'meal' }],
  [['5.1ctg8cu'], { minutes: 2, place: 'home', anchor: 'bed' }],
  [['b.4womvh'], { minutes: 3, place: 'home', anchor: 'bed' }],
  [['e.1amjoc', '9.1vce7ig'], { minutes: 10, place: 'home' }],
  [['a.1g782yy'], { minutes: 15, place: 'out', from: '07:00', until: '21:00' }],
  [['8.1w39ce3'], { minutes: 30, place: 'home' }],
  [['6.1x3os3v'], { minutes: 10, place: 'home' }],
  [['5.1w14eeo'], { minutes: 1, place: 'home' }],
  [['7.y5ipd2'], { minutes: 5, runs: 60, place: 'home', stay: true, from: '09:00', until: '21:00' }],
  [['4.1leehtx', 'e.j74n'], { minutes: 5 }],
  [['g.e9kmrg'], { minutes: 1, runs: 120, place: 'home' }],
  [['g.pg2lnm'], { minutes: 1 }],
  [['f.ajop0d'], { minutes: 5, place: 'phone', from: '09:00', until: '21:00', date: '2026-11-29' }],
  [['j.1s8cnt3'], { minutes: 10, place: 'phone', date: '2026-11-30' }],
  [['f.l5989g'], { minutes: 60, place: 'desk', date: '2026-12-31' }],
];
const docketPlanKey_ = t => todoBase_((S(t).toLowerCase().match(/[a-z0-9]+/g) || []).slice(0, 4).join(' '));
function docketPlan27NovRun_() {
  const t = read(TAB.people), me = t.rows.find(r => isOwner_(r));
  if (!me) throw new Error('no owner found');
  const was = S(me.todo);
  let got = null; try { got = JSON.parse(was); } catch (e) { got = null; }
  if (!got || !Array.isArray(got.lists) || got.lists.length !== 1 || S(got.lists[0] && got.lists[0].name) !== DK_ONE_LIST)
    throw new Error('the docket is not yet the one list (docket-onelist-25nov first) - nothing changed');
  const items = Array.isArray(got.lists[0].items) ? got.lists[0].items : [], by = {};
  DK_PLAN_27NOV.forEach(r => r[0].forEach(k => { by[k] = r[1]; }));
  let n = 0;
  items.forEach(it => {
    const f = it && by[docketPlanKey_(it.title)];
    if (!f) return;
    let hit = false;
    Object.keys(f).forEach(k => { if (it[k] !== f[k]) { it[k] = f[k]; hit = true; } });
    if (hit) n++;
  });
  if (!n) return 'nothing to do';
  const cell = todoTidy_(JSON.stringify(got));
  if (cell === was) return 'nothing to do';
  const said = n + ' item(s) given the plan\'s numbers';
  const ss = t.sheet.getParent(), bk = ss.getSheetByName(DK_PLAN_BACKUP) || ss.insertSheet(DK_PLAN_BACKUP);
  bk.appendRow([new Date(), was, said]);
  if (S(bk.getRange(bk.getLastRow(), 2).getValue()) !== was) throw new Error('the backup did not read back - nothing changed');
  if (cell.length > DOCKET_CELL_MAX) throw new Error('the docket would be ' + cell.length + ' characters, over ' + DOCKET_CELL_MAX + ' - nothing was saved');
  if (!setCell(t, me, 'todo', cell)) throw new Error('the people tab has no todo column - nothing was saved');
  clearCache();
  const back = read(TAB.people).rows.find(r => isOwner_(r));
  if (!back || S(back.todo) !== cell) throw new Error('the docket did not read back');
  return said + ' (the old cell in ' + DK_PLAN_BACKUP + ')';
}

/* ASSIGNMENTS INTO THE DOCKET (owner, 27 Nov: the one time list; "migrate the 6 existing assignments, don't drop them"): every person's `assignments` cell
   becomes to-dos at the end of their own one list ("Docket", made when missing): its title, its due day as `date`, its time as `until`, minutes from its
   words (ASG_WORDS_AN_HOUR), its course, weight, mark and noAI; a submitted or marked one ticked for good (done, no day, so it never leaves). A title
   already on the list (any case) is not added twice. Per person: the backup tab first (time, person, the old assignments cell, the old todo cell),
   read back; the size cap; the todo cell read back; only then the assignments cell emptied. Nothing left to move is "nothing to do", so a re-run is a
   no-op. Its note and link stay in the backup row (the Docket keeps names only). tools/docket-assignments.js checks it. */
const ASG_DOCKET_BACKUP = 'backup_assignments_docket_27nov', ASG_WORDS_AN_HOUR = 250;
function asgDocketItem_(a) {
  const o = { title: S(a && a.title).slice(0, 300) }, words = S(a.unit).toLowerCase() === 'words' ? Number(a.amount) || 0 : 0;
  if (/^\d{4}-\d{2}-\d{2}$/.test(S(a.due))) o.date = S(a.due);
  if (/^\d{2}:\d{2}$/.test(S(a.time))) o.until = S(a.time);
  if (words > 0) o.minutes = Math.min(1440, Math.max(1, Math.round(words * 60 / ASG_WORDS_AN_HOUR)));
  if (S(a.course)) o.course = S(a.course).slice(0, 120);
  if (S(a.weight) !== '' && isFinite(Number(a.weight))) o.weight = Number(a.weight);
  if (S(a.mark)) o.mark = S(a.mark).slice(0, 40);
  if (a.noAI === true) o.noAI = true;
  if (S(a.status) === 'submitted' || S(a.status) === 'marked') { o.done = true; o.doneOn = ''; }
  return o;
}
function assignmentsToDocket27NovRun_() {
  const t = read(TAB.people);
  let n = 0, people = 0;
  t.rows.forEach(r => {
    const was = S(r.assignments);
    let got = null; try { got = JSON.parse(was); } catch (e) { got = null; }
    const list = got && Array.isArray(got.assignments) ? got.assignments.filter(a => a && S(a.title)) : [];
    if (!was || !list.length) return;
    const todoWas = S(r.todo);
    let cell = null; try { cell = JSON.parse(todoWas); } catch (e) { cell = null; }
    if (!cell || typeof cell !== 'object' || !Array.isArray(cell.lists))
      cell = { v: 1, lists: todoWas ? [{ name: DK_ONE_LIST, items: todoWas.split('\n').map(x => x.trim()).filter(Boolean).map(title => ({ title: title })) }] : [] };
    if (!cell.lists.length) cell.lists.push({ name: DK_ONE_LIST, items: [] });
    const L = cell.lists[0]; L.items = Array.isArray(L.items) ? L.items : [];
    const have = L.items.map(it => S(it && it.title).toLowerCase());
    list.forEach(a => { const it = asgDocketItem_(a); if (have.indexOf(it.title.toLowerCase()) < 0) { L.items.push(it); have.push(it.title.toLowerCase()); n++; } });
    const todo = todoTidy_(JSON.stringify(cell));
    if (todo.length > DOCKET_CELL_MAX) throw new Error('a docket would be ' + todo.length + ' characters, over ' + DOCKET_CELL_MAX + ' - nothing was saved for ' + S(r.person_id));
    const ss = t.sheet.getParent(), bk = ss.getSheetByName(ASG_DOCKET_BACKUP) || ss.insertSheet(ASG_DOCKET_BACKUP);
    bk.appendRow([new Date(), S(r.person_id), was, todoWas]);
    if (S(bk.getRange(bk.getLastRow(), 3).getValue()) !== was) throw new Error('the backup did not read back - nothing changed');
    if (!setCell(t, r, 'todo', todo)) throw new Error('the people tab has no todo column - nothing was saved');
    clearCache();
    const back = read(TAB.people).rows.find(x => S(x.person_id) === S(r.person_id));
    if (!back || S(back.todo) !== todo) throw new Error('the docket did not read back - the assignments were kept');
    if (!setCell(t, r, 'assignments', '')) throw new Error('the people tab has no assignments column');
    people++;
  });
  if (!people) return 'nothing to do';
  return n + ' assignment(s) of ' + people + ' person(s) now Docket to-dos (the old cells in ' + ASG_DOCKET_BACKUP + ')';
}

/* DOCKET INBOX (owner, 25 Nov; one list, 25 Nov night): a private Ledger tab `docket_inbox` (title, replaces; any other column, `list` and `note`
   among them, is ignored) that Claude or the owner drops items into. On every admin page load (setupOnAdminLoad_), if it has rows: the owner's cell is
   backed up (backup_docket_inbox: time, old cell, titles), each row becomes an undated one-off {title} at the end of the one list ("Docket"; made when
   missing), a title already there (any case) is skipped, the size cap is kept and the cell read back, then the rows read are deleted (the header stays).
   No tab or no rows: nothing happens. No item text is ever in the repo. A `replaces` column (" | "-separated titles, any case) removes those items, the
   new one taking the first one's place (named in the backup row); a row with no title and a `replaces` only removes. tools/docket-inbox.js checks it. */
const DOCKET_INBOX_TAB = 'docket_inbox', DOCKET_INBOX_BACKUP = 'backup_docket_inbox';
function docketInboxRun_() {
  const t = read(TAB.people), ss = t.sheet && t.sheet.getParent(), ib = ss && ss.getSheetByName(DOCKET_INBOX_TAB);
  if (!ib) return 'no inbox tab';
  const n = ib.getLastRow() - 1;
  if (n < 1) return 'nothing to do';
  const H = ib.getRange(1, 1, 1, Math.max(ib.getLastColumn(), 1)).getValues()[0].map(h => S(h).trim().toLowerCase());
  const col = k => H.indexOf(k), rows = ib.getRange(2, 1, n, H.length).getValues();
  const cell = (r, k) => (col(k) < 0 ? '' : S(r[col(k)]).trim());
  const me = t.rows.find(r => isOwner_(r));
  if (!me) throw new Error('no owner found');
  const was = S(me.todo);
  let got = null; try { got = was ? JSON.parse(was) : { v: 1, lists: [] }; } catch (e) { got = null; }
  if (!got || typeof got !== 'object') throw new Error('the owner\'s docket cell is not JSON - nothing changed');
  got.lists = Array.isArray(got.lists) ? got.lists.filter(Boolean) : [];
  let L = got.lists.find(x => S(x.name) === DK_ONE_LIST) || got.lists[0];
  if (!L) { L = { name: DK_ONE_LIST, items: [] }; got.lists.push(L); }
  L.items = (L.items || []).filter(Boolean);
  const added = [], skipped = [], removed = [];
  rows.forEach(r => {
    const title = cell(r, 'title');
    const rep = cell(r, 'replaces').split('|').map(x => x.trim().toLowerCase()).filter(x => x && x !== title.toLowerCase());
    if (!title && !rep.length) return;
    let at = -1, kept = 0;
    L.items = L.items.filter(it => {
      if (rep.indexOf(S(it.title).trim().toLowerCase()) < 0) { kept++; return true; }
      if (at < 0) at = kept;
      removed.push(S(it.title)); return false;
    });
    /* A DELETE-ONLY ROW (owner, 25 Nov night): no title, only `replaces`: those items go, nothing is added. */
    if (!title) return;
    if (L.items.some(it => S(it.title).trim().toLowerCase() === title.toLowerCase())) { skipped.push(title); return; }
    L.items.splice(at < 0 ? L.items.length : at, 0, { title });
    added.push(title);
  });
  if (added.length || removed.length) {
    const titles = 'added (' + added.length + '): ' + added.join(' | ') + (skipped.length ? '; skipped (' + skipped.length + '): ' + skipped.join(' | ') : '')
      + (removed.length ? '; replaced (' + removed.length + '): ' + removed.join(' | ') : '');
    const bk = ss.getSheetByName(DOCKET_INBOX_BACKUP) || ss.insertSheet(DOCKET_INBOX_BACKUP);
    bk.appendRow([new Date(), was, titles]);
    if (S(bk.getRange(bk.getLastRow(), 2).getValue()) !== was) throw new Error('the backup did not read back - nothing changed');
    const out = JSON.stringify(got);
    if (out.length > DOCKET_CELL_MAX) throw new Error('the docket would be ' + out.length + ' characters, over ' + DOCKET_CELL_MAX + ' - nothing was saved');
    if (!setCell(t, me, 'todo', out)) throw new Error('the people tab has no todo column - nothing was saved');
    clearCache();
    const back = read(TAB.people).rows.find(r => isOwner_(r));
    if (!back || S(back.todo) !== out) throw new Error('the docket did not read back - the inbox rows were kept');
  }
  ib.deleteRows(2, n);
  return added.length + ' added, ' + skipped.length + ' already there, ' + removed.length + ' replaced; ' + n + ' inbox row(s) cleared';
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

  /* THE KINDS NOTHING READ (queue step 7, 22 Nov): their items rows copied whole to a backup tab, checked there, then deleted. Twice does what once did. */
  { id: 'dead-kinds-22nov',
    what: 'the items rows of six kinds nothing reads, kept in backup_dead_kinds_22nov, then deleted',
    run: () => storeDropKinds_(DEAD_KINDS_22NOV, DEAD_KINDS_BACKUP) },
  { id: 'assign-noai-22nov',
    retry: true,
    what: 'assignments whose note says no generative AI marked noAI (tracked only)',
    run: () => assignNoAiRun_() },
  /* THE OWNER'S DOCKET JOBS OF 21-25 NOV WERE HERE, AND THEIR IDS STAY SPENT: docket-owner-tidy-22nov, docket-hot-breakfast-23nov,
     docket-tidy-23nov, docket-ideas-to-desk-23nov, docket-slots-23nov, docket-meals-24nov, docket-meal-cycle-25nov. The one list replaced them. */
  { id: 'docket-onelist-25nov',
    retry: true,
    what: "the docket as one list, names only: Every 8 hours and @ Desk merged into \"Docket\", each item its title, repeat, date and done state (backup tab first, the whole old cell in it)",
    run: () => docketOneList25NovRun_() },
  /* AFTER THE ONE LIST (it would drop these fields; this one throws, and is retried, until the one list is there). */
  { id: 'docket-plan-27nov',
    retry: true,
    what: "the plan's numbers on the owner's Docket items (minutes, runs, place, window, anchor, deadline; matched by title; nothing else touched; backup tab first)",
    run: () => docketPlan27NovRun_() },
  /* THE ONE TIME LIST (owner, 27 Nov): the Assignments tool went; its rows are Docket to-dos (backup tab first; a re-run a no-op). */
  { id: 'assignments-docket-27nov',
    retry: true,
    what: "every person's assignments as to-dos on their own Docket (due as the date, minutes from the words, course, weight, mark, noAI; backup tab first, the old cells in it)",
    run: () => assignmentsToDocket27NovRun_() },
  /* THE PERSONAL ARCHIVE (owner, 27 Nov): the library cards and notepads are Archive entries (backup tab first; a re-run a no-op). */
  { id: 'archive-28nov',
    retry: true,
    what: "every library card and notepad as an Archive entry of its person (backup tab first, the old values in it; then the old rows go)",
    run: () => archive28NovRun_() },
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

/* ---------- THE PERSONAL ARCHIVE (owner, 27 Nov): every library card and every notepad becomes an Archive entry of its person ----------
   A library card is a title (its library, else "Library card") and its free fields, one `name: value` a line (Card number, PIN); a notepad is the
   entry "Notepad", its words the text. The backup tab first (every old card and notepad, once), read back; then the entries (an id made from the
   person and the card's place, so a re-run finds them there); read back; then the old rows go (storeDropKinds_, its own backup) and the notepad cells
   are emptied. Nothing to move is "nothing to do". A login is never written to the log or the reply: the reply counts. tools/archive-move.js checks it. */
const ARCHIVE_BACKUP = 'backup_archive_28nov', ARCHIVE_LIB_BACKUP = 'backup_archive_28nov_items';
function archiveOfCard_(r, n) {
  const pid = S(r.person_id), lines = [['Card number', S(r.card_number).trim()], ['PIN', S(r.pin).trim()]].filter(x => x[1]);
  return { archive_id: 'lib-' + pid + '-' + n, person_id: pid, title: S(r.library).trim() || 'Library card', fields: lines.map(x => x[0] + ': ' + x[1]).join('\n'), text: '' };
}
function archive28NovRun_() {
  clearCache();
  const cards = read(TAB.library_cards).rows.filter(r => S(r.person_id) && (S(r.library) || S(r.card_number) || S(r.pin))).sort((a, b) => a._row - b._row);
  const ppl = read(TAB.people), pads = ppl.rows.filter(r => S(r.person_id) && S(r.notepad).trim());
  if (!cards.length && !pads.length) return 'nothing to do';
  const most = LIST_KINDS.archive.fields.find(F => F.f === 'text').max;
  if (pads.some(r => S(r.notepad).length > most)) throw new Error('a notepad is over ' + most + ' characters - nothing changed');
  /* THE BACKUP, FIRST: [when, what, person, the old value as it was]; one already held is not added again. */
  const old = cards.map(r => ['library_card', S(r.person_id), JSON.stringify({ library: S(r.library), card_number: S(r.card_number), pin: S(r.pin) })])
    .concat(pads.map(r => ['notepad', S(r.person_id), S(r.notepad)]));
  const ss = ppl.sheet.getParent(), bk = ss.getSheetByName(ARCHIVE_BACKUP) || ss.insertSheet(ARCHIVE_BACKUP);
  const key = v => JSON.stringify(v.map(S)), held = () => { const n = bk.getLastRow(); return n ? bk.getRange(1, 2, n, 3).getValues().map(key) : []; };
  const was = held();
  old.filter(v => was.indexOf(key(v)) === -1).forEach(v => bk.appendRow([new Date()].concat(v)));
  const now = held();
  if (!old.every(v => now.indexOf(key(v)) !== -1)) throw new Error('the backup did not read back - nothing changed');
  /* THE ENTRIES, each through the one tidy; one already there (a re-run after a stop) is not added twice. */
  const seen = {}, want = cards.map(r => { const p = S(r.person_id); seen[p] = (seen[p] || 0) + 1; return archiveOfCard_(r, seen[p]); })
    .concat(pads.map(r => ({ archive_id: 'notepad-' + S(r.person_id), person_id: S(r.person_id), title: 'Notepad', fields: '', text: S(r.notepad) })));
  const t = read('archive'), there = t.rows.map(r => S(r.archive_id));
  want.filter(e => there.indexOf(e.archive_id) === -1).forEach(e => addRow(t, listTidy_('archive', [e], 'as-is')[0]));
  clearCache();
  const back = read('archive').rows.map(r => S(r.archive_id));
  if (!want.every(e => back.indexOf(e.archive_id) !== -1)) throw new Error('the archive did not read back - the old rows are kept');
  /* AND ONLY THEN THE OLD: the card rows out of the items tab, the notepad cells emptied. */
  if (cards.length) storeDropKinds_(['library_card'], ARCHIVE_LIB_BACKUP);
  clearCache();
  const p2 = read(TAB.people);
  p2.rows.filter(r => S(r.notepad).trim()).forEach(r => { if (!setCell(p2, r, 'notepad', '')) throw new Error('the people tab has no notepad column'); });
  clearCache();
  return cards.length + ' library card(s) and ' + pads.length + ' notepad(s) moved into the Archive (the old values in ' + ARCHIVE_BACKUP + ')';
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
