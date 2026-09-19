/* ==================================================================================================
   @family. — 20_people.gs   (3 of 8)

   WHO SOMEBODY IS, and what follows from that: roles, family links, avatars, and
   who may write to whom.

   `findPerson` is the important one. Identity used to be a name, and a name is an editable cell —
   so anything that wrote to the wrong row silently merged two accounts. It matches on `person_id`
   first, and a name only as a fallback.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */


/* A person may hold SEVERAL roles — a parent who also tutors, an admin who teaches. The cell holds
   a comma list, and one role is not more real than another: every check below asks "does this
   person hold X", never "is this person an X", which is the difference that makes the second role
   work everywhere rather than only where somebody remembered it. */
function rolesOf(row) {
  const list = S(row && row.role).split(/[,\n]/).map(x => norm(x)).filter(Boolean);
  return list.length ? list : ['client'];
}
function hasRole(row, want) { return rolesOf(row).indexOf(norm(want)) !== -1; }
/* Which role the site should treat as their MAIN one when it has to pick just one — the most
   privileged they hold, so an admin who is also a parent gets the admin view. */
function mainRole(row) {
  const r = rolesOf(row);
  return ['admin', 'tutor', 'client', 'student'].find(x => r.indexOf(x) !== -1) || 'client';
}

/**
 * Find a person by ID FIRST, then by name.
 *
 * Identity used to be the name, and a name is an editable field — so anything that wrote to the
 * wrong row, or renamed somebody, silently merged two accounts and there was nothing underneath
 * to tell them apart. `person_id` never changes and is never shown, so it can't be edited into a
 * collision. Names remain how people log in; they're just no longer what the site trusts.
 *
 * TWO ARGUMENTS, because eleven handlers already call it with two: `findPerson(body.name,
 * body.personId)`. It took one, so the id was accepted and thrown away — every one of those calls
 * has been matching on the name alone, which is precisely the identity this function exists to
 * stop relying on. The id is tried first when it is given.
 */
function findPerson(nameOrId, altId) {
  const rows = read(TAB.people).rows;
  /* The id, if one was passed and it is an id rather than something else handed in by mistake —
     `myReferral` passes the whole tab object as the second argument, which must not be stringified
     into a search term. */
  const alt = (altId && typeof altId !== 'object') ? key(altId) : '';
  if (alt) {
    const byAlt = rows.find(r => key(r.person_id) === alt);
    if (byAlt) return byAlt;
  }
  const want = key(nameOrId);
  if (!want) return null;
  // An exact id match wins outright.
  const byId = rows.find(r => key(r.person_id) === want);
  if (byId) return byId;
  return rows.find(r =>
    key(r.full_name) === want ||
    key(S(r.first_name) + ' ' + S(r.last_name)) === want ||
    key(r.handle) === want ||
    key(r.username) === want) || null;
}

/** Every row that answers to this name — so a collision can be SEEN rather than silently resolved. */
function peopleNamed(name) {
  const want = key(name);
  if (!want) return [];
  return read(TAB.people).rows.filter(r =>
    key(r.person_id) === want || key(r.full_name) === want ||
    key(S(r.first_name) + ' ' + S(r.last_name)) === want ||
    key(r.handle) === want || key(r.username) === want);
}

/** Give every row a permanent id. Rows that predate this have none, which is how they were
    identified by name in the first place. Idempotent; never changes an id that exists. */
function ensurePersonIds() {
  const t = read(TAB.people);
  const c = t.headers.indexOf('person_id');
  if (c < 0) return 0;
  const last = t.sheet ? t.sheet.getLastRow() : 0;
  if (last < 2) return 0;

  /* Batched for the same reason the resources are. Fifteen people is not four hundred rows, but a
     write per row is a round trip per row whatever the count, and this runs on the first request
     after every deploy now. */
  const ids = t.sheet.getRange(2, c + 1, last - 1, 1).getValues();
  const stamp = Date.now();
  let added = 0;
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim()) continue;
    ids[i][0] = 'P' + stamp + '-' + i;
    added++;
  }
  if (added) t.sheet.getRange(2, c + 1, last - 1, 1).setValues(ids);
  clearCache();
  return added;
}

function isAdminPerson(name) {
  const p = findPerson(name);
  return !!p && hasRole(p, 'admin');
}

/* `childrenOf` read the `children` cell and nothing else. It is above, reading the family tab
   first — see the note there on why two sources became one. */

/* ---------- `countTicks` WAS HERE ----------------------------------------------------------------
   IT COUNTED A PERSON'S HANDLE across `ticks_1..3` on every document row, and it was right to: the
   version before it counted the same three column names on the PERSON'S row, which nothing has ever
   written to, so a student could work through the whole library and the total stayed 0 for ever.

   BOTH TABS ARE NOW WRONG PLACES TO LOOK. The document rows left the spreadsheet with the rest of
   `questions`, and the three tick columns were stripped out of `data/questions.json` before it was
   committed — they held the handles of real children and this repository is public. So there is
   nothing to count, and the two callers (`redeem`, and `ticks:` on the login reply) are gone rather
   than being handed a permanent zero. See dopost.gs for both. */

/**
 * WHAT THE BUSINESS IS CALLED.
 *
 * From the brand tab, with the obvious fallback — so the name on a post follows the one place it
 * is written down, and changing it is a cell rather than a search through the source.
 */
function brandName() {
  /* THE NAME CAME OFF THE `brand` TAB AND THAT TAB IS `data/settings/brand.json` NOW. The phone
     reads it; this cannot, because Apps Script has no way into a file in git. `BRAND_NAME` is the
     same string the fallback always was, in one place, so an e-mail and a post signature cannot
     disagree — and changing it is the one line in constants.gs rather than a cell. */
  return BRAND_NAME;
}

/** May this person write to that one? Roles in the SHEET's words. */
function mayMessage(fromRole, toRole) {
  const f = norm(fromRole), t = norm(toRole);
  return !!(MESSAGING[f] && MESSAGING[f][t]);
}

/** What the app calls this role. */
function toAppRole(sheetRole) {
  const r = norm(sheetRole);
  return ROLE_TO_APP[r] || r;
}

/* `toSheetRole` was here — the way back from the app's words to the sheet's, `parent` to `client`.
   Written as the pair of `toAppRole` for symmetry and never needed: values travel sheet-to-app and
   are written back by name, never translated in reverse. `ROLE_FROM_APP` stays in the constants,
   which is where the mapping belongs if it is ever wanted. */


/* ---------- WHO IS RELATED TO WHOM -------------------------------------------------------------
   Read from the `family` tab, and ONLY where the child accepted. A row that was asked and never
   answered is a request, not a relationship — treating the two the same is how a claim becomes a
   fact without anybody agreeing to it.

   ONE siblingsOf, taking a person_id. There were two: an older one reading the parent's `children`
   cell and taking a ROW, and this one taking an ID. The second overwrote the first, and the two
   callers still passing a row were handing an object to `S()` — which stringifies it to
   "[object Object]", matches nobody, and returns an empty list. Every student on the site has had
   no siblings since, silently.
--------------------------------------------------------------------------------------------- */
function acceptedLinks() {
  return read(TAB.family).rows.filter(r => norm(r.state) === 'accepted');
}

/**
 * WRITE THE FAMILIES WE ALREADY KNOW INTO THE FAMILY TAB.
 *
 * Idempotent, and careful about the one case that matters: a link that ALREADY EXISTS is left
 * exactly as it is, whatever it says. A child who refused stays refused — this is a seeder filling
 * in what nobody has answered, not a thing that overrules an answer.
 *
 * Reports what it could not match rather than skipping quietly. A name in `KNOWN_FAMILIES` that
 * matches nobody is a typo in a list I wrote by hand, and a seeder that silently does nothing is
 * the fault this whole file keeps producing.
 */
function seedFamilies() {
  const t = read(TAB.family);
  if (!t.sheet) return { error: 'no family tab — run ensureSchema()' };

  const made = [], had = [], missing = [];
  Object.keys(KNOWN_FAMILIES).forEach(parentName => {
    const parent = findPerson(parentName);
    if (!parent) { missing.push('no parent called ' + parentName); return; }

    KNOWN_FAMILIES[parentName].forEach(childName => {
      const child = findPerson(childName);
      if (!child) { missing.push('no child called ' + childName); return; }

      const already = t.rows.find(r => S(r.parent_id) === S(parent.person_id)
                                    && S(r.child_id) === S(child.person_id));
      if (already) { had.push(childName + ' → ' + parentName + ' (' + S(already.state) + ')'); return; }

      addRow(t, {
        link_id: 'F' + Date.now() + '-' + made.length,
        parent_id: S(parent.person_id),
        child_id: S(child.person_id),
        child_typed: personDisplayName(child),
        state: 'accepted',
        asked_on: new Date(),
        answered_on: new Date(),
      });
      made.push(childName + ' → ' + parentName);
    });
  });

  clearCache();
  const out = { linked: made, alreadyThere: had, couldNotFind: missing };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/**
 * A PARENT'S CHILDREN, FROM THE ONE PLACE THAT HOLDS THEM.
 *
 * This read the `children` CELL on the parent's row — a comma list of names typed by hand — while
 * `acceptedChildren` read the family tab. Two answers to one question, and they could disagree
 * without either being obviously wrong: a link accepted on the tab and a stale name in the cell,
 * or the reverse.
 *
 * The family tab wins and the cell is a FALLBACK, for a sheet that has names typed in and no links
 * made yet. Once `seedFamilies` has run there is nothing in the cell that is not on the tab, and
 * the fallback stops mattering — which is the right way for two sources to become one: the weaker
 * one goes quiet rather than being deleted out from under somebody.
 */
/* ---------- RENAMED, BECAUSE THERE WERE TWO `childrenOf` AND THIS ONE NEVER RAN -------------------
   `people.gs` DECLARED `childrenOf` TWICE — this one at line 248 taking a person ROW and returning
   NAMES, and another 34 lines below taking a parent ID and returning ROWS. Apps Script has one
   global scope, so the second silently replaced the first, and CLAUDE.md has carried "not yet
   fixed; be careful around it" ever since.

   THE TWO CALLERS WANTED DIFFERENT THINGS, which is what made it more than untidy:

     doget.gs:544    childrenOf(S(r.person_id)).map(personDisplayName)   wants the ID version
     dopost.gs:3018  out.kids = childrenOf(r)                            wants THIS one

   The second was handed a row where the survivor expects an id, so `S(parentId)` on an object
   matched nothing and `out.kids` has been an empty list for every parent signing in, for as long as
   both have existed. Nothing failed and nothing said so — the same shape as a key the backend never
   sends, which `|| []` turns into an empty database.

   NAMED FOR WHAT IT RETURNS. `childrenOf` returns people; `childNamesOf` returns names. Two
   functions one letter apart would be the same trap with a longer fuse, and the thing that
   distinguishes them is not the argument but the answer. */
function childNamesOf(personRow) {
  const linked = acceptedChildren(S(personRow && personRow.person_id)).map(personDisplayName);
  if (linked.length) return linked;
  return S(personRow && personRow.children).split(/[,\n]/).map(x => x.trim()).filter(Boolean);
}

/** The children who accepted this parent. */
function acceptedChildren(personId) {
  const ids = acceptedLinks().filter(r => S(r.parent_id) === S(personId)).map(r => S(r.child_id));
  return ids.map(id => findPerson(id)).filter(Boolean);
}

/** The parents this child accepted. */
function acceptedParents(personId) {
  const ids = acceptedLinks().filter(r => S(r.child_id) === S(personId)).map(r => S(r.parent_id));
  return ids.map(id => findPerson(id)).filter(Boolean);
}

/** Everyone who shares a parent with this child — themselves excluded. */
function siblingsOf(personId) {
  const parents = acceptedLinks().filter(r => S(r.child_id) === S(personId)).map(r => S(r.parent_id));
  const ids = [...new Set(acceptedLinks()
    .filter(r => parents.indexOf(S(r.parent_id)) !== -1 && S(r.child_id) !== S(personId))
    .map(r => S(r.child_id)))];
  return ids.map(id => findPerson(id)).filter(Boolean);
}

/* THE CHILDREN ON SOMEBODY'S ACCOUNT. The mirror of `siblingsOf`, walking the same accepted links
   the other way — parent to child rather than child to sibling.

   WRITTEN BECAUSE THE BOOKING FORM COULD ONLY EVER ASK ABOUT THE SIGNED-IN PERSON'S CHILDREN. An
   admin booking on behalf of a family was offered their OWN children, or told there were none, and
   no amount of choosing a client changed it — the question read `USER.children` and a client is not
   the user. */
function childrenOf(parentId) {
  const ids = [...new Set(acceptedLinks()
    .filter(r => S(r.parent_id) === S(parentId))
    .map(r => S(r.child_id)))];
  return ids.map(id => findPerson(id)).filter(Boolean);
}

function personDisplayName(r) {
  return S(r.full_name) || (S(r.first_name) + ' ' + S(r.last_name)).trim();
}

/**
 * WHOEVER IS ACTUALLY REACHABLE as an admin.
 *
 * ADMIN_NAME first, because it names the account these messages are addressed to. But a name is
 * an editable cell: rename the row, drop the admin role from it, or leave its email blank, and
 * every notification about a print order or a reported message goes nowhere and says nothing.
 * So if that row cannot be reached, ANY admin with an address will do — a message delivered to
 * the wrong admin is recoverable, and one delivered to nobody is not.
 */
function adminName_() {
  const named = findPerson(ADMIN_NAME);
  if (named && S(named.email) && hasRole(named, 'admin')) return personDisplayName(named);
  const other = read(TAB.people).rows.find(r => hasRole(r, 'admin') && S(r.email));
  return other ? personDisplayName(other) : ADMIN_NAME;
}

/** Send an email. Skips silently when there's no address — a missing email must not break a move. */
function notify(name, subject, body) {
  try {
    const p = findPerson(name);
    const to = p ? S(p.email) : '';
    if (!to) return false;
    MailApp.sendEmail({ to, subject, body, name: '@family.' });
    return true;
  } catch (err) {
    return false;
  }
}

/* The catalogue as the SHEET has it, falling back to the code list until the tab is seeded.
   `art_id` is what the drawing table is keyed on, so renaming an item in the sheet changes what
   it's called without changing what it looks like — the two are different questions. */
function avatarCatalogue() {
  const rows = read(TAB.shop).rows.filter(r => norm(r.kind) === 'avatar' && S(r.art_id) && S(r.slot));
  const fromShop = rows.map(r => ({
    id: S(r.art_id), slot: norm(r.slot), name: S(r.name) || S(r.art_id),
    /* ---------- `r.price` IS NOT A COLUMN OF THIS TAB --------------------------------------------
       THE SHOP TAB PRICES IN THREE CURRENCIES — `price_pence`, `price_ticks`, `price_coins` — and
       has never had a bare `price`. So `N(r.price)` was `N(undefined)`, which is 0, on every row:
       every avatar item arrived costing nothing AND flagged `free`, including the seven that carry
       a `price_coins` of 15, 20 or 30. Paid items, given away, silently.

       `price_coins` is the one, because this is the wardrobe and `find.js` renders `x.cost` as
       "credits" — the same column the shop's own price line reads first in `doget.gs`.

       `check-columns.js` COULD NOT SEE THIS: it asks whether a name is a column of ANY tab, and
       `price` is one — on `resources`, where it means something else entirely. `check-rows.js`
       asks it of the tab the row actually came from, and this was the first thing it found. */
    level: N(r.level_required) || 0, cost: N(r.price_coins) || 0,
    free: !N(r.level_required) && !N(r.price_coins), _row: r._row
  }));

  /* THE FREE ITEMS ARE ALWAYS IN, whether or not the shop knows about them.

     `seedAvatarItems` deliberately writes only the ones that cost something — a shop row for
     "Nothing" at £0 would be a shop selling the absence of a hat. Perfectly reasonable, and it
     meant that the moment the shop was seeded this function stopped returning `none`, `crop` and
     `plain` at all. Those are the DEFAULTS every figure starts in, so `saveAvatar` then refused
     every single save with "No such item: hair/crop", including from somebody changing nothing but
     their skin colour. The wardrobe worked right up until the shop existed.

     Merged rather than either-or: the shop is the authority on anything it lists, and the code
     list supplies whatever it does not. */
  const have = {};
  fromShop.forEach(x => { have[x.slot + ':' + x.id] = true; });
  const missing = AVATAR_ITEMS.filter(it => !have[norm(it.slot) + ':' + it.id])
    .map(it => ({ id: it.id, slot: norm(it.slot), name: it.name,
                  level: it.level || 0, cost: it.cost || 0,
                  free: !!it.free || (!it.level && !it.cost), _row: 0 }));

  return fromShop.concat(missing);
}

/** Everything this person may wear right now, and why. */
function avatarUnlocks(row) {
  const level = levelFromXp(N(row.xp));
  const owned = S(row.avatar_owned).split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  return avatarCatalogue().map(it => ({
    id: it.id, slot: it.slot, name: it.name,
    level: it.level || 0, cost: it.cost || 0,
    unlocked: !!it.free || (it.level && level >= it.level) || owned.indexOf(it.slot + ':' + it.id) !== -1,
    row: it._row || 0
  }));
}

/** Ten ticked topics is one level. Whole levels only — the same rule the card shows. */
function levelFromXp(xp) { return Math.floor((N(xp) || 0) / 10); }