/* ==================================================================================================
   @family. — 50_setup.gs   (6 of 8)

   BRINGING THE SHEET UP TO DATE, AND SAYING WHAT IS WRONG WITH IT.

   `ensureSchema` and `autoMigrate` run themselves on the first request after a deploy.
   `dataProblems` and `checkEverything` are the two that answer "why is this not appearing" without
   anybody having to guess.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */


/** Replace the code-owned option lists; leave every other list untouched. */
function seedOptions() {
  const t = read(TAB.options);
  if (!t.sheet) return [];
  const owned = Object.keys(OPTION_DEFAULTS);
  const keep = t.rows.filter(r => owned.indexOf(S(r.list_name)) === -1)
                     .map(r => [S(r.list_name), S(r.value), r.sort_order]);
  const rebuilt = [];
  owned.forEach(l => OPTION_DEFAULTS[l].forEach((v, i) => rebuilt.push([l, v, i + 1])));
  const all = keep.concat(rebuilt);
  t.sheet.getRange(2, 1, Math.max(t.sheet.getLastRow() - 1, all.length), 3)
    .clearContent();
  if (all.length) t.sheet.getRange(2, 1, all.length, 3).setValues(all);
  clearCache();
  return owned;
}

/** Put the wearables into the shop, once. Also labels existing rows as physical stock, since
    they predate the `kind` column and would otherwise be read as wearables with no art. */
function seedAvatarItems() {
  const t = read(TAB.shop);
  if (!t.sheet) return 0;
  if (t.rows.some(r => norm(r.kind) === 'avatar')) return 0;   // already there
  // Existing rows have no `kind`; they're physical stock, so say so before adding anything.
  t.rows.forEach(r => { if (!S(r.kind)) setCell(t, r, 'kind', 'thing'); });
  /* ---------- THREE OF THESE COLUMNS DO NOT EXIST, AND ONE OF THEM WAS THE PRICE ------------------
     IT WROTE `price`, `currency` AND `in_stock`. The shop tab has `price_pence`, `price_ticks`,
     `price_coins`, `acquire` and `active`. `addRow` reports an unknown key through `missedWrite_`,
     so this was not silent — but reported and discarded is still discarded, and the row lands with
     the cell empty either way.

     TWO OF THE THREE DID NO HARM, WHICH IS WHY IT SURVIVED. `inStock` is derived from `active`, and
     `ON_` reads an empty value as on, so nothing looked out of stock. `unit` is derived too and
     falls back to 🪙 for a wearable, so the currency still printed. Everything looked right.

     THE PRICE DID NOT SURVIVE. `price` is not a column, `price_coins` was never written, and
     `acquire` — the word that decides WHICH of the three price columns to read — was not written
     either. So `doGet` fell to `S(r.price_coins) || S(r.price_pence)`, found both empty, and sent
     `price: ''`. Every wearable seeded by this function has been priced at nothing since the shop
     and items tabs were merged. Bunches cost 15 coins in `AVATAR_ITEMS` and cost nothing in the
     shop.

     `acquire` ALSO SAYS WHICH KIND OF THING IT IS. An item with no `cost` in that list is earned by
     levelling up rather than bought — the description below has always said so — and `acquire:
     'level'` is how the payload is told to send no price at all instead of an empty one.

     ALREADY-SEEDED ROWS ARE NOT REPAIRED BY THIS. The guard two lines above returns early once any
     avatar row exists, so a sheet that has run this before keeps its empty prices and needs
     `price_coins` and `acquire` filling in by hand. Found by `node js/check-columns.js`, which
     could not run at all until its own path was fixed. */
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

/** Add any config key that's missing. Never overwrites a value you've set. */
function seedConfig() {
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
  return added;
}

function renameValue(arg) {
  const bits = String(arg || '').split('>');
  if (bits.length !== 2 || !bits[0].trim() || !bits[1].trim()) {
    return { error: 'Give it old>new, for example: English Lang.>English Language' };
  }
  const from = bits[0].trim(), to = bits[1].trim();
  /* `key`, not `norm`. `norm` lowercases and trims; it does not touch punctuation, so "English
     Lang." and "english lang" stay different to it — and those are exactly the two spellings a
     value picks up over a year of being typed into a spreadsheet by hand. `key` strips everything
     that is not a letter or a digit, which is the same comparison `findPerson` uses to decide two
     names are the same person. */
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

  /* ---------- AND THEN THE DUPLICATES IT JUST MADE ------------------------------------------
     A rename onto a name that ALREADY EXISTS is a merge, not a rename. "English Lang." becoming
     "English Language" when there is already an English Language leaves two rows saying the same
     thing — two identical entries in the subject dropdown, and two pricing rows for one subject
     where only one of them can be the multiplier that applies.

     Nothing would have thrown. The list would simply have shown the same subject twice, and the
     price would have been whichever row happened to be read first — which is the kind of fault
     that gets noticed on an invoice rather than on a screen.

     Only LIST tabs, where a row IS its value. A resource with the same subject as another resource
     is not a duplicate; it is two resources on the same subject. */
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
    kill.sort((a, b) => b._row - a._row).forEach(r => t.sheet.deleteRow(r._row));
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

/**
 * MAKE THE @family. ADMIN ACCOUNT. Run ONCE from the editor, with a PIN:
 *
 *     makeBrandAccount('4821')
 *
 * By hand this is a row with four fields that fail SILENTLY if they are wrong, which is why it is
 * a function:
 *   · `role` must be exactly `admin` — anything else and every admin control is simply absent
 *   · `pin` must be 4 to 8 digits, or verifyLogin refuses it with "Name or PIN not recognised"
 *   · `verified` must NOT read PENDING. Blank is right: blank means an account that predates
 *     email confirmation, and PENDING means one that is waiting for a link nobody will send
 *   · `listed` must be FALSE, or the business appears in the site's own list of tutors
 *
 * ONE NOTE ON THE NAME. `findPerson` compares names with everything but letters and digits
 * stripped, so "@family." and "family" are the same login. That is deliberate — nobody types
 * punctuation into a login box reliably — and it means either will get you in.
 *
 * AND ONE CONSEQUENCE WORTH HAVING. Posts made as the business are authored "@family.", and the
 * feed looks an author up in the people list to find their face. So a photo on this row becomes
 * the mark on every brand post, without brand!logo_square needing to be filled in at all.
 */
/* ---------- HOW LONG THE FIRST REQUEST AFTER A DEPLOY MAY TAKE ------------------------------------
   Everything ensureSchema does is now a handful of round trips rather than one per row, which is
   what makes it safe to run on somebody's page load. Anything added to it later has to keep that
   property: a loop calling setValue or addRow per row will be fine on this sheet and will time the
   site out on a bigger one, and the failure is an HTML error page rather than an error message.

   The rule: read a range, change the array, write the range. Once.
--------------------------------------------------------------------------------------------- */

function makeBrandAccount(pin) {
  const name = brandName();                    // whatever the brand tab says, or "@family."
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
    if (pin && /^\d{4,8}$/.test(String(pin))) { setCell(t, existing, 'pin', String(pin)); fixed.push('pin'); }
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

  /* The email is taken from whoever the admin currently is, so the notifications that used to
     reach you still reach you. Without one, every print order and every reported message is
     discarded in silence — which is what `dataProblems` already reports for nine of fifteen. */
  const someAdmin = t.rows.find(r => hasRole(r, 'admin') && S(r.email));
  const email = someAdmin ? S(someAdmin.email) : '';

  const row = addRow(t, {
    person_id: 'P' + Date.now(),
    role: 'admin',
    first_name: name, last_name: '', full_name: name,
    username: 'family', handle: name,
    pin: String(pin),
    email: email,
    /* Blank, not PENDING. An account waiting on a confirmation link nobody is going to send
       cannot log in, and the error it gives says nothing about why. */
    verified: '',
    listed: 'FALSE',
    joined_on: new Date(),
    came_from: 'the business itself',
  });
  clearCache();

  const out = { created: true, name: name, personId: row ? S(row.person_id) : '',
                email: email || '(none — add one, or notifications go nowhere)',
                loginWith: name + '  (or just "family")' };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/**
 * EVERY OLD LIKE BECOMES A 👍.
 *
 * Run ONCE from the editor. Likes and reactions were two ways of saying the same thing, and the
 * heart has gone — but a press is a press, and deleting a year of them because the control they
 * belonged to was retired would be throwing away the only record of what anybody thought of a
 * photograph.
 *
 * Idempotent, and careful about the one case that matters: somebody who liked a post AND reacted
 * to it already has an opinion on file, and that one wins. A person gets one reaction per post,
 * so overwriting theirs with a thumb would be the migration deciding they had meant something
 * else.
 */
function migrateLikes() {
  const likes = read(TAB.post_likes);
  const t = read(TAB.post_reactions);
  if (!likes.sheet || !t.sheet) return { error: 'a tab is missing — run ensureSchema()' };

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
    /* No sleep. The id carries `made`, which differs on every row, so two written in the same
       millisecond were never going to collide — the same thing that was slowing the resource ids
       down to the point of timing the request out. */
  });

  clearCache();
  const out = { turnedIntoThumbs: made, alreadyReacted: had, unusable: skipped };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/* ---------- FOUR PAPER JOBS WERE HERE, AND CLAUDE.md ALREADY SAID NOT TO RUN THEM ----------------
   `ensureResourceIds` gave every document row an id. `seedPastPapers` wrote 78 Edexcel GCSE Maths
   papers, `seedALevelPapers` 42 A-Level and AS ones, and `dropOldALevelPapers` removed eight empty
   rows before them. Between them they are most of what is in the library today, and every one of
   them appended to the `questions` tab.

   THAT TAB IS `data/questions.json` IN THIS REPOSITORY NOW, and CLAUDE.md has carried the line "do
   not seed that tab" since the real rows were found in a file that had been written off as junk. A
   seeder is the sharpest version of that warning: `sheetFor_` answers a blank id for an unrouted
   name, `read` cannot tell that from an empty tab, and `appendRow` on nothing succeeds. It would
   report "78 papers added" and add none — or worse, find a tab of that name somebody recreated and
   fill it with a second copy of a library that already exists in git.

   ADDING A PAPER IS A COMMIT NOW. One JSON object per line in `data/questions.json`, which is what
   made moving it worth doing: a diff names the rows that changed, and there is no export, no CSV,
   no File → Import, and no wondering whether it landed. */

/**
 * THE COLLIERS WOOD LANDMARKS, WRITTEN INTO THE TAB.
 *
 * Five real buildings with their surveyed outlines — every corner as OpenStreetMap holds it, not a
 * rectangle drawn round them. The `landmarks` tab has been in the schema for months with nothing in
 * it; these are the rows.
 *
 * THE OUTLINE IS THE ONLY THING THAT HAS TO BE RIGHT. `width_m`, `depth_m` and `bearing` are written
 * too, because the tab has the columns and something that cannot parse a polygon can still draw a
 * box — but they are DERIVED from the outline here, by finding the smallest rectangle that holds it.
 * Nobody types them, so nobody can type them wrong, and if the outline is ever corrected they are
 * recomputed rather than left disagreeing with it.
 *
 * WHY THAT MATTERS, in this exact case: Britannia Point is 17 storeys and 13,000 m² of TOTAL FLOOR
 * SPACE. Its footprint is a fraction of that. Those two numbers sit side by side in every description
 * of the building, and an `area` column would take whichever was typed. A polygon cannot be
 * misunderstood.
 *
 * IDEMPOTENT, BY NAME AND WORLD. Run it as often as you like: a landmark already on the tab is left
 * exactly as it is, including anything you have since corrected by hand. It adds what is missing and
 * touches nothing else.
 */
/* THERE WERE TWO OF THESE. An earlier `seedLandmarks` was already in this file, and it wrote the
   outline with SEMICOLONS between the points while `landmarks()` in 40_content splits on COMMAS —
   so every polygon would have parsed as one long unreadable point and every building would have
   fallen back to its bounding box. Nothing would have thrown; the shapes would just quietly have
   been rectangles.
   The one that survives writes commas, which is what the reader has always wanted. */
function seedLandmarks() {
  const t = read(TAB.landmarks);
  if (!t.sheet) return { error: 'no landmarks tab — run ensureSchema() first' };

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
      /* THE TAB'S OWN NAMES. These were `width_m`, `depth_m`, `height_m` and `colour`, none of
         which is a column of the landmarks tab — so `addRow` dropped all four in silence and every
         seeded landmark arrived with no size and no colour. `shape` is gone with them: there is no
         such column and nothing reads one. */
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

/**
 * WHEN EASTER IS, and it is the only date on this tab that needs arithmetic rather than a rule.
 *
 * Five of the eighteen holidays hang off it — Pancake Day is 47 days before, Mother's Day 21,
 * Good Friday 2, Easter Monday 1 after — so getting this one right gets six rows right, and
 * getting it wrong moves them all by the same amount, which looks plausible and is not.
 *
 * The anonymous Gregorian computus. Written out rather than trusted to a library, because there is
 * no library here, and checked against the years it will actually be used for: 5 April 2026 and
 * 28 March 2027.
 */
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

/** And the last one — "the last Monday in August".

    `new Date(y, month, 0)` IS THE LAST DAY OF THE MONTH BEFORE, because Date counts months from
    zero and day 0 is the day before the first. Passing 5 for May therefore landed on 30 June and
    walked back to a Monday in the WRONG MONTH — 31 May 2026 came out as the Spring bank holiday
    and it is a Sunday. `month` here is the human one, 1 for January, to match `nthDow_` beside it;
    so the last day of it is day 0 of the NEXT, which is `month` itself once Date has taken its
    zero off. */
function lastDow_(y, month, dow) {
  /* `month` is the human one — 5 is May — and Date counts from zero, so May is index 4 and the
     last day of it is day 0 of index 5. Written as the one expression rather than adjusted
     afterwards: the first attempt at this returned a Sunday for the Spring bank holiday and the
     correction moved it a month, which is what happens when an off-by-one is patched by feel
     instead of stated. */
  const d = new Date(y, month, 0);                       // last day of `month`
  while (((d.getDay() + 6) % 7) !== dow) d.setDate(d.getDate() - 1);
  return d;
}

/**
 * THE HOLIDAYS OF ONE YEAR, WRITTEN INTO THE TAB.
 *
 * Computed rather than typed, for the reason set out on the schema: ten of these move, and five of
 * them move with Easter. A list somebody types is right for one year.
 *
 * `opens_days` IS A JUDGEMENT AND IT IS PER HOLIDAY. Christmas wants six weeks to fill four seats
 * and Pancake Day wants one — a single "open a month ahead" would put a February event on the
 * screen in January and a December one up too late to fill.
 *
 * IDEMPOTENT, BY NAME AND YEAR. A row already there is left exactly as it is, including a date you
 * have moved or an `opens_days` you have changed — this fills a year in, it does not overwrite a
 * decision. Run it again next January and it adds the next year and touches nothing else.
 */
function seedHolidays(arg) {
  const t = read(TAB.holidays);
  if (!t.sheet) return { error: 'no holidays tab — run ensureSchema() first' };

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
      /* OFF BY DEFAULT, and that is deliberate. Eighteen holidays switched on is eighteen waitlists
         opening themselves at a business that runs perhaps three events a year — the tab is the
         CALENDAR, and turning one on is you deciding to run it. */
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

function ensureSchema() {
  const report = {};
  Object.keys(SCHEMA).forEach(name => {
    /* THE SAME LOOKUP `read` USES. Without it this walks the main spreadsheet, fails to find
       `boxers`, and creates a fresh empty one — so the app would read the real boxers from the
       subjects file while a decoy sat in the database looking like the real thing. */
    const at = sheetFor_(name);
    /* TWO DIFFERENT FAULTS, AND THEY NEED DIFFERENT WORDS. `sheetFor_` returns a blank id both for a
       tab routed at a file whose id is not filled in, and for a tab with no line in `WHERE` at all.
       The first is a configuration step somebody has not done yet; the second is a tab in SCHEMA
       that nothing can ever reach, and it stays invisible until something says the word `WHERE`. */
    if (!at.id) {
      report[name] = at.away === '(not in WHERE)'
        ? 'SKIPPED — no line in WHERE, so nothing can reach this tab'
        : 'skipped — the id for the ' + at.away + ' file is blank';
      return;
    }
    const ss = SpreadsheetApp.openById(at.id);
    /* ---------- `at.tab` HAS NEVER EXISTED -------------------------------------------------------
       `sheetFor_` RETURNS `id`, `names`, `make` AND `away`. There is no `tab`, and there never was —
       so this asked for `getSheetByName(undefined)`, found nothing every single time, and then
       called `insertSheet(undefined)`, which creates a sheet with a DEFAULT name. Run once against a
       full database it reported "tab created" for all forty tabs and left forty `Sheet1`-style
       sheets holding nothing but headers, while the real tabs went untouched — so the columns this
       function exists to add were never added, and the report said the opposite.

       IT LOOKS THE WAY `read` LOOKS. `at.names` is the list `read` tries in order — the code's own
       name first, then whatever the tab has been renamed to — so a tab called `items&shop` is found
       rather than duplicated. Only when none of them exists is one made, under `at.make`, which is
       the name the code asks for. */
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
      sh.getRange(1, have.length + 1, 1, missing.length).setValues([missing]);
      report[name] = 'added ' + missing.length + ' column(s): ' + missing.join(', ');
    } else {
      report[name] = 'up to date';
    }
  });
  clearCache();
  const seeded = seedConfig();
  if (seeded.length) report.config = (report.config || 'up to date') + ' | seeded: ' + seeded.join(', ');
  const idsAdded = ensurePersonIds();
  if (idsAdded) report.people = (report.people || 'up to date') + ' | gave ' + idsAdded + ' rows an id';
  const seededItems = seedAvatarItems();
  if (seededItems) report.shop = (report.shop || 'up to date') + ' | seeded ' + seededItems + ' wearables';
  const lists = seedOptions();
  if (lists.length) report.options = (report.options || 'up to date') + ' | rewrote: ' + lists.join(', ');
  clearCache();
  Logger.log(JSON.stringify(report));
  return report;
}

/* ---------- WHAT IS WRONG WITH THE DATA --------------------------------------------------------
   The health check has always reported missing COLUMNS. This reports missing SENSE — the things
   that are structurally fine and factually broken, which is most of what actually stops the site
   working.

   Every item here is something that had to be noticed by a person and told to somebody. A term
   ending before it starts, a tutor with no hours, a client with no email: none of them throws, all
   of them silently remove a feature, and each one was found by staring at a spreadsheet.
   The system knows all of it already. It should say so.

   Ordered by what it costs you: things that stop money, then things that stop contact, then
   things that are merely untidy.
--------------------------------------------------------------------------------------------- */
/* `deep` — whether to run the checks that COST SOMETHING: asking Drive whether it may write, and
   reading thirty tab headers to list missing columns. Off by default, because this function is
   called on every admin page load and both of those are round trips somebody is waiting on.
   `?health=1` turns it on, which is somebody opening the health card on purpose. */
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
    if (!S(r.full_name)) return;
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
  if (!B) {
    add('you earn nothing', 'B is 0 — you take no share of an extra seat',
        'Every hour another tutor teaches earns you £0. That is a directory, not an agency.');
  }

  /* --- the front of the app --- */
  /* A LAW WITH A COLOUR NOBODY DEFINED. `mark()` skips any law whose colour has no class, so the
     row is right, the match is right, and nothing happens — which reads as the law not working
     rather than as one misspelt word. The list here is the one in the stylesheet. */
  const KNOWN_COLOURS = ['green', 'purple', 'blue', 'blue-soft', 'red', 'amber', 'dim', 'ink'];
  read(TAB.laws).rows.forEach(r => {
    const col = norm(r.colour);
    if (!col || !ON_(r.active)) return;
    if (KNOWN_COLOURS.indexOf(col) === -1) {
      add('a law does nothing', 'A law is set to colour "' + S(r.colour) + '", which is not a '
          + 'colour the site knows',
          'Use one of: ' + KNOWN_COLOURS.join(', ') + '. The row is otherwise fine — it is '
          + 'simply skipped, so nothing is coloured and nothing says why.');
    }
  });

  /* Columns something has actually tried to write to during THIS request and could not find.
     Distinct from the schema-version check below: that says the update never ran, this says it ran
     and something is still missing — a column removed by hand, or a name that only exists in the
     code. */
  WRITE_MISSES.forEach(x => {
    add('a value went nowhere', 'Something wrote to ' + x.tab + '.' + x.field + ', which is not '
        + 'a column',
        'Run ensureSchema. Until then anything saved to that field is discarded.');
  });

  /* THE JOBS THAT RUN THEMSELVES, AND WHETHER THEY DID. Each is attempted once and never retried
     on its own, so a failure is permanent until somebody asks again — which means it has to be
     said somewhere a person looks rather than only in an execution log nobody opens. */
  {
    const seen = PropertiesService.getScriptProperties().getProperties() || {};
    if (seen.SCHEMA_VERSION !== BACKEND_VERSION) {
      /* WHICH COLUMNS, by name. "The schema has not been brought up to date" is true and gives
         nobody anything to do; a list of the columns that are not there is the whole answer. */
      /* WHICH COLUMNS — BUT NOT ON A PAGE LOAD.
         `schemaGaps` opens the spreadsheet and reads the header row of all THIRTY tabs, one round
         trip each, to say which columns are missing. That is the right answer to the question and
         it is thirty round trips added to a request somebody is waiting on.

         AND IT COULD NOT STOP. This fires when SCHEMA_VERSION does not match BACKEND_VERSION, and
         the only thing that records a match is `autoMigrate` — which no longer runs on a page load,
         because it was the previous thing making page loads slow. So the condition became permanent
         and the cost became every-admin-every-load. Two fixes that were each right on their own and
         together made a loop.

         THE HEADLINE NEEDS NO SPREADSHEET. "The sheet is behind the code" is known from two strings
         already in hand, and that is the part that tells somebody to act. WHICH columns is the
         detail, and detail is what `?health=1` is for. */
      const which = deep ? (function () {
        try {
          const gaps = schemaGaps();
          return Object.keys(gaps).map(t => t + ': ' + gaps[t].join(', ')).join(' · ');
        } catch (err) { return 'could not check: ' + err; }
      })() : '';
      add('the sheet is behind the code',
          which || ('The schema has not been brought up to date for ' + BACKEND_VERSION),
          'It runs itself on the first request after a deploy and retries a couple of minutes '
          + 'after a failure. To force it now: ?run=ensureSchema&name=…&pin=…');
    }
    MIGRATIONS.forEach(m => {
      if (seen['MIGRATED_' + m.id]) return;
      add('a one-off job has not run', m.id + ' — ' + m.what,
          'It runs itself on the next request. If it keeps saying this, that attempt failed — '
          + 'run it from the editor and read the error.');
    });
  }

  /* CAN THE DEPLOYMENT WRITE TO DRIVE? Not the editor — the deployment, which is the one that
     serves the site and the one that pins its own manifest. The two disagree exactly when a scope
     has been declared and not yet published, which is the state that produces "permissions are not
     sufficient" on a photograph somebody is trying to post right now. */
  {
    /* ---------- THIS USED TO RUN ON EVERY ADMIN PAGE LOAD ------------------------------------------
       It opens the Drive folder, CREATES A FILE IN IT and deletes it again — three round trips to
       another Google service, before the payload has been built, every single time an admin opened
       the app. Drive permission is the one thing on this project that has broken repeatedly, and a
       Drive call that hangs takes the whole request with it: the phone sits on a loading animation
       and nothing anywhere says why.

       IT IS A SETUP QUESTION, ASKED ONCE. Whether this deployment may write to Drive changes when
       somebody grants a scope and at no other time — so asking it on every load is asking a settled
       question over and over at the cost of the thing people are waiting for.

       SO IT IS ONLY ASKED WHEN THE REPORT IS ASKED FOR BY NAME: `?health=1`, or `checkEverything`
       from the editor. The ordinary admin load gets every other check in this function — the terms,
       the tutors, the venues, the pricing, the schema — and skips the one that leaves the building. */
    const folder = deep ? getPostFolder() : null;
    if (deep && !folder) {
      add('no posts can be made', 'There is no posts folder',
          'Add `posts_folder` to the config tab with the id from the folder URL.');
    } else if (deep) {
      try {
        const probe = folder.createFile('family-permission-check.txt', 'safe to delete');
        probe.setTrashed(true);
      } catch (err) {
        /* Not "no posts can be made" — the scan still works, and posting by dropping files into
           the folder is a complete route. What is lost is uploading a photograph from inside the
           app, which is one of two ways rather than the only one. */
        add('one way of posting is unavailable',
            'This deployment can read the posts folder but not write to it',
            'Posting still works: put photographs in the folder and press ⟳ on the Posts screen. '
            + 'To upload from inside the app, appsscript.json must list .../auth/drive; then run '
            + 'authoriseDrive from the editor and accept the prompt; then deploy a NEW VERSION — '
            + 'a deployed version pins its manifest, so authorising alone changes nothing.');
      }
    }
  }

  /* A PAGE-COUNT TALLY WAS HERE, and so was a second one under `printing` below. Both counted
     document rows with a Drive link and no `pages`, because a count is what prices a print. There
     are no document rows in any spreadsheet — the library is `data/questions.json` — so this check
     could only ever have reported 0 of 0, which is the most convincing kind of wrong answer. */

  /* LANDMARKS THAT HAVE NOT BEEN MEASURED. A row with a position and no size can be put on the
     map as a point and cannot be drawn as a building — which is worth saying, because the whole
     value of this tab is the measuring and a half-filled row looks finished in a spreadsheet. */
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

  /* VENUES WITH NO COORDINATES. The map places what it can and lays the rest at its edge, which
     is honest and easy to miss — so it is said here too, with the reason: a venue with no postcode
     is waiting for somebody, and one WITH a postcode and no coordinates means the geocoder has not
     managed to run. Those are different problems and only one of them is yours. */
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

  /* THE ADMIN ACCOUNT ITSELF. `adminName_()` falls back to any admin with an email, so
     notifications keep arriving — but nobody can SIGN IN as an account with no PIN, and an admin
     row that cannot be logged into is an admin nobody has. */
  {
    const brand = findPerson(ADMIN_NAME);
    if (!brand) {
      add('nobody can sign in as it', 'There is no account called ' + ADMIN_NAME,
          'Run makeBrandAccount(\'0000\') from the editor with a PIN of your own choosing. '
          + 'Do it BEFORE removing admin from anybody else, or nobody can reach the controls.');
    } else if (!S(brand.pin)) {
      add('nobody can sign in as it', ADMIN_NAME + ' has no PIN',
          'Run makeBrandAccount with one. The row exists and cannot be logged into.');
    } else if (!hasRole(brand, 'admin')) {
      add('nobody can sign in as it', ADMIN_NAME + ' is not an admin',
          'Its role cell says "' + S(brand.role) + '". Every admin control is absent for it.');
    }
    const admins = read(TAB.people).rows.filter(r => hasRole(r, 'admin') && S(r.pin));
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
        'Nothing reads them since the heart was replaced by reactions. Run migrateLikes() from '
        + 'the editor and each becomes a 👍, keeping the date it was pressed.');
  }

  const logoRow = read(TAB.brand).rows.find(r => S(r.key) === 'logo_square');
  if (!S(logoRow && logoRow.value)) {
    add('looks unfinished', 'brand!logo_square is empty',
        'Every @family. post shows a letter in a circle instead of the mark.');
  }

  /* MONEY OWED BACK. A client who paid and then withdrew is kept on the roster marked `Withdrawn`
     precisely so this can find them — the seat is gone and the payment is not, and a refund is a
     thing a person has to do. Nothing else in this system will ever mention it: the job reads
     cancelled, the card shows nobody coming, and the only other trace is a Confirm in the events
     tab that nothing reads. */
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

  /* ---------- THE TERM DATES, CHECKED AGAINST EACH OTHER ------------------------------------------
     A TERM WITH BAD DATES SAT IN THE SHEET AND NOTHING SAID SO. `termWindow` already computes a
     `dateFault` when a term ends before it starts, and it is sent to the phone — where it is used
     to grey out a booking, which is the right thing to do with it and no help at all if you are
     trying to find out WHY nothing can be booked.

     THREE FAULTS, because they fail in three different ways and a report that lumps them together
     tells you nothing about which to fix:

       BACKWARDS   ends before it starts. Every calculation of length comes out negative.
       OVERLAPPING two terms covering the same day, so a booking can be in both at once.
       A GAP       days belonging to no term, where a booking has no term to be in.

     Overlaps and gaps need the rows compared to each other, which is why nothing found them: every
     check up to now looked at one row at a time, and neither fault exists in a single row. */
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

      /* ---------- AND WHAT IS MISSING, AGAINST THE COMPUTED YEAR --------------------------------
         THE CHECKS ABOVE ONLY SEE ROWS THAT EXIST. A year with two terms entered and ten missing
         passes every one of them — nothing is backwards, nothing overlaps — and is useless, because
         a booking in March has no term to sit in.
         `termsFor` fills a year in from the rules, so comparing against it says which rows are
         absent rather than only whether the ones present are sane. */
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

/**
 * RUN THIS FROM THE EDITOR when anything is not appearing.
 *
 * `checkEverything` — pick it from the dropdown, press Run, and paste the log.
 *
 * It exists because guessing has cost several rounds: is the backend deployed, does the tab exist,
 * is the row filled in, is the site old? Each of those looks identical from the outside — the
 * thing you wanted simply is not there.
 *
 * This answers all of them in one run.
 */
function checkEverything() {
  const out = [];
  const say = m => { out.push(m); Logger.log(m); };

  say('backend version   : ' + BACKEND_VERSION);
  /* WHICH SHEET. "I changed the cell and nothing happened" is answered here more often than
     anywhere else — two spreadsheets open in two tabs is the easiest mistake in this whole
     system to make, and from the outside it is indistinguishable from a broken feature. */
  Object.keys(FILES).forEach(which => {
    const id = String(FILES[which] || '');
    say((which + ' id').padEnd(18) + ': ' + (id || 'NOT SET'));
    if (!id) return;
    /* THE NAME IS THE CHECK, not decoration. Opening it proves the id is a Google Sheet rather than
       an .xlsx upload — the fault that made every section load empty, and that no amount of reading
       the id could have caught, because both files have the same title and the same owner. */
    try {
      say((which + ' name').padEnd(18) + ': ' + SpreadsheetApp.openById(id).getName());
    } catch (err) { say((which + ' name').padEnd(18) + ': CANNOT OPEN IT — ' + err); }
  });
  say('');
  say('If the site says the backend is older than it is, this number is not the question —');
  say('the DEPLOYMENT is. Deploy → Manage deployments → pencil → Version: New version.');
  say('A "New deployment" makes a NEW /exec URL, and the site still calls the old one.');
  say('');

  /* 1. WHICH TABS EXIST. A tab missing means ensureSchema has not run since it was added — the
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
    if (!sheet) { say('  ✗ ' + TAB[k] + '  MISSING — run ensureSchema()'); return; }
    const rows = Math.max(0, sheet.getLastRow() - 1);
    say('  ✓ ' + (TAB[k] + '                    ').slice(0, 16) + rows + ' row(s)');
  });

  /* 2. THE BRANDING, which decides the logo AND whether any post offers a reaction. */
  say('');
  say('BRAND');
  try {
    const rows = read(TAB.brand).rows;
    if (!rows.length) say('  (empty — the logo will fall back to a letter and no post will '
      + 'offer a reaction)');
    rows.forEach(r => {
      const v = S(r.value);
      say('  ' + (S(r.key) + '              ').slice(0, 14)
        + (v ? v.slice(0, 60) : '(blank)'));
    });
    const re = rows.find(r => S(r.key) === 'reactions');
    say('  reactions in use: ' + reactionSet({}).join(' ')
      + (S(re && re.value) ? '   (from the brand tab)' : '   (the six in the code — the cell is '
        + 'empty, which is fine)'));
  } catch (err) { say('  no brand tab — run ensureSchema()'); }

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
  } catch (err) { say('  no posts tab — run ensureSchema()'); }

  /* 4. RESOURCES WAS HERE — ids, page counts and what could be sold on paper. This report reads
     spreadsheets, and the library is not one: `data/questions.json` in this repository is where the
     642 documents and 3,271 questions live, and `node js/check-rows.js` is what inspects it. */

  /* 5. THE THINGS PEOPLE DO TO POSTS. */
  say('');
  say('ACTIVITY');
  [['post_likes', 'likes'], ['post_reactions', 'reactions'], ['post_votes', 'votes']]
    .forEach(([t, name]) => {
      try { say('  ' + (name + '           ').slice(0, 12) + read(TAB[t]).rows.length); }
      catch (err) { say('  ' + name + ': no tab — run ensureSchema()'); }
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
  say('If a tab says MISSING, run ensureSchema().');
  say('If the tabs are all there and the site still looks old, the DEPLOYMENT is old —');
  say('Deploy → New deployment, not Save.');
  return out.join('\n');
}

/**
 * RUN THIS FROM THE EDITOR when the scan finds nothing.
 *
 * Pick `checkPostsFolder` from the dropdown, press Run, and read the log. It answers the four
 * questions in order, and stops at the first one that fails — so the answer is the last line
 * rather than something to interpret.
 *
 * It goes through the editor rather than the site on purpose: no deployment, no permissions, no
 * caching, no web layer. Whatever it says is the truth about the folder itself.
 */
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
    say('→ STOP. No posts tab. Run ensureSchema() first.');
  }
  return log.join('\n');
}


/**
 * Install the background jobs. Run ONCE from the editor (or load /exec?triggers=1).
 *
 * Deliberately not on page load: reading a PDF takes a second or two, so even two per visit would
 * put seconds back onto a page that was already slow enough to time out once. A trigger does the
 * same work with nobody waiting on it.
 *
 * Idempotent — existing triggers for these functions are cleared first, so running it twice leaves
 * one of each rather than two.
 */
function installTriggers() {
  /* `geocodeVenues` is here so a postcode typed on Tuesday is placed on Tuesday night without
     anybody being told to go and run something. It costs one request and does nothing at all when
     every venue is already placed, which is almost every night. */
  /* `refreshPageCounts` WAS THE THIRD. It read PDFs out of Drive to price a print and wrote the
     number into a document row; there is no document row. It is still NAMED here so that a project
     which has already installed the old trigger has it deleted rather than left running nightly
     against a function that no longer exists. */
  const wanted = ['refreshPageCounts', 'closeFinishedJobs', 'geocodeVenues'];
  ScriptApp.getProjectTriggers().forEach(tr => {
    if (wanted.indexOf(tr.getHandlerFunction()) !== -1) ScriptApp.deleteTrigger(tr);
  });
  // 3am: after midnight so "today" is settled for the date comparisons, and long before anyone
  // is using the site.
  ScriptApp.newTrigger('closeFinishedJobs').timeBased().everyDays(1).atHour(3).create();
  ScriptApp.newTrigger('geocodeVenues').timeBased().everyDays(1).atHour(3).create();

  /* ---------- AND THE ONE THAT DECIDES WHETHER THE SPREADSHEET IS THE SITE -----------------------
     `installSheetWatch` WAS "run once, by hand, after deploying", which is a sentence in a comment,
     and a sentence in a comment is not a thing that has happened. The evidence that it never did is
     the fault itself: an edit typed into a tab took up to six hours to appear on the site, because
     nothing retired the stored payload except a write made through the app.

     A SETUP STEP YOU HAVE TO REMEMBER IS A SETUP STEP THAT IS SOMETIMES SKIPPED, and this one is
     skipped silently and looks exactly like the sheet not being wired to the site at all. So
     `/exec?triggers=1` now does it.

     REPORTED, NOT ASSUMED. It returns what actually happened, because a watch that could not be
     installed — the account cannot open the subjects file, the trigger quota is full — must not be
     reported as installed by a function that only tried. */
  const watch = (function () {
    try { return installSheetWatch(); }
    catch (err) { return { error: String(err && err.message || err) }; }
  })();

  /* ---------- AND `installWarmTrigger` IS DELIBERATELY NOT CALLED HERE ----------------------------
     IT WOULD EXHAUST THE ACCOUNT'S SCRIPT TIME AND TAKE THE NIGHTLY JOBS DOWN WITH IT. Every five
     minutes is 288 runs a day; each one waits on a payload build, which is about thirty-five
     seconds for the anonymous copy and another for each admin. That is five hours of script time a
     day against a daily allowance of ninety minutes — so the warmer would spend the budget before
     lunch and everything scheduled after that, `closeFinishedJobs` included, would simply not run.
     A speed measure that stops the site's own maintenance is not a speed measure.

     AND IT IS NO LONGER THE THING THAT KEEPS EDITS FAST. It existed to cover the moment the stored
     copy expires; `warmAfterEdit` now covers the moment it actually matters — a minute after you
     stop typing — and costs nothing on a day nobody edits anything. Polling every five minutes to
     notice a change the spreadsheet can simply tell us about is the arrangement this replaces.

     STILL THERE TO RUN BY HAND if a day ever comes where the six-hourly expiry is worth paying for.
     `?run=installWarmTrigger&name=…&pin=…`, and read the paragraph above first. */

  const out = { installed: wanted, when: 'daily, about 3am', sheetWatch: watch,
                warm: 'not installed on purpose — see the note in installTriggers' };
  Logger.log(JSON.stringify(out));
  return out;
}

/** What's currently scheduled, so you can see it rather than assume it. */
function listTriggers() {
  return ScriptApp.getProjectTriggers().map(tr => tr.getHandlerFunction());
}

/**
 * WHAT THIS DEPLOYMENT IS ACTUALLY ALLOWED TO DO.
 *
 * Not what the manifest asks for — what the token in its hand was granted. Those are different
 * things and the difference is invisible from every other angle: the manifest can list Drive, the
 * editor can be authorised, and the running deployment can still hold a token issued before any of
 * that, which produces "permissions are not sufficient" from code that looks entirely correct.
 *
 * Google will list a token's scopes if you ask it, so this stops being a matter of retracing four
 * steps and becomes a matter of reading a list.
 *
 *     /exec?run=checkScopes&name=…&pin=…
 *
 * A scope that is missing here is missing FOR THE THING SERVING THE SITE, whatever the editor says.
 */
function checkScopes() {
  const want = {
    'spreadsheets': 'the database — every read and write',
    'drive': 'creating and sharing post photographs',
    'script.send_mail': 'notifications',
    'script.external_request': 'Stripe, and this check itself',
    'script.scriptapp': 'the nightly triggers',
  };

  let held = [];
  try {
    const res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?access_token='
        + encodeURIComponent(ScriptApp.getOAuthToken()),
      { muteHttpExceptions: true });
    const d = JSON.parse(res.getContentText() || '{}');
    held = String(d.scope || '').split(/\s+/).filter(Boolean);
  } catch (err) {
    return { error: 'Could not ask Google what this token holds: ' + err,
             hint: 'If that mentions permissions, script.external_request is missing too — which '
                 + 'means the manifest has not reached this deployment at all.' };
  }

  const has = name => held.some(x => x.indexOf('/auth/' + name) !== -1
    || (name === 'drive' && /\/auth\/drive$/.test(x)));

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

/**
 * RUN THIS ONCE FROM THE EDITOR to grant Drive access, and to prove it.
 *
 * A deployment cannot raise the consent screen itself — that has to be a manual run — which is why
 * a redeploy alone never fixes a permission.
 *
 * IT WRITES, not just reads. The previous version only listed the folder, so it reported success
 * on a token that could read and not create — and the first anybody knew was "Specified
 * permissions are not sufficient to call DriveApp.Folder.createFile" while trying to post a
 * photograph. Read access is not write access, and a check that only reads is a check that passes
 * in exactly the case you need it to fail.
 *
 * The test file is created and deleted again, so nothing is left behind.
 */
function authoriseDrive() {
  const out = [];
  const folder = getPostFolder();
  if (!folder) {
    return 'No posts folder — add `posts_folder` to the config tab first, then run this again.';
  }
  out.push('Folder: ' + folder.getName());

  let n = 0;
  const it = folder.getFiles();
  while (it.hasNext() && n < 500) { it.next(); n++; }
  out.push('Can read: ' + n + ' file(s) in it.');

  try {
    const probe = folder.createFile('family-permission-check.txt',
      'Written by authoriseDrive to confirm the script may create files. Safe to delete.');
    probe.setTrashed(true);
    out.push('Can write: yes — a test file was created and removed.');
  } catch (err) {
    out.push('CANNOT WRITE: ' + err);
    out.push('Open appsscript.json and check it lists https://www.googleapis.com/auth/drive,');
    out.push('then run this again and accept the prompt.');
  }

  /* The showcase folder is a different folder and may be shared differently, so it is checked
     separately rather than assumed to follow. */
  const showcase = folderIdFrom(config().showcase_folder_id);
  if (showcase) {
    try { out.push('Showcase folder: ' + DriveApp.getFolderById(showcase).getName()); }
    catch (err) { out.push('Showcase folder unreachable: ' + err); }
  }

  const msg = out.join('\n');
  Logger.log(msg);
  return msg;
}

/**
 * EVERYTHING THE SHEET NEEDS, WITHOUT ANYBODY REMEMBERING ANYTHING.
 *
 * Deploying is the whole procedure now. The first request afterwards brings the columns up to date
 * if the version moved, and runs any named job that has never run. Every request after that is one
 * properties read and nothing else.
 *
 * ONE READ for both questions. `getProperties()` returns the lot, so asking whether the schema is
 * current and whether four migrations have run costs the same as asking either on its own.
 */
/**
 * WHICH COLUMNS ARE STILL MISSING, tab by tab.
 *
 * The one question that decides whether the schema is actually up to date — and nothing was asking
 * it. `ensureSchema` returned a report of what it MEANT to do, and `autoMigrate` recorded the
 * version whether or not any of it landed.
 */
function schemaGaps() {
  const gaps = {};
  Object.keys(SCHEMA).forEach(name => {
    /* ---------- THE SAME LOOKUP AS EVERYWHERE ELSE, FOR THE THIRD TIME ---------------------------
       THIS OPENED THE MAIN SPREADSHEET AND ASKED FOR THE TAB BY THE CODE'S OWN NAME. Two whole
       classes of tab can never be found that way: the four that live in the subjects file, and any
       that has been renamed — `items&shop` is both a merge and a rename.

       AND IT IS NOT ONLY A WRONG REPORT. `autoMigrate` records `SCHEMA_VERSION` only when this
       comes back EMPTY, so a tab it structurally cannot see means the version is never recorded,
       which means the schema is judged stale on the next request, which means `ensureSchema` runs
       again — every two minutes, for ever, on somebody's page load. A broken check here is not a
       missing check; it is a loop. */
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

function autoMigrate() {
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
  /* A JOB THAT KEEPS FAILING MUST NOT KEEP TRYING ON EVERY PAGE LOAD.
     A `retry: true` migration is recorded only if it SUCCEEDS — which is right, because the thing
     stopping it may be one authorisation prompt away. But nothing paced it: unlike the schema
     check just above, there was no attempt marker, so one that could never succeed ran again on
     every single request, for every visitor, for ever. `venue-coordinates` throws outright when
     the geocoder cannot reach the network, and that is a failed fetch on every page load with
     somebody watching a loading screen.

     The same two minutes the schema uses. Long enough that a broken job cannot make the site slow,
     short enough that a fix lands on the next cup of tea rather than the next deploy. */
  const pending = MIGRATIONS.filter(m => {
    if (seen['MIGRATED_' + m.id]) return false;
    const tried = Number(seen['TRIED_' + m.id] || 0);
    return !tried || (Date.now() - tried > 120000);
  });
  if (!schemaStale && !pending.length) return null;

  /* One at a time. Two people opening the site in the same second after a deploy would otherwise
     both run it, and both would be adding the same columns to the same tabs — or, worse, both
     turning the same likes into reactions. Ten seconds is long enough to finish and short enough
     that a stuck lock cannot hold a page hostage. */
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (err) { return { skipped: 'another request is doing it' }; }

  const out = { version: BACKEND_VERSION };
  try {
    /* MARKED BEFORE THE WORK, every time. If something throws — a tab renamed, a permission
       withdrawn — marking afterwards would mean every single request retried and failed, and the
       site would be permanently slow for a reason nobody could see. One attempt each; a failure is
       reported in `health`, and `?run=` retries it deliberately. */
    if (schemaStale) {
      /* MARKED ONLY IF IT WORKED, and "worked" is checked rather than assumed.
         It used to be marked BEFORE the work — which stops a failing migration retrying on every
         request and making the site permanently slow, and which also records a failure as a
         success. `dataProblems` then reported the schema as current, so three columns that never
         appeared looked exactly like three columns that did.
         So: run it, then go and LOOK. Every column of every tab, against the sheet. */
      try {
        out.schema = ensureSchema();
        const gaps = schemaGaps();
        if (Object.keys(gaps).length) {
          out.stillMissing = gaps;
          /* Not recorded, so the next request tries again — but only after a pause, which is what
             the attempt marker is for. A retry on every request is the fault the old design was
             avoiding, and it was avoiding it by lying. */
          props.setProperty('SCHEMA_TRIED', BACKEND_VERSION + '@' + Date.now());
        } else {
          props.setProperty('SCHEMA_VERSION', BACKEND_VERSION);
          props.deleteProperty('SCHEMA_TRIED');
        }
      } catch (err) {
        out.schemaError = String((err && err.message) || err);
        props.setProperty('SCHEMA_TRIED', BACKEND_VERSION + '@' + Date.now());
      }
    }

    out.ran = [];
    pending.forEach(m => {
      /* RECORDED BEFORE IT RUNS, which is right for a rename: one attempt per deploy, so a job
         that throws halfway cannot be re-run over its own half-finished work.
         WRONG FOR ANYTHING THAT NEEDS THE NETWORK. A migration that failed because a scope had not
         been granted yet was marked complete on the way in and never tried again — the fault was
         one authorisation prompt away and the only cure was a URL nobody knew to run.
         `retry: true` says this one may be attempted again: it is recorded only if it SUCCEEDS,
         and a job that is safe to repeat is the only kind that may say so. */
      if (!m.retry) props.setProperty('MIGRATED_' + m.id, new Date().toISOString());
      try {
        out.ran.push({ id: m.id, what: m.what, result: m.run() });
        if (m.retry) props.setProperty('MIGRATED_' + m.id, new Date().toISOString());
        props.deleteProperty('TRIED_' + m.id);
      } catch (err) {
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

/* ==================================================================================================
   WHERE IS EVERY TAB, AND IS IT THERE?

   The tabs are spread across three spreadsheets, which means several ways for things to go quietly
   wrong: a blank id in FILES, a tab with no line in WHERE, a renamed tab, a file moved to another
   Drive account, an id pointing at an .xlsx upload rather than a Google Sheet. None of those throw.
   They all just make a section empty, and an empty section looks exactly like a section nobody has
   put anything in yet.

   `check-tabs.js` asks the half of this that can be answered from the source alone, before a
   deploy. This is the other half — it needs the documents open, so it can only run in here.

   So this asks the question directly. Run it after moving anything.
================================================================================================== */
function checkTabs() {
  const out = { ok: [], EMPTY: [], MISSING: [] };
  Object.keys(SCHEMA).forEach(name => {
    const at = sheetFor_(name);
    const label = name + (at.away ? '  (' + at.away + ' → ' + at.names.join(' / ') + ')' : '');
    if (!at.id) { out.MISSING.push(label + '  — no file id'); return; }
    let sh = null;
    /* THE SAME FAULT AS `ensureSchema` ABOVE — `at.tab` is undefined, so this found no tab for any
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