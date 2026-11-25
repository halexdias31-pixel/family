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
   backup_docket_23nov first; nothing deleted: past one-offs go to "Overdue — check", ideas to "@ Desk", foods into two items whose notes list them;
   evening prep items added; one daily Shopping in every list but the prayer-only ones (its shop items' titles in its note); a takeaway
   that covers Meat! and Rice; two car checks at the desk. Matched by title, so a run after the owner edits only does what still matches. */
const DK23_SHOP = /^(morning shop|shopping)$/i, DK23_NO_SHOP = /^(eyes opend|undercovers|ideas & notes|overdue — check)$/i;
/* NOTHING LOST: what a joined item was, each old title with its note, for the new item's note. */
const was23_ = xs => xs.filter(Boolean).map(x => S(x.title).trim() + (S(x.note) ? ' — ' + S(x.note) : '')).join('; ');
function docketTidy23NovRun_() {
  const t = read(TAB.people), me = t.rows.find(r => isOwner_(r));
  if (!me) throw new Error('no owner found');
  const was = S(me.todo);
  let got = null; try { got = JSON.parse(was); } catch (e) { got = null; }
  if (!got || !Array.isArray(got.lists)) throw new Error('the owner has no docket lists');
  if (got.lists.some(L => L.items.some(x => S(x.title) === 'Shopping' && /^only what's missing/.test(S(x.note))))) return 'already tidied';
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
    if (a || b) eo.items.splice(3, 0, { title: 'Remember: these schedules are the ideal, but circumstances can break them', repeat: 'daily', note: 'was: ' + was23_([a, b]) }); }
  /* breakfast: the foods as one item, the shop trips as one */
  const os = list('Out of Shower'), ab = list('After brush teeth');
  if (os) {
    const foods = ['banana', 'date', 'Cereal!', 'Chia', 'Beans', 'Bread', 'Avacado', 'Strawberries', 'Nuts', 'apple', 'Egg', 'Whey!', 'Hot food: bacon, or a hot pasty from the corner shop'];
    const got1 = foods.map(f => take(os, f)).filter(Boolean).map(x => was23_([x]));
    const yog = take(ab, 'Yoghurt!'); if (yog) got1.unshift(was23_([yog]));
    if (got1.length) os.items.push({ title: 'Breakfast', repeat: 'daily', minutes: 15, note: 'Pick from: ' + got1.join(', ') });
    const lunch = ['Tuna', 'Salad'].map(f => take(os, f)).filter(Boolean).map(x => was23_([x]));
    const pack = take(os, 'Pack food');
    if (pack || lunch.length) os.items.push({ title: 'Take your packed food to work', repeat: 'daily', minutes: 2, note: 'Packed the night before' + (pack ? ' (was: ' + was23_([pack]) + ')' : '') + '. Good fillings: ' + (lunch.concat(['egg', 'bread', 'fruit', 'nuts'])).join(', ') });
  }
  /* desk lists: the two certificate notices as one; ideas and long notes to Ideas & notes */
  const dk = list('@ Desk'), bd = list('back @ desk');
  const n1 = take(dk, 'Important Notice – Summer 2026 Examination Certificates'), n2 = take(dk, 'Important Notice – Summer 2026 Examination Certificates cancel wow');
  if (dk && (n1 || n2)) dk.items.push({ title: 'Summer 2026 exam certificates notice (cancel?)', note: 'was: ' + was23_([n1, n2]) });
  /* IDEAS STAY AT THE DESK (owner, 23 Nov: "it can just go in the at desk list"): the desk's own stay put; back @ desk's move to the desk. */
  const toIdeas = (L, titles) => titles.forEach(ti => { const x = take(L, ti); if (x) ideas.items.push(x); });
  if (false) toIdeas(dk, ['Add read Bible and add as a project as church farthers return the computer chip from amazon late', 'Write out business plan and all things involved lego circuit. lego contraptions', '3d print tinkercad', 'Once you done everything you need to do you can do what you want. You can stay up late ect']);
  toIdeas(bd, ['Don’t react. Act. Follow you schedule', 'Use ai for organising bedroom, and organising todos', 'A system is what it does', 'Branded things', 'Akrevia oikonomia', 'Sleep warm', 'Lego mini figure trading', 'Lego trade in service', 'Mini gokd', 'Mini table football', 'here', 'You are the nightly run for the owner\'s tutoring site, repo halexdias31-pixel/family. The owner is not a programmer.']);
  /* getting ready the night before (owner: not prepared -> the car -> parking) */
  const ah = list('arrived home');
  if (ah) [{ title: 'Pack tomorrow\'s food (in the fridge, by the door)', repeat: 'daily', minutes: 10, place: 'home' },
           { title: 'Lay out clothes and bag for tomorrow', repeat: 'daily', minutes: 5, place: 'home' },
           { title: 'Plan getting to work without the car (walk or bus)', repeat: 'daily', minutes: 2 }].forEach(x => ah.items.push(x));
  /* COVERS (owner, 23 Nov): one takeaway that is the evening's meat and rice; its tick ticks both (js/map.js dkTick_). */
  if (ah) ah.items.push({ title: 'Peter\'s Takeaway: sweet and sour chicken with rice box', repeat: 'daily', covers: ['Meat!', 'Rice'] });
  /* TWO CAR CHECKS, one-offs (owner, 23 Nov), at the desk. */
  const desk = dk || (got.lists.push({ name: '@ Desk', items: [] }), got.lists[got.lists.length - 1]);
  ['Car: find out about the airbag (warning light / check)', 'Car: wheels — balancing / wheel bearings, get checked'].forEach(ti => desk.items.push({ title: ti }));
  /* SHOPPING IN EVERY LIST (owner, 23 Nov) but the prayer-only ones: one daily "Shopping" each, in place of the list's own shop items, whose
     titles and notes go into its note. */
  got.lists.forEach(L => {
    if (DK23_NO_SHOP.test(S(L.name).trim())) return;
    const at = L.items.findIndex(x => DK23_SHOP.test(S(x.title).trim())), was = L.items.filter(x => DK23_SHOP.test(S(x.title).trim()));
    L.items = L.items.filter(x => !DK23_SHOP.test(S(x.title).trim()));
    const note = 'only what\'s missing; tomorrow\'s breakfast and packed food first' + (was.length ? ' (was: ' + was23_(was) + ')' : '');
    L.items.splice(at < 0 ? L.items.length : at, 0, { title: 'Shopping', repeat: 'daily', minutes: 20, place: 'out', note: note });
  });
  if (overdue.items.length) got.lists.push(overdue);
  ideas.items.forEach(x => desk.items.push(x));
  const cell = JSON.stringify(got);
  if (cell.length > DOCKET_CELL_MAX) throw new Error('the tidied docket is ' + cell.length + ' characters, over ' + DOCKET_CELL_MAX + ' - nothing was saved');
  if (!setCell(t, me, 'todo', cell)) throw new Error('the people tab has no todo column - nothing was saved');
  return overdue.items.length + ' to Overdue, ' + ideas.items.length + ' ideas to @ Desk; breakfast and packed food joined; one Shopping in every list; 3 evening prep items, the takeaway and 2 car checks added';
}

/* FOOD SLOTS (owner, 23 Nov): the morning's food items ("Out of Shower", and "Yoghurt!" after brushing teeth) give way to five daily slot items
   (Protein, Fruit, Dairy, Grain, Pack for later; js/map.js dkSlotOptions_), each old item's title and note kept in the note of the slot it fills; an
   evening "Meat!" or "Rice" becomes a slot where it stands (Meat, Carbs), its text as it was; a daily "Snack" slot added to the midday list once.
   The old cell copied whole to backup_docket_slots_23nov first, only when something is to change, so a re-run is a no-op. tools/docket-slots.js checks it. */
const DK_MORNING_SLOTS = [['Protein', /^(hot (food|breakfast)\b.*|eggs?|beans|tuna|whey.*|bacon|sausages?)!?$/i], ['Fruit', /^(bananas?|apples?|dates?|strawberr\w*|avo?cados?)!?$/i],
  ['Dairy', /^(yog(h)?urt|chia|milk)!?$/i], ['Grain', /^(breakfast|cereal|bread|toast)!?$/i], ['Pack for later', null]];
const DK_PACK_NOTE = 'snack: nuts, popcorn, fruit; lunch: tuna salad, sandwich';
const DK_SLOT_TITLES = [[/^meat!?$/i, 'Meat'], [/^(rice|carbs?)!?$/i, 'Carbs'], [/^snacks?!?$/i, 'Snack']];
function docketSlots23NovRun_() {
  const t = read(TAB.people), me = t.rows.find(r => isOwner_(r));
  if (!me) throw new Error('no owner found');
  const was = S(me.todo);
  let got = null; try { got = JSON.parse(was); } catch (e) { got = null; }
  if (!got || !Array.isArray(got.lists)) throw new Error('the owner has no docket lists');
  let n = 0, added = '';
  const list = re => got.lists.find(L => re.test(S(L.name)));
  const os = list(/out of shower/i), ab = list(/after brush teeth/i);
  if (os && !(os.items || []).some(it => it && it.slot)) {
    const slotOf = it => { const m = DK_MORNING_SLOTS.find(x => x[1] && x[1].test(S(it && it.title).trim())); return m ? m[0] : ''; };
    const wasOf = {}, at = (os.items || []).findIndex(slotOf);
    [os, ab].filter(Boolean).forEach(L => { L.items = (L.items || []).filter(it => { const s = slotOf(it); if (!s) return true; (wasOf[s] = wasOf[s] || []).push(it); return false; }); });
    const made = DK_MORNING_SLOTS.map(x => { const o = { title: x[0], repeat: 'daily', slot: x[0] }, w = wasOf[x[0]] ? 'was: ' + was23_(wasOf[x[0]]) : '';
      const note = [x[0] === 'Pack for later' ? DK_PACK_NOTE : '', w].filter(Boolean).join('\n\n'); if (note) o.note = note; return o; });
    os.items.splice(at < 0 ? os.items.length : at, 0, ...made);
    n += made.length;
  }
  got.lists.forEach(L => (L.items || []).forEach(it => {
    if (!it || it.slot) return;
    const m = DK_SLOT_TITLES.find(x => x[0].test(S(it.title).trim()));
    if (m) { it.slot = m[1]; n++; }
  }));
  if (!got.lists.some(L => (L.items || []).some(it => it && dkSame_(it.slot, 'Snack')))) {
    const mins = L => { const m = /^(\d{2}):(\d{2})$/.exec(S(L.start)); return m ? +m[1] * 60 + +m[2] : -1; };
    const ok = got.lists.filter(L => !DK23_NO_SHOP.test(S(L.name).trim()));
    const mid = ok.filter(L => mins(L) >= 660 && mins(L) < 960).sort((a, b) => Math.abs(mins(a) - 750) - Math.abs(mins(b) - 750))[0]
      || ok.find(L => /lunch|midday|desk/i.test(S(L.name))) || ok[0];
    if (mid) { mid.items = mid.items || []; mid.items.push({ title: 'Snack', repeat: 'daily', slot: 'Snack' }); added = mid.name; }
  }
  if (!n && !added) return 'nothing to do';
  const ss = t.sheet.getParent(), bk = ss.getSheetByName('backup_docket_slots_23nov') || ss.insertSheet('backup_docket_slots_23nov');
  bk.appendRow([new Date(), was]);
  if (S(bk.getRange(bk.getLastRow(), 2).getValue()) !== was) throw new Error('the backup did not read back - nothing changed');
  const cell = JSON.stringify(got);
  if (cell.length > DOCKET_CELL_MAX) throw new Error('the docket would be ' + cell.length + ' characters, over ' + DOCKET_CELL_MAX + ' - nothing was saved');
  if (!setCell(t, me, 'todo', cell)) throw new Error('the people tab has no todo column - nothing was saved');
  return n + ' item(s) made food slots' + (added ? '; a Snack slot added to ' + added : '');
}

/* THE SAME FOOD SLOTS AT EVERY MEAL (owner, 24 Nov; foods.json `meals`): the morning, midday and evening lists each hold one daily Protein,
   Carbs, Dairy, Veg and Fruit slot item. A Grain slot is the Carbs slot (Grain merged), a Meat slot the Protein one; a single food item
   (Rice, Meat!, banana…) gives way to its slot, its title and note kept in the slot's note ("was: …"); a missing slot is added after the
   list's last slot item. An item that covers others (the takeaway) is left, its `covers` following a renamed title. Snack and Pack for
   later stay where they are. Backup tab first, only when something is to change, so a re-run is a no-op. tools/docket-slots.js checks it. */
const DK_MEAL_SLOTS = ['Protein', 'Carbs', 'Dairy', 'Veg', 'Fruit'];
const DK_MEAL_FOODS = [['Protein', /^(hot (food|breakfast)\b.*|eggs?|beans|baked beans|tuna|whey.*|bacon|sausages?|meat|chicken|beef|salmon|smoked salmon|fish)!?$/i],
  ['Carbs', /^(grain|breakfast|cereal|bread|toast|rice|carbs?|pasta|potatoe?s?|porridge)!?$/i], ['Dairy', /^(yog(h)?urt|chia|milk|cheese|dairy)!?$/i],
  ['Veg', /^(veg|veggies|vegetables?|salad|broccoli|carrots?|spinach|peas|peppers?|tomato(es)?|cucumber|green beans)!?$/i],
  ['Fruit', /^(fruit|bananas?|apples?|dates?|strawberr\w*|avo?cados?)!?$/i]];
const DK_SLOT_MERGED = { grain: 'Carbs', meat: 'Protein' };
function docketMeals24NovRun_() {
  const t = read(TAB.people), me = t.rows.find(r => isOwner_(r));
  if (!me) throw new Error('no owner found');
  const was = S(me.todo);
  let got = null; try { got = JSON.parse(was); } catch (e) { got = null; }
  if (!got || !Array.isArray(got.lists)) throw new Error('the owner has no docket lists');
  const mins = L => { const m = /^(\d{2}):(\d{2})$/.exec(S(L.start)); return m ? +m[1] * 60 + +m[2] : -1; };
  const ok = got.lists.filter(L => L && !DK23_NO_SHOP.test(S(L.name).trim()));
  const pick = (lo, hi, re) => ok.find(L => mins(L) >= lo && mins(L) < hi) || ok.find(L => re.test(S(L.name)));
  const meals = [pick(0, 660, /shower|breakfast|morning/i), pick(660, 960, /lunch|midday|desk/i), pick(960, 1440, /home|dinner|evening/i)]
    .filter((L, i, a) => L && a.indexOf(L) === i);
  if (!meals.length) throw new Error('no morning, midday or evening list found');
  const note = (it, line) => { it.note = [S(it.note), line].filter(Boolean).join('\n\n'); };
  const renamed = {};
  let n = 0;
  meals.forEach(L => {
    L.items = (L.items || []).filter(Boolean);
    const has = {};
    L.items = L.items.filter(it => {
      let s = S(it.slot).trim();
      if (s && DK_SLOT_MERGED[s.toLowerCase()]) { s = DK_SLOT_MERGED[s.toLowerCase()]; it.slot = s; n++; }
      else if (!s && !(Array.isArray(it.covers) && it.covers.length)) {
        const m = DK_MEAL_FOODS.find(x => x[1].test(S(it.title).trim()));
        if (!m) return true;
        s = m[0]; it.slot = s; it.repeat = it.repeat || 'daily'; n++;
      }
      const to = DK_MEAL_SLOTS.find(x => dkSame_(x, s));
      if (!to) return true;
      const old = S(it.title), k = to.toLowerCase();
      if (old !== to) renamed[old] = to;
      if (has[k]) { note(has[k], 'was: ' + was23_([it])); n++; return false; }
      if (old !== to) { it.note = 'was: ' + was23_([it]); it.title = to; n++; }
      has[k] = it;
      return true;
    });
    DK_MEAL_SLOTS.forEach(x => {
      if (has[x.toLowerCase()]) return;
      const last = L.items.map(it => !!it.slot).lastIndexOf(true);
      L.items.splice(last < 0 ? L.items.length : last + 1, 0, { title: x, repeat: 'daily', slot: x });
      has[x.toLowerCase()] = true; n++;
    });
  });
  if (!n) return 'nothing to do';
  got.lists.forEach(L => (L.items || []).forEach(it => {
    if (it && Array.isArray(it.covers)) it.covers = it.covers.map(c => renamed[c] || c).filter((c, i, a) => a.indexOf(c) === i);
  }));
  const ss = t.sheet.getParent(), bk = ss.getSheetByName('backup_docket_meals_24nov') || ss.insertSheet('backup_docket_meals_24nov');
  bk.appendRow([new Date(), was]);
  if (S(bk.getRange(bk.getLastRow(), 2).getValue()) !== was) throw new Error('the backup did not read back - nothing changed');
  const cell = JSON.stringify(got);
  if (cell.length > DOCKET_CELL_MAX) throw new Error('the docket would be ' + cell.length + ' characters, over ' + DOCKET_CELL_MAX + ' - nothing was saved');
  if (!setCell(t, me, 'todo', cell)) throw new Error('the people tab has no todo column - nothing was saved');
  return n + ' change(s): ' + meals.map(L => S(L.name)).join(', ') + ' each hold ' + DK_MEAL_SLOTS.join(', ');
}

/* THE DOCKET IN TWO LISTS (owner, 25 Nov evening; never run before, so rewritten under its id): "Every 8 hours" holds the DK_CYCLE items once
   each, in this order, each repeating '8h' (js/map.js dkOn_: ticked for the current third of the day, back for the next); "@ Desk" holds every
   one-off (Instrument made one). Nothing else stays: every other list goes. One item that already IS a cycle item (brush teeth, clean room…) is
   reused, "was: <old title>" in its note, minutes and place kept; a second merges into its note. Prayer and Exercise are slot items like the
   food ones (dkSlotOptions_; a pick ticks the item): Exercise's options are in foods.json, Prayer's ONLY in the owner's cell (`slots`,
   dkFoodsWith_), made from the prayer items themselves: every item of a prayer-only list and every item titled as a prayer, its title the
   option's name and its note its text. No prayer's name or text is in this file, by design. Every other repeating item (DK_CYCLE_GONE and the
   rest) is removed. Every title removed or merged is named in the backup row; backup tab first, read back, the size cap; a re-run finds nothing
   to do. tools/docket-slots.js checks it. */
const DK_CYCLE_LIST = 'Every 8 hours';
const DK_CYCLE = [['Prayer', 'slot'], ['Glass of water', /^(a )?glass of water$/i],
  ['Shopping', DK23_SHOP, 'only what\'s missing for the next meal'],
  ['Protein', 'slot'], ['Carbs', 'slot'], ['Dairy', 'slot'], ['Veg', 'slot'], ['Fruit', 'slot'],
  ['Wash up', /^(wash(ing)? up|put away (the )?dishes|do (the )?dishes|dishes)$/i], ['Floss', /^floss$/i], ['Brush teeth', /^brush (your )?teeth$/i],
  ['10-minute tidy', /^(10[- ]?min(ute)? tidy|clean (your )?room|(small )?tidy( (your )?room)?)$/i], ['Short walk', /^(short )?walk$/i],
  ['Exercise', 'slot'], ['Shower', /^(have a )?shower$/i], ['Minox', /^minox$/i], ['Laundry', /^laundr[e]?y$/i], ['Young Giants', /^(yg|young giants)$/i],
  ['Read 5 minutes', /^(read 5 minutes|bible|read church father.*|remind yourself about \w+)$/i, 'Bible or Church Fathers'],
  ['Charge batteries', /^charge (the )?batter(y|ies)$/i], ['Check the Docket', /^check (the )?docket$/i]];
/* GONE (owner, 25 Nov): what the cycle and the slots replace, and what the owner no longer does; a regex, or [regex, only when repeating]. */
const DK_CYCLE_GONE = [/^remind (my|your)self about promise$/i, [/^uni$/i, true], /^screw in laptop$/i, /^do a web review who?ll?y$/i, /^philosophy time$/i,
  /^lay out clothes and bag for tomorrow$/i, /^plan getting to work without the car$/i, /^pack (tomorrow'?s food\b.*|for later)$/i, /^take your packed food\b.*$/i,
  /^(jog|run|workout|exercise( set)?|push[- ]?ups|pull[- ]?ups( and curls)?|curls|ohp( and dips)?|dips|sit[- ]?ups|helms rows?( and rdl)?|rdl)$/i,
  /^sandwh?ich$/i, /^carb ish$/i, /^add floss add brush teeth add shower$/i, /\bshower\b/i];
const DK_PRAYER_LIST = /^(eyes open\w*|undercovers)$/i, DK_PRAYER_TITLE = /\bpray(er|ers)?\b/i;
function docketMealCycle25NovRun_() {
  const t = read(TAB.people), me = t.rows.find(r => isOwner_(r));
  if (!me) throw new Error('no owner found');
  const was = S(me.todo);
  let got = null; try { got = JSON.parse(was); } catch (e) { got = null; }
  if (!got || !Array.isArray(got.lists)) throw new Error('the owner has no docket lists');
  got.lists = got.lists.filter(Boolean);
  got.lists.forEach(L => { L.items = (L.items || []).filter(Boolean); });
  const gone = [], title = it => S(it.title).trim(), log = (L, it) => gone.push(S(L.name) + ': ' + was23_([it]));
  /* (1) THE PRAYERS become the private Prayer slot's options (name and full text), merged by name, the longer text kept. */
  got.slots = Array.isArray(got.slots) ? got.slots.filter(s => s && s.name) : [];
  let pr = got.slots.find(s => dkSame_(s.name, 'Prayer'));
  const prayers = [];
  got.lists.forEach(L => { L.items.forEach(it => { if (!it.slot && (DK_PRAYER_LIST.test(S(L.name).trim()) || DK_PRAYER_TITLE.test(title(it)))) prayers.push([L, it]); }); });
  const named = new Set(prayers.map(([, it]) => title(it).toLowerCase()));
  got.lists.forEach(L => L.items.forEach(it => { if (!it.slot && named.has(title(it).toLowerCase()) && !prayers.some(p => p[1] === it)) prayers.push([L, it]); }));
  if (prayers.length && !pr) { pr = { name: 'Prayer', need: 1, options: [] }; got.slots.push(pr); }
  prayers.forEach(([L, it]) => {
    const o = pr.options.find(x => dkSame_(x.name, title(it)));
    if (!o) pr.options.push(Object.assign({ name: title(it) }, S(it.note) ? { note: S(it.note) } : {}));
    else if (S(it.note).length > S(o.note).length) o.note = S(it.note);
    log(L, it); L.items.splice(L.items.indexOf(it), 1);
  });
  if (!got.slots.length) delete got.slots;
  /* (2) THE CYCLE LIST, its items found in any list (the cycle list's own first), the first of each reused. */
  let cyc = got.lists.find(L => S(L.name) === DK_CYCLE_LIST);
  const from = (cyc ? [cyc] : []).concat(got.lists.filter(L => L !== cyc)), claimed = new Set(), block = [];
  const pool = from.flatMap(L => L.items.map(it => [L, it]));
  DK_CYCLE.forEach(([want, how, said]) => {
    const desired = S(said), slot = how === 'slot';
    const same = slot ? (it => dkSame_(it.slot, want)) : (it => !it.slot && how.test(title(it)));
    const found = pool.filter(([, it]) => !claimed.has(it) && same(it));
    found.forEach(([, it]) => claimed.add(it));
    if (!found.length) { const o = { title: want, repeat: '8h' }; if (slot) o.slot = want; if (desired) o.note = desired; block.push(o); return; }
    const [L0, it] = found[0], old = S(it.title), on = S(it.note);
    found.slice(1).forEach(([L, x]) => log(L, x));
    if (slot) { if (old !== want) { log(L0, { title: old }); it.title = want; } }
    else {
      if (old !== want) log(L0, { title: old });
      const keep = desired && on.startsWith(desired) ? on.slice(desired.length).replace(/^\n+/, '') : on;
      const parts = [desired, keep, old !== want ? 'was: ' + old : ''].concat(found.slice(1).map(([, x]) => 'was: ' + was23_([x])));
      if (old !== want || (desired && !on.startsWith(desired)) || found.length > 1) { it.title = want; it.note = parts.filter(Boolean).join('\n\n'); }
      if (!it.note) delete it.note;
    }
    if (it.repeat !== '8h') { it.repeat = '8h'; delete it.doneOn; delete it.done; delete it.pick; delete it.pickOn; delete it.date; delete it.time; }
    block.push(it);
  });
  got.lists.forEach(L => { L.items = L.items.filter(it => !claimed.has(it)); });
  if (!cyc) { cyc = { name: DK_CYCLE_LIST }; got.lists.unshift(cyc); }
  cyc.start = '00:00';
  cyc.items = block;
  /* (3) @ DESK: every one-off, in list order, after its own; Instrument made one and put last. Every other repeating item goes. */
  let desk = got.lists.find(L => S(L.name).trim().toLowerCase() === '@ desk');
  if (!desk) { desk = { name: '@ Desk', items: [] }; got.lists.push(desk); }
  const tail = [];
  got.lists.forEach(L => {
    if (L === cyc) return;
    L.items = L.items.filter(it => {
      if (/^instrument$/i.test(title(it)) && it.repeat) { delete it.repeat; delete it.doneOn; tail.push(it); return false; }
      const g = DK_CYCLE_GONE.some(x => (Array.isArray(x) ? x[0].test(title(it)) && (!x[1] || dkRep_(it)) : x.test(title(it))));
      if (g || dkRep_(it)) { log(L, it); return false; }
      if (L !== desk) { tail.push(it); return false; }
      return true;
    });
  });
  desk.items = desk.items.concat(tail);
  delete desk.start;
  got.lists.filter(L => L !== cyc && L !== desk).forEach(L => gone.push('list ' + S(L.name)));
  got.lists = [cyc, desk];
  if (JSON.stringify(got) === JSON.stringify(JSON.parse(was))) return 'nothing to do';
  const removed = gone.length ? 'removed or merged (' + gone.length + '): ' + gone.join(' | ') : 'nothing removed';
  const ss = t.sheet.getParent(), bk = ss.getSheetByName('backup_docket_cycle_25nov') || ss.insertSheet('backup_docket_cycle_25nov');
  bk.appendRow([new Date(), was, removed]);
  if (S(bk.getRange(bk.getLastRow(), 2).getValue()) !== was || S(bk.getRange(bk.getLastRow(), 3).getValue()) !== removed) throw new Error('the backup did not read back - nothing changed');
  const cell = JSON.stringify(got);
  if (cell.length > DOCKET_CELL_MAX) throw new Error('the docket would be ' + cell.length + ' characters, over ' + DOCKET_CELL_MAX + ' - nothing was saved');
  if (!setCell(t, me, 'todo', cell)) throw new Error('the people tab has no todo column - nothing was saved');
  return 'two lists: ' + DK_CYCLE_LIST + ' (the ' + DK_CYCLE.length + '-item cycle, every 8 hours) and @ Desk (' + desk.items.length + ' one-offs); '
    + (pr ? pr.options.length : 0) + ' private Prayer option(s); ' + gone.length + ' removed or merged (in the backup row)';
}

/* NO IDEAS LIST (owner, 23 Nov): if an "Ideas & notes" list was made, its items go to the end of "@ Desk" and the empty list goes. */
function docketIdeasToDeskRun_() {
  const t = read(TAB.people), me = t.rows.find(r => isOwner_(r));
  if (!me) throw new Error('no owner found');
  let got = null; try { got = JSON.parse(S(me.todo)); } catch (e) { got = null; }
  if (!got || !Array.isArray(got.lists)) return 'no docket';
  const i = got.lists.findIndex(L => S(L.name) === 'Ideas & notes');
  if (i < 0) return 'no Ideas & notes list - nothing to move';
  let desk = got.lists.find(L => S(L.name).toLowerCase() === '@ desk');
  if (!desk) { desk = { name: '@ Desk', items: [] }; got.lists.push(desk); }
  const moved = got.lists[i].items || [];
  moved.forEach(x => desk.items.push(x));
  got.lists.splice(got.lists.indexOf(got.lists[i]), 1);
  if (!setCell(t, me, 'todo', JSON.stringify(got))) throw new Error('the people tab has no todo column - nothing was saved');
  return moved.length + ' item(s) moved to @ Desk';
}

/* DOCKET INBOX (owner, 25 Nov): a private Ledger tab `docket_inbox` (title, note, list, replaces) that Claude or the owner drops items into. On every admin
   page load (setupOnAdminLoad_), if it has rows: the owner's cell is backed up (backup_docket_inbox: time, old cell, titles), each row becomes a
   one-off {title, note?} at the end of its list (blank: "@ Desk"; a missing list is made), a title already in that list (any case) is skipped, the
   size cap is kept and the cell read back, then the rows read are deleted (the header stays). No tab or no rows: nothing happens. No item text
   is ever in the repo. A `replaces` column (" | "-separated titles, any case) removes those items from that list, the new one taking the first one's place (named in the backup row). tools/docket-inbox.js checks it. */
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
  const added = [], skipped = [], removed = [];
  rows.forEach(r => {
    const title = cell(r, 'title'), note = cell(r, 'note'), name = cell(r, 'list') || '@ Desk';
    if (!title) return;
    let L = got.lists.find(x => S(x.name).trim().toLowerCase() === name.toLowerCase());
    if (!L) { L = { name, items: [] }; got.lists.push(L); }
    L.items = (L.items || []).filter(Boolean);
    const rep = cell(r, 'replaces').split('|').map(x => x.trim().toLowerCase()).filter(x => x && x !== title.toLowerCase());
    let at = -1, kept = 0;
    L.items = L.items.filter(it => {
      if (rep.indexOf(S(it.title).trim().toLowerCase()) < 0) { kept++; return true; }
      if (at < 0) at = kept;
      removed.push([L, S(it.title)]); return false;
    });
    if (L.items.some(it => S(it.title).trim().toLowerCase() === title.toLowerCase())) { skipped.push(title); return; }
    L.items.splice(at < 0 ? L.items.length : at, 0, note ? { title, note } : { title });
    added.push(title);
  });
  if (added.length || removed.length) {
    const titles = 'added (' + added.length + '): ' + added.join(' | ') + (skipped.length ? '; skipped (' + skipped.length + '): ' + skipped.join(' | ') : '')
      + (removed.length ? '; replaced (' + removed.length + '): ' + removed.map(x => S(x[0].name) + ': ' + x[1]).join(' | ') : '');
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
    what: "the owner's docket tidied (backup tab first): past one-offs to Overdue, ideas to @ Desk, foods joined, one Shopping a list, evening prep, a takeaway covering meat and rice, two car checks",
    run: () => docketTidy23NovRun_() },
  { id: 'docket-ideas-to-desk-23nov',
    retry: true,
    what: "no Ideas & notes list: any items in one moved to the end of @ Desk (owner, 23 Nov)",
    run: () => docketIdeasToDeskRun_() },
  { id: 'docket-slots-23nov',
    retry: true,
    what: "the owner's food items made food slots: the morning's as Protein, Fruit (3), Dairy, Grain and Pack for later, the evening's Meat and Carbs, a Snack slot at midday (backup tab first); no text lost",
    run: () => docketSlots23NovRun_() },
  { id: 'docket-meals-24nov',
    retry: true,
    what: "the same food slots at every meal: the morning, midday and evening lists each hold Protein, Carbs, Dairy, Veg and Fruit (Grain merged into Carbs, Meat into Protein; backup tab first); no text lost",
    run: () => docketMeals24NovRun_() },
  { id: 'docket-meal-cycle-25nov',
    retry: true,
    what: "the docket in two lists: Every 8 hours (the 21-item cycle, each ticked once a third of the day; Prayer and Exercise slots, Prayer's options kept private in the docket cell) and @ Desk (every one-off); every other list and repeating item removed (backup tab first, every removed title in it)",
    run: () => docketMealCycle25NovRun_() },
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
