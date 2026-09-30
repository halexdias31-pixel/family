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

/* The other half of that cell: the values that are TITLES rather than roles. `mainRole` picks from
   a declared list and cannot return one of these, and `hasRole` is only ever asked about a role
   somebody named — so without this they reach no screen at all, which is a fact typed into the
   sheet that nothing draws. Read off `ROLE_TITLES` rather than "anything mainRole did not pick",
   because that second rule would print a typo in the role cell as somebody's job title. */
function titlesOf(row) {
  return rolesOf(row).map(x => ROLE_TITLES[x]).filter(Boolean);
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
  /* ---------- AND AN E-MAIL ADDRESS, MATCHED AS AN ADDRESS RATHER THAN AS A NAME ------------------
     ASKED FOR AS *"i want people to be able to sign in with email as well."* (`verifyLogin` has
     since stopped calling this at all — it reads the `email` column alone; see there. The rung
     stays, because every other caller of this function may be handed an address.) `verifyLogin` resolved
     through this function and nothing else, so one rung here was the whole of it — and it is the
     last rung, after every name, so nothing that used to resolve can start resolving to somebody
     different.

     `norm` RATHER THAN `key`, AND THAT IS NOT TIDINESS. `key` strips everything that is not a letter
     or a digit, so `alex@dias.com` reduces to `alexdiascom` — and so does a person whose full name
     is "Alex Dias Com". Two different people, one key, and `changePin` then checks the PIN somebody
     typed against the other one's row: the denial this file already records happening once, for
     real, to one person. An address is a machine identifier rather than a name typed with variable
     spacing, so it is compared whole, case-folded and trimmed, and the `@` it must contain is what
     makes that collision impossible rather than merely unlikely.

     A BLANK CELL IS NOT A MATCH. Most rows on this tab have no e-mail; without the guard the first
     of them would answer to an empty search term, which `want` above already refuses — but `norm`
     is a different fold and would not. */
  const mail = norm(nameOrId);
  return rows.find(r =>
    key(S(r.first_name) + ' ' + S(r.last_name)) === want ||
    key(r.handle) === want ||
    (mail.indexOf('@') !== -1 && norm(r.email) === mail)) || null;
}

/* ==================================================================================================
   AN E-MAIL ADDRESS THAT ALREADY ANSWERS TO SOMEBODY ELSE.

   THE MOMENT AN ADDRESS CAN SIGN YOU IN, IT IS A CREDENTIAL, and two rows holding one is the
   `findPerson` denial with a new column in front of it: the first row wins, so the second person
   types their own address and their own PIN and is told the PIN is wrong — confidently, about the
   one thing they are certain of, with no way to argue. That happened once already, by accident,
   because a call forgot to send an id.

   BESIDE `handleRefusal` AND `pricingRefusal_` SO THAT SOMETHING CAN RUN IT. Written inline in
   `updateProfile` it is four lines nothing here can reach, and a rule with no check is the shape
   this repository records every time an instrument could not see its subject. Same three arguments,
   same sentence-not-a-boolean, same reason: "that is taken" is the only useful part.

   NOT A FORMAT CHECK. The box already refuses a shape the browser will not accept, and a stricter
   rule here would refuse real addresses — which is the failure this repository calls the worse of
   the two everywhere it marks an answer. This asks one question: does anybody else already answer
   to it. */
function emailRefusal_(want, me) {
  const mail = norm(want);
  if (!mail) return '';                       // clearing your address is not taking anybody's
  const mine = me ? key(me.person_id) : '';
  const clash = read(TAB.people).rows.some(r => {
    if (mine && key(r.person_id) === mine) return false;      // your own row is not a clash
    return !!norm(r.email) && norm(r.email) === mail;
  });
  return clash ? 'That e-mail address is already on another account.' : '';
}

/* ==================================================================================================
   ONE FUNCTION THAT SAYS WHY A HANDLE IS REFUSED, OR NOTHING AT ALL.

   IT RETURNS A SENTENCE, NOT A BOOLEAN, and that is the whole shape. A handler that gets `false`
   back has to invent a reason, and the reason is the only useful part: "that is taken" and "you
   changed it a fortnight ago" and "no, not that word" are three completely different things to be
   told, and a person given the wrong one argues with the wrong thing.

   THE PHONE DOES NOT REPEAT ANY OF THIS. `MESSAGING` records the argument and it is the same here:
   a rule written twice is two rules to keep in step, and the sheet shows the server's own sentence,
   which already says what to do instead. The form checks nothing but "is the box empty".
================================================================================================== */

/* WHAT A HANDLE MEANS RATHER THAN HOW IT IS SPELLED. Case, separators and the digits people
   substitute for letters all come out, so `F_4_G` and `fag` are one string before anything is
   compared. Leaving `0`→`o` and the rest in place would make the blocklist a list of spellings
   rather than a list of words, and a spelling is trivially worked around. */
function handleFold_(v) {
  return String(v == null ? '' : v).toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a')
    .replace(/5/g, 's').replace(/7/g, 't').replace(/8/g, 'b').replace(/9/g, 'g');
}

/**
 * Why `want` may not be this person's handle — '' when it may.
 * `me` is their row. Pass `isAdmin` true to skip the cooldown only.
 */
function handleTrouble_(want, me, isAdmin) {
  /* ---------- TWO FORMS, AND WHICH ONE EACH LINE BELOW USES IS THE WHOLE OF IT -------------------
     `shown` IS WHAT THEY TYPED and is the only thing quoted back; `raw` is it folded, and every
     comparison in this function uses that. `changeHandle` stores `shown`, so a person keeps the
     case they chose — and because nothing here compares on it, `HaLeX` is still refused when
     `halex` exists, which is the guard that stops two accounts rendering identically on a site
     children use. See the long note in `dopost.gs` over the line that stopped lower-casing.

     A REFUSAL THAT QUOTES THE FOLDED FORM IS A REFUSAL ABOUT A STRING NOBODY TYPED. Told `"halex"
     is taken` after typing `HaLeX`, a person reasonably tries the capitals again. */
  const shown = String(want == null ? '' : want).trim();
  const raw = shown.toLowerCase();
  if (!raw) return 'Type the name you want.';
  if (!HANDLE_SHAPE.test(raw)) {
    return 'A handle is 3 to 20 characters, starts with a letter, and holds only letters, '
         + 'numbers and underscores.';
  }

  const folded = handleFold_(raw);

  if (HANDLE_RESERVED.indexOf(raw) !== -1 || HANDLE_RESERVED.indexOf(folded) !== -1) {
    return '"' + shown + '" is kept for the school\'s own accounts.';
  }

  /* THE ALLOW LIST IS CHECKED FIRST, or `analysis` never gets the chance. A handle that IS one of
     these words, or is one of them with digits or underscores around it, is past the blocklist —
     but `analfun` is not, because it is not that word with decoration, it is a different word. */
  /* ---------- AND THE FIRST VERSION OF THIS LINE LET EVERY BANNED WORD THROUGH -------------------
     IT TESTED THE END WITH `folded.lastIndexOf(w) === folded.length - w.length`, and `lastIndexOf`
     answers -1 when the word is not there. So any handle exactly one character SHORTER than some
     allowed word made -1 === -1 and was waved past: `fuckface` is eight characters, `therapist` is
     nine, and that is the whole of it. Thirteen of the checked cases failed at once — `n1gg3r`
     included — on a rule that reads perfectly and is wrong by an off-by-one in a sentinel value.

     `check-handles.js` FOUND IT ON ITS FIRST RUN, which is the entire argument for writing the
     check before trusting the filter. Nothing about the behaviour was visible from reading it. */
  const innocent = Object.keys(HANDLE_ALLOWED).some(w =>
    folded === w || folded.startsWith(w) || folded.endsWith(w));
  if (!innocent) {
    for (let i = 0; i < HANDLE_BLOCKED.length; i++) {
      if (folded.indexOf(HANDLE_BLOCKED[i]) !== -1) {
        /* THE WORD IS NOT QUOTED BACK. Naming it is repeating it, on a site children read, and the
           person typing it already knows which one it was. */
        return 'That handle has a word in it we do not allow. Pick another.';
      }
    }
  }

  /* ---------- TAKEN, AND AGAINST ALL THREE COLUMNS -----------------------------------------------
     `findPerson` matches `first + last` and `handle`, first row wins — so
     checking `handle` alone would let somebody take a name that already resolves to another person,
     and `changePin` would then check their PIN against that person's row. Everything `findPerson`
     can answer to, this refuses. */
  const mine = me ? key(me.person_id) : '';
  const clash = read(TAB.people).rows.some(r => {
    if (mine && key(r.person_id) === mine) return false;       // your own row is not a clash
    return key(r.handle) === key(raw)
        || key(S(r.first_name) + ' ' + S(r.last_name)) === key(raw);
  });
  if (clash) return '"' + shown + '" is taken.';

  /* ---------- A MONTH SINCE THE LAST ONE ----------------------------------------------------------
     Read off `handle_changed_at` rather than counted, so there is one piece of state and nothing to
     keep in step. A row that has never changed has no cell and is free. */
  if (!isAdmin && me) {
    const last = sheetDate(me.handle_changed_at);
    if (last) {
      const day = 864e5;
      const next = new Date(last.getTime() + HANDLE_COOLDOWN_DAYS * day);
      if (next > new Date()) {
        return 'You changed your handle on ' + fmtDate(last) + '. You can change it again on '
             + fmtDate(next) + '.';
      }
    }
  }

  return '';
}

/* ==================================================================================================
   AND A HANDLE IS GENERATED RATHER THAN DERIVED FROM A CHILD'S NAME.

   ASKED FOR AS *"each person should have randomly generated username, handle llik \"@_____\",
   email, first name, last name and username."*

   MEASURED FIRST, AND TWO THINGS WERE WRONG. `register` wrote
   `username: S(first + last).replace(/[^A-Za-z0-9]/g, '')` and **no `handle` at all** — so every
   account made through the form has a blank handle to this day, and `doGet`'s
   `handle || username || first_name` has been showing the squashed name instead.

   AND THAT USERNAME COLLIDES, WHICH IS NOT A TIDINESS FAULT. Two people called John Smith both get
   `JohnSmith`. `findPerson` matches `username` and returns the FIRST row, so the second person
   signs in as the first — and `changePin` then checks the PIN they typed against the other one's
   row and tells them their own PIN is wrong. This file records that denial happening for real, to
   one person, by accident. Nothing guarded it: `handleTrouble_` guards `changeHandle` and was never
   reached by registration.

   WORDS RATHER THAN THE NAME, AND THAT IS THE SAFEGUARDING HALF. Most of the people on this tab are
   children. A handle built from a real child's full name publishes that name wherever the handle is
   shown — which is exactly what made `ticks_1/2/3` a leak rather than untidiness, and CLAUDE.md
   carries that entry in full. `BrightOtter42` is memorable, sayable down a phone, and says nothing
   about whose it is.

   NAME-PLUS-A-RANDOM-TAIL WAS THE OTHER CANDIDATE AND IT LOSES ON THAT ONE POINT ALONE. It is
   friendlier (`halexdias_4b` is guessable by its owner) and it still prints the child's name. The
   ask said randomly generated; the privacy argument says the same thing, so there is nothing to
   trade.

   `handleTrouble_` IS THE ONE GATE AND THIS GOES THROUGH IT. Shape, the reserved list, the
   blocklist and the clash against all four columns `findPerson` answers to — a generator with its
   own copy of any of that is the second reader this repository keeps finding. It is handed
   `isAdmin: true` so the month's cooldown is skipped: that rule is a brake on somebody changing
   their mind, and a row being GIVEN its first handle has not changed anything.

   TWO COLUMNS, WRITTEN TOGETHER OR NOT AT ALL. `handle` and `username` are one fact in two columns
   — this file's own sentence, and `changeHandle` already writes both — so a generated pair is the
   same string in both, which is what makes `findPerson` resolve one person however they type it.
================================================================================================ */

/* ---------- A HANDLE IS THEIR FIRST NAME, AN UNDERSCORE, A WORD AND A NUMBER -------------------
   ASKED FOR AS *"remove the usernames. only handles. also handles are their first name then
   underscore then adjective then number."* So `halex_bright42`: lower case, the underscore where it
   was asked for and nowhere else, and a two-digit tail. The noun list that made `BrightOtter42` is
   gone with the old shape.

   THIS REVERSES A SAFEGUARDING ARGUMENT THIS FILE USED TO MAKE, AND SAYS SO. The old generator
   used words rather than the name because a handle built from a child's FULL name publishes it
   wherever the handle is shown. A FIRST name is what the owner asked for and is much less than a
   full name, and cards already draw it — but it is not nothing, and it is the owner's call.

   THE LENGTH IS ARITHMETIC. `HANDLE_SHAPE` allows twenty characters: the longest adjective is 6,
   the tail 2 and the underscore 1, so a first name is cut to `HANDLE_FIRST_MAX` = 11. And it must
   START with a letter, so leading digits come off; a name with no ASCII letters left (a name in
   another script) falls back to `HANDLE_FALLBACK`.

   THE FALLBACK IS ALSO WHERE A FIRST NAME THE BLOCKLIST REFUSES GOES. Every candidate built on it
   carries the refused word, so its forty tries all fail; the same forty are then tried on the
   fallback, which keeps the shape asked for with a neutral word where the name would be.

   `check-handles.js` PUTS EVERY ADJECTIVE THROUGH `handleTrouble_` with a range of first names,
   because the blocklist folds digits onto letters and drops the underscore, so a name and an
   adjective can meet across it — a fact about the list and the names together that nobody reading
   the list can check. */
const HANDLE_ADJ = ['bright', 'calm', 'clever', 'bold', 'brave', 'keen', 'swift', 'quiet',
                    'sunny', 'lucky', 'merry', 'neat', 'warm', 'wise', 'jolly', 'kind',
                    'royal', 'loyal', 'steady', 'tidy', 'golden', 'silver', 'copper', 'amber'];
const HANDLE_FIRST_MAX = 11;
const HANDLE_FALLBACK = 'friend';
/* HOW MANY TRIES BEFORE GIVING UP, per head (the name, then the fallback). 24 adjectives x 90 tails
   is 2,160 handles per first name, so forty consecutive clashes is a backstop against a
   `handleTrouble_` that has started refusing everything, not a real ceiling. It gives up rather than
   looping, and the caller reports it. */
const HANDLE_TRIES = 40;

/** The first-name half of a handle: lower-case ASCII letters and digits, starting with a letter,
    at most `HANDLE_FIRST_MAX` long. '' when nothing usable is left. */
function handleFirst_(first) {
  return String(first == null ? '' : first).toLowerCase()
    .replace(/[^a-z0-9]/g, '').replace(/^[0-9]+/, '').slice(0, HANDLE_FIRST_MAX);
}

/** Does `h` already have the generated shape for somebody called `first` — `<first>_<adj><NN>`,
    or the fallback where the name would be? `?run=renameHandles` leaves a row alone that does. */
function handleIsShaped_(h, first) {
  const heads = [handleFirst_(first), HANDLE_FALLBACK].filter(Boolean);
  const m = String(h == null ? '' : h).match(/^([a-z0-9]+)_([a-z]+)\d{2}$/);
  return !!m && heads.indexOf(m[1]) !== -1 && HANDLE_ADJ.indexOf(m[2]) !== -1;
}

/**
 * A handle nobody has, or '' if one could not be found.
 *
 * `me` is the row it is FOR, so that row's own cells are not counted as a clash — pass null for a
 * row that does not exist yet. `first` is the first name to build it from; left out, it is read off
 * `me`. Nothing is written here: the caller decides, because `register` writes it into a row it is
 * building and the repair jobs write it into one that exists.
 */
function handleMake_(me, first) {
  const name = handleFirst_(first !== undefined ? first : (me && me.first_name));
  const heads = name ? [name, HANDLE_FALLBACK] : [HANDLE_FALLBACK];
  for (let h = 0; h < heads.length; h++) {
    for (let i = 0; i < HANDLE_TRIES; i++) {
      const a = HANDLE_ADJ[Math.floor(Math.random() * HANDLE_ADJ.length)];
      /* TEN TO NINETY-NINE, so the tail is always two digits. A single digit would make `bold7`
         and `bold70` two handles one keystroke apart. */
      const want = heads[h] + '_' + a + String(10 + Math.floor(Math.random() * 90));
      if (!handleTrouble_(want, me || null, true)) return want;
    }
  }
  return '';
}

/* ==================================================================================================
   AND WHAT A TUTOR CHARGES MOVES ONCE A MONTH, ALL FOUR FIELDS TOGETHER.

   ASKED FOR AS *"only let tutors change thier rate, min number of kids and max number of kids willing
   to work with and fraction extra rate all together. and they can only change once a month."* None of
   the four is a preference: `priceFrom` builds the price from `rate_per_hour` and `extra_seat_rate`,
   `seatLimits` offers the seat count from `max_students` and `min_students`, and every booking already
   taken was priced and seated against whatever they said on the day.

   ONE CLOCK FOR THE FOUR, WHICH IS WHAT *"ALL TOGETHER"* MEANS. A stamp each would be four clocks and
   a tutor could walk round them a week at a time — raise the rate on Monday, the extra-seat fraction
   next Monday — which is the arms race the handle cooldown above was written against. `PRICING_FIELDS`
   in `constants.gs` is that list, and `PROFILE_GROUPS` builds the one page from the same constant, so
   the page and this rule cannot disagree about which fields are the quote.

   A FUNCTION BESIDE `handleRefusal` RATHER THAN SIX LINES INSIDE `updateProfile`, and that is about
   what can be CHECKED. `check-handles.js` cuts functions out of these files by name and runs them;
   a rule written inside a request handler is a rule nothing here can reach, and this repository's
   own sentence is that a check which cannot reach its subject is not a check. Same shape and same
   file as the handle rule — the row, what is wanted, and whether the asker is an admin — so the two
   read alike and neither has to be remembered separately.

   IT TAKES THE WHOLE `fields` OBJECT WHERE THE HANDLE RULE TAKES ONE VALUE, because the question is
   *has any of the four moved* and only the posted object can answer it.

   AND IT ANSWERS '' FOR A CHANGE THAT IS NOT ONE. That page posts all four every time it is saved,
   whether or not any was touched, so a rule firing on a field being PRESENT would refuse a save of
   the boxes beside it for a month over a number nobody edited. That is the fault this handler already
   paid for once, where a blank box was written back over every profile field on the first press of
   Save — and it is why `pricingMoved_` compares values rather than counting keys.
================================================================================================== */
function pricingMoved_(me, fields) {
  if (!me || !fields) return [];
  /* `N` ON BOTH SIDES, so `'4'` off a form and `4` off a sheet are the same answer. All four of these
     are numbers — two counts and two money figures — and a string compare would refuse every save. */
  return PRICING_FIELDS.filter(f => Object.prototype.hasOwnProperty.call(fields, f)
                                 && N(fields[f]) !== N(me[f]));
}

function pricingRefusal_(me, fields, isAdmin) {
  if (!me) return '';
  if (!pricingMoved_(me, fields).length) return '';   // nothing moved: not a change at all
  /* TWO SHAPES THE PRICE CANNOT USE, refused for an admin too. `seatShare_` reads the extra-seat
     figure as a SHARE of the rate and treats anything outside 0–2 as nothing, so `15` typed as
     pounds saved without complaint and charged nothing per seat. And a minimum above the maximum is
     a class nobody can book. Only when something moved, like the rule below. */
  const got = f => Object.prototype.hasOwnProperty.call(fields, f) ? fields[f] : me[f];
  const seat = S(got('extra_seat_rate'));
  if (seat !== '' && !(N(seat) >= 0 && N(seat) <= 2 && !isNaN(Number(seat)))) {
    return 'The extra-seat rate is a share of your hourly rate, from 0 to 2 — 0.5 means half your rate '
         + 'for each extra student. Nothing was saved.';
  }
  const lo = S(got('min_students')), hi = S(got('max_students'));
  if (lo !== '' && hi !== '' && N(lo) > N(hi)) {
    return 'The fewest students (' + lo + ') is more than the most (' + hi + '). Nothing was saved.';
  }
  /* AN ADMIN FIXING A TUTOR'S RATE OR CAP IS THE REMEDY RATHER THAN THE THING BEING BRAKED — the
     same exemption, for the same reason, as the handle cooldown above. */
  if (isAdmin) return '';
  /* ONE DATE AND NO COUNTER: the rule is "has a month passed", and a row that has never changed has
     no cell and is free. */
  const last = sheetDate(me.pricing_changed_at);
  if (!last) return '';
  const next = new Date(last.getTime() + PRICING_COOLDOWN_DAYS * 864e5);
  if (next <= new Date()) return '';
  /* WHAT IT SAYS IS THE GROUP, NOT THE FIELD THAT HAPPENED TO MOVE. Naming one of the four would
     read as an invitation to change the other three, which is exactly what one clock refuses. */
  return 'You changed what you charge and the class sizes you take on ' + fmtDate(last)
       + '. You can change them again on ' + fmtDate(next) + '. Nothing was saved.';
}


/** Every row that answers to this name — so a collision can be SEEN rather than silently resolved. */
function peopleNamed(name) {
  const want = key(name);
  if (!want) return [];
  return read(TAB.people).rows.filter(r =>
    key(r.person_id) === want ||
    key(S(r.first_name) + ' ' + S(r.last_name)) === want ||
    key(r.handle) === want);
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

/* FIRST AND LAST, AND NOTHING ELSE. `full_name` was the same fact typed a third time and the people
   tab's redesign dropped it — see `SCHEMA.people`. */
function personDisplayName(r) {
  return (S(r.first_name) + ' ' + S(r.last_name)).trim();
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