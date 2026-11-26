/* @family. — 50_setup.gs (6 of 8) BRINGING THE SHEET UP TO DATE, AND SAYING WHAT IS WRONG WITH IT. § */


/* ---------- THE CODE'S OWN OPTION VALUES, ADDED WHERE MISSING — AND NOTHING ELSE TOUCHED § */
function seedOptions() {
  const t = read(TAB.options);
  if (!t.sheet) return [];
  const have = {}, top = {};
  t.rows.forEach(r => {
    const l = S(r.list_name);
    if (!l) return;
    have[l + '\u0001' + norm(r.value)] = true;
    const n = Number(r.sort_order);
    if (isFinite(n) && n > (top[l] || 0)) top[l] = n;
  });
  const added = [];
  Object.keys(OPTION_DEFAULTS).forEach(l => {
    OPTION_DEFAULTS[l].forEach(v => {
      if (have[l + '\u0001' + norm(v)]) return;
      top[l] = (top[l] || 0) + 1;
      if (addRow(t, { list_name: l, value: v, sort_order: top[l] })) {
        have[l + '\u0001' + norm(v)] = true;
        added.push(l + ': ' + v);
      }
    });
  });
  if (added.length) clearCache();
  return added;
}

/** Put the wearables into the shop, once. Also labels existing rows as physical stock, since
    they predate the `kind` column and would otherwise be read as wearables with no art. */
function seedAvatarItems_() {
  const t = read(TAB.shop);
  if (!t.sheet) return 0;
  if (t.rows.some(r => norm(r.kind) === 'avatar')) return 0;   // already there
  // Existing rows have no `kind`; they're physical stock, so say so before adding anything.
  t.rows.forEach(r => { if (!S(r.kind)) setCell(t, r, 'kind', 'thing'); });
  /* ---------- THREE OF THESE COLUMNS DO NOT EXIST, AND ONE OF THEM WAS THE PRICE § */
  AVATAR_ITEMS.filter(it => !it.free).forEach(it => addRow(t, {
    item_id: 'AV-' + it.slot + '-' + it.id, kind: 'avatar', name: it.name,
    price_coins: it.cost || '', acquire: it.cost ? 'buy' : 'level',
    level_required: it.level || '',
    slot: it.slot, art_id: it.id, active: 'TRUE',
    description: it.cost ? 'Yours to keep once bought.' : 'Earned by levelling up.'
  }));
  clearCache();
  return AVATAR_ITEMS.filter(it => !it.free).length;
}

/* ---------- THE WEARABLES HAVE BEEN FREE SINCE THE TWO TABS WERE MERGED § */
function repairShopPrices() {
  const t = read(TAB.shop);
  if (!t.sheet) return { error: 'no shop tab' };
  const want = {};
  AVATAR_ITEMS.forEach(it => { want[norm(it.slot) + ':' + norm(it.id)] = it; });

  const out = { priced: 0, levelled: 0, unknown: [], leftAlone: 0 };
  t.rows.forEach(r => {
    if (norm(r.kind) !== 'avatar') return;          // physical stock is the owner's to price
    const it = want[norm(r.slot) + ':' + norm(r.art_id)];
    if (!it) { out.unknown.push(S(r.name) || S(r.item_id)); return; }
    /* ALREADY SAID SOMETHING? § */
    let did = false;
    if (!S(r.acquire)) {
      setCell(t, r, 'acquire', it.free ? 'issued' : (it.cost ? 'buy' : 'level'));
      did = true;
    }
    if (it.cost && !S(r.price_coins)) { setCell(t, r, 'price_coins', it.cost); did = true; }
    if (it.level && !S(r.level_required)) { setCell(t, r, 'level_required', it.level); did = true; }
    if (!did) { out.leftAlone++; return; }
    if (it.cost) out.priced++; else out.levelled++;
  });
  clearCache();
  return out;
}

/* EVERY PERSON HAS A HANDLE, AND THE ONES THAT CANNOT BE GENERATED ARE REPORTED RATHER THAN INVENTED. § */
function fillHandles() {
  const t = read(TAB.people);
  if (!t.sheet) return errOf_('err-no-people-tab', 'no-tab');
  for (const col of ['handle']) {
    /* NAMED, NOT SKIPPED. `setCell` writes to a header that is not there and loses the value with no error anywhere — the fault every `noColumn` refusal in this § */
    if (t.headers.indexOf(col) === -1) {
      return { error: 'the people tab has no ' + col + ' column. Open the site once as an admin first '
                    + '— nothing was changed.' };
    }
  }
  const seen = handleFirstSeen_(t.rows);
  const out = { filled: 0, leftAlone: 0, couldNotGenerate: [],
                noEmail: [], noFirstName: [], noLastName: [] };
  t.rows.forEach(r => {
    const who = S(r.person_id) || '(a row with no id)';
    if (!S(r.email))      out.noEmail.push(who);
    if (!S(r.first_name)) out.noFirstName.push(who);
    if (!S(r.last_name))  out.noLastName.push(who);

    if (S(r.handle)) { out.leftAlone++; return; }
    /* `r` IS PASSED, so this row's own cells are not counted as a clash — which matters for
       `first + last`, which `handleTrouble_` also compares against. */
    const made = handleMake_(r, seen);
    if (!made) { out.couldNotGenerate.push(who); return; }
    setCell(t, r, 'handle', made);
    out.filled++;
  });
  clearCache();
  /* THE COUNTS, NOT JUST THE LISTS, because a reader scanning a JSON reply reads a number and skims
     an array — and `noEmail: []` and a missing key look alike at a glance. */
  out.missingEmail = out.noEmail.length;
  out.missingFirstName = out.noFirstName.length;
  out.missingLastName = out.noLastName.length;
  out.means = 'handle filled where blank; nothing overwritten. An email or a name is '
            + 'never invented — the ids above are the rows somebody has to type one into.';
  return out;
}

/* EVERY HANDLE INTO THE TEMPLATE (367) — the `handles-initial-year` migration, and `?run=renameHandles`. Earliest joiner first, then person id, so a clash always goes the same way; a handle already in the shape stays. */
function renameHandles_() {
  const t = read(TAB.people);
  if (!t.sheet) return errOf_('err-no-people-tab', 'no-tab');
  /* ALL THREE BEFORE ANYTHING — a handle moved with nowhere to put the old one is somebody whose slip no longer signs them in. */
  const lacking = handleColsLacking_(t);
  if (lacking.length) {
    return { error: 'the people tab has no ' + lacking.join(', ') + ' column. Run ?setup=1 first '
                  + '— nothing was changed.' };
  }
  const out = { renamed: 0, leftAlone: 0, longer: 0, yearFrom: { joined_on: 0, activity: 0, now: 0 }, couldNotGenerate: [] };
  const moves = {};
  /* THE DATES BEFORE ANY WRITE, so a handle_changed_at written below never moves somebody's join year. */
  const seen = handleFirstSeen_(t.rows);
  const when = r => handleJoined_(r, seen).when.getTime();
  const order = t.rows.slice().sort((a, b) => (when(a) - when(b))
    || (S(a.person_id) < S(b.person_id) ? -1 : S(a.person_id) > S(b.person_id) ? 1 : a._row - b._row));
  try {
    order.forEach(r => {
      const has = S(r.handle);
      if (has && handleInShape_(has, r)) { out.leftAlone++; return; }
      out.yearFrom[handleJoined_(r, seen).from]++;
      const made = handleTemplate_(r, want => handleTrouble_(want, r), seen);
      if (!made) { out.couldNotGenerate.push(S(r.person_id) || '(a row with no id)'); return; }
      if (made !== handleCandidates_(r, seen)[0]) out.longer++;
      if (key(made) === key(has)) { out.leftAlone++; return; }
      /* THE HISTORY FIRST, IN ITS OWN WRITE, and the face the old handle drew when nobody chose a look. */
      if (has) setCells(t, r, Object.assign({ handle_was: handleWasWith_(r.handle_was, has) }, handleFaceKept_(t, r, has)));
      setCells(t, r, { handle: made, handle_changed_at: new Date() });
      if (has) moves[key(has)] = made;
      out.renamed++;
    });
  } finally {
    clearCache();
  }
  out.means = out.renamed + ' handle(s) moved to the template (first two and last two letters of the first name, even overlapping, and the year joined; a clash '
            + 'adds a counter). Each old handle is at the front of handle_was and '
            + 'still signs in.';
  return out;
}

/* ---------- EVERYBODY ONTO THE USERNAME LAW, ONCE (owner, 15 Nov): an admin's card, never a migration. */
/* `dryRun` only returns the list; Apply passes the preview's `seed` so it writes that same list. Old handles are NOT kept as aliases: */
/* they stop working, and the owner tells people. The list goes back to the admin alone — never logged, never written anywhere else. */
function renameAllPlan_(rows, seed) {
  const seen = handleFirstSeen_(rows);
  const when = r => handleJoined_(r, seen).when.getTime();
  const order = rows.slice().sort((a, b) => (when(a) - when(b))
    || (S(a.person_id) < S(b.person_id) ? -1 : S(a.person_id) > S(b.person_id) ? 1 : a._row - b._row));
  const was = {}, planned = {};
  rows.forEach(r => S(r.handle_was).split(',').forEach(w => { if (key(w)) was[key(w)] = 1; }));
  const pick = handleSeeded_(seed);
  return order.map(r => {
    const to = handleLaw_(r, h => !!planned[key(h)] || !!was[key(h)] || !!handleTrouble_(h, r, true), seen, pick);
    if (to) planned[key(to)] = 1;
    return { row: r, personId: S(r.person_id), name: (S(r.first_name) + ' ' + S(r.last_name)).trim(), from: S(r.handle), to: to };
  });
}
function postRenameAllUsernames_(body, action, began) {
  const t = read(TAB.people);
  if (!t.sheet) return refuse_('err-no-people-tab', 'no-tab');
  const lacking = handleColsLacking_(t);
  if (lacking.length) return jsonOut({ error: 'the people tab has no ' + lacking.join(', ') + ' column. Run ?setup=1 first — nothing was changed.' });
  const dry = body.dryRun !== false;
  const seed = dry ? (Math.floor(Math.random() * 2147483646) + 1) : Number(body.seed);
  if (!dry && !(seed > 0)) return jsonOut({ error: 'Preview the list first — Apply writes the list the preview showed. Nothing was changed.' });
  const plan = renameAllPlan_(t.rows, seed);
  const list = plan.map(p => ({ personId: p.personId, name: p.name, from: p.from, to: p.to }));
  if (dry) return jsonOut({ success: true, dryRun: true, seed: seed, list: list });
  let renamed = 0;
  try {
    plan.forEach(p => {
      if (!p.to || p.to === p.from) return;
      setCells(t, p.row, { handle: p.to, handle_changed_at: new Date() });
      renamed++;
    });
  } finally {
    clearCache();
  }
  return jsonOut({ success: true, dryRun: false, seed: seed, renamed: renamed, list: list });
}

/** Add any config key that's missing. Never overwrites a value you've set. */
function seedConfig_() {
  const t = read(TAB.config);
  if (!t.sheet) return {};
  const have = {};
  t.rows.forEach(r => { if (S(r.key)) have[norm(r.key)] = true; });
  const added = [];
  CONFIG_DEFAULTS.forEach(([k, v, note]) => {
    if (have[norm(k)]) return;
    addRow(t, { key: k, value: v, what_it_does: note });
    added.push(k);
  });
  /* A ROW STILL EXACTLY AS AN OLD SEED WROTE IT -- value and note both -- is a row nobody set, and is given
     today's default and note (`CONFIG_RESEEDED` in constants.gs). Either cell changed and it is left. */
  CONFIG_RESEEDED.forEach(([k, was, wasNote]) => {
    const now = CONFIG_DEFAULTS.filter(d => norm(d[0]) === norm(k))[0];
    if (!now) return;
    t.rows.forEach(r => {
      if (norm(r.key) !== norm(k) || S(r.value) !== was || S(r.what_it_does) !== wasNote) return;
      setCells(t, r, { value: now[1], what_it_does: now[2] });
      added.push(k + ' (was the old seed ' + was + ', now ' + now[1] + ')');
    });
  });
  return added;
}

function renameValue_(arg) {
  const bits = String(arg || '').split('>');
  if (bits.length !== 2 || !bits[0].trim() || !bits[1].trim()) {
    return { error: 'Give it old>new, for example: English Lang.>English Language' };
  }
  const from = bits[0].trim(), to = bits[1].trim();
  /* `key`, not `norm`. `norm` lowercases and trims; it does not touch punctuation, so "English Lang." § */
  const want = key(from);

  const changed = [];
  RENAMEABLE.forEach(pair => {
    const tabName = TAB[pair[0]] || pair[0];
    const t = read(tabName);
    if (!t.sheet) return;

    pair[1].forEach(col => {
      if (t.headers.indexOf(col) < 0) return;      // a tab that does not have that column
      let n = 0;
      t.rows.forEach(r => {
        const v = S(r[col]);
        if (!v) return;
        /* A cell may hold SEVERAL, comma-separated — a tutor teaching three subjects, a job
           covering two. Each is matched and replaced on its own, and the rest are left exactly as
           they were spelt. */
        const parts = v.split(',').map(x => x.trim());
        if (!parts.some(x => key(x) === want)) return;
        const next = parts.map(x => (key(x) === want ? to : x)).join(', ');
        if (next !== v) { setCell(t, r, col, next); n++; }
      });
      if (n) changed.push(pair[0] + '.' + col + ' — ' + n + ' row(s)');
    });
  });

  /* ---------- AND THEN THE DUPLICATES IT JUST MADE § */
  const merged = [];
  [['options', ['list_name', 'value']], ['pricing', ['kind', 'label']]].forEach(pair => {
    const t = read(TAB[pair[0]] || pair[0]);
    if (!t.sheet) return;
    if (pair[1].some(c => t.headers.indexOf(c) < 0)) return;

    const seen = {};
    const kill = [];
    t.rows.forEach(r => {
      const id = pair[1].map(c => key(r[c])).join('|');
      if (!id.replace(/\|/g, '')) return;               // a blank row is not a duplicate
      if (seen[id]) kill.push(r); else seen[id] = true;
    });

    /* FROM THE BOTTOM UP. Deleting row 4 makes what was row 5 into row 4, so working downwards
       deletes the wrong rows from the second one onwards — and silently, because every delete
       still succeeds. */
    kill.sort((a, b) => b._row - a._row).forEach(r => delRow(t, r));
    if (kill.length) merged.push(pair[0] + ' — ' + kill.length + ' duplicate row(s) removed');
  });

  clearCache();
  const out = { from: from, to: to, changed: changed, merged: merged,
                note: changed.length
                  ? (merged.length ? 'Renamed and merged. Reload the site to see it.'
                                   : 'Reload the site to see it.')
                  : 'Nothing held that value — check the spelling.' };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/* MAKE THE @family. ADMIN ACCOUNT. § */
/* ---------- HOW LONG THE FIRST REQUEST AFTER A DEPLOY MAY TAKE § */

function makeBrandAccount(pin) {
  const name = brandName();                    // whatever the brand tab says, or "@family."
  /* THE ONE RULE EVERY OTHER DOOR ASKS (`pinWeak_`), on the account that reaches every control on
     the site — a brand row on four repeated digits was the one PIN the app refused everywhere else. */
  if (pin && pinWeak_(pin)) throw new Error('That PIN is too easy to guess. Choose another — nothing was changed.');
  const t = read(TAB.people);

  const existing = findPerson(name);
  if (existing) {
    /* Already there. Rather than refusing, make sure it actually WORKS — a row that exists with
       the wrong role or no PIN is the failure this function is for, and it looks identical to a
       row that is fine. */
    const fixed = [];
    if (!whoMay_(existing, 'admin')) {
      setCell(t, existing, 'role', S(existing.role) ? S(existing.role) + ', admin' : 'admin');
      fixed.push('role');
    }
    /* ---------- THROUGH `authSetPin_`, AND THIS LINE IS WHY THE OWNER COULD NOT SIGN IN § */
    if (pin && /^\d{4}$/.test(String(pin))) {
      authSetPin_(t, existing, String(pin));
      authClearThrottle_(t, existing);
      fixed.push('pin');
    }
    if (norm(existing.verified) === 'pending') { setCell(t, existing, 'verified', 'TRUE'); fixed.push('verified'); }
    if (S(existing.listed) === '') { setCell(t, existing, 'listed', 'FALSE'); fixed.push('listed'); }
    clearCache();
    const out = { alreadyExisted: true, name: personDisplayName(existing),
                  personId: S(existing.person_id), fixed: fixed };
    Logger.log(JSON.stringify(out, null, 2));
    return out;
  }

  if (!/^\d{4}$/.test(String(pin || ''))) {
    throw new Error('Give it a PIN of 4 digits: makeBrandAccount(\'4821\')');
  }

  /* ---------- NO E-MAIL ON THE BRAND ROW, WHICH IT USED TO BORROW FROM WHOEVER THE ADMIN WAS § */
  const email = '';

  const row = addRow(t, {
    person_id: 'P' + Date.now(),
    role: 'admin',
    first_name: name, last_name: '', handle: name,
    /* NO `pin` HERE. It used to be `pin: String(pin)` — the brand account's PIN sitting in a spreadsheet cell in plain sight, which is the whole thing `authSetPin_` § */
    email: email,
    /* Blank, not PENDING. An account waiting on a confirmation link nobody is going to send
       cannot log in, and the error it gives says nothing about why. */
    verified: '',
    listed: 'FALSE',
    joined_on: new Date(),
    came_from: 'the business itself',
  });
  /* AFTER `addRow`, BECAUSE `authSetPin_` WRITES THROUGH `setCell` and that needs a row on the sheet. § */
  if (row) authSetPin_(t, row, String(pin));
  /* Nothing to clear on a row `addRow` made a moment ago — and it is written anyway, because the note above claims both paths end in the same state and an § */
  if (row) authClearThrottle_(t, row);
  clearCache();

  const out = { created: true, name: name, personId: row ? S(row.person_id) : '',
                email: '(none — add an address of its own, not one already on another account)',
                loginWith: 'the e-mail address you put on this row, and its PIN' };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/* ---------- FOUR PAPER JOBS WERE HERE, AND CLAUDE.md ALREADY SAID NOT TO RUN THEM § */

/* WHEN EASTER IS, and it is the only date on this tab that needs arithmetic rather than a rule. § */
function easterOf_(y) { return tdEaster_(y); }

/** The nth given weekday of a month — "the first Monday in May". 0 is Monday, 6 is Sunday. */
function nthDow_(y, month, dow, n) {
  const d = new Date(y, month - 1, 1);
  const shift = (dow - ((d.getDay() + 6) % 7) + 7) % 7;
  d.setDate(1 + shift + 7 * (n - 1));
  return d;
}

/* And the last one — "the last Monday in August". § */
function lastDow_(y, month, dow) {
  /* `month` is the human one — 5 is May — and Date counts from zero, so May is index 4 and the last day of it is day 0 of index 5. § */
  const d = new Date(y, month, 0);                       // last day of `month`
  while (((d.getDay() + 6) % 7) !== dow) d.setDate(d.getDate() - 1);
  return d;
}

/* THE HOLIDAYS OF ONE YEAR, WRITTEN INTO THE TAB. § */
function seedHolidays(arg) {
  const t = read(TAB.holidays);
  if (!t.sheet) return { error: 'no holidays tab — open the site once as an admin first' };

  const year = Number(S(arg)) || new Date().getFullYear();
  const E = easterOf_(year);
  const off = n => { const d = new Date(E); d.setDate(d.getDate() + n); return d; };

  /* name, date, kind, how many days ahead its waitlist opens */
  const ROWS = [
    ["New Year's Day",         new Date(year, 0, 1),   'bank',      21],
    ["Valentine's Day",        new Date(year, 1, 14),  'observance', 21],
    ["Pancake Day",            off(-47),               'observance', 10],
    ["Mother's Day",           off(-21),               'observance', 21],
    ["Good Friday",            off(-2),                'bank',       28],
    ["Easter Sunday",          off(0),                 'observance', 28],
    ["Easter Monday",          off(1),                 'bank',       28],
    ["St George's Day",        new Date(year, 3, 23),  'observance', 14],
    ["Early May bank holiday", nthDow_(year, 5, 0, 1), 'bank',       21],
    ["Spring bank holiday",    lastDow_(year, 5, 0),   'bank',       21],
    ["Father's Day",           nthDow_(year, 6, 6, 3), 'observance', 21],
    ["Summer bank holiday",    lastDow_(year, 8, 0),   'bank',       28],
    ["Halloween",              new Date(year, 9, 31),  'observance', 21],
    ["Bonfire Night",          new Date(year, 10, 5),  'observance', 21],
    ["Remembrance Sunday",     nthDow_(year, 11, 6, 2),'observance', 14],
    ["Christmas Day",          new Date(year, 11, 25), 'bank',       42],
    ["Boxing Day",             new Date(year, 11, 26), 'bank',       42],
    ["New Year's Eve",         new Date(year, 11, 31), 'observance', 28],
  ];

  const have = {};
  t.rows.forEach(r => { have[key(S(r.name)) + '|' + S(r.year)] = true; });

  const added = [], already = [];
  ROWS.forEach((r, i) => {
    const k = key(r[0]) + '|' + year;
    if (have[k]) { already.push(r[0]); return; }
    addRow(t, {
      holiday_id: 'H' + year + '-' + String(i + 1).padStart(2, '0'),
      name: r[0], date: r[1], year: year, kind: r[2],
      opens_days: r[3],
      /* OFF BY DEFAULT, and that is deliberate. § */
      active: 'FALSE',
      notes: '',
    });
    have[k] = true;
    added.push(r[0]);
  });

  clearCache();
  const out = { year: year, added: added, alreadyThere: already, ofTotal: ROWS.length };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

function ensureSchema_() {
  const report = {};
  Object.keys(SCHEMA).forEach(name => {
    /* A MOVED TAB (kinds.json ledger.moved) IS NOT MADE OR WIDENED: its columns are its marker row's, given SCHEMA's here. */
    if (storeMoved_(name)) { report[name] = storeSchema_(name, SCHEMA[name]); return; }
    /* THE SAME LOOKUP `read` USES. § */
    const at = sheetFor_(name);
    /* TWO DIFFERENT FAULTS, AND THEY NEED DIFFERENT WORDS. § */
    if (!at.id) {
      report[name] = at.away === '(not in WHERE)'
        ? 'SKIPPED — no line in WHERE, so nothing can reach this tab'
        : 'skipped — the id for the ' + at.away + ' file is blank';
      return;
    }
    /* ---------- A FILE THAT WILL NOT OPEN IS ONE TAB'S PROBLEM, NOT EVERY TAB'S § */
    let ss = null;
    try { ss = SpreadsheetApp.openById(at.id); } catch (err) { ss = null; }
    if (!ss) {
      report[name] = 'SKIPPED — the ' + at.away + ' file would not open (deleted, or no access)';
      return;
    }
    /* ---------- `at.tab` HAS NEVER EXISTED § */
    let sh = null;
    for (let i = 0; i < at.names.length && !sh; i++) sh = ss.getSheetByName(at.names[i]);
    if (!sh) {
      sh = ss.insertSheet(at.make);
      sh.appendRow(SCHEMA[name]);
      sh.setFrozenRows(1);
      report[name] = 'tab created' + (at.away ? ' in ' + at.away : '');
      return;
    }
    const lastCol = Math.max(1, sh.getLastColumn());
    const have = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
    const missing = SCHEMA[name].filter(h => have.indexOf(h) === -1);
    if (missing.length) {
      // Appended at the end, never inserted — inserting would shift every cell to its right and
      // silently move your data under the wrong headers.
      /* ---------- A TAB IS AS WIDE AS ITS GRID, AND THE GRID IS NOT AS WIDE AS SCHEMA § */
      const need = have.length + missing.length;
      if (sh.getMaxColumns() < need) sh.insertColumnsAfter(sh.getMaxColumns(), need - sh.getMaxColumns());
      sh.getRange(1, have.length + 1, 1, missing.length).setValues([missing]);
      report[name] = 'added ' + missing.length + ' column(s): ' + missing.join(', ');
    } else {
      report[name] = 'up to date';
    }
  });
  clearCache();
  const seeded = seedConfig_();
  if (seeded.length) report.config = (report.config || 'up to date') + ' | seeded: ' + seeded.join(', ');
  const idsAdded = ensurePersonIds_();
  if (idsAdded) report.people = (report.people || 'up to date') + ' | gave ' + idsAdded + ' rows an id';
  /* ---------- AND A HANDLE, WHICH A ROW TYPED INTO THE SHEET HAS NOT GOT § */
  try {
    const handles = fillHandles();
    if (handles && handles.filled) {
      report.people = (report.people || 'up to date') + ' | gave ' + handles.filled + ' rows a handle';
    }
  } catch (err) { report.people = (report.people || 'up to date') + ' | handles not filled: ' + err; }
  const seededItems = seedAvatarItems_();
  if (seededItems) report.shop = (report.shop || 'up to date') + ' | seeded ' + seededItems + ' wearables';
  const lists = seedOptions();
  if (lists.length) report.options = (report.options || 'up to date') + ' | added: ' + lists.join(', ');
  clearCache();
  Logger.log(JSON.stringify(report));
  return report;
}

/* ---------- WHAT IS WRONG WITH THE DATA § */
/* `deep` — whether to run the checks that COST SOMETHING: § */
function dataProblems(deep) {
  const out = [];
  const add = (level, what, fix) => out.push({ level, what, fix });
  [dpTermRows_, dpTutors_, dpVenueHours_, dpShares_].forEach(part => part(add));

  /* ---------- THE LAW-COLOUR CHECK WENT WITH THE TAB § */

  /* Columns something has actually tried to write to during THIS request and could not find. § */
  WRITE_MISSES.forEach(x => {
    add('a value went nowhere', 'Something wrote to ' + x.tab + '.' + x.field + ', which is not '
        + 'a column',
        'Open the site once as an admin. Until then anything saved to that field is discarded.');
  });

  /* THE JOBS THAT RUN THEMSELVES, AND WHETHER THEY DID. § */
  dpJobs_(add, deep);
  /* CAN THE DEPLOYMENT WRITE TO DRIVE? § */
  dpDrive_(add, deep);
  /* VENUES WITH NO COORDINATES. § */
  dpVenues_(add, deep);
  /* THE ADMIN ACCOUNT ITSELF. § */
  dpAdmin_(add, deep);
  /* `brand!logo_square` IS CHECKED ON THE PHONE OR NOWHERE. § */
  if (!S(logoRow && logoRow.value)) {
    add('looks unfinished', 'brand!logo_square is empty',
        'Every @family. post shows a letter in a circle instead of the mark.');
  }

  /* MONEY OWED BACK. A client who paid and then withdrew is kept on the roster marked `Withdrawn` precisely so this can find them — the seat is gone and the § */
  dpRefunds_(add, deep);
  /* ---------- THE TERM DATES, CHECKED AGAINST EACH OTHER § */
  dpTerms_(add, deep);
  /* --- Stripe --- */
  if (!PropertiesService.getScriptProperties().getProperty('STRIPE_TEST_KEY')) {
    add('no money can move', 'Stripe key is not set',
        'Add STRIPE_TEST_KEY in Project Settings → Script Properties.');
  }

  return out;
}

/* The parts of dataProblems: each adds what it finds via `add`. --- terms: the ones that stop a booking existing at all --- */
function dpTermRows_(add) {
  const terms = read(TAB.terms).rows.filter(r => S(r.term_name));
  terms.forEach(r => {
    const s = sheetDate(r.start_date), e = sheetDate(r.end_date);
    if (!s || !e) {
      add('stops bookings', S(r.term_name) + ' has no dates',
          'Add a start and an end in the terms tab.');
    } else if (s > e) {
      add('stops bookings', S(r.term_name) + ' ends before it starts ('
          + fmtDate(s) + ' → ' + fmtDate(e) + ')',
          'One of those two dates is a typo.');
    }
  });
  // Two rows for one term is two entries in the dropdown that look identical.
  const seen = {};
  terms.forEach(r => {
    const k = key(r.term_name);
    if (seen[k]) add('confusing', 'Two rows are both called ' + S(r.term_name),
                     'Delete one — clients see both and cannot tell them apart.');
    seen[k] = true;
  });
}
/* --- tutors: a tutor nobody can book is a tutor who earns nothing --- */
function dpTutors_(add) {
  read(TAB.people).rows.forEach(r => {
    if (!personDisplayName(r)) return;
    const role = mainRole(r);
    if (role === 'tutor' || role === 'admin') {
      // Availability is ONE cell, not a column per hour — `availSet` unpacks it.
      if (!Object.keys(availSet(r.availability)).length) {
        add('stops bookings', personDisplayName(r) + ' has no available hours',
            'Nothing can be booked with them until some are ticked.');
      }
      if (!N(r.rate_per_hour)) {
        add('stops bookings', personDisplayName(r) + ' has no hourly rate',
            'Their bookings will price at the open rate.');
      }
      /* THEIR OWN CUT OF AN EXTRA SEAT (docs/history/345), typed into the sheet by hand where the card's refusal cannot reach. § */
      const cut = S(r.extra_seat_cut);
      if (cut !== '') {
        add('pricing looks wrong', personDisplayName(r) + "'s extra_seat_cut is " + cut,
            'It is ignored since 8 Nov: config B is the one @family. share for every tutor. Clear the cell.');
      }
    }
    /* Email is how everybody finds out anything. Without one, every notification this system
       sends to that person is thrown away silently. */
    if (!S(r.email)) {
      add('nobody is told', personDisplayName(r) + ' (' + role + ') has no email address',
          'Every message the site sends them is discarded.');
    }
  });
}
/* --- venues --- */
function dpVenueHours_(add) {
  read(TAB.venues).rows.forEach(r => {
    if (!S(r.name)) return;
    if (!Object.keys(availSet(r.availability)).length) {
      add('stops bookings', S(r.name) + ' has no open hours',
          'It will never appear as bookable.');
    }
  });
}
/* --- the numbers that decide what you earn --- */
function dpShares_(add) {
  const cfg = config();
  const c = N(cfg.c), B = N(cfg.B);
  if (c + B > 1) {
    add('pricing looks wrong', 'Each extra seat adds ' + Math.round((c + B) * 100) + '%'
        + ' (c ' + c + ' + B ' + B + ')',
        'These are FRACTIONS of the rate — 0.25 means +25%. A value above 1 is usually a pound '
        + 'figure left over from an older formula.');
  }
  /* B IS THE ONE @FAMILY SHARE (8 Nov), a fraction of each tutor's extra-seat rate: a nought here is nothing earned on any extra seat. */
  if (!B) {
    add('you earn nothing', 'B is 0 — you take no share of any extra seat',
        'Every hour such a tutor teaches earns you £0. That is a directory, not an agency.');
  }
}

function dpJobs_(add, deep) {
  const seen = PropertiesService.getScriptProperties().getProperties() || {};
  if (seen.SCHEMA_VERSION !== BACKEND_VERSION) {
    /* WHICH COLUMNS, by name. "The schema has not been brought up to date" is true and gives
       nobody anything to do; a list of the columns that are not there is the whole answer. */
    /* WHICH COLUMNS — BUT NOT ON A PAGE LOAD. § */
    const which = deep ? (function () {
      try {
        const gaps = schemaGaps();
        return Object.keys(gaps).map(t => t + ': ' + gaps[t].join(', ')).join(' · ');
      } catch (err) { return 'could not check: ' + err; }
    })() : '';
    add('the sheet is behind the code',
        which || ('The schema has not been brought up to date for ' + BACKEND_VERSION),
        'It runs by itself the next time an admin opens the site after Deploy \u2192 New version. If this stays, '
        + 'the Setup card on the You screen says what failed.');
  }
  MIGRATIONS.forEach(m => {
    if (seen['MIGRATED_' + m.id]) return;
    add('a one-off job has not run', m.id + ' — ' + m.what,
        'It runs by itself the next time an admin opens the site. If it keeps saying this, that attempt '
        + 'failed — the Setup card on the You screen shows the error, and it retries on the next page load.');
  });
}
function dpDrive_(add, deep) {
  /* ---------- THIS USED TO RUN ON EVERY ADMIN PAGE LOAD § */
  const folder = deep ? getPostFolder() : null;
  if (deep && !folder) {
    add('no posts can be made', 'There is no posts folder',
        'Add `posts_folder` to the config tab with the id from the folder URL.');
  } else if (deep) {
    try {
      const probe = folder.createFile('family-permission-check.txt', 'safe to delete');
      probe.setTrashed(true);
    } catch (err) {
      /* Not "no posts can be made" — the scan still works, and posting by dropping files into the folder is a complete route. § */
      add('one way of posting is unavailable',
          'This deployment can read the posts folder but not write to it',
          'Posting still works: put photographs in the folder and press ⟳ on the Posts screen. '
          + 'To upload from inside the app, appsscript.json must list .../auth/drive; then run '
          + 'authoriseDrive from the editor and accept the prompt, ticking every box; only when '
          + 'its last line says READY, deploy a NEW VERSION — '
          + 'a deployed version pins its manifest, so authorising alone changes nothing.');
    }
  }
}
function dpVenues_(add, deep) {
  const vs = read(TAB.venues).rows.filter(r => S(r.name)
    && !/^online$/i.test(S(r.name)) && N(r.cost_per_hour) >= 0);
  const noPost = vs.filter(r => !S(r.postcode)).map(r => S(r.name));
  const notPlaced = vs.filter(r => S(r.postcode) && !(N(r.lat) && N(r.lng))).map(r => S(r.name));
  if (noPost.length) {
    add('venues with no postcode', noPost.length + ' of ' + vs.length + ': ' + noPost.join(', '),
        'They sit at the edge of the map. Put a postcode in the venues tab and the coordinates '
        + 'fill themselves in.');
  }
  if (notPlaced.length) {
    add('venues not placed on the map',
        notPlaced.length + ' have a postcode and no coordinates: ' + notPlaced.join(', '),
        'The geocoder has not managed to run. It needs the external_request scope, which Apps '
        + 'Script infers from UrlFetchApp — run any function once from the editor, accept the '
        + 'prompt, and deploy a new version. It retries on every request until it works.');
  }
}
function dpAdmin_(add, deep) {
  const brand = findPerson(ADMIN_NAME);
  if (!brand) {
    add('nobody can sign in as it', 'There is no account called ' + ADMIN_NAME,
        'Run makeBrandAccount(\'0000\') from the editor with a PIN of your own choosing. '
        + 'Do it BEFORE removing admin from anybody else, or nobody can reach the controls.');
  /* `hasPin_`, NOT `S(brand.pin)`. § */
  } else if (!hasPin_(brand)) {
    add('nobody can sign in as it', ADMIN_NAME + ' has no PIN',
        'Run makeBrandAccount with one. The row exists and cannot be logged into.');
  } else if (!whoMay_(brand, 'admin')) {
    add('nobody can sign in as it', ADMIN_NAME + ' is not an admin',
        'Its role cell says "' + S(brand.role) + '". Every admin control is absent for it.');
  }
  const admins = read(TAB.people).rows.filter(r => whoMay_(r, 'admin') && hasPin_(r));
  if (!admins.length) {
    add('locked out', 'No account with the admin role has a PIN',
        'Nothing on the site can be edited by anybody. Fix a PIN on an admin row in the sheet.');
  }
}
function dpRefunds_(add, deep) {
  const owed = [];
  read(TAB.jobs).rows.forEach(j => {
    const id = S(j.job_id) || String(j._row);
    if (!id) return;
    refundsOwedFor_(j, id).forEach(name => {
      owed.push(name + ' — ' + (S(j.subject) || 'a session')
        + (S(j.weekday) ? ' on ' + S(j.weekday) : ''));
    });
  });
  if (owed.length) {
    add('money to give back', owed.length + ' paid, withdrew in time and are owed a refund: ' + owed.join('; '),
        'Refund them in Stripe. They are kept on the session marked Withdrawn so this does not '
        + 'disappear — nothing else anywhere says a refund is owed.');
  }
}
function dpTerms_(add, deep) {
  const t = read(TAB.terms);
  if (t.sheet) {
    const rows = t.rows
      .map(r => ({ name: S(r.term_name) || S(r.term_id), s: sheetDate(r.start_date),
                   e: sheetDate(r.end_date) }))
      .filter(r => r.s && r.e)
      .sort((a, b) => a.s - b.s);

    const backwards = rows.filter(r => r.e < r.s).map(r => r.name);
    if (backwards.length) add('terms that end before they start', backwards.join(', '),
      'Every length worked out from these is negative, so a booking inside one is priced for a '
      + 'negative number of weeks. Swap the two dates.');

    const overlaps = [], gaps = [];
    for (let i = 0; i < rows.length - 1; i++) {
      const a = rows[i], b = rows[i + 1];
      if (a.e < a.s) continue;                       /* already reported above */
      if (b.s <= a.e) {
        overlaps.push(a.name + ' and ' + b.name + ' share '
          + (Math.round((a.e - b.s) / 864e5) + 1) + ' days');
      } else {
        /* A WEEKEND BETWEEN A TERM AND A HOLIDAY IS NOT A GAP — schools break on a Friday and
           come back on a Monday, so up to three days between rows is ordinary. */
        const between = Math.round((b.s - a.e) / 864e5) - 1;
        if (between > 3) gaps.push(between + ' days between ' + a.name + ' and ' + b.name);
      }
    }
    if (overlaps.length) add('terms that overlap', overlaps.join('; '),
      'A day in two terms at once means a booking can be counted in either, and which one it '
      + 'lands in depends on the order the sheet happens to be read in.');
    if (gaps.length) add('days in no term', gaps.join('; '),
      'A booking on one of these days has no term to belong to, so it cannot be priced by the '
      + 'week or shown on a timetable.');

    /* ---------- AND WHAT IS MISSING, AGAINST THE COMPUTED YEAR § */
    const thisYear = (function () {
      const now = new Date();
      return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    })();
    const want = termsFor(thisYear);
    const missing = want.filter(w => !w.fromSheet).map(w => w.name);
    if (missing.length === want.length) {
      add('term dates', 'none entered for ' + thisYear + '-' + String(thisYear + 1).slice(2)
        + ' — using the computed year',
        'Worked out from Easter, the spring bank holiday and the usual pattern. Close, but the '
        + 'borough publishes the real ones and they differ by a day now and then. Worth pasting '
        + 'them in once a year.');
    } else if (missing.length) {
      add('terms not entered', missing.join(', '),
        'These are being computed from the usual pattern while the rest come from the sheet — so '
        + 'half the year is published dates and half is a guess, which is the combination hardest '
        + 'to notice being wrong. Either enter them all or none.');
    }

    const dup = {};
    rows.forEach(r => { dup[norm(r.name)] = (dup[norm(r.name)] || 0) + 1; });
    const twice = Object.keys(dup).filter(k => dup[k] > 1);
    if (twice.length) add('two terms with the same name', twice.join(', '),
      'Anything that looks a term up by name will find whichever comes first, which is not '
      + 'reliably the one meant.');
  }
}

/* `checkEverything`'s TABS section: each tab found, or MISSING. */
function checkTabs_(say) {
say('TABS');
Object.keys(TAB).filter(k => !storeMoved_(TAB[k])).forEach(k => {
  /* THROUGH `sheetFor_` LIKE THE REST — otherwise the four subjects tabs and anything renamed
     are reported MISSING by the very function somebody runs to find out what is missing. */
  const at = sheetFor_(k);
  let sheet = null;
  try {
    const ss2 = SpreadsheetApp.openById(at.id);
    for (let i = 0; i < at.names.length && !sheet; i++) sheet = ss2.getSheetByName(at.names[i]);
  } catch (err) { /* an unopenable spreadsheet is reported missing below */ }
  if (!sheet) { say('  ✗ ' + TAB[k] + '  MISSING — open the site once as an admin'); return; }
  const rows = Math.max(0, sheet.getLastRow() - 1);
  say('  ✓ ' + (TAB[k] + '                    ').slice(0, 16) + rows + ' row(s)');
});
}

/* RUN THIS FROM THE EDITOR when anything is not appearing. § */
function checkEverything() {
  const out = [];
  const say = m => { out.push(m); Logger.log(m); };

  say('backend version   : ' + BACKEND_VERSION);
  /* WHICH SHEET. "I changed the cell and nothing happened" is answered here more often than anywhere else — two spreadsheets open in two tabs is the easiest § */
  Object.keys(FILES).forEach(which => {
    const id = String(FILES[which] || '');
    say((which + ' id').padEnd(18) + ': ' + (id || 'NOT SET'));
    if (!id) return;
    /* THE NAME IS THE CHECK, not decoration. § */
    try {
      say((which + ' name').padEnd(18) + ': ' + SpreadsheetApp.openById(id).getName());
    } catch (err) { say((which + ' name').padEnd(18) + ': CANNOT OPEN IT — ' + err); }
  });
  say(''); say('If the site says the backend is older than it is, this number is not the question —');
  say('the DEPLOYMENT is. Deploy → Manage deployments → pencil → Version: New version.');
  say('A "New deployment" makes a NEW /exec URL, and the site still calls the old one.');
  say('');

  /* 1. WHICH TABS EXIST. A tab missing means ensureSchema_ has not run since it was added — the
     commonest cause of a feature that is built and invisible. */
  checkTabs_(say);

  /* 2. THE BRANDING. It listed every key of the `brand` tab. § */
  say(''); say('BRAND');
  say('  the brand tab is data/settings/brand.json now — open it there');
  say('  the name on an e-mail: ' + BRAND_NAME);

  /* WHAT IT MAY DO, before anything else is guessed at. A missing scope explains a whole class
     of failure that otherwise reads as a bug in the feature it broke. */
  say(''); say('PERMISSIONS');
  try {
    const sc = checkScopes();
    (sc.granted || []).forEach(x => say('  ' + x));
    say('  → ' + (sc.verdict || sc.error));
  } catch (err) { say('  could not check: ' + err); }

  say(''); say('If a tab says MISSING, open the site once as an admin.');
  say('If the tabs are all there and the site still looks old, the DEPLOYMENT is old —'); say('Deploy → New deployment, not Save.');
  return out.join('\n');
}

/* Install the background jobs. § */
function installTriggers_() {
  /* `geocodeVenues` is here so a postcode typed on Tuesday is placed on Tuesday night without anybody being told to go and run something. § */
  /* `refreshPageCounts` WAS THE THIRD. § */
  const wanted = ['refreshPageCounts', 'closeFinishedJobs', 'geocodeVenues'];
  ScriptApp.getProjectTriggers().forEach(tr => {
    if (wanted.indexOf(tr.getHandlerFunction()) !== -1) ScriptApp.deleteTrigger(tr);
  });
  // 3am: after midnight so "today" is settled for the date comparisons, and long before anyone
  // is using the site.
  ScriptApp.newTrigger('closeFinishedJobs').timeBased().everyDays(1).atHour(3).create();
  ScriptApp.newTrigger('geocodeVenues').timeBased().everyDays(1).atHour(3).create();

  /* ---------- AND THE ONE THAT DECIDES WHETHER THE SPREADSHEET IS THE SITE § */
  const watch = (function () {
    try { return installSheetWatch_(); }
    catch (err) { return { error: String(err && err.message || err) }; }
  })();

  /* ---------- AND `installWarmTrigger` IS DELIBERATELY NOT CALLED HERE § */

  const out = { installed: wanted, when: 'daily, about 3am', sheetWatch: watch,
                warm: 'not installed on purpose — see the note in installTriggers_' };
  Logger.log(JSON.stringify(out));
  return out;
}

/** What's currently scheduled, so you can see it rather than assume it. */
function listTriggers() {
  return ScriptApp.getProjectTriggers().map(tr => tr.getHandlerFunction());
}

/* WHAT THIS DEPLOYMENT IS ACTUALLY ALLOWED TO DO. § */
function checkScopes() {
  const want = {
    'spreadsheets': 'the database — every read and write',
    'drive': 'creating and sharing post photographs',
    'script.send_mail': 'notifications',
    'script.external_request': 'Stripe, and this check itself',
    'script.scriptapp': 'the nightly triggers',
  };

  /* `heldScopes_` and `holdsScope_` in content.gs — one asking of Google, and a scope matched by its WHOLE name. § */
  const s = heldScopes_();
  if (s.error) {
    return { error: 'Could not ask Google what this token holds: ' + s.error,
             hint: 'If that mentions permissions, script.external_request is missing too — which '
                 + 'means the manifest has not reached this deployment at all.' };
  }
  const held = s.held;
  const has = name => holdsScope_(held, name);

  const missing = Object.keys(want).filter(k => !has(k));
  return {
    version: BACKEND_VERSION,
    granted: held,
    missing: missing.map(k => k + ' — ' + want[k]),
    /* Empty when Apps Script will not offer one — which is itself the answer, and the reason the
       message can tell you whether a link exists rather than promising one that does not. */
    grantAt: missing.length ? consentUrl_() : '',
    verdict: missing.length
      ? 'This deployment CANNOT do: ' + missing.join(', ') + '. The manifest listing a scope is '
        + 'not the same as this token holding it: save appsscript.json, run authoriseDrive from '
        + 'the EDITOR and accept the prompt, then deploy a NEW version — the version is what '
        + 'carries the manifest, so authorising without redeploying changes nothing here.'
      : 'This deployment holds everything it needs.',
  };
}

/* RUN THIS ONCE FROM THE EDITOR to grant Drive access, and to prove it. § */
function authoriseDrive() {
  const out = [];
  const stop = [];
  const folder = getPostFolder();
  if (!folder) {
    out.push('No posts folder — add `posts_folder` to the config tab first, then run this again.');
    stop.push('there is no posts folder to test a write in');
  } else {
    /* A READ REFUSED IS AN ANSWER TOO, and it used to be a thrown error with no verdict under it. */
    try {
      out.push('Folder: ' + folder.getName());
      let n = 0;
      const it = folder.getFiles();
      while (it.hasNext() && n < 500) { it.next(); n++; }
      out.push('Can read: ' + n + ' file(s) in it.');
    } catch (err) { out.push('CANNOT READ the folder: ' + err); }

    try {
      const probe = folder.createFile('family-permission-check.txt',
        'Written by authoriseDrive to confirm the script may create files. Safe to delete.');
      /* BINNED EVEN IF SHARING IS WHAT FAILS. A sharing refusal (a Workspace
         domain that forbids links outside it) is a real answer, and no reason to leave a file. */
      try { probe.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); }
      finally { probe.setTrashed(true); }
      out.push('Can write: yes — a test file was created, shared by link and removed.');
    } catch (err) {
      out.push('CANNOT WRITE: ' + err);
      out.push('Open appsscript.json and check it lists https://www.googleapis.com/auth/drive,');
      out.push('then run this again and accept the prompt.');
      stop.push('the test file could not be made and shared');
    }
  }

  /* EVERY PERMISSION THE MANIFEST LISTS, asked of Apps Script rather than of a list kept here — a second copy of the manifest's scopes would be one more thing to § */
  let whole = '';
  try { whole = String(ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL).getAuthorizationStatus()); }
  catch (err) { whole = ''; }
  if (whole !== 'NOT_REQUIRED') {
    stop.push(whole === 'REQUIRED'
      ? 'Apps Script says some of the permissions the manifest lists are still not allowed'
      : 'Apps Script could not say whether every permission is allowed');
  }
  /* AND DRIVE BY ITS WHOLE NAME, from the token itself. Unanswerable is not counted against it:
     asking needs `script.external_request`, and a token without that has already failed above. */
  const s = heldScopes_();
  if (!s.error && !holdsScope_(s.held, 'drive')) {
    stop.push('the token holds ' + (s.held.filter(x => /\/auth\/drive/.test(x)).join(', ') || 'no Drive scope')
      + ', not https://www.googleapis.com/auth/drive');
  }

  out.push(stop.length
    ? 'DO NOT DEPLOY A NEW VERSION YET — ' + stop.join('; ') + '. A new version with a permission '
      + 'not allowed answers every visitor "Authorization is required". Run this again: on "Google '
      + 'hasn\'t verified this app" press Advanced, then Go to the project; on the next screen tick '
      + 'every box (or Select all), then Continue.'
    : 'READY — every permission is allowed and a file was made and shared. Now deploy a new version: '
      + 'Deploy → Manage deployments → the pencil → Version: New version → Deploy.');

  const msg = out.join('\n');
  Logger.log(msg);
  return msg;
}

/* EVERYTHING THE SHEET NEEDS, WITHOUT ANYBODY REMEMBERING ANYTHING. § */
/* WHICH COLUMNS ARE STILL MISSING, tab by tab. § */
function schemaGaps() {
  const gaps = {};
  Object.keys(SCHEMA).forEach(name => {
    if (storeMoved_(name)) return;            /* a moved kind's columns are its marker row's (ensureSchema_ widens it) */
    /* ---------- THE SAME LOOKUP AS EVERYWHERE ELSE, FOR THE THIRD TIME § */
    const at = sheetFor_(name);
    if (!at.id) return;                       /* a file that is not configured is not a gap */
    let sh = null;
    try {
      const ss = SpreadsheetApp.openById(at.id);
      for (let i = 0; i < at.names.length && !sh; i++) sh = ss.getSheetByName(at.names[i]);
    } catch (err) { gaps[name] = ['(cannot open that file)']; return; }
    if (!sh) { gaps[name] = ['(the whole tab)']; return; }
    const lastCol = Math.max(1, sh.getLastColumn());
    const have = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
    const missing = SCHEMA[name].filter(h => have.indexOf(h) === -1);
    if (missing.length) gaps[name] = missing;
  });
  return gaps;
}

function autoMigrate_() {
  const props = PropertiesService.getScriptProperties();
  const seen = props.getProperties() || {};

  const schemaStale = seen.SCHEMA_VERSION !== BACKEND_VERSION && (function () {
    /* A failed attempt is retried, but not immediately. Two minutes is long enough that a broken
       schema cannot make every page load slow, and short enough that a fix lands on the next
       cup of tea rather than the next deploy. */
    const tried = String(seen.SCHEMA_TRIED || '');
    if (tried.indexOf(BACKEND_VERSION + '@') !== 0) return true;
    const at = Number(tried.split('@')[1]) || 0;
    return Date.now() - at > 120000;
  })();
  /* A JOB THAT KEEPS FAILING MUST NOT KEEP TRYING ON EVERY PAGE LOAD. § */
  const pending = MIGRATIONS.filter(m => {
    if (seen['MIGRATED_' + m.id]) return false;
    const tried = Number(seen['TRIED_' + m.id] || 0);
    return !tried || (Date.now() - tried > 120000);
  });
  if (!schemaStale && !pending.length) return null;

  /* One at a time. Two people opening the site in the same second after a deploy would otherwise both run it, and both would be adding the same columns to the same § */
  return withWriteLock_(() => {
  const out = { version: BACKEND_VERSION };
    /* MARKED BEFORE THE WORK, every time. § */
    if (schemaStale) {
      /* MARKED ONLY IF IT WORKED, and "worked" is checked rather than assumed. § */
      try {
        out.schema = ensureSchema_();
        const gaps = schemaGaps();
        if (Object.keys(gaps).length) {
          out.stillMissing = gaps;
          /* Not recorded, so the next request tries again — but only after a pause, which is what the attempt marker is for. § */
          props.setProperty('SCHEMA_TRIED', BACKEND_VERSION + '@' + Date.now());
          props.setProperty('SCHEMA_FAILED', 'columns still missing: ' + Object.keys(gaps).join(', '));
        } else {
          props.setProperty('SCHEMA_VERSION', BACKEND_VERSION);
          props.setProperty('SCHEMA_AT', new Date().toISOString());
          props.deleteProperty('SCHEMA_TRIED');
          props.deleteProperty('SCHEMA_FAILED');
        }
      } catch (err) {
        out.schemaError = String((err && err.message) || err);
        props.setProperty('SCHEMA_TRIED', BACKEND_VERSION + '@' + Date.now());
        props.setProperty('SCHEMA_FAILED', out.schemaError);
      }
    }

    out.ran = [];
    pending.forEach(m => {
      /* RECORDED BEFORE IT RUNS, which is right for a rename: § */
      if (!m.retry) props.setProperty('MIGRATED_' + m.id, new Date().toISOString());
      try {
        out.ran.push({ id: m.id, what: m.what, result: m.run() });
        if (m.retry) props.setProperty('MIGRATED_' + m.id, new Date().toISOString());
        props.deleteProperty('TRIED_' + m.id);
        props.deleteProperty('FAILED_' + m.id);
      } catch (err) {
        /* THE WORDS OF THE ERROR, for the Setup card on You (361) — "it failed" gives the owner nothing to tell anyone. */
        props.setProperty('FAILED_' + m.id, String((err && err.message) || err).slice(0, 300));
        /* WHEN IT LAST FAILED, so the next request does not immediately try again. Cleared on
           success below, so a job that starts working stops being paced. */
        props.setProperty('TRIED_' + m.id, String(Date.now()));
        out.ran.push({ id: m.id, error: String((err && err.message) || err),
                       willRetry: !!m.retry, tryingAgainIn: '2 minutes' });
      }
    });
    if (!out.ran.length) delete out.ran;

    Logger.log('auto-migrated: ' + JSON.stringify(out));
    return out;
  }, { wait: 10000, busy: () => ({ skipped: 'another request is doing it' }) });
}

/* ---------- ON AN ADMIN'S PAGE LOAD, WHAT USED TO BE RUN BY HAND (361) ----------
   Schema and run-once jobs (cheap when nothing is pending), and the Sunday email's hour, checked at most
   every ten minutes. Never throws. */
const SETUP_CHECK_MS = 10 * 60 * 1000;
/* THE KEEP-BOOKED JOBS, one table: run on admin load (FAILED_<id> on error), shown on the setup card, and named in setupTriggerWhen_. */
const KEEP_BOOKED = [
  { id: 'sunday-email-hour', fn: () => digestKeepBooked_(), what: 'the Sunday email kept at weekly_digest_hour', when: {} },
  { id: 'library-import-hourly', fn: () => libImportKeepBooked_(), what: 'the hourly library import kept booked', when: { libImportHourly: 'every hour' } },
  { id: 'keep-warm', fn: () => keepWarmKeepBooked_(), what: 'the five-minute keep-warm kept booked', when: { keepWarm: 'every 5 minutes' } },
  /* DOCKET INBOX (owner, 25 Nov): `everyLoad`, so not held to the ten minutes: rows in docket_inbox go into the owner's Docket (docketInboxRun_). */
  { id: 'docket-inbox', fn: () => withWriteLock_(() => docketInboxRun_(), { wait: 5000, busy: () => null }), what: "docket_inbox rows put in the owner's Docket", when: {}, everyLoad: true }
];
function setupOnAdminLoad_() {
  try { autoMigrate_(); } catch (err) { Logger.log('setup: ' + err); }
  try {
    const props = PropertiesService.getScriptProperties();
    const at = Number(props.getProperty('SETUP_CHECKED_AT') || 0), due = Date.now() - at >= SETUP_CHECK_MS;
    if (due) props.setProperty('SETUP_CHECKED_AT', String(Date.now()));
    KEEP_BOOKED.filter(job => job.everyLoad || due).forEach(job => {
      try { job.fn(); props.deleteProperty('FAILED_' + job.id); }
      catch (err) { props.setProperty('FAILED_' + job.id, String((err && err.message) || err).slice(0, 300)); }
      /* THE NOTES A SESSION ADDRESSED (498), marked done from data/notes-done.json, after the Sunday hour as before. */
      if (job.id === 'sunday-email-hour') { try { claudeNotesDoneSync_(); } catch (err) { Logger.log('notes done: ' + err); } }
    });
  } catch (err) { Logger.log('setup: ' + err); }
}

/* WHEN A TRIGGER RUNS, in words — Apps Script will not read a trigger's schedule back, so this is what the installers book. */
function setupTriggerWhen_(fn, hour) {
  const said = { closeFinishedJobs: 'every day, about 3am', geocodeVenues: 'every day, about 3am',
    refreshPageCounts: 'every day, about 3am', onSheetChange: 'whenever a spreadsheet is edited',
    warmAfterEdit: 'once, a minute after an edit', warmPayload: 'every 5 minutes', };
  KEEP_BOOKED.forEach(job => Object.assign(said, job.when));
  return digestTriggerWhen_(fn, hour) || said[fn] || 'booked';
}

/* ---------- WHAT THE SETUP CARD ON YOU SAYS (361), for an admin only — doGet sends it to nobody else. ---------- */
function setupStatus_() {
  const out = { backend: BACKEND_VERSION, files: {}, jobs: [], triggers: [], sunday: {} };
  try {
    out.files = { constants: BACKEND_VERSION, doGet: DOGET_VERSION, doPost: DOPOST_VERSION, booking: BOOKING_VERSION };
  } catch (err) { out.files = { constants: BACKEND_VERSION }; }
  let seen = {};
  try { seen = PropertiesService.getScriptProperties().getProperties() || {}; } catch (err) { seen = {}; }
  const schemaOk = seen.SCHEMA_VERSION === BACKEND_VERSION;
  out.jobs.push({ id: 'schema', what: 'the sheet gets every tab and column this version uses',
    ran: schemaOk ? S(seen.SCHEMA_AT) || 'yes' : '', error: schemaOk ? '' : S(seen.SCHEMA_FAILED) });
  MIGRATIONS.forEach(m => {
    const job = { id: m.id, what: m.what, ran: S(seen['MIGRATED_' + m.id]),
      /* A FAILURE IS SHOWN EVEN WHEN MARKED DONE (22 Nov): a run-once job is marked before it runs, so its FAILED_ is the only sign it broke. */
      error: S(seen['FAILED_' + m.id]) };
    /* WHAT A JOB LEFT TO SAY (`SAID_<id>`): the tidy's backup link and what it removed (379). */
    try {
      const said = seen['SAID_' + m.id] ? JSON.parse(seen['SAID_' + m.id]) : null;
      if (said && /^https:\/\//.test(S(said.link))) job.link = S(said.link);
      if (said && S(said.said)) job.said = S(said.said);
    } catch (err) { /* a note that will not parse is no note */ }
    /* A JOB THAT REPORTS ITS OWN PROGRESS (`progress`, the library's copy, 397): still working is waiting, not failed. */
    if (!job.ran && typeof m.progress === 'function') {
      try { const p = m.progress() || {}; if (p.working) job.error = ''; if (S(p.said)) job.said = S(p.said); } catch (err) { /* a progress probe that fails leaves the job as it was */ }
    }
    out.jobs.push(job);
  });
  KEEP_BOOKED.forEach(job => {
    if (seen['FAILED_' + job.id]) out.jobs.push({ id: job.id, what: job.what, ran: '', error: S(seen['FAILED_' + job.id]) });
  });
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const hour = digestBookedHour_(cfg);
  try {
    const n = {};
    ScriptApp.getProjectTriggers().forEach(t => { const fn = t.getHandlerFunction(); n[fn] = (n[fn] || 0) + 1; });
    out.triggers = Object.keys(n).sort().map(fn => ({ fn: fn, times: n[fn], when: setupTriggerWhen_(fn, hour) }));
  } catch (err) { out.triggersError = String((err && err.message) || err); }
  out.sunday = digestSetupSays_(cfg, new Date());
  return out;
}
