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
  if (!t.sheet) return { error: 'no people tab' };
  for (const col of ['handle']) {
    /* NAMED, NOT SKIPPED. `setCell` writes to a header that is not there and loses the value with no error anywhere — the fault every `noColumn` refusal in this § */
    if (t.headers.indexOf(col) === -1) {
      return { error: 'the people tab has no ' + col + ' column. Open the site once as an admin first '
                    + '— nothing was changed.' };
    }
  }
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
    const made = handleMake_(r);
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

/* EVERY HANDLE INTO THE NEW SHAPE — `?run=renameHandles`. § */
function renameHandles_() {
  const t = read(TAB.people);
  if (!t.sheet) return { error: 'no people tab' };
  for (const col of ['handle']) {
    if (t.headers.indexOf(col) === -1) {
      return { error: 'the people tab has no ' + col + ' column. Open the site once as an admin first '
                    + '— nothing was changed.' };
    }
  }
  const keepWas = t.headers.indexOf('handle_was') !== -1;
  const keepAt = t.headers.indexOf('handle_changed_at') !== -1;
  const out = { renamed: [], leftAlone: 0, children: 0, couldNotGenerate: [] };
  t.rows.forEach(r => {
    const who = S(r.person_id) || '(a row with no id)';
    const has = S(r.handle);
    /* A CHILD'S HANDLE IS NOT THIS JOB'S (342). § */
    if (isChild_(r)) { out.children++; return; }
    /* SHAPED FOR THIS PERSON — a grown-up's arrangement, or the initials-and-tail of a grown-up who was
       a child (`handleIsShaped_`): they keep it until they press Randomise. */
    if (handleIsShaped_(has, r.first_name)) { out.leftAlone++; return; }
    const made = handleMake_(r, undefined, has);
    if (!made) { out.couldNotGenerate.push(who); return; }
    /* THE HISTORY BEFORE THE HANDLE (342, the review): § */
    const cells = {};
    if (keepWas && has) cells.handle_was = handleWasWith_(r.handle_was, has);
    /* AND THE FACE THE OLD HANDLE DREW, before the handle, when nobody chose a look (`handleFaceKept_`). */
    Object.assign(cells, handleFaceKept_(t, r, has));
    cells.handle = made;
    if (keepAt) cells.handle_changed_at = new Date();
    Object.keys(cells).forEach(c => setCell(t, r, c, cells[c]));
    out.renamed.push(who);
  });
  clearCache();
  out.renamedCount = out.renamed.length;
  /* A PRIVATE GROWN-UP WHOSE HANDLE STILL CARRIES THEIR SURNAME (342) — by id, never moved here. */
  out.surnameInHandle = handleSurnameIn_(t.rows);
  out.means = 'every grown-up\'s handle that was not a first name and a virtue (with or without a number, in '
            + 'any order) was regenerated and the old one put at the front of handle_was. Shaped '
            + 'handles were left alone, so nobody signing in with a handle was moved. Children are '
            + '?run=kidHandles\'s, and were not touched.';
  return out;
}

/* EVERY CHILD'S HANDLE INTO THEIR INITIALS AND FOUR DIGITS — `?run=kidHandles`, PREVIEWED FIRST (342) § */
function kidHandles(arg) {
  const apply = norm(arg) === 'apply';
  const t = read(TAB.people);
  if (!t.sheet) return { error: 'no people tab' };
  /* ALL THREE BEFORE ANYTHING, as `randomiseHandle` asks — a handle moved with nowhere to put the old one
     is a child whose slip no longer signs them in. */
  const lacking = ['handle', 'handle_was', 'handle_changed_at'].filter(c => t.headers.indexOf(c) === -1);
  if (lacking.length) {
    return { error: 'the people tab has no ' + lacking.join(', ') + ' column. Run ?setup=1 first '
                  + '— nothing was changed.' };
  }
  const out = { mode: apply ? 'apply' : 'preview', children: 0, toMove: 0, leftAlone: 0,
                signInByHandle: 0, figuresKept: 0, couldNotGenerate: [], rows: [],
                inAnotherHistory: [], grownUpsSurnameInHandle: handleSurnameIn_(t.rows) };
  const inOthers = (r, h) => !!key(h)
    && t.rows.some(x => x !== r && S(x.handle_was).split(',').some(w => key(w) === key(h)));
  try {
    t.rows.forEach(r => {
      if (!isChild_(r)) return;
      out.children++;
      const has = S(r.handle);
      const who = S(r.person_id) || '(a row with no id)';
      if (has && handleKidShaped_(has)) { out.leftAlone++; return; }
      out.toMove++;
      if (!S(r.email)) out.signInByHandle++;
      if (inOthers(r, has)) out.inAnotherHistory.push(who);
      if (!apply) {
        if (handleFaceKept_(t, r, has).avatar) out.figuresKept++;
        out.rows.push({ id: who, from: has,
                        to: (handleInitials_(r.first_name, r.last_name) || HANDLE_FALLBACK) + '····' });
        return;
      }
      const made = handleMake_(r, undefined, has);
      if (!made) { out.couldNotGenerate.push(who); return; }
      /* THE HISTORY FIRST, IN ITS OWN WRITE — see above. § */
      const kept = handleFaceKept_(t, r, has);
      setCells(t, r, Object.assign({ handle_was: handleWasWith_(r.handle_was, has) }, kept));
      setCells(t, r, { handle: made, handle_changed_at: new Date() });
      if (kept.avatar) out.figuresKept++;
      out.rows.push({ id: who, from: has, to: made });
    });
    if (apply) {
      /* EVERY CHILD'S OLD HANDLES, whichever run moved them: § */
      const had = {};
      t.rows.forEach(r => {
        [...new Set(S(r.handle_was).split(',').map(w => key(w)).filter(Boolean))]
          .forEach(k => { (had[k] = had[k] || []).push(r); });
      });
      const moves = {};
      Object.keys(had).forEach(k => {
        const r = had[k].length === 1 ? had[k][0] : null;
        if (r && isChild_(r) && S(r.handle) && !t.rows.some(x => key(x.handle) === k)) moves[k] = S(r.handle);
      });
      out.friendsMoved = handleFriendsMove_(t, moves);
    }
  } finally {
    if (apply) clearCache();
  }
  out.means = (apply
    ? 'every child whose handle was not initials and four digits has one now; the old one is at the '
      + 'front of handle_was and still signs them in, and is never given to anybody else. Grown-ups were not touched.'
    : 'NOTHING WAS CHANGED. This is what &arg=apply would do: ' + out.toMove + ' of ' + out.children
      + ' children moved to their initials and four digits (drawn when it runs), ' + out.signInByHandle
      + ' of them signing in with the handle — their old one keeps working and they are told the new one '
      + 'when they use it.')
    /* THE FIGURE (round 2) — a blank look is drawn from the handle, so the move writes the old one's down. */
    + ' ' + out.figuresKept + ' child(ren) had never chosen a look (figuresKept): the figure their old handle drew '
    + (apply ? 'was' : 'will be') + ' written into their avatar cell, so moving the handle changes nobody\'s face.'
    + (out.inAnotherHistory.length ? ' ' + out.inAnotherHistory.length + ' child(ren) in inAnotherHistory hold a '
      + 'handle that is also on somebody else\'s handle_was — after the move typing it would be refused as two '
      + 'accounts\', so take it off the other row\'s handle_was first.' : '')
    + (out.grownUpsSurnameInHandle.length ? ' ' + out.grownUpsSurnameInHandle.length + ' grown-up(s) in '
      + 'grownUpsSurnameInHandle have their surname in their handle, which is shown beside their first name — '
      + 'not changed here; Randomise gives them one without it.' : '');
  return out;
}

/* ---------- A PRIVATE GROWN-UP WHOSE HANDLE CARRIES THEIR SURNAME (342, the review) § */
function handleSurnameIn_(rows) {
  const fold = v => String(v == null ? '' : v).toLowerCase().normalize('NFKD').replace(/[^a-z]/g, '');
  return (rows || []).filter(r => !isChild_(r) && namePrivate_(r)
      && fold(r.last_name).length >= 3 && fold(r.handle).indexOf(fold(r.last_name)) !== -1)
    .map(r => S(r.person_id) || '(a row with no id)');
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
    if (!hasRole(existing, 'admin')) {
      setCell(t, existing, 'role', S(existing.role) ? S(existing.role) + ', admin' : 'admin');
      fixed.push('role');
    }
    /* ---------- THROUGH `authSetPin_`, AND THIS LINE IS WHY THE OWNER COULD NOT SIGN IN § */
    if (pin && /^\d{4,8}$/.test(String(pin))) {
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

  if (!/^\d{4,8}$/.test(String(pin || ''))) {
    throw new Error('Give it a PIN of 4 to 8 digits: makeBrandAccount(\'4821\')');
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

/* EVERY OLD LIKE BECOMES A 👍. § */
function migrateLikes_() {
  const likes = read(TAB.post_likes);
  const t = read(TAB.post_reactions);
  if (!likes.sheet || !t.sheet) return { error: 'a tab is missing — open the site once as an admin' };

  const already = {};
  t.rows.forEach(r => { already[S(r.post_id) + '|' + S(r.person_id)] = true; });

  let made = 0, had = 0, skipped = 0;
  likes.rows.forEach(l => {
    const post = S(l.post_id), who = S(l.person_id);
    if (!post || !who) { skipped++; return; }
    if (already[post + '|' + who]) { had++; return; }
    addRow(t, {
      reaction_id: 'RE' + Date.now() + '-' + made,
      post_id: post, person_id: who, emoji: '👍',
      /* The date it was LIKED, not today. A migration that stamps everything with the hour it ran
         destroys the only interesting thing about the rows it is moving. */
      reacted_on: l.liked_on || new Date(),
    });
    already[post + '|' + who] = true;
    made++;
    /* No sleep. The id carries `made`, which differs on every row, so two written in the same millisecond were never going to collide — the same thing that was § */
  });

  clearCache();
  const out = { turnedIntoThumbs: made, alreadyReacted: had, unusable: skipped };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/* ---------- FOUR PAPER JOBS WERE HERE, AND CLAUDE.md ALREADY SAID NOT TO RUN THEM § */

/* THE COLLIERS WOOD LANDMARKS, WRITTEN INTO THE TAB. § */
/* THERE WERE TWO OF THESE. § */
function seedLandmarks() {
  const t = read(TAB.landmarks);
  if (!t.sheet) return { error: 'no landmarks tab — open the site once as an admin first' };

  const WORLD = 'Merton';
  const ROWS = [
  { name: "Merton Bus Garage", kind: "transport", lat: 51.41734, lng: -0.18152, bearing: 1,
    w: 215, d: 60, height: 9, storeys: 1,
    wall_colour: "#c2bcae",
    points: "51.41837 -0.18190, 51.41839 -0.18147, 51.41841 -0.18124, 51.41774 -0.18113, 51.41772 -0.18142, 51.41705 -0.18130, 51.41684 -0.18118, 51.41662 -0.18118, 51.41655 -0.18113, 51.41652 -0.18124, 51.41648 -0.18138, 51.41654 -0.18142, 51.41677 -0.18143, 51.41702 -0.18158, 51.41699 -0.18196, 51.41716 -0.18198, 51.41783 -0.18200, 51.41810 -0.18195, 51.41837 -0.18190" },
  { name: "Priory Retail Park", kind: "retail", lat: 51.41586, lng: -0.17899, bearing: 84,
    w: 129, d: 47, height: 8, storeys: 1,
    wall_colour: "#cfc7b8",
    points: "51.41641 -0.17906, 51.41628 -0.17908, 51.41616 -0.17911, 51.41601 -0.17913, 51.41586 -0.17916, 51.41580 -0.17917, 51.41571 -0.17918, 51.41558 -0.17920, 51.41546 -0.17923, 51.41538 -0.17924, 51.41525 -0.17901, 51.41524 -0.17896, 51.41522 -0.17860, 51.41623 -0.17842, 51.41625 -0.17861, 51.41638 -0.17859, 51.41641 -0.17906" },
  { name: "Britannia Point", kind: "tower", lat: 51.41744, lng: -0.1784, bearing: 74,
    w: 41, d: 38, height: 59.5, storeys: 17,
    wall_colour: "#d8d2c4",
    note: '13,000 m2 is TOTAL FLOOR SPACE over 17 storeys, not the footprint.',
    points: "51.41736 -0.17873, 51.41749 -0.17867, 51.41746 -0.17848, 51.41749 -0.17846, 51.41765 -0.17839, 51.41761 -0.17822, 51.41743 -0.17830, 51.41739 -0.17812, 51.41739 -0.17810, 51.41726 -0.17816, 51.41736 -0.17873" },
  { name: "Premier Inn", kind: "civic", lat: 51.41398, lng: -0.18042, bearing: 40,
    w: 99, d: 49, height: 22, storeys: 7,
    wall_colour: "#e0d6c2",
    points: "51.41359 -0.18067, 51.41370 -0.18075, 51.41374 -0.18079, 51.41383 -0.18085, 51.41388 -0.18089, 51.41395 -0.18065, 51.41402 -0.18041, 51.41404 -0.18042, 51.41402 -0.18066, 51.41407 -0.18071, 51.41410 -0.18072, 51.41411 -0.18065, 51.41417 -0.18066, 51.41426 -0.17971, 51.41417 -0.17969, 51.41412 -0.17967, 51.41411 -0.17970, 51.41410 -0.17973, 51.41359 -0.18067" },
  { name: "Sainsbury's", kind: "retail", lat: 51.41521, lng: -0.18175, bearing: 15,
    w: 153, d: 147, height: 10, storeys: 1,
    wall_colour: "#d6cdbd",
    points: "51.41470 -0.18252, 51.41471 -0.18246, 51.41472 -0.18243, 51.41475 -0.18222, 51.41475 -0.18219, 51.41443 -0.18204, 51.41446 -0.18187, 51.41450 -0.18165, 51.41450 -0.18163, 51.41454 -0.18142, 51.41458 -0.18119, 51.41461 -0.18097, 51.41466 -0.18074, 51.41469 -0.18052, 51.41472 -0.18034, 51.41496 -0.18045, 51.41513 -0.18052, 51.41565 -0.18074, 51.41591 -0.18086, 51.41588 -0.18102, 51.41584 -0.18127, 51.41581 -0.18147, 51.41577 -0.18170, 51.41582 -0.18172, 51.41582 -0.18174, 51.41579 -0.18189, 51.41577 -0.18200, 51.41585 -0.18203, 51.41583 -0.18216, 51.41581 -0.18228, 51.41573 -0.18225, 51.41570 -0.18241, 51.41551 -0.18255, 51.41543 -0.18261, 51.41539 -0.18261, 51.41534 -0.18259, 51.41531 -0.18278, 51.41470 -0.18252" },
  ];

  /* Everything already there, so a second run costs one read and writes nothing. Matched on name AND
     world, because two boroughs may each have a library and they are not the same building. */
  const have = {};
  t.rows.forEach(r => { have[key(S(r.name)) + '|' + key(S(r.world))] = true; });

  const added = [], already = [];
  ROWS.forEach(r => {
    const k = key(r.name) + '|' + key(WORLD);
    if (have[k]) { already.push(r.name); return; }
    addRow(t, {
      name: r.name,
      world: WORLD,
      kind: r.kind,
      lat: r.lat,
      lng: r.lng,
      bearing: r.bearing,
      /* `polygon` is what makes the reader use `points`; anything else and it falls back to the
         width, depth and bearing below. Both are written, so either path draws the right building. */
      /* THE TAB'S OWN NAMES. § */
      w: r.w,
      d: r.d,
      points: r.points,
      height: r.height,
      storeys: r.storeys,
      wall_colour: r.wall_colour,
      note: r.note || '',
    });
    have[k] = true;
    added.push(r.name);
  });

  clearCache();
  const out = { added: added, alreadyThere: already, ofTotal: ROWS.length };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/* WHEN EASTER IS, and it is the only date on this tab that needs arithmetic rather than a rule. § */
function easterOf_(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

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

  /* --- terms: the ones that stop a booking existing at all --- */
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

  /* --- tutors: a tutor nobody can book is a tutor who earns nothing --- */
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
      if (cut !== '' && seatCutOut_(cut) === '') {
        add('pricing looks wrong', personDisplayName(r) + "'s extra_seat_cut is " + cut,
            'It is a FRACTION of their rate, written as a plain number from 0 to 2 — 0.1 is a tenth. '
            + 'Anything else is priced at the usual cut, the config B, as a blank is.');
      }
    }
    /* Email is how everybody finds out anything. Without one, every notification this system
       sends to that person is thrown away silently. */
    if (!S(r.email)) {
      add('nobody is told', personDisplayName(r) + ' (' + role + ') has no email address',
          'Every message the site sends them is discarded.');
    }
  });

  /* --- venues --- */
  read(TAB.venues).rows.forEach(r => {
    if (!S(r.name)) return;
    if (!Object.keys(availSet(r.availability)).length) {
      add('stops bookings', S(r.name) + ' has no open hours',
          'It will never appear as bookable.');
    }
  });

  /* --- the numbers that decide what you earn --- */
  const cfg = config();
  const c = N(cfg.c), B = N(cfg.B);
  if (c + B > 1) {
    add('pricing looks wrong', 'Each extra seat adds ' + Math.round((c + B) * 100) + '%'
        + ' (c ' + c + ' + B ' + B + ')',
        'These are FRACTIONS of the rate — 0.25 means +25%. A value above 1 is usually a pound '
        + 'figure left over from an older formula.');
  }
  /* B IS THE DEFAULT CUT since docs/history/345 — a tutor's own `extra_seat_cut` wins over it — so a nought
     here is nothing earned on every tutor whose own cell is blank, not on every tutor. */
  if (!B) {
    add('you earn nothing', 'B is 0 — you take no share of an extra seat from a tutor with no cut of their own',
        'Every hour such a tutor teaches earns you £0. That is a directory, not an agency.');
  }

  /* ---------- THE LAW-COLOUR CHECK WENT WITH THE TAB § */

  /* Columns something has actually tried to write to during THIS request and could not find. § */
  WRITE_MISSES.forEach(x => {
    add('a value went nowhere', 'Something wrote to ' + x.tab + '.' + x.field + ', which is not '
        + 'a column',
        'Open the site once as an admin. Until then anything saved to that field is discarded.');
  });

  /* THE JOBS THAT RUN THEMSELVES, AND WHETHER THEY DID. § */
  {
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

  /* CAN THE DEPLOYMENT WRITE TO DRIVE? § */
  {
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

  /* A PAGE-COUNT TALLY WAS HERE, and so was a second one under `printing` below. § */

  /* LANDMARKS THAT HAVE NOT BEEN MEASURED. § */
  {
    const ls = read(TAB.landmarks).rows.filter(r => S(r.name));
    const unmeasured = ls.filter(r => !(N(r.w) && N(r.d)) && !S(r.points))
      .map(r => S(r.name));
    const flat = ls.filter(r => !N(r.height) && !N(r.storeys)).map(r => S(r.name));
    if (unmeasured.length) {
      add('landmarks with no footprint', unmeasured.join(', '),
          'Measure the front and the side in metres and put them in width_m and depth_m, with '
          + 'bearing as the compass direction the front faces. Or set shape to "polygon" and walk '
          + 'the outline into points.');
    }
    if (flat.length) {
      add('landmarks with no height', flat.join(', '),
          'Put height_m if you know it, or count the floors into storeys.');
    }
  }

  /* VENUES WITH NO COORDINATES. § */
  {
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

  /* THE ADMIN ACCOUNT ITSELF. § */
  {
    const brand = findPerson(ADMIN_NAME);
    if (!brand) {
      add('nobody can sign in as it', 'There is no account called ' + ADMIN_NAME,
          'Run makeBrandAccount(\'0000\') from the editor with a PIN of your own choosing. '
          + 'Do it BEFORE removing admin from anybody else, or nobody can reach the controls.');
    /* `hasPin_`, NOT `S(brand.pin)`. § */
    } else if (!hasPin_(brand)) {
      add('nobody can sign in as it', ADMIN_NAME + ' has no PIN',
          'Run makeBrandAccount with one. The row exists and cannot be logged into.');
    } else if (!hasRole(brand, 'admin')) {
      add('nobody can sign in as it', ADMIN_NAME + ' is not an admin',
          'Its role cell says "' + S(brand.role) + '". Every admin control is absent for it.');
    }
    const admins = read(TAB.people).rows.filter(r => hasRole(r, 'admin') && hasPin_(r));
    if (!admins.length) {
      add('locked out', 'No account with the admin role has a PIN',
          'Nothing on the site can be edited by anybody. Fix a PIN on an admin row in the sheet.');
    }
  }

  /* Likes that have not been turned into reactions yet. Nothing reads that tab any more, so
     every row in it is a press that no longer counts anywhere. */
  const likeRows = read(TAB.post_likes).rows.filter(r => S(r.post_id)).length;
  if (likeRows) {
    add('a record is stranded', likeRows + ' like(s) are on the old post_likes tab',
        'Nothing reads them since the heart was replaced by reactions. Open the site once as an admin '
        + 'and each becomes a 👍, keeping the date it was pressed.');
  }

  /* `brand!logo_square` IS CHECKED ON THE PHONE OR NOWHERE. § */
  if (!S(logoRow && logoRow.value)) {
    add('looks unfinished', 'brand!logo_square is empty',
        'Every @family. post shows a letter in a circle instead of the mark.');
  }

  /* MONEY OWED BACK. A client who paid and then withdrew is kept on the roster marked `Withdrawn` precisely so this can find them — the seat is gone and the § */
  {
    const owed = [];
    read(TAB.jobs).rows.forEach(j => {
      const id = S(j.job_id) || String(j._row);
      if (!id) return;
      participantsOf(id).forEach(p => {
        if (S(p.status) === 'Withdrawn') {
          owed.push(p.name + ' — ' + (S(j.subject) || 'a session')
            + (S(j.weekday) ? ' on ' + S(j.weekday) : ''));
        }
      });
    });
    if (owed.length) {
      add('money to give back', owed.length + ' paid and then withdrew: ' + owed.join('; '),
          'Refund them in Stripe. They are kept on the session marked Withdrawn so this does not '
          + 'disappear — nothing else anywhere says a refund is owed.');
    }
  }

  /* ---------- THE TERM DATES, CHECKED AGAINST EACH OTHER § */
  {
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

  /* --- Stripe --- */
  if (!PropertiesService.getScriptProperties().getProperty('STRIPE_TEST_KEY')) {
    add('no money can move', 'Stripe key is not set',
        'Add STRIPE_TEST_KEY in Project Settings → Script Properties.');
  }

  return out;
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
  say('');
  say('If the site says the backend is older than it is, this number is not the question —');
  say('the DEPLOYMENT is. Deploy → Manage deployments → pencil → Version: New version.');
  say('A "New deployment" makes a NEW /exec URL, and the site still calls the old one.');
  say('');

  /* 1. WHICH TABS EXIST. A tab missing means ensureSchema_ has not run since it was added — the
     commonest cause of a feature that is built and invisible. */
  say('TABS');
  Object.keys(TAB).forEach(k => {
    /* THROUGH `sheetFor_` LIKE THE REST — otherwise the four subjects tabs and anything renamed
       are reported MISSING by the very function somebody runs to find out what is missing. */
    const at = sheetFor_(k);
    let sheet = null;
    try {
      const ss2 = SpreadsheetApp.openById(at.id);
      for (let i = 0; i < at.names.length && !sheet; i++) sheet = ss2.getSheetByName(at.names[i]);
    } catch (err) {}
    if (!sheet) { say('  ✗ ' + TAB[k] + '  MISSING — open the site once as an admin'); return; }
    const rows = Math.max(0, sheet.getLastRow() - 1);
    say('  ✓ ' + (TAB[k] + '                    ').slice(0, 16) + rows + ' row(s)');
  });

  /* 2. THE BRANDING. It listed every key of the `brand` tab and said which reactions were in use. § */
  say('');
  say('BRAND');
  say('  the brand tab is data/settings/brand.json now — open it there');
  say('  reactions in use: ' + reactionSet({}).join(' ') + '   (the six in the code)');
  say('  the name on an e-mail: ' + BRAND_NAME);

  /* 3. THE POSTS, and whether their pictures will resolve. */
  say('');
  say('POSTS');
  try {
    const rows = read(TAB.posts).rows;
    say('  ' + rows.length + ' row(s)');
    rows.slice(0, 5).forEach(r => {
      const id = (S(r.image).match(/\/d\/([\w-]+)/) || [])[1];
      say('    ' + (S(r.post_id) + '        ').slice(0, 10)
        + (id ? 'image ok' : 'IMAGE LINK NOT A DRIVE FILE')
        + '  ' + (postWhen_(r) ? fmtDate(postWhen_(r)) : 'NO DATE')
        + '  ' + (S(r.caption) || '(no caption)').slice(0, 30));
    });
    const undated = rows.filter(r => !postWhen_(r)).length;
    if (undated) say('  → ' + undated + ' post(s) have no date. They sort to the bottom of the '
      + 'feed. Press ⟳ on the site to read the dates off the files.');
  } catch (err) { say('  no posts tab — open the site once as an admin'); }

  /* 4. RESOURCES WAS HERE — ids, page counts and what could be sold on paper. § */

  /* 5. THE THINGS PEOPLE DO TO POSTS. */
  say('');
  say('ACTIVITY');
  [['post_likes', 'likes'], ['post_reactions', 'reactions'], ['post_votes', 'votes']]
    .forEach(([t, name]) => {
      try { say('  ' + (name + '           ').slice(0, 12) + read(TAB[t]).rows.length); }
      catch (err) { say('  ' + name + ': no tab — open the site once as an admin'); }
    });

  /* WHAT IT MAY DO, before anything else is guessed at. A missing scope explains a whole class
     of failure that otherwise reads as a bug in the feature it broke. */
  say('');
  say('PERMISSIONS');
  try {
    const sc = checkScopes();
    (sc.granted || []).forEach(x => say('  ' + x));
    say('  → ' + (sc.verdict || sc.error));
  } catch (err) { say('  could not check: ' + err); }

  say('');
  say('If a tab says MISSING, open the site once as an admin.');
  say('If the tabs are all there and the site still looks old, the DEPLOYMENT is old —');
  say('Deploy → New deployment, not Save.');
  return out.join('\n');
}

/* RUN THIS FROM THE EDITOR when the scan finds nothing. § */
function checkPostsFolder() {
  const log = [];
  const say = m => { log.push(m); Logger.log(m); };

  // 1. Is there an id at all, and where did it come from?
  const cfg = config();
  const raw = S(cfg.posts_folder || cfg.POSTS_FOLDER || cfg.postsFolder) || POSTS_FOLDER;
  const prop = PropertiesService.getScriptProperties().getProperty('POSTS_FOLDER_ID') || '';
  say('config posts_folder : ' + (raw || '(empty)'));
  say('script property     : ' + (prop || '(empty)'));
  if (!raw && !prop) {
    say('→ STOP. Add a row to the config tab: key `posts_folder`, value the folder id.');
    return log.join('\n');
  }

  // 2. Does that id open a folder this script can reach?
  const folder = getPostFolder();
  if (!folder) {
    say('→ STOP. That id does not open a folder. Either it is wrong, or it belongs to an '
      + 'account this script cannot see.');
    return log.join('\n');
  }
  say('folder opened       : ' + folder.getName());
  say('folder url          : ' + folder.getUrl());

  // 3. What is actually in it?
  let n = 0;
  const files = folder.getFiles();
  while (files.hasNext() && n < 40) {
    const f = files.next();
    say('  file ' + (++n) + ': ' + f.getName() + '  [' + f.getMimeType() + ']');
  }
  let subs = 0;
  const sub = folder.getFolders();
  while (sub.hasNext() && subs < 20) { subs++; say('  subfolder: ' + sub.next().getName()); }
  say('files here          : ' + n);
  say('subfolders          : ' + subs);

  if (!n && !subs) {
    say('→ The folder opened and is EMPTY. The id points at a different folder from the one '
      + 'with your pictures — check the name above against the one in Drive.');
    return log.join('\n');
  }

  // 4. Does the posts tab exist to write into?
  try {
    const t = read(TAB.posts);
    say('posts tab rows      : ' + t.rows.length);
    say('→ All four checks pass. Press the scan button on the site and it should add ' + n + '.');
  } catch (err) {
    say('→ STOP. No posts tab. Open the site once as an admin first.');
  }
  return log.join('\n');
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
      /* BINNED EVEN IF SHARING IS WHAT FAILS — `uploadsCheck_`'s rule. A sharing refusal (a Workspace
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

  /* The showcase folder is a different folder and may be shared differently, so it is checked
     separately rather than assumed to follow. */
  const showcase = folderIdFrom(config().showcase_folder_id);
  if (showcase) {
    try { out.push('Showcase folder: ' + DriveApp.getFolderById(showcase).getName()); }
    catch (err) { out.push('Showcase folder unreachable: ' + err); }
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
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (err) { return { skipped: 'another request is doing it' }; }

  const out = { version: BACKEND_VERSION };
  try {
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
  } finally {
    try { lock.releaseLock(); } catch (err2) {}
  }
}

/* ---------- ON AN ADMIN'S PAGE LOAD, WHAT USED TO BE RUN BY HAND (361) ----------
   Schema and run-once jobs (cheap when nothing is pending), and the Sunday email's hour, checked at most
   every ten minutes. Never throws. */
const SETUP_CHECK_MS = 10 * 60 * 1000;
function setupOnAdminLoad_() {
  try { autoMigrate_(); } catch (err) { Logger.log('setup: ' + err); }
  try {
    const props = PropertiesService.getScriptProperties();
    const at = Number(props.getProperty('SETUP_CHECKED_AT') || 0);
    if (Date.now() - at < SETUP_CHECK_MS) return;
    props.setProperty('SETUP_CHECKED_AT', String(Date.now()));
    try { digestKeepBooked_(); props.deleteProperty('FAILED_sunday-email-hour'); }
    catch (err) { props.setProperty('FAILED_sunday-email-hour', String((err && err.message) || err).slice(0, 300)); }
  } catch (err) { Logger.log('setup: ' + err); }
}

/* WHEN A TRIGGER RUNS, in words — Apps Script will not read a trigger's schedule back, so this is what the installers book. */
function setupTriggerWhen_(fn, hour) {
  const said = { closeFinishedJobs: 'every day, about 3am', geocodeVenues: 'every day, about 3am',
    refreshPageCounts: 'every day, about 3am', onSheetChange: 'whenever a spreadsheet is edited',
    warmAfterEdit: 'once, a minute after an edit', warmPayload: 'every 5 minutes' };
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
  MIGRATIONS.forEach(m => out.jobs.push({ id: m.id, what: m.what, ran: S(seen['MIGRATED_' + m.id]),
    error: seen['MIGRATED_' + m.id] ? '' : S(seen['FAILED_' + m.id]) }));
  if (seen['FAILED_sunday-email-hour']) {
    out.jobs.push({ id: 'sunday-email-hour', what: 'the Sunday email kept at weekly_digest_hour', ran: '',
      error: S(seen['FAILED_sunday-email-hour']) });
  }
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

/* WHERE IS EVERY TAB, AND IS IT THERE? § */
function checkTabs() {
  const out = { ok: [], EMPTY: [], MISSING: [] };
  Object.keys(SCHEMA).forEach(name => {
    const at = sheetFor_(name);
    const label = name + (at.away ? '  (' + at.away + ' → ' + at.names.join(' / ') + ')' : '');
    if (!at.id) { out.MISSING.push(label + '  — no file id'); return; }
    let sh = null;
    /* THE SAME FAULT AS `ensureSchema_` ABOVE — `at.tab` is undefined, so this found no tab for any
       name and reported the whole database missing. Same fix: the names `read` would try. */
    try {
      const ss2 = SpreadsheetApp.openById(at.id);
      for (let i = 0; i < at.names.length && !sh; i++) sh = ss2.getSheetByName(at.names[i]);
    }
    catch (err) { out.MISSING.push(label + '  — cannot open that file'); return; }
    if (!sh) { out.MISSING.push(label + '  — no such tab'); return; }
    const n = Math.max(0, sh.getLastRow() - 1);
    (n ? out.ok : out.EMPTY).push(label + '  — ' + n + ' rows');
  });
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}